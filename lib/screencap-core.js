var ffmpeg = require('fluent-ffmpeg');
var path = require('path');
var fs = require('fs');
var isWin = /^win/.test(process.platform);
var isMac = /^darwin/.test(process.platform);
var isLin = /^linux/.test(process.platform);

function screencap(options,fileout) {
	var input = 'video=screen-capture-recorder';
	var inputScreen = 'x11grab';
	if (isWin) {
		inputScreen = 'dshow';
	}
	if (isMac) {
		input = 'video=0';
		inputScreen = 'avfoundation';
	}
	if (isLin) {
		input = ':0.0+0,0';
	}
	self = this;
	if (typeof options == 'string') {
		fileout = options;
		options = '';
	}
	if (typeof fileout == "undefined") { fileout = false; }
	if (typeof options == "undefined") { options = {}; }
	if (typeof options.videoCodec == "undefined") { options.videoCodec = false; }
	if (typeof options.videoBitrate == "undefined") { options.videoBitrate = false; }
	if (typeof options.audioBitrate == "undefined") { options.audioBitrate = false; }
	this.videoCodec = options.videoCodec || "libx264";
	this.videoBitrate = options.videoBitrate || "1000k";
	this.audioBitrate = options.audioBitrate || "96k";
	this.format = options.format || "mp4";
	if (fileout) {
	        this.file = path.resolve(""+ fileout +"");
	} else {
		this.file = null;
	}
	this.capture = function(duration) {
		if (typeof duration =='undefined' || !duration || parseInt(duration)<0 || isNaN(parseInt(duration))) {
			duration = 5;
		}
		console.log("Starting Screen Capture: Duration ", duration, " seconds");
		console.log("Screen Capture Output: ", this.file);
		console.log("Press Ctrl+C To Abort The Capture");
		ffmpeg()
		.videoCodec(this.videoCodec)
		.videoBitrate(this.videoBitrate)
		.audioBitrate(this.audioBitrate)
		.addOptions([
			"-pix_fmt yuv420p",
			"-preset veryfast",
			"-tune zerolatency",
			"-threads 2",
			"-async 1"
		])
		.input(input)
		.inputOptions([
			'-t '+ duration +'',
			'-f '+ inputScreen +''
		])
		.format(this.format)
		.on('end', function() {
			console.log('Screen Capture Completed.');
		})
		.save(this.file)
		.on('error', function(e) {
			console.log("ERROR:",e);
		});
	};
	this.gif = function(height,duration) {
		if (typeof duration =='undefined' || !duration || parseInt(duration)<0 || isNaN(parseInt(duration))) {
			duration = 5;
		}
		console.log("Starting Screen Recording: Duration ", duration, " seconds");
		console.log("Screen Recording Output: ", this.file);
		console.log("Press Ctrl+C To Abort The Recording");
		ffmpeg()
		.addOptions([
			"-pix_fmt rgb24",
			'-filter:v scale=-1:'+ height,
			"-preset veryfast",
			"-tune zerolatency",
			"-threads 2",
			"-async 1"
		])
		.input(input)
		.inputOptions([
			'-t '+ duration +'',
			'-f '+ inputScreen +''
		])
		.format('gif')
		.on('end', function() {
			console.log('Screen Recording Complete.');
		})
		.save(this.file)
		.on('error', function(e) {
			console.log("ERROR:",e);
		});
	};
	this.shot = function() {
		console.log("Starting Screen Shot");
		console.log("Saving To: ", this.file);
		ffmpeg()
		.videoBitrate(this.videoBitrate)
		.audioBitrate(this.audioBitrate)
		.duration('0.1')
		.input(input)
		.inputOptions([
			'-r 1',
			'-f '+ inputScreen +''
		])
		.on('end', function() {
			console.log('file has been converted succesfully');
		})
		.save(this.file)
		.on('error', function(e) {
			// Supress Errors
		});
	};
	this.capturePipe = function(duration,res) {
		if (typeof duration =='undefined' || !duration || parseInt(duration)<0 || isNaN(parseInt(duration))) {
			duration = 5;
		}
		console.log("Starting Screen Capture: Duration ", duration, " seconds");
		console.log("Screen Capture Piped");
		console.log("Press Ctrl+C To Abort The Capture");
		ffmpeg()
		.videoCodec(this.videoCodec)
		.videoBitrate(this.videoBitrate)
		.audioBitrate(this.audioBitrate)
		.addOptions([
			"-preset veryfast",
			"-tune zerolatency",
			"-threads 2",
			"-async 1"
		])
		.input(input)
		.inputOptions([
			'-t '+ duration +'',
			'-f '+ inputScreen +''
		])
		.inputFPS(10)
		.fps(10)
		.format(this.format)
		.on('end', function() {
		  console.log('file has been converted succesfully');
		})
		.on('error', function(err) {
		  console.log('an error happened: ' + err.message);
		})
		.pipe(res, {end:true});
	};
	this.shotPipe = function(res) {
		console.log("Starting Screen Shot");
		console.log("Piping");
		ffmpeg()
		.videoBitrate(this.videoBitrate)
		.audioBitrate(this.audioBitrate)
		.duration('0.1')
		.input(input)
		.inputOptions([
			'-r 1',
			'-f '+ inputScreen +''
		])
		.format('png')
		.on('end', function() {
			console.log('file has been converted succesfully');
		})
		.pipe(res, {end:true});
	};

	return this;

}

module.exports = screencap;