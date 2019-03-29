;V.registPlugin("v.module.workflow.manage.task",function(){
	V.Classes.create({
		className:"v.module.workflow.manage.Task",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.module.workflow.manage.task';
        	this.module = '';
        	this.task = {
        		actions:['SUBMIT','HISTORY','PRINT','FLOW'],
        		flowId:'',
        		id:'',
        		taskName:'测试任务1',
        		props:{},
        		docketUrl:'v.views.trade.tradeManage.purchaseOrder'
        	};
        	this.TASKACTIONS = {
        		SUBMIT:{
        			text:'提交',
        			icon:'',
        			handler:this.submitTask
        		},
        		HISTORY:{
        			text:'审批历史',
        			icon:'',
        			handler:this.showHistory
        		},
        		PRINT:{
        			text:'打印',
        			icon:'',
        			handler:this.printTask
        		},
        		FLOW:{
        			text:'流程图',
        			icon:'',
        			handler:this.showFlow
        		}
        	}
        	this.template = $("<div>\
        			<div class='toolbar' style='margin:0 0 10px 0;'></div>\
        			<div class='taskForm'></div>\
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
			this.initActionBar();
			this.initTaskForm();
			this.initDocket();
		}
		Task.prototype.initTaskForm = function(){
			var Form = V.Classes['v.component.Form'];
			var form = new Form();
			var props = this.task.props;
			var items = [];
			$.each(props,function(){
				
			});
			items.push({label:'审批意见',name:'comment',type:Form.TYPE.TEXTAREA});
			form.init({
				container:$('.taskForm',this.template),
				items:items,
				colspan:1
			})
			//内部表单
		}
		Task.prototype.initActionBar = function(){
			var actions = this.task.actions;
			var that = this;
			$.each(actions,function(){
				var action = that.TASKACTIONS[this];
				var btn = $("<a href='javascript:void(0);' class='btn btn-small' style='margin-right:10px;'><i class="+action.icon+"></i>"+action.text+"</a>");
				$('.toolbar',this.template).append(btn);
			});
		}
		Task.prototype.initDocket = function(){
			var plugin = this.task.docketUrl;
			var opt = {code:''};
			V.loadPlugin(plugin,function(inst){
				var glass = V._registedPlugins[plugin].glass;
				var inst = new V.Classes[glass]();
				inst.init(opt);
			})
		}
		Task.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'我的任务'}});
		}
		Task.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'我的任务'}});
		}
	})(V.Classes['v.module.workflow.manage.Task']);
},{plugins:['v.component.searchList','v.ui.grid','v.ui.confirm','v.ui.alert',"v.component.fileUpload"]});
