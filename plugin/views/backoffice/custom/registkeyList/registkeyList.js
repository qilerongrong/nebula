;V.registPlugin("v.views.backoffice.custom.registkeyList",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.RegistkeyList",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = "v.views.backoffice.custom.registkeyList";
			this.module = '';
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.Grid']();
			this.EVENT = {
				VIEW_POST:'view_post'
			}
		}
	});
	(function(RegistkeyList){
		RegistkeyList.prototype.initConditionForm = function(){
			    var Form = V.Classes['v.component.Form'];
				var items = [
				           {label:'中心企业',type:Form.TYPE.PLUGIN,value:'',plugin:'v.views.component.partySelector',colspan:1},
				           //{label:'税号',type:Form.TYPE.TEXT,value:''},
					       {label:'销方',type:Form.TYPE.PLUGIN,value:'',plugin:'v.views.component.sellerTaxSelector',colspan:1},
						   {label:'截止月份',type:Form.TYPE.DATE,name:'uptomon',value:''},
						   {label:'系统',type:Form.TYPE.SELECT,name:'sys',multiList:[['所有',''],['企业发票扫描系统','1'],['企业发票抽取系统','2'],['企业发票批量开票系统','3']]}
					];
				var filters = this.options.filters;
				if(filters){
					$.each(items,function(m,item){
						var key = this.name;
						if(item.type == Form.TYPE.PLUGIN){
							var key_code = '';
							var key_name = '';
							$.each(filters,function(k,v){
								if((key+'Code') == k){key_code = v;}
								if((key+'Name') == k){key_name = v;}
							})
						item.value = key_code +'('+ key_name+')';
						}else{
							$.each(filters,function(k,v){
								if(key == k){item.value = v;return false;}
							})
						}
					});
				}
				this.form.init({
					colspan:2,
					items:items
				});
				var that = this;
				$.ajax({
					url : this.module + '/register-key!input.action',
					dataType : 'json',
					success : function(data){
					}
				});
		};
		RegistkeyList.prototype.initList = function(){
			    var list = this.list;
				var pagination = new V.Classes['v.ui.Pagination']();
				list.setPagination(pagination);
				list.setFilters(this.options.filters);
	            var that = this;
	            list.init({
					container:$('.list',this.template),
	                checkable:true,
					url:this.module+'/register-key!list.action',
	                columns:[
	                    {displayName:'纳税人识别号',key:'taxno',width:120},
	                    {displayName:'纳税人名称',key:'taxname',width:140},
	                    {displayName:'系统',key:'sys',width:120,render:function(record){
	                    	if(record.sys=='1'){
	                    		return "企业发票扫描系统";
	                    	}else if(record.sys=='2'){
	                    		return "企业发票抽取系统";
	                    	}else{
	                    		return "企业发票批量开票系统";
	                    	}
	                    }},
	                    {displayName:'注册码',key:'registkey',width:120},
	                    {displayName:'截止月份',key:'uptomon',width:120},
	                    {displayName:'注册日期',key:'operdate',width:120},
	                    {displayName:'操作',key:'action',width:80,render:function(record){
	                        var html = $('<div class="action"><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a></div>');
//	                        $('.change',html).click(function(){
//	                            that.addEditDepart(record);
//	                        });
	                        $('.remove',html).click(function(){
	                        	that.delRkey(record);
	                        });
	                        return html;
	                    }}
	                ],
					toolbar:[
				          {eventId:'add',text:'新增',icon:'icon-plus'},
						  {eventId:'remove',text:'删除',icon:'icon-remove'}
					]
	            });
				this.subscribe(list,'add',this.addEditDepart);
				this.subscribe(list,'remove',this.delRkeys);
	            this.container.append(this.template);
		}
		RegistkeyList.prototype.delRkeys = function(){
			var that = this;
			var selected = that.list.getCheckedRecords();
			var selected_array = [];
			for (var i = 0; i < selected.length; i++){
				 selected_array[i] = selected[i].id;
			};
			if(selected_array.length == 0){
				V.alert("请选择注册码记录！");
				return;
			}
			V.confirm('是否批量进行删除注册码操作？',function(){
				var url = that.module+'/register-key!deleteAll.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
					data: {ids: selected_array.join(',')},
	                success:function(data){
	                     if(data == 'success'){
	                     	V.alert("批量删除注册码操作成功！");
	                     	for (var i = 0; i < selected.length; i++){
								 that.list.removeRecord(selected[i]);
							};
	                     }else{
	                    	 V.alert(data);		 
	                     }
	                }
	            })
			});
		}
 		RegistkeyList.prototype.delRkey = function(record){
 			var that = this;
 			var url = this.module+'/register-key!delete.action';
 			var alertMsg="是否删除所选注册码？";
			V.confirm(alertMsg,function(){
 				$.ajax({
	            	url:url,
	               	type:'POST',
					data:{id:record.id},
	                success:function(data){
	                     if(data=='success'){
	                     	that.list.refresh();
	                     }else{
	                     	V.alert(data);
	                     }
	                }
	            })
 			});	
 		}
		RegistkeyList.prototype.addEditDepart = function(record) {
				var that = this;
				var titles="新增注册码";
				/** Dialog* */
				var html = $('<div><div class="registerkey"></div></div>');
				var addDlg = new V.Classes['v.ui.Dialog']();
				var form = new V.Classes['v.component.Form']();
				addDlg.setBtnsBar({
					btns : [{
						text : "确定",
						style : "btn-primary",
						handler : function(){
							if (!form.validate()) {
								return;
							}
							var Registkey=form.getValues();
							record["taxno"] = Registkey["sellerTax"];
							record["plateNo"] = Registkey["partyCode"];
							record["sys"] = Registkey["sys"];
							record["uptomon"] = Registkey["uptomon"];
							$.ajax({
								url:that.module+'/register-key!save.action',
								type:'post',
								contentType:'application/json',
								data:JSON.stringify({entity:record}),
								success:function(data){
									if(data == 'success'){
						              	V.alert("保存成功!");
						              	that.list.retrieveData();
						              	addDlg.close();
						             }else{
										  V.alert("保存失败!");
									  }
								}
							})
						}
					},{
						text : "取消",
						handler : addDlg.close
					}]
				});
				addDlg.init({
					title : titles,
					height : 262,
					width : 760
				});
				/** 将Grid中的数据加入到Dialog中* */
				var items = [];
				var item1 = {
					name : 'id',
					key : 'id',
					label : 'id',
					value : record['id']||'',
					type : V.Classes['v.component.Form'].TYPE.HIDDEN
				};
				var item3 = {
					label : '销方',
					required:true,
					plugin:'v.views.component.sellerTaxSelector',
					type : V.Classes['v.component.Form'].TYPE.PLUGIN
				};
				var item2 = {
					label : '中心企业',
					required:true,
					plugin:'v.views.component.partySelector',
					type : V.Classes['v.component.Form'].TYPE.PLUGIN
				};
				var item4 = {
						name : 'sys',
						label : '系统',
						value : record['sys']||'',
						multiList : [['企业发票扫描系统','1'],['企业发票抽取系统','2'],['企业发票批量开票系统','3']],
						required:true,
						type : V.Classes['v.component.Form'].TYPE.SELECT
					};
				var item5 = {
						name : 'uptomon',
						label : '截止月份',
						value : record['uptomon']||'',
						required:true,
						validator:V.Classes['v.component.Form'].generateValidator(V.Classes['v.component.Form'].TYPE.TEXT,10),
						type : V.Classes['v.component.Form'].TYPE.TEXT
					};
				
				items.push(item1);
				items.push(item2);
				items.push(item3);
				items.push(item4);
				items.push(item5);
//				items.push(item6);
				form.init({
					container : $('.registerkey', html),
					items : items,
					colspan:2
				});
				addDlg.setContent(html);
			}
		RegistkeyList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'注册码管理'}});
		}
		RegistkeyList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'注册码管理'}});
		}
	})(V.Classes['v.views.backoffice.custom.RegistkeyList'])
},{plugins:["v.ui.grid","v.views.component.searchList","v.ui.pagination","v.component.form","v.views.component.partySelector","v.views.component.sellerTaxSelector"]});
