;V.registPlugin("v.views.console.todoTask",function(){
	V.Classes.create({
		className:"v.views.console.TodoTask",
		superClass:"v.views.component.ConsolePanel",
		init:function(){
            this.ns = "v.views.console.todoTask";
		    this.title = this.getLang("TITLE_TODO_TASK");
		    this.icon = "icon-todo";
			this.module = '';
		}
	});
	(function(Console){
		Console.prototype.initContent = function(){
			this.publish({eventId:this.EVENT.LOADED});
			var con = $('<div class="todo list1"><ul>\
				    <li><a href="" class="item">新时代健康新时代健康新时代健康新时代健康新时代健康</a><span class="time">2016-11-18</span></li>\
				    <li><a href="" class="item">新时代健康新时代健康新时代健康新时代健康新时代健康</a><span class="time">2016-11-18</span></li>\
				    <li><a href="" class="item">新时代健康新时代健康新时代健康新时代健康新时代健康</a><span class="time">2016-11-18</span></li>\
				    <li><a href="" class="item">新时代健康新时代健康新时代健康新时代健康新时代健康</a><span class="time">2016-11-18</span></li>\
				    <li><a href="" class="item">新时代健康新时代健康新时代健康新时代健康新时代健康</a><span class="time">2016-11-18</span></li>\
				</ul><div><a class="more" href="javascript:void(0);">更多&gt;&gt;</a></div></div>');
			$('.con',this.template).append(con);
		}
		// Console.prototype.initContent = function(){
		// 	var that = this;
		// 	var con = $('<div></div>');
		// 	var grid = new V.Classes['v.ui.Grid']();
		// 	this.subscribe(grid,grid.EVENT.DATA_LOADED,function(){
		// 		that.publish({eventId:that.EVENT.LOADED});
		// 	});
		// 	grid.init({
		// 		container:con,
		// 		url : this.module+'/todo-task!console.action',
		// 		 columns:[
	 //                    {
		// 					displayName: this.getLang("LIST_TASK_NAME"),
		// 					key: 'taskName',
		// 					width: 120,
		// 					render: function(record){
		// 						var html = $('<a href="javascript:void(0);">' + record.taskName + '</a>');
		// 						html.click(function(){
		// 						    that.todoTask(record);
		// 						});
		// 						return html;
		// 					}
		// 				}
		// 				,{displayName:this.getLang("LIST_CREATOR"),key:'createName',width:80}
		// 				,{displayName:this.getLang("LIST_TIME"),key:'createTime',width:115}
		// 		]
		// 	});
		// 	var more = $('<a href="javascript:void(0);" class="more">'+this.getLang("TIP_MORE")+'&gt;&gt;</a>');
		// 	more.click(function(){
		// 		that.moreList();
		// 	});
		// 	con.append(more);
		// 	$('.con',this.template).append(con);
		// }
		// Console.prototype.todoTask = function(record){
		// 	var opt = {
  //               module : this.options.module,
  //               taskId : record.taskId,
  //               menuCode : this.options.menuCode,
  //               menuName : this.options.menuName+" "+this.getLang("MENU_DETAIL"),
  //               navCode : this.options.navCode,
  //               action : "todo-task",
  //               content : 'v.views.application.approver.task'
  //           };
		// 	var data = {
		// 		plugin:'v.views.application.approver.todoList',
		// 		options:opt
		// 	}
		// 	this.publish({eventId:this.EVENT.LOAD_CONTENT,data:data});
		// }
		// Console.prototype.moreList = function(){
		// 	var opt = {
  //               module : this.options.module,
  //               menuCode : this.options.menuCode,
  //               menuName : this.options.menuName,
  //               navCode : this.options.navCode
  //           };
		// 	var data = {
		// 		plugin:'v.views.application.approver.todoList',
		// 		options:opt
		// 	}
		// 	this.publish({eventId:this.EVENT.LOAD_CONTENT,data:data});
		// }
	})(V.Classes['v.views.console.TodoTask']);
},{plugins:['v.views.component.consolePanel','v.ui.grid']})