{
	const states = {
		pump: true,
		feed: false
	};
	const svg = {};
	const side = {};
	document.addEventListener('DOMContentLoaded', function() {
		CSSPlugin.useSVGTransformAttr = false;

		LoadElements();

		// SetHoverInfo();

		AnimateLeaves();
		GiveLifeToFish(10);
		GrowFarm(.8);
		SetRain();

		SetInfoSide(false);

		Socket();
	});

	function LoadElements() {
		// SVG
		svg.svg = document.querySelector('svg');
		svg.svg.querySelector('title').innerHTML = '';
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
		svg.pump = document.querySelector('#pump');
		svg.pumpLight = document.querySelector('#pump circle:last-of-type');
		
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
					// ease: Power0.easeOut,
					transformOrigin: transformOrigin,
					rotation: -Math.random() * 7
				}, {
					// ease: Power0.easeOut,
					transformOrigin: transformOrigin,
					rotation: Math.random() * 7
				});
			});
		});
	}

	function GiveLifeToFish(amount) {
		svg.fish.forEach(function(fish, i) {
			if (i < amount) {
				MoveFish(fish);
			} else {
				fish.style.display = 'none';
			}
		});
	}

	function MoveFish(fish) {
		let timeout = 2;
		const xPos = Math.random()*600;
		let yPos = Math.random()*250*-1;
		if (states.feed) {
			yPos = -300 + Math.random() * 50;
		}
		fish.tlMove = new TimelineMax({

		});
		const moveData = {
			x: xPos,
			y: yPos,
			// ease: Power2.easeOut // This proves to be too intensive
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
			fish.tlMove.to(fish, .4, {rotationY: rotationY, transformOrigin: '50% 50%'});
			movementX = Math.abs(movementX);
			const movementY = Math.abs((curY - yPos) * -1);
			const movement = movementX + movementY;
			timeout = movement / 100;
			fish.tlMove.to(fish, timeout, moveData, '-=.4');
		} else {
			fish.tlMove.to(fish, timeout, moveData);
		}
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
				// repeat: -1,
				delay: Math.random(),
				repeatDelay: Math.random(),
				onCompleteParams: ['{self}'],
				onComplete: shouldIRain
			});
			drop.tlRain.to(drop, 1, {
				y: 450,
				// ease: Power1.easeIn,
				opacity: 0
			});
		});
		svg.pumpLight.style.fill = '#00FF00';
	}

	function shouldIRain(tl) {
		if (states.pump) {
			tl.play(0);
		} else {
			svg.pumpLight.style.fill = '#000000';
		}
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

	function SetLight(value) {
		const light = (value / 20000) / 2 + .6;
		svg.svg.style.filter = `brightness(${light})`;
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
				} else if (data.action === 'FEED') {
					states.feed = true;
					setTimeout(() => {
						states.feed = false;
					}, 10000);
				} else if (data.action === 'PUMP') {
					states.pump = !states.pump;
					if (states.pump) {
						// SetRain();
						svg.rain.forEach(function(drop) {
							shouldIRain(drop.tlRain);
						});
					}
				} else if (data.action === 'LIGHT') {
					SetLight(data.value);
				} else if (data.data) {
					SetLight(data.data.live.light);
				}else {
					// UpdateUI(data);
					console.log('smth funky here');
				}
			}
		};
		ws.onclose = () => {
			console.log('Socket connection closed, retrying');
			// UIOffline();
			setTimeout(() => {
				Socket();
			}, 5000);
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