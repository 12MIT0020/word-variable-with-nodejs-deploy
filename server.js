var express = require('express')
var path = require('path')
var fs = require('fs')
var http = require('http')
var app = express()
var port = process.env.PORT || 3000; 

//console.log (__dirname);	
	app.use(express.static(path.join(__dirname, 'public')));
	
	app.get('*', function (req, res) {
		//res.send('hello world')
   res.sendFile(path.join(__dirname + '/public', 'index.html'));
})

//app.use(express.static(path.join(__dirname+ '/public')));
//console.log(__dirname);
//app.use('/public',express.static(path.join(__dirname, 'public/')));
   http.createServer(function (request, response) {

   // Send the HTTP header 
   // HTTP Status: 200 : OK
   // Content Type: text/plain
   response.writeHead(200);
   
   // Send the response body as "Hello World"
  // response.end('Hello World\n');
}, app).listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

