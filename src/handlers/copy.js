'use strict';

var path = require('path');
var fs = require('fs-extra');

function touch(src, dest) {
    console.log('[touched]', src, '->', dest);
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
						 touch(src, dest);
					}
				} else {
					console.log('[delete]', dest);
					fs.remove(dest);
				}
			}
		}
        console.log("");
	}
}
