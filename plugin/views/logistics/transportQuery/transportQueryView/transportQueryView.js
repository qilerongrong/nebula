;V.registPlugin("v.views.logistics.transportQuery.transportQueryView",function(){
	V.Classes.create({
		className:"v.views.logistics.transportQuery.TransportQueryView",
		superClass:"v.views.component.CommonDocket",
		init:function(){
            this.ns = "v.views.logistics.transportQuery.transportQueryView";
			this.ACTION = {
					INIT:'transport!listDocket.action'
			}
			this.ACTIONBUTTONS.truckPlan = {text:'装车计划',handler:this.truckPlan},
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
						that.openVehiclesGoods(data);
					}
					
				}
			})
		}
		
		List.prototype.openVehiclesGoods = function(data){ 
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
		List.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'详情'}});
		}
		List.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'详情'}});
		}
	})(V.Classes['v.views.logistics.transportQuery.TransportQueryView']);
},{plugins:["v.views.component.commonDocket","v.ui.dialog","v.component.blockForm"]})