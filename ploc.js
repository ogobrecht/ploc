'use strict';

const fs = require('fs-extra');
const { regex } = require('regex');
const ploc = {};
ploc.opts = {};
ploc.opts.minItemsForToc = 3;
ploc.utils = {};


ploc.utils.reverseString = function (string) {
    return string.split("").reverse().join("");
};


ploc.utils.capitalizeString = function (string) {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
};


ploc.utils.getAnchor = function (name) {
    return name.trim().toLowerCase().replace(/[^\w\- ]+/g, '').replace(/\s/g, '-').replace(/\-+$/, '');
};


// Helper function to get the doc data as JSON object - you can use this
// function to creata your own output instead of using ploc.getDoc(code).
ploc.getDocData = function (code) {

    // We need to work on a reversed string to avoid to fetch too much text, so the keywords for package, function and so on are looking ugly...
    // https://github.com/slevithan/regex
    // try this: /\/\*\*.*?\*\*\/\s*(.*?([\w$#]+|"[[:print:]]+")(?:\.(?:[\w$#]+|"[[:print:]]+")){0,1}\s+(reggirt|epyt|erudecorp|noitcnuf|egakcap))\s+(?:rebmem\s+){0,1}(?:lanif\s+){0,1}(?:citats\s+){0,1}(?:(?:ecalper\s+ro\s+){0,1}etaerc){0,1}/gimsx
    const
        regexItem = regex('gim')`                                        # !!! DO NOT FORGET: WE ARE WORKING ON A REVERSED STRING !!!
                            \s* /\*{2,} \s*                              # doc comment end
            (?<description> (.|\s)*?                                  )  # description in doc comment
                            \s* \*{2,}/ \s*                              # doc comment begin
            (?<signature>   (.|\s)*?                                     # signature
                            (\s+ tcejbo \s+ sa)? \s*                     # optional "as object" clause
            (?<name>        \g<identifier>                            )  # name
                            (\s* \. \s* \g<identifier>)? \s*             # optional name space (schema)
            (?<type>        (reggirt|epyt|erudecorp|noitcnuf|egakcap)    # type
                            (\s+ rebmem)?                                # optional "member" keyword
                            (\s+ lanif)?                                 # optional "final" keyword
                            (\s+ citats)?                             )) # optional "static" keyword (end of signature group)
                            (\s+ ecalper\s+ro)?                          # optional "or replace" clause
                            (\s+ etaerc)?                                # optional "create" clause
                            \s*                                          # optional whitspace
                            ,?                                           # optional comma
                            $                                            # we need to stop at the line start (we have reversed text, so $ is really ^)

            (?(DEFINE)
                (?<identifier>  ( [\w$#]+ | "\P{C}+" )                )  # \P{C}+ : Match only visible characters.
                                                                         # https://www.regular-expressions.info/unicode.html#prop
                                                                         # https://stackoverflow.com/questions/1247762/regex-for-all-printable-characters
            )
        `,

        regexHeader = regex`
            (?<header>  \s*                                 # whitespace including newlines
                        \g<leadingspace>

                        (                                   # Setext header style:
                        \S                                  # - one no whitespace character
                        .+                                  # - anything else then new lines
                        \g<newline>
                        \g<leadingspace>
                        =+                                  # - one or more equal signs
                        \ *                                 # - zero or more spaces

                        |                                   # ATX header style:
                        \#                                  # - one hash sign
                        \ +                                 # - one or more spaces
                        .+                                  # - anything else then new lines
                        )                                )  # end of header group
                        \g<newline>
            (?(DEFINE)
                (?<newline>         ( \r\n | \n | \r )   )  # one new line (different shapes)
                (?<leadingspace>    \ {0,4}              )  # up to four spaces
            )
        `,
        regexLeadingWhitespace = /^\s*/,
        anchors = [],
        data = {};
    let match;

    data.header = '';
    data.toc = (ploc.opts.tocStyles ? '<ul style="' + ploc.opts.tocStyles + '">\n' : '');
    data.items = [];

    code = ploc.utils.reverseString(code);

    // Get base attributes
    const matches = code.matchAll(regexItem);

    for (const match of matches) {
        //console.log('match:', match);
        let item = {};
        item.description = ploc.utils.reverseString(match.groups.description)
            .replace(/{{@}}/g, '@')   // Special SQL*Plus replacements. SQL*Plus is reacting on those special
            .replace(/{{#}}/g, '#')   // characters when they occur as the first character in a line of code.
            .replace(/{{\/}}/g, '/'); // That can be bad when you try to write Markdown with sample code.
        item.signature = ploc.utils.reverseString(match.groups.signature);
        item.name = ploc.utils.reverseString(match.groups.name);
        item.type = ploc.utils.capitalizeString(ploc.utils.reverseString(match.groups.type).replace(/\s+/g, ' '));
        data.items.push(item);
    }

    // Calculate additional attributes.
    data.items.reverse().forEach(function (item, i) {

        // Process global document header, if provided in first item (index = 0).
        if (i === 0) {
            if (match = regexHeader.exec(data.items[i].description)) {
                data.header = match.groups.header;
                data.items[i].description = data.items[i].description
                    .replace(regexHeader, '')
                    .replace(regexLeadingWhitespace, '');
            }
        }

        // Define item header and anchor for TOC.
        data.items[i].header = data.items[i].type + ' ' + data.items[i].name;
        data.items[i].anchor = ploc.utils.getAnchor(data.items[i].header);
        // Ensure unique anchors.
        if (anchors.indexOf(data.items[i].anchor) !== -1) {
            let j = 0, anchor = data.items[i].anchor;
            while (anchors.indexOf(data.items[i].anchor) !== -1 && j++ <= 100) {
                data.items[i].anchor = anchor + '-' + j;
            }
        }
        anchors.push(data.items[i].anchor);
        data.toc += (
            ploc.opts.tocStyles ?
                `<li><a href="#${data.items[i].anchor}">${data.items[i].header}</a></li>\n` :
                `- [${data.items[i].header}](#${data.items[i].anchor})\n`
        );

    });

    data.toc += (ploc.opts.tocStyles ? '</ul>\n' : '');

    return data;
};


// The main function to create the Markdown document.
ploc.getDoc = function (code) {
    const docData = ploc.getDocData(code);
    const provideToc = (docData.items.length >= ploc.opts.minItemsForToc);
    let doc = '';

    doc += (docData.header ? docData.header + '\n\n' : '');
    doc += (provideToc ? docData.toc + '\n\n' : '');

    docData.items.forEach(function (item, i) {
        const level = (i === 0 && !docData.header ? 1 : 2);
        const comment = (level === 1 ? '=' : '-').repeat((15 + item.header.length + item.anchor.length));
        doc += [
            (ploc.opts.autoHeaderIds ?
                `<h${level}><a id="${item.anchor}"></a>${item.header}</h${level}>\n<!--${comment}-->` :
                `${'#'.repeat(level)} ${item.header}`),
            item.description,
            'SIGNATURE',
            '```sql\n' + item.signature + '\n```\n',
            ''
        ].join('\n\n');
    });

    return doc;
}


module.exports = ploc;
