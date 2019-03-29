/**
 * 任务管理--已完成的任务
 */
;V.registPlugin("v.module.taskManage.compTaskList",function() {
	V.Classes.create({
				className : "v.module.taskManage.CompTaskList",
				superClass : "v.component.SearchList",
				init : function() {
					this.ns = 'v.module.taskManage.compTaskList';
					this.module = '';
					this.list = new V.Classes['v.ui.Grid']();
					this.form = new V.Classes["v.component.Form"]();
				}
			});
	(function(CompTaskList) {
		CompTaskList.prototype.initConditionForm = function() {
			var Form = V.Classes['v.component.Form'];
			this.form.init({
				colspan : 3,
				items : [ {
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
					value : 'COMPLETED,COMPLETED_WITH_ERROR'
				}]
			});
		}
		CompTaskList.prototype.initList = function() {
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			list.setFilters({status:'COMPLETED,COMPLETED_WITH_ERROR'});
			var that = this;
			list.init({
						container : $('.list', this.template),
						checkable : false,
						url : 'quartzlog/quartz-log!list.action',
						columns : [
								{
									displayName : GatewayLang.Schedule.task_name,
									key : 'jobName',
									width : 50,
									render : function(record) {
										 return "<div title='"+record.userTxId+"'>"+record.jobName+"</div>";
									}
								},{
									displayName : GatewayLang.Schedule.start_time,
									key : 'startTime',
									width : 40
									// render : function(record) {
									// 	if (record.startTime != null) {
									// 		return V.Util.formatFullDate(new Date(record.startTime));
									// 	}
									// }
								},{
									displayName : GatewayLang.Schedule.end_time,
									key : 'endTime',
									width : 40
									// render : function(record) {
									// 	if (record.endTime != null) {
									// 		return V.Util.formatFullDate(new Date(record.endTime));
									// 	}
									// }
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
									displayName : GatewayLang.Schedule.desc,
									key : 'triggerDesc'
								},{
									displayName : GatewayLang.Public.Action,
									key : 'action',
									width : 20,
									render : function(record) {
										var html = $('<div>&nbsp;&nbsp;<a class="search" href="javascript:void(0);" title="'+GatewayLang.Public.View_details+'">'+GatewayLang.Public.View_details+'</a><div>');
										//if(record.docPath == "" || record.docPath == undefined || record.docPath == null){
										//	var html = $('<div>&nbsp;&nbsp;<a class="search" href="javascript:void(0);" title="查看明细">查看明细</a><div>');
										//}else{
										//	var html = $('<div>&nbsp;&nbsp;<a class="search" href="javascript:void(0);" title="查看明细">查看明细</a>&nbsp;&nbsp;<a class="download" href="javascript:void(0);" title="信息">信息</a><div>');
										//}
										$('.search', html)
												.click(function() {
															that.taskDetail(record);
														});
										$('.download', html)
												.click(function() {
															
														});
										return html;
									}
								}]
					});
					this.container.append(this.template);
		}
	    CompTaskList.prototype.taskDetail = function(record){
			var options = {};
			options.record = record;
			options.parentns = this.ns;
			this.forward("v.module.taskManage.taskDetail",options);
		}
		CompTaskList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:GatewayLang.Schedule.completed}});
		}
		CompTaskList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:GatewayLang.Schedule.completed}});
		}
	})(V.Classes['v.module.taskManage.CompTaskList']);
}, {
	plugins : [ 'v.component.searchList', "v.ui.grid",
			'v.ui.confirm', 'v.ui.alert', "v.ui.dialog" ]
});