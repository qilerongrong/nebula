;V.registPlugin("v.ui.treeNode",function(){
	V.Classes.create({
		className: 'v.ui.TreeNode',
		superClass:'v.Plugin',
		init: function(){
			this.ns = 'v.ui.treeNode';
			this.options = {
				tree:null,
				id:'',
				name:'',
				treeNodeType:'',
				parentId:'',
				checkable: false,
				data: {},
				icon:'',
				dragable: false,
				dropable: false,
				isSelected:false,
				isChecked:false,
				isLeaf:false,
				async:false,
				contextMenu: null
			}
			this.EVENT = {
                DRAG:'drag',
                DROP:'drop',
                RETRIEVE_CHILDREN:'retrieve_children',
                SELECT:'select'
            }
		}
	});
	(function(Node){
		Node.prototype.init = function(options){
			var that = this;
			this.container = options.container;
			delete options.container;
			for(prop in options){
			    this.options[prop] = options[prop];
			}
			var opt = this.options;
			this.template = $('<li></li>');
			if(!opt.isLeaf){
				if(opt.unfold){
					this.template.append('<i class="toggle icon-minus-sign"></i>');
				}else{
					this.template.append('<i class="toggle icon-plus-sign"></i>');
				}
				opt.icon = opt.icon||"icon-list-alt";
			}else{
				this.template.append('<i></i>');
				opt.icon = opt.icon||"icon-file";
			}
			if(this.options.checkable){
				var checkbox = $('<input type="checkbox" class="checkbox"/>');
				checkbox.click(function(){
					if(checkbox.attr('checked')=='checked'){
						that.statusCheckChecked($(that.template));
					}
					else{
						that.statusCheckNoChecked($(that.template));
					}
				});
				
				if(this.options.isChecked)
					checkbox.attr('checked',true);
				this.template.append(checkbox);
			}
			this.template.append($('<a href="javascript:void(0);"><i class="'+opt.icon+'"></i><span>'+opt.name+'</span></a>').data('node',this));
			if(!opt.isLeaf){
				this.template.append('<ul></ul>');
			}
			this.container.append(this.template);
			this.initEvent();
		}
		Node.prototype.initEvent = function(){
			var that = this;
		    if(this.options.dragable){
				$('a',this.template).mousedown(function(e){
					document.onselectstart  = function(){return false;}
					document.ondragstart = function(){return false;}
					$(document).css('cursor','no-drop');
					var x0 = e.pageX;
					var y0 = e.pageY;
					var item = this;
					$(document).bind('mousemove',function(e){
						var x = e.pageX;
						var y = e.pageY;
						var node = $('.v-tree-dragnode');
						var _x = x-x0;
						var _y = y-y0;
						if(_x>4||_x<-4||_y>4||_y<-4){
							that.options.tree.dragTarget = $(item).data('node');
							if(node.length==0){
								node = $(item).clone();
								$('body').append(node.addClass('v-tree-dragnode'));
							}
						   node.css({top : y+2,left : x+2});
						}
					}).bind('mouseup',function(e){
						document.onselectstart  = null;
						$('.v-tree-dragnode').remove();
						$(this).unbind('mousemove').unbind('mouseup');
						if(that.options.tree.dropTarget){
							that.publish({eventId:that.EVENT.DROP,data:{source:that.options.tree.dragTarget,dest:that.options.tree.dropTarget}});
						}
						that.options.tree.dragTarget = null;
					})
				}).mouseenter(function(){
					if(!that.options.tree.dragTarget){
				        return false;
					}else{
						if($(this).data('node') != that.options.tree.dragTarget){
							$(this).addClass('selected');
							that.options.tree.dropTarget = $(this).data('node');
						}
					}
				}).mouseout(function(){
					if(!that.options.tree.dragTarget){
				        return false;
					}else{
						$(this).removeClass('selected');
						that.options.tree.dropTarget = null;
					}
				})
			};
			if(this.options.contextMenu){
				var menus = this.options.contextMenu(this.options);
				if(menus && menus.length>0){
					$('a',this.template).contextmenu(function(e){
						$('.v-tree-menu').remove();
						var left = e.pageX+10;
						var top = e.pageY;
						var menu = that.createContextMenu();
						menu.css({left:left,top:top});
						$('body').append(menu);
						return false;
					});
				}
			}
			if(this.options.async){
				$('.toggle',this.template).one('click',function(){
					that.publish({eventId:that.EVENT.RETRIEVE_CHILDREN,data:{node:that}});
				})
			};
			if(this.options.checkable){
				if(this.options.onlyOneCheckable){
					$(':checkbox',this.template).click(function(){
						if(this.checked){
							$(':checkbox',$(this)).attr('checked',true);
						}else{
							$(':checkbox',$(this)).attr('checked',false);
						}
					})
				}else{
					$(':checkbox',this.template).click(function(){
						if(this.checked){
							$(':checkbox',$(this).parent('li')).attr('checked',true);
						}else{
							$(':checkbox',$(this).parent('li')).attr('checked',false);
						}
					})
				}
			}
//			$('.toggle',this.template).bind('click',function(){
//				if($(this).hasClass('icon-plus-sign')){
//					$(this).removeClass('icon-plus-sign').addClass('icon-minus-sign');
//					$(this).siblings('ul').slideDown();
//				}else{
//					$(this).removeClass('icon-minus-sign').addClass('icon-plus-sign');
//					$(this).siblings('ul').slideUp();
//				}
//			});
			this.template.children('a').click(function(){
				that.publish({eventId:that.EVENT.SELECT,data:{node:that}});
			})
		}
		Node.prototype.createContextMenu = function(){
			var that = this;
			var menus = this.options.contextMenu(this.options);
			 var menu = $('<div class="well v-tree-menu "><ul class="nav nav-list"></ul></div>');
			$.each(menus,function(){
				var item = $('<li></li>');
				item.data('eventId',this.eventId);
				var icon = this.icon||'';
				item.append('<div class="action"><a href="javascript:void(0);"><i class="'+icon+'"></i><span>'+this.text+'</span></a></div>');
				$('ul',menu).append(item);
			});
			$('ul li',menu[0]).live('click',function(){
				that.options.tree.publish({
						eventId: $(this).data('eventId'),
						data: that
					});
			});
			return menu;
		}
		/*需要修改*/
//		Node.prototype.addChild = function(node){
//			node.getData().parentId = this.options.id;
//			if(this.options.isLeaf){
//				this.options.isLeaf = false;
//				$(this.template).children('i').addClass('toggle icon-minus-sign');
//				this.template.append($('<ul></ul>'));
//			}
//			var p = $(node.template).parent().parent();
//			$(this.template).children('ul').append(node.template).show();
//			if($('ul li',p).length ==0){
//				p.children('a').data('node').options.isLeaf = true;
//				p.children('i').removeClass('toggle icon-minus-sign');
//				p.children('ul').remove();
//			}
//		}
		Node.prototype.dropNode = function(node){
			node.getData().parentId = this.options.id;
			if(this.options.isLeaf){
				this.options.isLeaf = false;
				$(this.template).children('i').addClass('toggle icon-minus-sign');
				this.template.append($('<ul></ul>'));
			}
			var p = $(node.template).parent().parent();
			$(this.template).children('ul').append(node.template).show();
			if($('ul li',p).length ==0){
				p.children('a').data('node').options.isLeaf = true;
				p.children('i').removeClass('toggle icon-minus-sign');
				p.children('ul').remove();
			}
		}
		Node.prototype.getData = function(){
		    return this.options.data;	
		}
		Node.prototype.statusCheckNoChecked = function(node){
			var parentNode = node.parents('li:eq(0)');
			if(parentNode==null || parentNode.length==0) return;
			
			var nodeSiblings = node.siblings().add(node);
			var allNonChecked = true;
			$.each(nodeSiblings,function(){
				var checkboxStatus = $(this).find('input[type=checkbox]:eq(0)').attr('checked');
				if(checkboxStatus){
					allNonChecked = false;
					return false;
				}	
			})
			if(allNonChecked)
				parentNode.find('input[type=checkbox]:eq(0)').attr('checked',false);
			else
				return;
			
			this.statusCheckNoChecked(parentNode);
		}
		Node.prototype.statusCheckChecked = function(node){
			var parentNode = node.parents('li:eq(0)');
			if(parentNode==null || parentNode.length==0) return;
			
			var nodeSiblings = node.siblings().add(node);
			var parentChecked = false;
			$.each(nodeSiblings,function(){
				var checkboxStatus = $(this).find('input[type=checkbox]:eq(0)').attr('checked');
				if(checkboxStatus){
					parentChecked = true;
					return false;
				}	
			})
			if(parentChecked)
				parentNode.find('input[type=checkbox]:eq(0)').attr('checked',true);
			else
				return;
			
			this.statusCheckChecked(parentNode);
		}
		Node.prototype.changeIcon = function(icon){
			$('a:eq(0)',this.template).find('i').attr('class',icon);
		}
	})(V.Classes['v.ui.TreeNode']);
});