###
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
###

xtk.load 'chrome://uglifyjs/content/uglifyweb.js'

ko.extensions ?= {}
ko.extensions.uglifyjs = do () ->
	@version = '2.0.0'

	# preferences
	prefs = Components.classes["@mozilla.org/preferences-service;1"]
        .getService(Components.interfaces.nsIPrefService).getBranch("extensions.uglifyjs.")

	# message levels
	if ko.notifications
		# komodo 7+ so use the notifications area
		msgLevels =
			INFO : Components.interfaces.koINotification.SEVERITY_INFO
			WARNING : Components.interfaces.koINotification.SEVERITY_WARNING
			ERROR : Components.interfaces.koINotification.SEVERITY_ERROR

	else
		# load the konsole script to write to the output
		xtk.load 'chrome://uglifyjs/content/konsole.js'

		msgLevels =
			INFO : konsole.S_OK
			WARNING : konsole.S_WARNING
			ERROR : konsole.S_ERROR

	###
	compresses the current file
	###
	@compressFile = (filepath = null, showWarning = false) =>
		@_removeLog()

		# if filepath is a boolean then it is really the showWarning variable
		if typeof filepath is "boolean"
			showWarning = filepath
			filepath = null

		# setup the variables, either get them from the external file or from the current document
		unless filepath is null
			file = @_getFile filepath
			file.open 'r'
			contents = file.readfile()
		else
			# get the current document
			d = @_getCurrentDoc()
			file = d.file
			contents = d.buffer

		# make sure there is a file. If there isn't, it hasn't been saved
		unless file
			@_log 'Please save the file first', msgLevels.ERROR, 'Did you mean to compress the buffer?'
			return false

		# make sure it is a javascript file
		if file.ext == '.js'
			output = @_compress(contents);

			if output
				path = file.URI
				newFilename = path.replace '.js', prefs.getCharPref 'extension'
				return @_saveFile newFilename, output
		else if showWarning
			@_log 'Not a Javacript file', msgLevels.ERROR

		return false

	###
	compresses the current buffer
	###
	@compressBuffer = () =>
		@_removeLog()

		d = @_getCurrentDoc()

		output = @_compress(d.buffer) # compress the javascript

		unless output is false
			d.buffer = output
			return true

		false

	###
	compress the current selection
	###
	@compressSelection = () =>
		@_removeLog()

		view = ko.views.manager.currentView
		scimoz = view.scintilla.scimoz
		text = scimoz.selText
		output = this._compress(text);

		if output
			scimoz.targetStart = scimoz.currentPos;
			scimoz.targetEnd = scimoz.anchor;
			scimoz.replaceTarget output.length, output;
			return true

		false

	###
	gets the current document
	###
	@_getCurrentDoc = () =>
		ko.views.manager.currentView.document or ko.views.manager.currentView.koDoc

	###
	reads an external file
	###
	@_getFile = (filepath) =>
		reader = Components
				.classes["@activestate.com/koFileEx;1"]
				.createInstance Components.interfaces.koIFileEx

		reader.path = filepath
		reader

	###
	compress a string
	###
	@_compress= (text) =>
		try
			output = uglify text
		catch e
			@_log 'Error compressing javascript', msgLevels.ERROR, e.message

		output || false

	###
	saves a file
	###
	@_saveFile = (filepath, filecontent) =>
		try
			@._log 'Saving file as: ' + filepath, msgLevels.INFO
			file = Components
				.classes["@activestate.com/koFileEx;1"]
				.createInstance Components.interfaces.koIFileEx

			file.path = filepath

			file.open 'w'

			file.puts filecontent
			file.close()

			@_log 'File saved as: ' + filepath, msgLevels.INFO
		catch e
			@._log 'Error saving file', msgLevels.ERROR, e.message
			return false

		true

	###
	removes entry from the notifications
	###
	@_removeLog = () =>
		if not prefs.getBoolPref('showMessages') and ko.notifications and @notification
			ko.notifications.remove @notification

		true

	###
	writes to the log
	###
	@_log = (msg, level = msgLevels.INFO, description = '') =>
		# only show a message if it is an error or the preference has been set for it
		if level is msgLevels.ERROR or prefs.getBoolPref 'showMessages'
			if ko.notifications
				noteId = unless prefs.getBoolPref 'showMessages' then 'uglifyjs' else 'uglifyjs' + (new Date().getTime())
				# komodo 7+ notifications
				@notification = ko.notifications.add msg, ['UglifyJS'], noteId, {
					severity : level,
					description : description
				}
			else
				# konsole
				unless description is ''
					description = ': ' + description

				konsole.popup()
				konsole.writeln '[UglifyJS] ' + msg + description, level
		true

	@

# legacy support
extensions ?= {}
extensions.uglify = ko.extensions.uglifyjs;
