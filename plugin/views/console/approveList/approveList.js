;V.registPlugin("v.views.console.approveList",function(){
	V.Classes.create({
		className:"v.views.console.ApproveList",
		superClass:"v.views.component.ConsolePanel",
		init:function(){
            this.ns = "v.views.console.approveList";
		    this.title = this.getLang("TITLE_APPROVE_TASK");
			this.module = '';
		}
	});
	(function(Console){
		Console.prototype.initContent = function(){
			var that = this;
			var con = $('<div></div>');
			
			//审批任务列表
			var gridInfo = new V.Classes['v.ui.Grid']();
			this.subscribe(gridInfo,gridInfo.EVENT.DATA_LOADED,function(){
				that.publish({eventId:that.EVENT.LOADED});
			});
			gridInfo.init({
				container:con,
				url : this.module+'/work-flow!getTasksOfUser.action',
				//data:[{'taskTitle':'11','taskId':'22'}],
				columns:[
						{displayName:this.getLang("LIST_TASK_NAME"),key:'taskTitle',width:200,render: function(record){
								var html = $('<a href="javascript:void(0);">' + record.taskTitle + '</a>');
								html.click(function(){
								    that.approveDetail(record);
								});
								return html;
							}},
						{displayName:this.getLang("LIST_TASK_TYPE"),key:'entityType',align:'center',width:100,isShow:true}
				]
			});
			
			var more = $('<a href="javascript:void(0);" class="more">'+this.getLang("TIP_MORE")+'&gt;&gt;</a>');
			more.click(function(){
				that.approveList();
			});
			con.append(more);
			$('.con',this.template).append(con);
		}
		Console.prototype.approveDetail = function(record){
			var opt = {};
			opt.module = this.module;
			opt.taskId = record.taskId;
			opt.type = record.type;
			var data = {
				plugin:'v.views.home.approveManage.approveDetail',
				options:opt
			}
			this.publish({eventId:this.EVENT.LOAD_CONTENT,data:data});
		}
		Console.prototype.approveList = function(){
			var opt = {};
			opt.module = this.module;
			var data = {
				plugin:'v.views.home.approveManage.approveList',
				options:opt
			}
			this.publish({eventId:this.EVENT.LOAD_CONTENT,data:data});
			
		}
	})(V.Classes['v.views.console.ApproveList']);
},{plugins:['v.views.component.consolePanel','v.ui.grid']})