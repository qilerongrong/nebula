;V.registPlugin("v.views.workflow.history.workflowList",function(){
	V.Classes.create({
		className:"v.views.workflow.history.WorkflowList",
		superClass:"v.component.SearchList",
		init:function(){
            this.ns = 'v.views.workflow.history.workflowList';
        	this.module = '';
        	this.list = new V.Classes['v.ui.Grid']();
			this.form = new V.Classes["v.component.Form"]();
		}
	});
	(function(WorkflowList){
		WorkflowList.prototype.initConditionForm = function(){
		    var Form = V.Classes['v.component.Form'];
			var items = [
			    {label:this.getLang("LABEL_PROCESS_TYPE"),type:Form.TYPE.TEXT,name:'workflowKey',value:''}
		       ,{label:'流程名称',type:Form.TYPE.TEXT,name:'workflowName',value:''}
		       ,{label:this.getLang("LABEL_VIN"),type:Form.TYPE.TEXT,name:'dataKey2',value:''}
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
				url :'workflow/process-history!list.action',
				data:[],
				columns : [
					{
						displayName : that.getLang("LABEL_PROCESS_TYPE"),
						key : 'workflowKey',
						width : 100
					},
					{
						displayName : '流程名称',
						key : 'workflowName',
						width : 100
					},
					{
						displayName : that.getLang("LABEL_VIN"),
						key : 'dataKey2',
						width : 100
					},
					{
						displayName : that.getLang("LABEL_STATUS"),
						key : 'status',
						width : 70,
						render : function(record) {
							if (record.status == 'RUNNING') {
								return '运行中';
							} else if (record.status == 'COMPLETE') {
								return '已完成';
							}
						}
					},
					{
						displayName : that.getLang("LABEL_CREATE_TIME"),
						key : 'startTime',
						width : 100,
						render : function(record) {
							return record.startTime;
						}
					},
					{
						displayName : that.getLang("BIN_ACTION"),
						key : 'action',
						width : 30,
						render : function(record) {
							html = $('<div class="action"><a class="change" href="javascript:void(0);" title="详情"><i class="icon-search"></i></a><div>');
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
		
		WorkflowList.prototype.editWorkflow = function(workflow){
			var options = {};
			if(workflow){
				options.historyId = workflow.id;
			}
			options.module = this.module;
			this.forward("v.views.workflow.history.workflowView",options,function(p){
				p.addCrumb();
			});
		}
		
		WorkflowList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("LABEL_PROCESS_TASK")}});
		}
		WorkflowList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("LABEL_PROCESS_TASK")}});
		}
	})(V.Classes['v.views.workflow.history.WorkflowList']);
},{plugins:['v.component.searchList','v.ui.grid','v.ui.confirm','v.ui.alert']});
