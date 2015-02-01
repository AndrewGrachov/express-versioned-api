process.env.NODE_ENV = 'test';
var exec = require('child_process').fork,
	child;
child = exec('./app.js');
child.on('message', function (msg) {
	if (msg === 'online') {
		var mocha = require('child_process').exec('mocha --reporter spec --ui bdd -c', function (err, stdout, stderr) {
			child.kill();
			if (err) {
				console.log('error:', err);
				console.error(stdout);
				return process.exit(127);
			}
			console.log('Finished tests');
			process.exit();
		});

		mocha.stdout.on('data', function (data) {
			console.log(data);
		});
		mocha.stderr.on('data', function (data) {
			console.error(data);
		});
	}
});