{
	const svg = {};
	document.addEventListener('DOMContentLoaded', function() {
		console.log('loaded');
		// console.log(TimelineMax({}));
		LoadElements();
		AnimateLeaves();
		GiveLifeToFish();
		Socket();
		console.log(svg);
	});

	function LoadElements() {
		svg.fishtank = document.querySelector('#fishbucket');
		svg.sidetank = document.querySelector('#otherbucket');
		svg.farmpots = document.querySelectorAll('#pot, [data-name=pot]');
		svg.pots = [];
		svg.farmpots.forEach(function(pot, i) {
			const newPot = {
				group: pot,
				leaveGroup: '', // TODO: put leaves in group
				leaves: pot.querySelectorAll('#leave, [data-name=leave]')
			};
			svg.pots[i] = newPot;
		});
		svg.fish = document.querySelectorAll('#Fish')
		
	}

	function AnimateLeaves() {
		svg.pots.forEach(function(pot) {
			pot.leaves.forEach(function(leaf, i) {
				const tl = new TimelineMax({
					repeat: -1,
					yoyo: true
				});
				let transformOrigin = '100% 100%'
				if (i == 0 || i == 1) {
					transformOrigin = '0 100%';
				}
				tl.fromTo(leaf, Math.random()*2+1, {
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
		const timeout = 2;
		const tl = new TimelineMax({

		});
		tl.to(fish, timeout, {x: 600, y: -250});
		setTimeout(function() {
			DoneMove(fish);
		}, timeout * 1000);
	}

	function DoneMove(a, b, c) {
		console.log(a, b, c);
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
		},
		register: (element) => {
			const value = element.querySelector('select[name=name]').value;
			return `REGISTER;ELEMENT:${value};`;
		},
		message: (form) => {
			const msg = {
				action: 'MESSAGE',
				text: form.querySelector('input[name=message]').value,
				sendBy: form.querySelector('input[name=you]').value,
				for: form.querySelector('input[name=other]').value
			};
			return JSON.stringify(msg);
		}
	};
	
}