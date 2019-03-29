;V.registPlugin("v.views.logistics.deliveryConfirm.deliveryConfirmView",function(){
	V.Classes.create({
		className:"v.views.logistics.deliveryConfirm.DeliveryConfirmView",
		superClass:"v.views.component.CommonDocket",
		init:function(){
            this.ns = "v.views.logistics.deliveryConfirm.deliveryConfirmView";
			this.ACTION = {
					INIT:'delivery-coordination!listDocket.action'
			}
			this.isEdit = false;
		}
	});
	(function(List){
		List.prototype.init = function(options){
			List.superclass.init.call(this,options);
		}
		List.prototype.print = function(){
			var form_print = $('#loanerReg_print_form').empty();
			if(form_print.length==0){
				form_print = $('<form action="print!print.action" type="POST" id="loanerReg_print_form" style="display:none"></form>');
				$('body').append(form_print);
			};
			var input = $('<input type="hidden" name="docketId" value='+this.docketId+'>');
			var input1 = $('<input type="hidden" name="docketType" value="loanerReg">');
			form_print.append(input);
			form_print.append(input1);
			form_print[0].submit();
		}
		List.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'详情'}});
		}
		List.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'详情'}});
		}
	})(V.Classes['v.views.logistics.deliveryConfirm.DeliveryConfirmView']);
},{plugins:["v.views.component.commonDocket","v.ui.dialog","v.component.blockForm"]})