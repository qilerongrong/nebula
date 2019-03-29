;V.registPlugin("v.component.layout.layout2.page",function(){
    V.Classes.create({
        className:"v.component.layout.layout2.Page",
		superClass:"v.Plugin",
        init:function(){
            this.ns = 'v.component.layout.layout2.page';
            this.tabsPanel = null;
			this.menus = [];
			this.menu = null;
            this.options = {
            	menu:null
            };
            this.template = $('<div id="manage" class="well"><div class="content"></div></div>');
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
	            	that.activeNavAndMenu();
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
        }
    })(V.Classes['v.component.layout.layout2.Page'])
},{plugins:['v.component.pages.navigation','v.component.pages.tabsPanel']});