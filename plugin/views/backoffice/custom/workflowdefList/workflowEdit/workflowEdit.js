;V.registPlugin("v.views.backoffice.custom.workflowdefList.workflowEdit",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.workflowdefList.WorkflowEdit",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.views.backoffice.custom.workflowdefList.workflowEdit';
        	this.module = '';
        	this.workflow = null;
        	this.flowData = null;
        	this.flowForm = null;
        	this.platformNo = '';
        	this.NODETYPE = {
        	    START:"START",
        	    END:"END",
        	    JOIN:"JOIN",
        	    //DISPATCH:"DISPATCH",
        	    DB_POLLER:"DBPOLLER",
        	    QUERY:"QUERY",
        	    //MESSAGE:"MESSAGE",
        	    TIMER:"TIMER",
        	    EMAIL:"EMAIL",
        	    DB_SQL:"SQL",
        	    USER:"USER",
        	    SERVICE:"SERVICE",
        	    SUBPROCESS:"SUBPROCESS",
        	    MEMO:"MEMO",
        	    LINE:"LINE"
        	},
        	this.nodeslib = [
        	    {type:this.NODETYPE.START,text:'开始'}
        	    ,{type:this.NODETYPE.END,text:'结束'}
        	    ,{type:this.NODETYPE.JOIN,text:'聚合点'}
        	    //,{type:this.NODETYPE.DISPATCH,text:'分发点'}
        	    ,{type:this.NODETYPE.DB_POLLER,text:'数据库监听'}
        	    ,{type:this.NODETYPE.QUERY,text:'数据库查询'}
        	    //,{type:this.NODETYPE.MESSAGE,text:'发送消息'}
        	    ,{type:this.NODETYPE.TIMER,text:'定时任务'}
        	    ,{type:this.NODETYPE.EMAIL,text:'发送邮件'}
        	    ,{type:this.NODETYPE.DB_SQL,text:'数据库SQL'}
        	    ,{type:this.NODETYPE.USER,text:'用户'}
        	    ,{type:this.NODETYPE.SUBPROCESS,text:'子流程'}
        	    ,{type:this.NODETYPE.MEMO,text:'说明'}
        	    ,{type:this.NODETYPE.SERVICE,text:'服务'}
        	];
        	this.options = {
        	    flowData:null
        	}
        	this.template = $('<div style="position:relative;overflow:hidden"><div class="workflow_box">\
        			<div style="width:100%;height:100%;"><div class="flow_box" style="position:relative;overflow:auto;"></div>\
        			<div style="position:relative;">\
        			    <div class="flow_attrs">\
        			        <div style="text-align:center;line-height:30px;background:whitesmoke;font-weight:bold;border-bottom:1px solid #efefef;">流程设置</div>\
        			        <div class="attrs docket"></div>\
        			    </div>\
        			</div>\
        			<div class="toolbar">\
        			    <a href="javascript:void(0)" class="save" title="保存"><i class="icon-check"></i></a>\
        			    <a href="javascript:void(0)" class="toggleNodeAttr" title="显示/隐藏节点属性"><i class="icon-list-alt"></i></a>\
        			    <a href="javascript:void(0)" class="toggleFlowAttr" title="显示/隐藏流程设置"><i class="icon-cog"></i></a>\
        			    <a class="trash" href="javascript:void(0)" title="回收站"><i class="icon-trash"></i></a>\
        			</div>\
        			<div class="nodes_box"><div style="text-align:center;line-height:30px;background:whitesmoke;font-weight:bold;border-bottom:1px solid #efefef;">节点</div><ul style="width:100px;margin:0 10px;"></ul></div>\
        			<div class="attrs_box">\
        			    <div style="text-align:center;line-height:30px;background:whitesmoke;font-weight:bold;border-bottom:1px solid #efefef;">节点属性</div>\
        			    <div class="attrs docket"></div>\
        			    </div>\
        	    </div>');
		}
	});
	(function(Workflow){
		Workflow.prototype.init = function(options){
			this.flowData = options.flowData||{};
			this.platformNo = options.platformNo;
			this.container = options.container;
			this.container.append(this.template);
			this.initNodeLib();
			this.initWorkflow();
			this.initEvent();
		}
		Workflow.prototype.initEvent = function(){
			var that = this;
			this.subscribe(this.workflow,this.workflow.EVENT.NODE_SELECT,function(data){
				var node = data.target;
				node.focus();
				this.editNode(node);
			});
			this.subscribe(this.workflow,this.workflow.EVENT.LINE_ESTABLISH,function(info){
				var conn = info.connection;
				this.addLine(conn);
			})
			this.subscribe(this.workflow,this.workflow.EVENT.LINE_SELECT,function(conn){
				this.editLine(conn);
			});
			$('.trash',this.template).droppable({
				 drop: function( event, ui ) {
					 var target = ui.draggable;
					 that.removeNode(target.get(0));
				 }
			})
			$('.save',this.template).click(function(){
				that.save();
			})
			$('.selected',this.template[0]).live('keyup',function(e){
				if(e.which == 46){
					that.removeNode(this);
				}
			})
			$('.toggleNodeAttr',this.template).toggle(function(){
				$('.attrs_box',that.template).show();
			},function(){
				$('.attrs_box',that.template).hide();
			})
			$('.toggleFlowAttr',this.template).toggle(function(){
				$('.flow_attrs',that.template).show();
			},function(){
				$('.flow_attrs',that.template).hide();
			})
		}
		Workflow.prototype.initWorkflow = function(){
			this.workflow = new V.Classes['v.component.Workflow']();
			this.workflow.init({
				container:$('.workflow_box .flow_box',this.template),
				draggable:true
			});
			var that = this;
			var Form = V.Classes['v.component.Form'];
			this.flowForm = new Form();
			if(!this.flowData.props){
				this.flowData.props = {};
			}
			this.flowForm.init({
				colspan:2,
				container:$('.workflow_box .flow_attrs .attrs',this.template),
				items:[
					{type:Form.TYPE.HIDDEN,name:'id',value:this.flowData.id||''},
					{type:Form.TYPE.TEXT,label:'工作流key',name:'workflowKey',value:this.flowData.workflowKey||'',styleClass:'input-medium'},
					{type:Form.TYPE.TEXT,label:'描述',name:'workflowName',value:this.flowData.workflowName||'',styleClass:'input-medium'},
					{type:Form.TYPE.TEXT,label:'初始化URL',name:'initForm',value:this.flowData.props.initForm||'',styleClass:'input-medium'},
					{type:Form.TYPE.TEXT,label:'数据类型',name:'dataType',value:this.flowData.dataType||'',styleClass:'input-medium'},
					{type:Form.TYPE.CHECKBOX,label:'完成后是否发送邮件',value:this.flowData.props.sendMailWhenFinish||'',name:'sendMailWhenFinish',multiList:[['',true]],value:'',styleClass:'input-medium'},
					{type:Form.TYPE.TEXT,label:'邮件模版',name:'finishMailTemplate',value:this.flowData.props.finishMailTemplate||'',styleClass:'input-medium'},
					{type:Form.TYPE.TEXT,label:'数据关键值1',name:'dataKey1',value:this.flowData.dataKey1||'',styleClass:'input-medium'},
					{type:Form.TYPE.TEXT,label:'说明',name:'dataKey1Desc',value:this.flowData.props.dataKey1Desc||'',styleClass:'input-medium'},
					{type:Form.TYPE.TEXT,label:'数据关键值2',name:'dataKey2',value:this.flowData.dataKey2||'',styleClass:'input-medium'},
					{type:Form.TYPE.TEXT,label:'说明',name:'dataKey2Desc',value:this.flowData.props.dataKey2Desc||'',styleClass:'input-medium'},
					{type:Form.TYPE.TEXT,label:'数据关键值3',name:'dataKey3',value:this.flowData.dataKey3||'',styleClass:'input-medium'},
					{type:Form.TYPE.TEXT,label:'说明',name:'dataKey3Desc',value:this.flowData.props.dataKey3Desc||'',styleClass:'input-medium'},
					{type:Form.TYPE.TEXT,label:'出错后转向',name:'errorProcessNode',value:this.flowData.props.errorProcessNode||'',styleClass:'input-medium'},
					{type:Form.TYPE.TEXT,label:'后处理BEAN',name:'processBean',value:this.flowData.processBean||'',styleClass:'input-medium'}
				]
			});
			$('.workflow_box .flow_box',this.template).droppable({
				 accept:'.node',
				 drop: function( event, ui ) {
					 var target = ui.draggable;
					 var data = ui.draggable.data('node');
					 var nodeConfig = {
					     text:target.text(),
					     type:data.type,
					     position:ui.helper.position(),
					     data:$.extend({},data)
					 }
					 //新增节点
					 var node = that.addNode(nodeConfig);
					 node.attr("tabindex",0);
					 node.focus();
					 that.editNode(node);
				 }
			});
			if(this.flowData&&this.flowData.id){
				this.drawWorkflow();
			}
		}
		Workflow.prototype.drawWorkflow = function(){
			var that = this;
			var flowItems = this.flowData.items;
			var lines = [];
			var nodeMap = {};
			$.each(flowItems,function(){
			    if(this.type == that.NODETYPE.LINE){
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
			    var node = that.addNode(nodeConfig);
			    nodeMap[this.id] = node
			    //需要初始化attrForm.
                node.attr("tabindex",0);
				node.focus();
			    that.editNode(node);
			});
			$.each(lines,function(){
				if(nodeMap[this.fromNode] && nodeMap[this.toNode]){
					var conn = that.connectNode(nodeMap[this.fromNode].get(0),nodeMap[this.toNode].get(0));
					conn.setLabel(this.name);
					that.addLine(conn,this);
				}
			});
		}
		Workflow.prototype.connectNode = function(source,target){
			var conn = this.workflow.connect(source,target);
			return conn;
		}
		Workflow.prototype.initNodeLib = function(){
			var nodes = this.nodeslib;
			var that = this;
			$.each(nodes,function(){
				var item = $("<li style='margin:5px 0px;'><a href='javascript:void(0);' class='btn node' style='width:80px;align:center;cursor:default;'>"+this.text+"</a></li>");
				$('a',item).data('node',this);
				$('.nodes_box ul',that.template).append(item);
			});
			//with jquery ui dragable
			$('.nodes_box ul a',that.template).draggable({
			      cursor: "default",
			      cursorAt: { top: -12, left: -20 },
			      helper: function( event ) {
			    	  //var isEnd = ($(this).data('node').type == that.NODETYPE.END);
			    	  return $('<div class="workflow_node">'+$(this).text()+'</div>');
			      }
			    });
		}
		/**nodeConfig:{text,type,data,position}
		 * return node;
		 */
		Workflow.prototype.addNode = function(nodeConfig){
			var type = nodeConfig.type;
			var text = nodeConfig.text;
			var data = nodeConfig.data;
			var position = nodeConfig.position;
			var node;
			if(type == this.NODETYPE.START||type == this.NODETYPE.DB_POLLER||type == this.NODETYPE.TIMER){
				node = this.workflow.addBeginNode(text,position.left,position.top,data);
			}else if(type == this.NODETYPE.END){
				node = this.workflow.addEndNode(text,position.left,position.top,data);
			}else if(type == this.NODETYPE.MEMO){
				node = this.workflow.addMemoNode(text,position.left,position.top,data);
			}else{
				node = this.workflow.addNode(text,position.left,position.top,data);
			}
			return node;
		}
		Workflow.prototype.addLine = function(conn,attrs){
			var attrform = conn.attrform;
			$('.attrs_box .attrs',this.tempalte).children().hide();
			$('.workflow_box .flow_box .selected',this.template).removeClass('selected');
			if(attrform){
				attrform.template.show();
			}else{
				var form = this.initAttrForm(this.NODETYPE.LINE,attrs);
				conn.attrform = form;
			}
		}
		Workflow.prototype.editLine = function(conn){
			var form = conn.attrform;
			$('.attrs_box .attrs',this.tempalte).children().hide();
			form.template.show();
			$('.workflow_box .flow_box .selected',this.template).removeClass('selected');
		}
		Workflow.prototype.editNode = function(node){
			var that = this;
			var attrform = node.data('attrForm');
			var attrs = node.data('nodeData');
			$('.attrs_box .attrs',this.tempalte).children().hide();
			//初始化节点属性form
			if(attrform){
				attrform.template.show();
			}else{
				var type = attrs.type;
				var form = this.initAttrForm(type,attrs);
				node.data('attrForm',form);
			}
			//设置节点选中状态
			if(node.hasClass('selected')){
				return;
			}else{
				$('.workflow_box .flow_box .selected',this.template).removeClass('selected');
				node.addClass('selected');
			}
		}
		Workflow.prototype.initAttrForm = function(type,attrs){
			var that = this;
			var vals = attrs||{};
			var Form = V.Classes['v.component.Form'];
			var form = new V.Classes['v.component.BlockForm']();
			var items = [
			    {type:Form.TYPE.READONLY,label:'类型',name:'type',value:type},
			    {type:Form.TYPE.TEXT,label:'ID',name:'id',value:vals.id||Util.generateId(),styleClass:'input-medium'},
			    {type:Form.TYPE.TEXT,label:'描述',name:'name',value:vals.name||'',styleClass:'input-medium'}
			];
			if(type == this.NODETYPE.START){
				
			}else if(type == this.NODETYPE.END){
				
			}else if(type == this.NODETYPE.JOIN){

			}else if(type == this.NODETYPE.DISPATCH){

			}else if(type == this.NODETYPE.MEMO){
				items.pop();
				items.pop();
				items.push({type:Form.TYPE.TEXTAREA,label:'描述',name:'name',value:vals.name||'',styleClass:'input-medium'});
			}else if(type == this.NODETYPE.DB_POLLER){
				items.push(
				    {type:Form.TYPE.TEXT,label:'SQL',name:'sql',value:vals.v||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'查询间隔',name:'interval',value:vals.interval||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.SELECT,label:'数据源',name:'internalDataSource',value:vals.internalDataSource||'',multiList:[["内部数据源",true],["外部数据源",false]],styleClass:'input-medium'}
				    ,{type:Form.TYPE.SELECT,label:'Driver',name:'driver',value:vals.driver||'',multiList:[],styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'URL',name:'url',value:vals.v||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'User',name:'user',value:vals.user||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.PASSWORD,label:'Password',name:'password',value:vals.password||'',styleClass:'input-medium'}
				);
			}else if(type == this.NODETYPE.QUERY){
				items.push(
				    {type:Form.TYPE.TEXT,label:'SQL',name:'sql',value:vals.sql||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'查询间隔',name:'interval',value:vals.interval||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.SELECT,label:'数据源',name:'internalDataSource',value:vals.internalDataSource||'',multiList:[["内部数据源",true],["外部数据源",false]],styleClass:'input-medium'}
				    ,{type:Form.TYPE.SELECT,label:'Driver',name:'driver',value:vals.driver||'',multiList:[],styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'URL',name:'url',value:vals.url||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'User',name:'user',value:vals.user||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.PASSWORD,label:'Password',name:'password',value:vals.password||'',styleClass:'input-medium'}
				);
			}else if(type == this.NODETYPE.MESSAGE){

			}else if(type == this.NODETYPE.TIMER){
				items.push(
				    {type:Form.TYPE.TEXT,label:'间隔',name:'interval',value:vals.interval||'',styleClass:'input-medium'}
				);
			}else if(type == this.NODETYPE.EMAIL){
				items.push(
				    {type:Form.TYPE.TEXT,label:'邮件模版',name:'template',value:vals.template||'',styleClass:'input-medium'}
				);
			}else if(type == this.NODETYPE.DB_SQL){
				items.push(
				    {type:Form.TYPE.TEXT,label:'SQL',name:'sql',value:vals.sql||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'数据源',name:'dataSource',value:vals.dataSource||'',styleClass:'input-medium'}
				);
			}else if(type == this.NODETYPE.SERVICE){
				items.push(
				    {type:Form.TYPE.TEXTAREA,label:'脚本',name:'script',value:vals.script||'',styleClass:'input-medium'}
				);
			}else if(type == this.NODETYPE.SUBPROCESS){
				items.push(
				    {type:Form.TYPE.TEXT,label:'子流程ID',name:'workflowId',value:vals.workflowId||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'Owners',name:'owners',value:vals.owners||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'输入参数',name:'inParams',value:vals.inParams||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'输出参数',name:'outParams',value:vals.outParams||'',styleClass:'input-medium'}
				);
			}else if(type == this.NODETYPE.USER){
				var ACTIONTYPE = {
					COUNTERSIGN:'COUNTERSIGN',
					CLAIM:'CLAIM',
					APPOINT:'APPOINT'
				}
				items.push(
					{type:Form.TYPE.TEXTAREA,label:'外部表单',name:'outerFormUrl',value:vals.outerFormUrl||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'处理BEAN',name:'processBean',value:vals.processBean||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'生成按钮',name:'actions',value:vals.actions||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.SELECT,label:'操作类型',name:'actionType',value:vals.actionType||'',multiList:[['默认',ACTIONTYPE.CLAIM] ,['会签',ACTIONTYPE.COUNTERSIGN],['认领',ACTIONTYPE.CLAIM],['指派',ACTIONTYPE.APPOINT]]}
				    ,{type:Form.TYPE.SELECT,label:'会签类型',name:'sequential',value:vals.sequential||'',multiList:[["串行",true],["并行",false]]}
				    ,{type:Form.TYPE.CHECKBOX,label:'会签也需要认领',name:'needClaim',value:vals.needClaim||false,multiList:[['',true]],styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'同意数',name:'approveNumber',value:vals.approveNumber||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.CHECKBOX,label:'同意后发送邮件',name:'sendMailWhenApprove',value:vals.sendMailWhenApprove||false,multiList:[['',true]],styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'邮件模版',name:'approveMailTemplate',value:vals.approveMailTemplate||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.CHECKBOX,label:'不同意后发送邮件',name:'sendMailWhenDisapprove',value:vals.sendMailWhenDisapprove||false,multiList:[['',true]],styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'邮件模版',name:'disapproveMailTemplate',value:vals.disapproveMailTemplate||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.CHECKBOX,label:'过期检查',name:'checkTimeout',value:vals.checkTimeout||false,multiList:[['',true]],styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'过期时间',name:'timeout',value:vals.timeout||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'过期处理BEAN',name:'timeoutProcessor',value:vals.timeoutProcessor||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.NUMBER,label:'过期跳转',name:'timeoutGotoNode',value:vals.timeoutGotoNode||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.CHECKBOX,label:'发送提醒邮件',name:'sendPromptMail',value:vals.sendPromptMail||false,multiList:[['',true]],styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'提醒时间',name:'promptAfter',value:vals.promptAfter||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'提醒频率',name:'promptInterval',value:vals.promptInterval||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.NUMBER,label:'提醒次数',name:'promptNumber',value:vals.promptNumber||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.NUMBER,label:'提醒间隔邮件名',name:'promptMail',value:vals.promptMail||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.NUMBER,label:'提醒间隔接收者',name:'promptMailReceiver',value:vals.promptMailReceiver||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.NUMBER,label:'候选人邮件通知模板',name:'candidateNotifyTemplate',value:vals.candidateNotifyTemplate||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.NUMBER,label:'指派人邮件通知模板',name:'assigneeNotifyTemplate',value:vals.assigneeNotifyTemplate||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.NUMBER,label:'驳回备注模板',name:'freemarkerRemark',value:vals.freemarkerRemark||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXTAREA,label:'备注',name:'memo',value:vals.memo||'',styleClass:'input-medium'}
				);
				var ids = [];
				if(vals.owners){
					ids = vals.owners.trim().split(',');
				}
				var uIds = [],
				    rIds = [],
				    pIds = [],
				    expression = "";
				$.each(ids,function(){
					var r_prefix = "R_";
					var p_prefix = "P_";
					var e_prefix = ["P_[","U_[","R_["];
					if($.inArray(this.substring(0,3),e_prefix)!=-1){
						expression = this;
					}else if(this.substring(0,2) == r_prefix){
						rIds.push(this.substring(2));
					}else if(this.substring(0,2) == p_prefix){
						pIds.push(this.substring(2));
					}else{
						uIds.push(this);
					}
				})
				items.push(
				    {isBlock:true,label:'责任人',value:'',render:function(){
				    	var html = $('<span><a href="javascript:void(0)" class="btn btn-mini user"><i class="icon-plus"></i>用户</a><a href="javascript:void(0)" class="btn btn-mini role" style="margin:0 4px;"><i class="icon-plus"></i>角色</a><a href="javascript:void(0)" class="btn btn-mini post"><i class="icon-plus"></i>岗位</a></span>');
				    	$('.user',html).click(function(){
				    		that.chooseUser(form);
				    	});
				    	$('.role',html).click(function(){
				    		that.chooseRole(form);
				    	})
				    	$('.post',html).click(function(){
				    		that.choosePost(form);
				    	})
				    	return html;
				    }},
				    {type:Form.TYPE.CUSTOM,label:'用户',name:'users',value:uIds,render:function(){
				    	var html = $('<div></div>');
				    	$.each(this.value,function(){
				    		var item = $('<a href="javascript:void(0)" class="btn btn-mini" style="margin:2px;" code='+this+'>'+this+'<i class="icon-remove"></i></a>');
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
			    	}},
				    {type:Form.TYPE.CUSTOM,label:'角色',name:'roles',value:rIds,render:function(){
				    	var html = $('<div></div>');
				    	$.each(this.value,function(){
				    		var item = $('<a href="javascript:void(0)" class="btn btn-mini" style="margin:2px;" code='+this+'>'+this+'<i class="icon-remove"></i></a>');
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
				    {type:Form.TYPE.CUSTOM,label:'岗位',name:'posts',value:pIds,render:function(){
				    	var html = $('<div></div>');
				    	$.each(this.value,function(){
				    		var item = $('<a href="javascript:void(0)" class="btn btn-mini" style="margin:2px;" code='+this+'>'+this+'<i class="icon-remove"></i></a>');
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
			    	{type:Form.TYPE.TEXT,label:'表达式',name:'expression',value:expression,styleClass:'input-medium'},				    
			    	{isBlock:true,label:'表单',value:'',render:function(record){
				    	var html = $('<div><a href="javascript:void(0)" class="btn btn-mini edit">编辑</a></div>');
				    	$('.edit',html).click(function(){
				    		if(!attrs.fields){
				    			attrs.fields = [];
				    		}
				    		that.editUserNodeProperties(attrs.fields);
				    	});
				    	return html;
				    }},
				    {type:Form.TYPE.SUBFORM,name:'fields',render:function(){
				    	  this.form = new V.Classes['v.component.Form']();
				    	  var items = [];
				    	  this.form.init({
				    		  colspan:1,
				    		  items:items
				    	  })
				    	  return this.form.template;
				    },getValue:function(){
				    	return {fields:attrs.fields}
				    }}
				);
				items.push({type:Form.TYPE.TEXTAREA,label:'JS初始化脚本',name:'jsInit',value:vals.jsInit||'',styleClass:'input-medium'});
				items.push({type:Form.TYPE.TEXTAREA,label:'JS提交脚本',name:'jsSubmit',value:vals.jsSubmit||'',styleClass:'input-medium'});
				
				items.push({isBlock:true,label:'单据',value:''}),
				items.push({type:Form.TYPE.TEXTAREA,label:'单据按钮',name:'docketActions',value:vals.docketActions||'',styleClass:'input-medium'});
				items.push({type:Form.TYPE.TEXTAREA,label:'单据配置',name:'docketCustom',value:vals.docketCustom||'',styleClass:'input-medium'});
			}else if(type == this.NODETYPE.LINE){
				items.push(
					{type:Form.TYPE.TEXT,label:'条件',name:'condition',value:vals.condition||'',styleClass:'input-medium'}
				);
			}
			form.init({
				container:$('.attrs',this.template),
				items:items,
				colspan:1
			});
			return form;
		}
		Workflow.prototype.removeNode = function(node){
			var that = this;
			V.confirm("确定删除此节点？",function(){
				that.workflow.removeNode(node);
				var attrForm = $(node).data('attrForm');
				attrForm && attrForm.template.remove();
			});
		}
		Workflow.prototype.chooseUser = function(form){
			var selector = new V.Classes['v.component.selector.UserSelector']();
			var options = {params:{createByPlatformNo:this.platformNo}};
			selector.init(options);
			form.subscribe(selector,selector.EVENT.SELECT_CHANGE,function(users){
				var item = form.getItem('users');
				var vals = item.getValue()['users']||[];
				$.each(users,function(){
					var code = this.userCode;
					if($.inArray(code,vals)!=-1){
						return true;
					}
					vals.push(code);
				})
				item.value= vals;
				form.repaintItem(item);
			});
		}
		Workflow.prototype.chooseRole = function(form){
			var selector = new V.Classes['v.component.selector.RoleSelector']();
			var options = {params:{createByPlatformNo:this.platformNo}};
			selector.init(options);
			form.subscribe(selector,selector.EVENT.SELECT_CHANGE,function(roles){
				var item = form.getItem('roles');
				var vals = item.getValue()['roles']||[];
				$.each(roles,function(){
					var code = this.roleCode;
					if($.inArray(code,vals)!=-1){
						return true;
					}
					vals.push(code);
				})
				item.value= vals;
				form.repaintItem(item);
			});
		}
		Workflow.prototype.choosePost = function(form){
			var selector = new V.Classes['v.component.selector.PostSelector']();
			var options = {params:{createByPlatformNo:this.platformNo}};
			selector.init(options);
			form.subscribe(selector,selector.EVENT.SELECT_CHANGE,function(posts){
				var item = form.getItem('posts');
				var vals = item.getValue()['posts']||[];
				$.each(posts,function(){
					var code = this.code;
					if($.inArray(code,vals)!=-1){
						return true;
					}
					vals.push(code);
				})
				item.value= vals;
				form.repaintItem(item);
			});
		}
		Workflow.prototype.editUserNodeProperties = function(fields){
			var Form = V.Classes['v.component.Form'];
			var FIELDTYPE = {
				TEXT:Form.TYPE.TEXT,
				TEXTAREA:Form.TYPE.TEXTAREA,
				SELECT:Form.TYPE.SELECT,
				MULTISELECT:Form.TYPE.CHECKBOX,
				HIDDEN:Form.TYPE.HIDDEN,
				RADIO:Form.TYPE.RADIO,

				READONLY:Form.TYPE.READONLY
			}
			var that = this;
			var dlg = new V.Classes['v.ui.Dialog']();
			var con = '<div>\
				<div class="row-fluid">\
				    <label class="span2" style="display:none">数据：</label><div class="span11"><div class="dataList"></div></div>\
				</div></div>';
			dlg.setContent(con);
			dlg.setBtnsBar({btns:[{
				text:'保存',style:'btn-primary',handler:function(){
					dlg.close();
				}
			},{
				text:'删除',handler:function(){
					fields = {};
					dlg.close();
				}
			}]});
			dlg.init({
				title:'定义用户表单',
				width:750,
				height:400
			});
			var list = new V.Classes['v.ui.Grid']();
			if(fields.length==0){
				var prop = {label:'',name:'',value:'',type:FIELDTYPE.TEXT,required:false}
				fields.push(prop);
			}
			list.init({
				container:$('.dataList',dlg.template),
				columns:[
					{displayName:'属性标识',key:'label',width:80,render:function(record){
						var html = $('<input type="text" style="width:80px;" value="'+(record.label||'')+'" data-validator="text4" data-required="true" /><p class="error_msg"></p>');
						html.change(function(){
							record.label = this.value;
						});
						return html;
					}},
			        {displayName:'属性名称',key:'name',width:100,render:function(record){
						var html = $('<input type="text" style="width:100px;" value="'+(record.name||'')+'" data-validator="" data-required="true" /><p class="error_msg"></p>');
						html.change(function(){
							record.name = this.value;
						});
						return html;
					}},
					{displayName:'类型',key:'type',width:80,render:function(record){
						var html = $("<select style='width:80px;' value='"+record.type+"'><option value='"+FIELDTYPE.TEXT+"'>文本</option><option value='"+FIELDTYPE.SELECT+"'>单选(select)</option><option value='"+FIELDTYPE.MULTISELECT+"'>多选</option><option value='"+FIELDTYPE.TEXTAREA+"'>文本域</option><option value='"+FIELDTYPE.RADIO+"'>单选(radio)</option></select>");
						$('option',html).parent().val(record.type);
						html.change(function(){
							record.type = $(this).val();
						});
						return html;
					}},
					{displayName:'是否必填',key:'required',width:50,render:function(record){
						var html = $("<div style='text-align:center;'><input type='checkbox' /></div>");
						$(':checkbox',html).attr('checked',record.required);
						$(':checkbox',html).click(function(){
							record.required = this.checked?true:false;
						})
						return html;
					}},
					{displayName:'备选值',key:'value',width:200,render:function(record){
						html = $('<textarea style="width:200px;"></textarea>');
						html.val(record.value);
						html.change(function(){
							record.value = $(this).val();
						});
						return html;
					}},
					{displayName:'操作',key:'actions',width:80,render:function(record){
						var actions = $("<div style='text-align:center;'><button class='btn btn-mini add'><i class='icon-plus'></i></button><button class='btn remove btn-mini' style='margin-left:6px;'><i class='icon-minus'></i></button></div>");
						var prop = {label:'',name:'',value:'',type:FIELDTYPE.TEXT,required:false}
						var index = list.getRecordIndex(record);
						$('.add',actions).click(function(){
						    list.options.data.splice(index+1,0,prop);
							list.refresh();
						});
						$('.remove',actions).click(function(){
							var size = list.options.data.length;
							if(size>1){
								list.options.data.splice(index,1);
							    list.refresh();
							}
						});
						return actions;
					}}
				],
				data:fields
			});
		};
		Workflow.prototype.save = function(workflow){
			var that = this;
			var flowData = this.flowForm.getValues();
			flowData.props = {
					initForm:flowData.initForm,
					dataKey1Desc:flowData.dataKey1Desc,
					dataKey2Desc:flowData.dataKey2Desc,
					dataKey3Desc:flowData.dataKey3Desc,
					errorProcessNode:flowData.errorProcessNode,
					sendMailWhenFinish:flowData.sendMailWhenFinish,
					finishMailTemplate:flowData.finishMailTemplate
			};
			if(!flowData.id){
				delete flowData['id'];//后台直接转成long，传空会报错
			}
			delete flowData['initForm'];
			delete flowData['dataKey1Desc'];
			delete flowData['dataKey2Desc'];
			delete flowData['dataKey3Desc'];
			delete flowData['errorProcessNode'];
			delete flowData['sendMailWhenFinish'];
			delete flowData['finishMailTemplate'];
			var _nodes = [];
			var nodes = this.workflow.getAllNodes();
			var lines = this.workflow.getAllConnections();
			$.each(nodes,function(){
				var form = $(this).data('attrForm');
				_node = form.getValues();
				if(_node.type == that.NODETYPE.USER){
					var uIds = _node.users;
					var rIds = _node.roles;
					var pIds = _node.posts;
					var expression = _node.expression==''?_node.expression:(','+_node.expression);
					_node.owners = uIds.join(',')+' '+rIds.join(',')+' '+pIds.join(',')+expression;
					delete _node.users;
					delete _node.roles;
					delete _node.posts;
					delete _node.expression;				
				}
				// var x = $(this).position().left;
				// var y = $(this).position().top;
				var x = $(this).position().left+$('.flow_box',that.tempalte).parent().scrollLeft();
				var y = $(this).position().top+$('.flow_box',that.tempalte).parent().scrollTop();;
				_node.ui = JSON.stringify({x:x,y:y});
				_nodes.push(_node);
			});
			$.each(lines,function(){
				var form = this.attrform;
				_node = form.getValues();
				var sourceForm = $(this.source).data('attrForm');
				var targetForm = $(this.target).data('attrForm');
				_node.fromNode = sourceForm.getValues()['id'];
				_node.toNode = targetForm.getValues()['id'];
				_nodes.push(_node);
			})
			flowData.items = _nodes;
			//flowData = {"workflowKey":"LOANERCAR_REG","workflowName":"代步车注册","dataType":"","dataKey1":"docketId","dataKey2":"","dataKey3":"","props":{"initForm":"","dataKey1Desc":"单据ID","dataKey2Desc":"","dataKey3Desc":"","errorProcessNode":"","sendMailWhenFinish":"","finishMailTemplate":""},"items":[{"type":"START","id":"VCTIEVPSJYD","name":"开始","ui":"{\"x\":179,\"y\":61}"},{"type":"USER","id":"VMLQUSGBSID","name":"审批","outerFormUrl":"{”ns“:\"v.views.loanerReg.loanerRegView\",\"isEdit\":false,\"module\":\"workflow/loanerreg\"}","processBean":"","actionType":"","sequential":"false","approveNumber":"","fields":[{"label":"审批内容","name":"COMMENT","value":"","type":"TEXT","required":false},{"label":"会议部门","name":"departments","value":"part1=部门1;part2=部门2;part3=部门3","type":"CHECKBOX","required":false}],"owners":"bwm_100  ","ui":"{\"x\":357,\"y\":125}"},{"type":"END","id":"VUZESENLKZR","name":"结束","ui":"{\"x\":595,\"y\":232}"},{"type":"LINE","id":"VYUTPXKGEZ1","name":"","condition":"","fromNode":"VCTIEVPSJYD","toNode":"VMLQUSGBSID"},{"type":"LINE","id":"VEQ4C7FPEYZ","name":"","condition":"","fromNode":"VMLQUSGBSID","toNode":"VUZESENLKZR"}]}
			if(_nodes.length == 0){
				V.alert('请先设计流程。');
				return;
			}
			flowData.platformNo = this.platformNo;
			$.ajax({
				url:'workflow/workflow!save.action',
				type:'post',
				data:{workflowJson:JSON.stringify(flowData)},
				success:function(){
					V.alert('保存成功！');
				}
			})
		}
		Workflow.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'工作流设置'}});
		}
	})(V.Classes['v.views.backoffice.custom.workflowdefList.WorkflowEdit']);
},{plugins:['v.ui.confirm',
            'v.ui.alert',
            'v.component.workflow',
            'v.component.blockForm',
            'v.component.selector.userSelector',
            'v.component.selector.roleSelector',
            'v.component.selector.postSelector',
            'v.fn.util']});
