'use strict';

var path = require('path');
var fs = require('fs-extra');
var process = require('process');

function gettime() {
	var hrTime = process.hrtime();
	return 	hrTime[0] * 1000000 + hrTime[1] / 1000;
}

function touch (filename) {

	console.log('[touch]', filename);
	console.log(gettime());

	const fs = require('fs');
	const time = new Date();

	try {
	  fs.utimesSync(filename, time, time);
	} catch (err) {
	  fs.closeSync(fs.openSync(filename, 'w'));
	}

}

var calls = {};

function touch_delayed(src, filename) {

	const time = gettime();
	var timeout = 0;

	console.log('time='+time+' calls[src]='+calls[src]);
	console.log('diff='+(time - calls[src])); 

	const minTimeout = 15;

	if(src in calls) {
		if(time - calls[src] < minTimeout * 1000) {
			timeout = minTimeout;
		}
	}

	calls[src] = time+timeout*1000;

	// const timeout = Math.random()*50;
	console.log('timeout ' + timeout);
	setTimeout(() => touch(filename), timeout);
}

function link (src, dest) {

	console.log('[copy]', src, '->', dest);

	const parent = path.dirname(dest);
	fs.ensureDir(parent, (err) => {

		try {
			fs.link(src, dest, (err) => {

				if(err) {
				console.log(err);
				} else {
					console.log('[success]', src, '->', dest);
				}
			});
		} catch(e) {
			console.log(e);
		}

	});
}

module.exports = function (config) {
	return function (resp) {
		for (var i in resp.files) {
			var f = resp.files[i];
			if (f.type === 'f') {
				var src = path.join(config.src, f.name),
				    dest = path.join(config.dest, f.name);

				if (f.exists) {
					if(!fs.existsSync(dest)) {
						link(src, dest);	
					} else {
						touch_delayed(src, dest);
					}
				} else {
					console.log('[delete]', dest);
					fs.remove(dest);
				}
			}
		}
	}
}
