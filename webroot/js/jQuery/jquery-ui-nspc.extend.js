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
					var self   = $(this);
		    		var form   = self.find('form:first');
					var data   = form.serialize();
					var action = form.attr('action');
					$.post(action, data, function(returnData){
						self.html(returnData);
					});
					self.scrollTop(0);
					return false; 
				}
			}
		},
		_create: function() {
			this._super();
			if(this.options.url) {
				this.element.load(this.options.url);
			};
		}
    });
})(jQuery);
