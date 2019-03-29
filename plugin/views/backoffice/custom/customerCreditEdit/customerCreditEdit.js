;V.registPlugin("v.views.backoffice.custom.customerCreditEdit",function(){
    V.Classes.create({
        className:"v.views.backoffice.custom.CustomerCreditEdit",
        superClass:"v.Plugin",
        init:function(){
            this.ns = "v.views.backoffice.custom.customerCreditEdit";
            this.module = '';
            this.customerCredit = null;
            this.form = null;
            this.options = {};
        }
    });
    (function(PluginClass){
        PluginClass.prototype.init = function(options){
            this.module = options.module;
            this.container = options.container;
            for(prop in options){
                this.options[prop] = options[prop];
            }
            this.record = options.record;
            this.initConditionForm();
        }
        PluginClass.prototype.initConditionForm = function(){
            var that = this;
            var formDocket = $('<div class="docket"></div>');
            that.container.append(formDocket);
            var url = this.module+'/credit!input.action';
            V.ajax({
                url:url,
                type:'POST',
                data:({}),
                success:function(record){
                    var form = this.form = new V.Classes['v.component.Form']();
                    var Form = V.Classes['v.component.Form'];
                    var items = [
                            {label:'客户编码',type:Form.TYPE.READONLY,name:'customerCode',value:record['customerCode']},
                            {label:'客户名称',type:Form.TYPE.READONLY,name:'customerName',value:record['customerName']},
                            {
                                label:'应收账款',
                                type:Form.TYPE.READONLY,
                                name:'receiveAccount',
                                value:record['receiveAccount']
                            },
                            {
                                label:'总信用额度',
                                type:Form.TYPE.READONLY,
                                name:'allCredit',
                                value:record['allCredit']
                            },
                            {
                                label:'剩余信用额度',
                                type:Form.TYPE.READONLY,
                                name:'remainCredit',
                                value:record['remainCredit']
                            },
                            {label:'是否启用',type:Form.TYPE.READONLY,name:'isUsed',render:function(){
                                if(record.isUsed==1){
                                    return "启用";
                                }else{
                                    return "停用";
                                }
                            }}
                    ];
                    
                    form.init({
                        colspan:2,
                        items:items,
                        container:formDocket
                    });
                }
            })
        }
        PluginClass.prototype.editCustomerCredit = function(){
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
                        V.MessageBus.publish({eventId:'backCrumb'});
                    }    
                    else{
                        V.alert(data);
                    }
                }
            })
        }
        PluginClass.prototype.addCrumb = function(){
            V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'信用额度'}});
        }
        PluginClass.prototype.updateCrumb = function(){
            V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'信用额度'}});
        }
    })(V.Classes['v.views.backoffice.custom.CustomerCreditEdit'])
},{plugins:["v.ui.grid","v.ui.dialog","v.ui.pagination"]});