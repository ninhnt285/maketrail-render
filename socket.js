var net = require('net');
var worker = require('./worker2');
var checker = require('./checker');

var HOST = '45.32.216.6';
var PORT = 6969;

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function(sock) {

  // We have a connection - a socket object is assigned to the connection automatically
  console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
  // sock.setEncoding('utf8');
  // Add a 'data' event handler to this instance of socket
  checker.sock = sock;
  var data = '';
  sock.on('data', function(chunk) {
    if (chunk.toString() === 'end'){
      try {
        obj = JSON.parse(data);
        // console.log(obj);
        worker.solve(obj);
      } catch (e){

      }
    }
    data += chunk;
  });

  sock.on('end', function() {
    // worker.solve(obj);
  });

  // Add a 'close' event handler to this instance of socket
  sock.on('close', function(data) {
    console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
  });

  sock.on('error', function(err) {
    console.log('CLOSED: ' + err);
  });

}).listen(PORT, HOST);

worker.init();
console.log('Server listening on ' + HOST +':'+ PORT);
checker.start();