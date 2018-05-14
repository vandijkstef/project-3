{	

	let ws;
	const buttons = {};
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
			SetButtons();
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
			setTimeout(() => {
				Socket();
			}, 5000);
		};
		ws.onerror = () => {
			console.log('Woops, we got a Socket error.');
		};
	}

	const GetButtons = () => {
		buttons.feed = document.querySelector('button.feed');
		buttons.pump = document.querySelector('button.rain');
	};

	const SetButtons = () => {
		buttons.feed.addEventListener('click', () => {
			ws.send(SocketMessages.feed());
		});
		buttons.pump.addEventListener('click', () => {
			ws.send(SocketMessages.pump());
		});
	};

	// Standardize send socket messages
	const SocketMessages = {
		hi: () => {
			const hi = {
				action: 'CONTROL'
			};
			return JSON.stringify(hi);
		},
		feed: () => {
			const feed = {
				action: 'FEED'
			};
			return JSON.stringify(feed);
		},
		pump: () => {
			const pump = {
				action: 'PUMP'
			};
			return JSON.stringify(pump);
		}
	};

	document.addEventListener('DOMContentLoaded', () => {
		GetButtons();
		Socket();
	});
}