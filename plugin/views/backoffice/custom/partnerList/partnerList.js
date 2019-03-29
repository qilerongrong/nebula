;V.registPlugin("v.views.backoffice.custom.partnerList",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.PartnerList",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = "v.views.backoffice.custom.partnerList";
			this.module = '';
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.Grid']();
		}
	});
	(function(partnerList){
		 partnerList.prototype.initConditionForm = function(){
			    var Form = V.Classes['v.component.Form'];
				var items = [
					       {label:'供应商编码',type:Form.TYPE.TEXT,name:'partnerCode',value:''},
					       {label:'供应商名称',type:Form.TYPE.TEXT,name:'partnerName',value:''}
					];
				var itemsFilters = this.options.itemsFilters;
	            if(itemsFilters){
	                $.each(items,function(m,item){
	                	var key = item.plugin||item.name;
	                	item.value = itemsFilters[key]||'';
	                });
	            }
				this.form.init({
					colspan:3,
					items:items
				});
		}
		partnerList.prototype.initList = function(){
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			list.setFilters(this.options.filters);
			var that = this;
            list.init({
                container : $('.list', this.template),
                checkable:true,
				url:this.module+'/partner!list.action',
                columns:[
                    {displayName:'供应商编码',key:'partnerCode',width:140}
                    ,{displayName:'供应商名称',key:'partnerName',width:220}
                    //,{displayName:'成立时间',key:'createTime',width:100}
                    ,{displayName:'状态',key:'isUsed',width:40,render:function(record){
                    	if(record.isUsed=='1'){
                    		return "停用";
                    	}else{
                    		return "在用";
                    	}
                    }}
                    ,{displayName:'操作',key:'action',width:100,render:function(record){
                    	var status = '';
						var icon = "icon-ban-circle";
                    	if(record.isUsed == '1'){
                    		status = '启用';
                    	} else{
                    		status = '停用';
							icon = "icon-ok-circle";
                    	}
                        var html = $('<div class="action"><a class="lock" href="javascript:void(0);" style="margin:0 8px;" title='+status+'><i class="'+icon+'"></i></a><a class="change" href="javascript:void(0);" style="margin:0 8px;" title="修改"><i class="icon-edit"></i></a><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a></div>');
                        $('.change',html).click(function(){
                           that.editPartner(record);
                        });
                        $('.remove',html).click(function(){
                           that.removePartner(record);
                        });
                        $('.lock',html).click(function(){
                        	that.lockPartner(record);
                        });
                        return html;
                    }}
                ],
                toolbar:[
			          {eventId:'add',text:'新增供应商',icon:'icon-plus'}
			          ,{eventId:'export',text:'导出供应商',icon:'icon-export-excel'}
			          /*,{eventId:'remove',text:'删除供应商',icon:'icon-remove'}*/
				]
            });
            this.subscribe(list,'add',this.addPartner);
            this.subscribe(list,'export',this.exportPartner);
			//this.subscribe(list,'remove',this.removeBatchPartner);
            this.container.append(this.template);
        };
        partnerList.prototype.lockPartner = function(record){
        	var that = this;
 			var url = this.module+'/partner!lockPartner.action';
 			var alertMsg="确定启用供应商？";
 			if(record.isUsed != '1'){
 				alertMsg="确定停用供应商？";
 			}
			V.confirm(alertMsg,function(){
 				$.ajax({
	            	url:url,
	               	type:'POST',
					data:{partnerId:record.id},
	                success:function(data){
	                     if(data.msg=='success'){
	                     	that.list.refresh();
	                     }else{
	                     	V.alert(data.info);
	                     }
	                }
	            })
 			});	
        }
        /**添加交易伙伴**/
         partnerList.prototype.addPartner = function(){
        	var options = {};
			options.module = this.module;
        	this.forward("v.views.backoffice.custom.partner",options,function(p){
        		p.addCrumb();
        	});
        }
        partnerList.prototype.editPartner = function(record){
        	var options = {};
			options.module = this.module;
			options.record = record;
        	this.forward("v.views.backoffice.custom.partnerEdit",options,function(p){
        		p.addCrumb();
        	});
        }
        partnerList.prototype.removePartner = function(record){
        	var that = this;
        	V.confirm('确定删除供应商？',function(){
        	 $.ajax({
            	url:that.module+'/partner!delete.action',
               	type:'post',
				data:JSON.stringify({partner:record}),
				contentType:'application/json',
                success:function(data){
                   if(data=='success'){
						V.alert("供应商删除成功!");
						that.list.removeRecord(record);
				   }else{
	                 	V.alert(data);
	               }
                }
        	 })
        	})
        }
        partnerList.prototype.removeBatchPartner = function(record){
        	var that = this;
        	var selected = that.list.getCheckedRecords();
        	if(selected.length == 0){
				V.alert("请选择供应商记录！");
				return;
			}
        	var ids="";
        	$.each(selected,function(){
				ids +=this.id+",";
			})
			V.confirm('确定删除所选供应商？',function(){
        	 $.ajax({
            	url:that.module+'/partner!deleteAll.action',
               	type:'post',
				data:{partnerIds: ids},
                success:function(data){
                   if(data=='success'){
                	   	that.list.refresh();
				   }else{
	                 	V.alert(data);
	               }
                }
              })
			})
        }
        //导出
        partnerList.prototype.exportPartner = function(){
			//加提示
			var pagination = this.list.pagination;
			if (pagination.options.count > 20000) {
				V.alert("导出的数据大于2万条，请修改查询条件。");
				return;
			}
			
			var form_print = $('.partner_export_form',this.template).empty();
			if(form_print.length==0){
			    form_print = $('<form action="'+this.module+'/partner!export.action" type="POST" class="partner_export_form" style="display:none"></form>');
			}
			$.each(this.list.filters,function(prop,val){
				var input = $('<input type="hidden" name="'+prop+'" value='+val+'>');
				form_print.append(input);
			});
			this.template.append(form_print);
			form_print[0].submit();
		}
		partnerList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'供应商列表'}});
		}
	})(V.Classes['v.views.backoffice.custom.PartnerList'])
},{plugins:['v.views.component.searchList',"v.ui.grid","v.ui.dialog","v.ui.pagination"]});