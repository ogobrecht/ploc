#!/usr/bin/env node

var fs = require('fs');
var glob = require('glob');
var ploc = require('./ploc.js');

// util for parse arguments: we reuse and extend ploc attributes here
ploc.utils.parseArguments = require('minimist');
ploc.opts.args = {
  string: ["in", "out"],
  boolean: "help",
  alias: {
    i: "in",
    o: "out",
    t: "toc"
  },
  default: { in: "**/*.pks",
    out: "{folder}{file}.md",
    toc: ploc.opts.minItemsForToc
  }
};

// cli help text
ploc.opts.cliHelp = [
  '',
  'Usage: ploc [options]',
  '',
  '  -i, --in:    The glob pattern for the code files to read',
  '               (default is "' + ploc.opts.args.default.in + '")',
  '',
  '  -o, --out:   The pattern for the doc files to write',
  '               (default is "' + ploc.opts.args.default.out + '")',
  '               {folder} = in file path with trailing directory separator',
  '               {file} = in file name without extension',
  '',
  '  -t, --toc:   How many items (methods including object/package name) the',
  '               code must have before a toc is included',
  '               (default is ' + ploc.opts.args.default.toc + ')',
  '',
  '  -h, --help:  Command line help',
  '',
  'Example 1: npx ploc --in **/*.pks --out {folder}{file}.md',
  'Example 2: npx ploc --out docs/{file}.md',
  'Example 3: npx ploc -i **/*.sql -o docs/{file}.md -t 5',
  '',
].join('\n');

// utility to calculate one out file path from an in file path and an out file pattern
ploc.utils.getOutFilePath = function (inFilePath, outFilePattern) {
  var folder, file, match;
  var regexp = /(.*(?:\\|\/)+)?((.*)(\.([^?\s]*)))\??(.*)?/i;
  /*
  This regex is taken from https://regexr.com/3dns9 and splits a URL it its components: 
  - $1: folder path
  - $2: file name(including extension)
  - $3: file name without extension
  - $4: extension
  - $5: extension without dot sign
  - $6: variables
  */

  // extract folder and file from inFilePath for replacements of {folder} and {file} in outFilePattern
  match = inFilePath.match(regexp);
  folder = match[1] || '';
  file = match[3];

  // do the final replacements and return
  return outFilePattern.replace('{folder}', folder).replace('{file}', file);
}

// utility to process all files for the provided in and out file patterns
ploc.utils.files2docs = function (inFilePattern, outFilePattern) {
  var outFilePath;
  var options = {
    matchBase: false
  };
  glob(inFilePattern, options, function (err, files) {
    if (err) throw err;
    files.forEach(function (inFilePath) {
      outFilePath = ploc.utils.getOutFilePath(inFilePath, outFilePattern);
      console.log(inFilePath + ' => ' + outFilePath);
      fs.writeFileSync(
        outFilePath,
        ploc.getDoc(fs.readFileSync(inFilePath, 'utf8'))
      );
    });
  })
};

// parse cli arguments
var args = ploc.utils.parseArguments(process.argv.slice(2), ploc.opts.args);

// write back minumum items for toc, as this is later used internally by ploc.getDoc
ploc.opts.minItemsForToc = args.toc;

// debug arguments
// console.log("CLI Arguments:\n", args);

// print help, if options -h or --help were provided
if (args.h || args.help) {
  console.log(ploc.opts.cliHelp);
} else {
  // otherwise create the docs
  ploc.utils.files2docs(args.in, args.out)
}