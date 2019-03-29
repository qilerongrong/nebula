;V.registPlugin("v.module.authority.userList",function(){
	V.Classes.create({
		className:"v.module.authority.UserList",
		superClass:"v.component.SearchList",
		init:function(){
            this.ns = "v.module.authority.userList";
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
					       {label:'登陆账号',type:Form.TYPE.TEXT,name:'loginName',value:''},
						   {label:'用户名',type:Form.TYPE.TEXT,name:'userName',value:''},
						   {label:'用户编码',type:Form.TYPE.TEXT,name:'userCode',value:''},
	 			           {label:'状态',type:Form.TYPE.SELECT,name:'status',value:'30',multiList:[['所有',''],['正常','1'],['锁定','3']]}
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
	                    {displayName:'用户编码',key:'userCode',width:160}
	                    ,{displayName:'登陆账号',key:'loginName',width:140}
	                    ,{displayName:'用户名',key:'userName',width:120,align:''}
	                   // ,{displayName:'公司代码',key:'companyCode',width:120}
	                    //,{displayName:'公司名称',key:'companyName',width:120}
	                    ,{displayName:'岗位',key:'posts',width:150,render:function(record){
	                        var post = record.posts;
	                        var html = $('<span></span>');
	                        if(post&&post.length>0){
	                            for(var i=0,l=post.length;i<l;i++){
									var item = $( "<a href='#' style='display:block' data-id='"+post[i].id+"'>"+post[i].name+"</a>");
									item.data('post',post[i]);
									item.click(function(){
										that.viewPost($(this).data('post'));
									})
	                                html.append(item);
	                            }
	                            return html;
	                        }
	                     }}
	                    ,{displayName:'状态',key:'status',width:40,render:function(record){
	                    	if(record.status == '1'){
	                    		return '正常';
	                    	}else{
	                    		return '锁定';
	                    	}
	                    }}
						/*,{displayName:'来源',key:'source',width:120,render:function(record){
							if(record.source == '1'){
								return '手动';
							}else{
								return '导入';
							}
						}}*/
						,{displayName:'修改时间',key:'modifyDate',width:120}
						,{displayName:'修改人',key:'modifyName',width:80}
	                    ,{displayName:'操作',key:'action',width:80,render:function(record){
	                    	var status = '';
							var icon = "icon-ban-circle";
	                    	if(record.status == '1'){
	                    		status = '锁定';
	                    	} else{
	                    		status = '解锁';
								icon = "icon-ok-circle";
	                    	}
	                        var html = $('<div class="action"><a class="change" href="javascript:void(0);" title="修改"><i class="icon-edit"></i></a><a class="lock" href="javascript:void(0);" style="margin:0 8px;" title='+status+'><i class="'+icon+'"></i></a></div>');
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
				          {eventId:'add',text:'新增用户',icon:'icon-plus'},
						  {eventId:'remove',text:'注销用户',icon:'icon-remove'}
					]
	            });
				this.subscribe(list,'add',this.addUser);
				this.subscribe(list,'remove',this.removeUsers);
	            this.container.append(this.template);
		}
		UserList.prototype.addUser = function(){
//			var that = this;
//			var url = this.module+'/user!input.action';
//            $.ajax({
//            	url:url,
//               	type:'POST',
//				data:JSON.stringify({id:null}),
//				contentType:'application/json',
//                success:function(data){
//                     that.editUser(data);
//                }
//            })
			this.editUser();
		}
		UserList.prototype.removeUsers = function(){
			var that = this;
			var selected = that.list.getCheckedRecords();
			var selected_array = [];
			for (var i = 0; i < selected.length; i++){
				 selected_array[i] = selected[i].id;
			};
			if(selected_array.length == 0){
				V.alert("请选择用户记录！");
				return;
			}
			V.confirm('是否批量进行删除用户操作？',function(){
				var url = that.module+'/user!deleteAll.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
					data: {userIds: selected_array.join(',')},
	                success:function(data){
	                     //处理结果
	                     if(data == 'success'){
	                     	V.alert("批量删除用户操作成功！");
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
                		V.alert("保存成功！");
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
 			var alertMsg="是否锁定用户？";
 			if(user.status != '1'){
 				alertMsg="是否解锁用户？";
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
			this.forward("v.module.authority.postEdit",opts,function(p){
				p.addCrumb();
			});
		}
		UserList.prototype.editUser = function(user){
			if(user){
				this.options.user = user;
			}
			this.options.module = this.module;
			this.forward("v.module.authority.user",this.options,function(p){
				p.addCrumb();
			});
		}
		UserList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'用户管理'}});
		}
		UserList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'用户管理'}});
		}
	})(V.Classes['v.module.authority.UserList'])
},{plugins:["v.ui.grid","v.component.searchList","v.ui.pagination","v.component.form"]});
