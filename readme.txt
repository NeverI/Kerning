Kerning Playground
==================

Try it: [http://kerning.nevisite.com]
-------------------------------------

CMS Integration
---------------

You can integrate the basic kerning functionality into a CMS with a simple div and the ./js/kerningfield.js.
- select a letter and press the ARROW or WASD keys (whit SHIFT)
- double click on the text and change it (ENTER,ESC,SHIFT+ENTER)

	<div id="Text">Kerning</div>

	/* 	
		This will take care all of kerning stuff
		Second parameter true if you want use vertical 'kerning'
	*/
	var field = new KerningField($('#Text')[0], false); 

	/*
		Get and save the dom string.
		Next time the KerningField will parse the optimazed dom string
	*/
	var domOutput = field.getDOMString(true);


I made with jQuery, but the KerningField only use it for event handling, so you can easily change to other library.

Roadmap
-------
- Mobil device support
- maybe support IE 8, IE7...