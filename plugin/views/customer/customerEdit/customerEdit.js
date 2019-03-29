;V.registPlugin("v.views.customer.customerEdit",function(){
	V.Classes.create({
		className:"v.views.customer.CustomerEdit",
		superClass:"v.views.component.CommonDocket",
		init:function(){
            this.ns = "v.views.customer.customerEdit";
			this.ACTION = {
					INIT:'customer!listDocket.action',
					SAVE:'customer!save.action',
					DELETE:'customer!delete.action'
			}
			this.isEdit = true;
		}
	});
	(function(Plugin){
		Plugin.prototype.init = function(options){
			this.subscribe(this,this.EVENT.DOCKETFORM_INITED,function(data){
				var docketType = data.docketType;
				var form = data.form;
				this.chooseBillType(docketType,form);
			});
			Plugin.superclass.init.call(this,options);
		}
		Plugin.prototype.chooseBillType = function(docketType,form){
			var that = this;
			if(docketType == "CUSTOMER_INVOICE_DETAIL"){
				var docketType = "CUSTOMER";
				var _docket = that.docket[docketType];
				var entity = _docket.entity;
				var invoiceType = form.getElement("invoiceType");
				invoiceType.change(function(){
					var invoiceVal = invoiceType.val();
					if(invoiceVal == 3){
						var taxno = form.getElement("taxno");
						taxno.val(entity.partnerCode);
						taxno.attr('disabled',true);
					}else{
						var taxno = form.getElement("taxno");
						taxno.val("");
						taxno.attr('disabled',false);
					}
				});
				var invoiceVal = invoiceType.val();
				if(invoiceVal == 3){
					var taxno = form.getElement("taxno");
					taxno.attr('disabled',true);
				}
			}
		}
		
		Plugin.prototype.chooseType = function(docketType,form)	{
			var that = this;
			if(docketType == "CUSTOMER_ADDRESS_DETAIL"){
				var _transportType = form.getElement("transportType");
				var _whCodeName = form.getElement("whCodeName");
				
				var _saleAreaCode = form.getElement("provinceId");
				var saleAreaCode = _saleAreaCode.val();
				
				$(".sel_level1",form.template).change(function(){
					_transportType.change();
				});
				
				var transportType = _transportType.val();
				
				_transportType.change(function(){
					var transportType = form.getElement("transportType").val();
					var _provinceId = form.getItem('provinceId').plugin;
					var province = _provinceId.getValue();
					if (!province.provinceId) {
						V.alert('请先选择行政区域!');
						return;
					}
					if(transportType == "TRAIN"){
						var url = 'common!stationList.action';
			            V.ajax({
			            	url:url,
			            	async:false,
			               	type:'POST',
			               	data:{saleAreaCode:province.provinceId},
			                success:function(data){//发到站
			                	if(data){
			                		var whCodeNameConfig = form.getItem("whCodeName");
									whCodeNameConfig.type = "HIDDEN";
									var whCodeNameConfig = form.getItem("stationName");
									whCodeNameConfig.type = "SELECT";
									
									form.record = $.extend({},form.record||{},form.getValues());
									form.repaint();
									
									that.chooseType(docketType,form);

									var _stationName = form.getElement("stationName");
									
			                		$.each(data,function(){
			                			
			                			var opt = $('<option regionCode="'+this.code+'" value="'+this.name+'">'+this.name+'</option>');
										if(this.code == form.record.stationCode){
											opt = $('<option regionCode="'+this.code+'" value="'+this.name+'" selected>'+this.name+'</option>');
			                			}
			                			_stationName.append(opt);
			                		})
			                		_stationName.change(function(){
			                			var code = $('option:selected',this).attr('regionCode');
			                			$('[name=stationCode]',form.template).val(code);
			                		});
			                	}
			                }
			            })
					}else if(transportType == "SELF"){
						var url = 'backoffice/systemsetting/warehouse'+'/ware-house!queryWHList.action';
			            $.ajax({
			            	url:url,
			               	type:'POST',
			               	async:false,
			               	data:{saleAreaCode:province.provinceId},
			                success:function(data){
			                	if(data){
			                		var whCodeNameConfig = form.getItem("stationName");
									whCodeNameConfig.type = "HIDDEN";
									var whCodeNameConfig = form.getItem("whCodeName");
									whCodeNameConfig.type = "SELECT";
									
//									form.record = form.getValues();
									form.record = $.extend({},form.record||{},form.getValues());
									form.repaint();
									
									that.chooseType(docketType,form); 
									
									var _whCodeName = form.getElement("whCodeName");
			                		
			                		
			                		$.each(data,function(){
			                			var opt = $('<option regionCode="'+this.whCode+'" value="'+this.whName+'">'+this.whName+'</option>');
			                			if(this.whCode == form.record.whCode){
			                				opt = $('<option regionCode="'+this.whCode+'" value="'+this.whName+'" selected>'+this.whName+'</option>');
			                			}
			                			_whCodeName.append(opt);
			                		})
			                		_whCodeName.change(function(){
			                			var code = $('option:selected',this).attr('regionCode');
			                			$('[name=whCode]',form.template).val(code);
			                		});
			                	}
			                }
			            })
					}
				});

			}
		}
		Plugin.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'详情'}});
		}
		Plugin.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'详情'}});
		}
	})(V.Classes['v.views.customer.CustomerEdit']);
},{plugins:["v.views.component.commonDocket","v.ui.dialog","v.component.blockForm","v.component.area"]})