;V.registPlugin("v.views.backoffice.authority.userList",function(){
	V.Classes.create({ 
		className:"v.views.backoffice.authority.UserList",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = "v.views.backoffice.authority.userList";
			this.module = '';
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.Grid']();
			this.EVENT = {
				VIEW_POST:'view_post'
			}
		}
	});
	(function(UserList){
		UserList.prototype.initConditionForm = function(){
			    var Form = V.Classes['v.component.Form'];
				var items = [
					       {label:'登录名',type:Form.TYPE.TEXT,name:'loginName',value:''},
						   {label:'用户名',type:Form.TYPE.TEXT,name:'userName',value:''},
						   {label:'用户编码',type:Form.TYPE.TEXT,name:'userCode',value:''},
						   {label:'所属区域',type:Form.TYPE.TEXT,name:'domain',value:''},
	 			           {label:'状态',type:Form.TYPE.RADIO,name:'status',value:'30',multiList:[['正常','1'],['锁定','3']],emptyText:'全部'}
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
		UserList.prototype.initList = function(){
			    var list = this.list;
				var pagination = new V.Classes['v.ui.Pagination']();
				list.setPagination(pagination);
				list.setFilters(this.options.filters);
	            var that = this;
	            list.init({
					container:$('.list',this.template),
	                checkable:true,
					url:this.module+'/user!list.action',
	                columns:[
	                    {displayName:'用户编码',key:'userCode',width:80}
	                    ,{displayName:'登录名',key:'loginName',width:80}
	                    ,{displayName:'用户名称',key:'userName',width:80,align:'center'}
	                   ,{displayName:'公司代码',key:'companyCode',width:120}
	                    ,{displayName:'公司名称',key:'companyName',width:120}
	                    ,{displayName:'岗位',key:'posts',width:120,render:function(record){
	                        var post = record.posts;
	                        var html = $('<span></span>');
	                        if(post&&post.length>0){
	                            for(var i=0,l=post.length;i<l;i++){
									var item = $( "<a href='#' style='display:block' data-id='"+post[i].id+"'>"+post[i].name+"</a>");
									item.data('post',post[i]);
									item.click(function(){
										//that.viewPost($(this).data('post'));
									})
	                                html.append(item);
	                            }
	                            return html;
	                        }
	                     }}
	                    ,{displayName:'状态',key:'status',width:50,render:function(record){
	                    	if(record.status == '1'){
	                    		return '正常';
	                    	}else{
	                    		return '锁定';
	                    	}
	                    }}
	                    ,{displayName:'所在区域',key:'domain',width:100}
						/*,{displayName:'来源',key:'source',width:120,render:function(record){
							if(record.source == '1'){
								return '手动';
							}else{
								return '导入';
							}
						}}*/
	                    ,{displayName:'操作',key:'action',width:120,render:function(record){
	                    	var status = '';
							var icon = "icon-ban-circle";
	                    	if(record.status == '1'){
	                    		status = '锁定';
	                    	} else{
	                    		status = '解锁';
								icon = "icon-ok-circle";
	                    	}
	                    	//<a class="updatePwd" href="javascript:void(0);" title="修改密码"><i class="icon-user"></i></a>
	                        var html = $('<div class="action"><a class="resetPassword" href="javascript:void(0);" title="重置密码"><i class="icon-user"></i></a><a class="editPassword" href="javascript:void(0);" title="修改密码"><i class="icon-pen"></i></a>\
										<a class="change" href="javascript:void(0);" title="编辑"><i class="icon-edit"></i></a><a class="lock" href="javascript:void(0);" style="margin:0 8px;" title='+status+'><i class="'+icon+'"></i></a></div>');
	                        $('.resetPassword',html).click(function(){
	                        	that.resetPassword(record);
	                        });
	                        $('.editPassword',html).click(function(){
	                        	that.editPassword(record);
	                        });
	                        $('.change',html).click(function(){
	                            that.editUser(record);
	                        });
	                        $('.lock',html).click(function(){
	                        	that.lockUser(record);
	                        });
	                        return html;
	                    }}
	                ],
					toolbar:[
				          {eventId:'add',text:'创建',icon:'icon-plus'},
						  {eventId:'remove',text:'删除',icon:'icon-remove'}
					]
	            });
				this.subscribe(list,'add',this.addUser);
				this.subscribe(list,'remove',this.removeUsers);
	            this.container.append(this.template);
		}
		UserList.prototype.addUser = function(){
			var that = this;
			var url = this.module+'/user!input.action';
            $.ajax({
            	url:url,
               	type:'POST',
				data:JSON.stringify({id:null}),
				contentType:'application/json',
                success:function(data){
                     that.editUser(data);
                }
            })
		}
		UserList.prototype.removeUsers = function(){
			var that = this;
			var selected = that.list.getCheckedRecords();
			var selected_array = [];
			for (var i = 0; i < selected.length; i++){
				 selected_array[i] = selected[i].id;
			};
			if(selected_array.length == 0){
				V.alert("请选择用户！");
				return;
			}
			V.confirm('确认删除吗？',function(){
				var url = that.module+'/user!deleteAll.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
					data: {userIds: selected_array.join(',')},
	                success:function(data){
	                     //处理结果
	                     if(data == 'success'){
	                     	V.alert("success！");
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
        UserList.prototype.saveUser = function(user){
        	var url = this.module+'/user!save.action';
            $.ajax({
            	url:url,
               	type:'POST',
				data:JSON.stringify({user:user}),
				contentType:'application/json',
				dataType:'json',
                success:function(data){
                     //处理结果
                	if(data.msg="success"){
                		V.alert("success！");
                	}else{
                		V.alert(data.info);
                	}
                }
            })
        };
 		UserList.prototype.lockUser = function(user){
 			var that = this;
 			var url = this.module+'/user!lock.action';
 			user.modifyDate = null;
 			user.posts = null;
// 			var alertMsg="Confirm lock?";
 			var alertMsg="是否锁定?";
 			if(user.status != '1'){
 				alertMsg="锁定失败";
 			}
			V.confirm(alertMsg,function(){
 				$.ajax({
	            	url:url,
	               	type:'POST',
					data:{userId:user.id},
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
		UserList.prototype.viewPost = function(post){
			var opts = {
				post:post,
				module:'backoffice/authority/post'
			}
//			this.options.post = post;
//			this.options.module = 'backoffice/authority/post';
			this.forward("v.views.backoffice.authority.postEdit",opts,function(p){
				p.addCrumb();
			});
		}
		UserList.prototype.editUser = function(user){
			this.options.user = user;
			this.options.module = this.module;
			this.forward("v.views.backoffice.authority.user",this.options,function(p){
				p.addCrumb();
			});
		}
		UserList.prototype.resetPassword = function(record){
			var that = this;
			var user = record;
			var email = user.email||'';
			var url = this.module+'/user!resetPassword.action';
			var alertMsg="新的密码会发送到邮箱"+email+" , 请确认邮箱有效性，是否重置密码？";
			V.confirm(alertMsg,function(){
				$.ajax({
	            	url:url,
	               	type:'POST',
					data:{userId:user.id},
	                success:function(data){
	                     if(data.result=='success'){
	                     	V.alert("重置密码成功，请查看邮件"+email+"获取密码！");
	                     	that.list.refresh();
	                     }else{
	                     	V.alert(data);
	                     }
	                }
	            })
			});	
		}
		UserList.prototype.editPassword = function(record){
			var that = this;
			var user = record;
			
			var addDlg = new V.Classes['v.ui.Dialog']();
			var Form = V.Classes['v.component.Form'];
		    var form = new Form();
		    var items = [];
		    items.push(
		    	{label:'新密码',name:'password',type:Form.TYPE.PASSWORD,required:true,colspan:3}
	    	    ,{label:'确认密码',name:'confirmPassword',type:Form.TYPE.PASSWORD,required:true,colspan:3}
	    	    );
		    form.init({
		    	container:addDlg.getContent(),
		    	items:items,
		    	colspan:2
		    });
			    
			addDlg.setBtnsBar({btns:[{text:"确定",style:"btn-primary",handler:function(){
				if(!form.validate()) return;
				var password = $('[name=password]',form.template).val();
				var confirmPassword = $('[name=confirmPassword]',form.template).val();
				if(password!=confirmPassword){
					V.alert('新密码和确认密码不一致，请重新输入！');
					return;
				}
				user.password = hex_sha1(password);
				that.saveEditPassword(addDlg,user);
			}},{text:"取消",handler:addDlg.close}]});
			addDlg.init({title:'修改密码',height:250,width:500});
		}
		UserList.prototype.saveEditPassword = function(addDlg,user){
			var that = this;
			var url = this.module+'/user!editPassword.action';
			V.ajax({
	        	url:url,
	           	type:'POST',
				data:{user:user},
	            success:function(data){
	                 if(data.result=='success'){
	                 	V.alert("修改密码成功");
	                 	addDlg.close();
	                 	that.list.refresh();
	                 }else{
	                 	V.alert(data);
	                 }
	            }
	        })
		}
		UserList.prototype.updatePwd = function(user) {
        	var that = this;
 			var url = this.module+'/user!updatePwd.action';
 			var alertMsg="The new password send to e-mail , please confirm e-mail effectively,confirm change password";
			V.confirm(alertMsg,function(){
 				$.ajax({
	            	url:url,
	               	type:'POST',
					data:{userId:user.id},
	                success:function(data){
	                     if(data=='success'){
	                     	V.alert("success");
	                     }else{
	                     	V.alert(data.info);
	                     }
	                }
	            })
 			});	
        }
		UserList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'用户管理'}});
		}
		UserList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'用户管理'}});
		}
	})(V.Classes['v.views.backoffice.authority.UserList'])
},{plugins:["v.ui.grid","v.views.component.searchList","v.ui.pagination","v.component.form"]});
