;V.registPlugin("v.views.dataAdapter.dataAdapterEdit",function(){
	V.Classes.create({
		className:"v.views.dataAdapter.DataAdapterEdit",
		superClass:"v.views.component.CommonDocket",
		init:function(){
            this.ns = "v.views.dataAdapter.dataAdapterEdit";
			this.ACTION = {
				INIT:'data-adapter!listDocket.action',
				SAVE:'data-adapter!save.action',
				DELETE:'data-adapter!delete.action'
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
	})(V.Classes['v.views.dataAdapter.DataAdapterEdit']);
},{plugins:["v.views.component.commonDocket","v.ui.dialog","v.component.blockForm"]})