;V.registPlugin("v.views.workflow.history.workflowView",function(){
	V.Classes.create({
		className:"v.views.workflow.history.WorkflowView",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.views.workflow.history.workflowView';
        	this.module = '';
        	this.history = null;
        	this.taskForm = null;
        	this.module='';
        	this.options = {
        		historyId:'',
        		module:''
        	}
        	this.template = $("<div>\
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
			this.historyId = options.historyId;
			for(prop in options){
				this.options[prop] = options[prop];
			}
			var that = this;
			if(this.historyId){
				$.ajax({
					url:'workflow/process-history!input.action',
					data:{historyId:this.historyId},
					success:function(history){
						that.history = history;
						that.initTaskForm();
						that.initDocket();
						that.initHistory();
					}
				})
			}
		}
		Task.prototype.initTaskForm = function(){
			var Form = V.Classes['v.component.Form'];
			var form =  new Form();
			var history = this.history.history;
			var items = [];
			items.push({label:this.getLang("LABEL_PROCESS_CODE"),type:Form.TYPE.READONLY,name:'workflowKey',value:history.workflowKey||''});
			items.push({label:this.getLang("LABEL_PROCESS_NAME"),type:Form.TYPE.READONLY,name:'workflowName',value:history.workflowName||''});
			items.push({label:this.getLang("LABEL_START_TIME"),type:Form.TYPE.READONLY,name:'startTime',value:history.startTime||''});
			items.push({label:this.getLang("LABEL_END_TIME"),type:Form.TYPE.READONLY,name:'endTime',value:history.endTime||''});
			items.push({label:this.getLang("LABEL_CREATE_PERSON"),type:Form.TYPE.READONLY,name:'launcherName',value:history.launcherName||''});
			
			form.init({
				container:$('.taskForm',this.template),
				items:items,
				colspan:2
			})
		}
		
		Task.prototype.initDocket = function(){
			var flowItem = this.history.flowItem;
			var nodeConfig = flowItem.docketCustom;
			
			var docketType = this.docketType = flowItem.docketType;
			var docketCustom = $.parseJSON(nodeConfig);
			var docketConfig = docketCustom[docketType]; //nodeConfig.docketCustom[docketType];
			var url = docketConfig.outerFormUrl;
			var pluginConfig = $.parseJSON(url);
			var plugin = this.plugin = pluginConfig.ns;
			this.isDocketEdit = pluginConfig.isEdit||false;
			var module = pluginConfig.module;

			var variablesOpt = {
				docketType : docketType,
				isFromFlow : true
			};
			
			var opt = {
				docketId : this.history.history.dataKey1,
				container : $('.docket', this.template),
				module : module,
				variables : variablesOpt,
				isEdit:false
			};
			
			V.loadPlugin(plugin,function(inst){
				var glass = V._registedPlugins[plugin].glass;
				var inst = new V.Classes[glass]();
				inst.init(opt);
			})
		}
		
		Task.prototype.initHistory = function(){
			var list = new V.Classes['v.ui.Grid']();
			list.setFilters({historyId:this.history.history.id});
			list.init({
				container:this.template,
				columns:[
				     {displayName:this.getLang("LABEL_TASK_NAME"),key:'nodeName',width:160},
				     {displayName:this.getLang("LABEL_AUDIT_ACTION"),key:'action',width:100,render:function(record){
				    	 return DictInfo.getVar('WF_ACTION')[record.action];
				     }},
				     {displayName:this.getLang("LABEL_AUDIT_TIME"),key:'endTime',width:100},
				     {displayName:this.getLang("LABEL_AUDIT_COMMENT"),key:'comment',width:100},
				     {displayName:this.getLang("LABEL_AUDIT_PERSON"),key:'executorName',width:100}
				],
				url:'workflow/process-history!history.action'
			});
		}
		
		Task.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("LABEL_HISTORY_DETAIL")}});
		}
		Task.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("LABEL_HISTORY_DETAIL")}});
		}
	})(V.Classes['v.views.workflow.history.WorkflowView']);
},{plugins:['v.component.searchList','v.ui.grid','v.ui.confirm','v.ui.alert']});