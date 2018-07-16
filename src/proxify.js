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
		return typeof data === 'object' && data !== null && data !== global && !isInstanceOf(data);
	}

	return function proxify (data, options) {
		const onSet = options.onSet || options.onChange || noop;
		const onGet = options.onGet || noop;
		const filter = options.filter || noop;
		const validator = {
			get (target, key) {
				if (key === 'isProxy') {
					return true;
				}
				// console.log('get key', typeof target[key], key, target);
				onGet(key, target);
				return target[key];

			},
			set (target, key, value) {
				if (target[key] === value || target.isProxy || filter(key)) {
					return true;
				}
				// console.log('set', key, value, 't:', target);
				target[key] = proxify(value, options);
				onSet(value, key, target);
				return true;
			}
		};

		if (isSimpleObject(data)) {
			if (Array.isArray(data)) {
				data.forEach((item, i) => {
					if (typeof item === 'object' && item !== null) {
						data[i] = proxify(item, options);
					}
				});
			} else {
				Object.keys(data).forEach((key) => {
					const prop = data[key];
					if (typeof prop === 'object' && prop !== null) {
						data[key] = proxify(prop, options);
					}
				});
			}
			return new Proxy(data, validator);
		}
		return data;
	};

}));
