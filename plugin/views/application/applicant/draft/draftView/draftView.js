;V.registPlugin("v.views.application.applicant.draft.draftView",function(){
	V.Classes.create({
		className:"v.views.application.applicant.draft.DraftView",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.views.application.applicant.draft.draftView';
        	this.module = '';
        	this.draft = null;
        	this.id = '';
        	this.options = {
        		id:'',
        		module:''
        	}
        	this.template = $("<div class='task todoTask'>\
        			<div class='toolbar' style='margin:0 0 10px 0;'></div>\
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
			this.id = options.id;
			for(prop in options){
				this.options[prop] = options[prop];
			}
			//
			var that = this;
			if(this.id){
				$.ajax({
					url:'workflow/draft/draft!input.action',
					data:{id:this.id},
					success:function(draft){
						that.draft = draft;
						that.initActionBar();
						that.initDocket();
					}
				})
			}
		}
		
		Task.prototype.initActionBar = function(){
//			var that = this;
//			var btn = $("<a href='javascript:void(0);'  class='btn btn-small' style='margin:0 3px;float:right'><i class=''></i>提交申请</a>");
//			btn.click(function(){
//				that.approve();
//			})
//			$('.toolbar',that.template).append(btn);
			
		}
		Task.prototype.initDocket = function(){
			var plugin = this.draft.variables.ns;
			var isEdit = true;
			var module = this.draft.variables.module;
			var opt = {docketId:this.draft.variables.docketId,container:$('.docket',this.tempalte),module:module};
			V.loadPlugin(plugin,function(inst){
				var glass = V._registedPlugins[plugin].glass;
				var inst = new V.Classes[glass]();
				inst.init(opt);
			})
		}
		
		Task.prototype.approve = function(){
			var that = this;
			$.ajax({
				url:'workflow/draft/draft!approve.action',
				data:{id:that.id},
				success:function(data){
					if (data == 'success') {
						V.alert(data);
						V.MessageBus.publish({eventId:'backCrumb'});
					} else {
						V.alert(data);
					}
				}
			})
		}
		
		
		Task.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_MY_DRAFT")}});
		}
		Task.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_MY_DRAFT")}});
		}
	})(V.Classes['v.views.application.applicant.draft.DraftView']);
},{plugins:['v.component.searchList','v.ui.grid','v.ui.confirm','v.ui.alert',"v.component.fileUpload"]});
