var net = require('net');
var worker = require('./worker');
var checker = require('./checker');

var HOST = '127.0.0.1';
var PORT = 6969;

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function(sock) {

  // We have a connection - a socket object is assigned to the connection automatically
  console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);

  // Add a 'data' event handler to this instance of socket
  sock.on('data', function(data) {

    // Write the data back to the socket, the client will receive it as data from the server
    obj = JSON.parse(data);
    worker.solve(obj);
    sock.write(obj.id);

  });

  // Add a 'close' event handler to this instance of socket
  sock.on('close', function(data) {
    console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
  });

}).listen(PORT, HOST);

worker.init();
console.log('Server listening on ' + HOST +':'+ PORT);
checker.start();