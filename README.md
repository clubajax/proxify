# proxify

Deep replace data with a new Proxy listeners

`proxify` uses UMD, so it will work with globals, AMD, or Node-style module exports.

## Installation

To install using npm:

    npm install @clubajax/proxify --save
    
You can clone the repository with your generic clone commands as a standalone 
repository or submodule.

	git clone git://github.com/clubajax/proxify.git

`proxify` has no dependencies.

## Description

The primary function is to make it to set change an object and all of its child objects to Proxies, 
so all changes will emit change-callbacks.

## Support

`proxify` supports modern browsers. IE11 is not tested but should work with a [proxy shim](https://github.com/GoogleChrome/proxy-polyfill).

This library uses UMD, meaning it can be consumed with RequireJS, Browserify (CommonJS),
or a standard browser global.

## Usage

Signature: 

    proxifiedData = proxify(dataToBeProxified, options)

### options:

* **onChange:** called back when a property is set
* **onSet:** same as `onChange`
* **onGet:** called back when a property is accessed
* **filter:** a function that returns a boolean. If the result is true, the passed data will not be proxified.
properties will still be set, but events will not fire.


```jsx harmony
const data = {
	x: 1,
	deep: {
		y: 2
	}
};

const proxifiedData = proxify(data, {
	onChange: function (value, key, target) {
		console.log('changed', key, value);
	},
	filter (key) {
		return key !== 'foo';
	}
});
```

### extras

While debugging, a proxified object is difficult to inspect, because of the Proxy layers.
To help with this, there are two methods, `copy` and `log`:

    proxifiedData.copy(); // returns a non-proxy copy
    proxifiedData.log(message); // sends a non-proxy copy to the console, with optionsla message
   
## License

This uses the [MIT license](./LICENSE). Feel free to use, and redistribute at will.