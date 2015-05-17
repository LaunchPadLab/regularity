var Regularity = require('../lib/regularity.js');
var errors = require('../lib/errors');

describe("Regularity", function() {
    var regularity;

    beforeEach(function() {
        regularity = new Regularity();
    });

    it("is an object constructor", function() {
        expect(typeof Regularity).toBe('function');
        expect(typeof regularity).toBe('object');
    });

    describe("escapes regexp special characters", function() {
        var charactersToBeEscaped = ['*', '.', '?', '^', '+',
                                     '$', '|', '(', ')', '[',
                                     ']', '{', '}'];

        charactersToBeEscaped.forEach(function testEscapedChar(character) {
            it("escapes '" + character + "'", function() {
                var currentRegexp = regularity.append(character).done();

                expect(currentRegexp.source).toBe("\\" + character);
            });
        });
    });

    describe("#startWith requires that the passed pattern occur exactly at the beginning of the input", function() {
        var regexp;
        beforeEach(function() {
            regexp = regularity.startWith('a').done();
        });

        it("matches in the positive case", function() {
            expect(regexp.test('abcde')).toBe(true);
        });

        it("does not match in the negative case", function() {
            expect(regexp.test('edcba')).toBe(false);
        });
    });

    describe("#startWith can only be called as the first method in the chain", function() {
        var someDefaultArgumentsFor = {
            'startWith' : ['z'], // this verifies that 'startWith' can only be called once
            'append':     [2, 'a'],
            'then' :      [ 4, 'm'],
            'endWith':    ['k'],
            'maybe':      ['foo'],
            'oneOf':      [['p', 'q']],
            'between':    [[3, 6], 'alphanumeric'],
            'zeroOrMore': ['whitespace'],
            'oneOrMore':  ['lowercase'],
            'atLeast':    [4, 'b'],
            'atMost':     [5, 'z']
        };

        var excludedMethods = ["insensitive", "global", "multiLine", "done", "regexp"];


        Object.keys(new Regularity())
            .filter(function(method) {
                return (excludedMethods.indexOf(method) === -1);
            })
            .forEach(function(method) {
                it("#startWith can't be called after #" + method, function() {
                    expect(function() {
                        regularity[method].apply(regularity, someDefaultArgumentsFor[method])
                            .startWith('whatever');
                    }).toThrow(errors.MethodMustBeTheFirstToBeCalled('startWith'));
                });
            });
    });

    describe("#startWith -- checks against literal regexp", function() {
        var regexp;

        it("single character", function() {
            regexp = regularity.startWith('a').done();
            expect(regexp).toEqual(/^a/);
        });

        it("numbered pattern", function() {
            regexp = regularity.startWith(4, 'digits').done();
            expect(regexp).toEqual(/^[0-9]{4}/);
        });

        it("one character", function() {
            regexp = regularity.startWith(1, 'p').done();
            expect(regexp).toEqual(/^p{1}/);
        });

        it("more than one occurence of one character", function() {
            regexp = regularity.startWith(6, 'p').done();
            expect(regexp).toEqual(/^p{6}/);
        });

        xit("one occurence of several characters", function() {
            regexp = regularity.startWith(1, 'hey').done();
            expect(regexp).toEqual(/^(?:hey){1}/);
        });

        xit("more than one occurence of several characters", function() {
            regexp = regularity.startWith(5, 'hey').done();
            expect(regexp).toEqual(/^(?:hey){5}/);
        });
    });

    describe("#endWith requires that the passed pattern occur exactly at the end of the input", function() {
        var regexp;
        beforeEach(function() {
            regexp = regularity.endWith('a').done();
        });

        it("matches in the positive case", function() {
            expect(regexp.test('edcba')).toBe(true);
        });

        it("does not match in the negative case", function() {
            expect(regexp.test('abcde')).toBe(false);
        });

        it("can only be called once", function() {

        });

        it("can only be called as the last method in the chain (except for #done)", function() {

        });
    });

    describe("#maybe requires that the passed pattern occur either one or zero times", function() {
        var regexp;
        beforeEach(function() {
            regexp = regularity.maybe('a').done();
        });

        it("matches when the pattern is present", function() {
            expect(regexp.test('aaaa')).toBe(true);
        });

        it("matches when the pattern isn't present", function() {
            expect(regexp.test('bbbb')).toBe(true);
        });
    });

    describe("#oneOf requires that at least one of the passed patterns occur", function() {
        var regexp;
        beforeEach(function() {
            regexp = regularity.oneOf(['a','bb','ccc']).done();
        });

        it("matches the first one", function() {
            expect(regexp.test('addd')).toBe(true);
        });

        it("matches the second one", function() {
            expect(regexp.test('dbb')).toBe(true);
        });

        it("matches the third one", function() {
            expect(regexp.test('zkcccl')).toBe(true);
        });

        it("does not match when neither are present", function() {
            expect(regexp.test('bccddd')).toBe(true);
        });
    });

    describe("#between requires that the passed pattern occur a number of consecutive times within the specified interval", function() {
        var regexp;
        beforeEach(function() {
            regexp = regularity.between([3, 5], 'a').done();
        });

        it("matches when there is the right amount of consecutive occurences", function() {
            expect(regexp.test('aaadd')).toBe(true);
            expect(regexp.test('llaaaa')).toBe(true);
            expect(regexp.test('lmaaaaakl')).toBe(true);
        });

        it("doesn't match when the count is less than the lower bound", function() {
            expect(regexp.test('addd')).toBe(false);
            expect(regexp.test('aadkb')).toBe(false);
        });

        // see https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_special_characters
        it("*does* match when the count is more than the upper bound", function() {
            expect(regexp.test('daaaaaalk')).toBe(true);
            expect(regexp.test('dmaaaaaaaaaalm')).toBe(true);
        });

        it("doesn't match when there are enough occurences but they are not consecutive", function() {
            expect(regexp.test('azaazza')).toBe(false);
            expect(regexp.test('zkalaamaa')).toBe(false);
            expect(regexp.test('azakalaamaama')).toBe(false);
        });

        it("throws a native error when the lower bound is greater than the upper bound", function() {
        });
    });

    describe("#append requires that the passed pattern occur after what has been declared so far (and before whatever is declared afterwards)", function() {

    });

    it("#then is just an alias for #append", function() {

    });

    describe("#zeroOrMore requires that the passed pattern occur any number of consecutive times, including zero", function() {

    });

    describe("#oneOrMore requires that the passed pattern occur consecutively at least one time", function() {

    });

    describe("#atLeast requires that the passed pattern occur consecutively at least the specified number of times", function() {

    });

    describe("#atMost requires that the passed pattern occur consecutively at most the specified number of times", function() {

    });

    describe("#insensitive specifies that the search must be done case-insensitively", function() {

    });

    describe("#global specifies that the search must be performed as many times as necessary to identify all matches", function() {

    });

    describe("#multiLine specifies that the input must be treated as multiple lines", function() {

    });

    describe("#done", function() {
        it("returns a RegExp instance", function() {
            expect(regularity.done() instanceof RegExp).toBe(true);
        });

        it ("returns an empty regexp by default", function() {
            expect(regularity.done()).toEqual(new RegExp());
        });
    });

    it("#regexp is just an alias for #done", function() {
        expect(regularity.regexp).toBe(regularity.done);
    });
});
