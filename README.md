# PLOC - PL/SQL code to doc converter

DO NOT USE - WORK IN PROGRESS



## Installation

In your repo install ploc:

```js
npm install ploc
```


## Usage 



### Single file example

Create a npm script file, for example `scripts/build_docs.js`:

```js
var ploc = require('ploc');
var inFilePattern  = process.argv[2]; // first command line parameter, defaults to "**/*.pks"
var outFilePattern = process.argv[3]; // second one, defaults to "{folder}{file}.md"
var minItemsForToc = process.argv[4]; // third one, defaults to 5

ploc.files2docs(inFilePattern, outFilePattern, minItemsForToc)
```

Add a new npm script entry in your package.json - here an example from my PLEX project - we call it `build:docs`:

```js
{
  "name": "plex",
  "scripts": {
    "build:docs": "node scripts/build_docs.js PLEX.pks README.md",
  },
  "dependencies": {
    "chokidar-cli": "^1.2.0",
    "glob": "^7.1.2"
  }
}
```

Note that we use only two of our possible three parameters: inFilePattern and outFilePattern



### Run the script

```js
npm run build:docs
```

The output will be something like this:

```sh
> plex@ build:docs /Users/ottmar/code/plex
> node scripts/build_docs.js PLEX.pks README.md

PLEX.pks => README.md
```

For each generated Markdown document you get one line of log entry with the input and output file - here we have only one line `PLEX.pks => README.md`



### Multiple files example

We add now a script called `build:all_docs`:

```js
{
  "name": "plex",
  "scripts": {
    "build:docs": "node scripts/build_docs.js PLEX.pks README.md",
    "build:all_docs": "node scripts/build_docs.js",
    "watch:docs": "chokidar *.pks scripts/**/*.js package.json --initial -c \"npm run build:docs\""
  },
  "dependencies": {
    "chokidar-cli": "^1.2.0",
    "glob": "^7.1.2"
  }
}
```

As you can see we omit simply all parameters and therefore the defaults are used (inFilePattern = "**/*.pks", 
outFilePattern = "{folder}{file}.md"), which results in converting all found *.pks files in all directories and subdirectories. Here the output of this conversion:

```sh
> plex@ build:all_docs /Users/ottmar/code/plex
> node scripts/build_docs.js

PLEX.pks => PLEX.md
temp/source/test_1.pks => temp/source/test_1.md
temp/source/test_2.pks => temp/source/test_2.md
```

Obviously I have some test files in the source folder. You can also see on this example that you can use the variables `{folder}` (directory path of source file with trailing directory separator) and `{file}` (source file name without extension) in your second outFilePattern. The first inFilePattern is a standard [glob file pattern](https://github.com/isaacs/node-glob#glob).



### Automation with file watcher

We use here chokidar - you have first to install it with `npm install chokidar-cli`

```js
FIXME: example
```



## More about npm scripts

- https://medium.freecodecamp.org/introduction-to-npm-scripts-1dbb2ae01633
- https://medium.freecodecamp.org/why-i-left-gulp-and-grunt-for-npm-scripts-3d6853dd22b8
- https://css-tricks.com/why-npm-scripts/

