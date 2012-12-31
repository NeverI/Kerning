
var KerningField = (function() {

Action = {
	RESTORE: 'RESTORE'
}

/* ------------- KerningField ----------- */
function KerningField(view, canVertical) {
	this.view = view;
	this.smartView = undefined;
	this.baseLetterSpacing = 0;
	this.letters = new Letters(this);
	this.action = '';
	this.selectedColor = '';
	this.canVertical = canVertical;

	this.frameworkInit()
	this.setLetterSpacing();
	this.setText(this.view.innerHTML);
}

KerningField.prototype.frameworkInit = function() {
	var self = this;
	this.smartView = $(this.view);
	this.smartView.on('dblclick', this.enableEditable());
	this.smartView.on('blur', this.disableEditable());
	this.smartView.on('keyup', this.editKeyEventHandler());
	this.smartView.on('keydown', 'span', this.controlKeyEventHandler());
	this.smartView.on('focusin', 'span', function(e){
		self.smartView.find('span').css('color', '');

		$(e.target).css('color', self.selectedColor);
	});
	this.smartView.on('focusout', 'span', function(e){
		self.smartView.find('span').css('color', '');
	})
	
};
KerningField.prototype.triggerChange = function() { this.smartView.trigger('change'); }
KerningField.prototype.focus = function() { this.smartView.focus(); };
KerningField.prototype.blur = function() { this.smartView.blur(); };


KerningField.prototype.setLetterSpacing = function(value) {
	this.baseLetterSpacing = value !== undefined ? value : parseInt(this.view.style.letterSpacing);
	this.baseLetterSpacing = this.baseLetterSpacing ? this.baseLetterSpacing : 0;
	this.letters.refresh();
};

KerningField.prototype.setColor = function(value) {

	var c, hsl, lOffset = 0.1, hOffset = 0.07;

	this.selectedColor = value !== undefined ? value : this.view.style.color;
	if (this.selectedColor.indexOf('rgb') != -1) {
		c = hexFromRGBStyle(this.selectedColor);
		hsl = rgb2Hsl(c[1], c[2], c[3]);
		
	} else {
		c = hex2Rgb(this.selectedColor);
		hsl = rgb2Hsl(c[1], c[2], c[3]);
	}

	if (hsl[0]+hOffset > 1) hsl[0] -= hOffset;
	else hsl[0] += hOffset;

	if (hsl[2]-lOffset < 0) hsl[2] += lOffset;
	else hsl[2] -= lOffset;

	c = hsl2Rgb(hsl[0], hsl[1], hsl[2]);

	this.selectedColor = '#' + ((1 << 24) + (c[0] << 16) + (c[1] << 8) + c[2]).toString(16).slice(1);

}

KerningField.prototype.setText = function(text) {
	var i, len, j, jlen, lines, line;

	text = text.replace(/$(<br>)+/, '');
	text = text.replace(/<div>/g, '<br>').replace(/<\/div>/g, ''); // for safari
	text = text.replace(/<p>/g, '').replace(/<\/p>/g, ''); // for ie, opera
	text = text.replace(/&nbsp;/g, ''); // for ie

	if (text.replace(/<br>/g, '') == '') text = 'Kerning';

	this.letters.resetCursor();
	lines = this.splitByBR(text);

	for (j=0,jlen=lines.length;j<jlen;j++) {
		line = lines[j];

		if (line.indexOf('<span')!==-1) {
			line = line.split('/span>')
			for (i=0,len=line.length;i<len;i++) {
				this.letters.set(line[i]);
			}
		} else {
			this.letters.set(line);
		}

		if ( j != jlen-1)
			this.letters.set('<br>');
	}

	this.letters.appendLetters(this.view);

};

KerningField.prototype.splitByBR = function(text) {
	if ( text.indexOf('<br>')!==-1 ) return text.split('<br>');
	if ( text.indexOf('<br/>')!==-1 ) return text.split('<br/>');
	if ( text.indexOf('<br />')!==-1 ) return text.split('<br />');

	return [text];
}

KerningField.prototype.enableEditable = function() {
	var self = this;
	self.enableEditable = function(e) {
		self.view.setAttribute('contenteditable','true');
		while (self.view.firstChild) 
  			self.view.removeChild(self.view.firstChild);
		self.focus();
	}

	return self.enableEditable;
};

KerningField.prototype.disableEditable = function() {
	var self = this;
	self.disableEditable = function(e) {
		self.view.setAttribute('contenteditable','false');

		if (self.action != Action.RESTORE) {
			self.setText(self.view.innerHTML.replace(/<div><br><\/div>/g, ''));
			self.triggerChange();
		} else {
			self.action = '';
		}
	}

	return self.disableEditable;
};

KerningField.prototype.restoreLastState = function() {
	this.letters.appendLetters(this.view);
	this.action = Action.RESTORE;
	this.blur();
}

KerningField.prototype.controlKeyEventHandler = function() {
	var self = this;
	self.controlKeyEventHandler = function(e) {
		var letter = e.target.letterObject;
		if (!letter) return;

		switch(e.keyCode) {
			case 68:
			case 39: //right
				letter.setLetterSpacing(letter.letterSpacing + (e.shiftKey ? 10 : 1), self.baseLetterSpacing);
				break;

			case 65:
			case 37: //left
				letter.setLetterSpacing(letter.letterSpacing - (e.shiftKey ? 10 : 1), self.baseLetterSpacing);
				break;

			case 87:
			case 38: //top
				if (self.canVertical)
					letter.setVerticalSpacing(letter.verticalSpacing - (e.shiftKey ? 10 : 1));
				break;

			case 85:
			case 83: //bottom
				if (self.canVertical)
					letter.setVerticalSpacing(letter.verticalSpacing + (e.shiftKey ? 10 : 1));
				break;
		}
		self.triggerChange();	
	}
	return self.controlKeyEventHandler;
}

KerningField.prototype.editKeyEventHandler = function() {
	var self = this;
	self.editKeyEventHandler = function(e) {
		switch(e.keyCode) {
			case 27:
				self.restoreLastState();
				break;
			case 13:
				if (e.shiftKey) {
					e.preventDefault();
					self.letters.set('<br/>');
					self.triggerChange();
				} else 
					self.blur();
				break;
		}

	}

	return self.editKeyEventHandler;
};

KerningField.prototype.getDOMString = function(isOptimazed) {
	return '<div class="kerned">'+
		this.letters.getDOMString(isOptimazed)+'\n</div>';
}

KerningField.prototype.getCSSString = function(isOptimazed) {
	var s = '.kerned {', c;

	if (this.view.style.color.indexOf('rgb') != -1) {
		c = hexFromRGBStyle(this.view.style.color);
		s += 'color: '+rgb2Hex(c[1], c[2], c[3]);
	} else
		s += 'color: '+this.view.style.color;
	s += '; font-size: '+this.view.style.fontSize;
	if (this.view.style.fontStyle != 'normal')
		s += '; font-style: '+this.view.style.fontStyle;
	s += '; font-family: '+this.view.style.fontFamily;
	s += '; line-height: '+this.view.style.lineHeight;
	s += '; text-align: '+this.view.style.textAlign;
	if (this.view.style.fontWeight != 'normal')
		s += '; font-weight: '+this.view.style.fontWeight;
	s += '}\n\n';

	return s+this.letters.getCSSString(isOptimazed);
}

/* --------------- Letters --------------- */
function Letters(parent) {
	this.parent = parent;
	this.data = [new Letter('')];
	this.cursor = 0;
	this.exp = {
		'chars': />(.+)</,
		'letterSpacing': /lp_(.+)/,
		'verticalSpacing': /vp_(.+)/
	}
}

Letters.prototype.resetCursor = function() { this.cursor = 0; };

Letters.prototype.setCursor = function(index) {
	if (index !== undefined) 
		this.cursor = index;
}

Letters.prototype.set = function(value, index) {
	
	var chars, letter, i, len,
		letterSpacing=0, 
		verticalSpacing=0;

	if (value.indexOf('<span') === 0) {		
		chars = value.match(this.exp['chars']);

		if (!chars || !chars[1]) return;
		chars = chars[1];

		letterSpacing = this.getParamFromClass('letterSpacing', value);
		verticalSpacing = this.getParamFromClass('verticalSpacing', value);

	} else if (value.indexOf('<br') === 0) {
		chars = [value];

	} else {
		chars = value;
	}
	
	this.setCursor(index);
	for (i=0, len=chars.length;i<len;i++) {
		letter = this.setInvidual(chars[i]);
		letter.setLetterSpacing(letterSpacing, this.parent.baseLetterSpacing);
		letter.setVerticalSpacing(verticalSpacing);
		this.cursor++;
	}

	return letter;
};

Letters.prototype.setInvidual = function(value){

	if (this.data[this.cursor])
		this.data[this.cursor].set(value);
	else
		this.data[this.cursor] = new Letter(value);

	return this.data[this.cursor];
}

Letters.prototype.get = function(index) {
	return this.data[index];
}

Letters.prototype.getParamFromClass = function(name, value) {
	var m = value.match(this.exp[name]);
	return m && m[1] ? parseInt(m) : 0;
};

Letters.prototype.getCSSString = function(isOptimazed) {
	var s = '', lp, vp, i, len;

	if (isOptimazed) {
		for (i=0,len=this.cursor;i<len;i++) {
			lp = this.data[i].getLetterSpacing(this.parent.baseLetterSpacing);
			vp = this.data[i].verticalSpacing;
			if (lp !== 0 ) {
				if (s.indexOf('ls_'+lp+' ') == -1)
					s += '.ls_'+lp+' { letter-spacing: '+lp+'px;}\n';
			}
			if (vp !== 0 ) {
				if (s.indexOf('vs_'+vp+' ') == -1)
					s += '.vs_'+vp+' { top: '+vp+'px;}\n';
			}
		}
	}

	return s;
}

Letters.prototype.getDOMString = function(isOptimazed) {
	var s = '', 
		i, len, letter, ls, vs, isOpened, isClosed;

	if (!isOptimazed) {
		for (i=0,len=this.cursor;i<len;i++) {
			letter = this.data[i];
			if (letter.isBrake) s += letter.value;
			else 
			s += '\n\t<span style="letter-spacing:'+letter.getLetterSpacing(this.parent.baseLetterSpacing)+'px;top:'+letter.verticalSpacing+'px">'+letter.value+'</span>'; 
		}
	} else {
		ls = this.data[0].getLetterSpacing(this.parent.baseLetterSpacing);
		vs = this.data[0].verticalSpacing;
		for (i=0,len=this.cursor;i<len;i++) {
			letter = this.data[i];
			if (letter.isBrake) {
				s += '</span>';
				s += letter.value;
				isOpened = false;
				isClosed = true;
			} 
			else if (letter.getLetterSpacing(this.parent.baseLetterSpacing)==ls && letter.verticalSpacing == vs) {
				if (!isOpened) {
					s += '\n\t<span'+this.getClasses(ls, vs)+'>';
					isOpened = true;
					isClosed = false;
				}
				s += letter.value;
			} else {
				if (!isClosed) {
					s += '</span>';
					isClosed = false;
				}
				ls = letter.getLetterSpacing(this.parent.baseLetterSpacing);
				vs = letter.verticalSpacing;
				
				s += '\n\t<span'+this.getClasses(ls, vs)+'>'+letter.value;
				isOpened = true;
			}
		}
		s += '</span>';
	}
	return s;
}

Letters.prototype.getClasses = function(ls, vs) {
	var s = ''
	if (ls || vs) {
		s += ' class="'+(ls ? 'ls_'+ls : '');
		s += (ls && vs ? ' ' : '')+(vs ? 'vs_'+vs : '');
		s += '"'
	}
	return s;
}

Letters.prototype.appendLetters = function(parentView) {
	var i,len;

	while (parentView.firstChild) 
  		parentView.removeChild(parentView.firstChild);

	for (i=0,len=this.cursor;i<len;i++)
		parentView.appendChild(this.data[i].view);
	
}

Letters.prototype.refresh = function() {
	var letter;
	for (var i=0;i<this.cursor;i++) {
		letter = this.data[i];
		if (letter.isBrake) {
			this.data[i-1].setLetterSpacing(-this.parent.baseLetterSpacing, this.parent.baseLetterSpacing);
		} else
			letter.setLetterSpacing(undefined, this.parent.baseLetterSpacing);
	}

	letter = this.data[this.cursor-1];
	if (letter)
		letter.setLetterSpacing(-this.parent.baseLetterSpacing, this.parent.baseLetterSpacing);
};

/* --------------- Letter --------------- */
function Letter(value) {
	this.view = undefined;
	this.value = '';
	this.letterSpacing = 0;
	this.verticalSpacing = 0;
	this.isBrake = false;
	this.set(value);
}

Letter.prototype.set = function(value) {
	if (!value) value = '';
	
	if (value.indexOf('<br')==0) {
		if (!this.view || this.view.nodeName.toLowerCase() != 'br') {
			this.view = document.createElement('br');
			this.isBrake = true;
		}
	} else {
		if (!this.view || this.isBrake) {
			this.view = document.createElement('span');
			this.view.setAttribute('tabindex', '1');
			this.view.letterObject = this;
			this.isBrake = false;
		}
		this.view.innerHTML = value;
	}
	this.value = value;
	
};

Letter.prototype.getLetterSpacing = function(baseLetterSpacing) { return baseLetterSpacing + this.letterSpacing; }
Letter.prototype.setLetterSpacing = function(value, baseLetterSpacing) {
	if (this.isBrake) return;

	if (value!==undefined)
		this.letterSpacing = value;

	this.view.style.letterSpacing = this.getLetterSpacing(baseLetterSpacing)+'px';
}

Letter.prototype.setVerticalSpacing = function(value) {
	if (this.isBrake) return;

	if (value!==undefined)
		this.verticalSpacing = value;

	this.view.style.top = this.verticalSpacing+'px';
}


/* ------------------- color convesion ----------------- */
function hex2Rgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
}

function rgb2Hex(r,g,b) {
	var rgb = b | (g << 8) | (r << 16);
    return '#' + rgb.toString(16);
}

function hexFromRGBStyle(str) {
	return str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
}

function rgb2Hsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

function hue2Rgb(p, q, t){
    if(t < 0) t += 1;
    if(t > 1) t -= 1;
    if(t < 1/6) return p + (q - p) * 6 * t;
    if(t < 1/2) return q;
    if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
}

function hsl2Rgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2Rgb(p, q, h + 1/3);
        g = hue2Rgb(p, q, h);
        b = hue2Rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

return KerningField;

})();