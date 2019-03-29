;V.registPlugin("v.component.pages.page",function(){
    V.Classes.create({
        className:"v.component.pages.Page",
		superClass:"v.Plugin",
        init:function(){
            this.ns = 'v.component.pages.page';
            this.tabsPanel = null;
			this.menus = [];
			this.menu = null;
            this.options = {
            	menu:null
            };
            this.template = $('<div id="manage" class="well"><div class="stretch"><div class="menu">\
            <a class="btn_stretch " href="#" title="隐藏"><i class="icon-arrow-left"></i></a>\
            <ul class="nav nav-list"></ul>\
            </div><div class="content"></div></div></div>');
            this.EVENT = {
            	MENU_SHRINK : 'menu_shrink'
            }
        }
    });
    (function(Page){
        Page.prototype.init = function(options){
			this.container = options.container;
			this.menus = options.menus;
            delete options['container'];
            for(prop in options){
                this.options[prop] = options[prop];
            }
            this.initEvent();
            this.initTabsPanel();
            this.container.append(this.template);
		}
        Page.prototype.initEvent = function(){
        	var that = this;
            $('.btn_stretch',this.template).toggle(function(){
				var con = $(this).parent().parent();
				con.removeClass('stretch').addClass('shrink');
				$(this).attr('title','展开菜单').parent().children('ul').hide();
				$('i',this).removeClass('icon-arrow-left').addClass('icon-arrow-right');
				that.publish({eventId:that.EVENT.MENU_SHRINK,data:$(this)});
			},function(){
				var con = $(this).parent().parent();
				con.removeClass('shrink').addClass('stretch');
				$(this).attr('title','隐藏菜单').parent().children('ul').show();
				$('i',this).removeClass('icon-arrow-right').addClass('icon-arrow-left');
				that.publish({eventId:that.EVENT.MENU_SHRINK,data:$(this)});
			});
        }
        Page.prototype.initMenu = function(){
            var that = this;
            var menus = [];
            $.each(this.menus,function(){
                if(this.id == that.menu.navCode){
                    menus = this.children;
                    return false;
                }
            });
            var ul = $('ul',that.template.find('.menu')).empty();
            $.each(menus,function(){
                var items = this.children;
                var menul2 = $('<li class="nav-header" data-code="'+this.id+'"><i class="icon-menu2 '+this.icon+'"></i><span class="menu_name">'+this.name+'</span></li>');
                menul2.click(function(){
                	var l3 = $(this).next();
                	if($(this).hasClass('open')){
                		while(l3&&l3.length>0&&!l3.hasClass('nav-header')){
                			if(l3.hasClass('divider')){
                				l3 = l3.next();
                				continue;
                			}
                    		l3.hide();
                    		l3 = l3.next();
                    	}
                		$(this).removeClass('open');
                		return;
                	}
                	var activeMenu = $('.menu .nav-header.open',that.template);
                	l3 = activeMenu.next();
                	while(l3&&l3.length>0&&!l3.hasClass('nav-header')){
                		if(l3.hasClass('.divider')){
                			l3 = l3.next();
            				continue;
            			}
                		l3.hide();
                		l3 = l3.next();
                	}
                	activeMenu.removeClass('open');
                	$(this).addClass('open');
                	l3 = $(this).next();
                	while(l3&&l3.length>0&&!l3.hasClass('nav-header')){
                		l3.show();
                		l3 = l3.next();
                	}
                });
                ul.append(menul2);
                ul.append('<li class="divider"></li>');
                $.each(items,function(){
					var plugin = this.data?this.data.ns:'';
					var module = this.data?this.data.module:'';
					var cateCode = this.data?this.cateCode:'';
					var docketType = this.data?this.docketType:'';
					var processKey = this.data?this.processKey:'';
                    var m = $('<li data-code="'+this.id+'"><a href="#"  data-plugin="'+plugin+'"><i class="icon-arrow"></i><span class="menu-name">'+this.name+'</span></a></li>');
                    $('a',m).data("menu",{"variables":{"cateCode":cateCode,"docketType":docketType,"processKey":processKey},'module':module,'menuName':this.name,'menuCode':this.id,'navCode':that.menu.navCode,'plugin':plugin}).click(function(){
                        var p = $(this).attr('data-plugin');
                        var d = $(this).data('menu');
                        if(p){
                        	that.loadTabsPanel(d);
                        }
                    })
                    m.hide();
                    ul.append(m);
                })
            });
            this.activeNavAndMenu();
        }
        Page.prototype.initTabsPanel = function(){
        	var that = this;
			var con = $('.content',this.template).empty();
			var p = 'v.component.pages.tabsPanel';
			V.loadPlugin(p,function(){
				var glass = V._registedPlugins[p].glass;
				var inst = that.tabsPanel = new V.Classes[glass]();
				var opt = {};
				opt.container = con.empty();
				inst.init(opt);
				/**
				 * 如果有初始化菜单，则加载该菜单plugin
				 */
				if(that.menu){
					that.loadTabsPanel(that.menu);
				}
				//订阅tab点击事件，更新菜单
				that.subscribe(that.tabsPanel,that.tabsPanel.EVENT.TAB_CLICK,function(data){
					that.menu = data;
	            	that.initMenu();
	            })
	            //订阅菜单展开点击事件
				that.tabsPanel.subscribe(that,that.EVENT.MENU_SHRINK,function(data){
	            	that.tabsPanel.repartTabWidth();
	            })
			})
        }
        Page.prototype.loadTabsPanel = function(menu,isReload){
			this.menu = menu;
            return this.tabsPanel.addPanel(menu,isReload);
        }
        //最大标签页数判断
        Page.prototype.judgeContainAndMax = function(tabCode){
            return this.tabsPanel && this.tabsPanel.judgeContainAndMax(tabCode);
        }
        //激活导航和菜单项
        Page.prototype.activeNavAndMenu = function(){
        	var navCode = this.menu.navCode;
        	var menuCode = this.menu.menuCode;
        	$('.active',$('#nav')).removeClass('active');
			$('*[nav-code="'+navCode+'"]',$('#nav')).addClass('active');
			$('.active[data-code]',$('#main').find('.menu')).removeClass('active');
			$('*[data-code="'+menuCode+'"]',this.template).addClass('active');
			$('*[data-code="'+menuCode+'"]',this.template).prevAll('.nav-header:eq(0)').click();
        }
    })(V.Classes['v.component.pages.Page'])
},{plugins:['v.component.pages.navigation','v.component.pages.tabsPanel']});