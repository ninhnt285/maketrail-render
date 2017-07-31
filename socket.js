var net = require('net');
var worker = require('./worker');
var checker = require('./checker');

var HOST = 'localhost';
var PORT = 6969;

try {
  const client = new net.Socket();
  var data = '';
  client.connect(PORT, HOST, () => {
    console.log('Connected');
    client.write(JSON.stringify({ id: '647d1cd00000000000000001', url:'http://localhost:4001/resources/video/2017/7/0899788346622364474512e4c1b644a3.mp4'}));
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
  // checker.start();
} catch (e) {
  console.log(e);
}
