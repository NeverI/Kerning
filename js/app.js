

var App = {

	kerningField: undefined,
	leftbar: undefined,
	topbar: undefined,
	bottombar: undefined,

	init: function(kerningFieldView, mainSetupView, topbarview, bottombarview) {
		var self = this;
		
		$('#Content').css('display', 'block').animate({'opacity': 1});

		window.onresize = this.resize(kerningFieldView);

		this.alignKerningText(kerningFieldView);

		$('input[name=FontSize]').spinner({min:1});
		$('input[name=LetterSpacing]').spinner();
		$('input[name=LineHeight]').spinner();

		this.kerningField = new KerningField(kerningFieldView[0], true);
		kerningFieldView.on('change', this.alignKerningText);

		this.leftbar = new Sidebar(mainSetupView, {
			'FontFamily': new InputParams({
					on: kerningFieldView,
					name: 'font-family',
					callback: this.alignKerningText
				}),
			'FontSize': new InputParams({
					on: kerningFieldView, 
					name: 'font-size',
					callback: this.alignKerningText, 
					valueTransfrom: function(value) {return value+'px'} 
				}),
			'LetterSpacing': new InputParams({
					on: kerningFieldView,
					name: 'letter-spacing',
					callback: function(value) {self.kerningField.setLetterSpacing(); self.alignKerningText(); },
					valueTransfrom: function(value) {return value+'px'} 
				}),
			'LineHeight': new InputParams({
					on: kerningFieldView, 
					name: 'line-height',
					callback: this.alignKerningText, 
					valueTransfrom: function(value) {return value+'px'} 
				}),
			'TextAlign': new InputParams({
					on: kerningFieldView, 
					name: 'text-align',
					inputType: InputParams.SELECT, 
					callback: function() { 
						$('#CSSOutput').text(self.kerningField.getCSSString($('input[name=isOptimazed]').is(':checked'))); 
					}
				}),
			'IsBold': new InputParams({
					on: kerningFieldView,
					name:'font-weight', 
					callback: this.alignKerningText, 
					valueTransfrom: function(value) {return value ? 'bold' : 'normal'}
				}),
			'IsItalic': new InputParams({
					on: kerningFieldView, 
					name:'font-style', 
					callback: this.alignKerningText, 
					valueTransfrom: function(value) {return value ? 'italic' : 'normal'}
				}),
			'TextColor': new InputParams({
					on: kerningFieldView, 
					name: 'color', 
					callback: function() { 
						self.kerningField.setColor(); 
						$('#CSSOutput').text(self.kerningField.getCSSString($('input[name=isOptimazed]').is(':checked'))); 
					},
					valueTransfrom: function(value) {return '#'+value}
				}),
			'BackgroundColor': new InputParams({
					on: $('body'), 
					name: 'background-color', 
					valueTransfrom: function(value) {return '#'+value}
				}),
			'Background': new InputParams({
					on: $('body'), 
					name: 'background-image',
					valueTransfrom: function(value) {return value ? "url('images/gradient.png'),url('images/noise.png')" : ''}
				})
		}, Sidebar.LEFT);
	
		this.topbar = new Sidebar(topbarview, {}, Sidebar.TOP);
		this.bottombar = new Sidebar(bottombarview, {
			'isOptimazed': new InputParams({
					on: this,
					name: 'changeCodeOutput',
					type: InputParams.FUNCTION
				})
		}, Sidebar.BOTTOM);

		$('#MainSetup input[name=TextColor]').ColorPicker({
			onChange:this.triggerChangeInColorPicker('TextColor'), color:$('#MainSetup input[name=TextColor]').val()});

		$('#MainSetup input[name=BackgroundColor]').ColorPicker({
			onChange:this.triggerChangeInColorPicker('BackgroundColor'), color:$('#MainSetup input[name=BackgroundColor]').val()});

		this.leftbar.view.on('click',function(){window.onresize()})
		this.bottombar.view.on('click',function(){window.onresize();})
		window.onresize()

		setTimeout(function(){if($('#MainInfo.closed')[0]) return;$('#MainInfo .flap').trigger('click')}, 5000)
	},

	alignKerningText: function(kerningFieldView){
		var self = this,
			input = $('input[name=isOptimazed]');

		this.alignKerningText = function(){
			kerningFieldView.css({
				'margin-left': ~~(-kerningFieldView.width()*0.5)+'px',
				'margin-top': ~~(-kerningFieldView.height()*0.5)+'px'});

			self.changeCodeOutput(input.is(':checked'));
		}

	},

	changeCodeOutput: function(isOptimazed) {
		$('#DOMOutput').text(this.kerningField.getDOMString(isOptimazed));
		$('#CSSOutput').text(this.kerningField.getCSSString(isOptimazed));
	},

	triggerChangeInColorPicker: function(name) {
		var setupInput = $('#MainSetup input[name='+name+']');
		return function() {
			setupInput.val(this.find('.colorpicker_hex input').val()).trigger('change');
		}
	},

	browserIsSucks: function() {
		if ($.browser.msie && parseFloat($.browser.version) < 9) {
			$('#Content').html('');
			return true;
		}
		return false;
	},

	resize: function(view) {
		var self = this,
		 	bottomPanel = $('#Outputs'),
			leftPanel = $('#MainSetup');

		return function(){
			var bodyWidth = document.body.offsetWidth,
				bodyHeight = document.body.offsetHeight,
				top = !bottomPanel.hasClass('closed') && bodyHeight-bottomPanel.height() < bodyHeight*0.5+view.height()*0.5+40 ? ((bodyHeight-bottomPanel.height())*0.5)-10+'px' : '50%',
				left = !leftPanel.hasClass('closed') && leftPanel.outerWidth()+40 > bodyWidth*0.5-view.width()*0.5 ? ((bodyWidth+leftPanel.outerWidth())*0.5)+'px' : '50%';

			view.css('top', top);
			view.css('left', left != '50%' && parseInt(left)+view.width()*0.5 < bodyWidth ? left : '50%');
		}
	}

}

/* -------  Sidebar ------- */
function Sidebar(view, inputparams, position){
	var self = this;

	this.view = view;
	this.inputparams = inputparams;

	this.view.on('change', 'input,select', function(e){self.changed($(e.target))});
	this.view.on('spin', function(e,ui){self.changed($(e.target), ui.value)});
	this.init(position);
}

Sidebar.LEFT = 'left';
Sidebar.RIGHT = 'right';
Sidebar.TOP = 'top';
Sidebar.BOTTOM = 'bottom';

Sidebar.prototype.init = function(position) {
	this.view.find('>:first-child').prepend('<div class="flap">&gt;</div>');
	var flap = this.view.find('.flap'), topOffset, bottomOffset;

	if ($.browser.mozilla) {
		topOffset = 3;
		bottomOffset = 5;
	} else {
		topOffset = 2;
		bottomOffset = 3;
	}

	if (position == Sidebar.LEFT)
		flap.css({'top':~~(this.view.height()*0.5-flap.outerHeight()*0.5)+'px', 'right': ~~(-flap.outerWidth()*0.75)+'px'})

	else if (position == Sidebar.RIGHT)
		flap.css({'top':~~(this.view.height()*0.5-flap.outerHeight()*0.5)+'px', 'left': ~~(-flap.outerWidth()*0.75)+'px'})

	else if (position == Sidebar.TOP)
		flap.css({'top':~~(this.view.outerHeight()-flap.outerHeight()*0.25-topOffset)+'px', 'left': ~~(this.view.outerWidth()*0.5-flap.outerWidth()*0.5)+'px'})

	else if (position == Sidebar.BOTTOM)
		flap.css({'bottom':~~(this.view.outerHeight()-flap.outerHeight()*0.25-bottomOffset)+'px', 'left': ~~(this.view.outerWidth()*0.5-flap.outerWidth()*0.5)+'px'})

	flap.on('click', this.flapClick());

	for (name in this.inputparams) 
		this.view.find(this.inputparams[name].inputType+'[name='+name+']').trigger('change');
	
};

Sidebar.prototype.changed = function(what, value) {
	var input = this.inputparams[what.attr('name')];
	if (!input) return;
	
	if (value === undefined) {
		if (what.attr('type') == 'checkbox') value = what.is(':checked');
		else value = what.attr('value');
	}

	value = input.convert(value);

	if (input.type == InputParams.CSS) 
		input.on.css(input.name, value);

	else if (input.type == InputParams.PARAM)
		input.on[input.name] = value;

	else if (input.type == InputParams.FUNCTION)
		input.on[input.name](value);

	if (input.callback) input.callback();

};

Sidebar.prototype.flapClick = function() {
	var self = this;
	return function() {
		self.view.toggleClass('closed');
		self.view.find('.flap').text(self.view.hasClass('closed') ? '<' : '>');
	}
};

/* -------  Input Params ------- */
function InputParams(opt) {
	this.name = opt.name;
	this.type = opt.type ? opt.type : InputParams.CSS;
	this.inputType = opt.inpuType ? opt.inpuType : InputParams.INPUT;
	this.callback = opt.callback;
	this.on = opt.on;
	this.valueTransfrom = opt.valueTransfrom;
}

InputParams.INPUT = 'input';
InputParams.SELECT = 'select';

InputParams.CSS = 'css';
InputParams.PARAM = 'param';
InputParams.FUNCTION = 'func';

InputParams.prototype.convert = function(value) {
	return this.valueTransfrom ? this.valueTransfrom(value) : value;
};

/* -------  init ------- */

$(document).ready(function(){
	if (App.browserIsSucks()) return;
	App.init($('#Text'), $('#MainSetup'), $('#MainInfo'), $('#Outputs'));
})
