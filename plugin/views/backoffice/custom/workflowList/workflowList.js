;V.registPlugin("v.views.backoffice.custom.workflowList",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.WorkflowList",
		superClass:"v.views.component.SearchList",
		init: function(){
			this.module = "";
			this.ns = "v.views.backoffice.custom.workflowList";
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.Grid']();
		}
	});
	(function(WorkflowList){
		WorkflowList.prototype.initConditionForm = function(){
			    var Form = V.Classes['v.component.Form'];
				var items = [
					       {label:'流程名',type:Form.TYPE.TEXT,name:'workflowName',value:''}
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
			var pagination = new V.Classes['v.ui.Pagination']();
			var list = this.list;
			list.setPagination(pagination);
			list.setFilters(this.options.filters);
			var that = this;
			list.init({
				container:$('.list',this.template),
				url:this.module+'/work-flow!list.action',
				columns:[
			        {displayName:"流程名",key:"workflowName",width:200},
					{displayName:"描述",key:"descriptions",width:480},
					{displayName:'是否发布',key:'isDeploy',width:100,render:function(record){
						if(record.isDeploy == 1){
							return "已发布";
						}else{
							return "未发布";
						}
					}},
					{displayName:'是否使用',key:'isUsed',width:100,render:function(record){
						if(record.isUsed == 1){
							return "应用中";
						}else{
							return "未应用";
						}
					}},
					{displayName:"操作",key:"action",width:120,render:function(record){
						var html = $("<div class='action'>");
						var edit = $("<a class='edit' href='javascript:void(0);' title='修改'><i class='icon-edit'></i></a>");
						edit.click(function(){
							that.edit(record);
						});
						var deploy = $("<a class='deploy' href='javascript:void(0);' title='发布'><i class='icon-play'></i></a>");
						deploy.click(function(){
							V.ajax({
								url:that.module+'/work-flow!deployWorkflow.action',
								data:{flow:{name:record.name}},
								success:function(){
									list.refresh();
								}
							})
						});
						var undeploy = $("<a class='undeploy' href='javascript:void(0);' title='取消发布'><i class='icon-stop'></i></a>");
						undeploy.click(function(){
							V.ajax({
								url:that.module+'/work-flow!unDeployWorkflow.action',
								data:{flow:{name:record.name}},
								success:function(){
									list.refresh();
								}
							})
						});
						var use = $("<a class='start' href='javascript:void(0);' title='使用'><i class=' icon-ok'></i></a>");
						use.click(function(){
							$.ajax({
								url:that.module+'/work-flow!doUsed.action',
								data:{id:record.id},
								success:function(){
									list.refresh();
								}
							});
						});
						html.append(edit);
						if(record.isDeploy == -1){
							html.append(deploy);
						}else{
							html.append(undeploy);
						}
						if(record.isDeploy == 1 && record.isUsed == -1){
							html.append(use);
						}
						return html.append("</div>");
					}}
				],
				toolbar:[
			          {eventId:'add',text:'新建流程',icon:'icon-plus'}
				]
			});
			this.subscribe(list,'add',this.create);
			this.container.append(this.template);
		}
		WorkflowList.prototype.create = function(){
			var options = {};
			options.module = this.module;
			this.forward("v.views.backoffice.custom.workflow",options);
		};
		WorkflowList.prototype.edit = function(flow){
		    	var opt = {
					module : this.module,
					workflowData : flow
				}
				this.forward('v.views.backoffice.custom.workflow',opt);
		};
		WorkflowList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'工作流列表'}});
		}
		WorkflowList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'工作流列表'}});
		}
	})(V.Classes['v.views.backoffice.custom.WorkflowList']);
},{plugins:['v.views.component.searchList',"v.component.form","v.ui.grid","v.ui.pagination"]});