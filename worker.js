var spawn = require('child_process').spawn;

var checker = require('./checker');
var fs = require('fs');
var path = require('path');

const worker = {};

worker.init = function () {
  worker.LOCK = false;
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
  try {
    // init location options file
    var obj = JSON.parse(fs.readFileSync(this.LOCATION_OPTS, 'utf8'));
    obj.log_location = path.join(__dirname, 'log');
    obj.data_source = this.LOCATION_DATA;
    obj.aep = this.LOCATION_TEMPLATE;
    obj.source_footage = path.join(__dirname, 'footage');
    obj.output_location = path.join(__dirname, 'output');
    fs.writeFileSync(this.LOCATION_OPTS, JSON.stringify(obj), 'utf8');

    // init intro options file
    var obj2 = JSON.parse(fs.readFileSync(this.INTRO_OPTS, 'utf8'));
    obj2.log_location = path.join(__dirname, 'log');
    obj2.data_source = this.INTRO_DATA;
    obj2.aep = this.INTRO_TEMPLATE;
    obj2.source_footage = path.join(__dirname, 'footage');
    obj2.output_location = path.join(__dirname, 'output');
    fs.writeFileSync(this.INTRO_OPTS, JSON.stringify(obj2), 'utf8');

    // init combined options file
    var obj3 = JSON.parse(fs.readFileSync(this.COMBINED_OPTS, 'utf8'));
    obj3.log_location = path.join(__dirname, 'log');
    obj3.data_source = this.COMBINED_DATA;
    obj3.aep = this.COMBINED_TEMPLATE;
    obj3.source_footage = path.join(__dirname, 'output/Output');
    obj3.output_location = path.join(__dirname, 'output/Output');
    fs.writeFileSync(this.COMBINED_OPTS, JSON.stringify(obj3), 'utf8');
  } catch (e){
    console.log('Init worker error!');
    console.log(e);
  }
};

worker.solve = function (tripData) {
  var intro = [{
    output: tripData.id,
    name: tripData.name,
    direction: tripData.direction,
    image: tripData.intro,
    time: tripData.time
  }];
  fs.writeFileSync(this.INTRO_DATA, JSON.stringify(intro), 'utf8');
  child = spawn('powershell.exe',[this.INTRO_EXE]);
  child.on("exit",function(){
    console.log("Intro has been added to queue!");
  });
  var i = 1;
  var locations = tripData.locations.map(function(location) {
    return {
      output: tripData.id + '_' + i++,
      name: location.name,
      temperature: location.temperature,
      height: location.height,
      image1: location.image1,
      image2: location.image2,
      image3: location.image3,
      image4: location.image4,
      image5: location.image5
    };
  });
  fs.writeFileSync(this.LOCATION_DATA, JSON.stringify(locations), 'utf8');
  child2 = spawn('powershell.exe',[this.LOCATION_EXE]);
  child2.on("exit",function(){
    console.log("Locations have been added to queue!");
  });
  var combined = [{
    output: tripData.id,
    intro: 'intro_' + tripData.id + '.mp4'
  }];
  if (locations[0]) combined[0].location1 = 'location_' + locations[0].output + '.mp4';
  if (locations[1]) combined[0].location2 = 'location_' + locations[1].output + '.mp4';
  if (locations[2]) combined[0].location3 = 'location_' + locations[2].output + '.mp4';
  if (locations[3]) combined[0].location4 = 'location_' + locations[3].output + '.mp4';
  if (locations[4]) combined[0].location5 = 'location_' + locations[4].output + '.mp4';
  if (locations[5]) combined[0].location6 = 'location_' + locations[5].output + '.mp4';
  if (locations[6]) combined[0].location7 = 'location_' + locations[6].output + '.mp4';
  if (locations[7]) combined[0].location8 = 'location_' + locations[7].output + '.mp4';
  if (locations[8]) combined[0].location9 = 'location_' + locations[8].output + '.mp4';
  if (locations[9]) combined[0].location10 = 'location_' + locations[9].output + '.mp4';
  if (locations[10]) combined[0].location11 = 'location_' + locations[10].output + '.mp4';
  checker.push(combined);
};

module.exports = worker;