;V.registPlugin("v.views.backoffice.authority.postList",function(){
	V.Classes.create({
		className:"v.views.backoffice.authority.PostList",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = "v.views.backoffice.authority.postList";
            //this.posts = {};
			this.module = '';
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.Grid']();
			this.EVENT ={
		        VIEW_ROLE:'view_role'
		    };
		}
	});
	(function(PostList){
		PostList.prototype.initConditionForm = function(){
			    var Form = V.Classes['v.component.Form'];
				var items = [
					       {label:'岗位编码',type:Form.TYPE.TEXT,name:'code',value:''},
						   {label:'岗位名称',type:Form.TYPE.TEXT,name:'name',value:''},
						   {label:'所属区域',type:Form.TYPE.TEXT,name:'domain',value:''}
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
        PostList.prototype.initList = function(){
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			list.setFilters(this.options.filters);
            var that = this;
            list.init({
                container:$('.list',this.template),
                checkable:true,
				url:this.module+'/post!list.action',
                columns:[
                    {displayName:'岗位编码',key:'code',width:120},
                    {displayName:'岗位名称',key:'name',width:120},
                    {displayName:'角色',key:'roles',width:120,render:function(record){
                        var role = record.roles;
                        var html = $('<span></span>');
                        if(role&&role.length>0){
                            for(var i=0,l=role.length;i<l;i++){
                               var item = $( "<a href='#' style='display:block' data-id='"+role[i].id+"'>"+role[i].roleName+"</a>");
								item.data('role',role[i]);
								item.click(function(){
									that.viewRole($(this).data('role'));
								})
                                html.append(item);
                            }
                            return html;
                        }
                     }},
                     {displayName:'修改时间',key:'modifyDate',width:200},
                     {displayName:'修改人',key:'modifyName',width:120},
                     {displayName:'所在区域',key:'domain',width:120},
                     {displayName:'操作',key:'action',width:80,render:function(record){
                        var html = $('<div class="action"><a class="change" href="javascript:void(0);" title="修改"><i class="icon-edit"></i></a><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a></div>');
                        $('.change',html).click(function(){
                            that.editPost(record);
                        });
                        $('.remove',html).click(function(){
                        	that.removePost(record);
                        });
                        return html;
                    }}
                ],
                toolbar:[
			          {eventId:'add',text:'新增岗位',icon:'icon-plus'},
					  {eventId:'remove',text:'删除岗位',icon:'icon-remove'}
//			          ,
//					  {eventId:'createJson',text:'生成json数据',icon:'icon-tool'}
				]
            });
            this.subscribe(list,'add',this.addPost);
			this.subscribe(list,'remove',this.removePosts);
//			this.subscribe(list,'createJson',this.createJsonData);
            this.container.append(this.template);
        };
        PostList.prototype.addPost = function(){
			var that = this;
			var url = this.module+'/post!input.action';
            $.ajax({
            	url:url,
               	type:'POST',
				data:JSON.stringify({id:null}),
				contentType:'application/json',
                success:function(data){
                		that.editPost(data);
                }
            })
		}
		PostList.prototype.removePost = function(post){
			var that = this;
			post.modifyDate = null;
			var url = this.module+'/post!delete.action';
			V.confirm('是否删除岗位？',function(){
				$.ajax({
	            	url:url,
	               	type:'POST',
					data:JSON.stringify({post:post}),
					contentType:'application/json',
	                success:function(data){
	                	if(data.msg=='success'){
	                		V.alert('删除岗位成功！');
	                		that.list.removeRecord(post);
	                	}else{
	                     	  V.alert(data.info);		
	                    }
	                }
	            })
			});
		}
		PostList.prototype.removePosts = function(){
			var that = this;
			var selected = that.list.getCheckedRecords();
			var selected_array = [];
			for (var i = 0; i < selected.length; i++){
				 selected_array[i] = selected[i].id;
			};
			if(selected_array.length == 0) {
				V.alert("请选择岗位记录！");
				return;
			}
			var url = this.module+'/post!deleteAll.action';
			V.confirm('是否批量进行删除岗位操作？',function(){
	            $.ajax({
	            	url:url,
	               	type:'POST',
					data: {postIds: selected_array.join(',')},
	                success:function(data){
	                     //处理结果
	                     if(data == 'success'){
	                     	V.alert("批量删除岗位操作成功！");
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
			//V.alert('remove posts');
		}
        PostList.prototype.savePost = function(post){
        	var url = this.module+'/post!save.action';
            $.ajax({
            	url:url,
               	type:'POST',
				data:JSON.stringify({post:post}),
				contentType:'application/json',
				dataType:'json',
                success:function(data){
                     //处理结果
                     alert(data.responseText);
                },
                error:function(){
                     //alert("error");
                }
            })
        };
        //生成岗位json数据
        PostList.prototype.createJsonData = function(){
            $.ajax({
                url:'backoffice/authority/json/json-mgr!getJson.action',
                type:'POST',
                //contentType:'application/json',
                success:function(data){
	            	alert(data.msg);
                }
            })
        }
        PostList.prototype.editPost = function(post){
			this.options.post = post;
			this.options.module = this.module;
	   		this.forward('v.views.backoffice.authority.postEdit',this.options,function(p){
				p.addCrumb();
			});
		}
		PostList.prototype.viewRole = function(role){
			var opts = {
				role: role,
				module:'backoffice/authority/role'
			};
//			this.options.role = role;
//			this.options.module = 'backoffice/authority/role';
			this.forward('v.views.backoffice.authority.roleEdit',opts,function(p){
				p.addCrumb();
			});
		}
		PostList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'岗位管理'}});
		}
		PostList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'岗位管理'}});
		}
	})(V.Classes['v.views.backoffice.authority.PostList'])
},{plugins:["v.ui.grid","v.views.component.searchList","v.ui.pagination","v.component.form"]});
