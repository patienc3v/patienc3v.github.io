var xhr = new XMLHttpRequest();

var stats = {};
var playerStats = {};
var teamStats = {};

var description = {
		"NumGames": "Games Played",
		"TeamKDA": "Team KDA",
		"AvgKDA": "Avg. Player KDA",
		"XPM": "XP per Min",
		"NumHeroes": "Heroes Played",
		"AvgTimeDead": "Time Spent Dead",
		"AvgHeroDamage": "Hero Damage",
		"AvgHealing": "Healing",
		"AvgTimeCCdEnemyHeroes": "CC Time",
		"AvgTimeRootingEnemyHeroes": "Root Time",
		"AvgTimeSilencingEnemyHeroes": "Silence Time",
		"AvgTimeStunningEnemyHeroes": "Stun Time",
		"numGames": "# of Games",
		"KillParticipation": "Kill Participation",
		"HeroDamage": "Hero Damage",
		"DPM": "Hero Damage/Minute",
		"DamageTaken": "Damage Taken",
		"HPM": "Healing/Minute",
		
		"TeamfightHeroDamage": "Teamfight Hero Damage",
		"TeamfightHealingDone": "Teamfight Healing",
		"TeamfightDamageTaken": "Teamfight Damage Taken",
		"ExperienceContribution": "XP Contribution",
		"TimeCCdEnemyHeroes": "Avg. CC Time",
		"TimeRootingEnemyHeroes": "Avg. Root Time",
		"TimeSilencingEnemyHeroes": "Avg. Silence Time",
		"TimeStunningEnemyHeroes": "Avg. Stun Time",
		"TimeSpentDead": "Time Spent Dead",
		"TimeSpentDeadPct": "Time Spend Dead (%)"

};

var floats = [
		"TeamKDA",
		"AvgKDA",
		"KDA",
		"HeroDamage",
		"Healing",
		"DamageTaken",
		"DPM",
		"HPM",
		"SiegeDamage",
		"TeamfightHeroDamage",
		"TeamfightHealingDone",
		"TeamfightDamageTaken",
		"ExperienceContribution",
		"XPM",
		"AvgHeroDamage",
		"AvgHealing"
]

var percents = [
	"KillParticipation",
	"TimeSpentDeadPct"
]
//		"AvgPctDead": "Avg. Time Dead (%)",

function convertTime(time) {
//	var roundedTime = Math.round(time);
	
	var minutes = Math.floor(time / 60);
	var seconds = time % 60;
	
	if (seconds < 10) {
		seconds = "0" + seconds.toFixed(2);
	} else {
		seconds = seconds.toFixed(2);
	}
	return minutes + ":" + seconds;
}


function loadPlayer(name) {
	var details = playerStats[name];
	
	var playerElement = document.createElement("div");
	playerElement.classList.add("stat");
//	playerElement.style.width = "calc(" + (100 / Object.keys(playerStats).length) + "% - 20px)";

	playerElement.style.width = "300px";

	var playerNameElement = document.createElement("div");
	playerNameElement.classList.add("statHeader");

	playerNameElement.innerHTML = name;
	
	playerElement.appendChild(playerNameElement);

	var playerStatsElement = document.createElement("div");
	playerStatsElement.classList.add("statContent");

//	var heroes = details["mostPlayed"];

	// add most played
	
	/*
	var statElement = document.createElement("div");
	statElement.classList.add("stat");

	var statTopElement = document.createElement("div");
	statTopElement.classList.add("statHeader");
	statTopElement.innerHTML = "Most Played Heroes";
	
	statElement.appendChild(statTopElement);
	var statValueElement = document.createElement("div");
	statValueElement.classList.add("statValue");
	
	
	for (var hero of heroes) {
		var heroElement = document.createElement("img");
		heroElement.classList.add("heroPortrait");
		if (margin > 0) {
			heroElement.style.marginLeft = margin + "px";
			heroElement.style.marginRight = margin + "px";
		}
		var nameSplit = hero.toLowerCase().split(" ");
		var heroName = "";
		for (var piece of nameSplit) {
			heroName += piece;
		}
		heroElement.src = "images/heroes/" + heroName + ".png"
		heroElement.alt = hero;
		
		statValueElement.appendChild(heroElement);
	}
	
	statElement.appendChild(statValueElement);
	
	playerStatsElement.appendChild(statElement);
	*/

	var count = 0;
	
	var stat = "mostPlayed";

	var pElement = document.createElement("div");
	pElement.classList.add('playerStat');
	
	var tableElement = document.createElement("table");
	tableElement.style.width = "100%";
	var trElement = document.createElement("tr");
	for (var hero of details[stat]) {
		var tdElement = document.createElement("td");
		tdElement.classList.add("center");
		var heroElement = document.createElement("img");
		heroElement.classList.add("heroPortrait");
		var nameSplit = hero.toLowerCase().split(" ");
		var heroName = "";
		for (var piece of nameSplit) {
			heroName += piece;
		}
		heroElement.src = "images/heroes/" + heroName + ".png"
		heroElement.alt = hero;
		heroElement.style.marginLeft = "5px";
		heroElement.style.marginRight = "5px";
	
		tdElement.appendChild(heroElement);
		trElement.appendChild(tdElement);
		count++;
		if (count >= 3) {
			break;
		} 
	}
	tableElement.appendChild(trElement);
	pElement.appendChild(tableElement);
	playerStatsElement.appendChild(pElement);


	pElement = document.createElement("div");
	pElement.classList.add('playerStat');

	tableElement = document.createElement("table");
	
	tableElement.style.width = "100%";

	for (var stat in details) {
		if (stat == "mostPlayed" || stat == "length") {
			continue;
		}
		trElement = document.createElement("tr");

		var nameElement = document.createElement("td");
		nameElement.style.textAlign = "left";
		nameElement.style.padding = "5px";
		//nameElement.classList.add("statName");

		var valueElement = document.createElement("td");
		valueElement.style.textAlign = "right";
		valueElement.style.padding = "5px";
//		valueElement.classList.add("statValue");

		if (stat in description) {
			nameElement.innerHTML = description[stat];
		} else {
			nameElement.innerHTML = stat;
		}
		
		if (percents.includes(stat)) {
			valueElement.innerHTML = (100.0 *details[stat]).toFixed(2) + "%";
		} else {
			if (stat.includes("Time")) {
				valueElement.innerHTML = convertTime(details[stat]);
			} else {
				if (floats.includes(stat) || stat == "Takedowns") {
					valueElement.innerHTML = details[stat].toFixed(2);
				} else {
					valueElement.innerHTML = details[stat];
				}
			}
		}
		trElement.appendChild(nameElement);
		trElement.appendChild(valueElement);

		tableElement.appendChild(trElement);

	}
	pElement.appendChild(tableElement);

	playerStatsElement.appendChild(pElement);

	playerElement.appendChild(playerStatsElement);
	
	return playerElement;
}

function loadDetails() {
	var targetElement = window.event.target;
	while (!targetElement.classList.contains("profile")) {
		targetElement = targetElement.parentNode;
	}
	var name = targetElement.id;

	loadPlayer(name);
}

function resizeTeamStats() {
	var contentElement = document.getElementsByClassName('content')[0];
	var contentWidth = contentElement.offsetWidth;
	var statElements = document.getElementsByClassName('stat');
	var width = Math.min(statElements.length * 320, contentWidth);
	var teamStatElement = document.getElementsByClassName('stats')[0];
	teamStatElement.style.width = width + "px";
}

function processStats(e) {
	stats = JSON.parse(xhr.response);

	var contentElement = document.getElementsByClassName('content')[0];
	
	if (!("players" in stats)) {
		while (contentElement.firstChild) {
			contentElement.removeChild(contentElement.firstChild);
		}
	
		contentElement.innerHTML = "No stats available yet. Please check back later.";
		return;
	}

	// for now, use stats directly for players. later, use stats['players']
	playerStats = stats['players'];
	
	var playersElement = document.getElementById("playerStats");
	
	var playerNames = [];
	
	var mapping = {};
	
	for (var playerName of Object.keys(playerStats)) {
		mapping[playerName.toLowerCase()] = playerName;
		playerNames.push(playerName.toLowerCase());
	}
	
	playerNames.sort();
	
	for (var player of playerNames) {
		playersElement.appendChild(loadPlayer(mapping[player]));
	}
	
	// load team stats
	teamStats = stats['team'];

	var teamStatsElement = document.getElementById("teamStats");
	
	
	var tableElement = document.createElement("table");
	tableElement.style.width = "calc(100% - 20px)";
	
	var headerElement = document.createElement("thead");
	
	var headerTrElement = document.createElement("tr");
	
	var bodyElement = document.createElement("tbody");
	var bodyTrElement = document.createElement("tr");
	
	for (var stat in teamStats) {
		var nameElement = document.createElement("td");
		nameElement.classList.add("center");
		nameElement.style.padding = "5px";



		if (stat in description) {
			nameElement.innerHTML = description[stat];
		} else {
			nameElement.innerHTML = stat;
		}
		
		var valueElement = document.createElement("td");
		valueElement.classList.add("center");
		valueElement.style.padding = "5px";


		if (percents.includes(stat)) {
			valueElement.innerHTML = (100.0 * teamStats[stat]).toFixed(2) + "%";
		} else {
			if (stat.includes("Time")) {
				valueElement.innerHTML = convertTime(teamStats[stat]);
			} else {
				if (floats.includes(stat)) {
					valueElement.innerHTML = teamStats[stat].toFixed(2);
				} else {
					valueElement.innerHTML = teamStats[stat];
				}
			}
		}

		
		if (stat == "AvgPctDead") {
			valueElement.innerHTML += "%";
		}

		headerTrElement.appendChild(nameElement);
		bodyTrElement.appendChild(valueElement);
		
	}
	headerElement.appendChild(headerTrElement);
	bodyElement.appendChild(bodyTrElement);
	tableElement.appendChild(headerElement);
	tableElement.appendChild(bodyElement);
	teamStatsElement.appendChild(tableElement);
	
	resizeTeamStats();
}
	
function loadStats(e) {
	var url = "https://raw.githubusercontent.com/patienc3v/patienc3v.github.io/master/genm/data/stats.json";
	xhr = new XMLHttpRequest();
	xhr.addEventListener('loadend', processStats);
	xhr.open("GET", url);
	xhr.send();
}

window.onload = function () {
	// load players
	loadStats();
}

window.onresize = resizeTeamStats;