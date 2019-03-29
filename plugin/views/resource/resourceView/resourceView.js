;V.registPlugin("v.views.resource.resourceView",function(){
	V.Classes.create({
		className:"v.views.resource.ResourceView",
		superClass:"v.views.component.CommonDocket",
		init:function(){
            this.ns = "v.views.resource.resourceView";
			this.ACTION = {
					INIT:'resource!listDocket.action'
			}
			this.isEdit = false;
		}
	});
	(function(List){
		List.prototype.init = function(options){
			List.superclass.init.call(this,options);
		}
		List.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'详情'}});
		}
		List.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'详情'}});
		}
	})(V.Classes['v.views.resource.ResourceView']);
},{plugins:["v.views.component.commonDocket","v.ui.dialog","v.component.blockForm"]})