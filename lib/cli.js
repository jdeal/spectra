var opt = require('optimist');

var spectra = require('./spectra');

module.exports = function cli(argv){

  var saveArgv = process.argv;
  process.argv = argv;

  argv = opt
    .usage('Run metaspec tests.\nUsage: $0 [options] <file ...>')
    .demand(1)
    .alias('c', 'cover')
    .default('c', null)
    .describe('c', 'Path(s) to cover')
    .argv;

  process.argv = saveArgv;

  var options = {
    files: argv._,
    cover: argv.c
  };

  runner = spectra.createRunner(options);
  runner.start();
};
