'use strict';

var __slice = Array.prototype.slice;

function PromiseAll(tasks) {
	return function() {
		return Promise.all(tasks.map(function(task) {
			return task();
		}));
	}
}

function Foal() {
	var self = this;
	self.task = function(taskName, options, fn) {
		var _task_bind_to = options.bindToFoal ? self : global;
		if (typeof options === 'function' && !fn) fn = options;
		_task_bind_to[taskName] = function() {
			var args = __slice.call(arguments);
			return function() {
				return new Promise(function(resolve) {
					var taskResult = fn.apply(_task_bind_to, args);
					if (taskResult) 
						if (taskResult.isPromise) taskResult.promise.then(resolve);
						else taskResult.on('data', function() {}).on('end', resolve);
					else resolve();
				});
			}
		};
	};
	self.run = function() {
		var args = __slice.call(arguments);
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
}

module.exports = new Foal();