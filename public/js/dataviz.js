//  ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ 
//  ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ 
// ../n!ck's data-viz   ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ 
//  ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ 
//  ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ * ~ 

Math.norm = function(value, min, max) { return (value - min) / (max - min); };
Math.lerp = function(norm, min, max) { return (max - min) * norm + min; };
Math.map = function(value, sourceMin, sourceMax, destMin, destMax) {
	return Math.lerp(Math.norm(value, sourceMin, sourceMax), destMin, destMax);
};

var cellWidth = 300;
var cellHeight = 350;

function makeButterfly( data ){
	var parent = document.getElementById('net');
	var butterfly = document.createElement('div');
		butterfly.className = "butterfly";
		butterfly.id = "_"+data;
		butterfly.onclick = function() { getInfo(data) };

	var top = document.createElement('div');
		top.className = "top";
	var tleft = document.createElement('div');
		tleft.className = "left";
	var tright = document.createElement('div');
		tright.className = "right";
	var bottom = document.createElement('div');
		bottom.className = "bottom";
	var bleft = document.createElement('div');
		bleft.className = "left";
	var bright = document.createElement('div');
		bright.className = "right";

	var d = data.split(':');
	var r = parseInt( d[0], 16 );
	var g = parseInt( d[1], 16 );
	var b = parseInt( d[2], 16 );
	var col = "rgb("+r+","+g+","+b+")";
	tleft.style.background = tright.style.background = bleft.style.background = bright.style.background = col;

	var w = Math.floor(Math.map( parseInt( d[3], 16 ), 0,255, (cellWidth-50)/1.25,(cellWidth-50) )); 	
	var h = Math.floor(Math.map( parseInt( d[4], 16 ), 0,255, (cellHeight-50)/1.5,(cellHeight-50) ));	
	butterfly.style.width = w+"px";
	butterfly.style.height = h+"px";
	butterfly.style.margin = (cellHeight-h)/2+"px "+(cellWidth-w)/2+"px";
	butterfly.style.left = (window.innerWidth-(Math.floor(window.innerWidth/cellWidth)*cellWidth))/2 +"px";
	butterfly.style.top = "0px";

	var rad3 = Math.map( parseInt( d[4], 16 ), 0,255, 64,113 );
	var rad4 = Math.map( parseInt( d[5], 16 ), 0,255, 3,18 );
	tleft.style.borderRadius = "0% "+Math.floor(rad3)+"% "+Math.floor(rad4)+"% 150%";
	tright.style.borderRadius = "150% "+Math.floor(rad4)+"% "+Math.floor(rad3)+"% 0%";

	var ran = Math.floor( (Math.random()*100) + 130);
	tleft.style.animation = 'flap-lt '+ran+'ms ease-in 4 alternate';
	tright.style.animation = 'flap-rt '+ran+'ms ease-in 4 alternate';
	bleft.style.animation = 'flap-lb '+ran+'ms ease-in 4 alternate';
	bright.style.animation = 'flap-rb '+ran+'ms ease-in 4 alternate';

	top.appendChild(tleft); top.appendChild(tright);
	bottom.appendChild(bleft); bottom.appendChild(bright);
	butterfly.appendChild(top); butterfly.appendChild(bottom);
	parent.insertBefore(butterfly,parent.childNodes[0]);
}

function makeNfoButterfly( data, time ){
	var parent = document.getElementById('nfo-left');
	var butterfly = document.createElement('div');
		butterfly.className = "nfo-butterfly";
	var top = document.createElement('div');
		top.className = "top";
	var tleft = document.createElement('div');
		tleft.className = "left";
	var tright = document.createElement('div');
		tright.className = "right";
	var bottom = document.createElement('div');
		bottom.className = "bottom";
	var bleft = document.createElement('div');
		bleft.className = "left";
	var bright = document.createElement('div');
		bright.className = "right";

	var d = data.split(':');
	var r = parseInt( d[0], 16 );
	var g = parseInt( d[1], 16 );
	var b = parseInt( d[2], 16 );
	var col = "rgb("+r+","+g+","+b+")";
	tleft.style.background = tright.style.background = bleft.style.background = bright.style.background = col;

	var w = Math.floor(Math.map( parseInt( d[3], 16 ), 0,255, (cellWidth-50)/1.25,(cellWidth-50) )); 	
	var h = Math.floor(Math.map( parseInt( d[4], 16 ), 0,255, (cellHeight-50)/1.5,(cellHeight-50) ));	
	butterfly.style.width = w+"px";
	butterfly.style.height = h+"px";

	var rad3 = Math.map( parseInt( d[4], 16 ), 0,255, 64,113 );
	var rad4 = Math.map( parseInt( d[5], 16 ), 0,255, 3,18 );
	tleft.style.borderRadius = "0% "+Math.floor(rad3)+"% "+Math.floor(rad4)+"% 150%";
	tright.style.borderRadius = "150% "+Math.floor(rad4)+"% "+Math.floor(rad3)+"% 0%";

	tleft.style.animation = 'flap-lt 1000ms ease-in infinite alternate';
	tright.style.animation = 'flap-rt 1000ms ease-in infinite alternate';
	bleft.style.animation = 'flap-lb 1000ms ease-in infinite alternate';
	bright.style.animation = 'flap-rb 1000ms ease-in infinite alternate';

	top.appendChild(tleft); top.appendChild(tright);
	bottom.appendChild(bleft); bottom.appendChild(bright);
	butterfly.appendChild(top); butterfly.appendChild(bottom);
	parent.insertBefore(butterfly,parent.childNodes[0]);
}

function flapButterfly( id ){
	var b = document.getElementById( id );
	var t = Math.floor( (Math.random()*300) + 500);
	b.childNodes[0].childNodes[0].style.animation = "flap-lt 180ms ease-in infinite alternate";
	b.childNodes[0].childNodes[1].style.animation = "flap-rt 180ms ease-in infinite alternate";
	b.childNodes[1].childNodes[0].style.animation = "flap-lb 180ms ease-in infinite alternate";
	b.childNodes[1].childNodes[1].style.animation = "flap-rb 180ms ease-in infinite alternate";				
	setTimeout(function(){
		b.childNodes[0].childNodes[0].style.animation = "flap-lt 180ms ease-in 4 alternate";
		b.childNodes[0].childNodes[1].style.animation = "flap-rt 180ms ease-in 4 alternate";
		b.childNodes[1].childNodes[0].style.animation = "flap-lb 180ms ease-in 4 alternate";
		b.childNodes[1].childNodes[1].style.animation = "flap-rb 180ms ease-in 4 alternate";		
	},t);
}

function updatePositions(){
	var cols = Math.floor(window.innerWidth/cellWidth); 
	var pad = (window.innerWidth-(Math.floor(window.innerWidth/cellWidth)*cellWidth))/2;
	for (var i = 0; i < net.childNodes.length; i++) {
		net.childNodes[i].style.transition = "all "+(Math.random()*2)+0.5+"s ease"; // wtf, not working?
		var lStr = net.childNodes[i].style.left;
		var l = parseInt( lStr.substring(0,lStr.length-2) );					
		if( (l+cellWidth) > pad + cellWidth*(cols-1) ){
			var tStr = net.childNodes[i].style.top;
			var t = parseInt( tStr.substring(0,tStr.length-2) );
			net.childNodes[i].style.top = t + cellHeight + "px";
			net.childNodes[i].style.left = pad + "px";
		} else {
			net.childNodes[i].style.left = l + cellWidth + "px";
		}
		
	};
}

function getInfo( id ){
	var nfoR = document.getElementById('nfo-right');
	var nfoL = document.getElementById('nfo-left');
		nfoR.innerHTML = "";
		nfoL.innerHTML = "";
	$('#screen').fadeIn(500,function(){
		for (var i = 0; i < probeData.macs[id].knownNetworks.length; i++) {
			var div = document.createElement('div');
				div.className = "knownNetwork";
		        div.innerHTML = probeData.macs[id].knownNetworks[i];
			nfoR.appendChild(div);
		};
		var nfo = document.getElementById('nfo');
		nfo.onclick = function(){ $('#screen').fadeOut(500) }
		var scr33n = document.getElementById('screen');
		scr33n.onclick = function(){ $('#screen').fadeOut(500) };

		makeNfoButterfly( id );

		var mac = document.createElement('div');
			mac.innerHTML = id.toUpperCase();
			mac.className = "nfo-mac";
		nfoL.appendChild(mac);

		var ven = id.substr(0, 8).toUpperCase(); 
		var maker = document.createElement('div');
			for (var i = 0; i < vendor.mapping.length; i++) {
			    if (vendor.mapping[i].mac_prefix == ven){
			        maker.innerHTML = "made by "+ vendor.mapping[i].vendor_name;
			    }
			}
			maker.className = "nfo-mkr";
		nfoL.appendChild(maker);

		var time = document.createElement('div');
			time.innerHTML = "last seen on " +moment( parseInt(probeData.macs[id].lastSeen) ).format('MM/DD/YY  HH:mm');
			time.className = "nfo-time";
		nfoL.appendChild(time);

		
	});
}