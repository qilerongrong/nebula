;V.registPlugin("v.component.pages.tabsPanel",function(){
	V.Classes.create({
		className:"v.component.pages.TabsPanel",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.component.pages.tabsPanel';
            this.options = {
            	activeOrder : 'left' //left||right
            };
            this.maxLength = 7;
            this.tabs = []; //tabs collection
            this.contents = []; //content collection
            this.activeTabCode = null; //current menuCode
            this.MOVE_STEP = 110;
            this.EVENT = {
				PANEL_ADDED:'panel_added',
				PANEL_REMOVED:'panel_removed',
				TAB_CLICK:'tab_click'
			}
			this.template = $('<div class="tabsPanel"><div class="tabs"><a href="javascript:void(0)" title="前移" class="move_left"></a><a title="后移" href="javascript:void(0)" class="move_right"></a><ul class="custom_tab_bj nav nav-tabs" id="global_tabspanel"></ul></div>\
								<div class="tab-content" id="global_tabscontent"></div></div>');
		}
	});
	(function(TabsPanel){
		TabsPanel.prototype.init = function(options){
			if(options.container){
				this.container = options.container;
			    delete options.container;
			}
			for(prop in options){
				this.options[prop] = options[prop];
			}
			this.container.append(this.template);
			V.MessageBus.subscribe('show_msg',this.showMsg);
			//V.MessageBus.subscribe('addCrumb',this.addCrumb,this);
			V.MessageBus.subscribe('updateCrumb',this.updateCrumb,this);
			V.MessageBus.subscribe('popCrumb',this.popCrumb,this);
			V.MessageBus.subscribe('removeCrumbs',this.removeCrumbs,this);
			V.MessageBus.subscribe('gotoCrumb',this.gotoCrumb,this);
			V.MessageBus.subscribe('backCrumb',this.backCrumb,this);
			V.MessageBus.subscribe('removeTabpane',this.removeTabpane,this);
			V.MessageBus.subscribe('activeTabpane',this.activeTabpane,this);
			V.MessageBus.subscribe('addTabpane',this.addTabpane,this);
			this.initEvent();
		}
		TabsPanel.prototype.initEvent = function(){
			var that = this;
			$('#global_tabspanel li',this.template[0]).live('click',function(){
				that.publish({eventId:that.EVENT.TAB_CLICK,data:$(this).data()});
				that.activeTabCode = $(this).data('menuCode');
				if($(this).data('tabId')){
					that.activeTabCode = $(this).data('tabId');
				}
				if($(this).hasClass('active')){
					return false;
				}else{
					$(that.tabs).each(function(){
						$(this).removeClass('active');
					});
					$(this).addClass('active');
					$(that.contents).each(function(){
						$(this).removeClass('active');
					});
					var index = $(this).index();
					$(that.contents[index]).addClass('active');
					that.moveToActiveTab();
				}
			});
			$('.move_left',this.template).click(function(){
				var wrapper = $('#global_tabspanel',that.template);
				var wrapper_left = parseInt(wrapper.css('left')=="auto"?0:wrapper.css('left'));
				var max_left = 1;
				if(wrapper_left === max_left){
					return;
				}
				if(that.MOVE_STEP+wrapper_left>0){
					wrapper.animate({
						left:1
					},500)
				}else{
					wrapper.animate({
						left:wrapper_left+that.MOVE_STEP
					},500)
				}
			});
			$('.move_right',this.template).click(function(){
				var wrapper  = $('#global_tabspanel',that.template);
				var tabs = $('.tabs',that.template);
				var tabs_w = tabs.width();
				var wrapper_left = parseInt(wrapper.css('left')=="auto"?0:wrapper.css('left'));
				var last_item = $('.tabs li:last',that.template);
				var items_w = last_item.position().left+last_item.width()+2;
				var min_left = tabs_w - items_w;
				//如果标签未填满
				if(items_w<=tabs_w){
					return;
				}
				//如果已移至最右端
				if(wrapper_left === min_left){
					return;
				}
				if(wrapper_left-that.MOVE_STEP<=min_left){
					wrapper.animate({
						left:min_left
					},500)
				}else{
					wrapper.animate({
						left:wrapper_left-that.MOVE_STEP
					},500)
				}
			});
			// $(window).resize(function(){
			// 	setTimeout(function(){
			// 		that.repartTabWidth();
			// 	},100)
			// });
		}
		/*
		 * add tab handler
		 * config:menu
		 */
		TabsPanel.prototype.addPanel = function(config,isReload){
			var tabcode = config.menuCode; 
			var that =this;
			var judge = this.judgeContainAndMax(tabcode);
				if(judge==-2){
					var dlg = new V.Classes['v.ui.Dialog']();
					var msg = $('<div>'+this.getLang("MSG_TIG_PAGES_MAX_CLOSE_PAGES_REOPEN")+'</div>');
					dlg.setContent(msg);
					dlg.setBtnsBar({btns:[
					    {text:this.getLang("BTN_I_KNOW"),style:"btn-primary left",handler:function(){
					    	dlg.close();
					    	//that.page.activeNavAndMenu();
					    }}
					    ,{text:this.getLang("BTN_CLOSE_OTHERS"),style:"btn-danger",handler:function(){
					    	dlg.close();
					    	that.removeAllPanel();
					    	that.loadPanel(config,isReload);
					    }}
					]});
					dlg.init({width:450,height:250,title:this.getLang("TITLE_SYS_NOTICE")});
				}else{
					this.loadPanel(config,isReload);
				}
		}
		TabsPanel.prototype.loadPanel = function(config,isReload){
			var that = this;
		    if(config==null) return 0;
		    var tabName = config.menuName||'tab';
		    var tabCode = config.menuCode||'';
		    var tabId = config.tabId||tabCode;
		    var navCode = config.navCode||'';
		    var pluginList = config.pluginList||'';
		    var tabIndex = that.getTab(tabId); 
		    if(tabIndex!=-1){
		    	if(!isReload){
		    		this.tabs[tabIndex].click();
		    	    return -1;
		    	}else{
		    	    this.removePanel(tabIndex);
		    	    V.MessageBus.unsubscribe('addCrumb',crumbCall);
		    	}
		    }
		    if(this.maxLength>0&&this.maxLength == this.tabs.length){
		    	return -2;
		    }
		    var plugin = config.plugin;
		    var tab = $('<li class=""><a href="javascript:void(0)" title="'+tabName+'">'+tabName+'</a></li>').data(config);
		    this.activeTabCode = tabCode;
		    if(tabId){
		    	this.activeTabCode = tabId;
		    }
		    this.tabs.push(tab);
		    var close = $('<b class="custom_tab_close">&#215;</b>');
		    //close.css({'position':'relative','bottom':'35px','right':'2px'});
		    close.click(function(){
		    	if(that.tabs.length==1) return;
		    	that.removePanel($(this).parent().index());
		    	V.MessageBus.unsubscribe('addCrumb',crumbCall);
		    })
		    tab.append(close);
		    $('#global_tabspanel:first',this.template).append(tab);
		    var tabContent = $('<div class="tab-pane active tab-pane-page" style="position:relative"></div>').data('crumbs',[]);
		    tabContent.attr("id",tabCode);
		    if(tabId){
		    	tabContent.attr("id",tabId);
		    }
		    this.contents.push(tabContent);
		    $('#global_tabscontent:first',this.template).append(tabContent);
		    var crumbCall = function(data){
		    	that.addCrumb(tabContent,data);
		    }
		    V.MessageBus.subscribe('addCrumb',crumbCall,this);
		    V.loadPlugin(plugin,function(){
				var glass = V._registedPlugins[plugin].glass;
				var inst = new V.Classes[glass]();
				var module = config.module
				var opt = config||{};
				opt.container = tabContent;
				inst.init(opt);
				//todo console
//				if(config.content){ //console detail
//					var list_opt = {
//						module : module,
//						container : tabContent,
//						menuCode : tabCode
//					}
//					V.MessageBus.publish({eventId:"addCrumb",data:{ns:pluginList,options:list_opt,name:tabName}});
//				}
				if(config.content){
					V.MessageBus.publish({eventId:"addCrumb",data:{ns:pluginList,options:config,name:tabName}});
				}
				inst.addCrumb&&inst.addCrumb();
			})
			// this.repartTabWidth();
			this.moveToLastTab();
			tab.click();
		    this.logInformation(config);
		    
		    return tab.index();
		}
		/**
		 * 移动到最后一个
		 */
		TabsPanel.prototype.moveToLastTab = function(){
			var wrapper = $('#global_tabspanel',this.template);
			var tabs = $('.tabs',this.template);
			var tabs_w = tabs.width();
			var last_item = $('.tabs li:last',this.template);
			var items_w = last_item.position().left+last_item.width()+2;
			var min_left = tabs_w - items_w;

			//未超出
			if(min_left>0){
				return;
			}
			//超出
			wrapper.animate({
				left:min_left
			},500)
		}
		/**
		 * 选择标签页后tab页位置策略
		 * TODO如果当前标签在边缘，则重新将其移动到中间位置
		 */
		TabsPanel.prototype.moveToActiveTab = function(){
			var wrapper = $('#global_tabspanel',this.template);
			var tabs = $('.tabs',this.template);
			var tabs_w = tabs.width();
			var activeTab = $('.active',wrapper);
			var activeTab_left = activeTab.position().left;
			var tab_w = activeTab.width();
			var wrapper_left = parseInt(wrapper.css('left')=="auto"?0:wrapper.css('left'));
			//当前tab相对于wrapper的偏移量
			var relative_to_wrapper_left = activeTab_left+wrapper_left;
			//在可视区域
			if(relative_to_wrapper_left>0&&relative_to_wrapper_left<=tabs_w-tab_w){
				return;
			}
			//在边缘位置或隐藏则移至中间区域或者最左或最右
			var last_item = $('.tabs li:last',this.template);
			var items_w = last_item.position().left+last_item.width()+2;
			var min_left = tabs_w - items_w;
			var max_left = 1;
			if(relative_to_wrapper_left<0){
				wrapper_left += (tabs_w-tab_w)/2-relative_to_wrapper_left
				if(wrapper_left<max_left){
					wrapper.animate({
						left:wrapper_left
					},500);
				}else{
					wrapper.animate({
						left:max_left
					},500);
				}
			}else if(relative_to_wrapper_left>tabs_w-tab_w){
				wrapper_left -= relative_to_wrapper_left-(tabs_w-tab_w)/2;
				if(wrapper_left>min_left){
					wrapper.animate({
						left:wrapper_left
					},500);
				}else{
					wrapper.animate({
						left:min_left
					},500);
				}
			}
			

		}
		
		TabsPanel.prototype.activeTabpane = function(tabId){
			var index = this.getTab(tabId);
			if(index != -1){
				this.activeTab(index);
			}
		}
		TabsPanel.prototype.removeTabpane = function(tabId){
			var index = this.getTab(tabId);
			this.removePanel(index);
		}
		TabsPanel.prototype.addTabpane = function(newTabConfig){
			this.addPanel(newTabConfig);
		}
		TabsPanel.prototype.removePanel = function(index){
			if(index<0 || index>=this.tabs.length) return;
			var tabConfig = this.getTabConfig(index);
		    $(this.tabs[index]).remove();
		    $(this.contents[index]).remove();
		    
		    this.tabs.splice(index,1);
		    this.contents.splice(index,1);
		    if(tabConfig.fromTab){
		    	var fromTab = tabConfig.fromTab;
		    	var tabId = fromTab.menuCode;
		    	if(fromTab.tabId){
		    		tabId = fromTab.tabId
		    	}
		    	if(this.getTab(tabId) == -1){
		    		//如果fromtab已关闭则采取默认行为
		    		this.activeNextTab(index);
		    	}else{
		    		this.activeTabById(tabId);
		    	}
		    	//如果fromTab有值，并且未关闭TODO
		    }else{
		    	this.activeNextTab(index);
		    }
		    // this.repartTabWidth();
		}
		TabsPanel.prototype.removeAllPanel = function(){
			var that = this;
			$.each(this.tabs,function(index,dom){
				$(this).remove();
				$(that.contents[index]).remove();
			})
		    this.tabs = [];
			this.contents = [];
			this.activeTabCode = null;
		}
		//标签激活策略
		TabsPanel.prototype.activeNextTab = function(index){
			if(this.options.activeOrder=='left'){
				if(index==0){
					
				}else{
					index = index - 1;
				} 
			}else if(this.options.activeOrder=='right'){
				if(index==this.tabs.length-1){
					
				}else{
					index = index + 1;
				}
			}
			$(this.tabs[index]).click();
		}
		TabsPanel.prototype.activeTab = function(index){
			$(this.tabs[index]).click();
			// this.moveToActiveTab();
		}
		TabsPanel.prototype.activeTabById = function(tabId){
			var index = this.getTab(tabId);
			if(index == -1){
				return;
			}
			$(this.tabs[index]).click();
			// this.moveToActiveTab();
		}
		/*
		 * 最大tabs和是否包含判断
		 * return: -1：包含标签；-2：达到最大值；0：正常
		 */
		TabsPanel.prototype.judgeContainAndMax = function(tabCode){
			var tabIndex = this.getTab(tabCode);
			if(tabIndex!=-1){
				return -1;
			}
			if(this.maxLength === 0){
				return 0
			}
			if(this.tabs.length==this.maxLength){
				return -2;
			}
			else{
				return 0;	
			}
		}
		//key为tab-pane的id值,返回tabIndex
		TabsPanel.prototype.getTab = function(key){
			return $('#'+key).index();
		}
		TabsPanel.prototype.getTabConfig = function(index){
			return this.tabs[index].data();
		}
		//log information
        TabsPanel.prototype.logInformation = function(config){
			var filterList = {};
			for(obj in config){
				if(typeof(config[obj]) != 'object'){
					filterList[obj] = config[obj];
				}
			}
//			V.ajax({
//                url:"backoffice/custom/userLog/ac-user-log!logAccessPage.action",
//                type:'post',
//                data:{filterList:filterList},
//                success:function(){
//                	//V.log(LoginInfo.user.loginName+'操作'+filterList.tabName);
//                }
//            })
		}
		//动态取得ul宽度，重新绘画tab宽度，小于7个标签，默认120，大于等于8个，根据个数计算
		//已固定宽度120px。
		TabsPanel.prototype.repartTabWidth = function(){
			var container = $('#global_tabspanel',this.template);
			var ulWidth = container.width()-50;
			var liWidth = 120;
			// if((this.tabs.length)>7){
			// 	liWidth = ulWidth/this.tabs.length;
			// }
			$('li',container).width(liWidth);
		}
		/**
		 * here is crumbs handler 
		 */
		TabsPanel.prototype.removeCrumbs = function(){
			$('#'+this.activeTabCode).data('crumbs',[]);
		}
		TabsPanel.prototype.updateCrumb = function(node){
			var context = $('#'+this.activeTabCode);
			context.data('crumbs').pop();
			context.data('crumbs').push(node);
			$('li.active',context).text(node.name);
		}
		TabsPanel.prototype.popCrumb = function(){
			$('#'+this.activeTabCode).data('crumbs').pop();
		}
		TabsPanel.prototype.addCrumb = function(context,node){
			var that = this;
			//var crumbs = $('#'+this.activeTabCode).data('crumbs');
			if(context.attr('id')!=this.activeTabCode) return;
			var crumbs = context.data('crumbs');
			if(!crumbs){
				crumbs = [];
			}
			crumbs.push(node);
			var _crumbs = $('<ul class="breadcrumb"></ul>');
			for(var i=0,l=crumbs.length;i<l;i++){
				if(i<l-1){
					var crumb = $('<li><a href="#">'+crumbs[i].name+'</a> <span class="divider">/</span></li>');
					crumb.click(function(){
						var index = $(this).index();
						that.gotoCrumb(index);
					});
				}else{
					var crumb = $('<li class="active">'+crumbs[i].name+'</li>');
				};
				_crumbs.append(crumb);
			}
			context.find('.breadcrumb').remove();
			context.prepend(_crumbs);
		}
		TabsPanel.prototype.backCrumb = function(){
			var index = $('#'+this.activeTabCode).data('crumbs').length -2;
			this.gotoCrumb(index);
		}
		TabsPanel.prototype.gotoCrumb = function(index){
			var that = this;
			var contentCrumbs = $('#'+this.activeTabCode).data('crumbs');
			var crumb = contentCrumbs[index];
			var ns = crumb.ns;
			var options = crumb.options;
			$('#'+this.activeTabCode).data('crumbs',contentCrumbs.slice(0,index));
			V.loadPlugin(ns,function(){
				var container = $('#'+that.activeTabCode).empty();
				options.container = container;
			    var glass = V._registedPlugins[ns].glass;
				var inst = new V.Classes[glass]();
				inst.init(options);
				inst.addCrumb();
			})
		}
	})(V.Classes['v.component.pages.TabsPanel']);
},{plugins:[]});
