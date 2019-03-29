;V.registPlugin("v.component.layout.layout3.page",function(){
    V.Classes.create({
        className:"v.component.layout.layout3.Page",
		superClass:"v.Plugin",
        init:function(){
            this.ns = 'v.component.layout.layout3.page';
            this.tabsPanel = null;
			this.menus = [];
			this.menu = null;
            this.options = {
            	menu:null
            };
            this.template = $('<div id="manage" class="well"><div class="stretch"><div class="menu">\
            <ul class="nav nav-list"></ul>\
            </div><div class="content"></div><a class="btn con_resize" title="展开"><i class="icon-white icon-resize-full"></i></a></div></div>');
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
            $('.con_resize',this.template).toggle(function(){
                $(this).attr('title','收缩')
                $('i',this).removeClass('icon-resize-full').addClass('icon-resize-small');
                $('.content',this.template).css('border-left-width',0);
                $('.menu',this.template).css('width',0);
            },function(){
                $(this).attr('title','展开')
                $('i',this).removeClass('icon-resize-small').addClass('icon-resize-full');
                $('.content',this.template).css('border-left-width',220);
                $('.menu',this.template).css('width',220);
            })
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
                var menul2 = $('<li class="nav-header" data-code="'+this.id+'"><i class="icon-menu2 icon-level2"></i><span class="menu_name">'+this.name+'</span></li>');
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
                $.each(items,function(){
                    var plugin = this.data?this.data.ns:'';
                    var module = this.data?this.data.module:'';
                    var cateCode = this.data?this.cateCode:'';
                    var docketType = this.data?this.docketType:'';
                    var processKey = this.data?this.processKey:'';
                    var m = $('<li data-code="'+this.id+'"><a href="#"  data-plugin="'+plugin+'"><i class="icon-level3"></i><span class="menu-name">'+this.name+'</span></a></li>');
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
			var p = 'v.component.layout.layout3.tabsPanel';
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
            $('*[data-code="'+menuCode+'"]',this.template).addClass('active');
            $('*[data-code="'+menuCode+'"]',this.template).prevAll('.nav-header:eq(0)').click();
        }
    })(V.Classes['v.component.layout.layout3.Page'])
},{plugins:['v.component.layout.layout3.navigation','v.component.layout.layout3.tabsPanel']});