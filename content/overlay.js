/*
Copyright (C) 2012 Eric Faerber

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
xtk.load('chrome://uglifyjs/content/uglifyweb.js');

if (ko.extensions == null) ko.extensions = {};

ko.extensions.uglifyjs = (function() {
  var msgLevels, prefs,
    _this = this;
  this.version = '2.0.0';
  prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.uglifyjs.");
  if (ko.notifications) {
    msgLevels = {
      INFO: Components.interfaces.koINotification.SEVERITY_INFO,
      WARNING: Components.interfaces.koINotification.SEVERITY_WARNING,
      ERROR: Components.interfaces.koINotification.SEVERITY_ERROR
    };
  } else {
    xtk.load('chrome://uglifyjs/content/konsole.js');
    msgLevels = {
      INFO: konsole.S_OK,
      WARNING: konsole.S_WARNING,
      ERROR: konsole.S_ERROR
    };
  }
  /*
  	compresses the current file
  */
  this.compressFile = function(filepath, showWarning) {
    var contents, d, file, newFilename, output, path;
    if (filepath == null) filepath = null;
    if (showWarning == null) showWarning = false;
    _this._removeLog();
    if (typeof filepath === "boolean") {
      showWarning = filepath;
      filepath = null;
    }
    if (filepath !== null) {
      file = _this._getFile(filepath);
      file.open('r');
      contents = file.readfile();
    } else {
      d = _this._getCurrentDoc();
      file = d.file;
      contents = d.buffer;
    }
    if (!file) {
      _this._log('Please save the file first', msgLevels.ERROR, 'Did you mean to compress the buffer?');
      return false;
    }
    if (file.ext === '.js') {
      output = _this._compress(contents);
      if (output) {
        path = file.URI;
        newFilename = path.replace('.js', prefs.getCharPref('extension'));
        return _this._saveFile(newFilename, output);
      }
    } else if (showWarning) {
      _this._log('Not a Javacript file', msgLevels.ERROR);
    }
    return false;
  };
  /*
  	compresses the current buffer
  */
  this.compressBuffer = function() {
    var d, output;
    _this._removeLog();
    d = _this._getCurrentDoc();
    output = _this._compress(d.buffer);
    if (output !== false) {
      d.buffer = output;
      return true;
    }
    return false;
  };
  /*
  	compress the current selection
  */
  this.compressSelection = function() {
    var output, scimoz, text, view;
    _this._removeLog();
    view = ko.views.manager.currentView;
    scimoz = view.scintilla.scimoz;
    text = scimoz.selText;
    output = _this._compress(text);
    if (output) {
      scimoz.targetStart = scimoz.currentPos;
      scimoz.targetEnd = scimoz.anchor;
      scimoz.replaceTarget(output.length, output);
      return true;
    }
    return false;
  };
  /*
  	gets the current document
  */
  this._getCurrentDoc = function() {
    return ko.views.manager.currentView.document || ko.views.manager.currentView.koDoc;
  };
  /*
  	reads an external file
  */
  this._getFile = function(filepath) {
    var reader;
    reader = Components.classes["@activestate.com/koFileEx;1"].createInstance(Components.interfaces.koIFileEx);
    reader.path = filepath;
    return reader;
  };
  /*
  	compress a string
  */
  this._compress = function(text) {
    var output;
    try {
      output = uglify(text);
    } catch (e) {
      _this._log('Error compressing javascript', msgLevels.ERROR, e.message);
    }
    return output || false;
  };
  /*
  	saves a file
  */
  this._saveFile = function(filepath, filecontent) {
    var file;
    try {
      _this._log('Saving file as: ' + filepath, msgLevels.INFO);
      file = Components.classes["@activestate.com/koFileEx;1"].createInstance(Components.interfaces.koIFileEx);
      file.path = filepath;
      file.open('w');
      file.puts(filecontent);
      file.close();
      _this._log('File saved as: ' + filepath, msgLevels.INFO);
    } catch (e) {
      _this._log('Error saving file', msgLevels.ERROR, e.message);
      return false;
    }
    return true;
  };
  /*
  	removes entry from the notifications
  */
  this._removeLog = function() {
    if (!prefs.getBoolPref('showMessages') && ko.notifications && _this.notification) {
      ko.notifications.remove(_this.notification);
    }
    return true;
  };
  /*
  	writes to the log
  */
  this._log = function(msg, level, description) {
    var noteId;
    if (level == null) level = msgLevels.INFO;
    if (description == null) description = '';
    if (level === msgLevels.ERROR || prefs.getBoolPref('showMessages')) {
      if (ko.notifications) {
        noteId = !prefs.getBoolPref('showMessages') ? 'uglifyjs' : 'uglifyjs' + (new Date().getTime());
        _this.notification = ko.notifications.add(msg, ['UglifyJS'], noteId, {
          severity: level,
          description: description
        });
      } else {
        if (description !== '') description = ': ' + description;
        konsole.popup();
        konsole.writeln('[UglifyJS] ' + msg + description, level);
      }
    }
    return true;
  };
  return this;
})();

if (typeof extensions === "undefined" || extensions === null) extensions = {};

extensions.uglify = ko.extensions.uglifyjs;
