// ☕️️️️ for Alex!
const amqp  = require('amqplib');
amqp.connect('amqp://consumer:zHJR6WPpgUDLt5cF@rabbit.spectral.energy/')
	.then(function(conn) {
		process.once('SIGINT', function() {
			conn.close();
		});
		return conn.createChannel().then(function(channel) {
			channel.assertExchange('aquaponics', 'topic', { durable: true })
				.then(() => {
					let queue = channel.assertQueue('', { exclusive: true });
					queue = queue.then((_queue) => {
						channel.bindQueue(_queue.queue, 'aquaponics', 'deceuvel');
						return channel.consume(
							_queue.queue,
							(msg) => {
								UpdateLiveData(JSON.parse(msg.content.toString()));
							},
							{ noAck: true }
						);
					});
					return queue.then(() => {
						// Silence is golden
					});
				});
		});
	});

const ws = require('ws').Server;
let wss;

const live = {
	date: '',
	time: '',
	// amountFeeded: 0,
	// reactionToFeeding: 0,
	// harvestedFish: 0,
	// harvestedGreens: 0,
	// harvestedHerbs: 0,
	// deadFish: 0,
	// NH4: 0,
	// NO2: 0,
	// NO3: 0,
	ph: 7,
	// iron: 0,
	// PO4: 0,
	// K: 0,
	// CA: 0,
	waterTemp: 0,
	// powerStatus: 0,
	// waterAdded: 0,
	mscm2: 0,
	roomTemp: 0,
	light: 0,
};

const history = {
	totalHarvestedFish: 0,
	totalHarvestedGreens: 0
};

const data = {
	live: live,
	history: history
}

const UpdateLiveData = (newData) => {
	UpdateLiveValue('ph', newData.ph);
	UpdateLiveValue('mscm2', newData.mscm2);
	UpdateLiveValue('waterTemp', newData.water_temp);
	UpdateLiveValue('roomTemp', newData.room_temp);
	UpdateLiveValue('light', newData.lux, SetLight);
	UpdateLiveValue('date', newData.date);
	UpdateLiveValue('time', newData.time);
	console.log(newData.lux);
}

const SetLight = () => {
	console.log('broadcasting light');
	WSbroadcast(JSON.stringify({
		action: 'LIGHT',
		value: live.light
	}), ws, wss);
}

const UpdateLiveValue = (dataKey, newValue, action) => {
	if (newValue !== live[dataKey]) {
		live[dataKey] = newValue;
		if (action) {
			action();
		}
		return true;
	} else {
		return false;
	}
}

const Setup = (server) => {
	wss = new ws({server});
	wss.on('connection', (ws, req) => {
		// let clientID = uniqid();
		ws.on('message', (message) => {
			const msgData = JSON.parse(message);
			switch (msgData.action) {
			case 'HI':
				console.log('client connected');
				ws.send(JSON.stringify({data: data}))
				break;
			case 'CONTROL':
				console.log('controller connected');
				ws.send(JSON.stringify({message: 'Hello controller'}));
				break;
			case 'FEED':
			case 'PUMP':
				console.log('feed command received');
				WSbroadcast(JSON.stringify({action: msgData.action}), ws, wss);
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
		client.send(data);
	});
};

module.exports = Setup;