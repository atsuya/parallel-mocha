var spawn = require('child_process').spawn
  , fs = require('fs')
  , underscore = require('underscore');

var Pool = require('./pool');

function Runner(paths, config) {
  this.paths = paths;
  this.config = underscore.extend(
      {
          bin: ['./node_modules/.bin/mocha']
        , processes: 2
      }
    , config
  );
  this.mocha = null;
  this.exitCodes = [];
}

Runner.prototype.run = function(callback) {
  var self = this
    , pool = new Pool(self.paths, self.config.processes);

  pool.on('done', function() {
    var success = underscore.every(self.exitCodes, function(code) {
      return code === 0;
    });
    // TODO: return better result rather than just error or not
    var error = success ? null : new Error('Not all tests passed');
    return callback(error);
  });
  pool.on('ready', function(path, callback) {
    self.spawn(path, callback);
  });
  pool.start();
};

Runner.prototype.spawn = function(path, callback) {
  var self = this
    , mocha = self.findMocha()
    , process = spawn(mocha, [path]);

  process.stdout.on('data', function (data) {
    console.log('stdout: %s', data);
  });
  process.stderr.on('data', function (data) {
    console.log('stderr: %s', data);
  });
  process.on('exit', function(code) {
    self.exitCodes.push(code);
    return callback(null);
  });
};

Runner.prototype.findMocha = function() {
  if (!this.mocha) {
    this.mocha = underscore.find(this.config.bin, function(bin) {
      return fs.existsSync(bin);
    });
    this.mocha = this.mocha || 'mocha';
  }

  return this.mocha;
};

module.exports = Runner;
