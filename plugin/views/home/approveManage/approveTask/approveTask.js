;V.registPlugin("v.views.home.approveManage.approveTask",function(){
	V.Classes.create({
		className:"v.views.home.approveManage.ApproveTask",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.home.approveManage.approveTask";
			this.docket = null;
			
			this.ACTION = {
				TASK_DETAIL : 'work-flow!getTasksOfUser.action',
				HISTORY_DETAIL : 'work-flow!getWorkFlowApproveHisList.action'
			}
			
			this.code = "";
			this.module = "";
			
			this.options = {
				title:'审批任务',
				taskTitle:'审批任务信息',
				historyTitle:'审批历史信息'
			}
			this.template = $('<div>\
								<ul class="nav nav-tabs" id="myTab">\
									<li class="active">\
										<a href="#approveTask">审批任务</a>\
									</li>\
									<li>\
										<a href="#approveHistory">审批历史</a>\
									</li>\
								</ul>\
								<div class="tab-content">\
									<div class="tab-pane active" id="tabTask">\
										<div class="docket">\
											<div class="task_detail"></div>\
										</div>\
									</div>\
									<div class="tab-pane" id="tabHistory">\
										<div class="docket">\
											<div class="history_detail"></div>\
										</div>\
									</div>\
								</div>\
								</div>');
		}
	});
	

	(function(ApproveTask){
		ApproveTask.prototype.init = function(options){
			this.module = options.module;
			this.container = options.container;
			for(prop in options){
			    this.options[prop] = options[prop];
			}
			
			this.addCrumb();
			
			var that = this;
			$('.docket_title',this.template).text(this.options.title);
			
			this.initApproveTask();
			this.initApproveHistory();
			this.container.append(this.template);
			//this.initEvent();
			this.initEventTab();
		}
		ApproveTask.prototype.initEvent = function(){
			var that = this;
			$('.title i',this.template).click(function(){
				if($(this).hasClass('icon-chevron-down')){
					$(this).removeClass('icon-chevron-down').addClass('icon-chevron-right');
					$(this).parent().next().slideUp();
				}else{
					$(this).removeClass('icon-chevron-right').addClass('icon-chevron-down');
					$(this).parent().next().slideDown();
				}
			});
		}
		//初始化审批任务列表信息
		ApproveTask.prototype.initApproveTask = function(){
			var that = this;
			this.list = new V.Classes['v.ui.Grid']();
			
			var columns = [
						{displayName:'任务摘要',key:'taskTitle',width:160},
						{displayName:'任务标识',key:'taskId',width:160,isShow:false},
						{displayName:'任务类型',key:'entityType',width:160},
						{displayName:'任务名称',key:'taskName',width:160},
						{displayName:'任务描述',key:'taskDesc',width:160},
						{displayName:'待认领任务',key:'type',width:160,render:function(record){
							return record.type==1?'用户任务':'待认领任务';
						}},
						{displayName:'操作',key:'detail',width:160,render:function(record){
							var html = $('<div class="action"><a class="view" href="javascript:void(0);" title="查看"><i class="icon-search"></i></a><div>');
							$('.view', html).click(function(){
								that.viewTaskDetail(record);
							});
							return html;	
						}}];
						
			this.list.init({
				container : $('.task_detail',this.template),
				url: 'backoffice/systemsetting/workflow'+'/'+this.ACTION.TASK_DETAIL,
				columns:columns
			});
		}
		//初始化审批历史列表信息
		ApproveTask.prototype.initApproveHistory = function(){
			var that = this;
			this.list = new V.Classes['v.ui.Grid']();
			var pagination = new V.Classes['v.ui.Pagination']();
		    this.list.setPagination(pagination);
			var columns = [
						{displayName:'平台标识',key:'platformNo',width:160,isShow:false},
						{displayName:'审批标题',key:'entityTitle',width:160},
						{displayName:'审批人',key:'approver',width:160},
						{displayName:'审批时间',key:'approveDate',width:160},
						{displayName:'操作',key:'detail',width:160,render:function(record){
							var html = $('<div class="action"><a class="view" href="javascript:void(0);" title="查看"><i class="icon-search"></i></a><div>');
							$('.view', html).click(function(){
								that.viewHistoryDetail(record);
							});
							return html;	
						}}];
						
			this.list.init({
				container : $('.history_detail',this.template),
				url: 'backoffice/systemsetting/workflow/'+this.ACTION.HISTORY_DETAIL,
				columns:columns
			});
		}
		ApproveTask.prototype.viewTaskDetail = function(record){
			var options = {};
			options.module = this.module;
			options.taskId = record.taskId;
			options.type = record.type;
			
			this.forward('v.views.home.approveManage.approveDetail',options);
		}
		ApproveTask.prototype.viewHistoryDetail = function(record){
			var options = {};
			options.module = this.module;
			options.code = record.id;
			
			this.forward('v.views.home.approveManage.approveHistoryDetail',options);
		}
		//初始化tab点击事件
		ApproveTask.prototype.initEventTab = function(){
			var that = this;
			$('#myTab a:first').tab('show');
		    $('#myTab a').click(function (e) {
			  e.preventDefault();
			  $(this).tab('show');
			  if( $(this).attr('href')=="#approveTask"){
			  	$('#tabTask').show();
			  	$('#tabHistory').hide();
			  	
			  }else{
			  	$('#tabTask').hide();
			  	$('#tabHistory').show();
			  }
			});
		}
		ApproveTask.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'审批任务'}});
		}
	})(V.Classes['v.views.home.approveManage.ApproveTask']);
},{plugins:["v.component.form","v.ui.dynamicGrid","v.ui.pagination"]})