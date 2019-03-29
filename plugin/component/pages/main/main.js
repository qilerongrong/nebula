;V.registPlugin("v.component.pages.main",function(){
	V.Classes.create({
		className:"v.component.pages.Main",
		superClass:"v.Plugin",
		init:function(){
		    this.ns = "v.component.pages.main";
			this.curPlugin = null;
		    this.header = new V.Classes['v.component.pages.Header']();
		    this.footer = new V.Classes['v.component.pages.Footer']();
		    this.nav = new V.Classes['v.component.pages.Navigation']();
		    this.page = new V.Classes['v.component.pages.Page']();
			this.menus = [];
			this.content = null;
			this.template = $('<div class="app"><div class="wrapper">\
				<div id="header"></div>\
			    <div id="nav"></div>\
				<div id="content">\
				<div id="msgcontainer" class="alert"><button class="close">×</button><strong class="title"></strong><span></span></div>\
				<div id="main"></div>\
				</div>\
				<div id="footer"></div>\
			</div></div>');
			this.EVENT = {
				MENU_INITED:'menu_loaded'
			}
			if(!V.app){
				V.app = {};
			}
			V.app.layout = this;
		}
	});
	(function(Layout){
	    Layout.prototype.init = function(){
			$('body').append(this.template);
			this.header.init({container:$('#header',this.template)});
			this.subscribe(this.nav,this.nav.EVENT.LOAD_CONTENT,this.loadContent);
			var that = this;
			this.subscribe(this,this.EVENT.MENU_INITED,function(){
				that.nav.init({container:$('#nav',that.template),menus:that.menus});
				that.page.init({container:$('#main'),menus:that.menus});
			});
			this.footer.init({container:$('#footer',this.template)});
			this.initMenus();
			this.initEvent();
		}
		Layout.prototype.initEvent = function(){
			$.ajaxSetup({timeout:120000});
			var that = this;
			V.MessageBus.subscribe('loadPage',function(data){
				that.loadContent(data,true);
			});
			$('#msgcontainer .close').click(function(){
				$('#msgcontainer').hide();
			});
			$('#msgcontainer').ajaxError(function(e, xhr, settings, exception){
				var code = xhr.status;
				var statusText = xhr.statusText;
				if(code == CONSTANT.GLOBAL.EXCEPTION.SYSTEMERROR){
					var msg = {
					    type : 'ERROR'
						,title : '错误：'
						,info : xhr.responseText
					}
					that.showMsg(msg);
				}else if(code == CONSTANT.GLOBAL.EXCEPTION.SESSION){
					var msg = {
					    type : 'ERROR'
						,title : '错误：'
						,info : "用户会话已过期,请重新登录。"
					}
					//that.showMsg(msg);
				    setTimeout(function(){document.location.href="login.jsp"},200);
				}else{
					if(statusText == "timeout"){
						var msg = {
						    type : 'ERROR'
							,title : 'Timeout：'
//							,info : "The request has not completed for long time. Many reasons including temporary network issue could have caused that. Please retry your last action. If issue persists, please contact IT Support."
							,info : "请求超时，请重试。"
						}
						that.showMsg(msg);
					}else{
						var msg = {
						    type : 'ERROR'
							,title : '错误：'
							,info : xhr.responseText
						}
						that.showMsg(msg);
					}
				}
			});
		}
		Layout.prototype.initPage = function(options){
			var opt = options||{};
			opt.container = $('#main');
			opt.menus = this.menus;
			var that = this;
			V.loadPlugin('v.component.pages.page',function(){
				$('#main').empty();
				var page = that.page = new V.Classes['v.component.pages.Page']();
				page.init(opt);
			});
		}
		/**
		 * 加载插件内容
		 */
		Layout.prototype.loadContent = function(data,isReload){
			this.page.loadTabsPanel(data.menu,isReload);
		}
		Layout.prototype.initMenus = function(){
			var that = this;
			 $.ajax({
                url:'index.action',
                success:function(menus){
				    that.menus = menus;
					that.publish({eventId:that.EVENT.MENU_INITED})
				}
			})
		}
		Layout.prototype.showMsg = function(msg){
			msg.type = msg.type || 'INFO';
			if(msg.title){
				$('#msgcontainer strong').text(msg.title);
			}
			$('#msgcontainer span').text(msg.info);
			$('#msgcontainer').css({opacity:1}).show();
			if(msg.type == 'INFO'){
				$('#msgcontainer').addClass('alert-info');
				setTimeout(function(){
					$('#msgcontainer').animate({opacity:0},2000,function(){
						$('#msgcontainer').hide();
					});
				},8000);
			}else if(msg.type == 'SUCCESS'){
				$('#msgcontainer').addClass('alert-success');
				setTimeout(function(){
					$('#msgcontainer').animate({opacity:0},2000,function(){
						$('#msgcontainer').hide();
					});
				},8000);
			}else if(msg.type == 'ERROR'){
				$('#msgcontainer').addClass('alert-error');
			}else{
				return;
			}
		}
		Layout.prototype.initLayout = function(){
			if(!this.layout){
				return;
			}
			var ns = "v.component.layout."+this.layout+".main";
			var that = this;
			V.loadPlugin(ns,function(){
				var glass = V._registedPlugins[ns].glass;
				var inst = new V.Classes[glass]()
				inst.init();
			})
		}
	})(V.Classes['v.component.pages.Main']);
},{plugins:['v.fn.requestHelper','v.constant','v.component.pages.header','v.component.pages.footer','v.component.pages.navigation','v.component.pages.page','v.ui.dialog']});