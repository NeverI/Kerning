Kerning Playground
==================

[Try it: kerning.nevisite.com](http://kerning.nevisite.com)
-------------------------------------

CMS Integration
---------------

You can integrate the basic kerning functionality into a CMS with a simple div and the ./js/kerningfield.js.
- select a letter and press the ARROW or WASD keys (whit SHIFT)
- double click on the text and change it (ENTER,ESC,SHIFT+ENTER)

Example:

goes to the CMS admin page:
```html
<div id="Text">Kerning</div>
```

```javascript
// This will take care all of kerning stuff
// Second parameter true if you want use vertical 'kerning'
var field = new KerningField($('#Text')[0], false); 

// Get and save the dom string.
// Next time the KerningField will parse the optimazed dom string
var domOutput = field.getDOMString(true);
```

goes to the live page (from the domOutput):
```html
<div class="kerned">
	<span class="ls_-1">K</span>
	<span>er</span>
	<span class="ls_-4">nin</span>
	<span>g</span>
</div>
```
goes to the live page (manually setup some case...):
```css
.ls_-4 { letter-spacing: -4px}  
.ls_-3 { letter-spacing: -3px}  
.ls_-2 { letter-spacing: -2px} 
.ls_-1 { letter-spacing: -1px}
.ls_1 { letter-spacing: 1px}
.ls_2 { letter-spacing: 2px}
.ls_3 { letter-spacing: 3px}
.ls_4 { letter-spacing: 4px}
```

I made with jQuery, but the KerningField only use it for event handling, so you can easily change to other library.

Roadmap
-------
- Mobil device support
- maybe support IE 8, IE7...