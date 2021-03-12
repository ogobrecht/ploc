'use strict';

var ploc = {};
ploc.opts = {};
ploc.opts.minItemsForToc = 3;
ploc.utils = {};


ploc.utils.reverseString = function (string) {
  return string.split("").reverse().join("");
};


ploc.utils.capitalizeString = function (string) {
  return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
};


ploc.utils.getMarkdownHeader = function (level, header, anchor) {
  var markdownHeader;
  // create HTML or Markdown header depending on anchor length
  if (anchor.length > 0) {
    markdownHeader = '<h' + level + '>' +
      '<a id="' + anchor + '"></a>' +
      header +
      '</h' + level + '>';
    markdownHeader += '\n<!--' + (level === 1 ? '=' : '-').repeat((markdownHeader.length - 7)) + '-->';
  } else {
    markdownHeader = header + '\n' + (level === 1 ? '=' : '-').repeat(header.length);
  }
  return markdownHeader;
};


ploc.utils.getAnchor = function (name) {
  return name.trim().toLowerCase().replace(/[^\w\- ]+/g, '').replace(/\s/g, '-').replace(/\-+$/, '');
};


ploc.utils.getAndStripLeadingHeader = function (description, headerLevel) {
  return 'testus';
};


// helper function to get the doc data as JSON object - you can use this
// function to creata your own output instead of using `ploc.getDoc(code)`
ploc.getDocData = function (code) {

  // We need to work on a reversed string to avoid to fetch too much text, so the keywords for package, function and so on are looking ugly...
  var regexItem = /\/\*{2,}\s*((?:.|\s)+?)\s*\*{2,}\/\s*((?:.|\s)*?\s*([\w$#]+|".+?")(?:\.(?:[\w$#]+|".+?")){0,1}\s+(reggirt|epyt|erudecorp|noitcnuf|egakcap))\s*(?:(?:ECALPER\s+RO\s+){0,1}ETAERC){0,1}\s*$/gim;
  var regexHeaderSetext = /(^(?:\s*(?:\r\n|\n|\r))* {0,3}\S.+(?:\r\n|\n|\r) {0,3}=+ *)(?:\r\n|\n|\r)/;
  var regexHeaderAtx = /(^(?:\s*(?:\r\n|\n|\r))* {0,3}# +.+)(?:\r\n|\n|\r)/;
  var regexLeadingWhitespace = /^(?:\s*(?:\r\n|\n|\r))*/;
  var match;
  var anchors = [];
  var data = {};
  data.header = '';
  data.toc = '';
  data.items = [];
  code = ploc.utils.reverseString(code);

  // get base attributes
  if (!regexItem.test(code)) {
    console.warn('PLOC: Document contains no code to process!');
  } else {
    // reset regexItem index to find all occurrences with exec - see also: https://www.tutorialspoint.com/javascript/regexItem_lastindex.htm
    regexItem.lastIndex = 0;
    while (match = regexItem.exec(code)) {
      var item = {};
      item.description = ploc.utils.reverseString(match[1])
        .replace(/{{@}}/g,'@')  // special SQL*Plus replacements. SQL*Plus is reacting on those special
        .replace(/{{#}}/g,'#')  // characters when they occur as the first character in a line of code.
        .replace(/{{\/}}/g,'/'); // That can be bad when you try to write Markdown with sample code.
      item.signature = ploc.utils.reverseString(match[2]);
      item.name = ploc.utils.reverseString(match[3]);
      item.type = ploc.utils.capitalizeString(ploc.utils.reverseString(match[4]));
      data.items.push(item);
    }
  }

  // calculate additional attributes
  data.items.reverse().forEach(function (item, i) {
    data.items[i].header = data.items[i].type + ' ' + data.items[i].name;
    data.items[i].anchor = ploc.utils.getAnchor(item.name);

    // ensure unique anchors
    if (anchors.indexOf(data.items[i].anchor) !== -1) {
      var j = 1;
      while (anchors.indexOf(data.items[i].anchor + '-' + j) !== -1 && j++ <= 10) {
        data.items[i].anchor = data.items[i].anchor + '-' + j;
      }
    }

    // process global document header, if provided in first item (index = 0)
    if (i === 0) {
      if (match = regexHeaderSetext.exec(data.items[i].description)) {
        data.header = match[1];
        data.items[i].description = data.items[i].description
          .replace(regexHeaderSetext, '')
          .replace(regexLeadingWhitespace, '');
      }
      else if (match = regexHeaderAtx.exec(data.items[i].description)) {
        data.header = match[1];
        data.items[i].description = data.items[i].description
          .replace(regexHeaderAtx, '')
          .replace(regexLeadingWhitespace, '');
      }
    }

    anchors.push(data.items[i].anchor);
    data.toc += '- [' + data.items[i].header + '](#' + data.items[i].anchor + ')\n';
  });

  return data;
};


// the main function to create the Markdown document
ploc.getDoc = function (code) {
  var doc = '';
  var docData = ploc.getDocData(code);
  var provideToc = (docData.items.length >= ploc.opts.minItemsForToc);

  if (docData.header) doc += docData.header + '\n\n';
  if (provideToc) doc += docData.toc + '\n\n';

  docData.items.forEach(function (item, i) {
    var level = (i === 0 && !docData.header ? 1 : 2);
    var header = item.header;
    var anchor = (provideToc ? item.anchor : '');
    var markdownHeader = ploc.utils.getMarkdownHeader(level, header, anchor);
    doc += markdownHeader + '\n\n' +
      item.description + '\n\n' +
      'SIGNATURE\n\n' +
      '```sql\n' +
      item.signature + '\n' +
      '```\n\n\n';
  });

  return doc;
}


module.exports = ploc;