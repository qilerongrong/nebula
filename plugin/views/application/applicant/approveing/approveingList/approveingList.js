;V.registPlugin("v.views.application.applicant.approveing.approveingList",function(){
	V.Classes.create({
		className:"v.views.application.applicant.approveing.ApproveingList",
		superClass:"v.component.SearchList",
		init:function(){
            this.ns = 'v.views.application.applicant.approveing.approveingList';
        	this.module = '';
        	this.title = this.getLang('CRUMB_AUDIT_APPLY');
        	this.list = new V.Classes['v.ui.Grid']();
			this.form = new V.Classes["v.component.Form"]();
			this.isDocketEdit = false; 
		}
	});
	(function(List){
		List.prototype.initConditionForm = function(){
		    var Form = V.Classes['v.component.Form'];
			var items = [
		      // {label:this.getLang("LABEL_WORK_NAME"),type:Form.TYPE.TEXT,name:'workflowName',value:''}
		      {label:this.getLang("LABEL_WORK_NAME"),type:Form.TYPE.SELECT,name:'workflowKey',value:'',multiList:[['3R Case','CASE_3R'],['Special Case','CASE_SC'],['CCA Case','CASE_CCA'],['Demo Car','DEMO_CAR'],['Loaner Car Register','LOANERCAR_REG'],['Loaner Car Cancel','LOANERCAR_RETIRE'],['Loaner Car Pre-Authorization','LOANERCAR_USE'],['Traffic Compensation','LOANERCAR_TRAFFIC'],['Register CSV','ROADSIDE_REG'],['Cancel CSV','ROADSIDE_RETIRE'],['Roadside Tool','ROADSIDE_TOOL'],['Roadside Info Apply','ROADSIDE_INFO_APPLY'],['Roadside Info Cancel','ROADSIDE_INFO_CANCEL']]}
		       //,{label:'创建人',type:Form.TYPE.TEXT,name:'creator',value:''}
		       ,{label:this.getLang("LABEL_START_TIME"),type:Form.TYPE.DATERANGE,name:'startTime',value:''}
		       ,{label:this.getLang("LABEL_VIN"),type:Form.TYPE.TEXT,name:'dataKey3',value:''}
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
				url :'workflow/approveing/approveing!list.action',
				columns : [
					{
						displayName : this.getLang("LIST_PROCESS_NAME"),
						key : 'taskName',
						width : 150,
						render:function(record){
							var html = $("<a href='javascript:void(0);'>"+record.taskName+"</a>");
							html.click(function(){
								that.showDetai(record);
							});
							return html;
						}
					},
//					{
//						displayName : this.getLang("LIST_PROCESS_NAME"),
//						key : 'processName',
//						width : 70
//					},
					{
						displayName : this.getLang("LIST_VIN"),
						key : 'vin',
						width : 70
					},
					{
						displayName : this.getLang("LIST_DOCKET_CODE"),
						key : 'docketCode',
						width : 70
					},
					{
						displayName : this.getLang("LIST_CREAT_NAME"),
						key : 'createName',
						width : 70
					},
					{
						displayName : this.getLang("LIST_CREAT_TIME"),
						key : 'createTime',
						width : 70,
						render : function(record) {
							return record.createTime;//V.Util.formatDate(new Date(record.createTime));
						}
					},
					{
						displayName : this.getLang("LIST_STATUS"),
						key : 'status',
						width : 70
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
		    	this.title = this.getLang("CRUMB_AUDIT_APPLY")
		    } else {
		    	this.title = this.getLang("MSG_AUDIT_APPLY")
		    }
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
			V.confirm(this.getLang("MSG_ISDELETE"),function(e){
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
			this.forward("v.views.application.applicant.approveing.approveingView",options,function(p){
				p.addCrumb();
			});
		}
		
		List.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.title}});
		}
		List.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.title}});
		}
	})(V.Classes['v.views.application.applicant.approveing.ApproveingList']);
},{plugins:['v.component.searchList','v.ui.grid','v.ui.confirm','v.ui.alert',"v.component.fileUpload"]});
