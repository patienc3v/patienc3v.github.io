// --- CONFIG & GLOBAL DATA ---
const CURRENT_SEASON = 20;
const MIN_SEASON = 16;
let seasonDataCache = {};
let selectedTeams = new Set();

const divisionOrder = ['Storm', 'Heroic', 'Nexus', 'A', 'AE', 'AW', 'B', 'BE', 'BNE', 'BSE', 'BW', 'C', 'CE', 'CW', 'D', 'DE', 'DNE', 'DSE', 'DW', 'E', 'EE', 'EW'];
const divOrder = ['Storm', 'Heroic', 'Nexus'];

const statCategories = {
    avgKDA: { title: 'K/D/A Ratio', type: 'numeric' },
    heroPool: { title: 'Hero Pool', type: 'numeric' },
    levelTime: {
        title: 'Time (s) to Reach Level',
        type: 'stacked',
        keys: ['levelTime4', 'levelTime7', 'levelTime10', 'levelTime13', 'levelTime16' ],
        labels: ['4', '7', '10', '13', '16'],
        colors: [
            'rgba(60, 99, 130, 0.8)',  // Dark Blue
            'rgba(217, 83, 79, 0.8)',  // Red
            'rgba(240, 173, 78, 0.8)', // Orange
            'rgba(92, 184, 92, 0.8)',  // Green
            'rgba(91, 192, 222, 0.8)', // Light Blue
            'rgba(155, 89, 182, 0.8)', // Purple
            'rgba(149, 165, 166, 0.8)' // Grey
        ]
    },
    HDM: { title: 'Hero Damage per Minute', type: 'numeric' },
    HLDM: { title: 'Healing per Minute', type: 'numeric' },
    SDM: { title: 'Siege Damage per Minute', type: 'numeric' },

    TFHD: { title: 'Team Fight Hero Damage', type: 'numeric' },
    TFHL: { title: 'Team Fight Healing', type: 'numeric' },
    TFDT: { title: 'Team Fight Damage Taken', type: 'numeric' },

    ccTime: { title: 'Total CC Time', type: 'time' },

    ccBreakdown: {
        title: 'CC Time (s) Breakdown',
        type: 'stacked',
        keys: ['stunTime', 'silenceTime', 'rootTime'],
        labels: ['Stun', 'Silence', 'Root'],
        colors: [
            'rgba(60, 99, 130, 0.8)',  // Dark Blue
            'rgba(217, 83, 79, 0.8)',  // Red
            'rgba(240, 173, 78, 0.8)', // Orange
            'rgba(92, 184, 92, 0.8)',  // Green
            'rgba(91, 192, 222, 0.8)', // Light Blue
            'rgba(155, 89, 182, 0.8)', // Purple
            'rgba(149, 165, 166, 0.8)' // Grey
        ]
    },

    xpBreakdown: {
        title: 'XP Breakdown',
        type: 'stacked',
        keys: ['minionXP', 'creepXP', 'structureXP', 'heroXP', 'trickleXP'],
        labels: ['Minion', 'Creep', 'Structure', 'Hero', 'Trickle'],
        colors: [
            'rgba(60, 99, 130, 0.8)',  // Dark Blue
            'rgba(217, 83, 79, 0.8)',  // Red
            'rgba(240, 173, 78, 0.8)', // Orange
            'rgba(92, 184, 92, 0.8)',  // Green
            'rgba(91, 192, 222, 0.8)', // Light Blue
            'rgba(155, 89, 182, 0.8)', // Purple
            'rgba(149, 165, 166, 0.8)' // Grey
        ]
    },


    minionXPperc: { title: '% of Max Minion XP Gained', type: 'numerical' },

    timeSpentDead: { title: 'Time Spent Dead', type: 'time' },
    matchLength: { title: 'Match Length', type: 'time' },
};

// --- DOM ELEMENTS ---
const seasonSelect = document.getElementById('season-select');
const divisionSelect = document.getElementById('division-select');
const statsContainer = document.getElementById('stats-container');
const timestampSpan = document.getElementById('update-timestamp');
const teamFilterContainer = document.getElementById('team-filter-container'); 
let charts = {};

// --- DATA LOADING (No changes in this section) ---
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(header => header.trim());
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length !== headers.length) continue;
        const entry = {};
        for (let j = 0; j < headers.length; j++) {
            const value = values[j].trim();
            entry[headers[j]] = !isNaN(value) && value !== '' ? Number(value) : value;
        }
        entry['minionXPperc'] = 100.0 * entry['minionXP'] / entry['maxMinionXP'];

        data.push(entry);
    }
    return data;
}
async function fetchSeasonData(seasonNumber) {
    const fileName = `data/season${seasonNumber}team.csv`;
    try {
        const response = await fetch(fileName);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const lastModified = response.headers.get('Last-Modified');
        const csvText = await response.text();
        const data = parseCSV(csvText);
        return { data, lastModified };
    } catch (error) {
        console.warn(`Could not load or parse data for Season ${seasonNumber}.`);
        return { data: [], lastModified: null };
    }
}
async function loadSeason(seasonNumber) {
    if (seasonDataCache[seasonNumber]) return;
    seasonDataCache[seasonNumber] = await fetchSeasonData(seasonNumber);
}


// --- UI & CHART FUNCTIONS ---
function populateSeasonSelector() {
    for (let i = CURRENT_SEASON; i >= MIN_SEASON; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Season ${i}`;
        seasonSelect.appendChild(option);
    }
}

function updateTeamFilter() {
    const selectedSeason = parseInt(seasonSelect.value);
    const selectedDivision = divisionSelect.value;
    const seasonData = seasonDataCache[selectedSeason]?.data || [];

    // Find all unique teams for the current view and sort them alphabetically
    const availableTeams = [...new Set(
        seasonData
            .filter(d => d.division === selectedDivision)
            .map(d => d.team)
    )].sort((a, b) => a.localeCompare(b)); // MODIFIED: Added alphabetical sort

    // By default, select all available teams
    selectedTeams.clear();
    availableTeams.forEach(team => selectedTeams.add(team));

    // Render the buttons
    teamFilterContainer.innerHTML = '';
    availableTeams.forEach(team => {
        const button = document.createElement('div');
        button.className = 'team-toggle-button selected';
        button.textContent = team;
        button.dataset.teamName = team;
        teamFilterContainer.appendChild(button);
    });
}

function updateDivisionSelector() {
    const selectedSeason = parseInt(seasonSelect.value);
    const seasonData = seasonDataCache[selectedSeason]?.data || [];
    
    const divisionsForSeason = [...new Set(seasonData.map(s => s.division))];
    
    // Apply the custom sort order
    divisionsForSeason.sort((a, b) => {
        const indexA = divisionOrder.indexOf(a);
        const indexB = divisionOrder.indexOf(b);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB; // Both are in the custom order
        if (indexA !== -1) return -1; // Only A is in the custom order
        if (indexB !== -1) return 1;  // Only B is in the custom order
        return a.localeCompare(b); // Neither are in the order, sort alphabetically
    });
    
    const currentDivision = divisionSelect.value;
    divisionSelect.innerHTML = '';
    
    divisionsForSeason.forEach(division => {
        const option = document.createElement('option');
        option.textContent = divOrder.includes(division) ? division + " Division" : "Division " + division;
        option.value = division;
        divisionSelect.appendChild(option);
    });

    if (divisionsForSeason.includes(currentDivision)) {
        divisionSelect.value = currentDivision;
    }
}

function updateCharts() {
    const selectedSeason = parseInt(seasonSelect.value);
    const selectedDivision = divisionSelect.value;
    
    const seasonInfo = seasonDataCache[selectedSeason];
    if (seasonInfo?.lastModified) {
        const date = new Date(seasonInfo.lastModified);
        timestampSpan.textContent = date.toLocaleString();
    } else {
        timestampSpan.textContent = "N/A";
    }

    const seasonData = seasonInfo?.data || [];

    // **MODIFIED**: Filter data based on the selectedTeams set
    const filteredData = seasonData
        .filter(d => d.division === selectedDivision && selectedTeams.has(d.team))
        .sort((a, b) => a.team.localeCompare(b.team));

    const labels = filteredData.map(d => d.team);

    Object.keys(statCategories).forEach(key => {
        const category = statCategories[key];
        const chart = charts[key];
        
        if (chart) {
            chart.data.labels = labels;
            if (category.type === 'stacked') {
                category.keys.forEach((stackKey, index) => {
                    chart.data.datasets[index].data = filteredData.map(d => d[stackKey] || 0);
                });
            } else {
                chart.data.datasets[0].data = filteredData.map(d => d[key]);
            }
            chart.update();
        }
    });
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function createCharts() {
    statsContainer.innerHTML = '';
    charts = {};
    Object.keys(statCategories).forEach(key => {
        const category = statCategories[key];
        const tile = document.createElement('div');
        tile.className = 'stat-tile';
        tile.dataset.chartKey = key;

        const title = document.createElement('h2');
        title.className = 'collapsible-header';
        title.textContent = category.title;
        
        const chartContent = document.createElement('div');
        chartContent.classList.add('chart-content');
        
        const canvas = document.createElement('canvas');
        
        chartContent.appendChild(canvas);
        tile.appendChild(title);
        tile.appendChild(chartContent);
        statsContainer.appendChild(tile);

        const config = {
            type: 'bar',
            data: { labels: [], datasets: [] },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: category.type === 'stacked', labels: { color: '#ffffff' }},
                    tooltip: { callbacks: {}, bodyColor: '#ffffff', titleColor: '#ffffff', backgroundColor: '#1a1a2e' }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.15)' }, ticks: { color: '#ffffff' }},
                    x: { grid: { display: false }, ticks: { color: '#ffffff' }}
                }
            }
        };

        if (category.type === 'stacked') {
            config.data.datasets = category.keys.map((stackKey, index) => ({
                label: category.labels[index],
                data: [],
                backgroundColor: category.colors[index],
            }));
            config.options.scales.x.stacked = true;
            config.options.scales.y.stacked = true;
        } else {
            config.data.datasets = [{ label: category.title, data: [], backgroundColor: 'rgba(242, 105, 46, 0.7)', borderColor: 'rgba(242, 105, 46, 1)', borderWidth: 1 }];
        }

        if (category.type === 'time') {
            config.options.scales.y.ticks.callback = value => formatTime(value);
            config.options.plugins.tooltip.callbacks.label = context => formatTime(context.raw);
        }
        charts[key] = new Chart(canvas, config);
    });
}

// --- INITIALIZATION ---
async function init() {
    await loadSeason(CURRENT_SEASON);
    
    populateSeasonSelector();
    updateDivisionSelector();
    createCharts();

    // Initial UI setup
    updateTeamFilter();
    updateCharts();

    // --- EVENT LISTENERS ---

    // Handles toggling a team's selection state
    teamFilterContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('team-toggle-button')) {
            const teamName = target.dataset.teamName;
            if (selectedTeams.has(teamName)) {
                selectedTeams.delete(teamName);
                target.classList.remove('selected');
                target.classList.add('deselected');
            } else {
                selectedTeams.add(teamName);
                target.classList.remove('deselected');
                target.classList.add('selected');
            }
            updateCharts(); // Redraw charts with the new selection
        }
    });

    seasonSelect.addEventListener('change', async () => {
        const selectedSeason = parseInt(seasonSelect.value);
        await loadSeason(selectedSeason);
        updateDivisionSelector();
        updateTeamFilter(); // Reset teams when season changes
        updateCharts();
    });

    divisionSelect.addEventListener('change', () => {
        updateTeamFilter(); // Reset teams when division changes
        updateCharts();
    });

    // Mobile collapsible listener remains the same
    statsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('collapsible-header') && window.matchMedia('(max-width: 768px)').matches) {
            const tile = event.target.closest('.stat-tile');
            if (tile) {
                tile.classList.toggle('active');
                if (tile.classList.contains('active')) {
                    const chartKey = tile.dataset.chartKey;
                    const chart = charts[chartKey];
                    if (chart) {
                        setTimeout(() => {
                            chart.resize();
                        }, 500);
                    }
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
