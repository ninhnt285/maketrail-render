var spawn = require('child_process').spawn;
var request = require('request');
var fs = require('fs');
var path = require('path');
var sizeOf = require('image-size');

const worker = {};
worker.QUEUE = [];
worker.FLAG = 3;

worker.init = function () {
  worker.COMBINED_DATA = path.join(__dirname, 'aeTemplates/01_1/source/data.js');
  worker.COMBINED_TEMPLATE = path.join(__dirname, 'aeTemplates/01_1/10locations.aep');
  worker.COMBINED_INTRO_PATH = path.join(__dirname, 'aeTemplates/01_1/source/intro')
  try {
    const data = fs.readFileSync('./test.txt', 'utf8');
    this.solve(JSON.parse(data));

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

const convert = function (id, inputPath, outputPath){
  console.log(id + ' is being converted...');
  child = spawn('ffmpeg.exe',['-y', '-i', inputPath, '-c:v', 'libx264', '-crf', '23', outputPath]);
  child.on("exit",function() {
    checker.sock.write(id);
    fs.unlink(inputPath, function(err) {
      if (err) {
        console.log(err);
      }
    });
    var data = checker.queue[0].data[0];
    delete data.output;
    for (var p in data) {
      fs.unlink(path.join(__dirname, 'output/Output', data[p]), function(err) {
        if (err) {
          console.log(err);
        }
      });
    }
    checker.queue.shift();
    console.log(id + ' is converted!');
  });
};

const process = function (job) {
  console.log(job);
  var input = path.join(__dirname, 'output', 'test'+'.mov');
  var output = path.join(__dirname, 'output', 'test'+'.mp4');
  fs.writeFileSync(worker.COMBINED_DATA, 'var newData = ' + JSON.stringify(job), 'utf8');
  var child = spawn('aerender.exe',['-project', worker.COMBINED_TEMPLATE, '-comp', 'The Journey Map Render Comp', '-RStemplate', 'Best Settings', '-OMtemplate', 'maketrail', '-s', 1, '-e', 300, '-output', input]);
  child.on("exit",function(code){
    if (code !== 0) {
      console.log('Fail!');
      worker.QUEUE.push(job);
      worker.FLAG++;
      return;
    }
    worker.FLAG++;
    console.log(job.output + " has been rendered!");
    // convert(job.output, input, output);
  });
};

const getXfromLat = function (lat) {
  return lat;
};

const getYfromLng = function (lng) {
  return lng;
};

const getImage = function (image, source, fileName) {
  const filePath = path.join(source, fileName);
  const uri = image.file;
  request.head(uri, function(err, res, body){
    if (err) {
      console.log(uri);
    } else {
      request(uri).pipe(fs.createWriteStream(filePath)).on('close', function () {
      });
    }
  });
  return {
    file: fileName,
    width: image.width,
    height: image.height
  };
};

const getSlideshow = function (prefix, location) {
  const source = path.join(__dirname, 'aeTemplates/01_1/source/slideshow') + prefix;
  return {
    text: {
      bannerLength: location.name.length * 8,
      showDivider: true,
      title: location.name,
      temperature: location.temperature,
      distance: location.height,
      sunny: !!location.sunny,
      cloudy: !!location.cloudy,
      sunnyClouds: !!location.sunnyClouds,
      rain: !!location.rain,
      thunderStorm: !!location.thunderStorm,
      snow: !!location.snow
    },
    image1: getImage(location.image1, source, '01.jpg'),
    image2: getImage(location.image2, source, '02.jpg'),
    image3: getImage(location.image3, source, '03.jpg'),
    image4: getImage(location.image4, source, '04.jpg'),
    image5: getImage(location.image5, source, '05.jpg')
  }
};

worker.solve = function (tripData) {
  var num = tripData.locations.length;
  var newData = {
    introScene: {
      image: getImage(tripData.intro, worker.COMBINED_INTRO_PATH, '01.jpg'),
      text: {
        bannerLength: tripData.name.length * 8,
        title: tripData.name,
        description: tripData.direction,
        time: tripData.time
      }
    },

    map: {
      location1: {
        show: num > 0,
        positionX: num > 0 ? getXfromLat(tripData.locations[0].lat) : 0,
        positionY: num > 0 ? getYfromLng(tripData.locations[0].lng) : 0
      },
      location2: {
        show: num > 1,
        positionX: num > 1 ? getXfromLat(tripData.locations[1].lat) : 0,
        positionY: num > 1 ? getYfromLng(tripData.locations[1].lng) : 0
      },
      location3: {
        show: num > 2,
        positionX: num > 2 ? getXfromLat(tripData.locations[2].lat) : 0,
        positionY: num > 2 ? getYfromLng(tripData.locations[2].lng) : 0
      },
      location4: {
        show: num > 3,
        positionX: num > 3 ? getXfromLat(tripData.locations[3].lat) : 0,
        positionY: num > 3 ? getYfromLng(tripData.locations[3].lng) : 0
      },
      location5: {
        show: num > 4,
        positionX: num > 4 ? getXfromLat(tripData.locations[4].lat) : 0,
        positionY: num > 4 ? getYfromLng(tripData.locations[4].lng) : 0
      },
      location6: {
        show: num > 5,
        positionX: num > 5 ? getXfromLat(tripData.locations[5].lat) : 0,
        positionY: num > 5 ? getYfromLng(tripData.locations[5].lng) : 0
      },
      location7: {
        show: num > 6,
        positionX: num > 6 ? getXfromLat(tripData.locations[6].lat) : 0,
        positionY: num > 6 ? getYfromLng(tripData.locations[6].lng) : 0
      },
      location8: {
        show: num > 7,
        positionX: num > 7 ? getXfromLat(tripData.locations[7].lat) : 0,
        positionY: num > 7 ? getYfromLng(tripData.locations[7].lng) : 0
      },
      location9: {
        show: num > 8,
        positionX: num > 8 ? getXfromLat(tripData.locations[8].lat) : 0,
        positionY: num > 8 ? getYfromLng(tripData.locations[8].lng) : 0
      },
      location10: {
        show: num > 9,
        positionX: num > 9 ? getXfromLat(tripData.locations[9].lat) : 0,
        positionY: num > 9 ? getYfromLng(tripData.locations[9].lng) : 0
      }
    },

    slideshow1: getSlideshow('01', tripData.locations[0]),
    slideshow2: getSlideshow('02', tripData.locations[1]),
    slideshow3: getSlideshow('03', tripData.locations[2]),
    slideshow4: getSlideshow('04', tripData.locations[3]),
    slideshow5: getSlideshow('05', tripData.locations[4]),
    slideshow6: getSlideshow('06', tripData.locations[5]),
    slideshow7: getSlideshow('07', tripData.locations[6]),
    slideshow8: getSlideshow('08', tripData.locations[7]),
    slideshow9: getSlideshow('09', tripData.locations[8]),
    slideshow10: getSlideshow('10', tripData.locations[9])
  };
  worker.QUEUE.push(newData);
};

module.exports = worker;