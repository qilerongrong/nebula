;V.registPlugin("v.views.application.approver.todoList",function(){
	V.Classes.create({
		className:"v.views.application.approver.TodoList",
		superClass:"v.component.SearchList",
		init:function(){
            this.ns = 'v.views.application.approver.todoList';
        	this.module = '';
        	this.list = new V.Classes['v.ui.Grid']();
			this.form = new V.Classes["v.component.Form"]();
			this.isDocketEdit = false; 
		}
	});
	(function(List){
		List.prototype.initConditionForm = function(){
		    var Form = V.Classes['v.component.Form'];
			var items = [
		       {label:this.getLang("LABEL_WORK_FLOW_NAME"),type:Form.TYPE.TEXT,name:'workflowName',value:''}
		       //,{label:'创建人',type:Form.TYPE.TEXT,name:'creator',value:''}
		       ,{label:this.getLang("LABEL_CREATE_TIME"),type:Form.TYPE.DATERANGE,name:'createTime',value:''}
//		       ,{label:"项目编码",type:Form.TYPE.TEXT,name:'dataKey2',value:''}
//		       ,{label:this.getLang("LABEL_VIN"),type:Form.TYPE.TEXT,name:'docketCode',value:''}
//		       ,{label:'其他编码',type:Form.TYPE.TEXT,name:'datakey2',value:''}
//		       ,{label:'项目名称',type:Form.TYPE.TEXT,name:'docketName',value:''}
//		       ,{label:'出让方',type:Form.TYPE.TEXT,name:'sellerName',value:''}
//		       ,{label:'项目责任人',type:Form.TYPE.TEXT,name:'inchargePersonName',value:''}
			];
			var itemsFilters = this.options.itemsFilters;
            if(itemsFilters){
                $.each(items,function(m,item){
                	var key = item.plugin||item.name;
                	item.value = itemsFilters[key]||'';
                });
            }
			this.form.init({
				colspan:3,
				items:items
			});
		}
		List.prototype.initList = function(){
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			var that = this;
			list.setFilters(this.options.filters);
			list.init({
				container : $('.list', this.template),
				checkable : false,
				url :'workflow/todo-task!list.action',
				columns : [
					
					{
						displayName : this.getLang("LIST_TASK_NAME"),
						key : 'taskName',
						width : 120,
						render:function(record){
							var html = $("<a href='javascript:void(0);'>"+record.taskName+"</a>");
							html.click(function(){
								that.showDetai(record);
							});
							return html;
						}
					},
					{
						displayName : "订货单位",
						key : 'customerName',
						width : 120
					},
					{
						displayName : this.getLang("LIST_PROCESS_NAME"),
						key : 'processName',
						width : 80
					},
					{
						displayName : '业务编码',
						key : 'docketCode',
						width : 100
					},
//					{
//						displayName : '业务名称',
//						key : 'docketName',
//						width : 120
//					},
//					{
//						displayName : this.getLang("LIST_DOCKET_CODE"),
//						key : 'dataKey2',
//						width : 70
//					},
					{
						displayName : '流程发起人',
						key : 'createName',
						width : 60
					},
					{
						displayName : '任务创建时间',
						key : 'createTime',
						width : 80,
						render : function(record) {
							return record.createTime;//V.Util.formatDate(new Date(record.createTime));
						}
					},
					{
						displayName : this.getLang("LIST_STATUS"),
						key : 'status',
						width : 40
					}
//					,
//					{
//						displayName : '待办类型',
//						key : 'taskType',
//						width : 70
//					}
//					{
//						displayName : '操作',
//						key : 'action',
//						width : 50,
//						render : function(record) {
//							html = $('<div class="action"><a class="change" href="javascript:void(0);" title="修改"><i class="icon-edit"></i></a><div>');
//							$('.change', html).click(function() {
//								that.editWorkflow(record);
//							});
//							$('.remove', html).click(function() {
//								that.removeWorkflow(record);
//							});
//							return html;
//						}
//					}
				]
//				toolbar:[
//				    {eventId:'add',text:'新建工作流',icon:'icon-plus'}
//				    ,{eventId:'deploy',text:'部署',icon:'icon-share'}
//				    ,{eventId:'undeploy',text:'取消部署',icon:'icon-ban-circle'}
//				    ,{eventId:'startup',text:'启动',icon:'icon-ok'}
//				]
			});
//			this.subscribe(list,'add',this.addWorkflow);
		    this.container.append(this.template);
		}
		List.prototype.addWorkflow = function(){
			this.editWorkflow();
		}
		List.prototype.editWorkflow = function(workflow){
			if(workflow){
				this.options.workflow = workflow;
			}
			this.options.module = this.module;
			this.forward("v.views.application.approver.workflowSetting",this.options,function(p){
				p.addCrumb();
			});
		}
		List.prototype.removeWorkflow = function(record){
			var that = this;
			V.confirm(this.getLang("MSG_IS_DELETE"),function(e){
				$.ajax({
					url:that.module+'/report!delete.action',
					type:'post',
					data:{id:record['id']},
					success:function(data){
						if(data == 'success'){
			              	V.alert(that.getLang("MSG_DEL_SUC"));
			              	that.list.removeRecord(record);
			             }else{
			                V.alert(data);
		                 }	
					}
				})
			});
		}
		List.prototype.showDetai = function(task){
			var options = {};
			if(task){
				options.taskId = task.taskId;
			}
			options.module = this.module;
			this.forward("v.views.application.approver.task",options,function(p){
				p.addCrumb();
			});
		}
		List.prototype.aggree = function(){
			
		}
		List.prototype.disaggree = function(){
			
		}
		List.prototype.quit = function(){
			
		}
		List.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_HANDLE_APPLY")}});
		}
		List.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_HANDLE_APPLY")}});
		}
	})(V.Classes['v.views.application.approver.TodoList']);
},{plugins:['v.component.searchList','v.ui.grid','v.ui.confirm','v.ui.alert',"v.component.fileUpload"]});
