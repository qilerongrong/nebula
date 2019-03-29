/**
 * 运维工具-修改税号
 */
;V.registPlugin("v.views.tools.docketManage.modifyTaxNo",function(){
	V.Classes.create({
		className:"v.views.tools.docketManage.ModifyTaxNo",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = "v.views.tools.docketManage.modifyTaxNo";
			this.module = '';
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.Grid']();
		}
	});
	(function(pluginClass){
		pluginClass.prototype.initConditionForm = function(){
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
			           {label:'企业名称',type:Form.TYPE.SELECT,name:'platformNo',value:'',multiList:platformNoList},
				       {label:'供应商编码',type:Form.TYPE.TEXT,name:'partnerCode',value:''},
				       {label:'供应商名称',type:Form.TYPE.TEXT,name:'partnerName',value:''}
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
		}
		pluginClass.prototype.initEvent = function(){
        	var that = this;
        	$('select[name=platformNo]',this.template).change(function(){
             	that.platformNo = $(this).val();
             	DictInfo.platformNo = $(this).val();
             	that.queryPlatformDictInfo(that.platformNo);
            });
        }
		pluginClass.prototype.refreshForm = function(){
	        	var that = this;
	        	var platformNo = $('select[name=platformNo]',this.template).val();
	        	var Form = V.Classes['v.component.Form'];
	        	var items = [
	                   {label:'企业名称',type:Form.TYPE.SELECT,name:'platformNo',value:platformNo,multiList:this.platformNoList},
	                   {label:'供应商编码',type:Form.TYPE.TEXT,name:'partnerCode',value:''},
				       {label:'供应商名称',type:Form.TYPE.TEXT,name:'partnerName',value:''}
	            ];
	        	
	        	this.form.refresh({colspan:2,items:items});
	        	this.initEvent();
	        	this.list.setFilters(this.form.getValues());
	        	this.list.refresh();
	        }
		pluginClass.prototype.initList = function(){
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			list.setFilters(this.options.filters);
			var that = this;
            list.init({
                container : $('.list', this.template),
                checkable:false,
				url:this.module+'/modify-taxno!list.action',
                columns:[
                    {displayName:'供应商编码',key:'partnerCode',width:140}
                    ,{displayName:'供应商名称',key:'partnerName',width:220}
                    ,{displayName:'状态',key:'isUsed',width:40,render:function(record){
                    	if(record.isUsed=='1'){
                    		return "停用";
                    	}else{
                    		return "在用";
                    	}
                    }}
                    ,{displayName:'操作',key:'action',width:100,render:function(record){
                        var html = $('<div class="action"><a class="change" href="javascript:void(0);" title="修改税号"><i class="icon-edit"></i></a><a class="resetpw" href="javascript:void(0);" title="重置密码"><i class="icon-edit"></i></a><a class="search" href="javascript:void(0);" title="查看"><i class="icon-search"></i></a></div>');
                        $('.change',html).click(function(){
                           that.modifyPartnerTaxno(record);
                        });
                        $('.resetpw',html).click(function(){
                           that.resetPassword(record);
                        });
                        $('.search',html).click(function(){
                           that.searchPartner(record);
                        });
                        
                        return html;
                    }}
                ]
            });
        };
        pluginClass.prototype.searchPartner = function(record){
        	var options = {};
			options.module = this.module;
			options.record = record;
			options.platformNo = this.platformNo;
        	this.forward("v.views.tools.docketManage.partnerDetail",options,function(p){
        		p.addCrumb();
        	});
        }
        
        //重置密码
        pluginClass.prototype.resetPassword = function(record) {
        	var that = this;
        	var dlg = new V.Classes['v.ui.Dialog']();
		    var con = $('<div></div>');
			
		    var form = new V.Classes['v.component.Form']();
		    var Form = V.Classes['v.component.Form'];
            var items = [
                       {label:'密码',type:Form.TYPE.PASSWORD,name:'newpassword',value:'',required:true},
                       {label:'重复密码',type:Form.TYPE.PASSWORD,name:'repassword',value:'',required:true}
                ];
            
            form.init({
                colspan:1,
                items:items,
                container:con
            });
            
			dlg.setBtnsBar({
				btns:[
				   {text:'确定',style:'btn-primary',handler:function(){
					   if(!form.validate()) return;
					   var newpassword = $('*[name=newpassword]',con).val();
					   var repassword = $('*[name=repassword]',con).val();
					   if(newpassword!=repassword){
						   V.alert('密码不一致，请重新输入！');
						   return;
					   }
					   
						$.ajax({
							url:that.module+'/modify-taxno!resetpw.action',
							type:'post',
							data: {id:record.id,password:newpassword},
							success:function(data){
								if(data=='success'){
									V.alert('重置密码结果成功！');
									dlg.close();
									that.list.refresh();
								}
								else
									V.alert(data);
							}
						})
					}}
				    ,{text:'取消',handler:function(){
						this.close();
					}}
			    ]
		    });
			dlg.setContent(con);
			dlg.init({
				title:'重置密码',
				width:500,
				height:350
			})
        };
        pluginClass.prototype.modifyPartnerTaxno = function(record){
        	var that = this;
        	var dlg = new V.Classes['v.ui.Dialog']();
		    var con = $('<div></div>');
			
		    var form = new V.Classes['v.component.Form']();
		    var Form = V.Classes['v.component.Form'];
            var items = [
                       {label:'税号',type:Form.TYPE.READONLY,name:'taxno',value:record['taxno']},
                       {label:'新税号',type:Form.TYPE.TEXT,name:'newtaxno',value:'',required:true},
                       {label:'确认税号',type:Form.TYPE.TEXT,name:'confirmtaxno',value:'',required:true}
                ];
            
            form.init({
                colspan:1,
                items:items,
                container:con
            });
            
			dlg.setBtnsBar({
				btns:[
				   {text:'修改',style:'btn-primary',handler:function(){
					   if(!form.validate()) return;
					   var oldTaxno = $('*[name=taxno]',con).text();
					   var newTaxno = $('*[name=newtaxno]',con).val();
					   var confirmTaxno = $('*[name=confirmtaxno]',con).val();
					   /*if(oldTaxno==newTaxno){
						   V.alert('旧税号和新税号一致，请重新输入新税号！');
						   return;
					   }else */
					   if(newTaxno!=confirmTaxno){
						   V.alert('新税号和确认税号不一致，请重新输入！');
						   return;
					   }
					   
						$.ajax({
							url:that.module+'/modify-taxno!modify.action',
							type:'post',
							data: {id:record.id,oldTaxno:oldTaxno,newTaxno:newTaxno},
							success:function(data){
								if(data=='success'){
									V.alert('修改税号结果成功！');
									dlg.close();
									that.list.refresh();
								}
								else
									V.alert(data);
							}
						})
					}}
				    ,{text:'取消',handler:function(){
						this.close();
					}}
			    ]
		    });
			dlg.setContent(con);
			dlg.init({
				title:'修改税号',
				width:500,
				height:350
			})
        }
        pluginClass.prototype.queryPlatformDictInfoFirst = function(platformNo){
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
        pluginClass.prototype.queryPlatformDictInfo = function(platformNo){
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
		pluginClass.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'修改税号'}});
		}
	})(V.Classes['v.views.tools.docketManage.ModifyTaxNo'])
},{plugins:['v.views.component.searchList',"v.ui.grid","v.ui.dialog","v.ui.pagination"]});