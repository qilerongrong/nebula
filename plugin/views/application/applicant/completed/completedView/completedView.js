;V.registPlugin("v.views.application.applicant.completed.completedView",function(){
	V.Classes.create({
		className:"v.views.application.applicant.completed.CompletedView",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.views.application.applicant.completed.completedView';
        	this.task = null;
        	this.module='';
        	this.options = {
        		taskId:'',
        		module:''
        	}
        	this.TASKACTIONS = {
            		FLOW:{
            			text:this.getLang("TEXT_FLOW_CHART"),
            			icon:'',
            			handler:this.showWorkflow
            		}
            	}
        	this.template = $("<div>\
        			<div class='toolbar' style='margin:0 0 10px 0;'></div>\
        			<div class='taskForm well'></div>\
        			<div class='docket'></div>\
        			</div>");
        	this.options = {
        	}
		}
	});
	(function(Task){
		Task.prototype.init = function(options){
			this.container = options.container;
			this.container.append(this.template);
			this.module = this.options.module;
			this.taskId = options.taskId;
			for(prop in options){
				this.options[prop] = options[prop];
			}
			var that = this;
			if(this.taskId){
				$.ajax({
					url:'workflow/completed/completed!input.action',
					data:{historyId:this.taskId,nodeId:this.options.nodeId},
					success:function(task){
						that.task = task;
						//that.initActionBar();
						that.initTaskForm();
						that.initDocket();
						that.initHistory();
					}
				})
			}
		}
		Task.prototype.initTaskForm = function(){
			var Form = V.Classes['v.component.Form'];
			var form = new Form();
			var that = this;
			var items = [];
			items.push({label:this.getLang("LABEL_WORK_FLOW_NAME"),name:'workflowName',type:Form.TYPE.READONLY,value:that.task.history.workflowName||''});
			items.push({label:this.getLang("LABEL_LAUNCHER_NAME"),name:'launcherName',type:Form.TYPE.READONLY,value:that.task.history.launcherName||''});
			items.push({label:this.getLang("LABEL_START_TIME"),name:'startTime',type:Form.TYPE.READONLY,value:that.task.history.startTime||''});
			items.push({label:this.getLang("LABEL_END_TIME"),name:'endTime',type:Form.TYPE.READONLY,value:that.task.history.endTime||''});
			
			form.init({
				container:$('.taskForm',this.template),
				items:items,
				colspan:2
			})
			
		}
		Task.prototype.initActionBar = function(){
			var actions = ['FLOW'];
			var that = this;
			$.each(actions,function(){
				var action = that.TASKACTIONS[this];
				var btn = $("<a href='javascript:void(0);' class='btn btn-small' style='margin-right:10px;'><i class="+action.icon+"></i>"+action.text+"</a>");
				btn.click(function(){
					action.handler.call(that);
				})
				$('.toolbar',that.template).append(btn);
			});
		}
		Task.prototype.showWorkflow = function(){
			var that = this;
			var dlg = new V.Classes['v.ui.Dialog']();
			var con = $('<div></div>');
			dlg.setContent(con);
			dlg.init({
				title:this.getLang("TITLE_FLOW_CHART"),
				width:960,
				height:600
			});
			
			var mask = V.mask(con);
			
			$.ajax({
				url:'workflow/completed/completed!workflow.action',
				data:{historyId:that.taskId},
				success:function(data){
					V.unMask(mask);
					var workflow = data.workflow;
					var currentNodeId = data.nodeId;
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
					    if(this.id == currentNodeId){
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
		Task.prototype.initDocket = function(){
			var nodeConfig = this.task.flowItem;
			var variables = this.task.history.variables;
			var docketType = this.docketType = variables.docketType;
			var docketCustom = $.parseJSON(nodeConfig.docketCustom);
			var docketConfig = docketCustom[docketType];
			
			var url = docketConfig.outerFormUrl;
			var pluginConfig = $.parseJSON(url);
			
			var cateCode = null;
			var plugin = pluginConfig.ns;
			// plugin = plugin.substring(0,plugin.length-4);
			// plugin = plugin+"View";
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
				isFromFlow : true
			};
			var opt = {
				docketId : docketId,
				container : $('.docket', this.template),
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
		Task.prototype.initHistory = function(){
			var list = new V.Classes['v.ui.Grid']();
			list.setFilters({historyId:this.taskId});
			list.init({
				container:this.template,
				columns:[
				     {displayName:this.getLang("LIST_NODE_NAME"),key:'nodeName',width:100},
				     {displayName:this.getLang("LIST_ACTION"),key:'action',width:80,render:function(record){
				    	 return DictInfo.getVar('WF_ACTION')[record.action];
				     }},
				     {displayName:this.getLang("LIST_AUDIT_TIME"),key:'endTime',width:100},
				     {displayName:this.getLang("LIST_COMMENT"),key:'comment',width:100},
				     {displayName:this.getLang("LIST_EXECUTOR_NAME"),key:'executorName',width:80}
//				     {displayName:this.getLang("LIST_REMARK"),key:'remark',width:100}
				],
				url:'workflow/completed/completed!history.action'
			});
		}
		Task.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_WORK_DETAIL")}});
		}
		Task.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_WORK_DETAIL")}});
		}
	})(V.Classes['v.views.application.applicant.completed.CompletedView']);
},{plugins:['v.component.searchList','v.ui.grid','v.ui.confirm','v.ui.alert',"v.component.fileUpload","v.component.workflow"]});
