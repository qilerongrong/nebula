;V.registPlugin("v.views.pages.main",function(){
	V.Classes.create({
		className:"v.views.pages.Main",
		superClass:"v.component.pages.Main",
		init:function(){
		    this.ns = "v.views.pages.main";
		    this.header = new V.Classes['v.views.pages.Header']();
		    this.footer = new V.Classes['v.views.pages.Footer']();
		    this.nav = new V.Classes['v.views.pages.Navigation']();
		    this.layout = 'layout5';
		}
	});
	(function(Layout){
		Layout.prototype.init = function(){
			// var layout = $.cookie('layout');
			// if(layout){
			// 	this.layout = layout;
			// }
			if(this.layout){
				this.initLayout();
				return;
			}
			$.cookie('lang','zh-CN');
			Layout.superclass.init.call(this);
			
			$('#content',this.template).append('<div id="console"></div>'); //console container
			
			//加载控制台
			this.loadContent({
				'menu':{plugin:'v.views.home.myConsole',menuCode:'1000000000',menuName:'我的控制台',module:'CONSOLE'}
			})
			V.loadPlugin('v.views.dictInfo',function(){
			})
//			$(document).ajaxStart(function(a,b,c,d){
//			});
            $('textarea').live('mouseover',function(){
                $(this).attr('title',$(this).val());
            });
		}
		Layout.prototype.initEvent = function(){
			var that = this;
			Layout.superclass.initEvent.call(this);
			//if(LoginInfo.user.loginStatus!=CONSTANT.LOGIN_STATUS.FIRST_LOGIN){ //非首次登陆
				that.initUserNotices();
			//}
			/*
			document.onkeydown = function(e) { //捕捉回车事件
			    var ev = (typeof event!= 'undefined') ? window.event : e;
			    if(ev.keyCode == 13) {
			        return false;
			    }
			}*/
		}
		Layout.prototype.initUserNotices = function(){
			V.loadPlugin('v.views.pages.userNotices',function(){
				var userNotices = new V.Classes['v.views.pages.UserNotices']();
				userNotices.init();
			});
		}
		/*
		 * 加载插件内容
		 */
		Layout.prototype.loadContent = function(data){
			var that = this;
			var menu = data.menu;
			if(menu&&menu.module != "CONSOLE"){ //菜单
				$('#main',this.template).show();
				$('#console',this.template).hide();
				Layout.superclass.loadContent.call(this,data);
			}else{ //控制台
				var options = {};
				var plugin = menu.plugin;
	            options.container = $('#console',this.template);
	            options.plugin = plugin||'';
				var that = this;
				V.loadPlugin(plugin,function(){
					$('#console',this.template).empty();
					$('#main',this.template).hide();
					$('#console',this.template).show();
				    var glass = V._registedPlugins[plugin].glass;
					var inst = new V.Classes[glass]();
					if(plugin=='v.views.home.myConsole'){
						that.subscribe(inst,inst.EVENT.LOAD_CONTENT,function(data){
							that.loadConsoleContent(data);
						})
					}
					inst.init(options);
				});
				that.logInformation(data);
			}
		}
		/*
		 * 控制台插件v.views.home.myConsole子类特殊处理部分
		 * data：跳转到具体插件配置参数
		 * data.plugin: plugin list
		 * data.content: plugin detail
		 * data.from:console 控制台来源，标签页组件处理策略，先删除，在新增
		 */
		Layout.prototype.loadConsoleContent = function(data){
			var that = this;
			var plugin = data.plugin;
			var content = data.content;
			if(data.navCode){ //带菜单的
				$('#main',this.template).show();
				$('#console',this.template).hide();
				Layout.superclass.loadContent.call(this,{'menu':data},true);
				if(content){ //console detail
//					var list_opt = {
//						module : module,
//						container : tabContent,
//						menuCode : tabCode
//					}
					V.MessageBus.publish({eventId:"addCrumb",data:{ns:data.pluginList,options:data,name:data.menuName}});
				}
			}else{
				var options = data;
				var plugin = data.plugin;
	            options.container = $('#console',this.template);
	            options.plugin = plugin||'';
				var that = this;
				V.loadPlugin(plugin,function(){
					$('#console',this.template).empty();
					$('#main',this.template).hide();
					$('#console',this.template).show();
				    var glass = V._registedPlugins[plugin].glass;
					var inst = new V.Classes[glass]();
					inst.init(options);
				});
			}
		}
		Layout.prototype.showMsg = function(msg){
			V.alert(msg.info);
		}
	})(V.Classes['v.views.pages.Main']);
},{plugins:['v.component.pages.main',
            'v.component.searchList',
            'v.ui.dynamicGrid',
            'v.views.constant',
            'v.views.loginInfo',
            'v.views.pages.header',
            'v.views.pages.footer',
            'v.views.pages.navigation'
            ]});