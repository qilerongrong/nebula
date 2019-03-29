/*
 * 发票管理-发票查询(运维工具)
 */
;V.registPlugin("v.views.tools.invoiceManage.invoiceSearch",function(){
    V.Classes.create({
        className:"v.views.tools.invoiceManage.InvoiceSearch",
        superClass:"v.views.component.SearchList",
        init:function(){
            this.ns = "v.views.tools.invoiceManage.invoiceSearch";
            this.module = '';
            this.platformNo = '';
            this.platformNoList = [];
            this.form = new V.Classes["v.component.Form"]();
            this.list = new V.Classes['v.ui.DynamicGrid']();
        }
    });
    (function(InvoiceList){
        InvoiceList.prototype.initConditionForm = function(){
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
            var items = this.items = [
                       {label:'企业名称',type:Form.TYPE.SELECT,name:'platformNo',value:'',multiList:platformNoList},
                       {label:'发票代码',type:Form.TYPE.TEXT,name:'invkind',value:''},
                       {label:'开票日期',type:Form.TYPE.DATERANGE,name:'invdate',value:V.Util.getDateRange()},
                       {label:'发票号码',type:Form.TYPE.TEXT,name:'invnum',value:''},
                       {label:'入库时间',type:Form.TYPE.DATERANGE,name:'invrecordtime',value:V.Util.getDateRange()},
                       {label:'发票来源',type:Form.TYPE.SELECT,name:'invfrom',value:DictInfo.getDefault('INV_FROM',that.platformNo),multiList:DictInfo.getList('INV_FROM',that.platformNo)},
                       {label:'认证日期',type:Form.TYPE.DATERANGE,name:'invveridate',value:['','']},
                       {label:'认证结果',type:Form.TYPE.SELECT,name:'invresult',value:DictInfo.getDefault('INV_RESULT',that.platformNo),multiList:DictInfo.getList('INV_RESULT',that.platformNo)},
                       {label:'扫描入库日期',type:Form.TYPE.DATERANGE,name:'invscantime',value:['','']},
                       {label:'匹配状态',type:Form.TYPE.SELECT,name:'matchstatus',value:DictInfo.getDefault('MATCH_STATUS',that.platformNo),multiList:DictInfo.getList('MATCH_STATUS',that.platformNo)},
                       {label:'过账日期',type:Form.TYPE.DATERANGE,name:'postDate',value:['','']},
                       {label:'扫描匹配状态',type:Form.TYPE.SELECT,name:'match2Status',value:DictInfo.getDefault('MATCH2_STATUS',that.platformNo),multiList:DictInfo.getList('MATCH2_STATUS',that.platformNo)},
                       {label:'过账状态',type:Form.TYPE.SELECT,name:'postStatus',value:DictInfo.getDefault('POST_STATUS',that.platformNo),multiList:DictInfo.getList('POST_STATUS',that.platformNo)},
                       {label:'发票类型',type:Form.TYPE.SELECT,name:'invtype',value:DictInfo.getDefault('INV_TYPE',that.platformNo),multiList:DictInfo.getList('INV_TYPE',that.platformNo)},
                       {label:'发票税率',type:Form.TYPE.SELECT,name:'invrate',value:DictInfo.getDefault('INV_RATE',that.platformNo),multiList:DictInfo.getList('INV_RATE',that.platformNo)},
                       {label:'购方税号',type:Form.TYPE.PLUGIN,name:'buyerTax',plugin:'v.views.component.buyerTaxSelector',colspan:1},
                       {label:'销方税号',type:Form.TYPE.PLUGIN,name:'sellerTax',plugin:'v.views.component.sellerTaxSelector',colspan:1}
                ];
            
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
        InvoiceList.prototype.initEvent = function(){
        	var that = this;
        	$('select[name=platformNo]',this.template).change(function(){
             	that.platformNo = $(this).val();
             	DictInfo.platformNo = $(this).val();
             	that.queryPlatformDictInfo(that.platformNo);
            });
        }
        InvoiceList.prototype.refreshForm = function(){
        	var that = this;
        	var platformNo = $('select[name=platformNo]',this.template).val();
        	var Form = V.Classes['v.component.Form'];
        	var items = [
                   {label:'企业名称',type:Form.TYPE.SELECT,name:'platformNo',value:platformNo,multiList:this.platformNoList},
                   {label:'发票代码',type:Form.TYPE.TEXT,name:'invkind',value:''},
                   {label:'开票日期',type:Form.TYPE.DATERANGE,name:'invdate',value:V.Util.getDateRange()},
                   {label:'发票号码',type:Form.TYPE.TEXT,name:'invnum',value:''},
                   {label:'入库时间',type:Form.TYPE.DATERANGE,name:'invrecordtime',value:V.Util.getDateRange()},
                   {label:'发票来源',type:Form.TYPE.SELECT,name:'invfrom',value:DictInfo.getDefault('INV_FROM',that.platformNo),multiList:DictInfo.getList('INV_FROM',that.platformNo)},
                   {label:'认证日期',type:Form.TYPE.DATERANGE,name:'invveridate',value:['','']},
                   {label:'认证结果',type:Form.TYPE.SELECT,name:'invresult',value:DictInfo.getDefault('INV_RESULT',that.platformNo),multiList:DictInfo.getList('INV_RESULT',that.platformNo)},
                   {label:'扫描入库日期',type:Form.TYPE.DATERANGE,name:'invscantime',value:['','']},
                   {label:'匹配状态',type:Form.TYPE.SELECT,name:'matchstatus',value:DictInfo.getDefault('MATCH_STATUS',that.platformNo),multiList:DictInfo.getList('MATCH_STATUS',that.platformNo)},
                   {label:'过账日期',type:Form.TYPE.DATERANGE,name:'postDate',value:['','']},
                   {label:'扫描匹配状态',type:Form.TYPE.SELECT,name:'match2Status',value:DictInfo.getDefault('MATCH2_STATUS',that.platformNo),multiList:DictInfo.getList('MATCH2_STATUS',that.platformNo)},
                   {label:'过账状态',type:Form.TYPE.SELECT,name:'postStatus',value:DictInfo.getDefault('POST_STATUS',that.platformNo),multiList:DictInfo.getList('POST_STATUS',that.platformNo)},
                   {label:'发票类型',type:Form.TYPE.SELECT,name:'invtype',value:DictInfo.getDefault('INV_TYPE',that.platformNo),multiList:DictInfo.getList('INV_TYPE',that.platformNo)},
                   {label:'发票税率',type:Form.TYPE.SELECT,name:'invrate',value:DictInfo.getDefault('INV_RATE',that.platformNo),multiList:DictInfo.getList('INV_RATE',that.platformNo)},
                   {label:'购方税号',type:Form.TYPE.PLUGIN,name:'buyerTax',plugin:'v.views.component.buyerTaxSelector',colspan:1},
                   {label:'销方税号',type:Form.TYPE.PLUGIN,name:'sellerTax',plugin:'v.views.component.sellerTaxSelector',colspan:1}
            ];
        	
        	this.form.refresh({colspan:2,items:items});
        	this.initEvent();
        	this.list.setFilters(this.form.getValues());
        	this.list.refresh();
        }
        InvoiceList.prototype.initList = function(){
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
					var html = $('<div class="action"><a class="view" href="javascript:void(0);" title="查看详情"><i class="icon-search"></i></a></div>');
                    $('.view',html).click(function(){
                        that.viewInvoice(record);
                    });
                    return html;
				}
			});
            list.init({
                container:$('.list',this.template),
                checkable:false,
                url:this.module+'/initInvoiceByPlatformNo.action',
                toolbar:[{eventId:'export',icon:'icon-export-excel',text:'导出发票'}]
            });
            this.subscribe(list,'export',this.exportDockets);
            this.container.append(this.template);
        }
        InvoiceList.prototype.viewInvoice = function(record){
           	var docket_detail = new V.Classes["v.views.component.DocketDetailViewer"]();
			docket_detail.init({
				docketType:CONSTANT.DOCKET_TYPE.INVOICE,
				module:this.module,
				docketId:record.id
			});
        }
        InvoiceList.prototype.queryPlatformDictInfoFirst = function(platformNo){
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
        InvoiceList.prototype.queryPlatformDictInfo = function(platformNo){
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
        InvoiceList.prototype.exportDockets = function(){
        	//加提示
			var pagination = this.list.pagination;
			if (pagination.options.count > 20000) {
				V.alert("导出的数据大于2万条，请修改查询条件。");
				return;
			}
			var form_print = $('.docket_export_form',this.template).empty();
			if(form_print.length==0){
			    form_print = $('<form action="'+this.module+'/export.action" type="POST" class="docket_export_form" style="display:none"></form>');
			}
			this.list.filters.platformNo = this.platformNo;
			$.each(this.list.filters,function(prop,val){
				var input = $('<input type="hidden" name="'+prop+'" value='+val+'>');
				form_print.append(input);
			});
			form_print.append('<input type="hidden" name="docketType" value='+CONSTANT.DOCKET_TYPE.INVOICE+'>')
			this.template.append(form_print);
			form_print[0].submit();
		}
        InvoiceList.prototype.updateCrumb = function(){
            V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'税票查询'}});
        }
        InvoiceList.prototype.addCrumb = function(){
            V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'税票查询'}});
        }
    })(V.Classes['v.views.tools.invoiceManage.InvoiceSearch'])
},{plugins:["v.ui.dynamicGrid","v.views.component.docketDetailViewer","v.views.component.searchList","v.views.component.sellerSelector","v.views.component.buyerTaxSelector","v.views.component.sellerTaxSelector"]});
