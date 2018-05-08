const express = require('express');
const router = express.Router();
const fs = require('fs');

router.get('/', function(req, res) {
	const data = {
		graphic: fs.readFileSync('image.svg').toString()
	};
	res.render('index', data);
});

module.exports = router;
