;V.registPlugin("v.module.authority.postEdit",function(){
	V.Classes.create({
		className:"v.module.authority.PostEdit",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.module.authority.postEdit";
			this.post = null;
			this.state = 'view';//view || edit;
			this.module = '';
			this.controlPoint = null; //控制点列表
			this.resource = {
				html:'template.html'
			}
			this.authrities = [];
		}
	});
	(function(PostEdit){
        PostEdit.prototype.init = function(options){
			this.module = options.module;
			this.options = options;
			this.container = options.container;
			this.post = options.post || null;
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			//var isBuyer = (LoginInfo.user.businessRole == LoginInfo.businessRole.ENTERPRISE);
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					if(that.post['id'] == null){
						$(".manager,#role",that.container).hide();
						$('form',that.template).removeClass('view').addClass('edit');
						$('.group_view',that.template).hide();
						$('.group_edit',that.template).show();
					}
					else{
//						if(isBuyer){
//							$(".manager",that.template).show();
//						}else{
//							$(".manager",that.template).hide();
//						}
						$(".manager",that.template).show();
						//角色视图
						that.getRoles();
						//that.queryManager();
					}
					that.initEvent();
					that.initInfo();
					//that.listManager(); //控制点
				}
			})
		}
		PostEdit.prototype.initEvent = function(){
			var that = this;
			//var isBuyer = (LoginInfo.user.businessRole == LoginInfo.businessRole.ENTERPRISE);
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
				
				//组织机构选择按钮显示
				$('.selectOrg',that.template).show();
				that.resetViewText();
			});
			$('.group_edit .save',this.template).click(function(){
				var post = that.post;
				var flag = false;
				if(post['id'] == null){
					flag = true;
				}
				
				if(!that.validate()) return;
				
				$('*[data-key]',that.template).each(function(){
					var key = $(this).attr('data-key');
					if(!flag && key != 'code'){
						post[key] = $('.edit_input',this).val();
					}
					if(flag){
						post[key] = $('.edit_input',this).val();
					}
				});
				
				var url = that.module+'/post!save.action';
	            $.ajax({
	            	url:url,
	               	type:'post',
					data:JSON.stringify({post:post}),
					contentType:'application/json',
	                success:function(data){
	                	 $('.selectOrg',that.template).hide();
	                	 
	                     if(data == 'modify'){
								V.alert("岗位修改成功！");
								$('*[data-key]',that.template).each(function(){
									var key = $(this).attr('data-key');
									if(key == 'code'){
										$('.edit_input',this).attr('disabled','');
									}
									var value = post[key];
									$('.view_text',this).text(value);
									$('.edit_input',this).val(value);
								});
								$('form',that.template).removeClass('edit').addClass('view');
								$('.group_edit',that.template).hide();
								$('.group_view',that.template).show();
	                     }else if(data != null && data['id'] != null){
	                     		post['id'] = data['id'];
	                     	  $('*[data-key]',that.template).each(function(){
									var key = $(this).attr('data-key');
									if(key == 'code'){
										$('.edit_input',this).attr('disabled','');
									}
									var value = post[key];
									$('.view_text',this).text(value);
									$('.edit_input',this).val(value);
								});
//	                     	  	if(isBuyer){
//	                     	  		$(".manager,#role",that.container).show();
//	                     	  	}else{
//	                     	  		$("#role",that.container).show();
//	                     	  	}
								$('form',that.template).removeClass('edit').addClass('view');
								$('.group_edit',that.template).hide();
								$('.group_view',that.template).show();
								that.getRoles();
	                     }else if(data.msg == 'error'){
	                     	V.alert(data.info);
	                     }else{
	                     	V.alert(data);
	                     }
	                }
	            })
			});
			$('.group_edit .cancel',this.template).click(function(){
				if(that.post.id==null){
					var options = {}
					options.module = that.module;

					V.MessageBus.publish({eventId:'backCrumb'});
				}else{
					//cancel
					$(this).parents('.group_edit').hide();
					$('.group_view',that.template).show();
					$(this).parents('form').removeClass('edit').addClass('view');
					
					//隐藏验证时，产生的信息框
					$('.error_msg').empty().hide();
				}
				
				//组织机构选择按钮隐藏
				$('.selectOrg',that.template).hide();
			});
			
			//组织机构选择按钮隐藏
			if(that.post.id!=null)
				$('.selectOrg',that.template).hide();
				
			$('.selectOrg',this.template).click(function(){
				that.organizationSel();
			});
			
			//角色视图
			//that.getRoles();
			
			$('.view_roles',this.template).click(function(){
				//that.getRoles();
				that.addPost();
			});
			/**岗位管理-管理范围设置**/
			$('.matchset',this.template).click(function(){
				that.showTicketDialog();
			})
			$('.matchsetSave',this.template).click(function(){
				that.saveDocketTypeControl();
			})
			that.getModuleType();
		}
		PostEdit.prototype.initInfo = function(){
			var post = this.post;
			var flag = false;
			if(post['id'] == null){
				flag = true;
			}
			$('*[data-key]',this.template).each(function(){
				var key = $(this).attr('data-key');
				var value = post[key];
				$('.view_text',this).text(value);
				$('.edit_input',this).val(value);
				if(flag && key == 'code'){
					  $('.edit_input',this).removeAttr('disabled');
				}
				
				$('.view_text',this).css('padding-top','2px');
			});
		}
		PostEdit.prototype.resetViewText = function(){
			var post = this.post;
			$('*[data-key]',this.template).each(function(){
				var key = $(this).attr('data-key');
				var value = post[key];
				$('.edit_input',this).val(value);
			});
		}
		PostEdit.prototype.getRoles = function(){
			var that = this;
			var container = $('.rolelist',this.template).empty();
			var grid = this.roleGrid = new V.Classes['v.ui.Grid']();
			//update chenhaijun 
			if (this.post.id != null) {
				grid.setFilters({post:{id:this.post.id}});
			}
			grid.init({
				container:container,
				url:this.module+'/post!roleList.action',
				columns:[
                    {displayName:'角色编码',key:'roleCode',width:320}
                    ,{displayName:'角色名称',key:'roleName',width:320}
                    ,{displayName:'操作',key:'action',width:120,render:function(record){
                        var html = $('<div><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a><div>');
                        $('.remove',html).click(function(){
                            V.confirm('是否删除角色？',function(){
	                        	$.ajax({
					            	url:that.module+'/post!delPostRole.action',
					               	type:'post',
									data: {postId:that.post['id'],roleId:record['id']},
					                success:function(data){
					                	if(data.msg=='success'){
					                      	grid.removeRecord(record);
					                	}else{
					                    	V.alert(data.info);
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
		//添加岗位
		PostEdit.prototype.addPost = function(){
			var that = this;
			/**Dialog**/
			var addDlg = new V.Classes['v.ui.Dialog']();
			/**Grid**/
			var tempPost = $("<div></div>");
			var list  = new V.Classes['v.ui.Grid']();
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			list.init({
	                container:tempPost,
	                checkable:true,
					url:this.module+'/post!role.action',
	                columns:[
	                    {displayName:'角色名称',key:'roleName',width:280}
	                    ,{displayName:'角色编码',key:'roleCode',width:280}
						]
					 });
			
			this.subscribe(list,list.EVENT.DATA_RETRIEVED,function(){
				//处理列表中出现的记录，在弹出窗口选中
				var roleGridData = that.roleGrid.options.data; //已经选中的记录
				var tempData = list.options.data;              //全部记录
				if(roleGridData==null) return;
				$.each(roleGridData,function(index,dom){
					var id = roleGridData[index].id;
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
				if(selected.length<=0){
					V.alert("请选择要授权的角色！");
					return;
				}
				var post = that.post;
				  $.ajax({
	            	url:that.module+'/post!saveprole.action',
	               	type:'post',
					data: {roleIds: selected_array.join(','),postid:post['id']},
	                success:function(data){
	                	if(data.msg=='success'){
	                		addDlg.close();
	                		that.roleGrid.refresh();
	                	}else{
	                		V.alert(data.info);
	                	}
	                }
	            })
			}},{text:"取消",handler:addDlg.close}]});
			addDlg.init({title:'角色列表',height:492,width:660});
			 
			/**将Grid中的数据加入到Dialog中**/
			addDlg.setContent(tempPost);
		}
		//选择组织机构
		PostEdit.prototype.organizationSel = function(){
			var that = this;
			var treeDiv = $('<div></div>');
		    this.orgTree = new V.Classes['v.ui.Tree']();
			this.orgTree.init({
				 container:treeDiv,
				 dragable : true,
				 dropable : true,
				 //url : 'backoffice/systemsetting/org/organization!input.action',
				 url:'backoffice/authority/post/post!queryOrg.action',
				 async : true,
				 contextMenu:function(node){
				     
				 }
			});
			this.subscribe(this.orgTree,this.orgTree.EVENT.SELECT,function(data){
				var node = data.node;
				var id = node.options.id;
				var name = node.options.name;
				$('.org_code',that.template).val(id);
				$('.org_code',that.template).parent().find('.view_text').text(id);
				$('.org_name',that.template).val(name);
				//$('.org_name',that.template).parent().find('.view_text').text(name);
				addDlg.close();
			});
			
			/**Dialog**/
			var addDlg = new V.Classes['v.ui.Dialog'](); 
			//addDlg.setBtnsBar({btns:[{text:"取消",handler:addDlg.close}]});
			addDlg.init({title:'组织机构列表',height:492,width:660});
			 
			/**将Grid中的数据加入到Dialog中**/
			addDlg.setContent(treeDiv);
		}
		
		
		//选择控制点对话框
		PostEdit.prototype.showTicketDialog = function(){
			var that = this;
			
			var diaDlg = this.controlsDialog = new V.Classes['v.ui.Dialog']();
			var dlgTemplate = $('<div>\
					<div class="form-search control-group">\
						<label class="checkbox"> 系统模块：\
							<select class="modulesType input-medium"></select>\
						</label>\
						<label class="checkbox">选择单据类型：\
							<select class="ticketType input-medium"></select>\
						</label>\
						<label class="checkbox lbl_tableType">选择单据结构：\
							<select class="tableType input-small">\
								<option value="false">主表</option>\
								<option value="true">从表</option>\
							</select>\
						</label>\
					</div>\
					<div class="grid"></div>\
				</div>');
			diaDlg.setContent(dlgTemplate);
			
			$.each(this.modules,function(index){
				var opt = $('<option>'+this.moduleName+'</option>');
				opt.attr('value',this.moduleCode);
				$('.modulesType',dlgTemplate).append(opt);
				if(index == 0){
					that.getTicketType(this.moduleCode);
				}
			})
			
			var list = this.docketTypeList = new V.Classes['v.ui.Grid']();
			
			var modulesType = $('.modulesType',dlgTemplate);
			var ticketType = $('.ticketType',dlgTemplate);
			var tableType = $('.tableType',dlgTemplate);
			
			var filter = {};
			filter.moduleCode = modulesType.val();
			filter.value = ticketType.val();
			filter.tableType = tableType.val();
			
			list.setFilters(filter);
			
			list.init({
				url:this.module+'/entityFieldCustom.action',
				container:$('.grid',dlgTemplate).empty(),
                checkable:true,
                columns:[
                    {displayName:'字段编码',key:'fieldName'},     
                    {displayName:'字段名称',key:'fieldLabel'},
                    {displayName:'字段类型',key:'dataType',render:function(record){
                    	return CONSTANT.DATATYPE[record.dataType]
                    }}
                ]
            });
			
			this.subscribe(list,list.EVENT.DATA_RETRIEVED,function(){
				var controlGridData = that.controlList.options.data; //已经选中的记录
				var tempData = list.options.data;              //全部记录
				if(controlGridData==null) return;
				$.each(controlGridData,function(index,dom){
					var code = this.moduleCode+this.ticketType+this.tableType+this.fieldName;
					$.each(tempData,function(tIndex,tDom){
						var tcode = modulesType.val()+ticketType.val()+tableType.val()+this.fieldName;
						if(code==tcode){
							tempData.splice(tIndex,1);
						}
					});
				});
			});
			
			diaDlg.setBtnsBar({
				position:'right',
				btns:[
				      {text:'确定',style:'btn-primary',handler:function(){
				    	  var records = list.getCheckedRecords();
				    	  if(records.length==0){
				    		  V.alert('请选择记录！');
				    		  return;
				    	  }
				    	  
				    	  var data = ticketType.find('option:selected').data('data');
				    	  var classCode = data.masterEntityName;
				    	  var className = data.name;
				    	  if($('.tableType',dlgTemplate).val()=='true'){
				    		  classCode = data.detailEntityName;
				    	  }
				    	 
				    	  var control = [];
				    	  $.each(records,function(){
				    		  var record = {};
				    		  record.moduleCode = modulesType.val();
				    		  record.moduleName = modulesType.find('option:selected').text();
				    		  record.classCode = classCode;
				    		  record.className = className;
				    		  record.fieldName = this.fieldName;
				    		  record.fieldLabel = this.fieldLabel;
				    		  
				    		  record.dataType = this.dataType;
				    		  record.dictTypeCode = this.dictTypeCode;
				    		  record.ns = this.ns;
				    		  record.url = this.url;
				    		  record.params = this.params;
				    		  record.tableType = tableType.val();
				    		  record.ticketType = ticketType.val();
				    		  control.push(record);
				    	  })
				    	  that.saveColumnsToControl(control);
				    	  diaDlg.close();
				      }},
				      {text:'取消',handler:function(){
				    	  this.close();
				      }}
				      ]
			});
			diaDlg.init({
				width:900,
				height:600,
				title:'选择控制点'
			});
			$('.checkbox',dlgTemplate).css({'margin-right':'20px'});
			
			//选择模块
			$('.modulesType',dlgTemplate).change(function(){
				var type = this.value;
				that.getTicketType(type);
			});
			//选择单据类型
			$('.ticketType',dlgTemplate).change(function(){
				if($(this).find('option:selected').data('data').hasDetail==true){
					$('.lbl_tableType',that.controlsDialog.template).show();
				}else{
					$('.lbl_tableType',that.controlsDialog.template).hide();
				}
				$('.tableType',dlgTemplate).val('false');
				
				var filter = {};
				filter.moduleCode = $('.modulesType',dlgTemplate).val();
				filter.value = $('.ticketType',dlgTemplate).val();
				filter.tableType = $('.tableType',dlgTemplate).val();
				list.setFilters(filter);
				list.refresh();
			});
			//选择表类型
			$('.tableType',dlgTemplate).change(function(){
				var filter = {};
				filter.moduleCode = $('.modulesType',dlgTemplate).val();
				filter.value = $('.ticketType',dlgTemplate).val();
				filter.tableType = $('.tableType',dlgTemplate).val();
				list.setFilters(filter);
				list.refresh();
			});
		}
		//获取模块
//		PostEdit.prototype.getModuleType = function(){
//			var that = this;
//		     $.ajax({
//			 	url:this.module+'/moduleList.action',
//				dataType:'json',
//				success:function(systemModules){
//					that.modules = systemModules||[];
//				}
//			 });
//		};
		//获取单据类型
//		PostEdit.prototype.getTicketType = function(moduleCode){
//			var that = this;
//			$('.ticketType',that.controlsDialog.template).empty();
//		     $.ajax({
//			 	url:this.module+'/ticketList.action',
//				dataType:'json',
//				async:false,
//				data:{moduleCode:moduleCode},
//				success:function(tickets){
//					tickets = that.tickets = tickets||[];
//					$.each(tickets,function(index){
//						var opt = $('<option>'+this.name+'</option>');
//						opt.attr('value',this.value);
//						opt.data('data',this);
//						$('.ticketType',that.controlsDialog.template).append(opt);
//						if(index == 0){
//							if(this.hasDetail){
//								$('.lbl_tableType',that.controlsDialog.template).show();
//							}else{
//								$('.lbl_tableType',that.controlsDialog.template).hide();
//							}
//							$('.tableType',that.controlsDialog.template).val('false');
//							$('.ticketType',that.controlsDialog.template).change();
//						}
//					})
//				}
//			 }) ;
//		};
		//列出定制单据数据
//		PostEdit.prototype.listManager = function(){
//			var that = this;
//			
//        	var list = this.controlList = new V.Classes['v.ui.Grid']();
//			list.init({
//				data:that.authrities,
//                container:$('.controlPoint',that.template).empty(),
//                checkable:false,
//                columns:[
//                    {displayName:'模块名称',key:'moduleName'},
//                    {displayName:'单据名称',key:'className'},
//                    {displayName:'字段名称',key:'fieldLabel'},
//                    {displayName:'范围',key:'value'},
//                    {displayName:'操作',key:'action',width:50,render:function(record){
//                        var html = $('<div><a class="remove" style="margin:0 10px" href="javascript:void(0);" title="删除"><i class="icon-remove"></i></a>\
//                        			<a class="edit" href="javascript:void(0);" title="编辑"><i class="icon-edit"></i></a><div>');
//                        $('.edit',html).click(function(){
//                            that.editRange(record);
//                        });
//                        $('.remove',html).click(function(){
//                        	var index = list.getRecordIndex(record);
//                            list.removeRecord(record);
//                            data.splice(index,0);
//                        });
//                        return html;
//                    }}
//                ]
//            });
//		}
		//查询岗位控制点数据
		PostEdit.prototype.queryManager = function(){
			var that = this;
			var url = that.module+'/post!queryAuth.action';
	        $.ajax({
                url:url,
                type:'post',
                async:false,
                contentType:'application/json',
                data:JSON.stringify({postId:that.post.id}),
                success:function(authrities){
                	that.authrities = authrities;
                }
	        })
		}
		//编辑范围
		PostEdit.prototype.editRange = function(record){
			var that = this;
			var list = new V.Classes['v.ui.Grid']();
			
			var diaDlg = new V.Classes['v.ui.Dialog']();
			var con = $('<div class="docket" style="text-align:center;"></div>');
			
			var Form = V.Classes['v.component.Form'];
			
			var editValues = record.value||'';
			editValues = editValues.split(',');
			if(record.dataType==Form.TYPE.PLUGIN){
				var startEle = $('<div><div>开始值：</div></div>');
				var endEle = $('<div><div>结束值：</div></div>');
				
				V.loadPlugin(record.ns,function(){
					var glass = V._registedPlugins[record.ns].glass;
					var inst = new V.Classes[glass]();
					inst.init({
						container:startEle,
						config:{
							label:record.fieldLabel,
							value:editValues[0]||'',
							url:record.url,
							params:record.params
						}
					});
					$('div',startEle).css({'display':'inline','margin-right':'10px'});
					$('input',startEle).css({'margin-right':'10px'});
					$('button',startEle).css({'margin':'-10px 0px 0px 0px'});
				});
				V.loadPlugin(record.ns,function(){
					var glass = V._registedPlugins[record.ns].glass;
					var inst = new V.Classes[glass]();
					inst.init({
						container:endEle,
						config:{
							label:record.fieldLabel,
							value:editValues[1]||''
						}
					});
					$('div',endEle).css({'display':'inline','margin-right':'10px'});
					$('input',endEle).css({'margin-right':'10px'});
					$('button',endEle).css({'margin':'-10px 0px 0px 0px'});
				});
				con.append(startEle).append(endEle);
			}else if(record.dataType==Form.TYPE.SELECT){
				var dictTypeCode = DictInfo.getList(record.dictTypeCode);
				$.each(dictTypeCode,function(){
					var checkEle = $('<span style="margin:0 10px">'+this[0]+'：</span>');
					var checkbox = $('<input type="checkbox">');
					checkbox.attr('name',record.fieldName);
					checkbox.attr('value',this[1]);
					if($.inArray(this[1],editValues)!=-1){
						checkbox.attr('checked',true);
					}
					checkEle.append(checkbox);
					con.append(checkEle);
				})
			}else if(record.dataType==Form.TYPE.DATE){
				var startEle = $('<div><span>开始值：</span><input class="datepicker" type="text" name="startValue" value=""></div>');
				var endEle = $('<div><span>结束值：</span><input class="datepicker" type="text" name="endValue" value=""></div>');
				con.append(startEle).append(endEle);
				$('.datepicker',con).datepicker({
			         dateFormat: "yy-mm-dd",
					 showMonthAfterYear:true,
					 changeMonth: true,
		             changeYear: true
		          });
				$('input',startEle).val(editValues[0]||'');
				$('input',endEle).val(editValues[1]||'');
			}else{
				var startEle = $('<div><span>开始值：</span><input type="text" name="startValue" value=""></div>');
				var endEle = $('<div><span>结束值：</span><input type="text" name="endValue" value=""></div>');
				con.append(startEle).append(endEle);
				$('input',startEle).val(editValues[0]||'');
				$('input',endEle).val(editValues[1]||'');
			}
			diaDlg.setContent(con);
			diaDlg.setBtnsBar({
				position:'right',
				btns:[
				      {text:'确定',style:'btn-primary',handler:function(){
				    	  var values = [];
				    	  if(record.dataType==Form.TYPE.SELECT){
				    		  $('input:checked',diaDlg.template).each(function(){
					    		  values.push($(this).val());
					    	  })
				    	  }else{
				    		  $('input',diaDlg.template).each(function(){
				    			  if($(this).val()=='') return true;
				    			  values.push($(this).val());
				    		  })
				    	  }
				    	  
				    	  if(values.join('')==''){
				    		V.alert('请输入数值！');
				    		return;
				    	  }
				    	  
				    	  record.value = values.join(',');
				    	  that.controlList.renderRow(record);
				    	  diaDlg.close();
				      }},
				      {text:'取消',handler:function(){
				    	  this.close();
				      }}
				      ]
			});
			diaDlg.init({
				width:500,
				height:200,
				title:'编辑范围'
			});
		}
		//保存单据字段到控制点列表
		PostEdit.prototype.saveColumnsToControl = function(records){
			var data = this.controlList.options.data;
			$.merge(data,records);
			this.controlList.refresh();
		}
		//保存控制点
		PostEdit.prototype.saveDocketTypeControl = function(values){
			var that = this;
			var data = this.controlList.options.data;
            var url = that.module+'/post!saveauth.action';
        	$.ajax({
                url:url,
                type:'post',
                contentType:'application/json',
                data:JSON.stringify({authrities:data,postId:that.post.id}),
                success:function(data){
                    if(data=='success'){
                    	V.alert('保存成功！');
                    }else{
                        V.alert(data);
                    }
                }
            })
		}
		//自己定义的form验证
		PostEdit.prototype.validate = function(){
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
		PostEdit.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'岗位编辑'}});
		}
	})(V.Classes['v.module.authority.PostEdit'])
},{plugins:["v.ui.grid","v.ui.pagination","v.module.authority.postControlPoint",'v.ui.alert','v.fn.validator','v.ui.tree']});
