;V.registPlugin("v.views.workflow.task.workflowView",function(){
	V.Classes.create({
		className:"v.views.workflow.task.WorkflowView",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.views.workflow.task.workflowView';
        	this.module = '';
        	this.task = null;
        	this.taskForm = null;
        	this.module='';
        	this.docketInst = null; //单据实例
        	this.options = {
        		taskId:'',
        		module:''
        	}
        	this.TASKACTIONS = {
//            		ABSTAIN:{
//            			text:'终止',
//            			icon:'',
//            			handler:this.quitTask
//            		},
//            		PRINT:{
//            			text:'打印',
//            			icon:'',
//            			handler:this.printTask
//            		},
            		FLOW:{
            			text:this.getLang("BTN_FLOW_CHART"),
            			icon:'',
            			handler:this.showWorkflow
            		},
            		TURN_TO:{
            			text:this.getLang("BTN_TODO"),
            			icon:'',
            			handler:this.turnTo
            		}
            	}
        	this.template = $("<div class='task'>\
        			<div class='toolbar' style='margin:0 0 10px 0;'></div>\
        			<div class='taskForm well'></div>\
        			<div class='docket' style='margin-top:20px'></div>\
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
					url:'workflow/process-task!input.action',
					data:{taskId:this.taskId},
					success:function(task){
						that.task = task;
						that.initActionBar();
						that.initTaskForm();
						that.initDocket();
					}
				})
			}
		}
		Task.prototype.initActionBar = function(){
			// var actions = ['FLOW','TURN_TO'];
			var actions = ['TURN_TO'];
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
		Task.prototype.initTaskForm = function(){
			var Form = V.Classes['v.component.Form'];
			var form =  new Form();
			var items = [];
			items.push({label:this.getLang("LABEL_PROCESS_NAME"),type:Form.TYPE.READONLY,name:'workflowName',value:this.task.workflowName||''});
			items.push({label:this.getLang("LABEL_ASSIGN"),type:Form.TYPE.READONLY,name:'dataKey3',value:this.task.assignee||''});
			items.push({label:this.getLang("LABEL_CREATE_TIME"),type:Form.TYPE.READONLY,name:'startTime',value:this.task.createTime||''});
			items.push({label:this.getLang("LABEL_CREATE_NAME"),type:Form.TYPE.READONLY,name:'launcherName',value:this.task.createPerson||''});
			
			form.init({
				container:$('.taskForm',this.template),
				items:items,
				colspan:2
			})
		}
		
		Task.prototype.initDocket = function(){
//			var nodeConfig = this.task.flowItem;
//			var variables = this.task.variables;
//			var cateCode = (variables==null)?null:variables.cateCode;
//			var url = nodeConfig.outerFormUrl;
//			var pluginConfig = $.parseJSON(url);
//			var plugin = pluginConfig.ns;
//			var isEdit = false;
//			var module = pluginConfig.module;
			// debugger;
			var that = this;
			var docketId = null;
			var nodeConfig = this.task.flowItem;
			var variables = this.task.variables;
			var cateCode = (variables==null)?null:variables.cateCode;
			this.mainDocketCode = (variables==null)?null:variables.mainDocketCode;
			
			var docketType = this.docketType = variables.docketType;
			var docketCustom = $.parseJSON(nodeConfig.docketCustom);
			var docketConfig = docketCustom[docketType]; //nodeConfig.docketCustom[docketType];
			var url = docketConfig.outerFormUrl;
			var pluginConfig = $.parseJSON(url);
			var plugin = this.plugin = pluginConfig.ns;
			this.isDocketEdit = pluginConfig.isEdit||false;
			var module = pluginConfig.module;
			$('.docket',this.template).empty();
			
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
			
			this.docketId = docketId;
			
//			var variablesOpt = {
//				taskId : this.task.taskId,
//				cateCode : cateCode,
//				docketType : docketType,
//				isFromFlow : true
//			};
//			
//			if(variables['formvar']==null){
//				variablesOpt = 	variables;
//			}
//			var docketKey = this.docketKey = pluginConfig.docketKey; //multi docket id
//			var docketId = null;
//			if(docketKey){
//				docketId = variables[docketKey]||'';
//			}else{
//				docketId = variables["docketId"]||'';
//			}
//			var opt = {docketId:this.task.history.dataKey1,container:$('.docket',this.tempalte),module:module};
			
			variables.isFromFlow = true;
			var opt = {
				docketId : docketId,
				container : $('.docket', this.template),
				module : module,
				cateCode :cateCode,
				variables : variables,
				docketActions : nodeConfig.docketActions,
				docketCustom : nodeConfig.docketCustom
			};
			
			V.loadPlugin(plugin,function(inst){
				var glass = V._registedPlugins[plugin].glass;
				var inst = new V.Classes[glass]();
				inst.init(opt);
			})
		}
		Task.prototype.turnTo = function(){
			var that = this;

			var Form = V.Classes['v.component.Form'];

			var formItems = [
				{label:'编码',type:Form.TYPE.TEXT,name:'userCode'},
				{label:'名称',type:Form.TYPE.TEXT,name:'userName'}
			];

			var dlgTemplate = $('<div class="v-search"><div class="list_toolbar"></div><div class="filters"><div class="well form-search"></div></div><div class="list"></div></div>');
			var list = this.list = new V.Classes['v.ui.Grid']();
			var form = new Form();
			
			var btn_search = $('<button class="btn btn-primary btn-search">查询</button>');
			var btn_reset = $('<button class="btn btn-reset">重置</button>');
			btn_search.click(function(){
				that.searchData(form,list);
			});
			btn_reset.click(function(){
				form.reset();
			});
			
			form.init({
				container:$('.form-search',dlgTemplate).empty(),
				colspan:2,
				items:formItems
			});
			$('.form-search',dlgTemplate).append($('<div class="row-fluid btns" style="text-align:center"></div>').append(btn_search).append(btn_reset));

			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			var filterList = form.getValues();
			list.setFilters(filterList);
			list.init({
				container : $('.list',dlgTemplate).empty(),
				url:'common!listuser.action',
				hasData : true,
				checkable:false,
				columns:[
		                    {displayName:that.getLang("LABEL_USER_CODE"),key:'userCode',width:280,render:function(record){
								var html = $('<a href="javascript:void(0);"></a>');
								html.text(record.userCode);
								html.click(function(){
									that.turntoSubmit(record.userCode);
									addDlg.close();
								});
								return html;
							}}
		                    ,{displayName:that.getLang("LABEL_USER_NAME"),key:'userName',width:280}
						]
			});

			var addDlg = new V.Classes['v.ui.Dialog']();
			addDlg.setBtnsBar({btns:[{text:that.getLang("BTN_CANCEL"),handler:addDlg.close}]});
			addDlg.init({title:that.getLang("LABEL_USER_LIST"),height:492,width:660});
			addDlg.setContent(dlgTemplate);
		}
		Task.prototype.searchData = function(form,list){
			var that = this;
			if(!form.validate()) return;
			var filters = form.getValues();
			list.setFilters(filters);
			list.retrieveData();
		}
		Task.prototype.turntoSubmit = function(userCode){
			$.ajax({
				url:'workflow/process-task!turnto.action',
				data:{taskId:this.taskId,userCode:userCode},
				success:function(data){
					V.alert("转办成功！");
					V.MessageBus.publish({eventId:'backCrumb'});
				}
			})
		}
		Task.prototype.showWorkflow = function(){
			var that = this;
			var dlg = new V.Classes['v.ui.Dialog']();
			var con = $('<div></div>');
			dlg.setContent(con);
			dlg.init({
				title:that.getLang("BTN_FLOW_CHART"),
				width:960,
				height:600
			});
			
			var mask = V.mask(con);
			$.ajax({
				url:'workflow/todo-task!workflow.action',
				data:{taskId:that.taskId},
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
		
		Task.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("LABEL_TASK_DETAIL")}});
		}
		Task.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("LABEL_TASK_DETAIL")}});
		}
	})(V.Classes['v.views.workflow.task.WorkflowView']);
},{plugins:['v.component.searchList','v.ui.grid','v.ui.confirm','v.ui.alert',"v.component.workflow"]});