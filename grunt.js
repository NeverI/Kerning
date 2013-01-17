module.exports = function(grunt) {

	grunt.initConfig({
		mincss: {
			css: {
				files: {
			      "css/base.min.css": ["css/base.css", "css/colorpicker.css"]
			    }
			}
		},

		min: {
			js: {
				src: ['js/colorpicker.js', 'js/kerningfield.js', 'js/app.js'],
				dest: 'js/app.min.js'
			}
		}
	});

  grunt.registerTask('default', ['min', 'mincss']);

};

