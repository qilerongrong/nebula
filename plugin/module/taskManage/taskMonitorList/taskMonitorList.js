/**
 * 任务管理-运行中的任务
 */
;V.registPlugin("v.module.taskManage.taskMonitorList",function() {
	V.Classes.create({
				className : "v.module.taskManage.TaskMonitorList",
				superClass : "v.component.SearchList",
				init : function() {
					this.ns = 'v.module.taskManage.taskMonitorList';
					this.module = '';
					this.list = new V.Classes['v.ui.Grid']();
					this.form = new V.Classes["v.component.Form"]();
				}
			});
	(function(TaskMonitorList) {
		TaskMonitorList.prototype.initConditionForm = function() {
			var Form = V.Classes['v.component.Form'];
			this.form.init({
				colspan : 3,
				items : [{
					label : GatewayLang.Schedule.start_time,
					type : Form.TYPE.DATE,
					name : 'startTime',
					value : ''
				},{
					label : GatewayLang.Schedule.end_time,
					type : Form.TYPE.DATE,
					name : 'eTime',
					value : ''
				},{
					label : GatewayLang.Schedule.task_name,
					type : Form.TYPE.TEXT,
					name : 'jobName',
					value : ''
				},{
					label : 'status',
					type : Form.TYPE.HIDDEN,
					name : 'status',
					value : 'PENDING'
				}]
			});
		}
		TaskMonitorList.prototype.initList = function() {
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			list.setFilters({status:'PENDING'});
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
									displayName : GatewayLang.Schedule.start_run_time,
									key : 'startTime',
									width : 35
									// render : function(record) {
									// 	if (record.startTime != null) {
									// 		return V.Util.formatFullDate(new Date(record.startTime));
									// 	}
									// }
								},{
									displayName : GatewayLang.Schedule.type,
									key : 'auto',
									width : 30
									// render: function(record){
									// 	if(record.auto == 'Y' || record.auto == true ){
									// 		return GatewayLang.Schedule.Automated_tasks;
									// 	}else{
									// 		return GatewayLang.Schedule.Manual_tasks;
									// 	}
									// }
								},{
									displayName : GatewayLang.Schedule.desc,
									key : 'triggerDesc'
								},{
									displayName : GatewayLang.Public.Action,
									key : 'action',
									width : 30,
									render : function(record) {
										var html = $('<div>&nbsp;&nbsp;<a class="search" href="javascript:void(0);" title="'+GatewayLang.Public.View_details+'">'+GatewayLang.Public.View_details+'</a><div>');
										//if(record.docPath == "" || record.docPath == undefined || record.docPath == null){
										//V.alert("保存成功!");
										//}else{
										//	var html = $('<div><a class="pause" href="javascript:void(0);" title="暂停">暂停</a>&nbsp;&nbsp;<a class="search" href="javascript:void(0);" title="查看明细">查看明细&nbsp;&nbsp;<a class="download" href="javascript:void(0);" title="信息">信息</a><div>');
										//}
										$('.pause', html)
												.click(function() {
															that.pauseTask(record);
														});
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
		TaskMonitorList.prototype.pauseTask = function(record){
			 $.ajax({
				url:"quartzlog/quartzlog!pauseJob.action",
               	type:'POST',
				data:{id:record['id']},
                success:function(data){
                	if(data != undefined && data.flag == '0'){
                		 V.alert(GatewayLang.Public.Run_successfully + "!");
						 that.list.refresh();
						 addDlg.close();
					}else if(data != undefined){
						V.alert(data.smsg);
					}else{
						V.alert(GatewayLang.Public.Failed_to_run + "!");
					}
                }
		     });
		}
		TaskMonitorList.prototype.taskDetail = function(record){
			var options = {};
			options.record = record;
			options.parentns = this.ns;
			this.forward("v.module.taskManage.taskDetail",options);
		}
		TaskMonitorList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:GatewayLang.Schedule.running}});
		}
		TaskMonitorList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:GatewayLang.Schedule.running}});
		}
	})(V.Classes['v.module.taskManage.TaskMonitorList']);
}, {
	plugins : [ 'v.component.searchList', "v.ui.grid",
			'v.ui.confirm', 'v.ui.alert', "v.ui.dialog" ]
});