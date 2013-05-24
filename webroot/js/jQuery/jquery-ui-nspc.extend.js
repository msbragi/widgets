(function($) {
	$.widget("nspc.dialogForm", $.ui.dialog, {
		options: {
			url: null,
			title: 'Modal dialog form',
			width: $(window).width() * 0.80,   // default width
			height: $(window).height() * 0.85, // default height
			modal: true,
			buttons: {
				"Chiudi": function () {
					$(this).dialogForm('close');
				},
		    	"Registra": function () {
		    		var self = $(this);
		    		var form   = self.find('form:first');
					var data   = form.serialize();
					var action = form.attr('action');
					$.post(action, data , function(returnData) {
						self.html(returnData);
					});
					self.scrollTop(0);
					return false; 
				}
			}
		},
		_create: function() {
			this._super();
		},
		_init: function() {
			this.element.html('');
			if(this.options.url) {
				this.element.load(this.options.url);
			}
			this._super();
		}
    });

	$.nspc.dialogForm.overlayInstances = 0;
	
	$.widget("nspc.dialogIframe", $.ui.dialog, {
		options: {
			url: null,
			title: 'Modal dialog iframe',
			width: $(window).width() * 0.80,   // default width
			height: $(window).height() * 0.85, // default height
			modal: true
		},
		_create: function() {
			this._super();
			this.iframe = $('<iframe width="100%" height="100%" marginWidth="0" marginHeight="0" frameBorder="0" scrolling="auto" />');
			this.iframe.appendTo(this.element);
		},
		_init: function() {
			if(this.options.url) {
				this.iframe.attr('src', this.options.url);
			}
			this._super();
		},
		close: function() {
			this.iframe.html('');
			this.iframe.attr('src', '');
			this._super();
		}
    });

	$.nspc.dialogIframe.overlayInstances = 0;

})(jQuery);