;V.registPlugin("v.ui.dialog",function(){
	V.Classes.create({
		className:"v.ui.Dialog",
		superClass:"v.Plugin",
		init:function(){
		    this.options = {
				width:788,
			    height:488,
			    dragable:false,
				animate:true,
				icons:['close'],
				modal:true,
				title:"Dialog",
				position:"right",
				state:"closed",
				isFull:false
			};
			this.template = $('\
				<div class="modal">\
				   <div class="modal-header">\
					<h3 class="tit"></h3>\
				  </div>\
				  <div class="modal-body" style="overflow:auto">\
				  </div>\
				  <div class="modal-footer">\
				  </div>\
				</div>');
			 this.EVENT = {
				OPEN:'open',
				CLOSE:'close'
			}
		}
	});
	(function(Dialog){
		Dialog.prototype.init = function(options){
			if(options.isFull){
				this.container = $('body');
			}else{
				this.container = $('#global_tabscontent .tab-pane-page.active');
				if($('#main').is(':hidden')){
					this.container = $('body');
				}
			}
		    for(prop in options){
			    this.options[prop] = options[prop];
			}
            $('.modal-header .tit',this.template).text(this.options.title);
            var that = this;
            $.each(this.options.icons,function(index,icon){
            	if(icon == 'close'){
            		var icon_close = $('<button class="close" data-dismiss="modal"></button>');
            		$('.modal-header',that.template).append(icon_close);
            	}else if(icon == 'max'){
            		var icon_max = $('<button class="max_win" data-dismiss="modal"></button>');
	            	icon_max.toggle(function(){
	            		$(this).removeClass('max_win').addClass('min_win');
	            		that.windowToMax();
	            	},function(){
	            		$(this).removeClass('min_win').addClass('max_win');
	            		that.windowToInit();
	            	})
	            	$('.modal-header',that.template).append(icon_max);
            	}
            });
            var warpper_h = $('#global_tabscontent').height();
            var scrollTop = $('#global_tabscontent').scrollTop();
            var w_w = $('#global_tabscontent').width();
            if(this.options.isFull){
            	warpper_h = $(window).height();
            	scrollTop = $(window).scrollTop();
            	w_w = $(window).width();
            }
            var w_h = this.container.height();
			
			this.template.css({
			    position:'absolute',
				width:this.options.width,
				height:this.options.height,
				top:(warpper_h-this.options.height)/2+scrollTop-40,
				left:(w_w-this.options.width)/2,
				overflow:'hidden',
				padding:0,
				margin:0,
				opacity:0,
				zIndex:1
			});
			if(this.options.isFull){
				this.template.css('z-index',10001);
			}
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
			$('.modal-body',this.template).empty().append($(con));
		}
		Dialog.prototype.addModalShadow = function(){
		    this.shadow = $('<div class="dialog-shadow"></div>');
			this.shadow.css(
				{
					width:'100%',
					height:this.container.height(),
					'z-index':1,
					opacity:0.1,
					background:'#000',
					top:0,
					left:0,
					position:'absolute'
				}
			);
			if(this.options.isFull){
				this.template.css('z-index',10001);
			}
		}
		Dialog.prototype.open = function(){
		    if(this.options.state == "open"){
			    return;
			}
			this.options.state = "open";
			if(this.options.modal){
			   this.container.append(this.shadow);
			}
			this.container.append(this.template);
			
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
			this.publish({eventId:this.EVENT.CLOSE});
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
                var icon = btns[i].icon;
			    var btn = $('<a href="javascript:void(0);" class="btn '+style+'">'+btns[i].text+'</a>');
			    if(icon){
			    	btn.prepend('<i class="+icon+"></i>');
			    }
				var handler = btns[i].handler;
				btn.click(function(){var i= $('.modal-footer .btn',that.template).index(this);btns[i].handler&&btns[i].handler.call(that);});
				$('.modal-footer',this.template).append(btn);
			}
		}
		Dialog.prototype.windowToMax = function(){
			this.template.css({
				width:'100%',
				height:'100%',
				top:0,
				left:0
			});
		}
		Dialog.prototype.windowToInit = function(){
			var w_h = $(window).height();
			var w_w = $(window).width();
			this.template.css({
				width:this.options.width,
				height:this.options.height,
				top:(w_h-this.options.height)/2,
				left:(w_w-this.options.width)/2
			});
		}
	})(V.Classes['v.ui.Dialog'])
});
