;V.registPlugin("v.views.logistics.transport.transportEdit",function(){
	V.Classes.create({
		className:"v.views.logistics.transport.TransportEdit",
		superClass:"v.views.component.CommonDocket",
		init:function(){
            this.ns = "v.views.logistics.transport.transportEdit";
			this.ACTION = {
				INIT:'transport!listDocket.action',
				SAVE:'transport!save.action',
				DELETE:'transport!delete.action'
			}
			this.ACTIONBUTTONS.add = {text:'新增明细',handler:this.add},
			this.ACTIONBUTTONS.addv = {text:'新增承运信息',handler:this.addv},
			this.ACTIONBUTTONS.truckPlan = {text:'装车计划',handler:this.truckPlan},
			this.ACTIONBUTTONS.approve = {text:'提交审批',handler:this.approve}
			this.ACTIONBUTTONS.cancel = {text:'取消',handler:this.cancel}
			this.ACTIONBUTTONS.save = {text:'保存运单',handler:this.save,callback:function(){
		    	V.alert(CONSTANT.TIP_MESSAGE.SAVE);
		    }};
			this.trunkPlanlList = null;
			this.isEdit = true;
			this.isFromFlow = true;
			this.options.isUseBeanShell = false;
		}
	});
	(function(List){
		List.prototype.init = function(options){
			var that = this;
			this.subscribe(this,this.EVENT.DETAILLIST_INITED,function(data){
				var entity = that.docket['TRANSPORT'].entity;
				var docketType = data.docketType;
				if(docketType == "TRANSPORT_ITEMS"){
					var list = data.list;
					var tabpane = list.template.parents('.tab-pane')[0];
					$('.alert',tabpane).hide();
//					if($('.alert',tabpane).length>0){
//						return;
//					}
					for(var i=0;i<list.options.data.length;i++){
						if(entity.transType != 'SELF' && (list.options.data[i].truckNum == 0 || list.options.data[i].applyNum == 0)){
							var msg_alert = $('<div class="alert">\
							  <button type="button" class="close" data-dismiss="alert">&times;</button>\
							  <strong>提醒:</strong> 运输申请单明细中的装车数和申请数量是必填项,请检查!\
							</div>');
							$(tabpane).prepend(msg_alert);
							break;
						}
					}
				}
			});
			List.superclass.init.call(this,options);
		}
		List.prototype.add = function(){
			if(this.docketId){
				var docketType = this.currentDocketType;
				var _docket = this.docket[docketType];
				var _docketMain= this.docket[this.mainDocketType];
				var entity = _docketMain.entity;
				_docket.entity = null;
				this.openDetailDialog(docketType,false,entity);
			}else{
				V.alert(this.getLang("MSG_SAVE_MAIN"));
			}
			
		}
		List.prototype.addv = function(){
			var that = this;
			var options = that.options;
			options.module = that.module;
			var docketType = that.currentDocketType;
			var _docket = that.docket[docketType];
			var _docketMain= that.docket[this.mainDocketType];
			var entity = _docketMain.entity;
			var dlg = new V.Classes['v.ui.Dialog']();
			var con = $('<div class="docket"></div>');
			var dlgForm = null;
			var record = {};
			dlg.setContent(con);
			
			dlg.setBtnsBar({btns:[
				    {text:"确定",style:"btn-primary",handler:function(){
					    
					    var values = dlgForm.getValues();
					    for(key in values){
					    	record[key] = values[key];
					    }
					    if(!dlgForm.validate()){
							return;
						}

					    if(!record['plateNumber'] && (!record['driverName'] || !record['personIdNumber'] || !record['cellphone'])){
					    	V.alert("若车牌号为空，司机姓名、身份证号、手机号为必填");
					    	return;
					    }
					    dlg.close();
						var url = that.module+'/transport!save.action';
			            V.ajax({
			            	url:url,
			               	type:'POST',
			               	data:{docket:record,docketType:docketType,entity:entity},
			                success:function(data){
			                	if(data.fail){
			                		V.alert(data.fail);
			                	}else{
			                		var _docket = that.docket[that.currentDocketType];
									var list = _docket.list;
									list.refresh();
			                	}
			                }
			            })
				    }}
				    ,{text:"关闭",style:"btn-primary",handler:dlg.close}
				]});
						
			dlg.init({
				title:"承运信息",
				width:800,
				height:200
			});
			
			V.ajax({
				url:that.module+'/transport!inputcustom.action',
				dataType:'json',
				data:{docketType:docketType,isEdit:true},
				success:function(docket){
					var custom = docket.custom;
					var data = docket.data||{};
					dlgForm = that.renderForm(custom,data,that.options.docketType,con,false,2);
			   }
			})
		}
		//从表新增明细
		List.prototype.openDetailDialog = function(docketType,readonly,entity){
			var that = this;
			var template = $('<div class="v-search"><div class="list_toolbar"></div><div class="filters"><div class="well form-search"></div></div><div class="list"></div></div>');
			var btn_search = $('<button class="btn btn-primary btn-search">搜索</button>');
			var btn_reset = $('<button class="btn btn-reset">重置</button>');
			btn_search.click(function(){
				if(!form.validate()) return;
				var filters = form.getValues();
				filters.salesOrderCode = entity.salesOrderCode;
				sellList.setFilters(filters);
				sellList.retrieveData();
			});
			btn_reset.click(function(){
				form.reset();
			});
			var form = new V.Classes["v.component.Form"](); 
			var Form = V.Classes['v.component.Form'];
			var items = [
				       //{label:'订单行编码',type:Form.TYPE.TEXT,name:'docketCode',value:''},
				       {label:'订单行ID',type:Form.TYPE.HIDDEN,name:'salesOrderCode',value:entity.salesOrderCode},
				       {label:'商品名称',type:Form.TYPE.TEXT,name:'goodsName',value:''}
				];
			form.init({
				container:$('.form-search',template),
				colspan:2,
				items:items
			});
			$('.form-search',template).append($('<div class="row-fluid btns" style="text-align:center"></div>').append(btn_search).append(btn_reset));
				
			 var sellList = new V.Classes['v.ui.DynamicGrid']();
			 var filters = form.getValues();
			 filters.salesOrderCode = entity.salesOrderCode;
			 sellList.setFilters(filters);
			 sellList.setPagination(new V.Classes['v.ui.Pagination']());
			
			 sellList.init({
	                container:template,
	                checkable:true,
	                isSingleChecked:false,
					url:this.module+'/transport!initSalesOrderDetail.action'
					 });
			/**Dialog**/
			var addDlg = new V.Classes['v.ui.Dialog']();
			addDlg.setBtnsBar({btns:[{text:'选择',style:"btn-primary",handler:function(){
				var selected = sellList.getCheckedRecords();
				if (selected.length == 0) {
					V.alert('请选择');
					return;
				}
				
				  V.ajax({
	            	url:that.module+'/transport!saveTransportBySalesorderDetail.action',
	               	type:'post',
//					data: {docketId:selected[0].id,docket:entity},
	               	data: {salesOrderDetail:selected,docket:entity},
	                success:function(data){
	                	if (data.success=='success') {
	                		addDlg.close();
	                		list.refresh();
						  	that.editDetail(data.result)
	                	} else {
	                		var _docket = that.docket[that.currentDocketType];
							var list = _docket.list;
							list.refresh();
	                		addDlg.close();
	                		V.alert(data.success);
	                	}
	                	
	                }
	            })
				
			}},{text:'关闭',handler:addDlg.close}]});
			addDlg.init({title:'选择销售订单明细',height:592,width:860});
			addDlg.setContent(template);
		}
		//取消草稿
		List.prototype.cancel = function(){
			var that = this;
			var info = "亲,确认取消该运输申请单吗?";
			V.confirm(info,function ok(e){
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
				url:that.module+'/transport!cancelTransport.action',
				data:{docket:entity,docketType:docketType,docketId:docketId},
				success:function(data){
					V.unMask(mask);
					if(data.fail){
						V.alert(data.fail);
					}else{
						V.alert('操作成功!');
						V.MessageBus.publish({eventId:'backCrumb'});
					}
					
				},
				error:function(){
					V.unMask(mask);
				}
			})
			});
		}
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
				url:this.module+'/transport!approve.action',
				data:{docket:entity,docketType:docketType,docketId:docketId},
				success:function(data){
					V.unMask(mask);
					if(data.fail){
						V.alert(data.fail);
					}else{
						V.alert('操作成功!');
						V.MessageBus.publish({eventId:'backCrumb'});
					}
					
				},
				error:function(){
					V.unMask(mask);
				}
			})
		}
		//装车计划
		List.prototype.truckPlan = function(){
			var that = this;
			var docketType = that.currentDocketType
			var _docket = that.docket[docketType];
			var type = _docket.type;
			var docketId = '';
			if(type != that.TYPE.MAIN){
				docketId = that.docketId;
			}
			
			V.ajax({
				url:this.module+'/transport!findVehiclesGoods.action',
				data:{docketType:docketType,parentDocketId:docketId},
				success:function(data){
					if(data.fail){
						V.alert(data.fail);
					}else{
						if (data.status == 'edit') {
							if (!data.goods || !data.vehicles) {
								V.alert("请填加承运信息或者商品");
							} else {
								that.openVehiclesGoods(data);
							}
						} else {
							that.viewVehiclesGoods(data);
						}
					}
					
				}
			})
		}
		List.prototype.viewVehiclesGoods = function(data){ 
			var that = this;
			var datas = data.vehiclesGoods||[];
			var template = $('<div class="v-search"><div class="list"></div></div>');
			var vehicleslList = new V.Classes['v.ui.Grid']();
			/**Dialog**/
			var addDlg = new V.Classes['v.ui.Dialog']();
			addDlg.setBtnsBar({position:'center',btns:[{text:'关闭',handler:addDlg.close}]});
			addDlg.init({title:'装车计划',height:400,width:860});
			addDlg.setContent(template);

			vehicleslList.init({
                container:$('.list',template),
                checkable:false,
                editable:false,
                columns:[
 	                    {displayName:'车辆信息',key:'driverName',width:150,render:function(record){
 	                    	return record.driverName+"("+record.plateNumber+")";
 	                    }},
 	                    {displayName:'商品名称',key:'goodsName',width:250},
 	                    {displayName:'装车数量(吨)',key:'goodsNum',width:80}
 	                ],
 	               data:datas
				 });
		}
		
		List.prototype.openVehiclesGoods = function(data){ 
			var that = this;
			var template = $('<div class="v-search"><div class="list"></div></div>');
			var vehicleslList = this.trunkPlanlList = new V.Classes['v.ui.Grid']();
			/**Dialog**/
			var addDlg = new V.Classes['v.ui.Dialog']();
			addDlg.setBtnsBar({position:'center',btns:[{text:'保存',handler:function(){
				that.saveVehiclesGoods(addDlg,vehicleslList,data.goods);
			}},{text:'关闭',handler:addDlg.close}]});
			addDlg.init({title:'装车计划',height:400,width:860});
			addDlg.setContent(template);
			this.vehiclesGoods(data,addDlg,vehicleslList);
		}
		List.prototype.vehiclesGoods = function(data,addDlg,vehicleslList){ 
			var that = this;
			var datas = data.vehiclesGoods||[];
			if (datas.length ==0) {
				datas.push({id:null,vehiclesId:null,goodsCode:null,goodsName:null,goodsNum:'',plateNumber:null,actualGoodsNum:'',driverName:null});
			}
			var columns = [];
			var vehicles = data.vehicles;
			var goods = data.goods;
			var record;var cols1;var cols2;var cols3;var cols4;var cols4;
			$.each(datas,function(i){
				record=datas[i];
				cols1 = {displayName:'车辆信息',key:'vehiclesId',width:180,render:function(record){
					var optionHtml = "<option></option>";
					$.each(vehicles,function(i){
						var vehicle = vehicles[i]
						if (record.vehiclesId == vehicle.id) {
							optionHtml = optionHtml+'<option value="'+vehicle.id+'" selected>'+vehicle.driverName+'('+vehicle.plateNumber+')</option>';
						} else {
							optionHtml = optionHtml+'<option value="'+vehicle.id+'">'+vehicle.driverName+'('+vehicle.plateNumber+')</option>';
						}
					})
					var html = $('<select name="vehiclesId" style="margin-top:6px">'+optionHtml+'</select><p class="error_msg"></p>');
					html.change(function(){
						var listdata = vehicleslList.options.data;
						var value = this.value;
						record.vehiclesId = this.value;
						$.each(vehicles,function(i){
							var vehicle = vehicles[i];
							if (vehicle.id == value) {
								record.plateNumber = vehicle.plateNumber;
								record.driverName = vehicle.driverName;
							}
						})
						vehicleslList.refresh();
					});
					return html;
				}};
				cols2 = {displayName:'商品名称',key:'goodsCode',width:200,render:function(record){
					var optionHtml = "<option></option>";
					$.each(goods,function(i){
						var good = goods[i]
						if (record.goodsCode == good.goodsCode) {
							optionHtml = optionHtml+'<option value="'+good.goodsCode+'" selected>'+good.goodsName+'</option>';
						} else {
							optionHtml = optionHtml+'<option value="'+good.goodsCode+'">'+good.goodsName+'</option>';
						}
					})
					var html = $('<select name="goodsCode" style="margin-top:6px">'+optionHtml+'</select><p class="error_msg"></p>');
					html.change(function(){
						var listdata = vehicleslList.options.data;
						var value = this.value;
						record.goodsCode = this.value;
						$.each(goods,function(i){
							var good = goods[i];
							if (good.goodsCode == value) {
								record.goodsNum = good.applyNum;
								record.actualGoodsNum = good.applyNum;
								record.goodsName = good.goodsName;
							}
						})
						vehicleslList.refresh();
					});
					return html;
				}};
				cols3 = {displayName:'装车数量(吨)',key:'goodsNum',width:50,render:function(record){
					var html = $('<input type="text" style="width:50px;" value="'+record.goodsNum+'" data-validator="text" data-required="true" /><p class="error_msg"></p>');
					html.change(function(){
						var listdata = vehicleslList.options.data;
						record.goodsNum = this.value;
						vehicleslList.refresh();
					});
					return html;
				}};
				cols4 = {displayName:'实际数量(吨)',key:'actualGoodsNum',width:50,render:function(record){
					var html = $('<input type="text" style="width:50px;" value="'+record.actualGoodsNum+'" data-validator="text" data-required="true" disabled="true" /><p class="error_msg"></p>');
					return html;
				}};
				cols5 ={displayName:'  操作',key:'actions',width:120,render:function(record){
					var actions = $("<div style='text-align:center;'><button  class='btn  btn-mini add'><i class='icon-plus'></i></button><button  class='btn remove btn-mini' style='margin-left:6px;'><i class='icon-minus'></i></button></div>");
					var index = vehicleslList.getRecordIndex(record);
					var prop = {id:null,vehiclesId:null,goodsCode:null,goodsName:null,goodsNum:'',plateNumber:null,actualGoodsNum:'',driverName:null};
					var index = vehicleslList.getRecordIndex(record);
					$('.add',actions).click(function(){
						vehicleslList.options.data.splice(index+1,0,prop);
					    $.each(vehicleslList.options.data,function(index,dom){
					    	dom.sortno = index + 1;
					    })
						vehicleslList.refresh();
					});
					$('.remove',actions).click(function(){
						var size = vehicleslList.options.data.length;
						if(size>1){
							vehicleslList.options.data.splice(index,1);
							$.each(vehicleslList.options.data,function(index,dom){
							    dom.sortno = index + 1;
							})
						    vehicleslList.refresh();
						}
					});
					return actions;
				}};
			})
			columns = [cols1,cols2,cols3,cols4,cols5];
			vehicleslList.init({
				container:$('.list',addDlg.template),
				columns:columns,
				data:datas
			});
		}
		List.prototype.saveVehiclesGoods = function(addDlg,vehicleslList,details){
			var that = this;
			var datas = this.trunkPlanlList.options.data;
			var detail = details[0];
			for (i = 0; i < datas.length; i++) {
				var data = datas[i];
				if (!data.goodsNum || !data.goodsCode || !data.vehiclesId) {
					V.alert('有未填写的装车计划，请检查！');
					return;
				}
			}
			
			
			var docketType = that.currentDocketType
			var _docket = that.docket[docketType];
			var type = _docket.type;
			var docketId = '';
			if(type != that.TYPE.MAIN){
				docketId = that.docketId;
			}
			
			V.ajax({
				url:this.module+'/transport!saveVehiclesGoods.action',
				data:{docketType:docketType,parentDocketId:docketId,details:details,vehiclesGoodsList:datas},
				success:function(data){
					if(data.fail){
						V.alert(data.fail);
					}else{
						addDlg.close();
						V.alert('恭喜您，操作成功！');
					}
					
				}
			})
		}
		List.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_VOUCHER_MSG")}});
		}
		List.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_VOUCHER_MSG")}});
		}
	})(V.Classes['v.views.logistics.transport.TransportEdit']);
},{plugins:["v.views.component.commonDocket","v.ui.dialog","v.component.blockForm","v.ui.confirm"]})