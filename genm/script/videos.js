var threshold = 8;

var videoData = null;

var videoWidth = 0;

var contentElement = null;

var filters = "";

var filteredData = [];

var currentPage = 1;

function loadPage(page) {
	currentPage = page;

	loadNavigator();

	var pagesElement = document.getElementsByClassName("page")[0];
	while (pagesElement.firstChild) {
        pagesElement.removeChild(pagesElement.firstChild);
    }
	var videoData = JSON.parse(xhr.response);
	
	var firstVideo = true;
	var videoWidth = Math.min(240 * 4 + 24 * 4, contentElement.offsetWidth);
	var padding = Math.floor((contentElement.offsetWidth - videoWidth) / 2);
	contentElement.style.paddingLeft = padding + "px";
	contentElement.style.paddingRight = padding + "px";
	
	// load the navigator
	
	
	var count = 0;
	for (var video of filteredData) {
		count++;
		if (count <= (page - 1) * threshold) {
			continue;
		}
		if (count > page* threshold) {
			break;
		} 
		pagesElement.appendChild(createVideo(video, videoWidth / 4 - 6, false));
	}
}

function createPageLink(character, page) {
	var link = '<a onclick="javascript:loadPage(' + page + ')">' + character + "</a>";
	return link;
}

function loadNavigator() {
	var numOfVideos = filteredData.length;
	var numOfPages = Math.ceil(numOfVideos / threshold);
	
	var pagesElement = document.getElementsByClassName("pages")[0];
	
	var finalHTML = "";
	
	var page = 1;
	
	if (currentPage > 1) {
		finalHTML += createPageLink("<", currentPage - 1) + " ";
	} else {
		finalHTML += "< ";
	}
	
	for (var page = 1; page <= numOfPages; page++) {
		if (page == currentPage) {
			finalHTML += "<b>" + page + "</b> ";
		} else {
			finalHTML += createPageLink(page, page) + " ";
		}
	}

	if (currentPage < numOfPages) {
		finalHTML += createPageLink(">", currentPage + 1);
	} else {
		finalHTML += ">";
	}
	
	pagesElement.innerHTML = finalHTML;
	
}

function filterVideos() {
	filters = document.getElementById("filters").value;
	
	var filterWords = filters.trim().split(/[ ,]+/);
	if (filterWords[0] == "") {
		filteredData = JSON.parse(JSON.stringify(videoData));
	} else {
		filteredData = [];
		for (var video of videoData) {
			var include = true;
			for (var filter of filterWords) {
				if (!video['title'].toLowerCase().includes(filter.toLowerCase())) {
					include = false;
					break;
				}
			}
			if (include) {
				filteredData.push(JSON.parse(JSON.stringify(video)));
			}
		}
	}
	
	loadPage(1);
}

/*

<iframe width="560" height="315" src="https://www.youtube.com/embed/VEyxPFVzk70" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

*/
function createVideo(videoInfo, width, autoplay) {
	var divElement = document.createElement("div");
	divElement.classList.add("video");
	
	var iFrameElement = document.createElement("iframe");
	iFrameElement.classList.add("videoContent");
	iFrameElement.width = width - 24;
	iFrameElement.height = iFrameElement.width / 16 * 9;
	if (videoInfo["type"] == "twitch") {
		iFrameElement.src = "https://player.twitch.tv/?video=" + videoInfo["video"] + "&parent=patienc3v.github.io&autoplay=" + autoplay;
	}
	if (videoInfo["type"] == "youtube") {
		iFrameElement.src = "https://www.youtube.com/embed/" + videoInfo["video"];
	}
	
	iFrameElement.style.frameborder = "0";
	iFrameElement.allowfullscreen = "true";
	iFrameElement.allow="fullscreen;"
	iFrameElement.scrolling = "no";

	divElement.appendChild(iFrameElement);

	var textElement = document.createElement("div");
	textElement.classList.add("videoText");
	if (videoInfo["title"].length > 24) {
		textElement.innerHTML = videoInfo["title"].substring(0, 24) + "...";
	} else {
		textElement.innerHTML = videoInfo["title"];
	}
	
	divElement.appendChild(textElement);
	return divElement;
}

function processVideos() {
	// just the most recent one
	contentElement = document.getElementsByClassName("content")[0];

	videoData = JSON.parse(xhr.response);
	
	if (videoData.length == 0) {
		contentElement.innerHTML = "Videos coming soon...";
		return;
	}
	videoWidth = Math.min(240 * 4 + 24 * 4, contentElement.offsetWidth);
	var padding = Math.floor((contentElement.offsetWidth - videoWidth) / 2);
	contentElement.style.paddingLeft = padding + "px";
	contentElement.style.paddingRight = padding + "px";
	
	contentElement.appendChild(createVideo(videoData[0], videoWidth, false));

	var navigatorElement = document.createElement("div");
	navigatorElement.classList.add("navigator");
	navigatorElement.styleWidth = videoWidth;
	
	var pagesElement = document.createElement("div");
	pagesElement.classList.add("pages");
	pagesElement.styleWidth = videoWidth;

	var searchElement = document.createElement("div");
	searchElement.classList.add("searchBox");
	
	var inputElement = document.createElement("input");
	inputElement.value = "";
	inputElement.id = "filters";
	inputElement.style.marginRight = "10px";
	
	var buttonElement = document.createElement("button");
	buttonElement.onclick = filterVideos;
	buttonElement.innerHTML = "Search";
	
	searchElement.appendChild(inputElement);
	searchElement.appendChild(buttonElement);
	
	navigatorElement.appendChild(pagesElement);
	navigatorElement.appendChild(searchElement);
	
	contentElement.appendChild(navigatorElement);
	
	var pageElement = document.createElement("div");
	pageElement.classList.add("page");
	pageElement.styleWidth = videoWidth;
	
	contentElement.appendChild(pageElement);
	
	filterVideos();
}

window.addEventListener("load",function(event) {
	loadVideos();
},false);

var xhr = new XMLHttpRequest();

function loadVideos() {
	// URL
	var url = "https://raw.githubusercontent.com/patienc3v/patienc3v.github.io/master/genm/data/videos.json";
    xhr.addEventListener('loadend', processVideos);
    xhr.open("GET", url);
    xhr.send();
}