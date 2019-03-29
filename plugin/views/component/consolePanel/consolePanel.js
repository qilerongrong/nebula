;V.registPlugin("v.views.component.consolePanel",function(){
	V.Classes.create({
		className:"v.views.component.ConsolePanel",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.component.consolePanel";
		    this.title = 'title';
		    this.icon = null;
			this.module = '';
			this.options = {};
			this.EVENT = {
			    LOAD_CONTENT:'load_content',
				//console panel loaded
				LOADED : 'loaded',
				DELETE : 'delete',
				REFRESH : 'refresh'
		    };
			this.template = $('<div class="v-consolePanel v-box" style="position:relative"><div class="header v-box-tit"><span class="title"></span><span class="customTools"><i class="btn_toggle toggle_up"></i></span></div><div class="con v-box-con"></div></div>');
		}
	});
	(function(ConsolePanel){
        ConsolePanel.prototype.init = function(options){
			this.container = options.container;
			this.module = options.module;
			this.options = options;
			$('.title',this.template).text(this.title);
			this.container.append(this.template);
			if(this.icon){
				var icon = $('<i class="'+this.icon+'"></i>');
				$('.header',this.template).prepend(icon);
			}
			this.subscribe(this,this.EVENT.LOADED,this.removeLoadingShadow);
			this.addLoadingShadow();
			this.initContent ();
			this.panelHeight = this.container.height();
			this.event();
		}
		ConsolePanel.prototype.event = function(){
		    var that = this;
		    $('.icon-trash',this.template).click(function(){
		        that.publish({eventId:that.EVENT.DELETE,data:that.ns});
		    });
		    $('.icon-refresh',this.template).click(function(){
                that.refresh();
            });
            $('.btn_toggle',this.template).toggle(function(){
            	var header_h = $('.header').height();
            	$(this).removeClass('toggle_up').addClass('toggle_down');
            	that.container.animate({
            		height:header_h
            	},500);
            },function(){
            	$('.v-box-con',that.template).show();
            	$(this).removeClass('toggle_down').addClass('toggle_up');
            	that.container.animate({
            		height:that.panelHeight
            	},500)
            });
		}
		ConsolePanel.prototype.addLoadingShadow = function(){
			var h = parseInt(this.template.height()) - parseInt($('.header',this.template).height());
			this.loadingShadow = $('<div></div>').css({height:h,width:'100%',background:'#efefef url(imgs/loading_16.gif) center no-repeat',position:'absolute',top:24,left:0,'z-index':1,opacity:0.7});
			this.template.append(this.loadingShadow);
		}
		ConsolePanel.prototype.removeLoadingShadow = function(){
			this.loadingShadow.remove();
		}
		ConsolePanel.prototype.initContent = function(){
			this.log('initContent Method should be overwrote.');
		}
		ConsolePanel.prototype.refresh = function(){
		    $('.con',this.template).empty();
            this.initContent();
        }
	})(V.Classes['v.views.component.ConsolePanel']);
})