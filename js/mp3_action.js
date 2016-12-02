window.AudioContext=window.AudioContext||window.webkitAudioContext||window.mozAudioContext;
var audios=document.getElementById("audios");
var ctx=new AudioContext();
var analySer=ctx.createAnalyser();
var audioSrc=ctx.createMediaElementSource(audios);
var can1=document.getElementById("canvas"),c_wid=can1.width,c_hig=can1.height;
var ctx1=can1.getContext('2d');
var gradit=ctx1.createLinearGradient(0,0,0,300);
var mateNum=c_wid/12;
var capY=[];
var lists=document.getElementById("lists");
var thisSong=document.getElementById("songName").getElementsByTagName('span')[0];
var sing=Math.floor(Math.random()*audioList.length);
var replays=1;//1:列表循环2:单曲循环3:随机播放
var resp=document.getElementById("replays");
var allSong=parseInt(audioList.length);
var lastbt=document.getElementById("last"),
	stopbt=document.getElementById("stop"),
	nextbt=document.getElementById("next"),
	volbt=document.getElementById("vol"),
	ptime=document.getElementById("playtime"),
	rates=document.getElementById("rate"),
	volctr=document.getElementById("volctrl");
var curr=document.getElementById("currTime");
var showl=document.getElementById("showlrc");
var inLrc=[],lrcTm,curtime=0;
window.onload=function () {
//	var windows=window.navigator.userAgent.toLocaleLowerCase();
//	var regWin=/firefox/g;
//	if (!regWin.test(windows)) {
//		alert("请使用 FireFox 浏览器打开！");
//		return ;
//	}
	switch (replays){
		case 1:
			resp.innerHTML="列表循环";
			break;
		case 2:
			resp.innerHTML="单曲循环";
			break;
		case 3:
			resp.innerHTML="随机播放";
			break;
		default:
			break;
	}
	audioSrc.connect(analySer);
	analySer.connect(ctx.destination);
	audios.volume=volctr.value;
	gradit.addColorStop(0,"red");
	gradit.addColorStop(1,"greenyellow");
	loadList();	
	ctx1.fillStyle="#fff";
	for (var i=0;i<mateNum;i++) {
		capY[i]=2;
		ctx1.fillRect(i*12,c_hig-2,10,2);
	}
	readF();
	searchLrc();
	audios.play();
}
function readF () {
	var arrs = new Uint8Array(analySer.frequencyBinCount);
	analySer.getByteFrequencyData(arrs);
	var step=Math.round(arrs.length/mateNum);
	ctx1.clearRect(0,0,c_wid,c_hig);
	for (var i=0;i<mateNum;i++) {
		var y=arrs[i*step];
		if (capY[i]<y+2) {
			capY[i]=y+2;
		} else if (capY[i]>y+2) {
			capY[i]--;
		}
		ctx1.fillStyle="#fff";
		ctx1.fillRect(i*12,c_hig-capY[i],10,2);
		ctx1.fillStyle=gradit;
		ctx1.fillRect(i*12,c_hig-y,10,c_hig);
	}
	requestAnimationFrame(readF);
}
audios.ontimeupdate=function (e) {
	updateRate();
	currLrc();
	if (audios.ended) {
		switch (replays){
			case 1:
				nextSong();
				break;
			case 2:
				audios.play();
				break;
			case 3:
				redSong();
				break;
			default:
				break;
		}
	}
}
function loadList () {
	for (var i=0;i<audioList.length;i++) {
		var name=audioList[i].substr(0,audioList[i].lastIndexOf("."));
		lists.innerHTML+='<a id="'+i+'" href="javascript:void(0)" onclick="changeSong(this.id)">'+name+'</a>'
	}
	audios.src="video/"+audioList[sing];
	thisSong.innerHTML=getThisSong();
}
function changeSong (x) {
	sing=x;
	audios.src="video/"+audioList[x];
	thisSong.innerHTML=getThisSong();
	audios.load();
	audios.play();
	stopbt.src="img/stop.png";
	searchLrc();
	showl.innerHTML="";
}
function getThisSong () {
	var str1=decodeURI(audios.src);
	var name=str1.substr(str1.lastIndexOf('/')+1,str1.length);
	name=name.substr(0,name.lastIndexOf("."));
	return name;
}
function nextSong () {
	sing++;
	if (sing>=allSong) {
		sing=0;
	}
	changeSong(sing);
}
function lastSong () {
	sing--;
	if (sing<0) {
		sing=allSong-1;
	}
	changeSong(sing);
}
function redSong () {
	sing=Math.floor(Math.random()*audioList.length);
	changeSong(sing);
}
resp.onclick=function () {
	switch (replays){
		case 1:
			replays++;
			resp.innerHTML="单曲循环"
			break;
		case 2:
			replays++;
			resp.innerHTML="随机播放"
			break;
		case 3:
			replays=1;
			resp.innerHTML="列表循环"
			break;
		default:
			break;
	}
}
nextbt.onclick=function () {
	nextSong();
}
lastbt.onclick=function () {
	lastSong();
}
volbt.onclick=function () {
	audios.muted=!(audios.muted);
	if (audios.muted) {
		volbt.src="img/novolume.png";
	} else{
		volbt.src="img/volume.png";
	}
}
stopbt.onclick=function () {
	if (audios.paused) {
		audios.play();
		stopbt.src="img/stop.png";
	} else{
		audios.pause();
		stopbt.src="img/play.png";
	}
}
volctr.oninput=function () {
	audios.volume=volctr.value;
}
function updateRate () {
	var a=audios.currentTime,
		b=audios.duration;
	rates.value=Math.round((a/b)*1000)/10;
	ptime.innerHTML=toDates(a)+'/'+toDates(b);
	if (rate.value<0.15*rate.max) {
		curr.style.width=rates.value*(170/100)+20+'px';
	} else if (rate.value>85) {
		curr.style.width=rates.value*(170/100)-20+'px';
	} else{
		curr.style.width=rates.value*(170/100)+'px';
	}
}
function toDates (x) {
	var sec,min;
	sec=Math.floor(x%60);
	min=Math.floor(x/60);
	if (min<10) {
		min="0"+min;
	}
	if (sec<10) {
		sec="0"+sec;
	}
	return min+':'+sec;
}
rates.oninput=function () {
	var x=rates.value/100;
	audios.currentTime=audios.duration*x;
}
function getLrc (url) {
	var xhr;
	if (window.XMLHttpRequest) {
		xhr=new XMLHttpRequest();
	} else{
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.open("GET",url,true);
	xhr.send();
	xhr.onreadystatechange=function () {
		if (xhr.readyState==4 && xhr.status==200) {
			inLrc=sortLrc(xhr.responseText);
		}
		if (xhr.readyState==4 && xhr.status!=200) {
			inLrc=[];
		}
	}	
}
function searchLrc () {
	var name=getThisSong();
	var urls="lrc/"+name+".lrc";
	getLrc(urls);
}
function sortLrc (x) {
	var lrc1=x.split(/\n/g);
	var reg1=/\[\d{2}:\d{2}.\d{2,3}\]/g;
	var lrc2=[],result=[];
	for (var i in lrc1) {
		if (reg1.test(lrc1[i])) {
			lrc2.push(lrc1[i]);
		} else {
			if (reg1.test(lrc1[i])) {
				lrc2.push(lrc1[i]);
			}
		}
	}
	for (var i in lrc2) {
		var t=lrc2[i].match(reg1);
		var l=lrc2[i].split(reg1)[lrc2[i].split(reg1).length-1];
		for (var j in t) {
			var alrc=[chaMS(t[j]),l]
			result.push(alrc);
		}
	}
	result.sort(function (a,b) {
		return a[0]-b[0];
	});
	return result;
}
function chaMS (str) {
	var times=str.match(/\d{2,3}/g);
	var m=parseInt(times[0]),
		s=parseInt(times[1]),
		ms=parseInt(times[2]);
	return ms+1000*s+1000*60*m;
}
function currLrc () {
	showl.innerHTML="";
	if (inLrc.length==0) {
		showl.innerHTML='没有找到歌词！';
		return ;
	}
	var t=Math.floor(audios.currentTime*1000);
	for (var i=0;i<inLrc.length-1;i++) {
		if (t<inLrc[i+1][0] && t>=inLrc[i][0]) {
			showl.innerHTML=inLrc[i][1];
			return ;
		}
	}
	if (t>=inLrc[inLrc.length-1][0]) {
		showl.innerHTML=inLrc[inLrc.length-1][1];
	}
}