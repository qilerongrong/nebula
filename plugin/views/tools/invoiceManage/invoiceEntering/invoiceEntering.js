/*
 * 发票管理--发票处理(发票录入,运维管理)
 */
;V.registPlugin("v.views.tools.invoiceManage.invoiceEntering",function(){
    V.Classes.create({
        className:"v.views.tools.invoiceManage.InvoiceEntering",
        superClass:"v.views.component.SearchList",
        init:function(){
            this.ns = "v.views.tools.invoiceManage.invoiceEntering";
            this.module = '';
            this.platfromNo = '';
            this.platformNoList = [];
            this.form = new V.Classes["v.component.Form"]();
            this.list = new V.Classes['v.ui.DynamicGrid']();
        }
    });
    (function(InvoiceEnteringList){
        InvoiceEnteringList.prototype.initConditionForm = function(){
        	var that = this;
        	
        	var platformNoList = this.platformNoList = [];
        	
        	$.ajax({
				url : 'backoffice/partyList.action',
				async:false,
				dataType : 'json',
				success : function(data){
					$.each(data.result,function(index){
						platformNoList.push([this.partyName,this.platformNo]);
						if(index==0){
							that.queryPlatformDictInfoFirst(this.platformNo);
							that.platformNo = this.platformNo;
						}
					});
				}
			});
        	
        	var itemsFilters = this.options.itemsFilters;
        	if(itemsFilters){
        		this.platformNo = itemsFilters.platformNo; //详情返回带回平台号
        	}
        	
        	var Form = V.Classes['v.component.Form'];
        	
            var items = [
                         {label:'企业代码',type:Form.TYPE.SELECT,name:'platformNo',value:'',multiList:platformNoList},
                         {label:'发票代码',type:Form.TYPE.TEXT,name:'invkind',value:''},
                         {label:'开票日期',type:Form.TYPE.DATERANGE,name:'invdate',value:V.Util.getDateRange()},
                         {label:'发票类型',type:Form.TYPE.SELECT,name:'invtype',value:DictInfo.getDefault('INV_TYPE',that.platformNo),multiList:DictInfo.getList('INV_TYPE',that.platformNo)},
                         {label:'发票税率',type:Form.TYPE.SELECT,name:'invrate',value:DictInfo.getDefault('INV_RATE',that.platformNo),multiList:DictInfo.getList('INV_RATE',that.platformNo)},
                         {label:'购方税号',type:Form.TYPE.PLUGIN,name:'buyererTax',plugin:'v.views.component.buyerTaxSelector',colspan:1},
                         {label:'发票号码',type:Form.TYPE.TEXT,name:'invnum',value:''}
                ];
            
            if(LoginInfo.businessRole.ENTERPRISE == LoginInfo.user.businessRole){
                items.push({label:'销方税号',type:Form.TYPE.PLUGIN,name:'sellerTax',plugin:'v.views.component.sellerTaxSelector',colspan:1});
            }
            
            if(itemsFilters){
                $.each(items,function(m,item){
                	var key = item.plugin||item.name;
                	item.value = itemsFilters[key]||'';
                });
            }
            
            this.form.init({
                colspan:2,
                items:items
            });
            
            this.initEvent();
        };
        InvoiceEnteringList.prototype.initEvent = function(){
        	var that = this;
        	$('select[name=platformNo]',this.template).change(function(){
             	that.platformNo = $(this).val();
             	DictInfo.platformNo = $(this).val();
             	that.queryPlatformDictInfo(that.platformNo);
            });
        }
        InvoiceEnteringList.prototype.refreshForm = function(){
        	var that = this;
        	var platformNo = $('select[name=platformNo]',this.template).val();
        	var Form = V.Classes['v.component.Form'];
        	var items = [
                     {label:'企业代码',type:Form.TYPE.SELECT,name:'platformNo',value:platformNo,multiList:this.platformNoList},
                     {label:'发票代码',type:Form.TYPE.TEXT,name:'invkind',value:''},
                     {label:'开票日期',type:Form.TYPE.DATERANGE,name:'invdate',value:V.Util.getDateRange()},
                     {label:'发票类型',type:Form.TYPE.SELECT,name:'invtype',value:DictInfo.getDefault('INV_TYPE',that.platformNo),multiList:DictInfo.getList('INV_TYPE',that.platformNo)},
                     {label:'发票税率',type:Form.TYPE.SELECT,name:'invrate',value:DictInfo.getDefault('INV_RATE',that.platformNo),multiList:DictInfo.getList('INV_RATE',that.platformNo)},
                     {label:'购方税号',type:Form.TYPE.PLUGIN,name:'buyererTax',plugin:'v.views.component.buyerTaxSelector',colspan:1},
                     {label:'发票号码',type:Form.TYPE.TEXT,name:'invnum',value:''}
            ];
        	if(LoginInfo.businessRole.ENTERPRISE == LoginInfo.user.businessRole){
                items.push({label:'销方税号',type:Form.TYPE.PLUGIN,name:'sellerTax',plugin:'v.views.component.sellerTaxSelector',colspan:1});
            }
        	
        	this.form.refresh({colspan:2,items:items});
        	this.initEvent();
        	this.list.setFilters(this.form.getValues());
        	this.list.refresh();
        }
        InvoiceEnteringList.prototype.initList = function(){
        	var that = this;
            var list = this.list;
            var pagination = new V.Classes['v.ui.Pagination']();
            list.setPagination(pagination);
            list.setFilters(this.options.filters);
            list.setActionColumn({
				displayName: '操作',
				key: 'action',
				width: 50,
				render: function(record){
					 var html = $('<div class="action"><a class="view" href="javascript:void(0);" title="编辑发票"><i class="icon-edit"></i></a><a class="remove" href="javascript:void(0);" title="删除"><i class=" icon-remove"></i></a></div>');
                     $('.view',html).click(function(){
                         that.editInvoice(record);
                     });
                     $('.remove', html).click(function(){
                         that.removeInvoice(record);
                     });
                     return html;
				}
			});            
            list.init({
                container:$('.list',this.template),
                checkable:true,
                url:this.module+'/initInvoiceByPlatformNo.action',
                toolbar:[
                    //{eventId:'add',text:'新增',icon:'icon-plus'},
                    {eventId:'remove',text:'批量删除',icon:'icon-remove'}
                ]
            });
            
            //this.subscribe(list,'add',this.editInvoice)
            this.subscribe(list,'remove',this.removeInvoices)
            
            this.container.append(this.template);
        }
        InvoiceEnteringList.prototype.removeInvoice = function(record){
            var that = this;
            var info="是否删除发票？";
            V.confirm(info,function ok(e){
                var url = that.module+'/deleteInvoice.action';
                $.ajax({
                    url:url,
                    type:'POST',
                    data:JSON.stringify({invoice:record}),
                    contentType:'application/json',
                    success:function(data){
                        if(data.result == 'success'){
                            that.list.removeRecord(record);
                            V.alert(data.msg);
                        }else{
                        	V.alert(data.msg);
                        }
                    }
                })
            });
        }
        InvoiceEnteringList.prototype.removeInvoices = function(){
            var that = this;
            var rec = this.getSelectedIds();
            if(rec.length == 0 ){
                V.alert("请选择数据!");
                return;
            }
            V.confirm("批量删除发票?",function ok(e){
                var url = that.module+'/deleteAllInvoice.action';
                $.ajax({
                    url:url,
                    type:'POST',
                    data:{checkIds:rec.join(',')},
                    success:function(data){
                        if(data.result == 'success'){
                            that.list.refresh();
                            V.alert(data.msg);
                        }else{
                        	V.alert(data.msg);
                        }
                    }
                })
            });
        }
        InvoiceEnteringList.prototype.getSelectedIds = function(){
            var records = this.list.getCheckedRecords();
            var rec = [];
            for(var i = 0;i<records.length;i++){
                var obj = records[i];
                rec.push(obj['id']);
            }
            return rec;
        }
        InvoiceEnteringList.prototype.editInvoice = function(record){
            var options = {};
            options.container = this.container;
            options.module = this.module;
            options.record = record;
            options.platformNo = this.platformNo;
            this.forward('v.views.tools.invoiceManage.invoiceEnteringDetail',options,function(p){
            	p.addCrumb();
            });
        }
        InvoiceEnteringList.prototype.queryPlatformDictInfoFirst = function(platformNo){
        	var that = this;
        	try{
        		var dict = eval('d'+platformNo);
        	}catch(e){
        		$.ajax({
    				url : 'common!queryDictByPlatform.action',
    				async:false,
    				dataType : 'json',
    				data:{platformNo:platformNo},
    				success : function(data){
    					eval(data);
    				}
    			});
        	}
        }
        InvoiceEnteringList.prototype.queryPlatformDictInfo = function(platformNo){
        	var that = this;
        	try{
        		var dict = eval('d'+platformNo);
        		this.refreshForm();
        	}catch(e){
        		$.ajax({
    				url : 'common!queryDictByPlatform.action',
    				async:false,
    				dataType : 'json',
    				data:{platformNo:platformNo},
    				success : function(data){
    					eval(data);
    					that.refreshForm();
    				}
    			});
        	}
        }
        InvoiceEnteringList.prototype.updateCrumb = function(){
            V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'税票处理'}});
        }
        InvoiceEnteringList.prototype.addCrumb = function(){
            V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'税票处理'}});
        }
    })(V.Classes['v.views.tools.invoiceManage.InvoiceEntering'])
},{plugins:["v.ui.dynamicGrid","v.views.component.searchList","v.ui.pagination","v.views.component.sellerSelector","v.views.component.buyerTaxSelector","v.views.component.sellerTaxSelector"]});
