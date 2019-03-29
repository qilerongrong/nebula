;V.registPlugin("v.views.application.approver.docketTask",function(){
	V.Classes.create({
		className:"v.views.application.approver.DocketTask",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.views.application.approver.docketTask';
        	this.module = '';
        	this.title = "任务记录列表";
        	this.list = new V.Classes['v.ui.Grid']();
			this.isDocketEdit = false; 
		}
	});
	(function(List){
		List.prototype.init = function(options){
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			var that = this;
			var filters = {
				docketCode : options.code
			};
			list.setFilters(filters);
			list.init({
				container : options.container,
				checkable : false,
				url :'workflow/completed/completed!listShow.action',
				columns : [
					{
						displayName : "流程名称",
						key : 'processName',
						width : 120,
						render:function(record){
							var html = $("<a href='javascript:void(0);'>"+record.processName+"</a>");
							html.click(function(){
								that.showDetai(record);
							});
							return html;
						}
					},
					{
						displayName : "单据编号",
						key : 'docketCode',
						width : 70
					},

					{
						displayName : "创建人",
						key : 'createName',
						width : 70
					}
					,
					{
						displayName : "创建时间",
						key : 'createTime',
						width : 70,
						render : function(record) {
							return record.createTime;//V.Util.formatDate(new Date(record.createDate));
						}
					}
				]
			});
		}
		List.prototype.showDetai = function(task){
			var options = {};
			var that=this;
			options.module = this.module;
			if(task){
				options.taskId = task.taskId;
				options.nodeId = task.nodeId;
			}
			var dlg = new V.Classes['v.ui.Dialog']();
			
			var html = $('<div class="docket"></div>');
			html = $("<div>\
        			<div class='toolbar' style='margin:0 0 10px 0;'></div>\
        			<div class='taskForm well'></div>\
        			<div class='docket'></div>\
        			<div class='history'></div>\ </div>");
			dlg.setContent(html);
			var taskId=task.taskId;
			if(taskId){
				$.ajax({
					url:'workflow/completed/completed!input.action',
					data:{historyId:taskId,nodeId:task.nodeId},
					success:function(task){
						that.task = task;
						that.initActionBar(taskId,html);
						that.initTaskForm();
						that.initDocket();
						that.initHistory(taskId);
						
					}
				})
			}
			var btns = [];
			btns.push({text:"关闭",style:"btn-primary",handler:dlg.close});
			dlg.setBtnsBar({btns:btns});
			dlg.init({width:1000,height:500,title:'项目详细信息'});
		}
		List.prototype.initDocket = function(){
			var nodeConfig = this.task.flowItem;
			var variables = this.task.history.variables;
			var docketType = this.docketType = variables.docketType;
			var docketCustom = $.parseJSON(nodeConfig.docketCustom);
			var docketConfig = docketCustom[docketType];
			
			var url = docketConfig.outerFormUrl;
			var pluginConfig = $.parseJSON(url);
			
			var cateCode = null;
			var plugin = pluginConfig.ns;
			plugin = plugin.substring(0,plugin.length-4);
			plugin = plugin+"View";
			this.isDocketEdit = false;
			var docketId;
			if(variables){
				cateCode = variables.cateCode;
				var formvar = variables['formvar'];
				if(formvar!=null && formvar.length!=0 && docketType!=null && docketType!=""){
					$.each(formvar,function(){
						if(this.type==docketType){
							docketId = this.id;
							return false;
						}
					})
				}else{
					docketId = variables["docketId"]||'';
				}
			}else{
				docketId = '';
			}
			
			var module = pluginConfig.module;
			var variablesOpt = {
				taskId : this.task.taskId,
				cateCode : cateCode,
				docketType : docketType,
				isFromFlow : false
			};
			var opt = {
				docketId : docketId,
				container : $('.docket', this.html),
				module : module,
				cateCode :cateCode,
				isEdit : false,
				variables : variablesOpt
			};
			
			V.loadPlugin(plugin,function(inst){
				var glass = V._registedPlugins[plugin].glass;
				var inst = new V.Classes[glass]();
				inst.init(opt);
			})
		}
		List.prototype.initActionBar = function(taskId,context){
			this.TASKACTIONS = {
            		FLOW:{
            			text:"流程图",
            			icon:'',
            			handler:''
            		}
            	}
			var actions = ['FLOW'];
			var that = this;
			$.each(actions,function(){
				var action = that.TASKACTIONS[this];
				var btn = $("<a href='javascript:void(0);' class='btn btn-small' style='margin-right:10px;'><i class="+action.icon+"></i>"+action.text+"</a>");
				btn.click(function(){
					that.showWorkflow(taskId);
				})
				$('.toolbar',context).append(btn);
			});
		}
		List.prototype.showWorkflow = function(taskId){
			var that = this;
			var dlg = new V.Classes['v.ui.Dialog']();
			var con = $('<div></div>');
			dlg.setContent(con);
			dlg.init({
				title:'流程图',
				width:960,
				height:600
			});
			var mask = V.mask(con);
			
			$.ajax({
				url:'workflow/completed/completed!workFlowHistory.action',
				data:{historyId:taskId},
				success:function(data){
					V.unMask(mask);
					var workflow = data.workflow;
					var currentNodeId = data.nodeId;
					var currentMainNodeId = data.mainNodeId;
					var wf = new V.Classes['v.component.Workflow']();
					wf.init({
						container:con
					});
					var lines = [];
					var nodeMap = {};
					$.each(workflow.items,function(){
					    if(this.type == "LINE"){
					    	lines.push(this);
					    	return true;
					    }
					    var ui = $.parseJSON(this.ui);
					    var nodeConfig = {
					    	type : this.type,
					    	text:this.name,
					    	data:this,
					    	position:{top:ui.y,left:ui.x}
					    };
					    var node = addNode(nodeConfig,wf);
					    if(this.id == currentNodeId||this.id == currentMainNodeId){
					    	node.addClass("_jsPlumb_endpoint_anchor_ selected");
					    }
					    nodeMap[this.id] = node
					});
					$.each(lines,function(){
						var conn = wf.connect(nodeMap[this.fromNode].get(0),nodeMap[this.toNode].get(0));
						conn.setLabel(this.name);
					});
				},
				error:function(){
					V.unMask(mask);
				}
			});
			function addNode(nodeConfig,wf){
				var type = nodeConfig.type;
				var text = nodeConfig.text;
				var data = nodeConfig.data;
				var position = nodeConfig.position;
				var node;
				if(type == "START"||type == "DBPOLLER"||type == "TIMER"){
					node = wf.addBeginNode(text,position.left,position.top,data);
				}else if(type == "END"){
					node = wf.addEndNode(text,position.left,position.top,data);
				}else{
					node = wf.addNode(text,position.left,position.top,data);
				}
				return node;
			}
		}
		List.prototype.initTaskForm = function(){
			var Form = V.Classes['v.component.Form'];
			var form = new Form();
			var that = this;
			var items = [];
			items.push({label:"流程名称",name:'workflowName',type:Form.TYPE.READONLY,value:that.task.history.workflowName||''});
			items.push({label:'创建人',name:'launcherName',type:Form.TYPE.READONLY,value:that.task.history.launcherName||''});
			items.push({label:'开始时间',name:'startTime',type:Form.TYPE.READONLY,value:that.task.history.startTime||''});
			items.push({label:'结束时间',name:'endTime',type:Form.TYPE.READONLY,value:that.task.history.endTime||''});
			
			form.init({
				container:$('.taskForm',that.html),
				items:items,
				colspan:2
			})
		}
		List.prototype.initHistory = function(taskId){
			var  that=this;
			var _list = new V.Classes['v.ui.Grid']();
			_list.setFilters({historyId:taskId});
			_list.init({
				container:$('.history', that.html),
				columns:[
				     {displayName:"审批操作",key:'nodeName',width:100},
				     {displayName:"任务名称",key:'action',width:80,render:function(record){
				    	 return DictInfo.getVar('WF_ACTION')[record.action];
				     }},
				     {displayName:"审批时间",key:'endTime',width:100},
				     {displayName:"审批意见",key:'comment',width:100},
				     {displayName:"审批人",key:'executorName',width:80},
				     {displayName:"备注",key:'remark',width:100}
				],
				url:'workflow/completed/completed!history.action'
			});
		}
		List.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:"任务记录列表"}});
		}
		List.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:"任务记录列表"}});
		}
	})(V.Classes['v.views.application.approver.DocketTask']);
},{plugins:['v.ui.grid','v.ui.confirm','v.ui.alert','v.component.workflow']});
