;V.registPlugin("v.module.workflow.manage.workflowSetting",function(){
	V.Classes.create({
		className:"v.module.workflow.manage.WorkflowSetting",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.module.workflow.manage.workflowSetting';
        	this.module = '';
        	this.workflow = null;
        	this.flowData = null;
        	this.flowForm = null;
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
        	    WAIT:"WAIT",
        	    MEMO:"MEMO",
        	    LINE:"LINE"
        	},
        	this.nodeslib = [
        	    {type:this.NODETYPE.START,text:'开始'}
        	    ,{type:this.NODETYPE.END,text:'结束'}
        	    //,{type:this.NODETYPE.JOIN,text:'聚合点'}
        	    //,{type:this.NODETYPE.DISPATCH,text:'分发点'}
        	    //,{type:this.NODETYPE.DB_POLLER,text:'数据库监听'}
        	    ,{type:this.NODETYPE.QUERY,text:'数据库查询'}
        	    //,{type:this.NODETYPE.MESSAGE,text:'发送消息'}
        	    //,{type:this.NODETYPE.TIMER,text:'定时任务'}
        	    ,{type:this.NODETYPE.EMAIL,text:'发送邮件'}
        	    ,{type:this.NODETYPE.DB_SQL,text:'数据库SQL'}
        	    ,{type:this.NODETYPE.USER,text:'用户'}
        	    ,{type:this.NODETYPE.SUBPROCESS,text:'子流程'}
        	    ,{type:this.NODETYPE.WAIT,text:'等待'}
        	    ,{type:this.NODETYPE.MEMO,text:'说明'}
        	    ,{type:this.NODETYPE.SERVICE,text:'服务'}
        	];
        	this.options = {
        	    flowData:null
        	}
        	this.template = $('<div>\
        		<div class="workflow_box">\
        			<div class="flow_box" style="position:relative;overflow:auto;"></div>\
        			<div class="toolbar">\
        			    <a href="javascript:void(0)" class="btn save" title="保存">保存</a>\
        			    <a href="javascript:void(0)" class="btn saveAndDeploy" title="保存并部署">保存并部署</a>\
        			    <a class="btn removeNode" href="javascript:void(0)" title="删除节点">删除节点</i></a>\
        			</div>\
        			<div class="nodes_box"><div style="text-align:center;line-height:30px;background:whitesmoke;font-weight:bold;border-bottom:0px none">节点</div><ul style="width:100px;margin:0 10px;"></ul></div>\
        			<div class="attrs_box">\
        			    <div class="box_tit"><a class="toggle" href="javascript:void(0);"><i class="icon-resize-small"></i></a><span>节点属性</span></div>\
        			    <div class="attrs docket"></div>\
        			</div>\
        	    </div>\
			    <div class="flow_attrs">\
			        <div style="text-align:center;line-height:30px;background:rgb(119,183,231);font-weight:bold;color:#fff">流程设置</div>\
			        <div class="attrs docket"></div>\
			    </div>\
        	</div>');
		}
	});
	(function(Workflow){
		Workflow.prototype.init = function(options){
			this.flowData = options.flowData||{};
			this.container = options.container;
			this.options.platformNo = options.platformNo;
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
			// $('.trash',this.template).droppable({
			// 	 drop: function( event, ui ) {
			// 		 var target = ui.draggable;
			// 		 that.removeNode(target.get(0));
			// 	 }
			// })
			$('.save',this.template).click(function(){
				that.save();
			})
			$('.saveAndDeploy',this.template).click(function(){
				that.saveAndDeploy();
			})
			//delete删除
			$('.selected',this.template[0]).live('keyup',function(e){
				if(e.which == 46){
					that.removeNode(this);
				}
			})
			$('.removeNode',this.template).click(function(){
				var node = $('.flow_box .selected',that.template);
				if(node.length == 0){
					V.alert("请选择要删除的节点");
				}else{
					that.removeNode(node.get(0));
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
			//拖拽节点
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
					 node.focus();
					 that.editNode(node);
					 $('.workflow_box .attrs_box',that.template).show();
				 }
			});
			$('.attrs_box .box_tit .toggle',this.template).click(function(){
				if($(this).hasClass('open')){
					$('.attrs_box',that.template).animate({width:30,height:30},function(){
						$('.box_tit span',this).hide();
						$('.attrs',this).hide();
						$('.box_tit .toggle',this).removeClass('open');
						$('.box_tit .toggle i').removeClass('icon-resize-small').addClass('icon-resize-full');
					});
					
				}else{
					$('.attrs_box',that.template).animate({width:360,height:500},function(){
						$('.box_tit span',this).show();
						$('.attrs',this).show();
						$('.box_tit .toggle',this).addClass('open');
						$('.box_tit .toggle i').removeClass('icon-resize-full').addClass('icon-resize-small');
					});
				}
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
				container:$('.flow_attrs .attrs',this.template),
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
    //             node.attr("tabindex",0);
				// node.focus();
				var form = that.initAttrForm(this.type,node.data('nodeData'));
				node.data('attrForm',form);
			    //that.editNode(node);
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
				var item = $("<li style='margin:5px 0px;'><a href='javascript:void(0);' class='btn node' style='width:40px;text-align:center;cursor:default;'>"+this.text+"</a></li>");
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
				node.addClass('node_begin');
			}else if(type == this.NODETYPE.END){
				node = this.workflow.addEndNode(text,position.left,position.top,data);
				node.addClass('node_end');
			}else if(type == this.NODETYPE.MEMO){
				node = this.workflow.addMemoNode(text,position.left,position.top,data);
			}else{
				node = this.workflow.addNode(text,position.left,position.top,data);
			}
			//必须加tabindex属性，不然无法focus，无法则无法监听keyup事件。
			node.attr('tabindex',0);
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
			$('.attrs_box',this.template).show();
			//初始化节点属性form
			if(!attrform){
				var type = attrs.type;
				if(!attrs.name){
					attrs.name = node.text();
				}
				attrform = this.initAttrForm(type,attrs);
				node.data('attrForm',attrform);
			}
			if($('.attrs_box .toggle',this.template).hasClass('open')){
				$('.attrs_box',that.template).animate({right:-360},function(){
					$('.attrs',this).children().hide();
					attrform.template.show();
					$(this).animate({right:0});
				})
			}else{
				$('.attrs_box .attrs',that.template).children().hide();
				attrform.template.show();
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
			    {isBlock:true,label:'基础设置',name:'subblock',block:'0'},
			    {type:Form.TYPE.READONLY,label:'类型',name:'type',value:type,block:'0'},
			    {type:Form.TYPE.TEXT,label:'ID',name:'id',value:vals.id||Util.generateId(),styleClass:'input-medium',block:'0'},
			    {type:Form.TYPE.TEXT,label:'描述',name:'name',value:vals.name||'',styleClass:'input-medium',block:'0'}
			];
			if(type == this.NODETYPE.START){
				
			}else if(type == this.NODETYPE.END){
				
			}else if(type == this.NODETYPE.JOIN){

			}else if(type == this.NODETYPE.DISPATCH){

			}else if(type == this.NODETYPE.MEMO){
				items.pop();
				items.pop();
				items.push({type:Form.TYPE.TEXTAREA,label:'描述',name:'name',value:vals.name||'',styleClass:'input-medium',block:'0'});
			}else if(type == this.NODETYPE.DB_POLLER){
				items.push(
				    {type:Form.TYPE.TEXT,label:'SQL',name:'sql',value:vals.v||'',styleClass:'input-medium',block:'0'}
				);
			}else if(type == this.NODETYPE.QUERY){
				items.push(
				    {type:Form.TYPE.TEXTAREA,label:'SQL',name:'sql',value:vals.sql||'',styleClass:'input-medium',block:'0'}
				);
			}else if(type == this.NODETYPE.MESSAGE){

			}else if(type == this.NODETYPE.TIMER){
				items.push(
				    {type:Form.TYPE.TEXT,label:'间隔',name:'interval',value:vals.interval||'',styleClass:'input-medium',block:'0'}
				);
			}else if(type == this.NODETYPE.EMAIL){
				items.push(
				    {type:Form.TYPE.TEXT,label:'邮件模版',name:'template',value:vals.template||'',styleClass:'input-medium',block:'0'}
				);
			}else if(type == this.NODETYPE.DB_SQL){
				items.push(
				    {type:Form.TYPE.TEXT,label:'SQL',name:'sql',value:vals.sql||'',styleClass:'input-medium',block:'0'}
				    //,{type:Form.TYPE.TEXT,label:'数据源',name:'dataSource',value:vals.dataSource||'',styleClass:'input-medium'}
				);
			}else if(type == this.NODETYPE.SERVICE){
				items.push(
				    {type:Form.TYPE.TEXTAREA,label:'脚本',name:'script',value:vals.script||'',styleClass:'input-medium',block:'0'}
				);
			}else if(type == this.NODETYPE.SUBPROCESS){
				items.push(
				    {type:Form.TYPE.TEXT,label:'子流程ID',name:'workflowId',value:vals.workflowId||'',styleClass:'input-medium',block:'0'}
				    //,{type:Form.TYPE.TEXT,label:'Owners',name:'owners',value:vals.owners||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'输入参数',name:'inParams',value:vals.inParams||'',styleClass:'input-medium',block:'0'}
				    ,{type:Form.TYPE.TEXT,label:'输出参数',name:'outParams',value:vals.outParams||'',styleClass:'input-medium',block:'0'}
				);
			}else if(type == this.NODETYPE.USER){
				var ACTIONTYPE = {
					COUNTERSIGN:'COUNTERSIGN',
					CLAIM:'CLAIM',
					APPOINT:'APPOINT'
				}
				items.push(
				    {type:Form.TYPE.SELECT,label:'操作类型',block:'0',name:'actionType',value:vals.actionType||ACTIONTYPE.CLAIM,multiList:[['会签',ACTIONTYPE.COUNTERSIGN],['认领',ACTIONTYPE.CLAIM],['指派',ACTIONTYPE.APPOINT]],notip:true}
				    ,{type:Form.TYPE.SELECT,label:'会签类型',block:'0',name:'sequential',value:vals.sequential||false,multiList:[["串行",true],["并行",false]],notip:true}
				    //,{type:Form.TYPE.CHECKBOX,label:'会签也需要认领',name:'needClaim',value:vals.needClaim||false,multiList:[['',true]],styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'同意数',block:'0',name:'approveNumber',value:vals.approveNumber||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.CHECKBOX,label:'同意后发送邮件',block:'0',name:'sendMailWhenApprove',value:vals.sendMailWhenApprove||false,multiList:[['',true]],styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'邮件模版',name:'approveMailTemplate',block:'0',value:vals.approveMailTemplate||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.CHECKBOX,label:'不同意后发送邮件',name:'sendMailWhenDisapprove',block:'0',value:vals.sendMailWhenDisapprove||false,multiList:[['',true]],styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'邮件模版',name:'disapproveMailTemplate',block:'0',value:vals.disapproveMailTemplate||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.CHECKBOX,label:'过期检查',name:'checkTimeout',block:'0',value:vals.checkTimeout||false,multiList:[['',true]],styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'过期时间',name:'timeout',block:'0',value:vals.timeout||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'过期处理BEAN',name:'timeoutProcessor',block:'0',value:vals.timeoutProcessor||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.NUMBER,label:'过期跳转',name:'timeoutGotoNode',block:'0',value:vals.timeoutGotoNode||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.CHECKBOX,label:'发送提醒邮件',name:'sendPromptMail',block:'0',value:vals.sendPromptMail||false,multiList:[['',true]],styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'提醒时间',name:'promptAfter',block:'0',value:vals.promptAfter||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'提醒频率',name:'promptInterval',block:'0',value:vals.promptInterval||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.NUMBER,label:'提醒次数',name:'promptNumber',block:'0',value:vals.promptNumber||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.NUMBER,label:'提醒间隔邮件名',name:'promptMail',block:'0',value:vals.promptMail||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.NUMBER,label:'提醒间隔接收者',name:'promptMailReceiver',block:'0',value:vals.promptMailReceiver||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.NUMBER,label:'候选人邮件通知模板',name:'candidateNotifyTemplate',block:'0',value:vals.candidateNotifyTemplate||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.NUMBER,label:'指派人邮件通知模板',name:'assigneeNotifyTemplate',block:'0',value:vals.assigneeNotifyTemplate||'',styleClass:'input-medium'}
				    //,{type:Form.TYPE.NUMBER,label:'驳回备注模板',name:'freemarkerRemark',value:vals.freemarkerRemark||'',styleClass:'input-medium'}
					,{isBlock:true,label:'JAVA处理',name:'subblock',block:'1',value:''}
				    ,{type:Form.TYPE.CHECKBOX,label:'使用处理BEAN',block:'1',name:'useBean',value:vals.useBean,multiList:[['',true]],styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'处理BEAN',name:'processBean',block:'1',value:vals.processBean||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXTAREA,label:'前处理脚本',name:'preProcessCode',block:'1',value:vals.preProcessCode||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXTAREA,label:'后处理脚本',name:'postProcessCode',block:'1',value:vals.postProcessCode||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXTAREA,label:'参数配置',name:'memo',block:'1',value:vals.memo||'',styleClass:'input-medium'}
				);
				var ids = [];
				if(vals.owners){
					ids = vals.owners.trim().split(';');
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
				    {isBlock:true,label:'责任人',name:'subblock',block:'2',value:'',render:function(){
				    	var html = $('<span><a href="javascript:void(0)" class="btn btn-mini user"><i class="icon-white icon-plus"></i>用户</a><a href="javascript:void(0)" class="btn btn-mini role" style="margin:0 4px;"><i class="icon-white icon-plus"></i>角色</a><a href="javascript:void(0)" class="btn btn-mini post"><i class="icon-white icon-plus"></i>岗位</a></span>');
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
				    {type:Form.TYPE.CUSTOM,label:'用户',name:'users',block:'2',value:uIds,render:function(){
				    	var html = $('<div></div>');
				    	$.each(this.value,function(){
				    		var item = $('<a href="javascript:void(0)" class="btn btn-mini" style="margin:2px;" code='+this+'>'+this+'<i class="icon-white icon-remove"></i></a>');
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
				    {type:Form.TYPE.CUSTOM,label:'角色',block:'2',name:'roles',value:rIds,render:function(){
				    	var html = $('<div></div>');
				    	$.each(this.value,function(){
				    		var item = $('<a href="javascript:void(0)" class="btn btn-mini" style="margin:2px;" code='+this+'>'+this+'<i class="icon-white icon-remove"></i></a>');
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
				    {type:Form.TYPE.CUSTOM,label:'岗位',name:'posts',block:'2',value:pIds,render:function(){
				    	var html = $('<div></div>');
				    	$.each(this.value,function(){
				    		var item = $('<a href="javascript:void(0)" class="btn btn-mini" style="margin:2px;" code='+this+'>'+this+'<i class="icon-white icon-remove"></i></a>');
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
			    	{type:Form.TYPE.TEXT,label:'表达式',name:'expression',block:'2',value:expression,styleClass:'input-medium'},
			    	{type:Form.TYPE.CHECKBOX,label:'是否被指派',name:'needAppoint',block:'2',multiList:[['',true]],value:vals.needAppoint||'',styleClass:'input-medium'},				    
			    	{isBlock:true,label:'内部审批表单',name:'subblock',block:'3',value:''}
			    	//{isBlock:true,label:'内部审批表单',value:'',render:function(record){
				    //	var html = $('<div><a href="javascript:void(0)" class="btn btn-mini edit">编辑</a></div>');
				    //	$('.edit',html).click(function(){
				    //		if(!attrs.fields){
				    //			attrs.fields = [];
				    //		}
				    //		that.editUserNodeProperties(attrs.fields);
				    //	});
				    //	return html;
				    //}},
				    //{type:Form.TYPE.SUBFORM,name:'fields',render:function(){
				    //	this.form = new V.Classes['v.component.Form']();
				    //	var items = [];
				    //	this.form.init({
				    //		colspan:1,
				    //		items:items
				    //	})
				    //	return this.form.template;
				    //},getValue:function(){
				    //	return {fields:attrs.fields}
				    //}}
				);
				items.push({type:Form.TYPE.TEXTAREA,label:'JS初始化脚本',block:'3',name:'jsInit',value:vals.jsInit||'',styleClass:'input-medium'});
				items.push({type:Form.TYPE.TEXTAREA,label:'JS提交脚本',block:'3',name:'jsSubmit',value:vals.jsSubmit||'',styleClass:'input-medium'});
				items.push({type:Form.TYPE.TEXT,label:'生成按钮',block:'3',name:'actions',value:vals.actions||'',styleClass:'input-medium'});
				
				items.push({isBlock:true,label:'外部业务表单',name:'subblock',block:'4'});

				items.push({type:Form.TYPE.PLUGIN,label:'表单类型',block:'4',plugin:'v.views.component.docketTypeSelector',name:'docketType',aliasFieldName:'value',value:vals.docketType||'',styleClass:'input-medium',params:{'platformNo':this.options.platformNo}});
				items.push({type:Form.TYPE.CUSTOM,name:'docketCustom',block:'4',value:vals.docketCustom||'',label:'表单列表',render:function(){
					var val = this.value;
					var data = [];
					if(val){
						val = $.parseJSON(val);
						$.each(val,function(docketType){
							// var rec = {};
							// rec.name = docketType;
							// rec.value = val[docketType];
							// rec.docketCustom = val[docketType];
							data.push(this);
						})
					}
					var docketList = new V.Classes['v.ui.Grid']();
					docketList.init({
						actionColumnPosition:'end',
						columns:[
						    {displayName:'表单名',key:'name',width:100},
						    {displayName:'操作',key:'action',width:25,render:function(record){
						    	var html = $('<div><a href="javascript:void(0);" class="edit" style="margin-right:6px"><i class="icon-pencil"></i></a><a href="javascript:void(0);" class="remove"><i class="icon-remove"></i></a></div>');
						    	$('.edit',html).click(function(){
						    		that.openDocketCustom(record);
						    	});
						    	$('.remove',html).click(function(){
						    		docketList.removeRecord(record);
						    	})
						    	return html;
						    }}
						],
						data:data
					});
					this.list = docketList;
					return docketList.template;
				},getValue:function(){
					var obj = {};
					$.each(this.list.getData(),function(){
						obj[this.value] = this;
					})
					return {docketCustom:JSON.stringify(obj)};
				}})
				// items.push({type:Form.TYPE.TEXTAREA,label:'外部表单',block:'4',name:'outerFormUrl',value:vals.outerFormUrl||'',styleClass:'input-medium'});
//				items.push({type:Form.TYPE.TEXTAREA,label:'单据按钮',name:'docketActions',value:vals.docketActions||'',styleClass:'input-medium'});
				// items.push({type:Form.TYPE.CUSTOM,label:'表单配置',block:'4',name:'docketCustom',value:vals.docketCustom||'',styleClass:'input-medium',render:function(){
				// 	var htmlContext = $('<span><a href="javascript:void(0)" class="btn btn-mini"><i class="icon-white icon-plus"></i>配置</a></span>');
				// 	$('a',htmlContext).data('docketCustom',vals.docketCustom||'');
			 //    	$('a',htmlContext).click(function(){
			 //    		that.openDocketCustom(this,form,$('a',htmlContext).data('docketCustom'));
			 //    	});
			 //    	return htmlContext;
				// },getValue:function(){
				// 	    var element = this.element;
			 //    		return {'docketCustom':$('a',element).data('docketCustom')};
			 //    	}});
			}else if(type == this.NODETYPE.WAIT){
				items.push(
				    {type:Form.TYPE.TEXT,label:'过期时间',block:'0',name:'timeout',value:vals.timeout||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.NUMBER,label:'过期跳转',block:'0',name:'timeoutGotoNode',value:vals.timeoutGotoNode||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.CHECKBOX,label:'发送提醒邮件',block:'0',name:'sendPromptMail',value:vals.sendPromptMail||false,multiList:[['',true]],styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'提醒时间',block:'0',name:'promptAfter',value:vals.promptAfter||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'提醒频率',block:'0',name:'promptInterval',value:vals.promptInterval||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.NUMBER,label:'提醒次数',block:'0',name:'promptNumber',value:vals.promptNumber||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.NUMBER,label:'提醒间隔邮件名',block:'0',name:'promptMail',value:vals.promptMail||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.NUMBER,label:'提醒间隔接收者',block:'0',name:'promptMailReceiver',value:vals.promptMailReceiver||'',styleClass:'input-medium'}
					,{isBlock:true,label:'JAVA处理',name:"subblock",block:"1",value:''}
				    ,{type:Form.TYPE.CHECKBOX,label:'使用处理BEAN',block:"1",name:'useBean',value:vals.useBean,multiList:[['',true]],styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXT,label:'过期处理BEAN',block:"1",name:'timeoutProcessor',value:vals.timeoutProcessor||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXTAREA,label:'过期处理脚本',block:"1",name:'timeoutProcessCode',value:vals.timeoutProcessCode||'',styleClass:'input-medium'}
				    ,{type:Form.TYPE.TEXTAREA,label:'参数配置',block:"1",name:'memo',value:vals.memo||'',styleClass:'input-medium'}
				);
			}else if(type == this.NODETYPE.LINE){
				items.push(
					{type:Form.TYPE.TEXT,label:'条件',block:'0',name:'condition',value:vals.condition||'',styleClass:'input-medium'}
				);
			}
			form.init({
				container:$('.attrs_box .attrs',this.template),
				items:items,
				colspan:1
			});
			if(type == this.NODETYPE.USER){
				var docketListItem = form.getItem("docketCustom");
				var docketTypeItem = form.getItem("docketType");
				var docketSelector = docketTypeItem.plugin;
				this.subscribe(docketSelector,docketSelector.EVENT.SELECT_CHANGE,function(docket){
					var list = docketListItem.list;
					var obj = {
						value:docket.value,
						name:docket.name,
						outerFormUrl:'',
						docketCustom:{}
					};
					list.getData().push(obj);
					list.refresh();
				})
			}
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
			var options = {params:{createByPlatformNo:this.options.platformNo}};
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
			var options = {params:{createByPlatformNo:this.options.platformNo}};
			selector.init(options);
			form.subscribe(selector,selector.EVENT.SELECT_CHANGE,function(roles){
				var item = form.getItem('roles');
				var vals = item.getValue()['roles']||[];
				$.each(vals,function(index,val){
					vals[index] = val.substring(2);
				})
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
			var options = {params:{createByPlatformNo:this.options.platformNo}};
			selector.init(options);
			form.subscribe(selector,selector.EVENT.SELECT_CHANGE,function(posts){
				var item = form.getItem('posts');
				var vals = item.getValue()['posts']||[];
				$.each(vals,function(index,val){
					vals[index] = val.substring(2);
				})
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
		Workflow.prototype.openDocketCustom = function(docket){
			var localDocketCustom = docket.docketCustom;
			var outerFormUrl = docket.outerFormUrl;
			var that = this;
			var dlg = new V.Classes['v.ui.Dialog']();
			var con = $('<div><div class="outerFormUrl docket"></div><div class="docketList"></div></div>');
			dlg.setContent(con);
			var Form = V.Classes['v.component.Form']
			var form = new Form();
			form.init({
				container:$('.outerFormUrl',con),
				items:[
				    {label:'外部表单JS配置',name:'outerFormUrl',type:Form.TYPE.TEXTAREA,colspan:3,value:outerFormUrl||''}
				],
				colspan:3
			});
			var filterList = {
				'value':docket.value,
				'platformNo':this.options.platformNo
			}
			var list = new V.Classes['v.ui.Grid']();
			V.ajax({
            	url:'backoffice/systemsetting/custom/custom!docketTypeHierarchyList.action',
               	type:'POST',
				data:{filterList:filterList},
                success:function(data){
                	var docketCustom = [];
                	$.each(data,function(){
                		var docketItem = {
                			"docketType":this.subTypeValue,
                			"docketName":this.subTypeName,
                			"isShow":true,
                			"isEdit":true,
                			"isUsed":false
                		};
                		if(localDocketCustom!=null && localDocketCustom!='' && localDocketCustom[this.subTypeValue]!=null){
                			docketItem.isShow = localDocketCustom[this.subTypeValue].isShow;
                			docketItem.isEdit = localDocketCustom[this.subTypeValue].isEdit;
                			docketItem.actions = localDocketCustom[this.subTypeValue].actions;
                			docketItem.customs = localDocketCustom[this.subTypeValue].customs;
                			docketItem.isUsed = localDocketCustom[this.subTypeValue].isUsed;
                		}
                		docketCustom.push(docketItem);
                	})
					list.init({
						container:$('.docketList',con),
						columns:[
							{displayName:'是否启用',key:'isUsed',width:50,render:function(record){
								var html = $("<div style='text-align:center;'><input type='checkbox' /></div>");
								$(':checkbox',html).attr('checked',record.isUsed);
								$(':checkbox',html).click(function(){
									record.isUsed = $(this).attr('checked')?true:false;
								})
								return html;
							}},
							{displayName:'表单编码',key:'docketType',width:150},
					        {displayName:'表单名称',key:'docketName',width:100},
							{displayName:'是否显示',key:'isShow',width:50,render:function(record){
								var html = $("<div style='text-align:center;'><input type='checkbox' /></div>");
								$(':checkbox',html).attr('checked',record.isShow);
								$(':checkbox',html).click(function(){
									record.isShow = $(this).attr('checked')?true:false;
								})
								return html;
							}},
							{displayName:'是否编辑',key:'isEdit',width:50,render:function(record){
								var html = $("<div style='text-align:center;'><input type='checkbox' /></div>");
								$(':checkbox',html).attr('checked',record.isEdit);
								$(':checkbox',html).click(function(){
									record.isEdit = $(this).attr('checked')?true:false;
								})
								return html;
							}},
							{displayName:'按钮定义',key:'actions',width:150,render:function(record){
								var html = $('<div><textarea style="width:100%;"></textarea></div>');
								if($.isEmptyObject(record.actions)){
									$('textarea',html).val('');
								}else{
									$('textarea',html).val(record.actions);
								}
								html.change(function(){
									record.actions = $('textarea',html).val();
								});
								return html;
							}},
							{displayName:'字段定义',key:'customs',width:150,render:function(record){
								var html = $('<div><textarea style="width:100%;"></textarea></div>');
								if($.isEmptyObject(record.customs)){
									$('textarea',html).val('');
								}else{
									$('textarea',html).val(record.customs);
								}
								html.change(function(){
									record.customs = $('textarea',html).val();
								});
								return html;
							}}
						],
						data:docketCustom
					});
                }
            });
            dlg.setBtnsBar({btns:[{
				text:'保存',style:'btn-primary',handler:function(){
					var vals = form.getValues();
					docket.outerFormUrl = vals.outerFormUrl;
					var records = list.getData();
					docket.docketCustom = {};
					$.each(records,function(){
					if(!this.isUsed) return true;
		        		var docketType = this.docketType;
		        		docket.docketCustom[docketType] = {
		        			'docketType':this.docketType,
		        			'docketName':this.docketName,
		        			'isShow':this.isShow,
		        			'isEdit':this.isEdit,
		        			'actions':this.actions||{},
		        			'customs':this.customs||{},
		        			'isUsed':this.isUsed
		        		};
		        	});
		        	dlg.close();
				}
			}]});
			dlg.init({
				title:'表单配置',
				width:900,
				height:400
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
						var html = $('<textarea style="width:200px;"></textarea>');
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
		Workflow.prototype.getFlowData = function(){
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
					var ids = [];
					$.merge(ids,uIds);
					$.merge(ids,rIds);
					$.merge(ids,pIds);
					var expression = _node.expression==''?_node.expression:(';'+_node.expression);
					_node.owners = ids.join(';')+expression;
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
			flowData.platformNo = this.options.platformNo;
			//flowData = {"workflowKey":"LOANERCAR_REG","workflowName":"代步车注册","dataType":"","dataKey1":"docketId","dataKey2":"","dataKey3":"","props":{"initForm":"","dataKey1Desc":"单据ID","dataKey2Desc":"","dataKey3Desc":"","errorProcessNode":"","sendMailWhenFinish":"","finishMailTemplate":""},"items":[{"type":"START","id":"VCTIEVPSJYD","name":"开始","ui":"{\"x\":179,\"y\":61}"},{"type":"USER","id":"VMLQUSGBSID","name":"审批","outerFormUrl":"{”ns“:\"v.views.loanerReg.loanerRegView\",\"isEdit\":false,\"module\":\"workflow/loanerreg\"}","processBean":"","actionType":"","sequential":"false","approveNumber":"","fields":[{"label":"审批内容","name":"COMMENT","value":"","type":"TEXT","required":false},{"label":"会议部门","name":"departments","value":"part1=部门1;part2=部门2;part3=部门3","type":"CHECKBOX","required":false}],"owners":"bwm_100  ","ui":"{\"x\":357,\"y\":125}"},{"type":"END","id":"VUZESENLKZR","name":"结束","ui":"{\"x\":595,\"y\":232}"},{"type":"LINE","id":"VYUTPXKGEZ1","name":"","condition":"","fromNode":"VCTIEVPSJYD","toNode":"VMLQUSGBSID"},{"type":"LINE","id":"VEQ4C7FPEYZ","name":"","condition":"","fromNode":"VMLQUSGBSID","toNode":"VUZESENLKZR"}]}
			if(_nodes.length == 0){
				V.alert('请先设计流程。');
				return;
			}
			return flowData;
		}
		Workflow.prototype.save = function(){
			var flowData = this.getFlowData();
			if(flowData){
				$.ajax({
					url:'workflow/workflow!save.action',
					type:'post',
					data:{workflowJson:JSON.stringify(flowData)},
					success:function(data){
						if(data.result == 'success'){
							V.alert('保存成功！');
			             }else{
			                V.alert(data.msg);
		                 }	
					}
				})
			}
		}
		Workflow.prototype.saveAndDeploy = function(){
			var flowData = this.getFlowData();
			if(flowData){
				$.ajax({
					url:'workflow/workflow!saveAndDeploy.action',
					type:'post',
					data:{workflowJson:JSON.stringify(flowData)},
					success:function(data){
						if(data.result == 'success'){
							V.alert('保存并发布成功！');
			             }else{
			                V.alert(data.msg);
		                 }	
					}
				})
			}
		}
		Workflow.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'工作流设置'}});
		}
	})(V.Classes['v.module.workflow.manage.WorkflowSetting']);
},{plugins:['v.ui.confirm',
            'v.ui.alert',
            'v.component.workflow',
            'v.component.blockForm',
            'v.component.selector.userSelector',
            'v.component.selector.roleSelector',
            'v.component.selector.postSelector',
            'v.views.component.docketTypeSelector',
            'v.fn.util']});
