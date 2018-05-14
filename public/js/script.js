{
	const svg = {};
	const side = {};
	document.addEventListener('DOMContentLoaded', function() {
		LoadElements();

		SetHoverInfo();

		AnimateLeaves();
		GiveLifeToFish();
		GrowFarm(.8);
		SetRain();

		SetInfoSide(false);

		Socket();
	});

	function LoadElements() {
		// SVG
		svg.fishtank = document.querySelector('#fishbucket');
		svg.sidetank = document.querySelector('#otherbucket');
		svg.farm = document.querySelector('#farm');
		svg.farmpots = document.querySelectorAll('#pot, [data-name=pot]');
		svg.pots = [];
		svg.farmpots.forEach(function(pot, i) {
			const newPot = {
				group: pot,
				leaveGroup: pot.querySelector('#leaves, [data-name=leaves]'), // TODO: put leaves in group
				leaves: pot.querySelectorAll('#leave, [data-name=leave]')
			};
			svg.pots[i] = newPot;
		});
		svg.fish = document.querySelectorAll('#Fish, [data-name=Fish]');
		svg.rain = document.querySelectorAll('#rain rect');
		
		// Side
		side.meta = document.querySelector('.meta');
		side.info = document.querySelector('.info');
	}

	function SetHoverInfo() {
		svg.fishtank.addEventListener('mouseover', function() {
			SetInfoSide(true, `
			<h2>Vissentank</h2>
			<p>Dit is de tank met vissen. We voeren ze iedere dag. Via hun uitwerpselen produceren deze vissen ammoniak.</p>
			`);
		}, false);
		svg.fishtank.addEventListener('mouseleave', SetMeta);
		svg.sidetank.addEventListener('mouseover', function() {
			SetInfoSide(true, `
			<h2>Biotank</h2>
			<p>In deze tank wordt de ammoniak door bacterien omgezet naar nitraat. Het water met de nitraten wordt vervolgens naar boven gepompt en dient als voeding voor de planten.</p>
			`);
		}, false);
		svg.sidetank.addEventListener('mouseleave', SetMeta);
		svg.farm.addEventListener('mouseover', function() {
			SetInfoSide(true, `
			<h2>Kas</h2>
			<p>Hier groeit het voedsel. Het overtollige water vloeit weer terug in de vissentank.</p>
			`);
		}, false);
		svg.farm.addEventListener('mouseleave', SetMeta);
	}

	function AnimateLeaves() {
		svg.pots.forEach(function(pot) {
			pot.leaves.forEach(function(leaf, i) {
				leaf.tlAnim = new TimelineMax({
					repeat: -1,
					yoyo: true
				});
				let transformOrigin = '100% 100%';
				if (i == 0 || i == 1) {
					transformOrigin = '0 100%';
				}
				leaf.tlAnim.fromTo(leaf, Math.random()*2+1, {
					ease: Power0.easeOut,
					transformOrigin: transformOrigin,
					rotation: -Math.random() * 7
				}, {
					ease: Power0.easeOut,
					transformOrigin: transformOrigin,
					rotation: Math.random() * 7
				});
			});
		});
	}

	function GiveLifeToFish() {
		svg.fish.forEach(function(fish) {
			console.log(fish);
			MoveFish(fish);
		});
	}

	function MoveFish(fish) {
		let timeout = 2;
		const xPos = Math.random()*600;
		const yPos = Math.random()*250*-1;
		const tl = new TimelineMax({

		});
		CSSPlugin.useSVGTransformAttr = false;
		const moveData = {
			x: xPos,
			y: yPos,
			ease: Power2.easeOut
		};
		if (fish._gsTransform) {
			const curX = fish._gsTransform.x;
			const curY = fish._gsTransform.y;
			let movementX = (curX - xPos) * -1;
			let rotationY;
			if (movementX < 0) {
				rotationY = -180;
			} else {
				rotationY = 0;
			}
			tl.to(fish, .4, {rotationY: rotationY, transformOrigin: '50% 50%'});
			movementX = Math.abs(movementX);
			const movementY = Math.abs((curY - yPos) * -1);
			const movement = movementX + movementY;
			timeout = movement / 100;
		}
		tl.to(fish, timeout, moveData, '-=.4');
		setTimeout(function() {
			MoveFish(fish);
		}, (timeout + Math.random() + .5) * 1000);
	}

	// Grow the farm, based on a value of 0-1 (up to 2 should be possible, overgrowth alert)
	function GrowFarm(value) {
		svg.pots.forEach(function(pot) {
			if (pot.leaveGroup) {
				pot.tlGrow = new TimelineMax({
					
				});
				pot.tlGrow.to(pot.leaveGroup, 2, {scale: value, transformOrigin: '50% 100%'});
			}
		});
	}

	function SetRain() {
		svg.rain.forEach(function(drop) {
			drop.tlRain = new TimelineMax({
				repeat: -1,
				delay: Math.random(),
				repeatDelay: Math.random()
			});
			drop.tlRain.to(drop, 1, {y: 500, ease: Power1.easeIn, opacity: 0});
		});
	}

	function PauseRain() {
		svg.rain.forEach(function(drop) {
			drop.tlRain.pause();
		});
	}

	function SetMeta() {
		SetInfoSide(false);
	}

	function SetInfoSide(info, content = '') {
		if (info) {
			side.info.classList.remove('hidden');
			side.meta.classList.add('hidden');
			side.info.innerHTML = content;
		} else {
			side.info.classList.add('hidden');
			side.meta.classList.remove('hidden');
		}
	}

	let ws;
	function Socket() {
		if ('WebSocket' in window) {
			DoSocket();			
		}
	}
	
	function DoSocket() {
		console.log('Starting Client Websocket');
		let host = location.origin.replace(/^http/, 'ws');
		ws = new WebSocket(host);
		ws.onopen = () => {
			ws.send(SocketMessages.hi());
		};
		ws.onmessage = (e) => {
			let data;
			try {
				data = JSON.parse(e.data);
				console.log(data);			
			} catch(err) {
				console.warn('We didn\'t receive an object', e.data);
			} finally {
				if (data.action === 'MESSAGE') {
					// HandleIncomingMessage(data);
					console.log('message');
				} else {
					// UpdateUI(data);
					console.log('smth funky here');
				}
			}
		};
		ws.onclose = () => {
			console.log('Socket connection closed, retrying');
			// UIOffline();
		};
		ws.onerror = () => {
			console.log('Woops, we got a Socket error.');
		};
	}
	
	// Standardize send socket messages
	const SocketMessages = {
		hi: () => {
			const hi = {
				action: 'HI'
			};
			return JSON.stringify(hi);
		}
	};
	
}