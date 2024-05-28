var fs = require('fs');
var path = require('path');
var util = require('util');
var Transform = require('stream').Transform;

// Matches: 00:00:17,810 --> 00:00:20,330
var timeMatch = new RegExp(/\d+\:\d+\:\d+\,\d+\s\-\-\>\s\d+\:\d+\:\d+\,\d+/);
// Matches: "0:00:00.180,0:00:02.230"
var altTimeMatch = new RegExp(/\d+\:\d+\:\d+\.\d+\,\d+\:\d+\:\d+\.\d+/);

function Parser(opts) {
  // if no instance, call new
  if (!(this instanceof Parser)) {
    return new Parser(opts); 
  }
  this.fileName = opts.fileName;
  Transform.call(this);
}

util.inherits(Parser, Transform);

Parser.prototype._transform = function _transform(data, enc, cb) {
  var buf = new Buffer(data);
  var str = buf.toString('utf-8');
  var begin = ['\n\n###', this.fileName.split('.')[0], '\n'];
  var parsed = begin.concat(str.split('\n')).filter(function(line) {
    return !timeMatch.test(line) && 
      !altTimeMatch.test(line) &&
      line != (line.match(/\d+/) && line.match(/\d+/)[0]);
  }).join(' ').replace(/\>\>/, '\n\n');
  this.push(parsed);
  cb();
};

var writeEnabled = false;

function frListener(fr) {
  fr.on('end', function() {
    writeEnabled = true;
  });
}

function write(pipe, fw) {
  frListener(pipe.fr);
  return pipe.fr
    .pipe(pipe.parser) 
    .pipe(fw, { end: false });
}

function writing(filePipes, fileWriter) {
  if (filePipes.length == 1 ) {
    var pipe = filePipes.shift();
    return pipe.fr
      .pipe(pipe.parser)
      .pipe(fileWriter, { end: true });
  }
  // Setup recursion
  if (writeEnabled) {
    writeEnabled = false;
    write(filePipes.shift(), fileWriter);
    writing(filePipes, fileWriter);
  } else {
    setImmediate(function() {
      writing(filePipes, fileWriter);
    });
  }
}

module.exports = function(dirName, fileName) {
  var dir = process.argv[2] || dirName;
  if (!dir) throw new Error('Directory required');

  var file = process.argv[3] || fileName || path.join(dir, 'parsed-srt.txt');

  var title =  dir.split('/')
                .filter(function(w) { return w; })
                .pop()
                .split(/subtitle\w+/i)
                .shift()
                .trim();

  var compiledTitle = '# ' + title + '\n\n';

  // Create fileWriter and write the file title
  var fileWriter = fs.createWriteStream(file);
  fileWriter.setMaxListeners(0);
  fileWriter.write(compiledTitle);

  fs.readdir(dir, function(err, files) {
    var pipes = files.filter(function(file) {
      return /\.srt/.test(file);
    }).map(function(srtFile) {
      var filePath = path.join(dir, srtFile);
      var fileReader = fs.createReadStream(filePath);
      var parseSrtFile = new Parser({ fileName: srtFile });
      return {
        fr: fileReader,
        parser: parseSrtFile
      };
    });

    writeEnabled = true;
    writing(pipes, fileWriter);
  });
}; 

