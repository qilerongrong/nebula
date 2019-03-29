;V.registPlugin("v.component.searchLists",function(){
	V.Classes.create({
		className:"v.component.SearchLists",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.component.searchLists';
			this.options = {
				//{name:'',ns:'',options:{}}
				curIndex:0,
				plugins:[]
			}
			this.EVENT = {
				LIST_INITED:'list_inited'
			}
			this.template = $('<div class="tabpane"><ul class="nav nav-tabs"></ul><div class="tab-content"></div></div>');
		}
	});
	(function(SearchLists){
		SearchLists.prototype.init = function(options){
		    this.module = options.module;
			this.container = options.container;
			delete options.module;
			for(prop in options){
				this.options[prop] = options[prop];
			}
			var plugins = this.options.plugins;
			var that = this;
			for(var i = 0;i<plugins.length;i++){
				var plugin = this.options.plugins
				var li = $('<li><a href="javascript:void(0);">'+plugins[i].name+'</a></li>');
				var tab_pane = $('<div class="tab-pane"></div>');
				if(i==this.options.curIndex){
					li.addClass('active');
				}
				li.one('click',function(){
					var index = $(this).index();
					var plugin = plugins[index];
					plugin.options = plugin.options||{};
					plugin.options.module = that.module;
					plugin.options.container = $(that.template.children('.tab-content').children('.tab-pane')[index]);
				    V.loadPlugin(plugin.ns,function(){
				        setTimeout(function(){
				            var glass = V._registedPlugins[plugin.ns].glass;
                            var inst = new V.Classes[glass]();
                            that.publish({eventId:that.EVENT.LIST_INITED,data:inst});
                            inst.init(plugin.options);
                            
				        },0);
					});
				})
				this.template.children('.nav-tabs').append(li);
				this.template.children('.tab-content').append(tab_pane);
			}
			this.container.append(this.template);
			this.initEvent();
			$(this.template.children('.nav-tabs').children()[this.options.curIndex]).trigger('click');
		}
		SearchLists.prototype.initEvent = function(){
			var that = this;
			$('li',this.template.children('.nav-tabs')).click(function(){
				var index = $(this).index();
				that.template.children('.tab-content').children().removeClass('active');
				$('.tab-pane:eq('+index+')',that.template.children('.tab-content')).addClass('active');
				that.template.children('.nav-tabs').children().removeClass('active');
				$(this).addClass('active');
			});
			//this.addCrumb();
		}
		SearchLists.prototype.addCrumb = function(){
			this.log('this method should be overwrote by subclass if need crumb.');
		}
	})(V.Classes['v.component.SearchLists']);
},{plugins:['v.component.searchList']});
