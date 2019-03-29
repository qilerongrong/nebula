;V.registPlugin("v.module.authority.roleEdit",function(){
	V.Classes.create({
		className:"v.module.authority.RoleEdit",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.module.authority.roleEdit";
			this.role = null;
			this.state = 'view';//view || edit;
			this.module = '';
			this.resource = {
				html:'template.html'
			}
		}
	});
	(function(RoleEdit){
        RoleEdit.prototype.init = function(options){
			this.container = options.container;
			this.module = options.module;
			this.role = options.role || null;
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					that.initEvent();
					that.initInfo();
					if(that.role['id'] == null){
						$("#role",that.container).hide();
						$('form',that.template).removeClass('view').addClass('edit');
						$('.group_view',that.template).hide();
						$('.group_edit',that.template).show();
					}
					else{
					    that.authoritySetting();
					}
				}
			})
		}
		RoleEdit.prototype.initEvent = function(){
			var that = this;
			
			/**设置验证**/
			$('*[data-validator]',this.template).keyup(function(e){
				var v = this.value;
				var rules = $(this).attr('data-validator');
				var required = $(this).attr('data-required')||'false';
				
				if(required=='true'&&v==""){
					$(this).parent().find('.error_msg').text("该值不可为空").show();
					return false;
				}
				var msg = Validator.validate(rules,v);
				if(msg){
					$(this).parent().find('.error_msg').text(msg).show();
				}else{
					$(this).parent().find('.error_msg').empty().hide();
				}
			})
			
			$('.group_view .edit',this.template).click(function(){
				$(this).parents('.group_view').hide();
				$('.group_edit',that.template).show();
				$(this).parents('form').removeClass('view').addClass('edit');
				that.resetViewText(); //reset view_text content
			});
			$('.group_edit .save',this.template).click(function(){
				var role = that.role;
				var flag = false;
				if(role['id'] == null){
					flag = true;
				}
				$('*[data-key]',that.template).each(function(){
					var key = $(this).attr('data-key');
					if(!flag && key != 'roleCode'){
						role[key] = $('.edit_input',this).val();
					}
					if(flag){
						role[key] = $('.edit_input',this).val();
					}
				});
				if(!that.validate()) return;
				var url = that.module+'/role!save.action';
	            $.ajax({
	            	url:url,
	               	type:'post',
					data:JSON.stringify({role:role}),
					contentType:'application/json',
	                success:function(data){
	                     if(data == 'modify'){
							V.alert("修改成功！");
							$('*[data-key]',that.template).each(function(){
									var key = $(this).attr('data-key');
									if(key == 'roleCode'){
										$('.edit_input',this).attr('disabled','');
									}
									var value = role[key];
									$('.view_text',this).text(value);
									$('.edit_input',this).val(value);
								});
							$('form',that.template).removeClass('edit').addClass('view');
							$('.group_edit',that.template).hide();
							$('.group_view',that.template).show();
	                     }else if(data.msg == 'error'){
	                     	V.alert(data.info);
	                     }else if(data != null && data['id'] != null){
	                     		role['id'] = data['id'];
	                     	    $('*[data-key]',that.template).each(function(){
									var key = $(this).attr('data-key');
									if(key == 'roleCode'){
										$('.edit_input',this).attr('disabled','');
									}
									var value = role[key];
									$('.view_text',this).text(value);
									$('.edit_input',this).val(value);
								});
								$("#role",that.container).show();
								$('form',that.template).removeClass('edit').addClass('view');
								$('.group_edit',that.template).hide();
								$('.group_view',that.template).show();
								
								that.authoritySetting();
	                     }else{
	                     	V.alert(data);
	                     }
	                }
	            })
			});
			$('.group_edit .cancel',this.template).click(function(){
				if(that.role.id==null){
					var options = {}
					options.module = that.module;
					//that.forward('v.module.authority.roleList',options);
					V.MessageBus.publish({eventId:'backCrumb'});
				}else{
					//cancel
					$(this).parents('.group_edit').hide();
					$('.group_view',that.template).show();
					$(this).parents('form').removeClass('edit').addClass('view');
					
					//隐藏验证时，产生的信息框
					$('.error_msg').empty().hide();
				}
			});
			//this.addCrumb();
		}
		RoleEdit.prototype.initInfo = function(){
			var role = this.role;
			var flag = false;
			if(role['id'] == null){
				flag = true;
			}
			$('*[data-key]',this.template).each(function(){
				var key = $(this).attr('data-key');
				var value = role[key];
				$('.view_text',this).text(value);
				$('.edit_input',this).val(value);
				if(flag){
					$('.edit_input',this).removeAttr('disabled');
				}
				
				$('.view_text',this).css('padding-top','2px');
			});
		}
		RoleEdit.prototype.resetViewText = function(){
			var role = this.role;
			$('*[data-key]',this.template).each(function(){
				var key = $(this).attr('data-key');
				var value = role[key];
				$('.edit_input',this).val(value);
			});
		}
		RoleEdit.prototype.authoritySetting = function(){
		    var that = this;
		    $('.edit_authority',this.template).click(function(){
                that.publish({eventId:'authority_edit',data:''});
            });
            
            var authority = new V.Classes['v.module.authority.AuthoritySetting']();
            var data = {
                instance:this,
                id:that.role['id'],
                roleId:that.role['id'],
                module:that.module,
                action:'role'
            }
            authority.init(data);
            $('.authority_list',this.template).append(authority.template);
		}
		RoleEdit.prototype.getRoles = function(){
			var that = this;
			var container = $('.rolelist',this.template).empty();
			var grid = this.menuList = new V.Classes['v.ui.Grid']();
			grid.setFilters({role:{id:this.role.id}});
			grid.init({
				container:container,
				url:this.module+'/role!menuList.action',
				columns:[
                    {displayName:'菜单编码',key:'menuCode',width:320}
                    ,{displayName:'菜单名称',key:'menuName',width:320}
                    ,{displayName:'操作',key:'action',width:120,render:function(record){
                        var html = $('<div><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a><div>');
                        $('.remove',html).click(function(){
                        	V.confirm('是否删除菜单？',function(){
	                        	$.ajax({
					            	url:that.module+'/role!delRoleMenu.action',
					               	type:'post',
									data: {menuId:record['id'],roleId:that.role['id']},
					                success:function(data){
					                	if(data=='success'){
					                		//V.alert('菜单删除成功！');
					                      	grid.removeRecord(record);
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
                ]
			});
		}
		/*控制台权限*/
		RoleEdit.prototype.getHomecmts = function(){
			var container = $('.homecmtlist',this.template).empty();
			var that = this;
			var role = that.role;
			var grid = this.consoleList = new V.Classes['v.ui.Grid']();
			grid.setFilters({role:{id:this.role.id}});
			grid.init({
				container:container,
				url:that.module+'/role!listHomecmts.action',
				columns:[
                    {displayName:'名称',key:'homeName',width:320}
                    ,{displayName:'类型',key:'homeType',width:320}
                    ,{displayName:'操作',key:'action',width:120,render:function(record){
                        var html = $('<div><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a><div>');
                        $('.remove',html).click(function(){
                        	V.confirm('是否删除控制台？',function(){
	                            $.ajax({
					            	url:that.module+'/role!deleteRoleHomecmt.action',
					               	type:'post',
									data: {homeId:record['id'],roleId:role['id']},
					                success:function(data){
					                	if(data=='success'){
					                		//V.alert('控制台权限删除成功！');
					                      	grid.removeRecord(record);
					                	}
					                    else{
					                    	V.alert(data);
					                    }  	
					                }
					            })
				            })
                        });
                        return html;
                    }}
                ]
			});
		}
		/*控制台列表*/
		RoleEdit.prototype.addHomecmt = function(){
			var that = this;
			/**Dialog**/
			var addDlg = new V.Classes['v.ui.Dialog']();
			/**Grid**/
			var tempHome = $("<div></div>");
			var list  = new V.Classes['v.ui.Grid']();
			//var pagination = new V.Classes['v.ui.Pagination']();
			//list.setPagination(pagination);
			
			list.init({
	                container:tempHome,
	                checkable:true,
					url:this.module+'/role!listHomecmts.action',
	                columns:[
	                    {displayName:'名称',key:'homeName',width:280}
	                    ,{displayName:'类型',key:'homeType',width:280}
						]
					 });
			
			this.subscribe(list,list.EVENT.DATA_RETRIEVED,function(){
				//处理列表中出现的记录，在弹出窗口选中
				var consoleData = that.consoleList.options.data;
				var tempData = list.options.data;
				$.each(consoleData,function(index,dom){
					var id = consoleData[index].id;
					$.each(tempData,function(tIndex,tDom){
						if(id==tempData[tIndex].id)
							tempData[tIndex]['checked'] = true;
					});
				});
			});
			
			 
			addDlg.setBtnsBar({btns:[{text:"授权",style:"btn-primary",handler:function(){
				var selected = list.getCheckedRecords();
				var selected_array = [];
				for (var i = 0; i < selected.length; i++){
					 selected_array[i] = selected[i].id;
				};
				var role = that.role;
				$.ajax({
	            	url:that.module+'/role!saveHomecmt.action',
	               	type:'post',
					data: {homeIds: selected_array.join(','),roleId:role['id']},
	                success:function(data){
	                	if(data == 'success'){
	                      	//V.alert('控制台权限授权保存成功！');
						  	addDlg.close();
						  	that.consoleList.refresh();
						}
						else{
							V.alert(data);
						}
	                }
	            })
			}},{text:"取消",handler:addDlg.close}]});
			addDlg.init({title:'控制台列表',height:492,width:660});
			 
			/**将Grid中的数据加入到Dialog中**/
			addDlg.setContent(tempHome);
			
		}
		
		RoleEdit.prototype.addMenu = function(){
			var that = this;
			var role = that.role;
			var container = this.container;
			/**Dialog**/
			var addDlg = new V.Classes['v.ui.Dialog']();
			var tree = $("<div><div id='cont_tree'></div></div>");
			var menu_tree = new V.Classes['v.ui.Tree']();
			addDlg.setContent(tree);
			$.ajax({
				url:that.module+'/menuTree.action',
				type:'post',
				data:{roleId:role.id},
				//contentType:'application/json',
				success:function(data){
					this.menus = data.treeViews;
					menu_tree.init({
						checkable: true,
						data: this.menus,
						container:addDlg.getContent()
					});
				},
				error:function(){
					this.log('get Menus failed!');
				}
			});
			addDlg.setBtnsBar({btns:[{text:"授权",style:"btn-primary",handler:function(){
				//menu_tree.getSelectedNodeIds()
				
				var checkedArr = menu_tree.getSelectedNodeIds();
				if(checkedArr.length == 0) {
					V.alert("请选择菜单！");
					return;
				}
				var checkedIds = '';
				for(i=0; i < checkedArr.length; i++) {
					checkedIds += checkedArr[i]+',';
				}
				
				var role = that.role;
				$.ajax({
	            	url:that.module+'/role!saveDate.action',
	               	type:'post',
					data:{roleId:role['id'],checkedIds:checkedIds.substring(0,checkedIds.length-1)},
					//contentType:'json',
	                success:function(data){
	                     addDlg.close();
	                     that.menuList.refresh();
	                }
	            })
				
			}},{text:"取消",handler:addDlg.close}]});
			addDlg.init({title:'菜单树',height:592,width:660});
			
		}
		//自己定义的form验证
		RoleEdit.prototype.validate = function(){
			var isValid = true;
			$('*[data-validator]:visible',this.template).each(function(){
				var required = $(this).attr('data-required')||false;
				var rules = $(this).attr('data-validator')||'';
				var v = $(this).val();
				if(required=="true"&&v==""){
						$(this).parent().find('.error_msg').text("该值不可为空").show();
						isValid = false;
				}else{
					if(rules){
						var msg = Validator.validate(rules,v);
						if(msg){
							$(this).parent().find('.error_msg').text(msg).show();
							isValid = false;
						}else{
							$(this).parent().find('.error_msg').empty().hide();
						}
					}else{
						$(this).parent().find('.error_msg').empty().hide();
					}
				}
			});
			return isValid;
		}
		RoleEdit.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'角色维护'}});
		}
	})(V.Classes['v.module.authority.RoleEdit'])
},{plugins:["v.ui.grid","v.ui.pagination","v.ui.tree",'v.ui.alert','v.fn.validator','v.module.authority.authoritySetting']});
