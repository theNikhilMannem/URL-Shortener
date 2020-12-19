require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const dns = require('dns')
const urlParser = require('url')

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});



// Connecting to MongoDB
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

// Schema for URLs
const urlSchema = {
  original_url: { type: String, required: true },
  short_url: { type: String, required: true }
}

// Creating Model for the Schema
const Url = mongoose.model("Url", urlSchema)

// Using the Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: false }))

// console.log(mongoose.connection.readyState)

app.post("/api/shorturl/new", (req, res) => {
  console.log(urlParser.parse(req.body.url).hostname)

  dns.lookup(urlParser.parse(req.body.url).hostname, (err, address) => {
    console.log("address: "+address)
    if (address) {
      // if (true) {
      //   Url.findOne(
      //     { original_url: urlParser.parse(req.body.url).hostname },
      //     (err, url) => {
      //       if (err) return console.error()
      //     }
      //   )
      // }
      let url = new Url()
      url.original_url = req.body.url
      url.short_url = url._id.toString().slice(19)
      console.log(url)
      url.save()
      
      res.json({
        original_url: url.original_url,
        short_url: url.short_url
      })
    }
    else {
      res.json({
        error: "invalid url"
      })
    }
  })
})

app.get("/api/shorturl/:shorturl", (req, res, done) => {
  console.log(req.params)
  Url.findOne(
    { short_url: req.params.shorturl },
    (err, url) => {
      if (err) return done(err)
      
      res.redirect(url.original_url)
    }
  )
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
