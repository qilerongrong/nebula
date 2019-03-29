;V.registPlugin("v.ui.messageBox",function(){
	V.Classes.create({
		className:"v.ui.MessageBox",
		superClass:"v.ui.Dialog",
		init:function(){
		    this.options.modal = false;
		    this.options.height = 100;
			this.options.width = 200;
			this.options.title = "Message";
			this.options.message = "Your Message...";
		}
	});
	(function(MessageBox){
	    MessageBox.prototype.init = function(options){
	    	for(prop in options){
	    		this.options[prop] = options[prop];
	    	}
		    $('.modal-footer',this.template).remove();
			$('.modal-header',this.template).css('padding','4px 15px');
			this.template.css('font-size','12px');
			//$('.modal-header h3',this.template).text(this.options.title).css({'font-size':'12px',color:'#08c'});
			$('.modal-header h3',this.template).text(this.options.title).css({'font-size':'12px',color:'red'});
			$('.modal-body',this.template).css('padding','4px 15px');
			//$('.modal-body',this.template).css('padding','4px 15px').css('color','red');
			var w_w = $(window).width();
			var w_h = $(window).height();
			this.template.css({
			    position:'fixed',
				width:this.options.width,
				height:this.options.height,
				top:w_h,
				left:w_w-this.options.width-10,
				overflow:'hidden',
				padding:0,
				margin:0,
				backgroundColor:'#eee',
				'z-index':10001
			});
			this.initDomEvent();
			this.showMessage(this.options.message);
		}
		MessageBox.prototype.showMessage = function(msg){
		    this.setContent($("<p>"+msg+"</p>"));
			this.open();
			var top = this.template.position().top-this.options.height-20;
			this.template.animate({top:top},500);
		}
		V.showMessage=function(msg){
			var msgBox = new V.Classes['v.ui.MessageBox']();
			msgBox.init({
				height : 120,
				title : 'System Message'
			});
			msgBox.showMessage(msg);
		};
	})(V.Classes['v.ui.MessageBox'])
},{plugins:["v.ui.dialog"]});
