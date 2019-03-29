;V.registPlugin("v.views.logistics.deliveryConfirm.deliveryConfirmEdit",function(){
	V.Classes.create({
		className:"v.views.logistics.deliveryConfirm.DeliveryConfirmEdit",
		superClass:"v.views.component.CommonDocket",
		init:function(){
            this.ns = "v.views.logistics.deliveryConfirm.deliveryConfirmEdit";
			this.ACTION = {
				INIT:'delivery-coordination!listDocket.action',
				SAVE:'delivery-coordination!save.action',
				DELETE:'delivery-coordination!delete.action'
			}
			this.ACTIONBUTTONS.approve = {text:'提交',handler:this.approve}
			this.isEdit = true;
			this.options.isUseBeanShell = false;
		}
	});
	(function(List){
		
		List.prototype.approve = function(){
			var that = this;
			var docketType = that.currentDocketType
			var _docket = that.docket[docketType];
			var entity = _docket.entity;
			var form = _docket.form;
			if(!form.validate()){
				return;
			}
			var list = _docket.list;
			var vals = form.getValues();
			var type = _docket.type;
			var docketId = '';
			if(type != that.TYPE.MAIN){
				docketId = that.docketId;
			}
			for(prop in vals){
				entity[prop] = vals[prop];
			}
			
			var mask = V.mask($('.tab-pane:eq(0)',this.template));
			V.ajax({
				url:this.module+'/delivery-coordination!approve.action',
				data:{docket:entity,docketType:docketType,docketId:docketId},
				success:function(data){
					V.unMask(mask);
					if(data.fail){
						V.alert(data.fail);
					}else{
						V.alert('success!');
						V.MessageBus.publish({eventId:'backCrumb'});
					}
					
				},
				error:function(){
					V.unMask(mask);
				}
			})
		}
		
		List.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_VOUCHER_MSG")}});
		}
		List.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_VOUCHER_MSG")}});
		}
	})(V.Classes['v.views.logistics.deliveryConfirm.DeliveryConfirmEdit']);
},{plugins:["v.views.component.commonDocket","v.ui.dialog","v.component.blockForm"]})