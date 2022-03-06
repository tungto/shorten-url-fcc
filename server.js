require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { default: mongoose } = require('mongoose');
const { json } = require('express/lib/response');
const dns = require('dns');
const urlParser = require('url');

const app = express();

const port = process.env.PORT || 3000;

mongoose.connect(process.env.DB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const schema = new mongoose.Schema({
	url: String,
});
const Url = mongoose.model('Url', schema);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) => {
	res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', async function (req, res) {
	const bodyUrl = req.body.url;

	dns.lookup(urlParser.parse(bodyUrl).hostname, (error, address) => {
		if (!address) {
			res.json({ error: 'Invalid URl' });
		} else {
			const url = new Url({
				url: bodyUrl,
			});

			url.save((err, data) => {
				res.json({ original_url: data.url, short_url: data.id });
			});
		}
		console.log('dns', error);
		console.log(address);
	});
});

app.get('/api/shorturl/:id', (req, res) => {
	const id = req.params.id;
	console.log(id);
	Url.findById(id, (error, data) => {
		if (!data) {
			res.json({ error: 'Invalid Url' });
		} else {
			console.log(data);
			res.redirect(data.url);
		}
	});
});

app.listen(port, function () {
	console.log(`Listening on port ${port}`);
});
