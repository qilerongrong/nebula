;V.registPlugin("v.views.application.approver.task",function(){
	V.Classes.create({
		className:"v.views.application.approver.Task",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.views.application.approver.task';
        	this.module = '';
        	this.task = null;
        	this.taskForm = null;
        	this.module='';
        	this.isDocketEdit = false;
        	this.docketInst = null; //单据实例
        	this.docketId = null;
        	this.plugin = null;
        	this.docketType = null;
        	this.mainDocketCode = null; //主表单编码
        	this.isClaimTask = false; //是否认领
        	this.options = {
        		taskId:'',
        		module:''
        	}
        	this.TASKACTIONS = {
        		APPROVE:{
        			text:"同意",
        			icon:'submitApprove',
        			handler:this.submitTask
        		},
        		DISAPPROVE:{
        			text:"不同意",
        			icon:'submitApprove',
        			handler:this.submitTask
        		},
        		APPOINT:{
        			text:"报批",
        			icon:'appoint',
        			handler:this.appoint
        		},
        		CONSULT:{
        			text:"征询",
        			icon:'consult',
        			handler:this.consult
        		},
        		FEEDBACK:{
        			text:"反馈",
        			icon:'feedback',
        			handler:this.feedback
        		},
        		TERMINATE:{
        			text:this.getLang("TEXT_STOP"),
        			icon:'terminateApprove',
        			handler:this.quitTask
        		},
        		CLAIM:{
        			text:this.getLang("TEXT_CLAIM"),
        			icon:'claimApprove',
        			handler:this.claimTask
        		},
        		PRINT:{
        			text:this.getLang("TEXT_PRINT"),
        			icon:'printPdf',
        			handler:this.printTask
        		},
        		FLOW:{
        			text:this.getLang("TEXT_FLOW"),
        			icon:'',
        			handler:this.showWorkflow
        		},
        		DETAIL:{
        			text:"单据详情",
        			icon:'',
        			handler:this.showDocketDetail
        		}
        	}
        	this.template = $("<div class='task todoTask'>\
        			<div class='toolbar' style='margin:0 0 10px 0;'></div>\
        			<div class='task well'></div>\
        			<div class='taskForm well' ></div>\
        			<div class='remind'></div>\
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
					url:'workflow/todo-task!taskDetail.action',
					data:{taskId:this.taskId},
					success:function(task){
						that.task = task;
						that.initActionBar();
						that.initTaskInfo();
						that.initTaskForm();
						that.initRemind();
						that.initDocket();
						that.initHistory();
					}
				})
			}
		}
		Task.prototype.initTaskInfo = function(){
			var Form = V.Classes['v.component.Form'];
			var form = new Form();
			var items = [];
			items.push({
				label:"工作流名称",
				type:Form.TYPE.READONLY,
				value:this.task.workflowName
			});
			items.push({
				label:this.getLang("LABEL_WORK_NAME"),
				type:Form.TYPE.READONLY,
				value:this.task.taskName
			});
			items.push({
				label:this.getLang("LABEL_CREATE_PERSON"),
				type:Form.TYPE.READONLY,
				value:this.task.createPerson
			});
			items.push({
				label:this.getLang("LABEL_CREATE_TIME"),
				type:Form.TYPE.READONLY,
				value:this.task.createTime
			});
			items.push({
				label:this.getLang("LABEL_SUBMIT_TIME"),
				type:Form.TYPE.READONLY,
				value:this.task.submitTime
			});
			form.init({
				container:$('.task',this.template),
				items:items,
				colspan:2
			});
		}
		Task.prototype.initTaskForm = function(){
			var Form = V.Classes['v.component.Form'];
			var FIELDTYPE = {
				TEXT:Form.TYPE.TEXT,
				TEXTAREA:Form.TYPE.TEXTEARA,
				SELECT:Form.TYPE.SELECT,
				MULTISELECT:Form.TYPE.CHECKBOX,
				RADIO:Form.TYPE.RADIO
			}
			var form = this.taskForm = new Form();
			var flowItem = this.task.flowItem;;
			var items = [];
			var fields = flowItem.fields || [];
			var draftVariables = this.task.draftVariables;
			$.each(fields,function(){
				var item = {
					label:this.label,
					name:this.name,
					type:this.type,
					validator:this.validator||V.Classes['v.component.Form'].generateValidator(this.type,255,null),
					required:this.required
				};
				if(this.type == FIELDTYPE.SELECT||this.type == FIELDTYPE.MULTISELECT || this.type == FIELDTYPE.RADIO){
					var vals = this.value;
					var multiList = [];
					$.each(vals.split(';'),function(){
						var arr = this.split('=');
						var _arr = [arr[1],arr[0]];
						multiList.push(_arr);
					});
					item.multiList = multiList;
				}
				if (draftVariables[this.name]) {
					item.value = draftVariables[this.name]
				}
				if (item.name) {
					items.push(item);
				}
			});
			if(flowItem.actions){
				if(flowItem.actions.indexOf('COMMENT')!=-1){
					var btnActions = flowItem.actions.split(',');
					$.each(btnActions,function(){
						var item = this.split('=');
						var key = item[0];
						var value = item[1];
						
						if(key=='COMMENT'){
							items.push({
								label:value,
								type:Form.TYPE.TEXTAREA,
								rows:3,
								name:'COMMENT',
								validator:this.validator||V.Classes['v.component.Form'].generateValidator(Form.TYPE.TEXTAREA,255,null),
								value:draftVariables['COMMENT']
							});
							return false;
						}
					})
				}
			}else{
				items.push({
					label:"意见",
					type:Form.TYPE.TEXTAREA,
					rows:3,
					name:'COMMENT',
//					validator:this.validator||V.Classes['v.component.Form'].generateValidator(Form.TYPE.TEXTAREA,255,null),
					value:draftVariables['COMMENT']
				});
			}
			form.init({
				container:$('.taskForm',this.template),
				items:items,
				colspan:1
			});
			var nodeConfig = this.task.flowItem;
			if(nodeConfig.jsInit){
				eval(nodeConfig.jsInit);
			}
			if(items.length==0){
				$('.taskForm',this.template).hide();
			}
		}
		Task.prototype.initActionBar = function(){
//			var actions = ['SUBMIT','CLAIM','PRINT','FLOW','CASE_3R','CASE_CCA','CASE_SC','CASE_SC_LETTER','ABSTAIN'];//'SAVE',
			//生成按钮: APPROVE=同意|icon-ok,DISAPPROVE=不同意,COMMENT=意见
			var that = this;
			var actions = this.task.flowItem.actions;
			if(actions!='' && actions!=null){
				var btnActions = actions.split(',');
				if(!that.task.assignee){
					btnActions.push("CLAIM=认领");
					that.isClaimTask = true;
				}
				
				$.each(btnActions,function(){
					var item = this.split('=');
					var key = item[0];
					var value = item[1].split('|');
					var text = value[0];
					var icon = value[1];
					
					if(key=='COMMENT'){
						return true;
					}
					
					var action = that.TASKACTIONS[key];
					
					if(action==null){
						action = that.TASKACTIONS.APPROVE;
					}
					
					if(action){
						var btn = $("<a href='javascript:void(0);' value=" + key + " class='btn btn-small' style='margin-right:10px;'><i class="+icon+"></i>"+text+"</a>");
						btn.click(function(){
							action.handler.call(that,key);
						})
						$('.toolbar',that.template).append(btn);
						if (key == 'CLAIM' && that.task.assignee) {
							$('[value='+key+']',$('.toolbar',that.template)).hide();
						} else if ((key != 'CLAIM' && key !='FLOW') && !that.task.assignee) {
							$('[value='+key+']',$('.toolbar',that.template)).hide();
						}
					}
				})
			}
			else{
				var actions = ['APPROVE','DISAPPROVE','FLOW','APPOINT'];
				if(!that.task.assignee){
					actions.push("CLAIM");
					that.isClaimTask = true;
				}
				$.each(actions,function(){
					var thiss = this;
					var action = that.TASKACTIONS[this];
					var btn = $("<a href='javascript:void(0);' value=" + this + " class='btn btn-small' style='margin-right:10px;'><i class="+action.icon+"></i>"+action.text+"</a>");
					btn.click(function(){
						action.handler.call(that,thiss);
					})
					$('.toolbar',that.template).append(btn);
					if (this == 'CLAIM' && that.task.assignee) {
						$('[value='+this+']',$('.toolbar',that.template)).hide();
					} else if ((this != 'CLAIM' && this !='FLOW') && !that.task.assignee) {
						$('[value='+this+']',$('.toolbar',that.template)).hide();
					} 			
				});
			}
		}
		Task.prototype.initRemind = function(){
			var that = this;
			if (this.task.remind) {
				var context = $("<font color='red'>"+this.task.remind+"</font>");
				$('.remind',that.template).append(context)
				$('.remind',that.template).show();
			} else {
				$('.remind',that.template).hide();
			}
		}
		Task.prototype.initDocket = function(){
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
			
			var variablesOpt = {
				taskId : this.task.taskId,
				cateCode : cateCode,
				docketType : docketType,
				isFromFlow : true
			};
			
			if(variables['formvar']==null){
				variablesOpt = 	variables;
			}
			
			var opt = {
				docketId : docketId,
				container : $('.docket', this.template),
				module : module,
				cateCode :cateCode,
				taskConfig:docketConfig.docketCustom,
				// docketActions : nodeConfig.docketActions,
				// docketCustom : nodeConfig.docketCustom,
				variables : variablesOpt
			};
			
			if(this.isClaimTask){//如果是认领任务，将表单全部设置为不可编辑，同时去掉特殊按钮和字段的配置
//				delete opt.taskConfig;
				if(opt.taskConfig){
					$.each(opt.taskConfig,function(){
						this.isEdit = false;
						this.actions = null;
						this.customs = null;
					})
				}
				opt.isEdit = false;
			}
			
			V.loadPlugin(plugin,function(inst){
				var glass = V._registedPlugins[plugin].glass;
				var inst = that.docketInst = new V.Classes[glass]();
				inst.init(opt);
			})
		}
		//TODO
		Task.prototype.uploadAttachment = function(){
			
		}
		Task.prototype.saveTask = function(){
			if(!this.taskForm.validate()){
                 return;
			}
			var approveInfo = this.taskForm.getValues();
			V.ajax({
				url:'workflow/todo-task!save.action',
				data:{taskId:this.task.taskId,approveInfo:approveInfo},
				success:function(data){
					V.alert('操作成功!');
					//V.MessageBus.publish({eventId:'backCrumb'});
				}
			})
		}
		Task.prototype.quitTask = function(){
			var that = this;
			V.confirm(this.getLang("MSG_IS_STOP"),function(){
				that._terminate();
			})
		}
		Task.prototype._terminate =function(){
			var approveInfo = this.taskForm.getValues();
			approveInfo.ACTION = 'TERMINATE';

			if(this.docketInst){
				approveInfo.docketId = this.docketInst.docketId;
				approveInfo.docketType = this.docketType;
			}

			var mask = V.mask($('.tab-pane:eq(0)',this.template));
			V.ajax({
				url:'workflow/todo-task!teminate.action',
				data:{taskId:this.task.taskId,approveInfo:approveInfo},
				success:function(data){
					V.unMask(mask);
					if(data&&data.result=='success'){
						V.alert('操作成功！');
						V.MessageBus.publish({eventId:'backCrumb'});	
					}else{
						V.alert(data.msg);
					}
				},
				error:function(){
					V.unMask(mask);
				}
			})
		}
		Task.prototype.claimTask = function(){
			var that = this;
			V.confirm(this.getLang("MSG_IS_CLAIM"),function(){
				that._claimTask();
			})
		}
		Task.prototype._claimTask = function(){
			var that = this;
			
			var mask = V.mask($('.tab-pane:eq(0)',this.template));
			V.ajax({
				url:'workflow/todo-task!claim.action',
				data:{taskId:that.task.taskId, docketId:that.docketId,plugin:that.plugin},
				success:function(data){
					V.unMask(mask);
					if (data.fail) {
						V.alert(that.getLang("MSG_CLAIM_FAIL"));
						V.MessageBus.publish({eventId:'backCrumb'});
					} else {
						that.isClaimTask = false;
						that.initDocket();
						V.alert('认领成功！');
						$('[value]',$('.toolbar',that.template)).show();
						$('[value=CLAIM]',$('.toolbar',that.template)).hide();
					}
				},
				error:function(){
					V.unMask(mask);
				}
			})
		}
		
		Task.prototype.printTask = function(){
			var that = this;
			
			var form_print = $('#task_print_form',this.template).empty();
			if(form_print.length==0){
				form_print = $('<form action="print!print.action" type="POST" id="task_print_form" style="display:none"></form>');
				$('body').append(form_print);
			};
			var input = $('<input type="hidden" name="docketId" value='+this.docketId+'>');
			var input1 = $('<input type="hidden" name="docketType" value='+this.plugin+'>');
			form_print.append(input);
			form_print.append(input1);
			form_print[0].submit();
		}
		Task.prototype.showWorkflow = function(){
			var that = this;
			var dlg = new V.Classes['v.ui.Dialog']();
			var con = $('<div></div>');
			dlg.setContent(con);
			dlg.init({
				title:this.getLang("TITLE_FLOW"),
				width:880,
				height:500
			});
			
			var mask = V.mask(con);
			$.ajax({
				url:'workflow/todo-task!workflow.action',
				data:{taskId:this.task.taskId},
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
		Task.prototype.submitTask = function(action){
			var that = this;
			this.isDocketEdit = that.docketInst.isEdit;
//			if(this.isDocketEdit){
//				V.confirm(this.getLang("MSG_IS_SUBMIT"),function(){
//					that._submitTask(action);
//				})
//			}else{
//				this._submitTask(action);
//			}
			if(action=='APPROVE'){
				V.confirm("是否同意？",function(){
					that._submitTask(action);
				})
			}else if(action=='DISAPPROVE'){
				V.confirm("确认不同意？",function(){
					that._submitTask(action);
				})
			}else if(action=='GOTO_NODE'){
				V.confirm("是否退回修改？",function(){
					that._submitTask(action);
				})
			}else{
				that._submitTask(action);
			}
		}
		Task.prototype._submitTask = function(action){
			if(!this.taskForm.validate()){
                 return;
			}
			if(this.docketInst && (this.docketInst.docketId==null || this.docketInst.docketId=='')){
				V.alert("请先保存单据！");
				return;
			}
			var approveInfo = this.taskForm.getValues();
			approveInfo.ACTION = action;
			
			if(this.docketInst){
				approveInfo.docketId = this.docketInst.docketId;
				approveInfo.docketType = this.docketType;
				
//				var dockets = this.docketInst.docket;
//				if(this.docketInst.options.isCommonDocket!=null && this.docketInst.options.isCommonDocket==true)
//				for(docketTypeKey in dockets){
//					var docketTypeValue = dockets[docketTypeKey];
//					if(docketTypeValue.format == 'form' && docketTypeValue.entity!=null && docketTypeValue.entity.id!=""){
//						approveInfo['TYPEID_'+docketTypeKey] = docketTypeValue.entity.id;
//					}
//				}
			}
			
			var mask = V.mask($('.tab-pane:eq(0)',this.template));
			V.ajax({
				url:'workflow/todo-task!completeUserTask.action',
				data:{taskId:this.task.taskId,approveInfo:approveInfo},
				success:function(data){
					V.unMask(mask);
					if(data&&data.result=='success'){
						V.alert('操作成功！');
						V.MessageBus.publish({eventId:'backCrumb'});	
					}else{
						V.alert(data.msg);
					}
				},
				error:function(){
					V.unMask(mask);
				}
			})
		}
		Task.prototype.initHistory = function(){
			var list = new V.Classes['v.ui.Grid']();
			list.setFilters({taskId:this.task.taskId});
			list.init({
				container:this.template,
				columns:[
				     {displayName:this.getLang("LIST_NODE_NAME"),key:'nodeName',width:100},
				     {displayName:this.getLang("LIST_ACTION"),key:'action',width:30,render:function(record){
				    	 return DictInfo.getVar('WF_ACTION')[record.action];
				     }},
				     {displayName:this.getLang("LIST_AUDIT_TIME"),key:'endTime',width:70},
				     {displayName:this.getLang("LIST_COMMENT"),key:'comment',width:180},
				     {displayName:this.getLang("LIST_EXECUTOR_NAME"),key:'executorName',width:40}
//				     {displayName:this.getLang("LIST_REMARK"),key:'remark',width:150}
				],
				url:'workflow/todo-task!history.action'
			});
		}
		Task.prototype.showDocketDetail = function(){
			var options = {};
			options.module = this.module;
			options.code =  this.mainDocketCode;
			this.forward('v.views.application.approver.docketTask',options,function(inst){
				inst.addCrumb();
			});
		}
		Task.prototype.appoint = function(action){
			this.selectUser(action);	
		}
		Task.prototype.consult = function(action){
			this.selectUser(action);	
		}
		Task.prototype.selectUser = function(action){
			var dlg = new V.Classes['v.ui.Dialog']();
			var that = this;
			var con = $('<div class="docket">\
				    <div class="btns legend" style="margin-bottom:5px;"><button class="btn btn_small btn_addRole">角色</button><button class="btn btn_small btn_addPost">岗位</button><button class="btn btn_small btn_addUser">用户</button></div>\
				    <div class="appoint_form"></div>\
			    </div>');
			var Form = V.Classes['v.component.Form'];
			var form = new Form();
			$('.btn_addRole',con).click(function(){
				that.chooseRole(function(roles){
					var item = form.getItem("roles");
					item.value = roles;
					form.repaintItem(item);
				});
			});
			$('.btn_addPost',con).click(function(){
				that.choosePost(function(posts){
					var item = form.getItem("posts");
					item.value = posts;
					form.repaintItem(item);
				});
			});
			$('.btn_addUser',con).click(function(){
				that.chooseUser(function(users){
					var item = form.getItem("users");
					item.value = users;
					form.repaintItem(item);
				});
			});
			form.init({
				container:$('.appoint_form',con),
				colspan:1,
				items:[
				    {type:Form.TYPE.CUSTOM,label:'角色',name:'roles',value:[],render:function(){
				    	var html = $('<div></div>');
				    	$.each(this.value,function(){
				    		var item = $('<a href="javascript:void(0)" class="btn btn-mini" style="margin:2px;" code='+this.roleCode+'>'+this.roleName+'<i class="icon-white icon-remove"></i></a>');
				    		$('.icon-remove',item).click(function(){
				    			item.remove();
				    		})
				    		html.append(item);
				    	})
				    	return html;
				    },getValue:function(){
			    		var vals = [];
			    	    $('a',this.element).each(function(){
			    	    	vals.push('R_'+$(this).attr('code')); 
			    	    })
			    	    return {roles:vals};
			    	}},
				    {type:Form.TYPE.CUSTOM,label:'岗位',name:'posts',value:[],render:function(){
				    	var html = $('<div></div>');
				    	$.each(this.value,function(){
				    		var item = $('<a href="javascript:void(0)" class="btn btn-mini" style="margin:2px;" code='+this.code+'>'+this.name+'<i class="icon-white icon-remove"></i></a>');
				    		$('.icon-remove',item).click(function(){
				    			item.remove();
				    		})
				    		html.append(item);
				    	})
				    	return html;
				    },getValue:function(){
			    		var vals = [];
			    	    $('a',this.element).each(function(){
			    	    	vals.push('P_'+$(this).attr('code'));
			    	    })
			    	    return {posts:vals};
			    	}},
			    	 {type:Form.TYPE.CUSTOM,label:'用户',name:'users',value:[],render:function(){
				    	var html = $('<div></div>');
				    	$.each(this.value,function(){
				    		var item = $('<a href="javascript:void(0)" class="btn btn-mini" style="margin:2px;" code='+this.userCode+'>'+this.userName+'<i class="icon-white icon-remove"></i></a>');
				    		$('.icon-remove',item).click(function(){
				    			item.remove();
				    		})
				    		html.append(item);
				    	})
				    	return html;
				    },getValue:function(){
			    		var vals = [];
			    	    $('a',this.element).each(function(){
			    	    	vals.push($(this).attr('code')); 
			    	    })
			    	    return {users:vals};
			    	}}
				]
			})
			dlg.setContent(con);
			dlg.setBtnsBar({
				btns:[
				    {text:'确定',handler:function(){
				    	var vals = form.getValues();
				    	var assignee = [].concat(vals.roles,vals.posts,vals.users).join(",");
				    	if(assignee == ""){
				    		V.alert("请先选择人员。");
				    		return;
				    	}
				    	if(action=='CONSULT'){
				    		that._consult(assignee,dlg,action);
				    	}else if(action=='APPOINT'){
				    		that._appoint(assignee,dlg);
				    	}
				    }},
				    {text:'取消',handler:dlg.close}
				]
			})
			dlg.init({
				title:'选择人员',
				width:560,
				height:300
			})
		}
		Task.prototype._appoint = function(assignee,dlg){
			if(!this.taskForm.validate()){
                 return;
			}
			if(this.docketInst && (this.docketInst.docketId==null || this.docketInst.docketId=='')){
				V.alert("请先保存单据！");
				return;
			}
			var approveInfo = this.taskForm.getValues();
			approveInfo.ACTION = "SET_ASSIGNEE";
			approveInfo.SET_ASSIGNEE = assignee;

			if(this.docketInst){
				approveInfo.docketId = this.docketInst.docketId;
				approveInfo.docketType = this.docketType;
			}
			
			var mask = V.mask($('.tab-pane:eq(0)',this.template));
			V.ajax({
				url:'workflow/todo-task!completeUserTask.action',
				data:{taskId:this.task.taskId,approveInfo:approveInfo},
				success:function(data){
					V.unMask(mask);
					dlg.close();
					if(data&&data.result=='success'){
						V.alert('报批成功！');
						V.MessageBus.publish({eventId:'backCrumb'});
					}else{
						V.alert(data.msg);
					}
				},
				error:function(){
					V.unMask(mask);
				}
			})
		}
		Task.prototype._consult = function(assignee,dlg,action){
			if(!this.taskForm.validate()){
                 return;
			}
			if(this.docketInst && (this.docketInst.docketId==null || this.docketInst.docketId=='')){
				V.alert("请先保存单据！");
				return;
			}
			var approveInfo = this.taskForm.getValues();
			approveInfo.ACTION = action;
			approveInfo.SET_ASSIGNEE = assignee;

			if(this.docketInst){
				approveInfo.docketId = this.docketInst.docketId;
				approveInfo.docketType = this.docketType;
			}
			
			var mask = V.mask($('.tab-pane:eq(0)',this.template));
			V.ajax({
				url:'workflow/todo-task!completeUserTask.action',
				data:{taskId:this.task.taskId,approveInfo:approveInfo},
				success:function(data){
					V.unMask(mask);
					dlg.close();
					if(data&&data.result=='success'){
						V.alert('征询成功！');
						V.MessageBus.publish({eventId:'backCrumb'});
					}else{
						V.alert(data.msg);
					}
				},
				error:function(){
					V.unMask(mask);
				}
			})
		}
		Task.prototype.feedback = function(action){
			if(!this.taskForm.validate()){
                 return;
			}
			if(this.docketInst && (this.docketInst.docketId==null || this.docketInst.docketId=='')){
				V.alert("请先保存单据！");
				return;
			}
			var approveInfo = this.taskForm.getValues();
			approveInfo.ACTION = action;
			
			if(this.docketInst){
				approveInfo.docketId = this.docketInst.docketId;
				approveInfo.docketType = this.docketType;
			}
			
			var mask = V.mask($('.tab-pane:eq(0)',this.template));
			V.ajax({
				url:'workflow/todo-task!completeUserTask.action',
				data:{taskId:this.task.taskId,approveInfo:approveInfo},
				success:function(data){
					V.unMask(mask);
					if(data&&data.result=='success'){
						V.alert('反馈成功！');
						V.MessageBus.publish({eventId:'backCrumb'});	
					}else{
						V.alert(data.msg);
					}
				},
				error:function(){
					V.unMask(mask);
				}
			})
		}
		Task.prototype.chooseRole = function(handler){
			var selector = new V.Classes['v.component.selector.RoleSelector']();
			var options = {params:{createByPlatformNo:LoginInfo.user.platformNo}};
			selector.init(options);
			this.subscribe(selector,selector.EVENT.SELECT_CHANGE,function(roles){
				handler&&handler(roles);
			})
		}
		Task.prototype.choosePost = function(handler){
			var selector = new V.Classes['v.component.selector.PostSelector']();
			var options = {params:{createByPlatformNo:LoginInfo.user.platformNo}};
			selector.init(options);
			this.subscribe(selector,selector.EVENT.SELECT_CHANGE,function(posts){
				handler&&handler(posts);
			})
		}
		Task.prototype.chooseUser = function(handler){
			var selector = new V.Classes['v.component.selector.UserSelector']();
			var options = {params:{createByPlatformNo:LoginInfo.user.platformNo}};
			selector.init(options);
			this.subscribe(selector,selector.EVENT.SELECT_CHANGE,function(users){
				handler&&handler(users);
			})
		}
		Task.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_MY_TASK")}});
		}
		Task.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_MY_TASK")}});
		}
	})(V.Classes['v.views.application.approver.Task']);
},{plugins:[
	'v.component.searchList',
	'v.ui.grid',
	'v.ui.confirm',
	'v.ui.alert',
	"v.component.fileUpload",
	"v.component.workflow",
	'v.component.selector.roleSelector',
	'v.component.selector.postSelector',
	'v.component.selector.userSelector'
]});
