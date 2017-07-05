var net = require('net');
var worker = require('./worker2');
var checker = require('./checker');

var HOST = '45.32.93.22';
var PORT = 6969;

try {
  const client = new net.Socket();
  var data = '';
  client.connect(PORT, HOST, () => {
    console.log('Connected');
	checker.sock = client;
  });
  client.on('error', (err) => {
    console.log(err);
  });
  client.on('data', (chunk) => {
    if (chunk.toString() === 'end'){
      try {
        obj = JSON.parse(data);
        // console.log(obj);
        worker.solve(obj);
		data = '';
      } catch (e){
      }
    }
    data += chunk;
  });
  worker.init();
  checker.start();
} catch (e) {
  console.log(e);
}
