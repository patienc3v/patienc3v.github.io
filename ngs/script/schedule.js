document.addEventListener('DOMContentLoaded', () => {
    const season = 20;
    const divisions = ['heroic', 'nexus', 'a', 'b-east', 'b-west', 'c', 'd', 'd-west'];
    const divOrder = ['Heroic', 'Nexus'];
    let divisionLookup = {};

    // --- DOM Elements ---
    const body = document.body;
    const scheduleContainer = document.getElementById('schedule-container');
    const teamsListContainer = document.getElementById('teams-list-container');
    const toggleBtn = document.getElementById('toggle-sidebar-btn');
    const loadingContainer = document.getElementById('loading-container');

    // --- API & Data ---
    // Replace these with your actual API endpoints
    const TEAMS_API_URL = 'https://nexusgamingseries.net/api/team/get/registered';
    const MATCHES_API_URL = 'https://www.nexusgamingseries.org/api/schedule/get/matches/scheduled?season=' + season;
    const FAVORITES_KEY = 'ngs_favorite_teams';

    let allDivisions = [];
    let allMatches = [];
    let favoriteTeams = new Set();
    let teamLogoMap = new Map();
    let divisionNameMap = new Map();

    // --- Initialization ---
    function init() {
        loadFavorites();
        setupEventListeners();
        fetchData();
    }

    function setupEventListeners() {
        teamsListContainer.addEventListener('click', handleFavoriteClick);

        // Single toggle button for all sidebar functionality
        toggleBtn.addEventListener('click', () => {
            body.classList.toggle('sidebar-is-open');
        });
    }

    // --- Data Fetching & Loading ---
    async function fetchData() {
        loadingContainer.classList.add('active'); // Show progress bar

        try {
            // Fetch both sets of data concurrently from the APIs
            const [teamsResponse, matchesResponse] = await Promise.all([
                fetch(TEAMS_API_URL),
                fetch(MATCHES_API_URL)
            ]);

            if (!teamsResponse.ok || !matchesResponse.ok) {
                throw new Error('Error while retrieving the NGS data.');
            }

            // process the NGS data
            const teamsData = await teamsResponse.json();
            const matchesData = await matchesResponse.json();

            allDivisions = await processTeams(teamsData["returnObject"]);
            allMatches = await processMatches(matchesData["returnObject"]);

            buildDataMaps();
            renderFavoritesList();
            renderFilteredMatches();

        } catch (error) {
            console.error('Failed to fetch data:', error);
            scheduleContainer.innerHTML = `<div class="no-matches">Error loading schedule. Please try again later.</div>`;
        } finally {
            loadingContainer.classList.remove('active'); // Hide progress bar
        }
    }

    function processTeams(teamsData) {
        let jsonData = [];
        for (let index = 0; index < divisions.length; index++) {
            jsonData.push({"id": (index + 1), "apiName": divisions[index], "name": null, "teams":[]});
            divisionLookup[divisions[index]] = index + 1;
        }
        teamsData.forEach((team) => {
            const teamName = team["teamName"];
            const division= team["divisionConcat"];
            const divisionName = team["divisionDisplayName"];
            const logo = team["logo"] || "defaultTeamLogo.png";
            
            jsonData[divisionLookup[division] - 1]["name"] = divisionName;
            jsonData[divisionLookup[division] - 1]["teams"].push({
                "name": teamName,
                "logoUrl": encodeURI("https://s3.amazonaws.com/ngs-image-storage/" + logo)
            })
        });
        jsonData.forEach((division) => {
            division["teams"].sort((a, b) => {
                return a["name"] > b["name"];
            });
            console.log(division);
        });
        return jsonData;
    }

    function processMatches(matchesData) {
        let jsonData = [];
        let matchID = 101;
        matchesData.forEach((match) => {
            const division = match["divisionConcat"];
            const homeTeam = match["home"]["teamName"];
            const awayTeam = match["away"]["teamName"];
            const matchTime = new Date(parseInt(match["scheduledTime"]["startTime"])).toISOString();
            const casterUrl = match["casterUrl"];
            jsonData.push({
                "id": matchID,
                "divisionId": divisionLookup[division],
                "team1": homeTeam,
                "team2": awayTeam,
                "time": matchTime,
                "twitchUrl": casterUrl,
                "youtueUrl": null
            })
            matchID++;
        });
        console.log(jsonData);
        return jsonData;
    }
    
    function buildDataMaps() {
        allDivisions.forEach(division => {
            divisionNameMap.set(division.id, division.name);
            division.teams.forEach(team => teamLogoMap.set(team.name, team.logoUrl));
        });
    }

    // --- Favorites Management ---
    function loadFavorites() {
        const savedFavorites = localStorage.getItem(FAVORITES_KEY);
        if (savedFavorites) {
            favoriteTeams = new Set(JSON.parse(savedFavorites));
        }
    }

    function saveFavorites() {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favoriteTeams]));
    }

   function handleFavoriteClick(event) {
        // Find the team item that was clicked on
        const teamItem = event.target.closest('.team-favorite-item');
        if (!teamItem) return; // Exit if the click was not on a team item

        const teamName = teamItem.dataset.teamName;
        
        // Toggle the favorite state in the Set and the UI class
        if (favoriteTeams.has(teamName)) {
            favoriteTeams.delete(teamName);
            teamItem.classList.remove('active');
        } else {
            favoriteTeams.add(teamName);
            teamItem.classList.add('active');
        }
        
        saveFavorites();
        renderFilteredMatches();
    }

    // --- Rendering Logic ---
    function renderFavoritesList() {
        let content = '';
        allDivisions.forEach(division => {
            content += `
                <div class="division-select">
                    <details closed>
                        <summary>${division.name}</summary>
                        <div class="teams-list">
                            ${division.teams.map(team => `
                                <div 
                                    class="team-favorite-item ${favoriteTeams.has(team.name) ? 'active' : ''}" 
                                    data-team-name="${team.name}"
                                >
                                    ${team.name}
                                </div>
                            `).join('')}
                        </div>
                    </details>
                </div>
            `;
        });
        teamsListContainer.innerHTML = content;
    }
    
    function renderFilteredMatches() {
        // Clear everything except the loading container
        while (scheduleContainer.firstChild && scheduleContainer.firstChild !== loadingContainer) {
            scheduleContainer.removeChild(scheduleContainer.lastChild);
        }
        console.log(scheduleContainer.childNodes.length);
        if (favoriteTeams.size === 0) {
            scheduleContainer.insertAdjacentHTML('beforeend', `<div class="no-matches">Select your favorite teams to see their schedule!</div>`);
            return;
        }

        const filteredMatches = allMatches.filter(match =>
            favoriteTeams.has(match.team1) || favoriteTeams.has(match.team2)
        );

        if (filteredMatches.length === 0) {
            scheduleContainer.insertAdjacentHTML('beforeend', `<div class="no-matches">No matches found for your selected teams.</div>`);
            return;
        }

        console.log(filteredMatches);

        const now = new Date();
        const upcomingMatches = filteredMatches
            .filter(match => new Date(match.time) > now)
            .sort((a, b) => new Date(a.time) - new Date(b.time));

        const pastMatches = filteredMatches
            .filter(match => new Date(match.time) <= now)
            .sort((a, b) => new Date(b.time) - new Date(a.time));

        if (upcomingMatches.length > 0) {
            scheduleContainer.appendChild(createMatchSection('Upcoming Matches', upcomingMatches));
        }
        if (pastMatches.length > 0) {
            scheduleContainer.appendChild(createMatchSection('Past Matches', pastMatches));
        }
    }

    function createMatchSection(title, matches) {
        const sectionElement = document.createElement('section');
        sectionElement.className = 'division';
        
        let sectionHTML = `<h2 class="division-title">${title}</h2>`;

        matches.forEach(match => {
            const team1Logo = teamLogoMap.get(match.team1) || '';
            const team2Logo = teamLogoMap.get(match.team2) || '';
            const matchTime = new Date(match.time).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
            let divisionName = divisionNameMap.get(match.divisionId);
            divisionName = divOrder.includes(divisionName) ? divisionName + " Division" : "Division " + divisionName;

            let linksHTML = '';
            if (match.twitchUrl) {
                const twitchUser = match.twitchUrl.split('/').pop() || 'Twitch';
                linksHTML = `<a href="${match.twitchUrl}" target="_blank" class="twitch-link">${twitchUser}</a>`;
            }
            if (match.youtubeUrl) linksHTML += `<a href="${match.youtubeUrl}" target="_blank" class="youtube-link">${twitchUser}</a>`;

            sectionHTML += `
                <article class="match">
                    <div class="match-division">${divisionName}</div>
                    <div class="team-info">
                        <img src="${team1Logo}" alt="${match.team1} Logo" class="team-logo">
                        <span class="team-name">${match.team1}</span>
                    </div>
                    <span class="vs">VS</span>
                    <div class="team-info right">
                        <span class="team-name">${match.team2}</span>
                        <img src="${team2Logo}" alt="${match.team2} Logo" class="team-logo">
                    </div>
                    <div class="match-details">
                        <div class="match-time">${matchTime}</div>
                        <div class="stream-links">${linksHTML}</div>
                    </div>
                </article>
            `;
        });

        sectionElement.innerHTML = sectionHTML;
        return sectionElement;
    }

    // --- Start the App ---
    init();
});

