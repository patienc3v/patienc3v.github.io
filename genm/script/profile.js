var xhr = new XMLHttpRequest();

function addPlayers(playerType, players) {

	// populate players
	var playersElement = document.getElementById(playerType);
	
	for (var player of players) {
		var profileElement = document.createElement("div");
		profileElement.classList.add("profile");
		if (player["name"] == undefined) {
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
			flagElement.classList.add("profileFlag");
			
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

			if ((playerType == "active" && !player["active"]) || (playerType != "active" && player["active"])) {
				continue;
			}

			var pictureElement = document.createElement("img");
			
			if (player["picture"] == undefined) {
				pictureElement.src = "images/profile/profile.generic.png";
				pictureElement.alt = "https://www.clipartkey.com/view/ihRTmwR_clip-art-man-arms-crossed-professional-man-png/";
			} else {
				pictureElement.src = "images/profile/" + player["picture"];
				pictureElement.alt = player["name"];
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
				flagElement.alt = player["country"];
			}
			flagElement.classList.add("profileFlag");
			
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
			
		}
		
		playersElement.appendChild(profileElement);
		
	}

}

function processPlayers(e) {
	var players = JSON.parse(xhr.response);

	stats = JSON.parse(xhr.response);

	addPlayers("active", stats);
	addPlayers("former", stats);
}
	
function loadPlayers() {
	// URL
	var url = "https://raw.githubusercontent.com/patienc3v/patienc3v.github.io/master/genm/data/players.json";
    xhr.addEventListener('loadend', processPlayers);
    xhr.open("GET", url);
    xhr.send();
}

window.onload = function () {
	playerDetailElement = document.getElementById("playerDetails");
	// load players
	loadPlayers();
}
