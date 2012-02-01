# About

Implements [UglifyJS](https://github.com/mishoo/UglifyJS) into [Komodo](http://www.activestate.com/komodo-ide).

# Install

[Download the lastest version](https://github.com/wGEric/Komodo-UglifyJS/downloads) and open with Komodo or [follow these instructions](http://docs.activestate.com/komodo/6.1/tutorial/tourlet_extensions.html#tourlet_install_extension_top)

# Use

Goto to Tools -> UglifyJS and select an option.

* _Compress Saved JS File_ takes a .js file and compresses it into a new file with the same name but ending in .min.js
* _Compress Current Buffer_ takes the contents of the current buffer and compresses it.
* _Compress Selection_ takes the current selection and compresses it.

# Macro

You can [create a macro](http://docs.activestate.com/komodo/6.1/macros.html#macros_top) that will automatically compress a JavaScript file when you save. Use the following code and have it trigger _After file save_:

    if (extensions.uglify) {
        extensions.uglify.compressFile();
    }

# Change Log

## 1.1.0

* Updated UglifyJS compressor to v1.2.5
* Added support for saving remote files
* Added a preference pane to choose the file extension (.min.js) and disable debug messages when saving files
