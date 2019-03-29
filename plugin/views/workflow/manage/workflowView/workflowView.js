;V.registPlugin("v.views.workflow.manage.workflowView",function(){
	V.Classes.create({
		className:"v.views.workflow.manage.WorkflowView",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.views.workflow.manage.workflowView';
        	this.module = '';
        	this.workflow = null;
        	this.taskForm = null;
        	this.module='';
        	this.options = {
        		workflowId:'',
        		module:''
        	}
        	this.template = $("<div>\
        			<div class='toolbar' style='margin:0 0 10px 0;'></div>\
        			<div class='taskForm well'></div>\
        			<div class='docket' style='margin-top:20px'></div>\
        			</div>");
        	this.options = {
        	}
		}
	});
	(function(Task){
		Task.prototype.init = function(options){
			this.container = options.container;
			this.container.append(this.template);
			this.module = this.options.module;
			this.workflow = options.workflow;
			for(prop in options){
				this.options[prop] = options[prop];
			}
			this.initTaskForm();
			this.initHistory();
		}
		Task.prototype.initTaskForm = function(){
			var Form = V.Classes['v.component.Form'];
			var form =  new Form();
			var workflow = this.workflow;
			var items = [];
			items.push({label:'流程名称：',type:Form.TYPE.READONLY,name:'workflowName',value:workflow.workflowName||''});
			items.push({label:'流程Key：',type:Form.TYPE.READONLY,name:'workflowKey',value:workflow.workflowKey||''});
			items.push({label:'发布版本号：',type:Form.TYPE.READONLY,name:'workflowId',value:workflow.workflowId||''});
			items.push({label:'创建时间：',type:Form.TYPE.READONLY,name:'createTime',value:workflow.createTime||''});
			items.push({label:'创建人：',type:Form.TYPE.READONLY,name:'createPerson',value:workflow.createPerson||''});
			
			form.init({
				container:$('.taskForm',this.template),
				items:items,
				colspan:2
			})
		}
		
		Task.prototype.initHistory = function(){
			var list = new V.Classes['v.ui.Grid']();
			list.setFilters({workflowKey:this.workflow.workflowKey});
			list.init({
				container:this.template,
				columns:[
				     {displayName:'工作流',key:'workflowName',width:160},
				     {displayName:'工作流key',key:'workflowKey',width:160},
				     {displayName:'版本号',key:'workflowId',width:160},
				     {displayName:'创建时间',key:'createTime',width:100},
				     {displayName:'创建人',key:'createPerson',width:100}
				],
				url:'workflow/workflow-manage!input.action'
			});
		}
		
		Task.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'流程详情'}});
		}
		Task.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'流程详情'}});
		}
	})(V.Classes['v.views.workflow.manage.WorkflowView']);
},{plugins:['v.component.searchList','v.ui.grid','v.ui.confirm','v.ui.alert']});