// tools for common Komodo extension chores
xtk.load('chrome://uglifyjs/content/toolkit.js');
// Komodo console in Output Window
xtk.load('chrome://uglifyjs/content/konsole.js');

// UglifyWeb (https://github.com/jrburke/uglifyweb)
xtk.load('chrome://uglifyjs/content/uglifyweb-1.1.1.js');

/**
 * Namespaces
 */
if (typeof(extensions) === 'undefined') extensions = {};
if (typeof(extensions.uglify) === 'undefined') extensions.uglify = { version : '1.0.0' };

(function() {
	var self = this;
	
	this.compressFile = function(showWarning) {
		showWarning = showWarning || false;
		
		var d = ko.views.manager.currentView.document || ko.views.manager.currentView.koDoc,
			file = d.file,
			path = (file) ? file.path : null;
		
		if (!file) {
			self._log('Please save the file first', konsole.S_ERROR);
			return;
		}

		if (file.ext == '.js') {
			self._log('Compressing Javascript file', konsole.S_DEBUG);
		
			try {
				var output = uglify(d.buffer),			
					newFilename = path.replace('.js', '.min.js');
					
				if (output) {				
					self._saveFile(newFilename, output);
					self._log('File saved as: ' + newFilename, konsole.S_OK);
				} else {
					self._log('Error parsing JavaScript', konsole.S_ERROR);
				}
			}
			catch(e) {
				self._log('Error parsing JavaScript', konsole.S_ERROR);
			}
		} else {
			if (showWarning) {
				self._log('Not a JavaScript file', konsole.S_ERROR);
			}
		}
	};
	
	this.compressBuffer = function() {
		try {
			var d = ko.views.manager.currentView.document || ko.views.manager.currentView.koDoc,
				output = uglify(d.buffer);
			
			if (output) {
				d.buffer = output;
			} else {
				self._log('Error parsing JavaScript', konsole.S_ERROR);
			}
		}
		catch(e) {
			self._log('Error parsing JavaScript', konsole.S_ERROR);
		}
	};
	
	this.compressSelection = function() {
		var view = ko.views.manager.currentView,
			scimoz = view.scintilla.scimoz;
			text = scimoz.selText;
		
		try {
			var output = uglify(text);
	
			if (output) {
				scimoz.targetStart = scimoz.currentPos;
				scimoz.targetEnd = scimoz.anchor;
				scimoz.replaceTarget(output.length, output);
			} else {
				self._log('Error parsing JavaScript', konsole.S_ERROR);
			}
		}
		catch(e) {
			self._log('Error parsing JavaScript', konsole.S_ERROR);
		}
	};
	
	this._saveFile = function(filepath, filecontent) {
		self._log('Saving file', konsole.S_DEBUG);
		
		var file = Components
			.classes["@activestate.com/koFileEx;1"]
			.createInstance(Components.interfaces.koIFileEx);
		file.path = filepath;
		
		file.open('w');
		
		file.puts(filecontent);
		file.close();
		
		return;
	};
	
	this._log = function(message, style) {
		konsole.popup();
		konsole.writeln('[UglifyJS] ' + message, style);
	};
	
	
}).apply(extensions.uglify);