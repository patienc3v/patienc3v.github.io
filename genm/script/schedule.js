var xhr = new XMLHttpRequest();

var season = 12;

var teamname = "Gen.M Esports";

var contentElement = null;

/*

<div class="match">
<div class="datetime">
DATE @ TIME
</div>
<table width="100%">
<tr>
<td class="home">
<img src="https://s3.amazonaws.com/ngs-image-storage/Yellow_Owls_6445.png" class="logo">
<p class="homeName">HOME</p>
</td>
<td class="away">
<img src="images/gen.m.png" class="logo">
<p class="awayName">Gen. M Esports</p>
</td>
</tr>
</table>
<div class="link">
VOD or STREAM LINK
</div>
<div class="vs">
VS
</div>
</div>

*/

var spoilers = false;

function toggleScores(className) {
	var scores = document.getElementsByClassName(className);

	for (var score of scores) {
		score.style.backgroundColor = (spoilers ? "#fff" : "#000");
	}
}
function toggleSpoilers() {
	spoilers = !spoilers;
	toggleScores('scoreHome');
	toggleScores('scoreAway');
}

function timeConverter(UNIX_timestamp){
  var a = new Date(parseFloat(UNIX_timestamp));
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var am = false;
  var hour = a.getHours();
  if (hour >= 12) {
	am = false;
	hour -= 12;
  }
  if (hour == 0) {
	hour = 12;
  }
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var zone = a.toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2]
  var time = month + ' ' + date + ', ' + year + ' @ ' + (''+hour).padStart(2, '0') + ':' + (''+min).padStart(2, '0') + " " + (am ? "AM" : "PM") + " " + zone ;
  return time;
}

function createMatch(matchID, datetime, reported, homeLogo, homeName, homeScore, awayLogo, awayName, awayScore, vods, caster, casterURL) {
	var matchElement = document.createElement("div");
	matchElement.classList.add("match");
	matchElement.onclick = function() {
		window.location.href = "https://www.nexusgamingseries.org/match/view/" + matchID;
	}
	
	var dateElement = document.createElement("div");
	dateElement.classList.add("datetime");
	dateElement.innerHTML = timeConverter(datetime);
	
	matchElement.appendChild(dateElement);
	
	var tableElement = document.createElement("table");
	tableElement.style.width = "100%";
	
	var trElement = document.createElement("tr");
	
	var tdElement = document.createElement("td");
	tdElement.classList.add("home");
	
	var homeLogoElement = document.createElement("img");
	homeLogoElement.src = "https://s3.amazonaws.com/ngs-image-storage/" + homeLogo;
	homeLogoElement.alt = homeName;
	homeLogoElement.classList.add('logo');
	
	var homeNameElement = document.createElement("p");
	homeNameElement.classList.add("homeName");
	homeNameElement.innerHTML = homeName;

	tdElement.appendChild(homeLogoElement);
	tdElement.appendChild(homeNameElement);
	trElement.appendChild(tdElement);

	tdElement = document.createElement("td");
	tdElement.classList.add("away");
	
	var awayLogoElement = document.createElement("img");
	awayLogoElement.src = "https://s3.amazonaws.com/ngs-image-storage/" + awayLogo;
	awayLogoElement.alt = homeName;
	awayLogoElement.classList.add('logo');
	
	var awayNameElement = document.createElement("p");
	awayNameElement.classList.add("awayName");
	awayNameElement.innerHTML = awayName;

	tdElement.appendChild(awayLogoElement);
	tdElement.appendChild(awayNameElement);
	trElement.appendChild(tdElement);

	tableElement.appendChild(trElement);
	
	matchElement.appendChild(tableElement);

	var vodElement = document.createElement("div");
	vodElement.classList.add("link");
	
	vodElement.innerHTML = "";

	if (reported) {
		vodElement.innerHTML = "<span class='scoreHome'>" + homeScore + "</span> ";
	}
	
	if (vods.length == 0) {
		if (casterURL != undefined && casterURL != "TBD") {
			if (!casterURL.startsWith("http")) {
				casterURL = "https://" + casterURL;
			}
			vodElement.innerHTML += "Casted by <a class='vodLink' href='" + casterURL + "'>" + caster + "</a> ";
		} else {
			var today = Date.now();
			console.log("today: " + today);
			console.log("date:  " + datetime);
			if (datetime < today) {
				vodElement.innerHTML += "No VoD available";
			} else {
				vodElement.innerHTML += "No caster assigned";
			}
		}
	} else {
		if (vods.length == 1) {
			vodElement.innerHTML += "<a class='vodLink' href='" + vods[0] + "'>VoD</a> ";
		} else {
			for (var vod of vods) {
				vodElement.innerHTML += "<a class='vodLink' href='" + vods[0] + "'>VoD</a> ";
			}
		}
	}

	if (reported) {
		vodElement.innerHTML += "<span class='scoreAway'>" + awayScore + "</span> ";
	}
	
	matchElement.appendChild(vodElement);
	
	var vsElement = document.createElement("div");
	vsElement.classList.add("vs");
	vsElement.innerHTML = "VS";
	
	matchElement.appendChild(vsElement);
	
	return matchElement;
}


/*

<div class="match">
<div class="datetime">
DATE @ TIME
</div>
<table width="100%">
<tr>
<td class="home">
<img src="https://s3.amazonaws.com/ngs-image-storage/Yellow_Owls_6445.png" class="logo">
<p class="homeName">HOME</p>
</td>
<td class="away">
<img src="images/gen.m.png" class="logo">
<p class="awayName">Gen. M Esports</p>
</td>
</tr>
</table>
<div class="link">
VOD or STREAM LINK
</div>
<div class="vs">
VS
</div>
</div>

<div class="match">
<div class="datetime">
DATE @ TIME
</div>
<table width="100%">
<tr>
<td class="home">
<img src="https://s3.amazonaws.com/ngs-image-storage/Yellow_Owls_6445.png" class="logo">
<p class="homeName">HOME</p>
</td>
<td class="away">
<img src="images/gen.m.png" class="logo">
<p class="awayName">Gen. M Esports</p>
</td>
</tr>
</table>
<div class="link">
<span class="scoreHome">1</span>VOD or STREAM LINK<span class="scoreAway">2</span>
</div>
<div class="vs">
VS
</div>
</div>


*/

function processSchedule() {
	var matches = JSON.parse(xhr.response)['returnObject'];
	
	var matchElements = [];
	
	var teamMatches = {};
	
	for (var match of matches) {
		var homeName = match['home']['teamName'];
		var awayName = match['away']['teamName'];
		if (homeName == teamname || awayName == teamname) {
			var datetime = match['scheduledTime']['startTime'];
			teamMatches[datetime] = match;
		}
	}
	var dates = Object.keys(teamMatches);
	dates.sort(function(a, b){return a-b});
	
	for (var datetime of dates) {
		// vodLinks -> list of links
		// home or away
		// --> teamName
		// --> ticker
		// --> score
		// --> logo (img file name) need to be appended to https://s3.amazonaws.com/ngs-image-storage/
		
		// scheduledTime
		// --> startTime
		
		var match = teamMatches[datetime];
		
		var vods = match['vodLinks'];
		
		// var datetime = match['scheduledTime']['startTime'];
		
		if (!('home' in match) || !('away' in match)) {
			continue;
		}
		var homeName = match['home']['teamName'];
		var awayName = match['away']['teamName'];

		var homeTicker = homeName;
		if (match['home']['ticker'] != undefined) {
			homeTicker = match['home']['ticker'].toUpperCase();
		}
		var awayTicker = awayName;
		if (match['away']['ticker'] != undefined) {
			awayTicker = match['away']['ticker'].toUpperCase();
		}

		var homeLogo = match['home']['logo'];
		var awayLogo = match['away']['logo'];
		
		var reported = match['reported'];
		
		var homeScore = null;
		var awayScore = null;
		if (reported) {
			homeScore = match['home']['score'];
			awayScore = match['away']['score'];
		}
		
		var caster = match['casterName'];
		var casterURL = match['casterUrl']
		
		var matchID = match['matchId'];
		
		if (homeName == teamname || awayName == teamname) {
			// (datetime, reported, homeLogo, homeName, homeScore, awayLogo, awayName, awayScore, vods)
			matchElements.push(createMatch(matchID, datetime, reported, homeLogo, homeTicker, homeScore, awayLogo, awayTicker, awayScore, vods, caster, casterURL));
		}
	}
	if (matchElements.length == 0) {
		contentElement.innerHTML = "<span>There is no match scheduled yet. Please check back later.</span>";
	} else {
		while (contentElement.firstChild) {
			contentElement.removeChild(contentElement.firstChild);
		}
		var buttonElement = document.createElement("button");
		buttonElement.classList.add("spoilerButton");
		buttonElement.innerHTML = "Show/Hide Scores";
		buttonElement.onclick = toggleSpoilers;
		
		contentElement.appendChild(buttonElement);
		
		for (var index = matchElements.length - 1; index >= 0; index--) {
			contentElement.appendChild(matchElements[index]);
		}
	}
}

function loadSchedule() {
	// URL
	var url = "https://www.nexusgamingseries.org/api/schedule/get/matches/scheduled?season=" + season;
    xhr.addEventListener('loadend', processSchedule);
    xhr.open("GET", url);
    xhr.send();
}

window.addEventListener("load",function(event) {
	contentElement = document.getElementsByClassName("content")[0];
	loadSchedule();
},false);

