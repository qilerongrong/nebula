;V.registPlugin("v.views.commonDocket.commonDocketEdit",function(){
	V.Classes.create({
		className:"v.views.commonDocket.CommonDocketEdit",
		superClass:"v.views.component.CommonDocket",
		init:function(){
            this.ns = "v.views.commonDocket.commonDocketEdit";
			this.isEdit = true;
		}
	});
	(function(CommonDocketClass){
		CommonDocketClass.prototype.init = function(options){
			CommonDocketClass.superclass.init.call(this,options);
		}
		CommonDocketClass.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:"单据编辑"}});
		}
		CommonDocketClass.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:"单据编辑"}});
		}
	})(V.Classes['v.views.commonDocket.CommonDocketEdit']);
},{plugins:["v.views.component.commonDocket"]})