var path = require('path');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var fs = require('fs');
const checker = {};

checker.queue = [];
checker.period = 60000;
checker.path = path.join(__dirname, 'output/Output');
checker.COMBINED_EXE = path.join(__dirname, 'execution/combined_ps/templater.ps1 -m');
checker.COMBINED_DATA = path.join(__dirname, 'execution/combined_ps/combined.json');

const convert = function (id, inputPath, outputPath){
  console.log(id + ' is being converted...');
  child = spawn('ffmpeg.exe',['-y', '-i', inputPath, '-c:v', 'libx264', '-crf', '23', outputPath]);
  child.on("exit",function() {
    fs.unlink(inputPath);
    var data = checker.queue[0].data[0];
    for (var p in data) {
      try {
        fs.unlink(path.join(__dirname, 'output/Output', data[p]));
      } catch (e){
      }
    }
    // if finished rendering -> emit current job -> find the next job
    checker.queue.shift();
    console.log(id + ' is converted!');
    check();
  });
};

const render = function (combinedData){
  console.log(combinedData[0].output + ' is being rendered...');
  var inputPath = path.join(__dirname, 'output/Output', 'combined_'+combinedData[0].output+'.mov');
  var outputPath = path.join(__dirname, 'output/Output', combinedData[0].output+'.mp4');
  var c = 0;
  if (!fs.existsSync(inputPath)) {
    fs.writeFileSync(checker.COMBINED_DATA, JSON.stringify(combinedData), 'utf8');
    child = spawn('powershell.exe', [checker.COMBINED_EXE]);
    child.stdout.on("data",function(data){
      c++;
    });
    child.stderr.on("data",function(data){
      console.log("Powershell Errors: " + data);
    });
    child.on("exit",function(){
      console.log(combinedData[0].output + ' is rendered!');
      convert(combinedData[0].output, inputPath, outputPath);
    });
  } else {
    convert(combinedData[0].output, inputPath, outputPath);
  }
};

const check = function () {
  console.log('Checking');
  // if queue has jobs
  if (checker.queue.length > 0) {
    // if all needed files have not done yet
    if (!checker.queue[0].ready){
      var data = checker.queue[0].data[0];
      // check all needed files
      try {
        for (var p in data) {
          // if not found a file -> wait for the next check
          if (p !== 'output' && !fs.existsSync(path.join(__dirname, 'output/Output', data[p]))) {
            setTimeout(check, checker.period);
            return;
          }
        }
        // if found all files -> update job's state to ready
        checker.queue[0].ready = true;
      } catch (e){
        console.log('Files checking error!');
        console.log(e);
      }
    }
    // if all needed files have done and worker are free -> render
    if (checker.queue[0].ready){
      try {
        render(checker.queue[0].data);
      } catch (e){
        console.log('File rendering error!');
        console.log(e);
        check();
      }
    }
  } else {
    // if queue is empty -> wait for the next check
    setTimeout(check, checker.period);
  }
};

// start checker job
checker.start = function () {
  check();
};

checker.push = function (data) {
  console.log('New job: ');
  console.log(data);
  this.queue.push({ data: data, ready: false });
};

module.exports = checker;