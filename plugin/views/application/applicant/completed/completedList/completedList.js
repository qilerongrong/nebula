;V.registPlugin("v.views.application.applicant.completed.completedList",function(){
	V.Classes.create({
		className:"v.views.application.applicant.completed.CompletedList",
		superClass:"v.component.SearchList",
		init:function(){
            this.ns = 'v.views.application.applicant.completed.completedList';
        	this.module = '';
        	this.title = this.getLang('CRUMB_END_APPLY');
        	this.list = new V.Classes['v.ui.Grid']();
			this.form = new V.Classes["v.component.Form"]();
			this.isDocketEdit = false; 
		}
	});
	(function(List){
		List.prototype.initConditionForm = function(){
		    var Form = V.Classes['v.component.Form'];
			var items = [
		       {label:this.getLang("LABEL_WORK_NAME"),type:Form.TYPE.TEXT,name:'workflowName',value:''}
		       //,{label:'创建人',type:Form.TYPE.TEXT,name:'launcherName',value:''}
		       ,{label:this.getLang("LABEL_START_TIME"),type:Form.TYPE.DATERANGE,name:'startTime',value:''}
//		       ,{label:"订单编码",type:Form.TYPE.TEXT,name:'docketCode',value:''}
//		       ,{label:this.getLang("LABEL_VIN"),type:Form.TYPE.TEXT,name:'docketCode',value:''}
//		       ,{label:'其他编码',type:Form.TYPE.TEXT,name:'datakey2',value:''}
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
		List.prototype.initList = function(){
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			var that = this;
			list.init({
				container : $('.list', this.template),
				checkable : false,
				url :'workflow/completed/completed!list.action',
				columns : [
					{
						displayName : "任务名称",
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
						width : 100
					},
					{
						displayName : '业务编码',
						key : 'docketCode',
						width : 80
					},
//					{
//						displayName : this.getLang("LIST_DOCKET_CODE"),
//						key : 'docketCode',
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
						width : 70,
						render : function(record) {
							return record.createTime;//V.Util.formatDate(new Date(record.createDate));
						}
					},
					{
						displayName : this.getLang("LIST_STATUS"),
						key : 'status',
						width : 40,
						render : function(record) {
//							return DictInfo.getValue('WORKFLOW_APPROVE',record.status);
							return CONSTANT.B2B.TASK_STATUS[record.status];
						}
					}
//					,
//					{
//						displayName : this.getLang("LIST_TASK_TYPE"),
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
		    if (LoginInfo.user.businessRole == CONSTANT.BUSINESS_ROLE.CUSTOMER){
		    	this.title = this.getLang('CRUMB_END_APPLY');
		    } else {
		    	this.title = this.getLang('MSG_AUDIT_APPLY');
		    }
		}
		
		List.prototype.showDetai = function(task){
			var options = {};
			if(task){
				options.taskId = task.taskId;
				options.nodeId = task.nodeId;
			}
			options.module = this.module;
			this.forward("v.views.application.applicant.completed.completedView",options,function(p){
				p.addCrumb();
			});
		}
		
		List.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.title}});
		}
		List.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.title}});
		}
	})(V.Classes['v.views.application.applicant.completed.CompletedList']);
},{plugins:['v.component.searchList','v.ui.grid','v.ui.confirm','v.ui.alert',"v.component.fileUpload"]});
