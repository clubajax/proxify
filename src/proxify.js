(function (root, factory) {
	if (typeof customLoader === 'function'){ customLoader(factory, 'proxify'); }
	else if (typeof define === 'function' && define.amd){ define([], factory); }
	else if(typeof exports === 'object'){ module.exports = factory(); }
	else{ root.returnExports = factory();
		window.proxify = factory(); }
}(this, function () {

	const noop = function () {};
	const global = typeof window !== undefined ? window : global;
	const instances = [Date, Promise, Map, Set, WeakMap, Error];
	function isInstanceOf (data) {
		return instances.some(I => data instanceof I);
	}
	function isSimpleObject (data) {
		return typeof data === 'object' && data !== null && data !== global && !data.isProxy && !isInstanceOf(data);
	}

	function copy (data) {
		if (!data) {
			return data;
		}
		if (Array.isArray(data)) {
			return data.map((item) => {
				if (item && typeof item === 'object') {
					return copy(item);
				}
				return item;
			});
		}
		if (data.isProxy || isSimpleObject(data)) {
			return Object.keys(data).reduce((obj, key) => {
				const item = data[key];
				if (typeof item === 'object') {
					obj[key] = copy(item);
				} else {
					obj[key] = data[key];
				}
				return obj;
			}, {});
		}
		return data;
	}

	return function proxify (data, options = {}, key) {
		const onSet = options.onSet || options.onChange || noop;
		const onGet = options.onGet || noop;
		const filter = options.filter || noop;
		const validator = {
			get: function (target, key) {
				if (key === 'isProxy') {
					return true;
				}
				if (key === 'copy') {
					return function () {
						return copy(target);
					}
				}
				if (key === 'log') {
					return function () {
						if (arguments.length) {
							console.log(Array.prototype.slice.call(arguments).join(' '), copy(target));
						} else {
							console.log(copy(target));
						}
					}
				}
				// console.log('get key', typeof target[key], key, target);
				onGet(key, target);
				return target[key];

			},
			set: function (target, key, value) {
				if (target[key] === value) {
					return true;
				}
				// console.log('set', key, value, 't:', target);
				target[key] = proxify(value, options, key);
				if (!filter(key)) {
					onSet(value, key, target);
				}
				return true;
			}
		};

		if (!filter(key) && isSimpleObject(data, key)) {
			if (Array.isArray(data)) {
				data.forEach((item, i) => {
					if (typeof item === 'object' && item !== null) {
						data[i] = proxify(item, options, key);
					}
				});
			} else {
				Object.keys(data).forEach((key) => {
					if (filter(key)) {
						return;
					}
					const prop = data[key];
					if (typeof prop === 'object' && prop !== null) {
						data[key] = proxify(prop, options, key);
					}
				});
			}
			return new Proxy(data, validator);
		}
		return data;
	};

}));
