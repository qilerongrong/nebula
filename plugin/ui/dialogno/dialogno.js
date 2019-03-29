;V.registPlugin("v.ui.dialogno",function(){
	V.Classes.create({
		className:"v.ui.Dialogno",
		superClass:"v.Plugin",
		init:function(){
		    this.options = {
				width:400,
			    height:300,
			    dragable:false,
				animate:true,
				resize:false,
				modal:true,
				title:"Dialog",
				position:"center",
				state:"closed"
			};
			this.template = $('\
				<div class="modal">\
				   <div class="modal-header">\
					<button class="close" data-dismiss="modal"></button>\
					<h3></h3>\
				  </div>\
				  <div class="modal-body">\
				  </div>\
				  <div class="modal-footer">\
				  </div>\
				</div>');
		}
	});
	(function(Dialog){
		Dialog.EVENT_OPEN = "dialog_open";
		Dialog.EVENT_CLOSE = "dialog_close";
		Dialog.prototype.init = function(options){ 
		    for(prop in options){
			    this.options[prop] = options[prop];
			}
            $('.modal-header h3',this.template).text(this.options.title);
			var w_h = $(window).height();
			var w_w = $(window).width();
			var scrollTop = $(window).scrollTop();
			this.template.css({
			    position:'absolute',
				width:this.options.width,
				height:'auto',
				top:(w_h-this.options.height)/2+scrollTop-40,
				left:(w_w-this.options.width)/2,
				overflow:'hidden',
				padding:0,
				margin:0,
				opacity:0,
				'z-index':10001
			});
			var that = this;
			if(this.options.modal){
			    this.addModalShadow();
			}
			this.initDomEvent();
			this.open();
		}
		Dialog.prototype.initDomEvent = function(){
		    var that = this;
		    $('.close',this.template).click(function(){
			    that.options.state = "closed";
			    that.close();
				that.publish({eventId:Dialog.EVENT_CLOSE});
			})
		}
		Dialog.prototype.setContent = function(con){
			$('.modal-body',this.template).append($(con));
		}
		Dialog.prototype.addModalShadow = function(){
		    this.shadow = $('<div class="dialog-shadow"></div>');
			this.shadow.css({width:$(window).width(),height:$('body').height(),'z-index':10000,opacity:0.4,background:'#000',top:0,left:0,position:'absolute'});
		}
		Dialog.prototype.open = function(){
		    if(this.options.state == "open"){
			    return;
			}
			this.options.state = "open";
			if(this.options.modal){
			   $('body').append(this.shadow);
			}
			$('body').append(this.template);
			//set content height;
			var header = $('.modal-header',this.template);
			var header_h = parseInt(header.outerHeight(true));
			
			var footer =  $('.modal-footer',this.template);					  
			var footer_h = parseInt(footer.outerHeight(true))	
			
			var body = $('.modal-body',this.template);
			var _h = this.options.height-header_h-footer_h
			$('.modal-body',this.template).height(_h);
			
			var t = this.options.animate?500:0;
			this.template.animate({top:"+=40",opacity:1},(this.options.animate?500:0));
		}
		Dialog.prototype.hide = function(){
		    
		}
		Dialog.prototype.close = function(){
			if(this.options.modal){
			    this.shadow.remove();
			}
			this.template.remove();
		}
		Dialog.prototype.setTitle = function(tit){
		    this.options.title = tlt;
			$('.modal-header h3',this.template).text(tit);
		}
		Dialog.prototype.getContent = function(){
			return $('.modal-body',this.template);
		}
		/*config:{position:left/right/center,btns:[{text:'btn1',handler:fn}]}
		*/
		Dialog.prototype.setBtnsBar = function(config){
		    $('.modal-footer',this.template).show().empty();
		    var position = config.position||"right";
			$('.modal-footer',this.template).css('text-align',position);
			var btns = config.btns;
			var that = this;
			for(var i=0,l = btns.length;i<l;i++){
                var style = btns[i].style||'';
			    var btn = $('<a href="javascript:void(0);" class="btn '+style+'"></a>');
				var handler = btns[i].handler;
				btn.text(btns[i].text).click(function(){var i= $('.modal-footer .btn',that.template).index(this);btns[i].handler&&btns[i].handler.call(that);});
				$('.modal-footer',this.template).append(btn);
			}
		}
	})(V.Classes['v.ui.Dialogno'])
});
