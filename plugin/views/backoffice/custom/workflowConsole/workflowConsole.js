;V.registPlugin("v.views.backoffice.custom.workflowConsole",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.WorkflowConsole",
		superClass:"v.Plugin",
		init: function(){
			this.module = "";
			this.options = {};
			this.ns = "v.views.backoffice.custom.workflowConsole";
			this.list = new V.Classes['v.ui.Grid']();
			this.template = $('<div><div id="con1"></div><div id="con2"></div></div>');
		}
	});
	
	(function(WorkflowConsole){
		WorkflowConsole.prototype.init = function(options){
			this.container  = options.container;
			this.module = options.module;
			for(prop in options){
				this.options[prop] = options[prop];
			};
			this.container.append(this.template);
			this.initList();
			this.addCrumb();
		}
		WorkflowConsole.prototype.initList = function(){
			//var pagination = new V.Classes['v.ui.Pagination']();
			var list = this.list;
			//list.setPagination(pagination);
			//list.setFilters(this.options.filters);
			var that = this;
			list.init({
				container:$('#con1',that.template),
				url:this.module+'/work-flow-console!queryProcessInstances.action',
				columns:[
			        {displayName:"id",key:"id"},
			        {displayName:"流程定义",key:"processDefinitionId"},
			        {displayName:"开始时间",key:"startTime"},
			        {displayName:"结束时间",key:"endTime",render:function(record){
			        	if(record.endTime == null){
							return "";
						}else{
							return record.endTime;
						}
			        }},
			        {displayName:"是否完成",key:"processDefinitionId",render:function(record){
			        	if(record.endTime != null){
							return "完成";
						}else{
							return "未完成";
						}
			        }},
			        {displayName:"操作",key:"processDefinitionId",render:function(record){
			        	var html = $("<div></div>");
			        	var del = $("<a class='del' title='关闭流程'><i class='icon-edit'></i></a>");
			        	del.click(function(){
							V.ajax({
								url:that.module+'/work-flow-console!closeProcessInstance.action',
								data:{
									processInstanceId:record.id
								},
								success:function(){
									list.refresh();
								}
							})
						});
			        	html.append(del);
			        	return html;
			        }}
				]
			});
			//this.subscribe(list,'add',this.create);
			//this.container.append(this.template);
		}
		WorkflowConsole.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'工作流列表'}});
		}
		WorkflowConsole.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'工作流列表'}});
		}
	})(V.Classes['v.views.backoffice.custom.WorkflowConsole']);
},{plugins:["v.ui.grid"]});