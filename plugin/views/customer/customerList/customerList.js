;V.registPlugin("v.views.customer.customerList",function(){
	V.Classes.create({
		className:"v.views.customer.CustomerList",
		superClass:"v.views.commonDocket.CommonDocketList",
		init:function(){
            this.ns = 'v.views.customer.customerList';
			this.module = '';
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.DynamicGrid']();
		}
	});
	(function(List){
		List.prototype.initConditionForm = function(){
			this.initMenuCondition({'tableType':'header'});
		}
		
		List.prototype.initList = function(){
			var that = this;
			var list = this.list;
			list.setActionColumn({
				displayName: "操作",
				key: 'action',
				width: 80,
				render: function(record){
					var html = $('<div class="action"><a class="view" href="javascript:void(0);" title="查询"><i class="icon-search"></i></a><a class="edit" href="javascript:void(0);" title="编辑"><i class="icon-edit"></i></a><a class="remove" href="javascript:void(0);" title="删除"><i class=" icon-remove"></i></a><div>');
					$('.view', html).click(function(){
						that.view(record);
					});
					$('.edit', html).click(function(){
						that.edit(record);
					});
					$('.remove', html).click(function(){
						that.remove(record);
					});
					return html;
				}
			});
			var pagination = new V.Classes['v.ui.Pagination']();
		    list.setPagination(pagination);
		    list.setFilters(this.options.filters);
		    
		    this.subscribe(list,list.EVENT.INITED,function(data){
		    	var actions = data.actions;
		    	var tools = [];
		    	tools.push({eventId:'add',text:"新增",icon:'icon-plus'});
		    	//tools.push({eventId:'remove',text:'批量删除',icon:'icon-remove'});
		    	list.addTools(tools);
		    });
		    
			list.init({
				url: this.module+'/customer!init.action',
				hasData : true,
				sortable:false,
				checkable:false
			});
			this.subscribe(list,'add',this.add);
			//this.subscribe(list,'remove',this.removeSelected);
		}
	
		List.prototype.view = function(record) {
			var options = this.options;
			options.module = this.module;
			options.record =  record;
			options.docketId = record.id;
			options.id=record.id;
			options.hasDetail = this.list.hasDetail;
			this.forward('v.views.customer.customerView',options,function(inst){
				inst.addCrumb();
			});
		}
		
		List.prototype.add = function() {
			var options = this.options;
			options.module = this.module;
			options.hasDetail = this.list.hasDetail;
			delete options.docketId;
			this.forward('v.views.customer.customerEdit',options,function(inst){
				inst.addCrumb();
			});
		}
		List.prototype.edit = function(record) {
			var options = this.options;
			options.module = this.module;
			options.record =  record;
			options.docketId = record.id;
			options.id=record.id;
			options.hasDetail = this.list.hasDetail;
			this.forward('v.views.customer.customerEdit',options,function(inst){
				inst.addCrumb();
			});
		}
		
		/**删除**/
		List.prototype.remove = function(record){
			var that = this;
			//var info=this.getLang("MSG_IS_REMOVE_CASE");
			var info= "确定要删除吗？";
			V.confirm(info,function ok(e){
				var url = that.module+'/customer!deleteEntityAndDescendant.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
	               	data:{ids:record['id'],docketType:that.options.variables.docketType},
	                success:function(data){
	                	if(data.result == 'success'){
	                		that.list.removeRecord(record);
	                		V.alert("删除成功");
	                	}else{
	                		V.alert("删除失败");
	                	}
	                }
	            })
			});
			
		}
	})(V.Classes['v.views.customer.CustomerList']);
},{plugins:['v.views.commonDocket.commonDocketList','v.ui.dynamicGrid','v.ui.confirm','v.ui.alert']});