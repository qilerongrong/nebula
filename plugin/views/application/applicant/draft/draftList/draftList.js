;V.registPlugin("v.views.application.applicant.draft.draftList",function(){
	V.Classes.create({
		className:"v.views.application.applicant.draft.DraftList",
		superClass:"v.component.SearchList",
		init:function(){
            this.ns = 'v.views.application.applicant.draft.draftList';
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
		       {label:this.getLang("LABEL_WORK_FLOW_KEY"),type:Form.TYPE.SELECT,name:'workflowKey',value:'',multiList:[['3R','CASE_3R'],['SC','CASE_SC'],['CCA','CASE_CCA'],['DEMO_CAR','DEMO_CAR'],['LOANER_REGISTER','LOANERCAR_REG'],['LOANERCAR_RETIRE','LOANERCAR_RETIRE'],['LOANERCAR_USE','LOANERCAR_USE'],['LOANERCAR_TRAFFIC','LOANERCAR_TRAFFIC']]}
		       ,{label:this.getLang("LABEL_LAUNCHER_NAME"),type:Form.TYPE.DATERANGE,name:'createTime',value:''}
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
		List.prototype.initList = function(){
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			var that = this;
			list.init({
				container : $('.list', this.template),
				checkable : false,
				url :'workflow/draft/draft!list.action',
				columns : [
					{
						displayName : this.getLang("LIST_WORK_FLOW_NAME"),
						key : 'workflowName',
						width : 150,
						render:function(record){
							var html = $("<a href='javascript:void(0);'>"+record.workflowName+"</a>");
							html.click(function(){
								that.showDetai(record);
							});
							return html;
						}
					},
					{
						displayName : this.getLang("LIST_CREATE_TIME"),
						key : 'createTime',
						width : 70,
						render : function(record) {
							return record.createDate;
						}
					},
					
					{
						displayName : this.getLang("LIST_WORK_FLOW_TYPE"),
						key : 'workflowType',
						width : 70
					}
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
		
		List.prototype.showDetai = function(task){
			var options = {};
			if(task){
				options.id = task.id;
			}
			options.module = this.module;
			this.forward("v.views.application.applicant.draft.draftView",options,function(p){
				p.addCrumb();
			});
		}
		
		List.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_MY_DRAFT")}});
		}
		List.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_MY_DRAFT")}});
		}
	})(V.Classes['v.views.application.applicant.draft.DraftList']);
},{plugins:['v.component.searchList','v.ui.grid','v.ui.confirm','v.ui.alert',"v.component.fileUpload"]});
