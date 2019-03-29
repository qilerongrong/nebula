;V.registPlugin("v.views.backoffice.custom.departmentList",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.DepartmentList",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = "v.views.backoffice.custom.departmentList";
			this.module = '';
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.Grid']();
			this.EVENT = {
				VIEW_POST:'view_post'
			}
		}
	});
	(function(DepartmentList){
		DepartmentList.prototype.initConditionForm = function(){
			    var Form = V.Classes['v.component.Form'];
				var items = [
					       {label:'部门编号',type:Form.TYPE.TEXT,name:'departCode',value:''},
						   {label:'部门名称',type:Form.TYPE.TEXT,name:'departName',value:''},
						   {label:'所控品类编码',type:Form.TYPE.TEXT,name:'classCode',value:''}
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
					colspan:3,
					items:items
				});
		};
		DepartmentList.prototype.initList = function(){
			    var list = this.list;
				var pagination = new V.Classes['v.ui.Pagination']();
				list.setPagination(pagination);
				list.setFilters(this.options.filters);
	            var that = this;
	            list.init({
					container:$('.list',this.template),
	                checkable:true,
					url:this.module+'/department!list.action',
	                columns:[
	                    {displayName:'部门编号',key:'departCode',width:120}
	                    ,{displayName:'部门名称',key:'departName',width:140}
	                    ,{displayName:'所控品类编号',key:'classCode',width:120}
	                    ,{displayName:'操作',key:'action',width:80,render:function(record){
	                        var html = $('<div class="action"><a class="change" href="javascript:void(0);" title="修改"><i class="icon-edit"></i></a><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a></div>');
	                        $('.change',html).click(function(){
	                            that.addEditDepart(record,"E");
	                        });
	                        $('.remove',html).click(function(){
	                        	that.delDepart(record);
	                        });
	                        return html;
	                    }}
	                ],
					toolbar:[
				          {eventId:'add',text:'新增部门',icon:'icon-plus'},
						  {eventId:'remove',text:'删除部门',icon:'icon-remove'}
					]
	            });
				this.subscribe(list,'add',this.addEditDepart);
				this.subscribe(list,'remove',this.removeDeparts);
	            this.container.append(this.template);
		}
		DepartmentList.prototype.removeDeparts = function(){
			var that = this;
			var selected = that.list.getCheckedRecords();
			var selected_array = [];
			for (var i = 0; i < selected.length; i++){
				 selected_array[i] = selected[i].id;
			};
			if(selected_array.length == 0){
				V.alert("请选择部门记录！");
				return;
			}
			V.confirm('是否批量进行删除部门操作？',function(){
				var url = that.module+'/department!deleteAll.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
					data: {departIds: selected_array.join(',')},
	                success:function(data){
	                     if(data.msg == 'success'){
	                     	V.alert("批量删除部门操作成功！");
	                     	for (var i = 0; i < selected.length; i++){
								 that.list.removeRecord(selected[i]);
							};
	                     } else if(data.msg="error"){
	                     	  V.alert(data.info);		
	                     }else{
	                    	 V.alert(data);		 
	                     }
	                }
	            })
			});
		}
 		DepartmentList.prototype.delDepart = function(department){
 			var that = this;
 			var url = this.module+'/department!delete.action';
 			var alertMsg="是否删除所选部门？";
			V.confirm(alertMsg,function(){
 				$.ajax({
	            	url:url,
	               	type:'POST',
					data:{departId:department.id},
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
		DepartmentList.prototype.addEditDepart = function(record,E) {
				var that = this;
				var titles="新增部门";
				if(E=='E'){
					titles="编辑部门";
				}
				/** Dialog* */
				var html = $('<div><div class="department"></div></div>');
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
							var department=form.getValues();
							record["departCode"] = department["departCode"];
							record["departName"] = department["departName"];
							record["classCode"] = department["classCode"];
							$.ajax({
								url:that.module+'/department!save.action',
								type:'post',
								contentType:'application/json',
								data:JSON.stringify({department:record}),
								success:function(data){
									if(data.msg == 'success'){
						              	V.alert("保存成功!");
						              	that.list.retrieveData();
						              	addDlg.close();
						             }else if(data.msg="error"){
										   V.alert(data.info);
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
					width : 560
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
				var item2 = {
					name : 'departCode',
					label : '部门编码',
					value : record['departCode']||'',
					required:true,
					validator:V.Classes['v.component.Form'].generateValidator(V.Classes['v.component.Form'].TYPE.TEXT,10),
					type : V.Classes['v.component.Form'].TYPE.TEXT
				};
				var item3 = {
					name : 'departName',
					label : '部门名称',
					value : record['departName']||'',
					required:true,
					validator:V.Classes['v.component.Form'].generateValidator(V.Classes['v.component.Form'].TYPE.TEXT,10),
					type : V.Classes['v.component.Form'].TYPE.TEXT
				};
				var item4 = {
						name : 'classCode',
						label : '控制品类编号',
						value : record['classCode']||'',
						required:true,
						validator:V.Classes['v.component.Form'].generateValidator(V.Classes['v.component.Form'].TYPE.TEXT,10),
						type : V.Classes['v.component.Form'].TYPE.TEXT
					};
				items.push(item1);
				items.push(item2);
				items.push(item3);
				items.push(item4);
				form.init({
					container : $('.department', html),
					items : items,
					colspan:1
				});
				addDlg.setContent(html);
			}
		DepartmentList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'部门管理'}});
		}
		DepartmentList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'部门管理'}});
		}
	})(V.Classes['v.views.backoffice.custom.DepartmentList'])
},{plugins:["v.ui.grid","v.views.component.searchList","v.ui.pagination","v.component.form"]});
