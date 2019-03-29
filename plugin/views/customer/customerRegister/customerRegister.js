;V.registPlugin("v.views.customer.customerRegister",function(){
	V.Classes.create({
		className:"v.views.customer.CustomerRegister",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = 'v.views.customer.customerRegister';
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
				width: 120,
				render: function(record){
					var html = {};
					
					html = $('<div class="action"><a class="edit" href="javascript:void(0);" title="'+that.getLang("TIP_EDIT")+'"><i class=" icon-edit"></i></a>\
							<a class="push" href="javascript:void(0);" title="'+that.getLang("TIP_PUSH")+'"><i class=" icon-page_white_get"></i></a>\
							<a class="approve" href="javascript:void(0);" title="'+that.getLang("TIP_PUSH")+'"><i class=" icon-ok"></i></a>\
								<a class="remove" href="javascript:void(0);" title="'+that.getLang("TIP_REMOVE")+'"><i class=" icon-remove"></i></a><div>');
					
					$('.remove', html).click(function(){
						that.remove(record);
					});
					$('.edit', html).click(function(){
						that.editDetail(record);
					});
					$('.push', html).click(function(){
						that.pushCommonPool(record);
					});
					$('.approve', html).click(function(){
						that.approve(record);
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
		    	tools.push({eventId:'add',text:'注册客户',icon:'icon-plus'});
		    	//tools.push({eventId:'remove',text:'批量删除',icon:'icon-remove'});
//		    	tools.push({eventId:'export',text:'导出',icon:'icon-export-excel'});
		    	list.addTools(tools);
		    });
			list.init({
				url: this.module+'/customer!initRegister.action',
				hasData : true,
				sortable:false,
				checkable:false
			});
			this.subscribe(list,'add',this.add);
			//this.subscribe(list,'remove',this.removeSelected);
//			this.subscribe(list,'export',this.exportCoupon);
		}
		
		//导出
        List.prototype.exportCoupon = function(){
			//加提示
			var pagination = this.list.pagination;
			if (pagination.options.count > 20000) {
				V.alert("导出的数据大于2万条，请修改查询条件。");
				return;
			}
			
			var form_print = $('.coupon_export_form',this.template).empty();
			if(form_print.length==0){
			    form_print = $('<form action="export-excel!exportExcel.action" type="POST" class="coupon_export_form" style="display:none"></form>');
			}
			$.each(this.list.filters,function(prop,val){
				var input = $('<input type="hidden" name="'+prop+'" value='+val+'>');
				form_print.append(input);
			});
			var docketType = $('<input type="hidden" name="docketType" value="COUPON">');
			form_print.append(docketType);
			this.template.append(form_print);
			form_print[0].submit();
		}
		List.prototype.editDetail = function(record){
			var options = {};
			options.module = this.module;
			options.record =  record;
			options.code =  record.docketCode;
			options.docketId = record.id;
			options.hasDetail = this.list.hasDetail;
			this.forward('v.views.customer.customerEdit',options,function(inst){
				inst.addCrumb();
			});
		}
		List.prototype.add = function(){
			var options = {};
			options.module = this.module;
			options.hasDetail = this.list.hasDetail;
			this.forward('v.views.customer.customerEdit',options,function(inst){
				inst.addCrumb();
			});
		}
		List.prototype.remove = function(record){
			var that = this;
			var info=this.getLang("MSG_IS_REMOVE");
			V.confirm(info,function ok(e){
				var url = that.module+'/customer!delete.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
	               	data:{ids:record['id'],docketType:'CUSTOMER'},
	                success:function(data){
	                	if(data == 'success'){
	                		that.list.removeRecord(record);
	                		V.alert(that.getLang("MSG_REMOVE_SUCCESS"));
	                	}else{
	                		V.alert(that.getLang("MSG_CONNOT_REMOVE"));
	                	}
	                }
	            })
			});
		}
		List.prototype.pushCommonPool = function(record){
			var that = this;
			var info=this.getLang("MSG_IS_PUSH");
			V.confirm(info,function ok(e){
				var url = that.module+'/customer!pushCommonPool.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
	               	data:{docketId:record['id'],docketType:'CUSTOMER'},
	                success:function(data){
	                	if(data == 'success'){
	                		that.list.removeRecord(record);
	                		V.alert(that.getLang("MSG_PUSH_SUCCESS"));
	                	}else{
	                		V.alert(that.getLang("MSG_CONNOT_PUSH"));
	                	}
	                }
	            })
			});
		}
		List.prototype.getSelectedIds = function(){
			var records = this.list.getCheckedRecords();
			var rec = [];
			for(var i = 0;i<records.length;i++){
				var obj = records[i];
				rec.push(obj['id']);
			}
			return rec;
		}
		List.prototype.removeSelected = function(){
			var that = this;
			var rec = this.getSelectedIds();
			if(rec.length == 0 ){
				V.alert(this.getLang("MSG_CHOOSE_DATA"));
				return;
			}
			V.confirm(this.getLang("MSG_BULK_REMOVE"),function ok(e){
				var records = that.list.getCheckedRecords();
				
				var url = that.module+'/customer!delete.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
					data:{poIds:rec.join(','),docketType:'CUSTOMER'},
	                success:function(data){
	                	if(data == 'success'){
	                		that.list.refresh();
	                		V.alert(that.getLang("MSG_REMOVE_SUCCESS"));
	                	}else{
	                		V.alert(that.getLang("MSG_CHOOSE_UNREMOVE"));
	                	}
	                }
	            })
			});
		}
		List.prototype.approve = function(record){
			var that = this;
			V.ajax({
				url:that.module+'/customer!approve.action',
				data:{docketId:record.id},
				success:function(data){
					if(data.fail){
						V.alert(data.fail);
					}else{
						V.alert('启动审核成功!');
					}
				}
			})
		}
		List.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_CUSTOMER_LIST")}});
		}
		List.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_CUSTOMER_LIST")}});
		}
	})(V.Classes['v.views.customer.CustomerRegister']);
},{plugins:['v.views.component.searchList','v.ui.dynamicGrid','v.ui.confirm','v.ui.alert']});
