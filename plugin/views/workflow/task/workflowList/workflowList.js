;V.registPlugin("v.views.workflow.task.workflowList",function(){
	V.Classes.create({
		className:"v.views.workflow.task.WorkflowList",
		superClass:"v.component.SearchList",
		init:function(){
            this.ns = 'v.views.workflow.task.workflowList';
        	this.module = '';
        	this.list = new V.Classes['v.ui.Grid']();
			this.form = new V.Classes["v.component.Form"]();
			this.fileupload = new V.Classes['v.ui.FileUpload']();
		}
	});
	(function(WorkflowList){
		WorkflowList.prototype.initConditionForm = function(){
		    var Form = V.Classes['v.component.Form'];
			var items = [
		        {label:"任务名称",type:Form.TYPE.TEXT,name:'nodeName',value:''}
//		       ,{label:this.getLang("TIP_CREATE_TIME"),type:Form.TYPE.DATERANGE,name:'createTime',value:''}
		       ,{label:this.getLang("LABEL_ASSIGN"),type:Form.TYPE.TEXT,name:'userName',value:''}
		       ,{label:this.getLang("LABEL_VIN"),type:Form.TYPE.TEXT,name:'docketCode',value:''}
			];
			var filters = this.options.filters;
			if(filters&& filters.length>0){
				$.each(items,function(m,item){
					var key = this.name;
					$.each(filters,function(){
						if(key == this.key){
							item.value = this.value;
							return false;
						}
					})
				});
			}
			this.form.init({
				colspan:2,
				items:items
			});
		}
		WorkflowList.prototype.initList = function(){
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			var that = this;
			list.init({
				container : $('.list', this.template),
				checkable : false,
				url :'workflow/process-task!list.action',
				data:[],
				columns : [
					{
						displayName : '任务标识',
						key : 'taskId',
						width : 70
					},
					{
						displayName : '任务名称',
						key : 'taskName',
						width : 100
					},
//					{
//						displayName : that.getLang("LABEL_PROCESS_NAME"),
//						key : 'processName',
//						width : 100
//					},
					{
						displayName : this.getLang("LIST_VIN"),
						key : 'docketCode',
						width : 100
					},
					{
						displayName : that.getLang("LABEL_STATUS"),
						key : 'status',
						width : 70
					},
					{
						displayName : that.getLang("LABEL_ASSIGN"),
						key : 'userName',
						width : 70
					},
//					{
//						displayName : that.getLang("LABEL_TIME"),
//						key : 'duringTime',
//						width : 50
//					},
					{
						displayName : that.getLang("LABEL_CREATE_DATE"),
						key : 'createTime',
						width : 100,
						render : function(record) {
							return record.createTime;
						}
					},
					{
						displayName : that.getLang("LABEL_ACTION"),
						key : 'action',
						width : 30,
						render : function(record) {
							html = $('<div class="action"><a class="change" href="javascript:void(0);" title='+that.getLang("BTN_DETAIL")+'><i class="icon-edit"></i></a><div>');
							$('.change', html).click(function() {
								that.editWorkflow(record);
							});
							
							return html;
						}
					}
				],
				data:[]
			});
		    this.container.append(this.template);
		}
		
		WorkflowList.prototype.editWorkflow = function(task){
			var options = {};
			if(task){
				options.taskId = task.taskId;
			}
			options.module = this.module;
			this.forward("v.views.workflow.task.workflowView",options,function(p){
				p.addCrumb();
			});
		}
		
		WorkflowList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("BTN_PROCESS_TASK")}});
		}
		WorkflowList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("BTN_PROCESS_TASK")}});
		}
	})(V.Classes['v.views.workflow.task.WorkflowList']);
},{plugins:['v.component.searchList','v.ui.grid','v.ui.confirm','v.ui.alert',"v.component.fileUpload"]});
