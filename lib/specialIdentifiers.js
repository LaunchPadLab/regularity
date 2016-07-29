"use strict";

var word = require('./wordUtils');


var _specialIdentifiers = {
    'digit'       : '[0-9]',
    'lowercase'   : '[a-z]',
    'uppercase'   : '[A-Z]',
    'letter'      : '[A-Za-z]',
    'alphanumeric': '[A-Za-z0-9]',
    'whitespace'  : '\\s',
    'space'       : ' ',
    'tab'         : '\\t'
};

var translate = function(pattern) {
    return (_specialIdentifiers[word.singularize(pattern)] || pattern);
};

var register = function(name, pattern) {
  _specialIdentifiers[name] = pattern;
};


module.exports = {
    translate: translate,
    register: register
};
