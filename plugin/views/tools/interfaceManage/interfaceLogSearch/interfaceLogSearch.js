/*
 * 接口管理--接口日志
 */
;V.registPlugin("v.views.tools.interfaceManage.interfaceLogSearch",function(){
    V.Classes.create({
        className:"v.views.tools.interfaceManage.InterfaceLogSearch",
        superClass:"v.views.component.SearchList",
        init:function(){
            this.ns = "v.views.tools.interfaceManage.interfaceLogSearch";
            this.module = '';
            this.form = new V.Classes["v.component.Form"]();
            this.list = new V.Classes['v.ui.Grid']();
        }
    });
    (function(InterfaceLogList){
        InterfaceLogList.prototype.initConditionForm = function(){
        	var that = this;
        	var Form = V.Classes['v.component.Form'];
        	
        	var platformNoList = this.platformNoList = [];
        	
        	$.ajax({
				url : this.module+'/partyList.action',
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
        	
            var items = [
                         {label:'企业代码',type:Form.TYPE.SELECT,name:'platformNo',value:'',multiList:platformNoList},
                         {label:'接口标识',type:Form.TYPE.TEXT,name:'interfaceId',value:''},
                         {label:'消息标识',type:Form.TYPE.TEXT,name:'messageId',value:''},
                         {label:'状态',type:Form.TYPE.SELECT,name:'status',value:'SUCCESS',multiList:[['全部',''],['成功','SUCCESS'],['失败','ERROR']]},
                         {label:'更新时间',type:Form.TYPE.DATERANGE,name:'updateTime',value:V.Util.getDateRange()},
                         {label:'方向',type:Form.TYPE.SELECT,name:'direction',value:'SUCCESS',multiList:[['全部',''],['发送','O'],['接收','I']]},
                         {label:'传输方式',type:Form.TYPE.TEXT,name:'transport',value:''}
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
        InterfaceLogList.prototype.initEvent = function(){
        	var that = this;
        	$('select[name=platformNo]',this.template).change(function(){
             	that.platformNo = $(this).val();
             	DictInfo.platformNo = $(this).val();
             	that.queryPlatformDictInfo(that.platformNo);
            });
        }
        InterfaceLogList.prototype.refreshForm = function(){
        	var that = this;
        	var platformNo = $('select[name=platformNo]',this.template).val();
        	var Form = V.Classes['v.component.Form'];
        	var items = [
                   {label:'企业名称',type:Form.TYPE.SELECT,name:'platformNo',value:platformNo,multiList:this.platformNoList},
                   {label:'接口标识',type:Form.TYPE.TEXT,name:'interfaceId',value:''},
                   {label:'消息标识',type:Form.TYPE.TEXT,name:'messageId',value:''},
                   {label:'状态',type:Form.TYPE.SELECT,name:'status',value:'SUCCESS',multiList:[['全部',''],['成功','SUCCESS'],['失败','ERROR']]},
                   {label:'更新时间',type:Form.TYPE.DATERANGE,name:'updateTime',value:V.Util.getDateRange()},
                   {label:'方向',type:Form.TYPE.SELECT,name:'direction',value:'SUCCESS',multiList:[['全部',''],['发送','O'],['接收','I']]},
                   {label:'传输方式',type:Form.TYPE.TEXT,name:'transport',value:''}
            ];
        	
        	this.form.refresh({colspan:2,items:items});
        	this.initEvent();
        	this.list.setFilters(this.form.getValues());
        	this.list.refresh();
        }
        InterfaceLogList.prototype.initList = function(){
            var list = this.list;
            var pagination = new V.Classes['v.ui.Pagination']();
            list.setPagination(pagination);
            list.setFilters(this.options.filters);
            var that = this;
            
            list.init({
                container:$('.list',this.template),
                checkable:false,
                url:this.module+'/interface-log!list.action',
                columns:[
                    {displayName:'接口标识',key:'interfaceId'}
                    ,{displayName:'消息标识',key:'messageId',width:120}
                    ,{displayName:'状态',key:'status',width:80,render:function(record){
                    	if(record.status=='SUCCESS'){
                    		return '成功';
                    	}else{
                    		return '失败';
                    	}
                    }}
                    ,{displayName:'传输方式',key:'transport',width:80}
                    ,{displayName:'方向',key:'direction',width:80,render:function(record){
                    	if(record.direction=='O'){
                    		return '发送';
                    	}else{
                    		return '接收';
                    	}
                    }}
                    ,{displayName:'消息内容',key:'messagedetail',width:120}
                    ,{displayName:'更新日期',key:'updateTime',width:120}
                    ,{displayName:'操作',key:'action',width:80,render:function(record){
                        var html = $('<div class="action"><a class="view" href="javascript:void(0);" title="查看内容"><i class="icon-search"></i></a><a class="detail" href="javascript:void(0);" title="更多详情"><i class="icon-page_2"></i></a></div>');
                        $('.view',html).click(function(){
                            that.viewInterfaceLogContent(record);
                        });
                        $('.detail', html).click(function(){
                            that.viewInterfaceLogDetail(record);
                        });
                        return html;
                    }}
                ]
            });
        }
        InterfaceLogList.prototype.queryPlatformDictInfoFirst = function(platformNo){
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
        InterfaceLogList.prototype.queryPlatformDictInfo = function(platformNo){
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
        InterfaceLogList.prototype.viewInterfaceLogContent = function(record){
        	var dlg = new V.Classes['v.ui.Dialog']();
		    var con = $('<textarea></textarea>');
		    con.html(record.content);
		    con.css({width:'100%',height:'95%',resize:'none',border:'0 none',background:'#fff none','box-shadow':'none','cursor':'default'});
            con.attr('readOnly',true);
		    dlg.setBtnsBar({
				btns:[
				   {text:'关闭',handler:function(){
						this.close();
					}}
			    ]
		    });
			dlg.setContent(con);
			dlg.init({
				title:'日志内容',
				width:700,
				height:350
			})
        }
        InterfaceLogList.prototype.viewInterfaceLogDetail = function(record){
            var options = {};
            options.container = this.container;
            options.module = this.module;
            options.record = record;
            options.platformNo = this.platformNo;
            this.forward('v.views.tools.interfaceManage.interfaceLogDetail',options,function(p){
            	p.addCrumb();
            });
        }
        InterfaceLogList.prototype.updateCrumb = function(){
            V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'接口日志'}});
        }
        InterfaceLogList.prototype.addCrumb = function(){
            V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'接口日志'}});
        }
    })(V.Classes['v.views.tools.interfaceManage.InterfaceLogSearch'])
},{plugins:["v.ui.grid","v.views.component.searchList","v.ui.pagination","v.views.component.sellerSelector","v.views.component.buyerTaxSelector","v.views.component.sellerTaxSelector"]});
