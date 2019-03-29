/**
 * 仓库管理-维护
 */
;V.registPlugin("v.views.logistics.wareHouseManage.wareHouseList",function(){
	V.Classes.create({
		className:"v.views.logistics.wareHouseManage.WareHouseList",
		superClass:"v.component.SearchList",
		init:function(){
            this.ns = 'v.views.logistics.wareHouseManage.wareHouseList';
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.Grid']();
		}
	});
	(function(pluginList){
		pluginList.prototype.initConditionForm = function(){
		    var Form = V.Classes['v.component.Form'];
			var items = [
				       {label:'仓库编码',type:Form.TYPE.PLUGIN,name:'whCode',value:'',plugin:'v.views.component.wareHouseSelector'},
					   {label:'仓库名称',type:Form.TYPE.TEXT,name:'whName',value:''},
					   {label:'仓库地址',type:Form.TYPE.TEXT,name:'whAddress',value:''}
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
		};
		pluginList.prototype.initList = function(){
			var that = this;
			var list = this.list;
			
			var pagination = new V.Classes['v.ui.Pagination']();
		    list.setPagination(pagination);
		    list.setFilters(this.options.filters);
			list.init({
				url: this.module+'/ware-house!list.action',
				hasData : true,
				checkable:true,
				columns:[
                    {displayName:'仓库编码',key:'whCode',width:120}
                    ,{displayName:'仓库名称',key:'whName',width:120}
                    ,{displayName:'仓库地址',key:'whAddress',width:120}
					,{displayName:'联系人',key:'linkman',width:80}
					,{displayName:'电话',key:'telephone',width:80}
					,{displayName:'邮编',key:'zipcode',width:80}
					,{displayName:'默认地址',key:'isDefault',render:function(record){
	                	return record.isDefault=='1'?'是':'否';
	                }}
					,{displayName:'备注',key:'remark',width:100}
                    ,{displayName:'操作',key:'action',width:80,render:function(record){
                    	var html = $('<div class="action"><a class="remove" href="javascript:void(0);" title="删除"><i class="icon-remove"></i></a>\
						<a class="edit" href="javascript:void(0);" title="编辑"><i class="icon-edit"></i></a><div>');
						$('.remove', html).click(function(){
							that.removeWareHouse(record);
						});
						$('.edit', html).click(function(){
							that.editWareHouse(record);
						});
						return html;
                    }}
                ],
				toolbar:[
				         {eventId:'add',text:'新增',icon:'icon-plus'},
				         {eventId:'removeAll',text:'批量删除',icon:'icon-remove'},
				]
			});
			this.subscribe(list,'add',this.editWareHouse);
			this.subscribe(list,'removeAll',this.removeWareHouses);
		}
		pluginList.prototype.editWareHouse = function(record){
			var that = this;
			var addDlg = new V.Classes['v.ui.Dialog']();
			
			var formContainer = $('<div class="docket"></div>')
	        var Form = V.Classes['v.component.Form'];
			var form = new Form();
	        var items = [
	                   {label:'仓库编码',type:Form.TYPE.TEXT,name:'whCode',validator:'text(0,300)',required:true},
	                   {label:'仓库名称',type:Form.TYPE.TEXT,name:'whName',validator:'text(0,300)',required:true},
	                   {label:'仓库地址',type:Form.TYPE.TEXT,name:'whAddress',validator:'text(0,300)'},
	                   {label:'联系人',type:Form.TYPE.TEXT,name:'linkman',validator:'text(0,300)'},
	                   {label:'电话',type:Form.TYPE.TEXT,name:'telephone',validator:'mobile'},
	                   {label:'邮编',type:Form.TYPE.TEXT,name:'zipcode',validator:'zipCode'},
	                   {label:'是否默认',type:Form.TYPE.SELECT,name:'isDefault',multiList:[['是','1'],['否','0']]},
	                   {label:'备注',type:Form.TYPE.TEXT,name:'remark',validator:'text(0,500)'}
	            ];
	       
	        form.init({
	        	container:formContainer,
	            colspan:2,
	            items:items
	        });
			
	        if(record!=null){
	        	for(key in record){
	        		$('*[name='+key+']',form.template).val(record[key]);
	        	}
	        }
	        
	        addDlg.setContent(formContainer);
	        addDlg.setBtnsBar({btns:[{text:"保存",style:"btn-primary",handler:function(){
	        	if(!form.validate()){
					return;
				}
	        	
				var values = form.getValues();
				for(key in values){
					record[key] = values[key];
				}
				
	            V.ajax({
	                url:that.module+'/ware-house!save.action',
	                type:'post',
	                data:{wareHouse : record},
	                //contentType:'json',
	                success:function(data){
	                    if(data.result=='success'){
	                        that.list.refresh();
	                        addDlg.close();
	                    }else{
	                        V.alert(data);
	                    }
	                }
	            })
	            
	        }},{text:"取消",handler:addDlg.close}]});
	        addDlg.init({title:'仓库维护',height:350,width:700});
		}
		pluginList.prototype.removeWareHouse = function(record){
			var that = this;
			V.confirm('是否删除仓库？',function(){
				var url = that.module+'/ware-house!delete.action';
	            V.ajax({
	            	url:url,
	               	type:'POST',
					data: {whId:record.id},
	                success:function(data){
						if(data.result == 'success'){
							V.alert("删除操作成功！");
							that.list.refresh();
						}else{
							V.alert(data);		 
						}
	                }
	            })
			});
		}
		pluginList.prototype.removeWareHouses = function(){
			var that = this;
			var selected = that.list.getCheckedRecords();
			
			if(selected.length == 0){
				V.alert("请选择记录！");
				return;
			}
			V.confirm('是否批量进行删除操作？',function(){
				var url = that.module+'/ware-house!deleteAll.action';
	            V.ajax({
	            	url:url,
					data: {wareHouses:selected},
	                success:function(data){
	                     if(data.result == 'success'){
	                     	V.alert("批量删除操作成功！");
	                     	that.list.refresh();
	                     }else{
	                    	 V.alert(data);		 
	                     }
	                }
	            })
			});
		}
		pluginList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'仓库维护'}});
		}
		pluginList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'仓库维护'}});
		}
	})(V.Classes['v.views.logistics.wareHouseManage.WareHouseList']);
},{plugins:['v.component.searchList','v.ui.grid','v.views.component.wareHouseSelector']});
