"use strict";

var _             = require('./functionalHelpers');
var group         = require('./grouper');
var quantify      = require('./quantifier');

var _translate    = require('./specialIdentifiers').translate;
var _register     = require('./specialIdentifiers').register;
var _interpret    = require('./constraintInterpreter').interpret;
var _escapeRegExp = require('./escaper').escapeRegExp;

var Regularity = function() {

    var _regexpSource = '',
        _beginning    = '',
        _end          = '',
        _flags        = '',
        _captureNext  = false;

    var _appendPatternChunk = function(patternChunk) {
        _regexpSource += _captureNext ? group.capture(patternChunk) : patternChunk;
        _captureNext = false;
    };

    var _enableFlag = function(flagIdentifier) {
        _flags += flagIdentifier;
    };

    var _setBeginning = function(pattern) {
        _beginning = group.atBeginning(pattern);
    };

    var _setEnd = function(pattern) {
        _end = group.atEnd(pattern);
    };




    this.startWith = _.onceOrThrow(function startWith() {
        _captureNext = false; // Cancel
        _setBeginning(_interpret(arguments));

        return this;
    });

    this.append = function() {
        _appendPatternChunk(_interpret(arguments));

        return this;
    };
    this.then = this.append;

    this.endWith = _.onceOrThrow(function endWith() {
        _captureNext = false; // Cancel
        _setEnd(_interpret(arguments));

        return this;
    });

    this.maybe = function() {
        _appendPatternChunk(quantify.zeroOrOne(_interpret(arguments)));

        return this;
    };

    this.oneOf = function() {
        var choices = Array.prototype.slice.call(arguments)
            .map(_escapeRegExp)
            .map(_translate);

        _appendPatternChunk(group.oneOf(choices));

        return this;
    };

    this.between = function(range, pattern) {
        _appendPatternChunk(quantify.inRange(_interpret([pattern]), range[0], range[1]));

        return this;
    };

    this.zeroOrMore = function() {
        _appendPatternChunk(quantify.zeroOrMore(_interpret(arguments)));

        return this;
    };

    this.oneOrMore = function() {
        _appendPatternChunk(quantify.oneOrMore(_interpret(arguments)));

        return this;
    };

    this.atLeast = function(times, pattern) {
        return this.between([times, null], pattern);
    };

    this.atMost = function(times, pattern) {
        return this.between([null, times], pattern);
    };

    this.captureNext = function() {
      _captureNext = true;

      return this;
    };

    this.insensitive = _.onceOrThrow(function insensitive() {
        _enableFlag('i');

        return this;
    });

    this.global = _.onceOrThrow(function global() {
        _enableFlag('g');

        return this;
    });

    this.multiline = _.onceOrThrow(function multiline() {
        _enableFlag('m');

        return this;
    });

    this.done = function() {
        return (new RegExp(_beginning + _regexpSource + _end, _flags));
    };

    this.regexp = this.done;

    this.partial = function() {
        return _regexpSource;
    };
};

Regularity.register = function(name, pattern) {
  _register(name, pattern);
};

module.exports = exports = Regularity;
