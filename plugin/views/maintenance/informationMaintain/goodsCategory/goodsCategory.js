;V.registPlugin("v.views.maintenance.informationMaintain.goodsCategory",function(){
	V.Classes.create({
		className:"v.views.maintenance.informationMaintain.GoodsCategory",
		superClass:"v.Plugin",
		init:function(){
			this.org = {};
			this.salesregion = {};
			this.partner = {};
			this.store = {};
			this.type = null ;
			this.module = "";
            this.ns = 'v.views.maintenance.informationMaintain.goodsCategory';
			this.resource = {
				html:'template.html'
			};
			this.orgType = {
				HEADQUARTERS:"1", 
				SALESREGION:"2",
				PARTNER:"3",
				STORE:"4"
			};
			this.EVENT = {
				'ADD_GOODSCATEGORY':'add_goodscategory',
				'DELETE_GOODSCATEGORY':'delete_goodscategory',
				 'REMOVE' : 'remove',
				'SAVE_GOODSCATEGORY_SUCCESS' : 'save_goodscategory_org'
			};
		}
	});
	(function(GoodsCategory){
		GoodsCategory.prototype.init = function(options){
			this.module = options.module;
			this.container = options.container;
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					that.initOrgTree();
					that.initEvent();
				}
		     });
		}
		
		GoodsCategory.prototype.initEvent = function(){
			var that = this;
  			$('.edit',this.template).click(function(){
				var block = $(this).parents('.view');
				block.removeClass('view').addClass('edit');
			});
			$('.save',this.template).click(function(){
				if(that.node){
					that.saveEvent();
				}
				that.saveOrgInfo();
				var block = $(this).parents('.edit');
				block.removeClass('edit').addClass('view');
			});
			$('.cancel',this.template).click(function(){
				var block = $(this).parents('.edit');
				block.removeClass('edit').addClass('view');
			});
			$('.add',this.template).click(function(){
				that.addOrg(null,{},true);
			});
		}
		GoodsCategory.prototype.initOrgTree = function(){
			
			var that = this;
		    this.orgTree = new V.Classes['v.ui.Tree']();
			this.orgTree.init({
				container:$('.org_tree',this.template),
				 dragable : true,
				 dropable : true,
				 url : this.module+'/goods-category!input.action',
				 async : true,
				 contextMenu:function(node){
					 return [
						     {eventId:that.EVENT.ADD_GOODSCATEGORY,text:'新增品类',icon:'icon-plus'},
							 {eventId:that.EVENT.DELETE_GOODSCATEGORY,text:'删除品类',icon:'icon-plus'}
						 ];
				 }
			});
			/**监听新增品类事件**/
			this.subscribe(this.orgTree,this.EVENT.ADD_GOODSCATEGORY,function(node){
				that.node = null;
				var parentId = node.options.id;
				var org = {parentId:node.options.id};
				that.addOrg(node,org,true);
			});
			/**监听删除品类事件**/
			this.subscribe(this.orgTree,this.EVENT.DELETE_GOODSCATEGORY,function(node){
				var parentId = node.options.id;
				V.confirm("确认删除!",function(e){
					 that.removeOrg(node);
				});
			});
			this.subscribe(this.orgTree,this.EVENT.SELECT,function(data){
				var node = data.node;
				that.node = node;
				var id = node.options.id;
				var type = node.options.treeNodeType;
				$.ajax({
					url:this.module+'/goods-category!data.action',
					data:{goodsCatType:type,goodsCatId:id},
					dataType:'json',
					success:function(nodeData){
						node.data = nodeData;
						that.showOrgInfo(nodeData,false);
					}
				})
			});
		};
		GoodsCategory.prototype.saveEvent =  function(){
			var that = this;
			this.subscribe(this,this.EVENT.SAVE_GOODSCATEGORY_SUCCESS,function(data){
				 that.orgTree.updateNode(that.node,data.name==undefined?data.name:data.name);
				 that.unsubscribe(that,that.EVENT.SAVE_GOODSCATEGORY_SUCCESS,arguments.callee);
			});
		}
		GoodsCategory.prototype.addOrg = function(node,org, enable){
			var that = this;
			this.showOrgInfo(org,enable);
			this.subscribe(this,that.EVENT.SAVE_GOODSCATEGORY_SUCCESS,function(data){
				 var config = {};
				 config.parentId = data.parentId;
				 config.data = data;
				 config.name = data.categoryName;
				 config.id = data.id;
				 config.isLeaf = true;
				 that.orgTree.addNode(config,node);
				 that.unsubscribe(that,that.EVENT.SAVE_GOODSCATEGORY_SUCCESS,arguments.callee);
			});
		}
		GoodsCategory.prototype.showOrgInfo = function(org,enable){
		     var orginfo_selecter = '';
			 orginfo_selecter=".head_info";
			 this.type = org.categoryLevel;
   	         this.org = org;
			$(orginfo_selecter+' [data-key]',this.template).each(function(){
					var key = $(this).attr('data-key');
					$('.view_text',this).text(org[key]);
					$('.edit_input',this).val(org[key]);
			})
			$('.block',this.template).removeClass('cur');
			$(orginfo_selecter,this.template).addClass('cur');
			if(enable){
				$('.org_info .cur .view',this.template).removeClass('view').addClass('edit');
			}else{
				$('.org_info .cur .edit',this.template).removeClass('edit').addClass('view');
			}
			
			$('.org_info',this.template).animate({'margin-right':0},900);
		}
		GoodsCategory.prototype.setInfo = function(orginfo_selecter,info){
			$(orginfo_selecter+' [data-key]',this.template).each(function(){
					var key = $(this).attr('data-key');
					info[key] = $('.edit_input',this).val();
			})
		}
		GoodsCategory.prototype.removeOrg = function(node){
			var that = this;
			var url = this.module+"/goods-category!delete.action";
			$.ajax({
				url : url,
				data : {id:node.options.id},
				success : function(data){
					if(data == "success"){
						that.orgTree.removeNode(node);
					}
				}
			});
		}
		GoodsCategory.prototype.getCurrentOrg = function(){
			var org = this.org
			$('.cur [data-key]',this.template).each(function(){
					var key = $(this).attr('data-key');
					org[key] = $('.edit_input',this).val();
			});
			return org;
		}
		GoodsCategory.prototype.saveOrgInfo = function(){
			var that = this; 
			var url = this.module+"/goods-category!save.action";
			var info = this.getCurrentOrg();
			
			V.ajax({
				url:url,
				data:{data:info},
				success:function(data){
					 if(data != null || data != undefined){
					 	that.showOrgInfo(data,false);
						that.publish({eventId:that.EVENT.SAVE_GOODSCATEGORY_SUCCESS,data:data});
					 }
				}
			});
			 
		}
	})(V.Classes['v.views.maintenance.informationMaintain.GoodsCategory']);
},{plugins:['v.ui.tree','v.component.area','v.fn.validator']})