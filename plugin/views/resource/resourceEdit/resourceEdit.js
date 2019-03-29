;V.registPlugin("v.views.resource.resourceEdit",function(){
	V.Classes.create({
		className:"v.views.resource.ResourceEdit",
		superClass:"v.views.component.CommonDocket",
		init:function(){
            this.ns = "v.views.resource.resourceEdit";
			this.ACTION = {
				INIT:'resource!listDocket.action',
				SAVE:'resource!save.action',
				DELETE:'resource!delete.action'
			}
			this.isEdit = true;
		}
	});
	(function(List){
		
		List.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_VOUCHER_MSG")}});
		}
		List.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_VOUCHER_MSG")}});
		}
	})(V.Classes['v.views.resource.ResourceEdit']);
},{plugins:["v.views.component.commonDocket","v.ui.dialog","v.component.blockForm"]})