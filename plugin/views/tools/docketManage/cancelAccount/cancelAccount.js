/**
 * 运维工具-取消结算单
 */
;V.registPlugin("v.views.tools.docketManage.cancelAccount",function(){
	V.Classes.create({
		className:"v.views.tools.docketManage.CancelAccount",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = "v.views.tools.docketManage.cancelAccount";
			this.module = '';
			this.platformNoList = [];
			this.businessList = [];
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.views.tools.ui.DynamicGrid']();
		}
	});
	(function(BalanceList){
		BalanceList.prototype.initConditionForm = function(){
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
        	
			this.getBusinessType();
			
		    var Form = V.Classes['v.component.Form'];
		    var items = [
		                   {label:'企业名称',type:Form.TYPE.SELECT,name:'platformNo',value:'',multiList:platformNoList},
					       {label:'结算单号',type:Form.TYPE.TEXT,name:'accountCode',value:''},
					       {label:'购方编码',type:Form.TYPE.PLUGIN,value:'',plugin:'v.views.component.buyerSelector',colspan:1},
					       {label:'经营类型',type:Form.TYPE.SELECT,name:'businessType',value:'',multiList:this.businessList},
					       {label:'销方编码',type:Form.TYPE.PLUGIN,value:'',plugin:'v.views.component.sellerSelector',colspan:1},
					       {label:'匹配状态',type:Form.TYPE.SELECT,name:'matchState',value:'99',multiList:DictInfo.getList('MATCH_STATUS',that.platformNo)},
					       {label:'结算单状态',type:Form.TYPE.SELECT,name:'accountOperateFlag',value:'0',multiList:DictInfo.getList('ACCOUNT_OPERATE_FLAG',that.platformNo)},
					       {label:'创建日期',type:Form.TYPE.DATERANGE,name:'createTime',value:V.Util.getDateRange(),colspan:1,validator:'dateRange'}
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
		BalanceList.prototype.initEvent = function(){
        	var that = this;
        	$('select[name=platformNo]',this.template).change(function(){
             	that.platformNo = $(this).val();
             	DictInfo.platformNo = $(this).val();
             	that.queryPlatformDictInfo(that.platformNo);
            });
        }
		BalanceList.prototype.refreshForm = function(){
        	var that = this;
        	this.getBusinessType();
        	var platformNo = $('select[name=platformNo]',this.template).val();
        	var Form = V.Classes['v.component.Form'];
        	var items = [
                   {label:'企业名称',type:Form.TYPE.SELECT,name:'platformNo',value:platformNo,multiList:this.platformNoList},
			       {label:'结算单号',type:Form.TYPE.TEXT,name:'accountCode',value:''},
			       {label:'购方编码',type:Form.TYPE.PLUGIN,value:'',plugin:'v.views.component.buyerSelector',colspan:1},
			       {label:'经营类型',type:Form.TYPE.SELECT,name:'businessType',value:DictInfo.getDefault('BUSINESS_TYPE',platformNo),multiList:this.businessList},
			       {label:'销方编码',type:Form.TYPE.PLUGIN,value:'',plugin:'v.views.component.sellerSelector',colspan:1},
			       {label:'匹配状态',type:Form.TYPE.SELECT,name:'matchState',value:'99',multiList:DictInfo.getList('MATCH_STATUS',that.platformNo)},
			       {label:'结算单状态',type:Form.TYPE.SELECT,name:'accountOperateFlag',value:'0',multiList:DictInfo.getList('ACCOUNT_OPERATE_FLAG',that.platformNo)},
			       {label:'创建日期',type:Form.TYPE.DATERANGE,name:'createTime',value:V.Util.getDateRange(),colspan:1,validator:'dateRange'}
            ];
        	
        	this.form.refresh({colspan:2,items:items});
        	this.initEvent();
        	this.list.setFilters(this.form.getValues());
        	this.list.refresh();
        }
		//经营类型
		BalanceList.prototype.getBusinessType = function(){
			var businessList = this.businessList = [];
			var that = this;
			$.ajax({
				url : this.module + '/cancel-account!listBusiness.action',
				async:false,
				dataType : 'json',
				data : {platformNo:that.platformNo},
				success : function(data){
					$.each(data.businessList,function(){
						businessList.push([this.value,this.key]);
					});
				}
			});
		}
		BalanceList.prototype.initList = function(){
		    var that = this;
		    var list = this.list;
		    list.setActionColumn({
                displayName: '操作',
                key: 'action',
                width: 80,
                render: function(record){
                    var html = $('<div class="action"><a class="view" href="javascript:void(0);" title="查看明细"><i class="icon-search"></i></a></div>');
                    $('.view',html).click(function(){
                        that.viewBalance(record);
                    });
                    return html;
                }
            });
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			list.setFilters(this.options.filters);
            list.init({
            	platformNo:this.platformNo,
                hasData:true,
				url:this.module+'/cancel-account!list.action',
				columns:[
				    {key:'sellerCode',width:120,render:function(record){
						var html = $('<a href="javascript:void(0);" class="link">'+record.sellerCode+'</a>');
						html.tooltip({
							title:'<p>销方名称：'+record.sellerName+'</p><p>销方税号：'+record.sellerTax+'</p>',
							placement:'bottom',
							html:true,
							animate:true
						});
						return html;
					}},
					{key:'buyerCode',width:120,render:function(record){
                        var html = $('<a href="javascript:void(0);" class="link">'+record.buyerCode+'</a>');
                        html.tooltip({
                            title:'<p>购方名称：'+record.buyerName+'</p><p>购方税号：'+record.buyerTax+'</p>',
                            placement:'bottom',
                            html:true,
                            animate:true
                        });
                        return html;
                    }}
				]
            });
		}
		BalanceList.prototype.queryPlatformDictInfoFirst = function(platformNo){
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
		BalanceList.prototype.queryPlatformDictInfo = function(platformNo){
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
		BalanceList.prototype.viewBalance = function(docket){
            var opt = {
                module : this.module,
                cModule : this.module,
                docketId : docket.id,
                platformNo:this.platformNo
            };
            this.forward('v.views.tools.docketManage.cancelAccountDetail',opt,function(p){
            	p.addCrumb();
            });
        }
		BalanceList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'取消结算单'}});
		}
		BalanceList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'取消结算单'}});
		}
	})(V.Classes['v.views.tools.docketManage.CancelAccount'])
},{plugins:["v.views.tools.ui.dynamicGrid","v.views.component.searchList","v.ui.pagination","v.component.form","v.views.component.buyerSelector","v.views.component.sellerSelector","v.views.component.buyerTaxSelector","v.views.component.sellerTaxSelector","v.views.component.orgRegionSelector","v.views.component.departmentSelector"]});
