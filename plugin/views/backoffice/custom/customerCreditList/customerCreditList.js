;V.registPlugin("v.views.backoffice.custom.customerCreditList",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.CustomerCreditList",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = "v.views.backoffice.custom.customerCreditList";
			this.module = '';
            this.customerCredit;
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.Grid']();
		}
	});
	(function(PluginClass){
		 PluginClass.prototype.initConditionForm = function(){
			    var Form = V.Classes['v.component.Form'];
				var items = [
					       {label:'客户编码',type:Form.TYPE.TEXT,name:'customerCode',value:''},
					       {label:'客户名称',type:Form.TYPE.TEXT,name:'customerName',value:''},
                           {label:'应收账款',type:Form.TYPE.TEXT,name:'receiveAccount',value:''},
                           {label:'总信用额度',type:Form.TYPE.TEXT,name:'allCredit',value:''},
                           {label:'剩余信用额度',type:Form.TYPE.TEXT,name:'remainCredit',value:''},
                           {label:'是否启用',type:Form.TYPE.SELECT,name:'isUsed',multiList:[['全部',''],['启用','1'],['停用','0']]}
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
                checkable:false,
				url:this.module+'/credit!list.action',
                columns:[
                    {displayName:'客户编码',key:'customerCode'}
                    ,{displayName:'客户名称',key:'customerName'}
                    ,{displayName:'应收账款',key:'receiveAccount'}
                    ,{displayName:'总信用额度',key:'allCredit'}
                    ,{displayName:'剩余信用额度',key:'remainCredit'}
                    ,{displayName:'是否启用',key:'isUsed',render:function(record){
                        if(record.isUsed==0){
                            return "停用";
                        }else{
                            return "启用";
                        }
                    }}
                    ,{displayName:'操作',key:'action',width:100,render:function(record){
                        var status = '';
                        var icon = "icon-ban-circle";
                        if(record.isUsed == '1'){
                            status = '停用';
                        } else{
                            status = '启用';
                            icon = "icon-ok-circle";
                        }
                        var html = $('<div class="action"><a class="edit" href="javascript:void(0);" title="修改"><i class="icon-edit"></i></a><a class="toggle" href="javascript:void(0);" style="margin:0 8px;" title='+status+'><i class="'+icon+'"></i></a><div>');
                        $('.edit',html).click(function(){
                            that.editCustomerCredit(record);
                        });
                        $('.toggle',html).click(function(){
                            record.isUsed = record.isUsed=='0'?'1':'0';
                            that.toggleCustomerCredit(record);
                        });
                        return html;
                    }}
                ]
            });
        };
        PluginClass.prototype.toggleCustomerCredit = function(record){
            var that = this;
            var url = this.module+'/credit!update.action';
            V.ajax({
                url:url,
                type:'POST',
                data:({customerCredit:record}),
                success:function(data){
                    if(data.result=='success'){
                        V.alert(data.msg);
                        that.list.refresh();
                    }else{
                        V.alert(data);
                    }
                }
            })
        }
        PluginClass.prototype.editCustomerCreditNext = function(record){
            var options = this.options;
            options.record = record;
            this.forward('v.views.backoffice.custom.customerCreditEdit',options,function(p){
                p.addCrumb();
            });
        }
        PluginClass.prototype.editCustomerCredit = function(record){
            var that = this;
            var dlg = new V.Classes['v.ui.Dialog']();
            var con = $('<div class="docket"></div>');
            
            var form = new V.Classes['v.component.Form']();
            var Form = V.Classes['v.component.Form'];
            var items = [
                    {label:'客户编码',type:Form.TYPE.READONLY,name:'customerCode',value:record['customerCode']},
                    {label:'客户名称',type:Form.TYPE.READONLY,name:'customerName',value:record['customerName']},
                    {
                        label:'应收账款',
                        type:Form.TYPE.NUMBER,
                        name:'receiveAccount',
                        value:record['receiveAccount'],
                        required:true,
                        validator:V.Classes['v.component.Form'].generateValidator(Form.TYPE.NUMBER,15,2)
                    },
                    {
                        label:'总信用额度',
                        type:Form.TYPE.NUMBER,
                        name:'allCredit',
                        value:record['allCredit'],
                        required:true,
                        validator:V.Classes['v.component.Form'].generateValidator(Form.TYPE.NUMBER,15,2)
                    },
                    {
                        label:'剩余信用额度',
                        type:Form.TYPE.NUMBER,
                        name:'remainCredit',
                        value:record['remainCredit'],
                        required:true,
                        validator:V.Classes['v.component.Form'].generateValidator(Form.TYPE.NUMBER,15,2)
                    },
                    {label:'是否启用',type:Form.TYPE.SELECT,name:'isUsed',value:record['isUsed'],multiList:[['启用','1'],['停用','0']]}
            ];
            
            form.init({
                colspan:2,
                items:items,
                container:con
            });
            
            dlg.setBtnsBar({
                btns:[
                   {text:'修改',style:'btn-primary',handler:function(){
                       if(!form.validate()) return;
                       
                       var creditForm = form.getValues();
                       for(key in creditForm){
                           record[key] = creditForm[key];
                       }
                       
                        V.ajax({
                            url:that.module+'/credit!update.action',
                            type:'post',
                            data: {customerCredit:record},
                            success:function(data){
                                if(data.result=='success'){
                                    V.alert(data.msg);
                                    dlg.close();
                                    that.list.refresh();
                                }
                                else{
                                    V.alert(data);
                                }
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
                title:'修改客户信用额度',
                width:700,
                height:350
            })
        }
		PluginClass.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'客户信用额度'}});
		}
        PluginClass.prototype.updateCrumb = function(){
            V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'客户信用额度'}});
        }
	})(V.Classes['v.views.backoffice.custom.CustomerCreditList'])
},{plugins:['v.views.component.searchList',"v.ui.grid","v.ui.dialog","v.ui.pagination"]});