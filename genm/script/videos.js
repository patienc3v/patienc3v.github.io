var videoData = [];

function createVideo(videoInfo, width, autoplay) {
	var divElements = document.getElementsByClassName("video");

	var divElement;

	if (divElements.length == 0) {
		divElement = document.createElement("div");
		divElement.classList.add("video");

		var iFrameElement = document.createElement("iframe");
		iFrameElement.classList.add("videoContent");
		iFrameElement.width = width - 24;
		iFrameElement.height = iFrameElement.width / 16 * 9;
	
		iFrameElement.style.frameborder = "0";
		iFrameElement.allowfullscreen = "true";
		iFrameElement.allow = "fullscreen;"
		iFrameElement.scrolling = "no";
	
		divElement.appendChild(iFrameElement);
	
		var textElement = document.createElement("div");
		textElement.classList.add("videoText");
			
		divElement.appendChild(textElement);

	} else { 
		divElement = divElements[0];
		var iFrameElement = divElement.childNodes[0];
		var textElement = divElement.childNodes[1];
	}

	iFrameElement.src = "https://www.youtube.com/embed/" + videoInfo["video"];

	return divElement;
}

function createTable() {
	//	tableElement = document.getElementById("page");

	//initialize table
	var table = new Tabulator("#videos", {
		data: videoData, //assign data to table
		layout:"fitColumns",      //fit columns to width of table
		responsiveLayout:"hide",  //hide columns that don't fit on the table
		addRowPos:"top",          //when adding a new row, add it to the top of the table
		history:false,             //allow undo and redo actions on the table
		pagination:"local",       //paginate the data
		paginationSize:10,         //allow 7 rows per page of data
		paginationCounter:"rows", //display count of paginated rows in footer
		movableColumns:false,      //allow column order to be changed
		initialSort:[             //set the initial sort order of the data
			{column:"Season", dir:"asc"},
		],
		columnDefaults:{
			tooltip:true,         //show tool tips on cells
		},
		columns:[                 //define the table columns
			{title:"Season", field:"season", editor:false},
			{title:"Game", field:"game", editor:false},
			{title:"Opponent", field:"opponent", editor:false},
		],
	});

	table.on("rowClick", function(e, row){
		createVideo(row.getData());
	});
}

function processVideos() {
	// just the most recent one
	contentElement = document.getElementsByClassName("content")[0];

	var jsonDATA = JSON.parse(xhr.response);
	
	if (jsonDATA.length == 0) {
		contentElement.innerHTML = "Videos coming soon...";
		return;
	}

	for (var id = 1; id <= jsonDATA.length; id++) {
		var currentVideo = {};
		currentVideo['id'] = id;
		currentVideo['season'] = jsonDATA[id - 1]['season'];
		if ('week' in jsonDATA[id - 1]) {
			// weekly match
			if (jsonDATA[id - 1]['week'] == 0) {
				currentVideo['game'] = "Week Flex";
			} else {
				currentVideo['game'] = "Week " + jsonDATA[id - 1]['week'];
			}
		} else {
			// playoff
			switch (jsonDATA[id - 1]['playoff']) {
				case 1:
					currentVideo['game'] = "Quarterfinal";
					break;
				case 2:
					currentVideo['game'] = "Semifinal";
					break;
				case 3:
					currentVideo['game'] = "Final";
					break;
				case 4:
					currentVideo['game'] = "Grand Final";
					break;
				default:
					currentVideo['game'] = "!!!";

			}
		}
		currentVideo['opponent'] = jsonDATA[id - 1]['opponent'];
		currentVideo['video'] = jsonDATA[id - 1]['video'];
		videoData.push(currentVideo);
	}

	videoWidth = Math.min(240 * 4 + 24 * 4, contentElement.offsetWidth);
	var padding = Math.floor((contentElement.offsetWidth - videoWidth) / 2);
	contentElement.style.paddingLeft = padding + "px";
	contentElement.style.paddingRight = padding + "px";

	contentElement.appendChild(createVideo(videoData[0], videoWidth, false));

	var pageElement = document.createElement("div");
	pageElement.id = "videos";
	pageElement.classList.add("page");
	pageElement.styleWidth = videoWidth;

	contentElement.appendChild(pageElement);

	createTable();
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