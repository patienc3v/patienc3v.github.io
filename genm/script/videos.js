function setDarkMode(darkMode) {
    var oldlink = document.getElementsByTagName("link").item(1);

    var newlink = document.createElement("link");
    newlink.setAttribute("rel", "stylesheet");
    newlink.setAttribute("type", "text/css");
	if (darkMode) {
		newlink.setAttribute("href", "style/dark.css");
	} else {
		newlink.setAttribute("href", "style/light.css");
	}

    oldlink.parentNode.replaceChild(newlink, oldlink);
	
	localStorage.setItem('genmDark', darkMode);
}

function toggleDarkMode() {
	var toggle = document.getElementById('darkMode');
	var darkMode = toggle.checked;

	setDarkMode(darkMode);
}

window.addEventListener("load",function(event) {
	// load preference
	var pref = localStorage.getItem('genmDark');
	
	var darkMode = null;
	
	if (pref == null) {
		// no previous configuration
		localStorage.setItem('genmDark', false);
		darkMode = false;
	} else {
		darkMode = (pref == "true");
	}
	var toggle = document.getElementById('darkMode');
	toggle.checked = darkMode;
	// toggle correctly
	setDarkMode(darkMode);
},false);

var xhr = new XMLHttpRequest();

function loadVideos() {
	// URL
	var url = "https://raw.githubusercontent.com/patienc3v/patienc3v.github.io/master/genm/data/videos.json";
    xhr.addEventListener('loadend', processPlayers);
    xhr.open("GET", url);
    xhr.send();
}