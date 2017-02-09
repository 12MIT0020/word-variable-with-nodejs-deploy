var express = require('express')
var path = require('path')
var fs = require('fs')
var https = require('https')
var app = express()
var port = process.env.PORT || 3000; 

//console.log (__dirname);	
		
	app.get('/', function (req, res) {
		//res.send('hello world')
   res.sendFile(path.join(__dirname + '/public/index.html'));
})

//app.use(express.static(path.join(__dirname+ '/public')));
//console.log(__dirname);
//app.use('/public',express.static(path.join(__dirname, 'public/')));
app.use(express.static(path.join(__dirname, 'public')));


   https.createServer({
      key: fs.readFileSync('ssl/83507518-localhost_3009.key'),
      cert: fs.readFileSync('ssl/83507518-localhost_3009.cert')
    }, app).listen(port);

