;V.registPlugin("v.views.logistics.transferStock.transferStockEdit",function(){
	V.Classes.create({
		className:"v.views.logistics.transferStock.TransferStockEdit",
		superClass:"v.views.component.CommonDocket",
		init:function(){
            this.ns = "v.views.logistics.transferStock.transferStockEdit";
			this.ACTION = {
				INIT:'transfer-stock!listDocket.action',
				SAVE:'transfer-stock!save.action',
				DELETE:'transfer-stock!delete.action'
			}
			this.ACTIONBUTTONS.cancel = {text:'取消',handler:this.cancel};
			this.ACTIONBUTTONS.mainSave = {text:'保存移库单',handler:this.save,callback:function(){
		    	V.alert(CONSTANT.TIP_MESSAGE.SAVE);
		    }};
			this.ACTIONBUTTONS.add = {text:'新增商品',handler:this.add};
			this.isEdit = true;
		}
	});
	(function(LoanerCar){
		LoanerCar.prototype.init = function(options){
			this.subscribe(this,this.EVENT.DOCKETFORM_INITED,function(data){
				var docketType = data.docketType;
				var form = data.form;
				//this.initCustomEvent(docketType,form);
			});
			LoanerCar.superclass.init.call(this,options);
		}
		
		//取消草稿
		LoanerCar.prototype.cancel = function(){
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
				url:this.module+'/transfer-stock!cancelTransferStock.action',
				data:{docket:entity,docketType:docketType,docketId:docketId},
				success:function(data){
					V.unMask(mask);
					if(data.fail){
						V.alert(data.fail);
					}else{
						V.alert('取消成功!');
						V.MessageBus.publish({eventId:'backCrumb'});
					}
					
				},
				error:function(){
					V.unMask(mask);
				}
			})
		}
		//移库保存
//		LoanerCar.prototype.save = function(docketType,cb){
//			var that=this;
//			var _docket = this.docket[docketType];
//			var entity = _docket.entity;
//			var form = _docket.form;
//			if(!form.validate()){
//				return;
//			}
//			var list = _docket.list;
//			var vals = form.getValues();
//			//判断出入库仓库是否相同
//			if(vals.stockoutCode==vals.stockinCode){
//				V.alert("出入库不能相同！");
//				return;
//			}
//			var type = _docket.type;
//			var docketId = '';
//			if(type != this.TYPE.MAIN){
//				docketId = this.docketId;
//			}
//			var that = this;
//			for(prop in vals){
//				entity[prop] = vals[prop];
//			}
//			var info = "是否保存！";
//			V.confirm(info,function ok(e){
//				V.ajax({
//					url:that.module+'/transfer-stock!save.action',
//					data:{docket:entity,docketType:docketType,docketId:docketId},
//					success:function(data){
//						if(data.fail){
//							V.alert(data.fail);
//						}else{
//							V.alert('恭喜您，操作成功!');
//							this.docket = data.result;
//							that.docketId=data.result.id;
//							that.mainDocketId=data.result.id;
//							var _docket = that.docket[docketType];
//							var entity = _docket.entity;
//							entity.id=data.result.id;
//							list&&list.refresh();
//						}
//						cb&&cb();
//					}
//				})
//			});
//	
//		}
		
		//移库明细添加
		LoanerCar.prototype.add = function(){
			var that = this;
			var docket = that.docket[this.mainDocketType];
			var entity = docket.entity;
			var template = $('<div class="v-search"><div class="list_toolbar"></div><div class="filters"><div class="well form-search"></div></div><div class="list"></div></div>');
			var btn_search = $('<button class="btn btn-primary btn-search">搜索</button>');
			var btn_reset = $('<button class="btn btn-reset">重置</button>');
			btn_search.click(function(){
				if(!form.validate()) return;
				sellList.setFilters(form.getValues());
				sellList.retrieveData();
			});
			btn_reset.click(function(){
				form.reset();
			});
			var form = new V.Classes["v.component.Form"](); 
			var Form = V.Classes['v.component.Form'];
			var items = [
				       {label:'商品名称',type:Form.TYPE.TEXT,name:'goodsName',value:''},
				       {label:'品牌名称',type:Form.TYPE.TEXT,name:'brandName',value:''}
				];
			form.init({
				container:$('.form-search',template),
				colspan:2,
				items:items
			});
			$('.form-search',template).append($('<div class="row-fluid btns" style="text-align:center"></div>').append(btn_search).append(btn_reset));
				
			 var sellList = new V.Classes['v.ui.DynamicGrid']();
			 sellList.setFilters(form.getValues());
			 sellList.setPagination(new V.Classes['v.ui.Pagination']());
			 var filterList = {
						companyCode:entity.saleCompCode,
						departmentCode:entity.goodsDeptCode
					}
			 sellList.setFilters(filterList);
			 sellList.init({
	                container: $('.list',template).empty(),
	                checkable:true,
	                isSingleChecked:true,
					url:this.module+'/transfer-stock!initGoods.action'
					 });
			/**Dialog**/
			var addDlg = new V.Classes['v.ui.Dialog']();
			addDlg.setBtnsBar({btns:[{text:'选择',style:"btn-primary",handler:function(){
				var selected = sellList.getCheckedRecords();
				if (selected.length == 0) {
					V.alert('请选择商品!');
					return;
				}
				var ids = [];
				$.each(selected,function(){
					ids.push(this.id);
				});
				  $.ajax({
	            	url:that.module+'/transfer-stock!saveDetailByTransfer.action',
	               	type:'post',
					data: {ids:ids.join(','),parentDocketId:that.docketId},
	                success:function(data){
	                	if (!data.fail) {
	                		var _docket = that.docket[that.currentDocketType];
							var list = _docket.list;
							list.refresh();
	                		addDlg.close();
	                	} else {
	                		V.alert(data.fail);
	                	}
	                }
	            })
			}},{text:'关闭',handler:addDlg.close}]});
			addDlg.init({title:'选择商品',height:500,width:860});
			addDlg.setContent(template);
		}
		LoanerCar.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:"移库申请修改"}});
		}
		LoanerCar.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:"移库申请修改"}});
		}
	})(V.Classes['v.views.logistics.transferStock.TransferStockEdit']);
},{plugins:["v.views.component.commonDocket","v.ui.dialog","v.component.blockForm"]})