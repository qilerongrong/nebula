;V.registPlugin("v.ui.tree",function(){
	V.Classes.create({
		className:"v.ui.Tree",
		superClass:"v.Plugin",
		init:function(){
			this.ns = "v.ui.tree";
			//水平存放的数据，操作相应的数据同步这个值.
			this._data = [];
		    this.options = {
		    	checkable:false,
				onlyOneCheckable:false,
				data:[],
				url:'',
				nodes:[],
				dragable:false,
				dropable:false,
				async:false,
				unfold:false,
				contextMenu:null,
				onBeforeDrop:function(){return true;},
				onDrop:null
		    }
		    this.EVENT = {
                DRAG:'drag',
                DROP:'drop'
            }
		}
	});
	/*
	 * [{checkable:false,data:{name:'',value:''},children:[]}]
	 * @param {Object} Tree
	 */
	(function(Tree){
		Tree.prototype.init = function(options){
			this.container = options.container;
			delete options.container;
			for(prop in options){
			    this.options[prop] = options[prop];
			}
			this.template = $('<ul class="v-tree"></ul>');
			var _checkable = this.options.checkable;
			var that = this;
			if(this.options.url){
			    this.retrieveData();
			}else{
				var data = this.options.data;
				for(var i=0,l=data.length;i<l;i++){
					var config = data[i];
					this.initNode(config,this.template);
				}
				this.container.append(this.template);
				this.initEvent();
			}
		}
		Tree.prototype.initNode = function(config,container){
			    this._data.push(config.data);
				var node = new V.Classes['v.ui.TreeNode']();
				var opt = config;
				opt.tree = this;
				opt.checkable = config.checkable==undefined?this.options.checkable:config.checkable;
				opt.dragable = config.dragable==undefined?this.options.dragable:config.dragable;
				opt.dropable = config.dropable==undefined?this.options.dropable:config.dropable;
				opt.onlyOneCheckable = config.onlyOneCheckable==undefined?this.options.onlyOneCheckable:config.onlyOneCheckable;
				opt.container = container;
				opt.contextMenu = this.options.contextMenu;
				opt.isChecked = config.checked;
				var children = config.children||[];
				opt.async = this.options.async || false;
				node.init(opt);
				this.subscribe(node,node.EVENT.SELECT,function(data){
					var node = data.node;
					that.publish({eventId:that.EVENT.SELECT,data:{node:node}});
				});
				var that = this;
				
				if(opt.async){
					this.subscribe(node,node.EVENT.RETRIEVE_CHILDREN,function(data){
						var p_node = data.node;
						$.ajax({
							url : that.options.url,
							data : {parentId : p_node.options.id,parentCode:p_node.options.data.orgCode},
							success:function(data){
								var children = data||[];
								p_node.template.children('ul').empty();
								for(var i=0,l=children.length;i<l;i++){
									var _config = children[i];
									that.initNode(_config,p_node.template.children('ul'));
								}
							}
						});
					})
				}
				if(opt.dragable){
					this.subscribe(node,node.EVENT.DRAG,function(){
						that.drag();
					})
				}
				if(opt.dropable){
					this.subscribe(node,node.EVENT.DROP,function(data){
						var source = data.source;
						var dest = data.dest;
						that.drop(source,dest);
					});
				}
			    for(var i=0,l=children.length;i<l;i++){
					var _config = children[i];
					this.initNode(_config,node.template.children('ul'));
				}
		}
		Tree.prototype.initEvent = function(){
			var that = this;
			$('a',this.template[0]).live('click',function(){
			    $('.selected',that.template).removeClass('selected');
				$(this).addClass('selected');
			});
			$('body').bind('click',function(){
				$('.v-tree-menu').remove();
			});
			$('.toggle',this.template[0]).live('click',function(){
				if($(this).hasClass('icon-plus-sign')){
					$(this).removeClass('icon-plus-sign').addClass('icon-minus-sign');
					$(this).siblings('ul').slideDown();
				}else{
					$(this).removeClass('icon-minus-sign').addClass('icon-plus-sign');
					$(this).siblings('ul').slideUp();
				}
			});
		}
		Tree.prototype.drop = function(source,dest){
		    	if(this.options.onBeforeDrop(source,dest)){
					dest.dropNode(source);
					this.options.onDrop&&this.options.onDrop(source,dest);
				}
				this.dropTarget = null;
		}
		Tree.prototype.retrieveData = function(){
			  var that = this;
				V.ajax({
					url : this.options.url,
					success:function(data){
						that.options.data = data;
						for(var i=0,l=data.length;i<l;i++){
							var config = data[i];
							that.initNode(config,that.template);
						}
						that.container.empty().append(that.template);
						that.initEvent();
					}
				});
		}
		//需同步tree data
		Tree.prototype.addNode = function(node,pnode,container){
			if(pnode){
				if(pnode.options.isLeaf){
					pnode.template.find('i').eq(0).addClass("toggle").addClass("icon-minus-sign");
					pnode.template.find('a i').eq(0).addClass("icon-list-alt");
					pnode.template.append('<ul style="display:block"></ul>');
					pnode.options.isLeaf = false;
				}
				this.initNode(node,pnode.template.children('ul'));
			}else{
				this.initNode(node,$('.v-tree',container));
			}
		}
		//需同步tree data
		Tree.prototype.removeNode = function(node){
			node.template.remove();
		};
		Tree.prototype.updateNode = function(node,name){
			if(node){
				$('a:eq(0)',node.template).find('span').text(name);
			}
		};
		Tree.prototype.changeNodeIcon = function(node,icon){
			node.changeIcon(icon);
		};
		Tree.prototype.initNodeMenu = function(node){
			node.initEvent();
		};
		Tree.prototype.getSelectedNode = function(){
			var nodes = [];
		    $(':checked',this.template).each(function(){
				var node = $(this).next('a').data('node');
				nodes.push(node);
			});
			return nodes;
		};
		Tree.prototype.getSelectedNodeIds = function(){
			var ids = [];
			$(':checked',this.template).each(function(){
				var id = $(this).next('a').data('node').options.id;
				ids.push(id);
			});
			return ids;
		}
	})(V.Classes['v.ui.Tree']);
},{plugins:['v.ui.treeNode']})
