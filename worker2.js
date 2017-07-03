var spawn = require('child_process').spawn;

var checker = require('./checker');
var fs = require('fs');
var path = require('path');

const worker = {};
worker.QUEUE = [];
worker.FLAG = 3;

worker.init = function () { 
  worker.LOCATION_EXE = path.join(__dirname, 'execution/location_ps/templater.ps1 -m');
  worker.INTRO_EXE = path.join(__dirname, 'execution/intro_ps/templater.ps1 -m');
  worker.COMBINED_EXE = path.join(__dirname, 'execution/combined_ps/templater.ps1 -m');
  worker.LOCATION_OPTS = path.join(__dirname, 'execution/location_ps/templater-options.json');
  worker.INTRO_OPTS = path.join(__dirname, 'execution/intro_ps/templater-options.json');
  worker.COMBINED_OPTS = path.join(__dirname, 'execution/combined_ps/templater-options.json');
  worker.LOCATION_DATA = path.join(__dirname, 'execution/location_ps/location.json');
  worker.INTRO_DATA = path.join(__dirname, 'execution/intro_ps/intro.json');
  worker.COMBINED_DATA = path.join(__dirname, 'execution/combined_ps/combined.json');
  worker.LOCATION_TEMPLATE = path.join(__dirname, 'execution/location_ps/Location Slideshow.aep');
  worker.INTRO_TEMPLATE = path.join(__dirname, 'execution/intro_ps/Intro Scene.aep');
  worker.COMBINED_TEMPLATE = path.join(__dirname, 'execution/combined_ps/Combined Scenes.aep');
  worker.COMBINED_TEMPLATE_10 = path.join(__dirname, 'execution/combined_ps/Combined Scenes 10.aep');
  worker.COMBINED_TEMPLATE_9 = path.join(__dirname, 'execution/combined_ps/Combined Scenes 9.aep');
  worker.COMBINED_TEMPLATE_8 = path.join(__dirname, 'execution/combined_ps/Combined Scenes 8.aep');
  worker.COMBINED_TEMPLATE_7 = path.join(__dirname, 'execution/combined_ps/Combined Scenes 7.aep');
  worker.COMBINED_TEMPLATE_6 = path.join(__dirname, 'execution/combined_ps/Combined Scenes 6.aep');
  worker.COMBINED_TEMPLATE_5 = path.join(__dirname, 'execution/combined_ps/Combined Scenes 5.aep');
  worker.COMBINED_TEMPLATE_4 = path.join(__dirname, 'execution/combined_ps/Combined Scenes 4.aep');

  try {
    // init location options file
    var obj = JSON.parse(fs.readFileSync(this.LOCATION_OPTS, 'utf8'));
    obj.log_location = path.join(__dirname, 'log');
    obj.data_source = this.LOCATION_DATA;
    obj.aep = this.LOCATION_TEMPLATE;
    obj.source_footage = path.join(__dirname, 'footage');
    obj.output_location = path.join(__dirname, 'output/Output');
    fs.writeFileSync(this.LOCATION_OPTS, JSON.stringify(obj), 'utf8');

    // init intro options file
    var obj2 = JSON.parse(fs.readFileSync(this.INTRO_OPTS, 'utf8'));
    obj2.log_location = path.join(__dirname, 'log');
    obj2.data_source = this.INTRO_DATA;
    obj2.aep = this.INTRO_TEMPLATE;
    obj2.source_footage = path.join(__dirname, 'footage');
    obj2.output_location = path.join(__dirname, 'output/Output');
    fs.writeFileSync(this.INTRO_OPTS, JSON.stringify(obj2), 'utf8');

    // init combined options file
    var obj3 = JSON.parse(fs.readFileSync(this.COMBINED_OPTS, 'utf8'));
    obj3.log_location = path.join(__dirname, 'log');
    obj3.data_source = this.COMBINED_DATA;
    obj3.aep = this.COMBINED_TEMPLATE;
    obj3.source_footage = path.join(__dirname, 'output/Output');
    obj3.output_location = path.join(__dirname, 'output/Output');
    fs.writeFileSync(this.COMBINED_OPTS, JSON.stringify(obj3), 'utf8');

    setTimeout(start, 15000);
  } catch (e){
    console.log('Init worker error!');
    console.log(e);
  }
};

const start = function () {
  console.log("Render queue: "+ worker.QUEUE.length);
  if (worker.QUEUE.length > 0 && worker.FLAG > 0){
    job2 = worker.QUEUE.shift();
    worker.FLAG--;
    process(job2);
  }
  setTimeout(start, 15000);
};

const process = function (job) {
  var cmd = worker.INTRO_EXE;
  var file = worker.INTRO_DATA;
  var input = path.join(__dirname, 'output/Output', 'intro_'+job.data[0].output+'.mov');
  var output = path.join(__dirname, 'output/Output', 'intro_'+job.data[0].output+'_done.mov');
  if (job.type === 'location') {
    cmd = worker.LOCATION_EXE;
    file = worker.LOCATION_DATA;
    input = path.join(__dirname, 'output/Output', 'location_'+job.data[0].output+'.mov');
    output = path.join(__dirname, 'output/Output', 'location_'+job.data[0].output+'_done.mov');
  }
  fs.writeFileSync(file, JSON.stringify(job.data), 'utf8');
  var child = spawn('powershell.exe',[cmd]);
  child.on("exit",function(code){
    if (code !== 0) {
      console.log('Fail!');
      worker.QUEUE.push(job);
    }
    worker.FLAG++;
    fs.rename(input, output);
    console.log(job.type + " has been rendered!");
  });
};

const getTemplate = function (num){
  switch (num){
    case 10: return worker.COMBINED_TEMPLATE_10;
    case 9: return worker.COMBINED_TEMPLATE_9;
    case 8: return worker.COMBINED_TEMPLATE_8;
    case 7: return worker.COMBINED_TEMPLATE_7;
    case 6: return worker.COMBINED_TEMPLATE_6;
    case 5: return worker.COMBINED_TEMPLATE_5;
    case 4: return worker.COMBINED_TEMPLATE_4;
    default: return worker.COMBINED_TEMPLATE;
  }
  return worker.COMBINED_TEMPLATE;
};

worker.solve = function (tripData) {
  var intro = [{
    output: tripData.id,
    name: tripData.name,
    direction: tripData.direction,
    image: tripData.intro,
    time: tripData.time
  }];
  worker.QUEUE.push({ type: 'intro', data: intro });
  var i = 1;
  tripData.locations.forEach(function(location) {
    worker.QUEUE.push({ type: 'location', data: [{
      output: tripData.id + '_' + i++,
      name: location.name,
      temperature: location.temperature,
      height: location.height,
      image1: location.image1,
      image2: location.image2,
      image3: location.image3,
      image4: location.image4,
      image5: location.image5
    }] });
  });
  var combined = [{
    output: tripData.id,
    intro: 'intro_' + tripData.id + '_done.mov'
  }];
  combined[0].template = getTemplate(tripData.locations.length);
  if (tripData.locations[0]) combined[0].location1 = 'location_' + tripData.id + '_1' + '_done.mov';
  if (tripData.locations[1]) combined[0].location2 = 'location_' + tripData.id + '_2' + '_done.mov';
  if (tripData.locations[2]) combined[0].location3 = 'location_' + tripData.id + '_3' + '_done.mov';
  if (tripData.locations[3]) combined[0].location4 = 'location_' + tripData.id + '_4' + '_done.mov';
  if (tripData.locations[4]) combined[0].location5 = 'location_' + tripData.id + '_5' + '_done.mov';
  if (tripData.locations[5]) combined[0].location6 = 'location_' + tripData.id + '_6' + '_done.mov';
  if (tripData.locations[6]) combined[0].location7 = 'location_' + tripData.id + '_7' + '_done.mov';
  if (tripData.locations[7]) combined[0].location8 = 'location_' + tripData.id + '_8' + '_done.mov';
  if (tripData.locations[8]) combined[0].location9 = 'location_' + tripData.id + '_9' + '_done.mov';
  if (tripData.locations[9]) combined[0].location10 = 'location_' + tripData.id + '_10' + '_done.mov';
  if (tripData.locations[10]) combined[0].location11 = 'location_' + tripData.id + '_11' + '_done.mov';
  checker.push(combined);
};

module.exports = worker;