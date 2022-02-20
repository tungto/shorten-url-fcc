const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');
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

app.post('/shortUrls', async (req, res) => {
	const fullUrl = req.body.fullUrl;
	if (validUrl.isUri(fullUrl)) {
		await ShortUrl.create({ full: req.body.fullUrl });

		res.redirect('/');
	} else {
		res.send('Invalid url');
	}
});

app.get('/:shortUrl', async (req, res) => {
	const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
	if (shortUrl == null) return res.sendStatus(404);

	shortUrl.clicks++;
	shortUrl.save();

	res.redirect(shortUrl.full);
});

app.listen(process.env.PORT || 3000);
