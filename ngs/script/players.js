// --- 1. CONFIGURATION ---
const CURRENT_SEASON = 20;
const MIN_SEASON = 6;

const DIVISION_ORDER = ['Storm', 'Heroic', 'Nexus', 'A', 'AE', 'AW', 'B', 'BE', 'BNE', 'BSE', 'BW', 'C', 'CE', 'CW', 'D', 'DE', 'DNE', 'DSE', 'DW', 'E', 'EE', 'EW'];

const statCategories = [
    { key: 'KDA', name: 'K/D/A Ratio', sort: 'desc', format: 'float' },
    { key: 'Takedowns', sort: 'desc', format: 'float' },
    { key: 'Kill Participation', name: 'Kill Participation (%)', alt: 'KP', sort: 'desc', format: 'percentage' },
    { key: 'Hero Damage', alt: 'HD', sort: 'desc', format: 'float' },
    { key: 'DPM', name: 'Damage per Minute (DPM)', sort: 'desc', format: 'float' },
    { key: 'Damage Taken', alt: 'DT', sort: 'desc', format: 'float' },
    { key: 'Healing', sort: 'desc', format: 'float' },
    { key: 'HPM', name: 'Healing per Minute (HPM)', sort: 'desc', format: 'float' },
    { key: 'Siege Damage', alt: 'SD', sort: 'desc', format: 'float' },
    { key: 'Team Fight Hero Damage', alt: ' TFHD', sort: 'desc', format: 'float' },
    { key: 'Team Fight Healing', alt: 'TFH', sort: 'desc', format: 'float' },
    { key: 'Team Fight Damage Taken', alt: 'TFDT', sort: 'desc', format: 'float' },
    { key: 'XP Contribution', alt: 'XP', sort: 'desc', format: 'float' },
    { key: 'XPM', name: 'XP per Minute (XPM)', sort: 'desc', format: 'float' },
    { key: 'CC Time', sort: 'desc', format: 'time' },
    { key: 'Root Time', sort: 'desc', format: 'time' },
    { key: 'Silence Time', sort: 'desc', format: 'time' },
    { key: 'Stun Time', sort: 'desc', format: 'time' },
    { key: 'Time Dead', sort: 'asc', format: 'time' },
    { key: 'Time Dead %', name: 'Time Dead (%)', sort: 'asc', format: 'percentage' },
];

// --- 2. DOM REFERENCES & STATE MANAGEMENT ---
const dom = {
    seasonSelect: document.getElementById('season-select'),
    divisionToggles: document.getElementById('division-toggles'),
    playerCountSlider: document.getElementById('player-count'),
    playerCountValue: document.getElementById('player-count-value'),
    minGamesSlider: document.getElementById('min-games'),
    minGamesValue: document.getElementById('min-games-value'),
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    resetBtn: document.getElementById('reset-btn'),
    statsGrid: document.getElementById('stats-grid'),
    suggestionsBox: document.getElementById('suggestions-box'),
    searchWrapper: document.querySelector('.search-wrapper'),
    lastUpdate: document.getElementById('update-timestamp'),
    copyright: document.getElementById('copyright')
};

let filters = {
    season: CURRENT_SEASON,
    divisions: [],
    playerCount: 10,
    minGP: 1,
    searchTerms: []
};

// --- 3. DATA HANDLING (FETCH, PARSE, CACHE) ---
const dataCache = {};
let allPlayerNames = [];

async function fetchAndParseCSV(season) {
    const filename = `data/season${season}.csv`;
    try {
        const response = await fetch(filename);
        if (!response.ok) throw new Error(`Could not load data for Season ${season}. File not found.`);
        
        const csvText = await response.text();
        const lines = csvText.trim().split('\n');
        const header = lines[1].split(',').map(h => h.trim());

        dom.lastUpdate.innerHTML = `${lines[0].trim()}`;
        
        return lines.slice(2).map(line => {
            const values = line.split(',');
            const playerObject = {};
            header.forEach((key, index) => {
                const value = values[index].trim().replace(/"/g, '');
                if (key === "name") {
                    const nameValue = value.split('#');
                    const playerName = nameValue[0];
                    const playerID = nameValue[1];
                    playerObject[key] = playerName;
                    playerObject["link1"] = `https://heroesprofile.com/Player/${playerName}/${playerID}/1`;
                    playerObject["link2"] = `https://heroesprofile.com/Esports/NGS/Player/${playerName}/${playerID}?season=${season}`;
                } else {
                    playerObject[key] = isNaN(Number(value)) || value === '' ? value : Number(value);
                }
            });
            playerObject.season = season;
            return playerObject;
        });
    } catch (error) {
        console.error(error);
        dom.statsGrid.innerHTML = `<p style="color: var(--ngs-orange); text-align: center;">${error.message}</p>`;
        return [];
    }
}

async function getSeasonData(season) {
    if (dataCache[season]) return dataCache[season];
    const data = await fetchAndParseCSV(season);
    dataCache[season] = data;
    return data;
}

// --- 4. RENDER FUNCTIONS & HELPERS ---

function formatStatValue(value, format) {
    if (value === undefined || value === null) return 'N/A';
    switch (format) {
        case 'float':
            return Number(value).toFixed(2);
        case 'percentage':
            return `${(Number(value) * 100).toFixed(2)}%`;
        case 'time':
            const minutes = Math.floor(value / 60);
            const seconds = Math.round(value % 60);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        default:
            return value;
    }
}

function getDivisionsForSeason(seasonData) {
    const uniqueDivisions = [...new Set(seasonData.map(p => p.division))];
    uniqueDivisions.sort((a, b) => {
        const indexA = DIVISION_ORDER.indexOf(a);
        const indexB = DIVISION_ORDER.indexOf(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });
    return uniqueDivisions;
}

function renderStatTiles(seasonData) {
    const showDivisionIndicator = filters.divisions.length > 1;
    const isSearchActive = filters.searchTerms.length > 0;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    const baseFilteredData = seasonData.filter(player =>
        filters.divisions.includes(player.division) && player.nGames >= filters.minGP
    );

    dom.statsGrid.innerHTML = '';
    statCategories.forEach(cat => {
        const rankedAllPlayers = [...baseFilteredData]
            .sort((a, b) => {
                const valA = a[cat.key] || 0;
                const valB = b[cat.key] || 0;
                return cat.sort === 'desc' ? valB - valA : valA - valB;
            })
            .map((player, index) => ({ ...player, rank: index + 1 }));

        let playersToDisplay;
        if (isSearchActive) {
            playersToDisplay = rankedAllPlayers.filter(player =>
                filters.searchTerms.some(term => player.name.toLowerCase().includes(term))
            );
        } else {
            playersToDisplay = rankedAllPlayers.slice(0, filters.playerCount);
        }

        const tile = document.createElement('div');
        tile.className = 'stat-tile';
        // Add collapsed class by default on mobile
        if (isMobile) {
            tile.classList.add('collapsed');
        }

        const tableRowsHTML = playersToDisplay.map(player => {
            const divisionIndicatorHTML = showDivisionIndicator ? `<span class="division-indicator">${player.division}</span>` : '';
            const statValue = formatStatValue(player[cat.key], cat.format);

            return `
                <tr>
                    <td class="rank">${player.rank}</td>
                    <td><div class="player-cell"><span>${player.name}</span>${divisionIndicatorHTML}</div></td>
                    <td class="stat-value">${statValue}</td>
                    <td class="gp-cell">${player.nGames}</td>
                    <td class="links-cell">
                        <a href="${player.link1}" target="_blank" rel="noopener noreferrer" title="View Player Profile"><img src="images/hots.png" alt="${player.name} HeroesProfile Profile"></a>
                        <a href="${player.link2}" target="_blank" rel="noopener noreferrer" title="View Match History"><img src="images/ngs.png" alt="${player.name} NGS HeroesProfile Profile"></a>
                    </td>
                </tr>
            `;
        }).join('');
        
        const catName = cat.name || cat.key;
        const catColumn = cat.alt || cat.key;
        const tableId = `tile-table-${cat.key}`;
        tile.innerHTML = `
            <h3>
                <button class="tile-toggle-btn" aria-expanded="${!isMobile}" aria-controls="${tableId}">
                    <span>${catName}</span>
                    <span>${cat.sort === 'desc' ? '↓' : '↑'}</span>
                </button>
            </h3>
            <table id="${tableId}">
                <thead><tr><th class="rank">#</th><th>Player</th><th>${catColumn}</th><th>GP</th><th>Links</th></tr></thead>
                <tbody>${tableRowsHTML || `<tr><td colspan="5" style="text-align:center; padding: 20px;">${isSearchActive ? 'No searched players match criteria.' : 'No players match criteria.'}</td></tr>`}</tbody>
            </table>`;
        dom.statsGrid.appendChild(tile);
    });
}

function renderDivisionToggles(divisionsForSeason) {
    dom.divisionToggles.innerHTML = '';
    divisionsForSeason.forEach(divisionName => {
        const toggle = document.createElement('div');
        toggle.className = 'division-toggle';
        toggle.textContent = divisionName;
        toggle.dataset.division = divisionName;
        if (filters.divisions.includes(divisionName)) {
            toggle.classList.add('selected');
            toggle.classList.remove('deselected');
        } else {
            toggle.classList.add('deselected');
            toggle.classList.remove('selected');
        }
        dom.divisionToggles.appendChild(toggle);
    });
}

// --- 5. CORE LOGIC & EVENT HANDLERS ---
async function loadSeason(season) {
    dom.statsGrid.innerHTML = '<p style="text-align: center;">Loading data...</p>';
    filters.season = season;
    const seasonData = await getSeasonData(season);
    if (!seasonData || !seasonData.length) return;

    allPlayerNames = [...new Set(seasonData.map(p => p.name))];
    const divisionsForSeason = getDivisionsForSeason(seasonData);
    const savedDivisions = JSON.parse(localStorage.getItem(`divisions_${season}`));
    filters.divisions = savedDivisions !== null ? savedDivisions : [...divisionsForSeason];
    
    renderDivisionToggles(divisionsForSeason);
    renderStatTiles(seasonData);
}

function handleDivisionClick(event) {
    const toggle = event.target.closest('.division-toggle');
    if (!toggle) return;
    const divisionName = toggle.dataset.division;
    const index = filters.divisions.indexOf(divisionName);
    (index > -1) ? filters.divisions.splice(index, 1) : filters.divisions.push(divisionName);
    toggle.classList.toggle('selected');
    toggle.classList.toggle('deselected');
    localStorage.setItem(`divisions_${filters.season}`, JSON.stringify(filters.divisions));
    renderStatTiles(dataCache[filters.season]);
}

function handleFilterChange() {
    filters.playerCount = parseInt(dom.playerCountSlider.value);
    filters.minGP = parseInt(dom.minGamesSlider.value);
    dom.playerCountValue.textContent = filters.playerCount;
    dom.minGamesValue.textContent = filters.minGP;
    renderStatTiles(dataCache[filters.season]);
}

function handleSearch() {
    dom.suggestionsBox.innerHTML = '';
    const query = dom.searchInput.value.trim().toLowerCase();
    filters.searchTerms = query ? query.split(',').map(term => term.trim()).filter(Boolean) : [];
    renderStatTiles(dataCache[filters.season]);
}

function handleTileToggle(event) {
    const toggleBtn = event.target.closest('.tile-toggle-btn');
    if (!toggleBtn || !window.matchMedia('(max-width: 768px)').matches) {
        return; // Only run on mobile, and only on the button
    }
    const tile = toggleBtn.closest('.stat-tile');
    const isCollapsed = tile.classList.toggle('collapsed');
    toggleBtn.setAttribute('aria-expanded', !isCollapsed);
}

// --- Autocomplete Handlers ---
function handleSearchInput(event) {
    const value = event.target.value;
    const searchParts = value.split(',');
    const currentPart = searchParts[searchParts.length - 1].trim().toLowerCase();
    if (currentPart.length === 0) { dom.suggestionsBox.innerHTML = ''; return; }
    const matches = allPlayerNames.filter(name => name.toLowerCase().includes(currentPart));
    dom.suggestionsBox.innerHTML = '';
    matches.forEach(name => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = name;
        item.addEventListener('click', () => handleSuggestionClick(name));
        dom.suggestionsBox.appendChild(item);
    });
}

function handleSuggestionClick(name) {
    const searchParts = dom.searchInput.value.split(',');
    searchParts[searchParts.length - 1] = name; 
    dom.searchInput.value = searchParts.join(', ').trim() + ", "; 
    
    handleSearch(); // This immediately updates the highlight
    
    dom.searchInput.focus();
    // Set cursor to the end of the input
    dom.searchInput.selectionStart = dom.searchInput.selectionEnd = dom.searchInput.value.length;
}


// --- 6. INITIALIZATION ---
function populateSeasonSelector() {
    for (let seasonNum = CURRENT_SEASON; seasonNum >= MIN_SEASON; seasonNum--) {
        const option = document.createElement('option');
        option.value = seasonNum;
        option.textContent = `Season ${seasonNum}`;
        if (seasonNum === CURRENT_SEASON) option.selected = true;
        dom.seasonSelect.appendChild(option);
    }
}

async function init() {
    populateSeasonSelector();
    filters.playerCount = parseInt(dom.playerCountSlider.value);
    filters.minGP = parseInt(dom.minGamesSlider.value);
    
    // Add Event Listeners
    dom.seasonSelect.addEventListener('change', (e) => loadSeason(parseInt(e.target.value)));
    dom.divisionToggles.addEventListener('click', handleDivisionClick);
    dom.playerCountSlider.addEventListener('input', handleFilterChange);
    dom.minGamesSlider.addEventListener('input', handleFilterChange);
    dom.searchBtn.addEventListener('click', handleSearch);
    dom.resetBtn.addEventListener('click', () => {
        dom.searchInput.value = '';
        handleSearch();
    });
    dom.searchInput.addEventListener('keyup', e => e.key === 'Enter' && handleSearch());
    dom.searchInput.addEventListener('input', handleSearchInput);
    document.addEventListener('click', (e) => {
        if (!dom.searchWrapper.contains(e.target)) dom.suggestionsBox.innerHTML = '';
    });
    dom.statsGrid.addEventListener('click', handleTileToggle); // New listener for collapsing tiles
    
    const currentYear = new Date().getFullYear();
    dom.copyright.innerHTML = `Copyright © ${currentYear} Patienc3. All Rights Reserved.`;

    // Initial Load
    await loadSeason(CURRENT_SEASON);
}

init();
