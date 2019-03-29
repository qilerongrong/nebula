;V.registPlugin("v.views.backoffice.authority.postEdit",function(){
	V.Classes.create({
		className:"v.views.backoffice.authority.PostEdit",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.backoffice.authority.postEdit";
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
			var isBuyer = (LoginInfo.user.businessRole == LoginInfo.businessRole.ENTERPRISE);
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
						if(isBuyer){
							$(".manager",that.template).show();
						}else{
							$(".manager",that.template).show();//supplier
						}
						//角色视图
						that.getRoles();
						that.queryManager();
					}
					that.initEvent();
					that.initInfo();
					that.listManager(); //控制点
				}
			})
		}
		PostEdit.prototype.initEvent = function(){
			var that = this;
			var isBuyer = (LoginInfo.user.businessRole == LoginInfo.businessRole.ENTERPRISE);
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
				//$('.selectArea',that.template).show();
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
				
				if (post.orgName) {
					post['orgName'] = post.orgName;//orgName
				}
				if (post.orgCode) {
					post['orgCode'] = post.orgCode;//orgCode
				}
				if (post.orgType) {
					post['orgType'] = post.orgType;//orgType
				}
				
//				var tmp = [];
//				$(':input[name="ext1"]:checked',that.template).each(function(){
//					tmp.push(this.value);
//				})
//				post['ext1'] = tmp.join(',');
				var url = that.module+'/post!save.action';
	            $.ajax({
	            	url:url,
	               	type:'post',
					data:JSON.stringify({post:post}),
					contentType:'application/json',
	                success:function(data){
	                	 $('.selectOrg',that.template).hide();
	                	 //$('.selectArea',that.template).hide();
	                	
	                     if(data.result == 'modify'){
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
//	                     		post['id'] = data['id'];
	                     		that.post = data;
	                     	  $('*[data-key]',that.template).each(function(){
									var key = $(this).attr('data-key');
									if(key == 'code'){
										$('.edit_input',this).attr('disabled','');
									}
									var value = post[key];
									$('.view_text',this).text(value);
									$('.edit_input',this).val(value);
								});
	                     	  	if(isBuyer){
	                     	  		$(".manager,#role",that.container).show();
	                     	  	}else{
	                     	  		$("#role",that.container).show();
//	                     	  		$(".manager",that.container).show(); //supplier
	                     	  	}
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
				$('.selectArea',that.template).hide();
			});
			
			//组织机构选择按钮隐藏
			if(that.post.id!=null){
				
				$('.selectArea',that.template).hide();
				$('.selectOrg',that.template).hide();
			}
				
			$('.selectOrg',this.template).click(function(){
				that.organizationSel();
			});
			$('.selectArea',this.template).click(function(){
				that.selectArea();
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
			$('.express',this.template).click(function(){
				that.editExpress();
			})
			that.getModuleType();
			that.getArea();
			
			$('.saveTip',that.template).tooltip({
                title:'<p style="line-height:20px;text-align:left;margin:0;">保存之后，设置才会生效</p>'
                   ,placement:'right'
                   ,html:'true'
			});
			
			$('.view_area',this.template).click(function(){
				that.addArea();
			});
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
				var type = $(this).attr('data-type');
				$('.view_text',this).text(value);
				$('.edit_input',this).val(value);
				if(flag && key == 'code'){
					  $('.edit_input',this).removeAttr('disabled');
				}
				
				if(type=='select'){
					//处理下拉框初始化数据
					var selObj = $('select',this);
					selObj.val(value);
					$('.view_text',this).text(selObj.find('option:selected').text());
				}
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
		//添加角色
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
	                    {displayName:'角色名称',key:'roleName',width:200}
	                    ,{displayName:'角色编码',key:'roleCode',width:200}
	                    ,{displayName:'区域',key:'domain',width:180}
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
				var orgName = node.options.name;
				var orgCode = node.options.data.orgCode;
				var orgType = node.options.treeNodeType;
				$('.org_code',that.template).val(orgCode);
				$('.org_name',that.template).val(orgName);
				$('.org_type',that.template).val(orgType);
				$('.org_name',that.template).parent().find('.view_text').text(orgName);
				addDlg.close();
			});
			
			/**Dialog**/
			var addDlg = new V.Classes['v.ui.Dialog'](); 
			//addDlg.setBtnsBar({btns:[{text:"取消",handler:addDlg.close}]});
			addDlg.init({title:'组织机构列表',height:492,width:660});
			 
			/**将Grid中的数据加入到Dialog中**/
			addDlg.setContent(treeDiv);
		}
		PostEdit.prototype.selectArea = function(){
			var that = this;
			
			var diaDlg = this.dealerDialog = new V.Classes['v.ui.Dialog']();
			var dlgTemplate = $('<div>\
					<span id="mapArea">全部<input  type="checkbox" name="ext1" value="*" id="input01">\
			      	</span>\
				</div>');
//			CatheMeng<input  type="checkbox" name="ext1" value="CatheMeng" id="input01">\
//	      	BryanXue<input  type="checkbox" name="ext1" value="BryanXue" id="input01">\
//	      	ZhangJun<input  type="checkbox" name="ext1" value="ZhangJun" id="input01">\
//	      	JinYue<input  type="checkbox" name="ext1" value="JinYue" id="input01">\
//	      	TonyGe<input  type="checkbox" name="ext1" value="TonyGe" id="input01">\
//	      	GaoYiqing<input  type="checkbox" name="ext1" value="GaoYiqing" id="input01">\
//	      	RangZhaoZ<input  type="checkbox" name="ext1" value="RangZhaoZ" id="input01">\
//			RangZhaoY<input  type="checkbox" name="ext1" value="RangZhaoY" id="input01">\
//	      	LisaGuo<input  type="checkbox" name="ext1" value="LisaGuo" id="input01">\
//	      	JustinShi<input  type="checkbox" name="ext1" value="JustinShi" id="input01">
			var mapArea = DictInfo.getList("AREA");
			$.each(mapArea,function(){
				$('#mapArea',dlgTemplate).append(this[0]+'<input  type="checkbox" name="ext1" value="'+this[1]+'" id="input01">');
			});
			diaDlg.setContent(dlgTemplate);
			diaDlg.setBtnsBar({
				position:'right',
				btns:[
				      {text:'确定',style:'btn-primary',handler:function(){
				    	  var tmp = [];
				    	  $(':input[type="checkbox"]:checked',dlgTemplate).each(function(){
								tmp.push(this.value);
							})
							if (tmp.length == 0) {
								V.alert("请选择");
								return;
							}
				    	  var records = tmp.join(',');
				    	 
				    	  $('#ext1',that.template).val(records);
				    	  diaDlg.close();
				      }},
				      {text:'取消',handler:function(){
				    	  this.close();
				      }}
				      ]
			});
			diaDlg.init({
				width:400,
				height:300,
				title:'选择区域'
			});
		}
		//get area list
		PostEdit.prototype.addArea = function(){
			var that = this;
			
			var diaDlg = this.dealerDialog = new V.Classes['v.ui.Dialog']();
			var dlgTemplate = $('<div>\
					<div class="form-search control-group">\
						<label class="checkbox"> 大区：\
							<select class="areaType input-medium"></select>\
						</label>\
						<label class="checkbox">选择城市：\
							<select class="cityType input-medium"></select>\
						</label>\
					</div>\
					<div class="grid"></div>\
				</div>');
			diaDlg.setContent(dlgTemplate);
			
			$.each(this.provinces,function(index){
				var opt = $('<option>'+this.name+'</option>');
				opt.attr('value',this.areaCode);
				$('.areaType',dlgTemplate).append(opt);
				if(index == 0){
					that.getCity(this.areaCode);
				}
			})
			
			var list = this.areaList = new V.Classes['v.ui.Grid']();
			
			var areaType = $('.areaType',dlgTemplate);
			var cityType = $('.cityType',dlgTemplate);
			
			var filter = {};
			filter.areaId = areaType.val();
			filter.parentId = cityType.val();
			
			list.setFilters(filter);
			
			list.init({
				url:'common!county.action',
				container:$('.grid',dlgTemplate).empty(),
                checkable:true,
                columns:[
                    {displayName:'编码',key:'areaCode'},     
                    {displayName:'名称',key:'name'}
                ]
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
				    	 
				    	  var cityCodes = '';
				    	  $.each(records,function(){
				    		  var record = {};
				    		  cityCodes = cityCodes+this.areaCode+",";
				    	  })
				    	  cityCodes = cityCodes.substring(0,cityCodes.length-1);
				    	  $('#areaCodes',that.template).val(cityCodes);
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
				title:'选择城市'
			});
			$('.checkbox',dlgTemplate).css({'margin-right':'20px'});
			
			//选择模块
			$('.areaType',dlgTemplate).change(function(){
				var type = this.value;
				that.getCity(type);
			});
			//选择单据类型
			$('.cityType',dlgTemplate).change(function(){
				
				var filter = {};
				filter.areaId = $('.areaType',dlgTemplate).val();
				filter.parentId = $('.cityType',dlgTemplate).val();
				list.setFilters(filter);
				list.refresh();
			});
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
                    	return V.Classes['v.component.Form'].TYPE[record.dataType]
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
				    	  var tableName = data.tableName;
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
				    		  record.tableName = tableName;
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
		PostEdit.prototype.getModuleType = function(){
			var that = this;
		     $.ajax({
			 	url:this.module+'/moduleList.action',
				dataType:'json',
				success:function(systemModules){
					that.modules = systemModules||[];
				}
			 });
		};
		
		PostEdit.prototype.getArea = function(){
			var that = this;
		     $.ajax({
			 	url:'common!province.action',
				dataType:'json',
				success:function(provinces){
					that.provinces = provinces||[];
				}
			 });
		}
		//获取单据类型
		PostEdit.prototype.getTicketType = function(moduleCode){
			var that = this;
			$('.ticketType',that.controlsDialog.template).empty();
		     $.ajax({
			 	url:this.module+'/ticketList.action',
				dataType:'json',
				async:false,
				data:{moduleCode:moduleCode},
				success:function(tickets){
					tickets = that.tickets = tickets||[];
					$.each(tickets,function(index){
						var opt = $('<option>'+this.name+'</option>');
						opt.attr('value',this.value);
						opt.data('data',this);
						$('.ticketType',that.controlsDialog.template).append(opt);
						if(index == 0){
							if(this.hasDetail){
								$('.lbl_tableType',that.controlsDialog.template).show();
							}else{
								$('.lbl_tableType',that.controlsDialog.template).hide();
							}
							$('.tableType',that.controlsDialog.template).val('false');
							$('.ticketType',that.controlsDialog.template).change();
						}
					})
				}
			 }) ;
		};
		
		PostEdit.prototype.getCity = function(id){
			var that = this;
			$('.cityType',that.dealerDialog.template).empty();
		     $.ajax({
			 	url:'common!city.action',
				dataType:'json',
				async:false,
				data:{parentId:id},
				success:function(cities){
					cities = that.cities = cities||[];
					$.each(cities,function(index){
						var opt = $('<option>'+this.name+'</option>');
						opt.attr('value',this.areaCode);
						opt.data('data',this);
						$('.cityType',that.dealerDialog.template).append(opt);
					})
				}
			 }) ;
		}
		//列出定制单据数据
		PostEdit.prototype.listManager = function(){
			var that = this;
			
        	var list = this.controlList = new V.Classes['v.ui.Grid']();
			list.init({
				data:that.authrities,
                container:$('.controlPoint',that.template).empty(),
                checkable:false,
                columns:[
                    {displayName:'模块名称',key:'moduleName'},
                    {displayName:'单据名称',key:'className'},
                    {displayName:'表名',key:'tableName'},
                    {displayName:'字段名称',key:'fieldLabel'},
                    {displayName:'范围',key:'value'},
                    {displayName:'操作',key:'action',width:50,render:function(record){
                        var html = $('<div><a class="remove" style="margin:0 10px" href="javascript:void(0);" title="删除"><i class="icon-remove"></i></a>\
                        			<a class="edit" href="javascript:void(0);" title="编辑"><i class="icon-edit"></i></a><div>');
                        $('.edit',html).click(function(){
                            that.editRange(record);
                        });
                        $('.remove',html).click(function(){
                        	var index = list.getRecordIndex(record);
                            list.removeRecord(record);
                            that.authrities.splice(index,0);
                        });
                        return html;
                    }}
                ]
            });
		}
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
			
			var commonTip = $('<div class="tip" style="position:absolute;bottom:10px;text-align:left;">\
								<span style="color:red">\
									说明：1 、 控制点支持*、?、-这几种通配符，多组控制点以空格分隔标识，示例：100-130 210,213 31? 4*等；\
									数字类型不支持通配符。<br/>\
										2、支持内置的系统变量{LOGIN_USER}。\
								</span>\
							</div>');
			
			var editValues = record.value||'';
			if(record.dataType==Form.TYPE.PLUGIN){
				var element = $('<div></div>');
				
				V.loadPlugin(record.ns,function(){
					var glass = V._registedPlugins[record.ns].glass;
					var inst = new V.Classes[glass]();
					inst.init({
						container:element,
						config:{
							label:record.fieldLabel,
							value:editValues,
							checkable:true,
							url:record.url,
							params:record.params
						}
					});
					$('div',element).css({'display':'inline','margin-right':'10px'});
//					$('input',element).css({'margin-right':'10px'});
//					$('input',element).addClass('data-value');
//					$('button',element).css({'margin':'-10px 0px 0px 0px'});
				});
				
				con.append(element).append(commonTip);
			}else if(record.dataType==Form.TYPE.SELECT){
				editValues = editValues.split(',');
				var dictTypeCode = DictInfo.getList(record.dictTypeCode);
				$.each(dictTypeCode,function(){
					var element = $('<span style="float:left">'+this[0]+'</span>');
					var checkbox = $('<input type="checkbox" style="margin:0px 15px 3px 3px;" class="data-value">');
					checkbox.attr('name',record.fieldName);
					checkbox.attr('value',this[1]);
					if($.inArray(this[1],editValues)!=-1){
						checkbox.attr('checked',true);
					}
					element.append(checkbox);
					con.append(element);
				})
			}else if(record.dataType==Form.TYPE.BOOLEAN){
				var radioT = $('<span style="margin:0 10px">是：<input type="radio" class="data-value" value="true"></span>');
				var radioF = $('<span>否：<input type="radio" class="data-value" value="false"></span>');
				
				con.append(radioT).append(radioF);
				$('input',con).attr('name',record.fieldName);
				
				$.each($('input',con),function(){
					if($(this).val()==editValues){
						$(this).attr('checked',true);
					}
				})
			}else{
				var element = $('<div><textarea type="text" rows="3" class="data-value input-xlarge" name="startValue" value=""></textarea></div>');
				$('textarea',element).val(editValues);
				con.append(element).append(commonTip);
				con.append('<p class="error_msg" style="color:red"></p>');
			}
			diaDlg.setContent(con);

			$('.data-value',diaDlg.template).focus(function(){
				$('.error_msg',diaDlg.template).hide();
			})
			
			diaDlg.setBtnsBar({
				position:'right',
				btns:[
				      {text:'确定',style:'btn-primary',handler:function(){
				    	  var value = '';
				    	  if(record.dataType==Form.TYPE.SELECT){
				    		  var values = [];
				    		  $('input:checked',diaDlg.template).each(function(){
					    		  values.push($(this).val());
					    	  })
					    	  value = values.join(',');
				    	  }else if(record.dataType==Form.TYPE.BOOLEAN){
				    		  value = $('input:checked',diaDlg.template).val();
				    	  }else{
				    		  value = $('.data-value',diaDlg.template).val();
				    	  }
				    	  
				    	  var values = value.split(' ');
				    	  var ret = true;
				    	  var reg1 = /^[0-9a-zA-Z]+-[0-9a-zA-Z]+$/;
				    	  var reg2 = /^[0-9a-zA-Z,]+$/;
				    	  var reg3 = /^[0-9a-zA-Z\?]+$/;
				    	  var reg4 = /^[0-9a-zA-Z\*]+$/;
				    	  $.each(values,function(){
				    		  if(this.indexOf('-')>0){
				    			  if(!reg1.test(this)){
				    				  ret = false;
				    			  }
				    		  }else if(this.indexOf(',')>0){
				    			  if(!reg2.test(this+',')){
				    				  ret = false;
				    			  }
				    		  }else if(this.indexOf('?')>0){
				    			  if(record.dataType==Form.TYPE.NUMBER){
				    				  ret = false;
				    				  return true;
				    			  }
				    			  if(!reg3.test(this)){
				    				  ret = false;
				    			  }
				    		  }else if(this.indexOf('*')>0){
				    			  if(record.dataType==Form.TYPE.NUMBER){
				    				  ret = false;
				    				  return true;
				    			  }
				    			  if(!reg4.test(this)){
				    				  ret = false;
				    			  }
				    		  }
				    	  })
						  if(!ret){
							  $('.error_msg',diaDlg.template).show();
							  $('.error_msg',diaDlg.template).empty().text('表达式输入错误！');
							  return;
						  }
						  
				    	  if(values==''){
				    		  $('.error_msg',diaDlg.template).show();
							  $('.error_msg',diaDlg.template).empty().text('请输入数值！');
							  return;
				    	  }
				    	  
				    	  record.value = value;
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
				height:300,
				title:'编辑范围'
			});
		}
		PostEdit.prototype.editExpress = function(){
			var that = this;
			var list = new V.Classes['v.ui.Grid']();
			var diaDlg = new V.Classes['v.ui.Dialog']();
			var con = $('<div class="docket" style="text-align:center;"></div>');
			var Form = V.Classes['v.component.Form'];
			var commonTip = $('<div class="tip" style="position:absolute;bottom:10px;text-align:left;">\
					<span style="color:red">\
				            说明：权限表达式，示例：[{"entityName":"SalesOrder","express":"GOODS_DEPT_CODE=\'PRODUCT-1\' or OWNER_CODE=\'{LOGIN_USER}\'"}]\
					</span>\
			</div>');
			var editValues = that.post.express;
			var element = $('<div><textarea type="text" rows="10" cols="15" class="data-value input-xlarge" name="startValue" value="" style="width:527px;height:183px"></textarea></div>');
			$('textarea',element).val(editValues||'');
			con.append(element).append(commonTip);
			con.append('<p class="error_msg" style="color:red"></p>');
			diaDlg.setContent(con);
			$('.data-value',diaDlg.template).focus(function(){
				$('.error_msg',diaDlg.template).hide();
			})
			
			diaDlg.setBtnsBar({
				position:'right',
				btns:[
				      {text:'确定',style:'btn-primary',handler:function(){
				    	  var value = $('.data-value',diaDlg.template).val();
				    	  that.post.express = value;
				    	  that.savePostExpress(value);
				    	  diaDlg.close();
				      }},
				      {text:'取消',handler:function(){
				    	  this.close();
				      }}
				      ]
			});
			diaDlg.init({
				width:600,
				height:330,
				title:'编辑范围'
			});
		}
		PostEdit.prototype.savePostExpress = function(express){
			var that = this;
			var post = that.post;
			var url = that.module+'/post!savePostExpress.action';
        	$.ajax({
                url:url,
                type:'post',
                contentType:'application/json',
                data:JSON.stringify({postId:that.post.id,express:express}),
                success:function(data){
                    if(data.success =='success'){
                    	V.alert('保存成功！');
                    }else{
                        V.alert(data.fail);
                    }
                }
            })
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
                data:JSON.stringify({authrities:data,postId:that.post.id,express:that.post.express}),
                success:function(data){
                    if(data.success =='success'){
                    	V.alert('保存成功！');
                    }else{
                        V.alert(data.fail);
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
	})(V.Classes['v.views.backoffice.authority.PostEdit'])
},{plugins:["v.ui.grid","v.ui.pagination","v.ui.dialog","v.views.backoffice.authority.postControlPoint",'v.ui.alert','v.fn.validator','v.ui.tree','v.ui.dynamicGrid']});