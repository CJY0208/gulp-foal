'use strict';

var slice = Array.prototype.slice;

function PromiseAll(tasks) {
    return function() {
        return Promise.all(tasks.map(function(task) {
            return task();
        }));
    }
}

function Foal(bindedObj) {
    this.bindedObj = bindedObj || this;
}

Foal.prototype.task = function(taskName, fn) {
    var bindedObj = this.bindedObj;
    bindedObj[taskName] = function() {
        var args = slice.call(arguments);
        return function() {
            return new Promise(function(resolve) {
                var taskResult = fn.apply(bindedObj, args);
                if (taskResult) 
                    if (taskResult.isPromise) taskResult.promise.then(resolve);
                    else taskResult.on('data', function() {}).on('end', resolve);
                else resolve();
            });
        }
    };
    return this;
};

Foal.prototype.run = function() {
    var args = slice.call(arguments);
    if (args.length === 0) {
        console.log('Foal-Error: Your task list is Empty.');
        return;
    }
    var promises;
    var done = args.length > 1 ? typeof args[args.length - 1] === 'function' ? args.pop() : null : null;
    args.forEach(function(tasks, idx) {
        if (({}).toString.call(tasks) !== '[object Array]') tasks = [tasks];
        promises = idx === 0 ? PromiseAll(tasks)() : promises.then(PromiseAll(tasks));
    });
    if (done) promises = promises.then(function() {return done()});
    return {
        isPromise: true,
        promise: promises
    };
};

Foal.prototype.bindTo = function(obj) {
    this.bindedObj = obj || this.bindedObj;
};

module.exports = function(obj) {
    return new Foal(obj);
};
