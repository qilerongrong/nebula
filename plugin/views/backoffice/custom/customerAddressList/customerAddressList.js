;V.registPlugin("v.views.backoffice.custom.customerAddressList",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.CustomerAddressList",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = "v.views.backoffice.custom.customerAddressList";
			this.list = new V.Classes['v.ui.Grid']();
            this.form = new V.Classes["v.component.Form"]();
            this.options = {};
		}
	});
	(function(PluginClass){
		PluginClass.prototype.initConditionForm = function(){
            var Form = V.Classes['v.component.Form'];
            var items = [
                       {label:'省市',type:Form.TYPE.TEXT,name:'provinceName',value:''},
                       {label:'城市',type:Form.TYPE.TEXT,name:'cityName',value:''},
                       {label:'区县',type:Form.TYPE.TEXT,name:'countyName',value:''}
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
			var that = this;
            var list = this.list;
            var pagination = new V.Classes['v.ui.Pagination']();
            list.setPagination(pagination);
            list.setFilters(this.options.filters);
            list.init({
                container:this.container,
                url:that.module+'/address!list.action',
                columns:[
                    {displayName:'省市',key:'provinceName'}
                    ,{displayName:'城市',key:'cityName'}
                    ,{displayName:'区县',key:'countyName'}
                    ,{displayName:'操作',key:'action',width:40,render:function(record){
                        var html = $('<div><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a><div>');
                        $('.remove',html).click(function(){
                            V.confirm('是否删除地址？',function(){
                                V.ajax({
                                    url:that.module+'/address!delete.action',
                                    type:'post',
                                    data: {customerAddress:record},
                                    success:function(data){
                                        if(data.result=='success'){
                                            list.removeRecord(record);
                                        }
                                        else{
                                            V.alert(data);
                                        }   
                                    }
                                })
                            });
                        });
                        return html;
                    }}
                ],
                toolbar:[{eventId:'addAddress',icon:'icon-plus',text:'新增地址'}]
            });
            this.subscribe(list,'addAddress',this.addAddress);
        };
        PluginClass.prototype.addAddress = function(){
            var that = this;
            var addDlg = new V.Classes['v.ui.Dialog']();
            var addressArea = $("<div></div>");
            var area = new V.Classes['v.component.Area']();
            area.init({
                container:addressArea
            })
            addDlg.setContent(addressArea);
            
            addDlg.setBtnsBar({btns:[{text:"保存",style:"btn-primary",handler:function(){
                var optProvince = $('.sel_level1 option:selected',this.template);
                var optCity = $('.sel_level2 option:selected',this.template);
                var optCounty = $('.sel_level3 option:selected',this.template);

                var customerAddress = {
                    provinceId  : optProvince.attr('value'),
                    cityId      : optCity.attr('value'),
                    countyId    : optCounty.attr('value'),
                    provinceName: optProvince.attr('name'),
                    cityName    : optCity.attr('name'),
                    countyName  : optCounty.attr('name')
                }
                V.ajax({
                    url:that.module+'/address!save.action',
                    type:'post',
                    data:{customerAddress : customerAddress},
                    success:function(data){
                        if(data!=undefined){
                            that.list.refresh();
                            addDlg.close();
                        }else{
                            V.alert(data);
                        }
                    }
                })
                
            }},{text:"取消",handler:addDlg.close}]});
            addDlg.init({title:'新增地址',height:350,width:600});
        }
		PluginClass.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'客户地址'}});
		}
        PluginClass.prototype.updateCrumb = function(){
            V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'客户地址'}});
        }
	})(V.Classes['v.views.backoffice.custom.CustomerAddressList'])
},{plugins:["v.views.component.searchList","v.ui.grid","v.ui.dialog","v.ui.pagination","v.component.area"]});