;V.registPlugin("v.views.commonDocket.commonDocketView",function(){
	V.Classes.create({
		className:"v.views.commonDocket.CommonDocketView",
		superClass:"v.views.component.CommonDocket",
		init:function(){
            this.ns = "v.views.commonDocket.commonDocketView";
			this.isEdit = false;
		}
	});
	(function(CommonDocketClass){
		CommonDocketClass.prototype.init = function(options){
			CommonDocketClass.superclass.init.call(this,options);
		}
		CommonDocketClass.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:"单据详细"}});
		}
		CommonDocketClass.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:"单据详细"}});
		}
	})(V.Classes['v.views.commonDocket.CommonDocketView']);
},{plugins:["v.views.component.commonDocket"]})