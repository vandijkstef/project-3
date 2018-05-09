const ws = require('ws').Server;

const soonFromLiveData = {
	date: '',
	amountFeeded: 0,
	reactionToFeeding: 0,
	harvestedFish: 0,
	harvestedGreens: 0,
	deadFish: 0,
	NH4: 0,
	NO2: 0,
	NO3: 0,
	ph: 7,
	iron: 0,
	PO4: 0,
	K: 0,
	CA: 0,
	waterTemp: 0,
	powerStatus: 0,
	waterAdded: 0
};

const soonFromHistoryData = {
	totalHarvestedFish: 0,
	totalHarvestedGreens: 0
}

const Setup = (server) => {
	const wss = new ws({server});
	wss.on('connection', (ws, req) => {
		// let clientID = uniqid();
		ws.on('message', (message) => {
			const msgData = JSON.parse(message);
			switch (msgData.action) {
			case 'HI':
			console.log('eehrm, hi?');
				// Say hello to the client, be nice
				if (msgData.error) {
					// But don't make the client wiser than it should be
				} else {
					// Register client in Memstore
					// clientID = msgData.id;
					// ws.client = clientID;
					// wsData.clients[clientID] = {};
					// wsData.clients[clientID].user = msgData;
					// delete wsData.toRemove[clientID];
				}
				// And broadcast that global data to all clients
				// WSbroadcast(JSON.stringify(wsData), ws, wss);
				break;
			default:
				ws.send('Not implemented');
				break;
			}
		});
	
		ws.on('close', () => {
			console.log('someone left');
		});
	});
};

const WSbroadcast = (data, ws, wss) => {
	wss.clients.forEach(function each(client) {
		if (client.readyState === ws.OPEN) {
			client.send(data);
		}
	});
};

module.exports = Setup;