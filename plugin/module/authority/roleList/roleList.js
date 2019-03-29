;V.registPlugin("v.module.authority.roleList",function(){
	V.Classes.create({
		className:"v.module.authority.RoleList",
		superClass:"v.component.SearchList",
		init:function(){
            this.ns = "v.module.authority.roleList";
            //this.roles = {};
			this.module = '';
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.Grid']();
			this.EVENT = {
				VIEW_ROLE:'view_role'
			}
		}
	});
	(function(RoleList){
       RoleList.prototype.initConditionForm = function(){
			    var Form = V.Classes['v.component.Form'];
				var items = [
					       {label:'角色编码',type:Form.TYPE.TEXT,name:'roleCode',value:''},
						   {label:'角色名称',type:Form.TYPE.TEXT,name:'roleName',value:''}
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
        RoleList.prototype.initList = function(){
            var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			list.setFilters(this.options.filters);
            var that = this;
            list.init({
                container:$('.list',this.template),
                checkable:true,
				url:this.module+'/role!list.action',
                columns:[
                    {displayName:'角色编码',key:'roleCode',width:120}
                    ,{displayName:'角色名称',key:'roleName',width:120}
					,{displayName:'修改时间',key:'modifyDate',width:200}
					,{displayName:'修改人',key:'modifyName',width:120}
                    ,{displayName:'操作',key:'action',width:50,render:function(record){
                        var html = $('<div class="action"><a class="change" href="javascript:void(0);" title="修改"><i class="icon-edit"></i></a><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a></div>');
                        $('.change',html).click(function(){
                            that.editRole(record);
                        });
                        $('.remove',html).click(function(){
                        	that.removeRole(record);
                        });
                        return html;
                    }}
                ],
                toolbar:[
			          {eventId:'add',text:'新增角色',icon:'icon-plus'},
					  {eventId:'remove',text:'删除角色',icon:'icon-remove'}
					  
				]
            });
            this.subscribe(list,'add',this.editRole);
			this.subscribe(list,'remove',this.removeRoles);
            this.container.append(this.template);
        };
        RoleList.prototype.removeRole = function(role){
        	var that = this;
        	role.modifyDate = null;
			var url = this.module+'/role!delete.action';
			V.confirm('是否删除角色？',function(){
	            $.ajax({
	            	url:url,
	               	type:'POST',
					data:JSON.stringify({role:role}),
					contentType:'application/json',
	                success:function(data){
	                	 if(data == 'success'){
		                     V.alert('删除角色操作成功！');
		                     that.list.refresh();
	                     } else if(data.msg="error"){
	                     	  V.alert(data.info);		
	                     }else{
	                    	 V.alert(data);		 
	                     }
	                }
	            })
         	});
        }
        RoleList.prototype.addRole = function(){
//			var that = this;
//			var url = this.module+'/role!input.action';
//            $.ajax({
//            	url:url,
//               	type:'POST',
//				data:JSON.stringify({id:null}),
//				contentType:'application/json',
//                success:function(data){
//                     that.editRole(data);
//                }
//            })
        	this.editRole();
		}
		RoleList.prototype.removeRoles = function(){
			var that = this;
			var selected = that.list.getCheckedRecords();
			var selected_array = [];
			for (var i = 0; i < selected.length; i++){
				 selected_array[i] = selected[i].id;
			};
			if(selected_array.length == 0){
				V.alert("请选择角色记录！");
				return;
			}
			var url = this.module+'/role!deleteAll.action';
			V.confirm('是否进行批量删除角色操作？',function(){
	            $.ajax({
	            	url:url,
	               	type:'POST',
					data: {roleIds: selected_array.join(',')},
	                success:function(data){
	                     //处理结果
	                     if(data == 'success'){
	                     	V.alert("批量删除角色操作成功！");
							that.list.refresh();
	                     } else if(data.msg="error"){
	                     	  V.alert(data.info);		
	                     }else{
	                    	 V.alert(data);		 
	                     }
	                }
	            })
	      	});
			//V.alert('remove roles');
		}
        RoleList.prototype.saveRole = function(role){
        	var url = this.module+'/role!save.action';
            $.ajax({
            	url:url,
               	type:'POST',
				data:JSON.stringify({role:role}),
				contentType:'application/json',
				dataType:'json',
                success:function(data){
                     //处理结果
                     V.alert(data.responseText);
                },
                error:function(){
                    
                }
            })
        };
         
        RoleList.prototype.editRole = function(role){
        	this.options.module = this.module;
			this.options.role = role||{};
			this.forward('v.module.authority.roleEdit',this.options,function(p){
				p.addCrumb();
			});
		}
		RoleList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'角色管理'}});
		}
		RoleList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'角色管理'}});
		}
	})(V.Classes['v.module.authority.RoleList'])
},{plugins:["v.ui.grid","v.component.searchList","v.ui.pagination","v.component.form","v.ui.confirm","v.ui.alert"]});
