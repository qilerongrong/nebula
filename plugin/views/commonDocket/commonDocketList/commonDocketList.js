;V.registPlugin("v.views.commonDocket.commonDocketList",function(){
	V.Classes.create({
		className:"v.views.commonDocket.CommonDocketList",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = 'v.views.commonDocket.commonDocketList';
			this.module = 'saiku/index.html';
			//element
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.DynamicGrid']();
			//actions
			this.ACTIONS = {
				INIT:{url:'common-docket!init.action'},
				ADD:{plugin:'v.views.commonDocket.commonDocketEdit'},
				REMOVE:{url:'common-docket!delete.action'},
				VIEWDETAIL:{plugin:'v.views.commonDocket.commonDocketView'},
				EDITDETAIL:{plugin:'v.views.commonDocket.commonDocketEdit'}
			}
			
		}
	});
	(function(CommonDocketClass){
		CommonDocketClass.prototype.init = function(options){
			CommonDocketClass.superclass.init.call(this,options);
		}
		CommonDocketClass.prototype.initConditionForm = function(){
			this.initMenuCondition({'tableType':'header'});
		}
		CommonDocketClass.prototype.initListActions = function(){
			var list = this.list;
			this.subscribe(list,list.EVENT.INITED,function(data){
		    	var actions = data.actions;
		    	var tools = [];
		    	tools.push({eventId:'add',text:"新增",icon:'icon-plus'});
		    	tools.push({eventId:'remove',text:'批量删除',icon:'icon-remove'});
		    	list.addTools(tools);
		    });
		    this.subscribe(list,'add',this.add);
			this.subscribe(list,'remove',this.removeSelected);
		}
		CommonDocketClass.prototype.initActionColumn = function(){
			var list = this.list;
			var that = this;
			list.setActionColumn({
				displayName: "操作",
				key: 'action',
				width: 80,
				render: function(record){
					var html = {};
					if (record.auditStatus == null || record.auditStatus == '' || record.auditStatus == CONSTANT.APPROVE_STATUS.APPROVE_STATUS_NA) {
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
		}
		CommonDocketClass.prototype.initList = function(){
			var that = this;
			var list = this.list;
			this.initActionColumn();
			var pagination = new V.Classes['v.ui.Pagination']();
		    list.setPagination(pagination);
		    list.setFilters(this.options.filters);
		    this.initListActions();
			list.init({
				url: this.module+'/'+this.ACTIONS.INIT.url,
				hasData : true,
				sortable:false,
				checkable:true
			});
		}
		CommonDocketClass.prototype.getFilters = function(){
			var that = this;
			
			var filters = this.options.filters||{};
			var formFilters = this.form.getValues();
			if(this.options.tableType!=null){
				filters.menuCode = this.options.menuCode;
				filters.tableType = this.options.tableType;
				filters.cateCode = this.options.cateCode||'';
				filters.docketType = this.options.variables.docketType||'';
			}
			for(key in formFilters){
				filters[key] = formFilters[key];
			}
			return filters;
		}
		CommonDocketClass.prototype.editDetail = function(record){
			var options = this.options;
			options.module = this.module;
			options.record =  record;
			options.docketId = record.id;
			options.hasDetail = this.list.hasDetail;
			this.forward(this.ACTIONS.EDITDETAIL.plugin,options,function(inst){
				inst.addCrumb();
			});
		}
		CommonDocketClass.prototype.viewDetail = function(record) {
			var options = this.options;
			options.module = this.module;
			options.record =  record;
			options.docketId = record.id;
			options.hasDetail = this.list.hasDetail;
			this.forward(this.ACTIONS.VIEWDETAIL.plugin,options,function(inst){
				inst.addCrumb();
			});
		}
		CommonDocketClass.prototype.add = function(){
			var options = this.options;
			options.module = this.module;
			options.hasDetail = this.list.hasDetail;
			delete options.docketId;
			this.forward(this.ACTIONS.ADD.plugin,options,function(inst){
				inst.addCrumb();
			});
		}
		CommonDocketClass.prototype.remove = function(record){
			var that = this;
			var info="是否删除";
			V.confirm(info,function ok(e){
//				var url = that.module+'/common-docket!delete.action';
				var url = that.module+'/'+that.ACTIONS.REMOVE.url;
	            $.ajax({
	            	url:url,
	               	type:'POST',
	               	data:{ids:record['id'],docketType:that.options.variables.docketType},
	                success:function(data){
	                	if(data.result == 'success'){
	                		that.list.removeRecord(record);
	                		V.alert("删除成功");
	                	}else{
	                		V.alert("删除失败！");
	                	}
	                }
	            })
			});
		}
		CommonDocketClass.prototype.getSelectedIds = function(){
			var records = this.list.getCheckedRecords();
			var rec = [];
			for(var i = 0;i<records.length;i++){
				var obj = records[i];
				rec.push(obj['id']);
			}
			return rec;
		}
		/**批量删除**/
		CommonDocketClass.prototype.removeSelected = function(){
			var that = this;
			var rec = this.getSelectedIds();
			if(rec.length == 0 ){
				V.alert("请选择记录！");
				return;
			}
			V.confirm("确认删除？",function ok(e){
				var records = that.list.getCheckedRecords();
				
				var url = that.module+'/common-docket!delete.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
//					data:{ids:rec.join(','),docketType:record['docketType']},
				  	data:{ids:rec.join(','),docketType:that.filters.docketType},
	                success:function(data){
	                	if(data.result == 'success'){
	                		that.list.refresh();
	                		V.alert("删除成功");
	                	}else{
	                		V.alert("删除失败");
	                	}
	                }
	            })
			});
		}
		CommonDocketClass.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:"单据列表"}});
		}
		CommonDocketClass.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:"单据列表"}});
		}
	})(V.Classes['v.views.commonDocket.CommonDocketList']);
},{plugins:['v.views.component.searchList','v.ui.dynamicGrid','v.ui.confirm','v.ui.alert']});
