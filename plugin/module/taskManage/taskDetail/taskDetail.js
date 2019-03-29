/**
 * 任务管理-任务明细
 */
;V.registPlugin("v.module.taskManage.taskDetail",function() {
	V.Classes.create({
				className : "v.module.taskManage.TaskDetail",
				superClass : "v.component.SearchList",
				init : function() {
					this.ns = 'v.module.taskManage.taskDetail';
					this.module = '';
					this.record = {};
					this.list = new V.Classes['v.ui.Grid']();
					this.form = new V.Classes["v.component.Form"]();
				}
			});
	(function(TaskDetail) {
		TaskDetail.prototype.init = function(options){
			this.record = options.record;
			this.module = options.module;
			this.container = options.container;
			for(prop in options){
			    this.options[prop] = options[prop];
			}
			this.form.container = $('.form-search',this.template);
			this.list.container = $('.list',this.template);
			this.initConditionForm();
			var btn_search = $('<button class="btn btn-primary btn-search">{GatewayLang.Public.Search}</button>');
			btn_search = $(V.Util.parseLangEncode(btn_search[0].outerHTML));
			var that = this;
			btn_search.click(function(){
				that.search();
			});
			$('.form-search',this.template).append($('<div class="row-fluid" style="text-align:center"></div>').append(btn_search));
			//$('.row-fluid:last',this.form.template).append(btn_search);
			this.list.setToolbarPlaceholder($('.list_toolbar',this.template));
			if(this.options.showFilters){
				$('.filters',this.template).css('display','block');
			}else{
				this.list.setToolbar([{eventId:'toggle_search',text:GatewayLang.Public.Search,icon:'icon-search'}]);
				this.subscribe(this.list,'toggle_search',function(){
					var isHidden = ($('.filters',that.tempalte).css('display')== 'none');
					if(isHidden){
						$('.filters',that.tempalte).show();
					}else{
						$('.filters',that.tempalte).hide();
					}
				});
			}
			
			
			this.initList();
			this.container.append(this.template);
			//V.MessageBus.publish({eventId:'removeCrumbs'});
			this.addCrumb();
			//TaskDetail.superclass.init.call(this,options);
		}
		
		TaskDetail.prototype.initConditionForm = function() {
			var Form = V.Classes['v.component.Form'];
			this.form.init({
				colspan : 3,
				items : [  {
					label : GatewayLang.Schedule.desc,
					type : Form.TYPE.TEXT,
					name : 'description',
					value : ''
				},{
					label : 'id',
					type : Form.TYPE.HIDDEN,
					name : 'id',
					value : this.record['id']
				} ]
			});
		}
		TaskDetail.prototype.initList = function() {
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			var that = this;
			list.setFilters({"id":this.record['id']});
			list.init({
						container : $('.list', this.template),
						checkable : false,
						url : 'quartzlog/quartz-log-detail!list.action',
						columns : [
								{
									displayName : GatewayLang.Schedule.Time,
									key : 'time',
									width : 15,
									render : function(record) {
										if (record.time != null) {
											return V.Util.formatFullDate(new Date(record.time));
										}
									}
								},{
									displayName : GatewayLang.Schedule.desc,
									key : 'description'
								},{
									displayName : GatewayLang.Schedule.Operating_status,
									key : 'state',
									width : 20
								},{
									displayName : GatewayLang.Schedule.status,
									key : 'status',
									width : 20,
									render: function(record){
										if(record.triggerState == 'PENDING'){
											return "停上中";
										}else if(record.triggerState == 'COMPLETED'){
											return "已完成";
										}else if(record.triggerState == 'COMPLETED_WITH_ERROR'){
											return "部分完成";
										}else if(record.triggerState == 'ERROR'){// 还在运行，等待运行结束设置为PAUSED
											return "异常";
										}
									}
								}]
					});
					this.container.append(this.template);
		}
		TaskDetail.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:GatewayLang.Schedule.Task_details}});
		}
		TaskDetail.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:GatewayLang.Schedule.Task_details}});
		}
	})(V.Classes['v.module.taskManage.TaskDetail']);
}, {
	plugins : [ 'v.component.searchList', "v.ui.grid",
			'v.ui.confirm', 'v.ui.alert', "v.ui.dialog" ]
});