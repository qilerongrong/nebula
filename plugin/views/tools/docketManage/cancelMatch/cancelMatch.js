/*
 * 运维工具--取消匹配单
 */
;V.registPlugin("v.views.tools.docketManage.cancelMatch",function(){
	V.Classes.create({
		className:"v.views.tools.docketManage.CancelMatch",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = "v.views.tools.docketManage.cancelMatch";
			this.module = '';
			this.action = 'match-audit';
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.Grid']();
		}
	});
	(function(CancelMatchList){
		CancelMatchList.prototype.initConditionForm = function(){
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
			           {label:'企业名称',type:Form.TYPE.SELECT,name:'platformNo',value:'',multiList:platformNoList}
				       ,{label:'清单号',type:Form.TYPE.TEXT,name:'matchCode',value:''}
				       ,{label:'匹配时间',type:Form.TYPE.DATERANGE,name:'matchDate',value:V.Util.getDateRange(),colspan:1}
					   ,{label:'购方税号',type:Form.TYPE.PLUGIN,plugin:'v.views.component.buyerTaxSelector',value:''}
					   ,{label:'销方税号',type:Form.TYPE.PLUGIN,plugin:'v.views.component.sellerTaxSelector',value:''}
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
		CancelMatchList.prototype.initEvent = function(){
        	var that = this;
        	$('select[name=platformNo]',this.template).change(function(){
             	that.platformNo = $(this).val();
             	DictInfo.platformNo = $(this).val();
             	that.queryPlatformDictInfo(that.platformNo);
            });
        }
		CancelMatchList.prototype.refreshForm = function(){
        	var that = this;
        	var platformNo = $('select[name=platformNo]',this.template).val();
        	var Form = V.Classes['v.component.Form'];
        	var items = [
                   {label:'企业名称',type:Form.TYPE.SELECT,name:'platformNo',value:platformNo,multiList:this.platformNoList}
			       ,{label:'清单号',type:Form.TYPE.TEXT,name:'matchCode',value:''}
			       ,{label:'匹配时间',type:Form.TYPE.DATERANGE,name:'matchDate',value:V.Util.getDateRange(),colspan:1}
				   ,{label:'购方税号',type:Form.TYPE.PLUGIN,plugin:'v.views.component.buyerTaxSelector',value:''}
				   ,{label:'销方税号',type:Form.TYPE.PLUGIN,plugin:'v.views.component.sellerTaxSelector',value:''}
            ];
        	
        	this.form.refresh({colspan:2,items:items});
        	this.initEvent();
        	this.list.setFilters(this.form.getValues());
        	this.list.refresh();
        }
		//后台定制
		CancelMatchList.prototype.initList = function(){
		    var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			list.setFilters(this.options.filters);
            var that = this;
            list.init({
				container:$('.list',this.template),
				url:this.module+'/cancel-match!list.action',
				checkable:false,
                columns:[
			        {displayName:'清单号',key:'matchCode',width:100}
					,{displayName:'销方编码', key:'sellerCode',width:120,render:function(record){
                        var html = $('<a href="javascript:void(0);" class="link">'+record.sellerCode+'</a>');
                        html.tooltip({
                            title:'<p>销方名称：'+record.sellerName+'</p><p>销方税号：'+record.selltaxno+'</p>',
                            placement:'bottom',
                            html:true,
                            animate:true
                        });
                        return html;
                    }},
                    {displayName:'购方编码', key:'buyerCode',width:120,render:function(record){
                        var html = $('<a href="javascript:void(0);" class="link">'+record.buyerCode+'</a>');
                        html.tooltip({
                            title:'<p>购方名称：'+record.buyerName+'</p><p>购方税号：'+record.buyerTax+'</p>',
                            placement:'bottom',
                            html:true,
                            animate:true
                        });
                        return html;
                    }}
					,{displayName:'状态',key:'matchStatus',width:120,render:function(record){
						return DictInfo.getValue('MATCH_STATUS',record.matchStatus,that.platformNo);
					}}
					,{displayName:'操作',key:'action',width:80,render:function(record){
                        var html = $('<div class="action"><a class="view" href="javascript:void(0);" title="查看"><i class="icon-search"></i></a></div>');
                         $('.view',html).click(function(){
                             that.cancelMatchDetail(record);
                         });
                         return html;
                    }}
				]
            });
		}
		CancelMatchList.prototype.cancelMatchDetail = function(record){
            var opt = {
                module : this.module,
                match  : record
            };
            this.forward('v.views.tools.docketManage.cancelMatchDetail',opt, function(p){
            	p.addCrumb();
            });
        }
		CancelMatchList.prototype.queryPlatformDictInfoFirst = function(platformNo){
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
		CancelMatchList.prototype.queryPlatformDictInfo = function(platformNo){
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
		CancelMatchList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'取消匹配单'}});
		}
		CancelMatchList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'取消匹配单'}});
		}
	})(V.Classes['v.views.tools.docketManage.CancelMatch'])
},{plugins:["v.ui.grid","v.views.component.searchList","v.ui.pagination","v.component.form","v.ui.confirm","v.views.component.buyerSelector","v.views.component.sellerSelector","v.views.component.buyerTaxSelector","v.views.component.sellerTaxSelector","v.views.component.orgRegionSelector","v.views.component.departmentSelector"]});
