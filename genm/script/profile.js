var xhr = new XMLHttpRequest();

var playerDetailElement;

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

var stats = {};
//var stats = JSON.parse('{  "Patienc3": {    "mostPlayed": [ "Deckard", "Ana", "Stukov", "Rehgar", "Lucio" ],    "KDA": 8.388975155279503,    "Win Rate": 52.00501253132832,    "MMR": 2735  },  "Majesty": {    "mostPlayed": [ "Mephisto", "Uther", "Abathur", "Lucio", "Hanzo" ],    "KDA": 5.440520446096654,    "Win Rate": 56.42201834862385,    "MMR": 2499  },  "Yonners": {    "mostPlayed": [ "Jaina", "Valla", "Tracer", "Hanzo", "Genji" ],    "KDA": 4.889114541023558,    "Win Rate": 52.844638949671776,    "MMR": 2528  },  "LeoRice": {    "mostPlayed": ["Mei", "E.T.C.", "Diablo", "Johanna", "Muradin" ],    "KDA": 3.669724770642202,    "Win Rate": 50,    "MMR": 2485  }}');
function loadPlayer(name) {
	var details = stats[name];
	var profiles = document.getElementsByClassName("profile");

	var width = Math.min(window.innerWidth, profiles.length * 200);

	playerDetailElement.style.width = width + "px";
	
	removeAllChildNodes(playerDetailElement);

	var playerNameElement = document.createElement("div");
	playerNameElement.classList.add("playerDetailName");

	var nameElement = document.createElement("h3");
	nameElement.textAlign = "center";
	nameElement.innerHTML = name;
	
	playerNameElement.appendChild(nameElement);

	playerDetailElement.appendChild(playerNameElement);

	var playerStatsElement = document.createElement("div");
	playerStatsElement.classList.add("playerDetailStats");

	var dividers = [5, 3, 2, 1];
	// compute the width to use for each image
	var margin = -1;
	
	for (var divider of dividers) {
		margin = (width / divider - 96 - 40) / 2;
		if (margin > 0) {
			break;
		}
	}	
	
	var heroes = details["mostPlayed"];

	// add most played
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
	
	
	var elementWidth = (width - 60) / 3  -20;

	for (var stat of ["KDA", "Win Rate", "MMR"]) {
		var value = details[stat];
		
		
		var statElement = document.createElement("div");
		statElement.classList.add("stat");
		
		var statTopElement = document.createElement("div");
		statTopElement.classList.add("statHeader");
		statTopElement.innerHTML = stat;
		
		statElement.appendChild(statTopElement);
		var statValueElement = document.createElement("div");
		statValueElement.classList.add("statValue");
		
		if (stat == "MMR") {
			statValueElement.innerHTML = value;
		} else {
			statValueElement.innerHTML = value.toFixed(2);
		}
		statElement.appendChild(statValueElement);
		
		if (stat == "Win Rate") {
			statValueElement.innerHTML += "%";
		}
		
		statElement.style.width = elementWidth + "px";
	
		playerStatsElement.appendChild(statElement);
	}

	var expElement = document.createElement("p");
	expElement.style.fontSize = "small";
	expElement.innerHTML = "Based on the HeroesProfile data on Storm League and all seasons";
	
	playerStatsElement.appendChild(expElement);

	playerDetailElement.appendChild(playerStatsElement);
}

function loadDetails() {
	var targetElement = window.event.target;
	while (!targetElement.classList.contains("profile")) {
		targetElement = targetElement.parentNode;
	}
	var name = targetElement.id;

	loadPlayer(name);
}

function processStats(e) {
	
	var bytes = document.getElementById("loadingPercent");
	bytes.innerHTML = e.loaded + " bytes";
	if (e.type == "loadend") {
		// populate players
		var playersElement = document.getElementById("players");
		
//		var data = '[{	"name": "LeoRice",	"role": "Tank",	"country": "canada"},{	"name": "Majesty",	"role": "Assassin",	"country": "usa"},{	"name": "Yonners",	"role": "Assassin",	"country": "usa"},{	"name": "Patienc3",	"role": "Healer",	"country": "south.korea"},{	"name": "",	"role": "Offlane",	"country": ""},{	"name": "",	"role": "Sub",	"country": ""}]';
		var players = JSON.parse(xhr.response);
		
		for (var player of players) {
			var profileElement = document.createElement("div");
			profileElement.classList.add("profile");
			if (player["name"] == "") {
				var pictureElement = document.createElement("img");
				
				pictureElement.src = "images/profile/profile.generic.png";
				pictureElement.alt = "https://www.clipartkey.com/view/ihRTmwR_clip-art-man-arms-crossed-professional-man-png/";
				pictureElement.classList.add("profilePicture");
				
				profileElement.appendChild(pictureElement);

				var textElement = document.createElement("div");
				textElement.classList.add("profileText");
				
				var flagElement;
				flagElement = document.createElement("div");
				flagElement.style.backgroundColor = "#ccc";
				
				textElement.appendChild(flagElement);
				
				var nameElement = document.createElement("span");
				nameElement.classList.add("profileName");
				nameElement.innerHTML = "Open";
				
				textElement.appendChild(nameElement);
				
				var breakElement = document.createElement("br");
				textElement.appendChild(breakElement);
				
				var roleElement = document.createElement("span");
				roleElement.classList.add("profileRole");
				roleElement.innerHTML = player["role"];
				
				textElement.appendChild(roleElement);
				
				profileElement.appendChild(textElement);

			} else {
				profileElement.id = player["name"];

				var pictureElement = document.createElement("img");
				
				if (player["picture"] == undefined) {
					pictureElement.src = "images/profile/profile.generic.png";
					pictureElement.alt = "https://www.clipartkey.com/view/ihRTmwR_clip-art-man-arms-crossed-professional-man-png/";
				}
				pictureElement.classList.add("profilePicture");
				
				profileElement.appendChild(pictureElement);
				
				var textElement = document.createElement("div");
				textElement.classList.add("profileText");
				
				var flagElement;
				if (player["country"] == "") {
					flagElement = document.createElement("div");
					flagElement.style.backgroundColor = "#ccc";
				} else {
					flagElement = document.createElement("img");
					flagElement.src = "images/flags/" + player["country"] + ".png";
					flagElement.classList.add("profileFlag");
					flagElement.alt = player["country"];
				}
				
				textElement.appendChild(flagElement);
				
				var nameElement = document.createElement("span");
				nameElement.classList.add("profileName");
				nameElement.innerHTML = player["name"];
				
				textElement.appendChild(nameElement);
				
				var breakElement = document.createElement("br");
				textElement.appendChild(breakElement);
				
				var roleElement = document.createElement("span");
				roleElement.classList.add("profileRole");
				roleElement.innerHTML = player["role"];
				
				textElement.appendChild(roleElement);
				
				profileElement.appendChild(textElement);
				
				profileElement.onclick = loadDetails;
			}
			
			playersElement.appendChild(profileElement);
			
		}
	}
}
	
function processPlayers(e) {
	
	var bytes = document.getElementById("loadingPercent");
	bytes.innerHTML = e.loaded + " bytes";
	if (e.type == "loadend") {
		
		var url = "file:///C:/Users/Terminator/Dropbox/githubio/patienc3v.github.io/genm/data/stats.json";
		xhr.addEventListener('loadend', processPlayers);
		xhr.open("GET", url);
		xhr.send();

	}
}

function loadPlayers() {
	// URL
	var url = "file:///C:/Users/Terminator/Dropbox/githubio/patienc3v.github.io/genm/data/players.json";
    xhr.addEventListener('loadend', processPlayers);
    xhr.open("GET", url);
    xhr.send();
}

window.onload = function () {
	playerDetailElement = document.getElementById("playerDetails");
	// load players
	loadPlayers();
	
}