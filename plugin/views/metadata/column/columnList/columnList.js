;V.registPlugin("v.views.metadata.column.columnList",function(){
	V.Classes.create({
		className:"v.views.metadata.column.ColumnList",
		superClass:"v.views.commonDocket.CommonDocketList",
		init:function(){
            this.ns = 'v.views.metadata.column.columnList';
			this.module = '';
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.DynamicGrid']();
		}
	});
	(function(List){
		List.prototype.initConditionForm = function(){
			this.initMenuCondition({'tableType':'header'});
			var form = this.form;
//		    this.subscribe(form,form.EVENT.INITED,function(data){
//		    	//var columnPlugin = this.form.getPluginItemsByNs('v.views.component.databaseColumnSelector')[0].plugin;
//		    	//var databaseVal = databaseColumnPlugin.getValue().databaseId;
//		    	   var columnPlugin = form.getItem("databaseId").plugin;
//		    	   this.subscribe(columnPlugin,columnPlugin.EVENT.SELECT_CHANGE,function(data){
//		    		   var tablePlugin = form.getItem("tableId").plugin;
//		    		     tablePlugin.options.params.databaseId=data.id;
//		    	   })
//		    });
		}
		
		List.prototype.initList = function(){
			var that = this;
			var list = this.list;
			list.setActionColumn({
				displayName: "操作",
				key: 'action',
				width: 80,
				render: function(record){
					var html = $('<div class="action"><a class="remove" href="javascript:void(0);" title="删除"><i class="icon-remove"></i></a><a class="edit" href="javascript:void(0);" title="编辑"><i class="icon-edit"></i></a><div>');
					
					$('.remove', html).click(function(){
						that.remove(record);
					});
					$('.edit', html).click(function(){
						that.editDetail(record);
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
		    	list.addTools(tools);
		    });
		    
			list.init({
				url: V.contextPath+this.module+'/m-column!init.action',
				hasData : true,
				sortable:false,
				checkable:false
			});
			this.subscribe(list,'add',this.add);
		}
		List.prototype.editDetail = function(record){
			var options = this.options;
			options.module = this.module;
			options.record =  record;
			options.code =  record.docketCode;
			options.docketId = record.id;
			options.hasDetail = this.list.hasDetail;
			this.forward('v.views.metadata.column.columnEdit',options,function(inst){
				inst.addCrumb();
			});
		}
		List.prototype.add = function(){
			var options = this.options;
			options.module = this.module;
			options.hasDetail = this.list.hasDetail;
			delete options.docketId;
			this.forward('v.views.metadata.column.columnEdit',options,function(inst){
				inst.addCrumb();
			});
		}
		List.prototype.remove = function(record){
			var that = this;
			var info="是否删除";
			V.confirm(info,function ok(e){
				var url = V.contextPath+that.module+'/m-column!deleteEntityAndDescendant.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
	               	data:{ids:record['id'],docketType:that.options.variables.docketType},
	                success:function(data){
	                	if(data == 'success'){
	                		that.list.removeRecord(record);
	                		V.alert("删除成功");
	                	}else{
	                		V.alert("删除失败！");
	                	}
	                }
	            })
			});
		}
		List.prototype.getSelectedIds = function(){
			var records = this.list.getCheckedRecords();
			var rec = [];
			for(var i = 0;i<records.length;i++){
				var obj = records[i];
				rec.push(obj['id']);
			}
			return rec;
		}
		List.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:"字段管理"}});
		}
		List.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:"字段管理"}});
		}
	})(V.Classes['v.views.metadata.column.ColumnList']);
},{plugins:['v.views.commonDocket.commonDocketList','v.ui.dynamicGrid','v.ui.confirm','v.ui.alert','v.views.component.databaseColumnSelector']});
