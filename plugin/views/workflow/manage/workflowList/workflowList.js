;V.registPlugin("v.views.workflow.manage.workflowList",function(){
	V.Classes.create({
		className:"v.views.workflow.manage.WorkflowList",
		superClass:"v.component.SearchList",
		init:function(){
            this.ns = 'v.views.workflow.manage.workflowList';
        	this.module = '';
        	this.list = new V.Classes['v.ui.Grid']();
			this.form = new V.Classes["v.component.Form"]();
		}
	});
	(function(WorkflowList){
		WorkflowList.prototype.initConditionForm = function(){
		    var Form = V.Classes['v.component.Form'];
			var items = [
		       {label:'工作流名字',type:Form.TYPE.TEXT,name:'workflowName',value:''}
		       ,{label:'工作流Key',type:Form.TYPE.TEXT,name:'workflowKey',value:''}
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
				colspan:3,
				items:items
			});
		}
		WorkflowList.prototype.initList = function(){
			var list = this.list;
			//var pagination = new V.Classes['v.ui.Pagination']();
			//list.setPagination(pagination);
			var that = this;
			list.init({
				container : $('.list', this.template),
				checkable : false,
				url :'workflow/workflow-manage!list.action',
				data:[],
				columns : [
					{
						displayName : '流程名称',
						key : 'workflowName',
						width : 100
					},
					{
						displayName : '流程Key',
						key : 'workflowKey',
						width : 70
					},
					{
						displayName : '发布版本号',
						key : 'workflowId',
						width : 70
					},
					{
						displayName : '创建日期',
						key : 'createTime',
						width : 70,
						render : function(record) {
							return record.createTime;
						}
					},
					{
						displayName : '创建人',
						key : 'createPerson',
						width : 70
					},
					{
						displayName : '操作',
						key : 'action',
						width : 30,
						render : function(record) {
							html = $('<div class="action"><a class="change" href="javascript:void(0);" title="查看"><i class="icon-search"></i></a><div>');
							$('.change', html).click(function() {
								that.editWorkflow(record);
							});
							
							return html;
						}
					}
				],
				data:[],
				toolbar:[]
			});
		    this.container.append(this.template);
		}
		WorkflowList.prototype.addWorkflow = function(){
			this.editWorkflow();
		}
		WorkflowList.prototype.editWorkflow = function(workflow){
			if(workflow){
				this.options.workflow = workflow;
			}
			this.options.module = this.module;
			this.forward("v.views.workflow.manage.workflowView",this.options,function(p){
				p.addCrumb();
			});
		}
		
		WorkflowList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'流程管理'}});
		}
		WorkflowList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'流程管理'}});
		}
	})(V.Classes['v.views.workflow.manage.WorkflowList']);
},{plugins:['v.component.searchList','v.ui.grid','v.ui.confirm','v.ui.alert']});
