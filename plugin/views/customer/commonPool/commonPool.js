;V.registPlugin("v.views.customer.commonPool",function(){
	V.Classes.create({
		className:"v.views.customer.CommonPool",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = 'v.views.customer.commonPool';
			this.module = '';
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.DynamicGrid']();
		}
	});
	(function(List){
		List.prototype.initConditionForm = function(){
			this.initMenuCondition({'tableType':'header'});
		}
		List.prototype.initList = function(){
			var that = this;
			var list = this.list;
			list.setActionColumn({
				displayName: this.getLang("LIST_ACTION"),
				key: 'action',
				width: 100,
				render: function(record){
					var html = {};
					html = $('<div class="action"><a class="view" href="javascript:void(0);" title="'+that.getLang("TIP_SEARCH")+'"><i class=" icon-search"></i></a>\
							<a class="pickup" href="javascript:void(0);" title="'+that.getLang("TIP_PICKUP")+'"><i class=" icon-ok"></i></a><div>');
					$('.view', html).click(function(){
						that.viewDetail(record);
					});
					$('.pickup', html).click(function(){
						that.pickup(record);
					});
					return html;
				}
			});
			var pagination = new V.Classes['v.ui.Pagination']();
		    list.setPagination(pagination);
		    list.setFilters(this.options.filters);
		    this.subscribe(list,list.EVENT.INITED,function(data){
		    	var actions = data.actions;
		    	var tools = [];
//		    	tools.push({eventId:'add',text:'注册客户',icon:'icon-plus'});
		    	//tools.push({eventId:'remove',text:'批量删除',icon:'icon-remove'});
//		    	tools.push({eventId:'export',text:'导出',icon:'icon-export-excel'});
		    	list.addTools(tools);
		    });
			list.init({
				url: this.module+'/customer!initCommonPool.action',
				hasData : true,
				sortable:false,
				checkable:false
			});
//			this.subscribe(list,'add',this.add);
			//this.subscribe(list,'remove',this.removeSelected);
//			this.subscribe(list,'export',this.exportCoupon);
		}
		List.prototype.viewDetail = function(record){
			var options = {};
			options.module = this.module;
			options.record =  record;
			options.code =  record.docketCode;
			options.docketId = record.id;
			options.hasDetail = this.list.hasDetail;
			this.forward('v.views.customer.customerView',options,function(inst){
				inst.addCrumb();
			});
		}
		List.prototype.pickup = function(record){
			var that = this;
			var info=this.getLang("MSG_IS_PICKUP");
			V.confirm(info,function ok(e){
				var url = that.module+'/customer!pickup.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
	               	data:{docketId:record['id'],docketType:'CUSTOMER'},
	                success:function(data){
	                	if(data == 'success'){
	                		that.list.removeRecord(record);
	                		V.alert(that.getLang("MSG_PICKUP_SUCCESS"));
	                	}else{
	                		V.alert(that.getLang("MSG_CONNOT_PICKUP"));
	                	}
	                }
	            })
			});
		}
		List.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_CUSTOMER_LIST")}});
		}
		List.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_CUSTOMER_LIST")}});
		}
	})(V.Classes['v.views.customer.CommonPool']);
},{plugins:['v.views.component.searchList','v.ui.dynamicGrid','v.ui.confirm','v.ui.alert']});
