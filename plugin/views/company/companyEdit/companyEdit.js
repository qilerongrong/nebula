;V.registPlugin("v.views.company.companyEdit",function(){
	V.Classes.create({
		className:"v.views.company.CompanyEdit",
		superClass:"v.views.component.CommonDocket",
		init:function(){
            this.ns = "v.views.company.companyEdit";
			this.ACTION = {
				INIT:'company!listDocket.action',
				SAVE:'company!save.action',
				DELETE:'company!delete.action'
			}
			this.ACTIONBUTTONS.approve = {text:'提交',handler:this.approve}
			this.isEdit = true;
			this.options.isUseBeanShell = false;
		}
	});
	(function(List){
		List.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_VOUCHER_MSG")}});
		}
		List.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_VOUCHER_MSG")}});
		}
	})(V.Classes['v.views.company.CompanyEdit']);
},{plugins:["v.views.component.commonDocket","v.ui.dialog","v.component.blockForm"]})