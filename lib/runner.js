var spawn = require('child_process').spawn
  , fs = require('fs')
  , underscore = require('underscore');

var Pool = require('./pool');

function Runner(paths, config) {
  this.paths = paths;
  this.config = underscore.extend(
      {
          bin: ['./node_modules/.bin/mocha', 'mocha']
        , processes: 2
      }
    , config
  );
  this.mocha = null;
  this.exitCodes = [];
}

Runner.prototype.run = function(callback) {
  var self = this
    , pool = new Pool(this.paths, this.config.processes);

  pool.on('done', callback);
  pool.on('ready', function(path, callback) {
    self.spawn(path, callback);
  });
  pool.start();
};

Runner.prototype.spawn = function(path, callback) {
  var self = this
    , mocha = self.findMocha()
    , process = spawn(mocha, [path]);

  console.log('spawning: %s %s', mocha, path);
  process.stdout.on('data', function (data) {
    console.log('stdout: %s', data);
  });
  process.stderr.on('data', function (data) {
    console.log('stderr: %s', data);
  });
  process.on('exit', function(code) {
    console.log('exit: %d', code);
    self.exitCodes.push(code);
    return callback(null);
  });
};

Runner.prototype.findMocha = function() {
  if (!this.mocha) {
    this.mocha = underscore.find(this.config.bin, function(bin) {
      return fs.existsSync(bin);
    });
  }

  return this.mocha;
};

module.exports = Runner;
