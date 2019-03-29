;V.registPlugin("v.views.dataAdapter.dataAdapterList",function(){
	V.Classes.create({
		className:"v.views.dataAdapter.DataAdapterList",
		superClass:"v.views.commonDocket.CommonDocketList",
		init:function(){
            this.ns = 'v.views.dataAdapter.dataAdapterList';
			this.module = '';
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.DynamicGrid']();
		}
	});
	(function(List){
		List.prototype.initConditionForm = function(){
			this.initMenuCondition({'tableType':'header'});
		}
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
					var html = {};
					 
					if (record.auditStatus == null || record.auditStatus == '' || record.auditStatus == CONSTANT.views.PROJECT_DOCKET_STATUS.STATUS_DRAFT) {
						html = $('<div class="action"><a class="remove" href="javascript:void(0);" title="删除"><i class="icon-remove"></i></a><a class="edit" href="javascript:void(0);" title="编辑"><i class="icon-edit"></i></a><a class="view" href="javascript:void(0);" title="查询"><i class="icon-search"></i></a><div>');
					}else {
						html = $('<div class="action"><a class="view" href="javascript:void(0);" title="查询"><i class="icon-search"></i></a><div>');
					}
					$('.remove', html).click(function(){
						that.remove(record);
					});
					$('.edit', html).click(function(){
						that.editDetail(record);
					});
					$('.view', html).click(function(){
						that.viewDetail(record);
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
				url: this.module+'/data-adapter!init.action',
				hasData : true,
				sortable:false,
				checkable:false
			});
			this.subscribe(list,'add',this.add);
			//this.subscribe(list,'remove',this.removeSelected);
		}
	

		List.prototype.editDetail = function(record){
			var options = this.options;
			options.module = this.module;
			options.record =  record;
			options.code =  record.docketCode;
			options.docketId = record.id;
			options.id=record.id;
			options.hasDetail = this.list.hasDetail;
			this.forward('v.views.dataAdapter.dataAdapterEdit',options,function(inst){
					inst.addCrumb();
				
			});
		}
		List.prototype.viewDetail = function(record) {
			var options = this.options;
			options.module = this.module;
			options.record =  record;
			options.docketId = record.id;
			options.id=record.id;
			options.hasDetail = this.list.hasDetail;
			this.forward('v.views.dataAdapter.dataAdapterView',options,function(inst){
				inst.addCrumb();
			});
		}
		
		List.prototype.add = function(){
			var options = this.options;
			options.module = this.module;
			options.hasDetail = this.list.hasDetail;
			delete options.docketId;
			this.forward('v.views.dataAdapter.dataAdapterEdit',options,function(inst){
				inst.addCrumb();
			});
		}
		/**删除**/
		List.prototype.remove = function(record){
			var that = this;
			var info="是否删除？";
			V.confirm(info,function ok(e){
				var url = that.module+'/data-adapter!delete.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
	               	data:{ids:record['id'],docketType:that.options.variables.docketType},
	                success:function(data){
	                	if(data == 'success'){
	                		that.list.removeRecord(record);
	                		V.alert("删除成功！");
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
		/**批量删除**/
		List.prototype.removeSelected = function(){
			var that = this;
			var rec = this.getSelectedIds();
			if(rec.length == 0 ){
				V.alert("请选择记录！");
				return;
			}
			V.confirm("确认删除？",function ok(e){
				var records = that.list.getCheckedRecords();
				
				var url = that.module+'/data-adapter!delete.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
					data:{ids:rec.join(','),docketType:that.options.variables.docketType},
	                success:function(data){
	                	if(data == 'success'){
	                		that.list.refresh();
	                		V.alert("删除成功！");
	                	}else{
	                		V.alert("删除失败！");
	                	}
	                }
	            })
			});
		}
		List.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:"运行实例管理"}});
		}
		List.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:"运行实例管理"}});
		}
	})(V.Classes['v.views.dataAdapter.DataAdapterList']);
},{plugins:['v.views.commonDocket.commonDocketList','v.ui.dynamicGrid','v.ui.confirm','v.ui.alert']});