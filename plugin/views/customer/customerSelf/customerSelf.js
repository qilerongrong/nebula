;V.registPlugin("v.views.customer.customerSelf",function(){
	V.Classes.create({
		className:"v.views.customer.CustomerSelf",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = 'v.views.customer.customerSelf';
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
					
					html = $('<div class="action"><a class="distribute" href="javascript:void(0);" title="'+that.getLang("TIP_DISTRIBUTE")+'"><i class=" icon-ok"></i></a><div>');
					
					$('.distribute', html).click(function(record){
						that.distribute(record);
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
		    	list.addTools(tools);
		    });
			list.init({
				url: this.module+'/customer!initSelf.action',
				hasData : true,
				sortable:false,
				checkable:false
			});
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
		List.prototype.viewDetail = function(record){
			var options = {};
			options.module = this.module;
			options.docketId = record.id;
			options.hasDetail = this.list.hasDetail;
			this.forward('v.views.customer.customerView',options,function(inst){
				inst.addCrumb();
			});
		}
		List.prototype.distribute = function(record){
			var that = this;
			var form = new V.Classes["v.component.Form"](); 
			var filters = {};
			
			var template = $('<div class="v-search"><div class="list_toolbar"></div><div class="filters"><div class="well form-search"></div></div><div class="list"></div></div>');
			var btn_search = $('<button class="btn btn-primary btn-search">'+this.getLang("BTN_SEARCH")+'</button>');
			var btn_reset = $('<button class="btn btn-reset">'+this.getLang("BTN_RESET")+'</button>');
			btn_search.click(function(){
				if(!form.validate()) return;
				filters = form.getValues();
				filters.roleCode = "silu_market_agent";
				list.setFilters(filters);
				list.retrieveData();
			});
			btn_reset.click(function(){
				form.reset();
			});
			
			var Form = V.Classes['v.component.Form'];
			var items = [
				       {label:this.getLang("LABEL_VIN_NO"),type:Form.TYPE.TEXT,name:'vin',value:''},
				       {label:this.getLang("LABEL_CAR_MODEL"),type:Form.TYPE.TEXT,name:'model',value:''}
				];
			form.init({
				container:$('.form-search',template),
				colspan:2,
				items:items
			});
			$('.form-search',template).append($('<div class="row-fluid btns" style="text-align:center"></div>').append(btn_search).append(btn_reset));
				
			var list = new V.Classes['v.ui.Grid']();
			filters = form.getValues();
			filters.roleCode = "silu_market_agent";
			list.setFilters(filters);
			list.setPagination(new V.Classes['v.ui.Pagination']());
			
			list.init({
	            container:template,
	            checkable:true,
	            isSingleChecked:true,
				url:this.module+'/customer!getUsersByRoleCode.action',
				columns:[
	                {displayName:this.getLang("USER_CODE"),key:'userCode',width:100}
	                ,{displayName:this.getLang("USER_NAME"),key:'userName',width:100}
				]
			});
			
			var addDlg = new V.Classes['v.ui.Dialog']();
			addDlg.setBtnsBar({btns:[{text:this.getLang("BTN_CHOOSE"),style:"btn-primary",handler:function(){
				var selected = list.getCheckedRecords();
				if (selected.length == 0) {
					V.alert(that.getLang("MSG_CHOOSE_LOANER_CAR"));
					return;
				}
				var user = selected[0];
				V.ajax({
	            	url:that.module+'/customer!distributeCustomerSelf.action',
	               	type:'post',
					data: {docketId:docketId,userId:user.id,userName:user.userName},
	                success:function(data){
	                	if (data.fail) {
	                		V.alert(data.fail);
	                	} else {
	                		addDlg.close();
	                		that.editDetail(data.result)
	                	}
	                }
	            })
			}},{text:this.getLang("BTN_CLOSE"),handler:addDlg.close}]});
			addDlg.init({title:this.getLang("TITLE_LOANER_CAR_LIST"),height:520,width:860});
			addDlg.setContent(template);
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
		List.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_CUSTOMER_LIST")}});
		}
		List.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_CUSTOMER_LIST")}});
		}
	})(V.Classes['v.views.customer.CustomerSelf']);
},{plugins:['v.views.component.searchList','v.ui.dynamicGrid','v.ui.confirm','v.ui.alert']});
