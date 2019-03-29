/**
 * 任务管理-异常任务
 */
;V.registPlugin("v.module.taskManage.errorTaskList",function() {
	V.Classes.create({
				className : "v.module.taskManage.ErrorTaskList",
				superClass : "v.component.SearchList",
				init : function() {
					this.ns = 'v.module.taskManage.errorTaskList';
					this.module = '';
					this.list = new V.Classes['v.ui.Grid']();
					this.form = new V.Classes["v.component.Form"]();
				}
			});
	(function(ErrorTaskList) {
		ErrorTaskList.prototype.initConditionForm = function() {
			var Form = V.Classes['v.component.Form'];
			this.form.init({
				colspan : 3,
				items : [  {
					label : GatewayLang.Schedule.task_name,
					type : Form.TYPE.TEXT,
					name : 'jobName',
					value : ''
				},{
					label : GatewayLang.Schedule.start_time,
					type : Form.TYPE.DATE,
					name : 'startTime',
					value : ''
				},{
					label : GatewayLang.Schedule.end_time,
					type : Form.TYPE.DATE,
					name : 'endTime',
					value : ''
				},{
					label : 'status',
					type : Form.TYPE.HIDDEN,
					name : 'status',
					value : 'ERROR'
				}]
			});
		}
		ErrorTaskList.prototype.initList = function() {
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			list.setFilters({status:'ERROR'});
			var that = this;
			list.init({
						container : $('.list', this.template),
						checkable : false,
						url : 'quartzlog/quartz-log!list.action',
						columns : [
								{
									displayName : GatewayLang.Schedule.task_name,
									key : 'jobName',
									width : 48,
									render : function(record) {
										 return "<div title='"+record.userTxId+"'>"+record.jobName+"</div>";
									}
								},{
									displayName : GatewayLang.Schedule.start_time,
									key : 'startTime',
									width : 35
									// render : function(record) {
									// 	if (record.startTime != null) {
									// 		return V.Util.formatFullDate(new Date(record.startTime));
									// 	}
									// }
								},{
									displayName : GatewayLang.Schedule.end_time,
									key : 'endTime',
									width : 35
									// render : function(record) {
									// 	if (record.endTime != null) {
									// 		return V.Util.formatFullDate(new Date(record.endTime));
									// 	}
									// }
								},{
									displayName : GatewayLang.Schedule.error_message,
									key : 'description'
								},{
									displayName : GatewayLang.Schedule.type,
									key : 'auto',
									width : 12,
									render: function(record){
										if(record.auto == 'Y' || record.auto == true ){
											return GatewayLang.Schedule.Automated_tasks;
										}else{
											return GatewayLang.Schedule.Manual_tasks;
										}
									}
								},{
									displayName : GatewayLang.Public.Action,
									key : 'action',
									width : 28,
									render : function(record) {
										if(record.docPath == "" || record.docPath == undefined || record.docPath == null){
											var html = $('<div>&nbsp;&nbsp;<a class="search" href="javascript:void(0);" title="'+GatewayLang.Public.View_details+'">'+GatewayLang.Public.View_details+'</a><div>');
										}else{
											var html = $('<div>&nbsp;&nbsp;<a class="search" href="javascript:void(0);" title="'+GatewayLang.Public.View_details+'">'+GatewayLang.Public.View_details+'</a>&nbsp;&nbsp;<a class="download" href="javascript:void(0);" title="'+GatewayLang.Public.download+'">'+GatewayLang.Public.download+'</a><div>');
										}
										$('.search', html)
												.click(function() {
															that.taskDetail(record);
														});
										$('.download', html)
												.click(function() {
														   that.download(record);
														});
										return html;
									}
								}]
					});
					this.container.append(this.template);
		}
		ErrorTaskList.prototype.taskDetail = function(record){
			var options = {};
			options.record = record;
			options.parentns = this.ns;
			this.forward("v.module.taskManage.taskDetail",options);
		}
		ErrorTaskList.prototype.download = function(record){
			 $.ajax({
                url: 'quartzJson/Jquartz!checkErrorFile.action',
                data: {
                    path: record.docPath
                },
                success: function(data){
						if(data != null && data!= undefined && data.flag == 'success' && data.path != ''){
							$('<div class="form_content" style="display:none"></div>').appendTo('body');
			            	var form = $('<div><form name="customform" id="customform" method="POST" action=""></form></div>');
			            	$('body .form_content').append(form);
			            	$("#customform").attr("action", "down/downloadServlet?filePath="+record.docPath);
			           		 $("#customform").submit();
						}else{
							V.alert(GatewayLang.Log.The_file_does_not_exist);
						}
					}
			});
		}
		ErrorTaskList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:GatewayLang.Schedule.fail}});
		}
		ErrorTaskList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:GatewayLang.Schedule.fail}});
		}
	})(V.Classes['v.module.taskManage.ErrorTaskList']);
}, {
	plugins : [ 'v.component.searchList', "v.ui.grid",
			'v.ui.confirm', 'v.ui.alert', "v.ui.dialog" ]
});