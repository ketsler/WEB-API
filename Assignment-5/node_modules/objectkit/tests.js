/* global describe:false, it:false, beforeEach:false */

var ok = require('./objectkit');
var assert = require('assert');

describe('ok.has', function() {

    it('should be defined', function() {
        var a = {};
        assert.notEqual(ok(a).has, undefined);
    });

    it('should return true for defined properties', function() {
        var a = {
            foo: 'bar'
        }
        assert.equal(ok(a).has('foo'), true);
    });

    it('should return true for nested properties', function() {
        var a = {
            foo: {
                bar: 'baz'
            }
        }
        assert.equal(ok(a).has('foo.bar'), true);
    });

    it('should return true for more than one nested property', function() {
        var a = {
            b: {
                c: 'foo'
            },
            d: {
                e: 'bar'
            }
        }
        assert.equal(ok(a).has(['b.c', 'd.x']), false);
        assert.equal(ok(a).has(['b.c', 'd.e']), true);
    });

    it('should return false for undefined properties', function() {
        var a = {
            foo: 'bar'
        }
        assert.equal(ok(a).has('bar'), false);
    });

    it('should fail gracefully if the object is not defined', function() {
        var a = undefined;
        assert.equal(ok(a).has('foo.bar'), false);
    });

    it('should fail gracefully if the property to check is not defined', function() {
        var a = {};
        assert.equal(ok(a).has(undefined), false);
    });
});

describe('ok.getIfExists', function() {
    it('should return the value of the deep property', function() {
        var a = {
            b: {
                c: {
                    d: 32
                }
            }
        }
        assert.equal(ok(a).getIfExists('b.c.d'), 32);
    });

    it('should return undefined for missing property', function() {
        var a = {
            b: 32
        }
        assert.equal(ok(a).getIfExists('b.c.d'), undefined);
    });

    it('should return an array when an array is requested', function() {
        var a = {
                a: 'foo',
                b: 'bar',
                c: 'fred'
            },
            values = ok(a).getIfExists(['a', 'b', 'c', 'd']);

        assert.notEqual(values.indexOf('foo'), -1);
        assert.notEqual(values.indexOf('bar'), -1);
        assert.notEqual(values.indexOf('fred'), -1);
    });
});

describe('ok.list', function() {
    it('should return an object\'s keys', function() {
        var a = {
                "foo": 1,
                "bar": 2
            },
            keys = ok(a).list();
        assert.equal(keys.length, 2);
        assert.notEqual(keys.indexOf('foo'), -1);
        assert.notEqual(keys.indexOf('bar'), -1);
    });
});

describe('ok.merge', function() {
    it('should extend first object with second object', function() {
        var a = {
                "foo": 1,
                "bar": 2
            },
            b = {
                "bar": 3,
                "baz": function() {
                    return false;
                }
            };
        ok(a).merge(b);
        assert.equal(a.foo, 1);
        assert.equal(a.bar, 3);
        assert.equal(a.baz(), false);
    });
});

describe('ok.create', function() {
    it('should create a deep property', function() {
        var a = {}
        ok(a).create('foo.bar.baz');
        assert.notEqual(a.foo, undefined);
        assert.notEqual(a.foo.bar, undefined);
        assert.notEqual(a.foo.bar.baz, undefined);
    });

    it('should create a deep property with a value', function() {
        var a = {}
        ok(a).create('foo.bar', 'baz');
        assert.notEqual(a.foo, undefined);
        assert.notEqual(a.foo.bar, undefined);
        assert.equal(a.foo.bar, 'baz');
    });
});

describe('ok.ifFunctionExists', function() {
    var fired,
        success,
        param,
        context,
        obj = {
            "foo": function() {
                fired = true;
                context = this;
                return 91;
            },
            "bar": 3
        },
        fn = function(p) {
            success = true;
            param = p;
        };

    beforeEach(function() {
        fired = false;
        success = false;
        param = null;
        context = null;
    });

    it('should check that the requested method is a function', function() {
        ok(obj).ifFunctionExists('bar').do(fn);
        assert.equal(success, false);
        ok(obj).ifFunctionExists('foo').do(fn);
        assert.equal(success, true);
    });

    it('should run the requested method if a function', function() {
        ok(obj).ifFunctionExists('foo').do(fn);
        assert.equal(fired, true);
    });

    it('should pass the method\'s return value as param to callback', function() {
        ok(obj).ifFunctionExists('foo').do(fn);
        assert.equal(param, 91);
    });

    it('should apply the object as its own context', function() {
        ok(obj).ifFunctionExists('foo').do(fn);
        assert.equal(context, obj);
    });
});

describe('ok.try', function() {
    var success,
        error,
        obj = {
            "foo": function() {
                throw 'an error';
            }
        },
        fn = function(e) {
            success = true;
            error = e;
        };

    beforeEach(function() {
        success = null;
        error = null;
    });

    it('should fire the callback when an exception is thrown', function() {
        ok(obj).try('foo').catch(fn);
        assert.equal(success, true);
    });

    it('should pass the error to the callback', function() {
        ok(obj).try('foo').catch(fn);
        assert.equal(error, 'an error');
    });
});