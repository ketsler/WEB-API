'use strict';

function Promise(object, method, args) {
    this.object = object;
    this.method = method;
    this.args = args.length > 1 ? args.slice(1) : [];
}

Promise.ok = Promise.prototype = {
    "do": function(callback, context) {
        if (this.method instanceof Function) {
            var returnValue = this.method.apply(this.object, this.args);
            if (returnValue) {
                (callback || function() {}).call(context || this.object, returnValue);
            }
        }
        return context;
    },
    "catch": function(callback) {
        if (this.method instanceof Function) {
            try {
                this.method.apply(this.object, this.args);
            } catch (e) {
                callback(e);
            }
        } else {
            callback(this.method + ' is not a function.');
        }
    },
    "finally": function() {
        this.catch.apply(this, arguments);
    }
};

function Ok(obj) {
    if (this instanceof Ok) {
        this.obj = obj;
    } else {
        return new Ok(obj);
    }
}

Ok.true = true;
Ok.false = false;

Ok.ok = Ok.prototype = {
    "exists": function() {
        return this.obj !== void 0;
    },

    "has": function(key) {
        if (!(key instanceof Array)) {
            key = [key];
        }
        var self = this;
        if (key.every(function(k) {
                return Ok(self.getIfExists(k)).exists()
            })) {
            return Ok.true;
        } else {
            return Ok.false;
        }
    },
    "getIfExists": function(key) {
        if (typeof key === "undefined")
            return;
        if (Array.isArray(key)) {
            var index, value, result = [];
            for (index in key) {
                if (key.hasOwnProperty(index)) {
                    value = this.getIfExists(key[index]);
                    result.push(value);
                }
            }
            return result;
        }
        var props = key.split('.'),
            item = this.obj;

        if (typeof item !== "undefined") {
            for (var i = 0; i < props.length; i++) {
                item = item[props[i]];
                if (Ok(item).exists() === Ok.false) {
                    return item;
                }
            }
        }
        return item;
    },

    "merge": function(inObj) {
        var i, prop,
            ok = Ok(inObj),
            keys = ok.list(),
            obj = (this instanceof Ok) ? this.obj : Ok.prototype;
        for (i = 0; i < keys.length; i++) {
            prop = keys[i];
            if (ok.hasProperty(prop)) {
                obj[prop] = inObj[prop];
            }
        }
    },

    "list": function() {
        var key, props = [];
        if (Object.keys) {
            props = Object.keys(this.obj);
        } else {
            for (key in this.obj) {
                if (this.obj.has(key)) {
                    props.push(key);
                }
            }
        }
        return props;
    },

    "hasProperty": function(prop) {
        return this.obj.hasOwnProperty(prop);
    },


    "ifFunctionExists": function(methodString) {
        var method = this.getIfExists(methodString);
        return new Promise(this.obj, method, arguments);
    },

    "try": function(methodString) {
        var method = this.getIfExists(methodString);
        return new Promise(this.obj, method, arguments);
    },

    "create": function(key, value) {
        var obj = this.obj;
        var props = key.split('.');
        for (var i = 0; i < props.length - 1; ++i) {
            if (obj[props[i]] === undefined) {
                obj[props[i]] = {};
            }
            obj = obj[props[i]];
        }
        // the deepest key is set to either an empty object or the value provided
        obj[props[props.length - 1]] = value === undefined ? {} : value;
    }

};

module.exports = Ok;