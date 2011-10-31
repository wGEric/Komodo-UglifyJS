# About

Implements [UglifyJS](https://github.com/mishoo/UglifyJS) into [Komodo](http://www.activestate.com/komodo-ide). 

# Install

http://docs.activestate.com/komodo/6.1/tutorial/tourlet_extensions.html#tourlet_install_extension_top

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