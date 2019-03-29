;V.registPlugin("v.component.layout.layout5.tabsPanel",function(){
	V.Classes.create({
		className:"v.component.layout.layout5.TabsPanel",
		superClass:"v.component.pages.TabsPanel",
		init:function(){
            this.ns = 'v.component.layout.layout5.tabsPanel';
            this.maxLength = 0;
		}
	});
	(function(TabsPanel){
		/**
		 * overwrite super method
		 */
		TabsPanel.prototype.addCrumb = function(context,node){
			var that = this;
			//var crumbs = $('#'+this.activeTabCode).data('crumbs');
			if(context.attr('id')!=this.activeTabCode) return;
			var crumbs = context.data('crumbs');
			if(!crumbs){ 
				crumbs = [];
			}
			crumbs.push(node);
			if(crumbs.length>1){
				var _crumbs = $('<a class="btn btn_crumb_back">返回</a>');
				_crumbs.click(function(){
					that.backCrumb();
				});
				context.find('.breadcrumb').remove();
				context.prepend(_crumbs);
			}
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
	})(V.Classes['v.component.layout.layout5.TabsPanel']);
},{plugins:[]});
