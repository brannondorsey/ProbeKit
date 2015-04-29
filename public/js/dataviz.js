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
var modalSpeed = 300;

function makeButterfly( data, networks ){
	var ssidMatch = false;
	var ndata = data.substring(0,8);
	if (networks.constructor == Array) {
		for (var i = 0; i < networks.length; i++) {
			var check = filter.networks.indexOf(networks[i]) > -1
			if(check) ssidMatch = true;
		};
	} else {
		ssidMatch = filter.networks.indexOf(networks) > -1;
	}

	// if(!filt.stat || ssidMatch || filter.manufacturer == ndata){

		updatePositions(); // update responsive grid

		var parent = document.getElementById('net');
		var butterfly = document.createElement('div');			
			butterfly.className = "butterfly";
			butterfly.id = "_"+data;
			butterfly.onclick = function() { getInfo(data, networks) };

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

		updateButterflySize(butterfly, networks.length);
		
		butterfly.style.left = (window.innerWidth-(Math.floor(window.innerWidth/cellWidth)*cellWidth))/2 +"px";
		butterfly.style.top = "0px";

		var rad3 = Math.map( parseInt( d[3], 16 ), 0,255, 64,113 );
		var rad4 = Math.map( parseInt( d[4], 16 ), 0,255, 3,18 );
		tleft.style.webkitBorderRadius = "0% "+Math.floor(rad3)+"% "+Math.floor(rad4)+"% 150%";
		tright.style.webkitBorderRadius = "150% "+Math.floor(rad4)+"% "+Math.floor(rad3)+"% 0%";
		// tleft.style.borderRadius = "0% "+Math.floor(rad3)+"% "+Math.floor(rad4)+"% 150%";
		// tright.style.borderRadius = "150% "+Math.floor(rad4)+"% "+Math.floor(rad3)+"% 0%";

		var flapSpeed = Math.floor( Math.map( parseInt( d[5], 16 ), 0,255, 130,230 ) )
		// tleft.style.animation = 'flap-lt '+flapSpeed+'ms ease-in 4 alternate';
		// tright.style.animation = 'flap-rt '+flapSpeed+'ms ease-in 4 alternate';
		// bleft.style.animation = 'flap-lb '+flapSpeed+'ms ease-in 4 alternate';
		// bright.style.animation = 'flap-rb '+flapSpeed+'ms ease-in 4 alternate';
		tleft.style.webkiAnimation = 'flap-lt '+flapSpeed+'ms ease-in 4 alternate';
		tright.style.webkiAnimation = 'flap-rt '+flapSpeed+'ms ease-in 4 alternate';
		bleft.style.webkiAnimation = 'flap-lb '+flapSpeed+'ms ease-in 4 alternate';
		bright.style.webkiAnimation = 'flap-rb '+flapSpeed+'ms ease-in 4 alternate';

		top.appendChild(tleft); top.appendChild(tright);
		bottom.appendChild(bleft); bottom.appendChild(bright);
		butterfly.appendChild(top); butterfly.appendChild(bottom);
		parent.insertBefore(butterfly,parent.childNodes[0]);
	// }
}


// flap butterfly after it's already been created ( ie. when another proberequest from pre-existing MAC shows up ) ------------
function flapButterfly( id, ssid ){
	var nid = id.substring(0,8);
	// if( !filt.stat || filter.networks.indexOf(ssid) > -1 || filter.manufacturer.indexOf(nid) > -1 ){
		var b = document.getElementById( '_'+id );
		if (b) {
			var t = Math.floor( (Math.random()*300) + 500);
			b.childNodes[0].childNodes[0].style.animation = "flap-lt 180ms ease-in infinite alternate";
			b.childNodes[0].childNodes[1].style.animation = "flap-rt 180ms ease-in infinite alternate";
			b.childNodes[1].childNodes[0].style.animation = "flap-lb 180ms ease-in infinite alternate";
			b.childNodes[1].childNodes[1].style.animation = "flap-rb 180ms ease-in infinite alternate";
			b.childNodes[0].childNodes[0].style.webkitAnimation = "flap-lt 180ms ease-in infinite alternate";
			b.childNodes[0].childNodes[1].style.webkitAnimation = "flap-rt 180ms ease-in infinite alternate";
			b.childNodes[1].childNodes[0].style.webkitAnimation = "flap-lb 180ms ease-in infinite alternate";
			b.childNodes[1].childNodes[1].style.webkitAnimation = "flap-rb 180ms ease-in infinite alternate";
			setTimeout(function(){
				b.childNodes[0].childNodes[0].style.animation = "flap-lt 180ms ease-in 4 alternate";
				b.childNodes[0].childNodes[1].style.animation = "flap-rt 180ms ease-in 4 alternate";
				b.childNodes[1].childNodes[0].style.animation = "flap-lb 180ms ease-in 4 alternate";
				b.childNodes[1].childNodes[1].style.animation = "flap-rb 180ms ease-in 4 alternate";
				b.childNodes[0].childNodes[0].style.webkitAnimation = "flap-lt 180ms ease-in 4 alternate";
				b.childNodes[0].childNodes[1].style.webkitAnimation = "flap-rt 180ms ease-in 4 alternate";
				b.childNodes[1].childNodes[0].style.webkitAnimation = "flap-lb 180ms ease-in 4 alternate";
				b.childNodes[1].childNodes[1].style.webkitAnimation = "flap-rb 180ms ease-in 4 alternate";
			},t);
		}
	//}
}

// responsive layout animation -------------------------------------------------
// to-do: update the layout on window resize
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
window.onresize = function(e) {
    var macs = getFilteredMacs();
    $('#net').empty();
    if (macs.length > 0) {
		for (var i = 0; i < macs.length; i++) {
			makeButterfly( macs[i].mac, macs[i].knownNetworks );
		}
	}
};


// Butter fly that shows up inside the modal -------------------------
function makeNfoButterfly( data, networks ){
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

	updateButterflySize(butterfly, networks.length);

	butterfly.style.left = (window.innerWidth-(Math.floor(window.innerWidth/cellWidth)*cellWidth))/2 +"px";
	butterfly.style.top = "0px";

	var rad3 = Math.map( parseInt( d[3], 16 ), 0,255, 64,113 );
	var rad4 = Math.map( parseInt( d[4], 16 ), 0,255, 3,18 );
	tleft.style.borderRadius = "0% "+Math.floor(rad3)+"% "+Math.floor(rad4)+"% 150%";
	tright.style.borderRadius = "150% "+Math.floor(rad4)+"% "+Math.floor(rad3)+"% 0%";

	var flapSpeed = Math.map( parseInt( d[5], 16 ), 0,255, 800,1200 );
	$(tleft).css('animation','flap-lt '+flapSpeed+'ms ease-in 4 alternate');
	$(tright).css('animation', 'flap-rt '+flapSpeed+'ms ease-in 4 alternate');
	$(bleft).css('animation', 'flap-lb '+flapSpeed+'ms ease-in 4 alternate');
	$(bright).css('animation', 'flap-rb '+flapSpeed+'ms ease-in 4 alternate');
	// tleft.style.animation = 'flap-lt '+flapSpeed+'ms ease-in 4 alternate';
	// tright.style.animation = 'flap-rt '+flapSpeed+'ms ease-in 4 alternate';
	// bleft.style.animation = 'flap-lb '+flapSpeed+'ms ease-in 4 alternate';
	// bright.style.animation = 'flap-rb '+flapSpeed+'ms ease-in 4 alternate';
	// tleft.style.webkitAnimation = 'flap-lt '+flapSpeed+'ms ease-in 4 alternate';
	// tright.style.webkitAnimation = 'flap-rt '+flapSpeed+'ms ease-in 4 alternate';
	// bleft.style.webkitAnimation = 'flap-lb '+flapSpeed+'ms ease-in 4 alternate';
	// bright.style.webkitAnimation = 'flap-rb '+flapSpeed+'ms ease-in 4 alternate';

	top.appendChild(tleft); top.appendChild(tright);
	bottom.appendChild(bleft); bottom.appendChild(bright);
	butterfly.appendChild(top); butterfly.appendChild(bottom);
	parent.insertBefore(butterfly,parent.childNodes[0]);
}

// creates the modal, runs on click of a butterfly -------------------------------------------------------------------------
function getInfo( id, networks ){
	
	var nfoR = document.getElementById('nfo-right');
	var nfoL = document.getElementById('nfo-left');
		nfoR.innerHTML = "";
		nfoL.innerHTML = "";

	// left column
	makeNfoButterfly( id, networks );

	var mac = document.createElement('div');
		mac.innerHTML = id.toUpperCase();
		mac.className = "nfo-mac";
		mac.name = id;
	nfoL.appendChild(mac);

	var ven = id.substr(0, 8).toUpperCase();
	var maker = document.createElement('div');	
	    if (vendorDictionary && vendorDictionary.hasOwnProperty(ven)){
	        maker.innerHTML = "Made by "+ vendorDictionary[ven];
	        maker.name = vendorDictionary[ven];
	    }
		maker.className = "nfo-mkr";
		maker.onclick = function(){ filt.update('manufacturer', maker.name ); }
	nfoL.appendChild(maker);

	var time = document.createElement('div');
		time.innerHTML = "Last seen at " +moment( parseInt(probeData.macs[id].lastSeen) ).format('h:mm A M/D/YY');
		time.className = "nfo-time";
	nfoL.appendChild(time);

	var map = document.createElement('div');
	$.ajax({
		url: 'http://localhost:3000/api/wigle/hasgeo?device='+id+'&collection=wigleChicago',
	  	method: 'GET',
	  	success: function(data){
	  		if(data===true){
				map.innerHTML = '<a href="map.html?mac='+id+'">View migration patterns</a>';
	  		} else {
	  			map.style.color = "#aaa";
	  			map.style.fontStyle = "italic";
	  			map.innerHTML = 'Migration patterns unavailable';
	  		}
	  	},
	  	error: function(err){
	    	console.log(err);
	  	}
	});
	map.className = "nfo-time";
	nfoL.appendChild(map);

	// right column
	for (var i = 0; i < probeData.macs[id].knownNetworks.length; i++) {
		var nwrk = probeData.macs[id].knownNetworks[i];
		var div = document.createElement('div');
			div.className = "knownNetwork";
	        div.innerHTML = nwrk;
	        div.name = nwrk;
	        div.onclick = function(){ filt.update('network', this.name); }
		nfoR.appendChild(div);
	};

	$('#screen').fadeIn(modalSpeed,function(){
		// close
		document.getElementById('screen').onclick = function(){ $('#screen').fadeOut(modalSpeed) };
	});
}



function updateButterflySize(butterflyElement, numNetworks) {

	var numNets = (numNetworks <= 10) ? numNetworks : 10;
	var w = Math.floor(Math.map( numNets, 0,10, (cellWidth - 50) / 1.25, (cellWidth - 50)));
	var h = Math.floor(Math.map( numNets, 0,10, (cellHeight - 50) / 1.5, (cellHeight - 50)));
	switch(w){
		case 245: w=246; break;
		case 244: w=246; break;
		case 243: w=242; break;
		case 238: w=239; break;
		case 237: w=239; break;
		case 236: w=235; break;
		case 230: w=229; break;
		case 228: w=227; break;
		case 224: w=223; break;
		case 208: w=209; break;
		case 202: w=203; break;
	}
	butterflyElement.style.width = w + "px";
	butterflyElement.style.height = h + "px";
	butterflyElement.style.margin = (cellHeight - h) / 2 + "px " + (cellWidth - w) / 2 + "px";
}


// device and network modal views --------------------------------------------------------
$('#network-count-button').on('click', function(e){
	
	$('#nfo-left').empty();
	$('#nfo-right').empty();
	
	var html = "";
	var networks = _.sortBy(probeData.networks, function(n){ return n.toLowerCase() });

	for (var i = 0; i < networks.length; i++) {
		
		var network = networks[i];

		var div = document.createElement('div');
			div.className = "knownNetwork";
		    div.innerHTML = network;
		    div.name = network;
		    div.onclick = function(){ filt.update('network', this.name); }
			var container = (i % 2 == 0) ? "#nfo-left" : "#nfo-right";
			$(container).append(div);
	}

	$('#list-data').css({ "display": "block"});

	$('#screen').fadeIn(modalSpeed,function(){
		
		// close
		document.getElementById('screen').onclick = function(){ 
			$('#screen').fadeOut(modalSpeed);
		};
	});
});

// update filter menu -----------------------------------------------------------------
var filt = {
	stat: false,
	mktag: function(type, val){
		var input = document.getElementById('filterInput');
		if(input) $('#filterInput').remove();
		var f = document.getElementById('filtermenu');
		if(!this.stat){ f.innerHTML = "Filtering by "; }
		var s1 = document.createElement('span');
			s1.className = "filt-ntwrk";
			s1.id = "f_"+val;
			s1.innerHTML = val;
		var s2 = document.createElement('span');
			s2.className = "filt-x";
			s2.innerHTML = "ⓧ";
			s2.onclick = function(){ filt.update( type, val, true ) };
		s1.appendChild(s2);
		f.appendChild(s1);
	},
	mkinput: function(){
		var input = document.createElement('input');
			input.setAttribute('id','filterInput');
			input.setAttribute('placeholder','add tag');
			input.onchange = function(){ console.log('enter') };
		var f = document.getElementById('filtermenu');
			f.appendChild(input);
	},
	display:function(){
		var nl = filter.networks.length;
		var ml = filter.manufacturer.length;
		var ds = $('#filtermenu').css('display');
		if(nl>0 || ml>0){
			this.stat = true;
			if( ds=='none' ){ $('#filtermenu').slideDown(); }
		}
		else {
			this.stat = false;
			if( ds=='block' ){ $('#filtermenu').slideUp(); }
		}
	},
	update: function( type, val, remove){

		if(remove){

			var ele = document.getElementById("f_"+val);
			ele.parentNode.removeChild(ele); // remove filter tag from DOM

			if(type=='network'){
				var n = filter.networks.indexOf(val);
				filter.networks.splice(n,1); // update filter data
			}
			else if(type=='manufacturer'){
				filter.manufacturer="";
			}

			this.display();	// update menu display in DOM
			applyFilter();	// apply filter

		} else {

			var success = false;

			if(type=='network'){
				if (filter.networks.indexOf(val) == -1) {
					filter.networks.push( val ); // update filter data
					this.mktag('network',val);// add filter tag to DOM
					success = true;
				}
			}
			else if(type=='manufacturer'){
				if (val != filter.manufacturer) {
					filter.manufacturer = val;  // update filter data
					this.mktag('manufacturer',val );  // add filter tag to DOM
					success = true;
				}
			}

			if (success) {
				this.mkinput(); 
				applyFilter();	// apply filter data
				this.display(); // update menu display in DOM
			}
		}
	}
}

// custom fuilter input + autocomplete ----------------------
var inputFilt = {
	charCnt: 0,
	search: "",
	reset: function(){
		var f = document.getElementById('filterInput');
		inputFilt.search = f.value = "";
		inputFilt.charCnt = 0;
	},
	badInput: function(){
		var f = document.getElementById('filterInput');
		inputFilt.reset();
		document.getElementById('filterInput').style.border = "3px solid #c00";
		setTimeout(function(){
			document.getElementById('filterInput').style.border = "1px solid #ccc";
		},250);
		
	},
	setSelectionRange: function(input, selectionStart, selectionEnd) {
	  if (input.setSelectionRange) {
	    input.focus();
	    input.setSelectionRange(selectionStart, selectionEnd);
	  }
	  else if (input.createTextRange) {
	    var range = input.createTextRange();
	    range.collapse(true);
	    range.moveEnd('character', selectionEnd);
	    range.moveStart('character', selectionStart);
	    range.select();
	  }
	},
	setCaretToPos:function (input, pos) {
	  this.setSelectionRange(input, pos, pos);
	},
	autocomplete: function(data){
		var f = document.getElementById('filterInput');
		f.value = inputFilt.search;
		inputFilt.charCnt++;
		for (var i = 0; i < data.length; i++) {
			if(data[i].toLowerCase().lastIndexOf(f.value, 0) === 0){
				f.value = data[i];
			}
		};
		inputFilt.setCaretToPos(f, inputFilt.charCnt);
	},
	submit: function(data){
		var f = document.getElementById('filterInput');
		if( 
			$.inArray(f.value, filter.networks) < 0 &&
			f.value != null && f.value != undefined && f.value != "" &&
			$.inArray(f.value, data) >= 0 
		){
			filt.update('network', f.value);
			inputFilt.reset();
		} else {
			inputFilt.badInput();
		}
	}
}
document.onkeypress=function(event){
    var key = (event.keyCode ? event.keyCode : event.which);
    if(key == 13 && document.activeElement.id == "filterInput"){
    	$.ajax({
	      url: 'http://localhost:3000/api/networks',
	      method: 'GET',
	      success: inputFilt.submit,
	      error: function(err){
	        console.log(err);
	      }
	    });
    }
    else if(document.activeElement.id == "filterInput"){
    	inputFilt.search += String.fromCharCode(key);
		$.ajax({
	      url: 'http://localhost:3000/api/networks',
	      method: 'GET',
	      success: inputFilt.autocomplete,
	      error: function(err){
	        console.log(err);
	      }
	    });
    }
}
document.onkeydown=function(event){
    var key = (event.keyCode ? event.keyCode : event.which);
    if(key==8){
    	inputFilt.search = inputFilt.search.substring(0, inputFilt.search.length - 1);
    	inputFilt.charCnt-=2;
    	if (inputFilt.charCnt==0){ inputFilt.reset() }
    	else {
			$.ajax({
		      url: 'http://localhost:3000/api/networks',
		      method: 'GET',
		      success: inputFilt.autocomplete,
		      error: function(err){
		        console.log(err);
		      }
		    });    		
    	}

    }
}


