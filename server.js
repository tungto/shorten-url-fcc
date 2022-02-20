const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');
const shortId = require('shortid');
const app = express();

mongoose.connect(
	'mongodb+srv://tungto:1@cluster0.zzoig.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}
);
const validUrl = require('valid-url');
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.get('/', async (req, res) => {
	const shortUrls = await ShortUrl.find();

	res.render('index', { shortUrls: shortUrls });
});

app.post('/api/shorturl', async (req, res) => {
	const fullUrl = req.body.fullUrl;
	if (validUrl.isUri(fullUrl)) {
		const url = {
			original_url: req.body.fullUrl,
			short_url: shortId.generate(),
		};
		await ShortUrl.create(url);
		res.json(url);
	} else {
		res.send('Invalid url');
	}
});

app.get('/api/shortUrl/:shortUrl', async (req, res) => {
	const shortUrl = await ShortUrl.findOne({ short_url: req.params.shortUrl });
	if (shortUrl == null) return res.sendStatus(404);

	shortUrl.clicks++;
	shortUrl.save();

	res.redirect(shortUrl.original_url);
});

app.listen(process.env.PORT || 3000);
