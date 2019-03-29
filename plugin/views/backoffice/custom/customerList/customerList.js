;V.registPlugin("v.views.backoffice.custom.customerList",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.CustomerList",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = "v.views.backoffice.custom.customerList";
			this.module = '';
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.Grid']();
		}
	});
	(function(PluginClass){
		 PluginClass.prototype.initConditionForm = function(){
			    var Form = V.Classes['v.component.Form'];
				var items = [
					       {label:'客户编码',type:Form.TYPE.TEXT,name:'code',value:''},
					       {label:'客户名称',type:Form.TYPE.TEXT,name:'name',value:''}
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
		PluginClass.prototype.initList = function(){
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			list.setFilters(this.options.filters);
			var that = this;
            list.init({
                container : $('.list', this.template),
                checkable:true,
				url:this.module+'/customer!list.action',
                columns:[
                    {displayName:'客户编码',key:'code',width:140}
                    ,{displayName:'客户名称',key:'name',width:220}
                    ,{displayName:'操作',key:'action',width:100,render:function(record){
                        var html = $('<div class="action"><a class="change" href="javascript:void(0);" style="margin:0 8px;" title="修改"><i class="icon-edit"></i></a>\
										<a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a></div>');
                        $('.change',html).click(function(){
                           that.editCustomer(record);
                        });
                        $('.remove',html).click(function(){
                           that.removeCustomer(record);
                        });
                        return html;
                    }}
                ],
                toolbar:[
			          {eventId:'add',text:'新增客户',icon:'icon-plus'}
			          ,{eventId:'export',text:'导出客户',icon:'icon-export-excel'}
				]
            });
            this.subscribe(list,'add',this.addCustomer);
            this.subscribe(list,'export',this.exportCustomer);
            this.container.append(this.template);
        };
         PluginClass.prototype.addCustomer = function(){
        	var options = {};
			options.module = this.module;
        	this.forward("v.views.backoffice.custom.customer",options,function(p){
        		p.addCrumb();
        	});
        }
        PluginClass.prototype.editCustomer = function(record){
        	var options = {};
			options.module = this.module;
			options.record = record;
        	this.forward("v.views.backoffice.custom.customerEdit",options,function(p){
        		p.addCrumb();
        	});
        }
        PluginClass.prototype.removeCustomer = function(record){
        	var that = this;
        	V.confirm('确定删除客户？',function(){
        	 $.ajax({
            	url:that.module+'/customer!delete.action',
               	type:'post',
				data:JSON.stringify({customer:record}),
				contentType:'application/json',
                success:function(data){
                   if(data=='success'){
						V.alert("客户删除成功!");
						that.list.removeRecord(record);
				   }else{
	                 	V.alert(data);
	               }
                }
        	 })
        	})
        }
        PluginClass.prototype.removeBatchCustomer = function(record){
        	var that = this;
        	var selected = that.list.getCheckedRecords();
        	if(selected.length == 0){
				V.alert("请选择客户记录！");
				return;
			}
        	var ids="";
        	$.each(selected,function(){
				ids +=this.id+",";
			})
			V.confirm('确定删除所选客户？',function(){
        	 $.ajax({
            	url:that.module+'/customer!deleteAll.action',
               	type:'post',
				data:{CustomerIds: ids},
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
        PluginClass.prototype.exportCustomer = function(){
			//加提示
			var pagination = this.list.pagination;
			if (pagination.options.count > 20000) {
				V.alert("导出的数据大于2万条，请修改查询条件。");
				return;
			}
			
			var form_print = $('.customer_export_form',this.template).empty();
			if(form_print.length==0){
			    form_print = $('<form action="'+this.module+'/customer!export.action" type="POST" class="customer_export_form" style="display:none"></form>');
			}
			$.each(this.list.filters,function(prop,val){
				var input = $('<input type="hidden" name="'+prop+'" value='+val+'>');
				form_print.append(input);
			});
			this.template.append(form_print);
			form_print[0].submit();
		}
		PluginClass.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'客户列表'}});
		}
	})(V.Classes['v.views.backoffice.custom.CustomerList'])
},{plugins:['v.views.component.searchList',"v.ui.grid","v.ui.dialog","v.ui.pagination"]});