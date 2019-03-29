;V.registPlugin("v.views.backoffice.custom.partnerEdit",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.PartnerEdit",
		superClass:"v.Plugin",
		init:function(){
			this.partner = null;
			this.user = null;
			this.menus = null;
			this.files=null;
			this.post = {};
			this.module = "";
			this.record = {};
			this.crumbsName = "供应商编辑";
			this.ns = 'v.views.backoffice.custom.partnerEdit';
			this.resource = {
			    html:'template.html'
			}
		}
	});
	(function(partnerEdit){
		partnerEdit.prototype.init = function(options){
			var that = this;
			this.module = options.module;
			this.container = options.container;
			this.options = options;
			this.record = options.record;
			this.partner = options.record;
			if(options.record==null){
				this.crumbsName = "我的信息";
			}
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					that.initFormInfo(that.record);
					that.initEvent();
					that.getUserHeader();
					if(LoginInfo.user.userType==3){ //供应商不能看到菜单是指和用户信息
						$('#step2',that.template).hide();
						$('#step3',that.template).hide();
						$('#step4',that.template).show();
					}else{
						//$('#step4',that.template).show();
						$('#fileUpload',that.template).hide();
					}
					$("#fileUpload",this.template).click(function(){
						 that.uploadFile();
	         		});
				}
			})
			//this.addCrumb();
		}
	  partnerEdit.prototype.initFormInfo = function(record){
	  	var that = this;
	  	var partnerId=""
	  	var isBuyer = (LoginInfo.user.businessRole == LoginInfo.businessRole.ENTERPRISE);
	  	if(record!=null){
	  		partnerId=record['id'];
	  	}
//	  	$('#createTime',this.template).datepicker({dateFormat: "yy-mm-dd",showMonthAfterYear:true,changeMonth: true,
//            changeYear: true});
	  	$('#startDate',this.template).datepicker({dateFormat: "yy-mm-dd",showMonthAfterYear:true,changeMonth: true,
            changeYear: true});
	  	$('#endDate',this.template).datepicker({dateFormat: "yy-mm-dd",showMonthAfterYear:true,changeMonth: true,
            changeYear: true});
	  	var that = this;
	  	if(DictInfo.getVar('INVOICE_LIMIT')){
	  		var tax_limit_sel = $('#invoiceLimit',that.template);
	  		$.each(DictInfo.getVar('INVOICE_LIMIT'),function(prop,val){
	  			var option = $('<option value='+prop+'>'+val+'万元</option>');
	  			tax_limit_sel.append(option);
	  		});
	  	}
		$.ajax({
        	url:that.module+'/partner!input.action',
           	type:'post',
			data: {partnerId: partnerId},
            success:function(data){
				 if(data!=undefined){
				 	that.post = data.post;
					that.partner = data.partner;
					that.user = data.user;
					that.role = data.role;
					that.menus = data.menus;
					that.files=data.fileList;
				 }
				 if(data!=undefined && data.partner !=undefined){
                    var partner = data.partner;
                    $('*[partner-data-key]',that.template).each(function(index,item){
                        var key = $(this).attr('partner-data-key');
                        var value = partner[key]||'';
                        var type = $(this).attr('data-type');
                        if(type=='select'){
                        	$('.edit_input',this).val(value);
                        	$('.view_text',this).text($('.edit_input',this).find('option:selected').text());
                        }else{
                            if(key=='extractType'&&value!=null){
                            	var types = value.split(',');
                            	$.each(types,function(){
                            	    $('input[value='+this+']',item).attr('checked',true);
                            	})
                            }else{
                            	$('.view_text',this).text(value);
                                $('.edit_input',this).val(value);
                            }
                        }
                        $('.view_text',this).css('padding-top','2px');
                    });
                    that.invSettlePeriod(that.template);
                    that.initBusinessType(that.template);
                    that.initAccreditationType(that.template);
                 }
				 if(data!=undefined && data.user !=undefined){
				 	var user = data.user;
				 	$('*[user-data-key]',this.template).each(function(){
						var key = $(this).attr('user-data-key');
						var value = user[key];
						$('.view_text',this).text(value);
						$('.edit_input',this).val(value);
						
						$('.view_text',this).css('padding-top','2px');
					});
					//that.initControls();
				 }
				 
				 if(data!=undefined && data.fileList !=undefined){
					 	var list= that.fileList= new V.Classes["v.ui.Grid"]();
					 	if(isBuyer){
					 		list.init({
				                container:$('.fileList',this.template),
				                checkable:false,
				                data:data.fileList,
				                columns:[
				                    {displayName:'文件名',key:'fileName',width:220},
				                    {displayName:'文件类型',key:'fileType',width:100},
				                    {displayName:'操作',key:'action',width:50,render:function(record){
				                    	var html = $('<div class="action"><a class="download" href="javascript:void(0); style="margin:0 8px;"" title="下载"><i class="icon-download"></i></a></div>');
			                    		$('.download',html).click(function(){
			                    			that.download(record);
			                    		});
				                        return html;
				                    }}
				                ]
				            });
					 	}else{
					 		list.init({
				                container:$('.fileList',this.template),
				                checkable:false,
				                data:data.fileList,
				                columns:[
				                    {displayName:'文件名',key:'fileName',width:220},
				                    {displayName:'文件类型',key:'fileType',width:100,render:function(record){
				                    	return CONSTANT.ENTERPRISE_FILE_TYPE[record.fileType+""];
				                    }},
				                    {displayName:'操作',key:'action',width:50,render:function(record){
				                        var html = $('<div class="action"><a class="remove" href="javascript:void(0);" title="删除"><i class="icon-remove"></i></a><div>');
				                        $('.remove',html).click(function(){
				                        	that.removeFile(record);
				                        });
				                        return html;
				                    }}
				                ]
				            });
					 	}
					 }
					 
				 if(data!=undefined && data.role !=undefined){
				     that.authoritySetting();
				 }
            }
        })
	  }
	  partnerEdit.prototype.download = function(record){
      	var that = this;
			var info="是否要下载？";
			V.confirm(info,function ok(e){
				window.location.href=that.module+"/partner!downLoad.action?id="+record.id;
			});
      }
	  partnerEdit.prototype.uploadFile = function(){	
			var upload = new V.Classes['v.component.FileUpload']();
			var that = this;
			this.subscribe(upload,upload.EVENT.CLOSE,function(){
				that.fileList.url = that.module+'/partner!retrieveDownLoadFileList.action';
				that.fileList.refresh();
			});
			upload.init({
				title : '企业资料上传',
				typeList:[{type:"1",text:CONSTANT.ENTERPRISE_FILE_TYPE["1"]}
				    ,{type:"2",text:CONSTANT.ENTERPRISE_FILE_TYPE["2"]}
				    ,{type:"3",text:CONSTANT.ENTERPRISE_FILE_TYPE["3"]}
				    ,{type:"4",text:CONSTANT.ENTERPRISE_FILE_TYPE["4"]}
				    ,{type:"5",text:CONSTANT.ENTERPRISE_FILE_TYPE["5"]}
				  ],
				uploadSetting:{
					url:'attribUpload',
					params:{'fileType':'enterpriseFile'},
					uploadComplete:function(){
						 
					}
				}
			});
		}
	  partnerEdit.prototype.removeFile = function(record){
		  var that=this;
		  V.confirm('确定要删除企业资料'+record.fileName+'?',function(){
			  $.ajax({
					url:that.module+'/partner!deleteFile.action',
					type:'post',
					data:{fileId:record.id},
					success:function(data){
						if(data=="success"){
							 that.fileList.removeRecord(record);
						}else{
							V.alert("删除文件失败！");
						}
					}
				});
		  })
	  }
	  partnerEdit.prototype.authoritySetting = function(){
        var that = this;
        $('.edit_authority',this.template).click(function(){
            that.publish({eventId:'authority_edit',data:''});
        });
        
        var authority = new V.Classes['v.views.component.AuthoritySetting']();
        var data = {
            instance:this,
            id:that.partner['id'],
            roleId:that.role['id'],
            module:that.module,
            action:'partner'
        }
        authority.init(data);
        $('.authority_list',this.template).append(authority.template);
      }
	  partnerEdit.prototype.initControls = function(){
		  var postId=this.post.id
		  var that = this;
			$.ajax({
				url:that.module+'/partner!findauth.action',
				type:'post',
				data:{postId:postId},
				success:function(data){
					that.controlPoint = data;
					 if(data != null && data != undefined){
					 	var html = "";
					 	$.each(data,function(){
					 		html += '<div class="control-group span6">\
							      <label class="control-label" for="input01">'+this.name+'：</label>\
								      <div class="controls">\
								        <p id="'+this.dictcode+'">'+this.code+'</p>\
								      </div>\
							      </div>';
						})
						$(".controlPointList",that.template).empty().html(html);
					 }
				}
			});
	  }
	  partnerEdit.prototype.initEvent = function(){
	 	var that = this;
	 	
	 	/**设置验证**/
		$('*[data-validator]:visible',this.template).keyup(function(e){
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
		
			/**交易伙伴管理-控制点**/
		$('#matchset',this.template).click(function(){
			var controlPoing = new V.Classes['v.views.backoffice.authority.PostControlPoint']();
			var controlOptions = {};
            controlOptions.module = that.options.module;
            controlOptions.controlPoint = that.controlPoint;
                
			controlPoing.init(controlOptions);
			
			var addDlg = new V.Classes['v.ui.Dialog']();
			addDlg.setBtnsBar({btns:[{text:"确定",style:"btn-primary",handler:function(){
				var textareas = $('.control-list-content',controlPoing.template).find('textarea');
                if(textareas.length == 0){
                    alert("没有数据");
                    return;
                }
                var judgeFlag = true;
                $.each(textareas,function(){
                    if($(this).val()==''){
                       //V.alert('控制点内容不能为空！');
                       $(this).parent().find('.error_msg').text('不能为空，请输入代码！').show();
                       judgeFlag = false;
                       return false;
                    }
                });
                if(judgeFlag==false) return;
                
                that.submit(controlPoing.template);
                addDlg.close();
				
			}},{text:"取消",handler:addDlg.close}]});
			addDlg.init({title:'控制点',height:492,width:660});
			/**将Grid中的数据加入到Dialog中**/
			addDlg.setContent(controlPoing.template);
		})
 
		that.edit('.party_group_view','.party_group_edit');
		that.cancel('.party_group_edit','.party_group_view');
		that.edit('.party-view','.party-edit');
		that.cancel('.party-edit','.party-view');
		
		//$('.icon-remove',this.template).click();
		$('.party_group_edit .cancel',this.template).click();
		
		$('.party_group_edit .save',this.template).click(function(){
			var partner = that.partner;
			if(!that.validate('[name=step1]')) return;
			$('*[partner-data-key]',that.template).each(function(){
				var key = $(this).attr('partner-data-key');
				if(key=='businessType'||key=='extractType'){
					var tmp = [];
					$('input[type=checkbox]:checked',this).each(function(){
						tmp.push(this.value);
					});
					partner[key] = tmp.join(',');
				}else{
					partner[key] = $('.edit_input',this).val();
				}
				
			});
			/*
			if(partner['businessType']==''){
				V.alert('必须选择一种经营方式！');
				return;
			}
			*/
			if(partner['extractType']==''){
				V.alert('必须选择一种发票抽取方式！');
				return;
			}
			var url = that.module+'/partner!step1.action';
            $.ajax({
            	url:url,
               	type:'post',
				data:JSON.stringify({partner:partner}),
				contentType:'application/json',
                success:function(data){
                   if(data != null && data != undefined){
				   		//that.post = data.post;
						that.partner = data.partner;
						//that.user = data.user;
						
						var partner = data.partner;
						$('*[partner-data-key]',that.template).each(function(){
	                        var key = $(this).attr('partner-data-key');
	                        var value = partner[key]||'';
	                        var type = $(this).attr('data-type');
	                        
	                        if(type=='select'){
	                        	$('.edit_input',this).val(value);
	                        	$('.view_text',this).text($('.edit_input',this).find('option:selected').text());
	                        }else{
	                        	$('.view_text',this).text(value);
	                            $('.edit_input',this).val(value);
	                        }
	                        $('*[partner-data-key=extrctType]',that.template).find('input[type=checkbox]').attr('disabled',true);
	                    });
						V.alert("供应商基本信息保存成功!");
						$('.party_group_edit .cancel',this.template).click();
				   }
                }
            })
		});
		$('.party-edit .save',this.template).click(function(){
			var user = that.user;
			//用户登录名编码校验
			var userCodeDom = $('#userStartCode',that.template).val();
			var loginName=$("#loginName").val();
			var reg = new RegExp('^'+userCodeDom+'[0-9a-zA-Z]+$');
			if(!reg.test(loginName)){
				V.alert('用户登录名称必须以'+userCodeDom+'开头！');
				return;
			}
			if(!that.validate('[name=step3]')) return;
			$('*[user-data-key]',that.template).each(function(){
				var key = $(this).attr('user-data-key');
				user[key] = $('.edit_input',this).val();
			});
			//debugger;
			var url = that.module+'/partner!updateUser.action';
            $.ajax({
            	url:url,
               	type:'post',
				data:JSON.stringify({user:user}),
				contentType:'application/json',
                success:function(data){
                   if(data.msg == 'success'){
				   		that.user = data.user;
				   		
					 	$('*[user-data-key]',this.template).each(function(){
							$('.view_text',this).text($('.edit_input',this).val());
						});
					 	
						V.alert("供应商用户信息保存成功!");
						$('.party-edit .cancel',this.template).click();
				   }else if(data.msg="error"){
					   V.alert(data.info);
				   }
                }
            })
		});
		
		$('.view_menu',this.template).click(function(){
			//that.addMenu();
		});
		$('.view_homecmts',this.template).click(function(){
			that.addHomecmt();
		});
	 }
	//获取用户编码首字母
	  partnerEdit.prototype.getUserHeader = function(record,context){
	        var that = this;
	        var url = 'common!getUserHeader.action';
	        $.ajax({
	            url:url,
	            type:'post',
	            dataType:'text',
	            success:function(data){
	                $('#userStartCode',that.template).val(data);
	            }
	        })
	    }
	 partnerEdit.prototype.edit = function(view ,edit){
	 	var that = this;
	 	$(view+' .edit',this.template).click(function(){
			$(this).parents(view).hide();
			$(edit,that.template).show();
			$(this).parents('fieldset').removeClass('view').addClass('edit');
			
			//reset view text area.
			if(view=='.party_group_view')
			$('*[partner-data-key]',that.template).each(function(){
                var key = $(this).attr('partner-data-key');
                var value = that.partner[key]||'';
                var type = $(this).attr('data-type');
                if(key == 'extractType'){
                	$('input',this).attr('disabled',false);
                }else{
                	 $('.edit_input',this).val(value);
                }
                if(type=='select'){
					var selObj = $('select',this);
					selObj.val(value);
					$('.view_text',this).text(selObj.find('option:selected').text());
				}
            });
			if(LoginInfo.user.businessRole == LoginInfo.businessRole.ENTERPRISE){
				$('*[partner-data-key=businessType]',that.template).find('input[type=checkbox]').attr('disabled',false);	
			}else{
				//供应商不可编辑的字段
				$('.controls[partner-data-key=partnerName] .edit_input',that.template).attr('disabled',true);	
				$('.controls[partner-data-key=taxname] .edit_input',that.template).attr('disabled',true);
				$('.controls[partner-data-key=taxno] .edit_input',that.template).attr('disabled',true);	
				$('.controls[partner-data-key=bank] .edit_input',that.template).attr('disabled',true);
				$('.controls[partner-data-key=account] .edit_input',that.template).attr('disabled',true);
				
				$('.controls[partner-data-key=isStatement] .edit_input',that.template).attr('disabled',true);
				$('.controls[partner-data-key=extractType]',that.template).find('input[type=checkbox]').attr('disabled',true);
				$('.controls[partner-data-key=settlePeriod] .edit_input',that.template).attr('disabled',true);
				$('.controls[partner-data-key=accreditationType] .edit_input',that.template).attr('disabled',true);
			}		
			if(view=='.party-view')
		 	$('*[user-data-key]',this.template).each(function(){
				var key = $(this).attr('user-data-key');
				var value = that.user[key];
				$('.edit_input',this).val(value);
			});
		});
	 }
	 partnerEdit.prototype.cancel = function(edit,view){
	 	var that = this;
	 	$(edit+' .cancel',this.template).click(function(){
			$(this).parents(edit).hide();
			$(view,that.template).show();
			$(this).parents('fieldset').removeClass('edit').addClass('view');
			//隐藏验证时，产生的信息框
			$('.error_msg').empty().hide();
			$('*[partner-data-key=businessType]',that.template).find('input[type=checkbox]').attr('disabled',true);
			$('*[partner-data-key=extractType]',that.template).find('input[type=checkbox]').attr('disabled',true);
		});
	 }
	 partnerEdit.prototype.submit = function(dom){
	        var that = this;
            var control = $('.control-list-content',dom).find('textarea');
            var controlArr = [];
            var controlStr="";
            control.each(function(){
                var key = $(this).attr('controlpointKey');
                var name = $(this).attr('controlpointName');
                var code = $(this).val();
                
                controlStr+='"'+key+'":"'+code+'",';
                
                var json = {
                    name:name,
                    code:code,
                    key:key
                };
                controlArr.push(json);
            });
            controlStr="{"+controlStr+"}";
            
            $.ajax({
                url:this.module+'/partner!saveauth.action',
                type:'post',
                data:{id:this.post['id'],control:controlStr},
                success:function(data){
                    if(data == 'success'){
                        V.alert("控制点保存成功!");
                        
                        var html = "";
                        $.each(controlArr,function(){
                        html += '<div class="control-group span6">\
                                  <label class="control-label" for="input01">'+this.name+'：</label>\
                                      <div class="controls">\
                                        <p id="'+this.dictcode+'">'+this.code+'</p>\
                                      </div>\
                                  </div>';
                        })
                        $(".controlPointList",that.template).empty().html(html);
                        that.controlPoint = controlArr;
                    }else{
                        V.alert("保存失败!");
                    }
                }
            })		
	 }
	 /**
	  * 步骤内容加载
	  */
	 partnerEdit.prototype.initStep2 = function(platformNo){
	 	
	 }
	 partnerEdit.prototype.initStep3 = function(){}
	 /**加载用户信息**/
	 partnerEdit.prototype.initStep4 = function(){}
	 partnerEdit.prototype.initStep5 = function(){}
	 
	 //初始化获取功能菜单列表
	 partnerEdit.prototype.getMenu = function(){
		var that = this;
		var container = $('#step2-date',this.template).empty();
		var grid = this.menuList = new V.Classes['v.ui.Grid']();
		if(this.role== null && this.role == undefined ){return;}
		grid.setFilters({role:{id:this.role.id}});
		grid.init({
			container:container,
			//url:that.module+'/partner!menuList.action',
			columns:[
                {displayName:'菜单编码',key:'menuType',width:320}
                ,{displayName:'菜单名称',key:'menuName',width:320}
                ,{displayName:'操作',key:'action',width:120,render:function(record){
                    var html = $('<div><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a><div>');
                    $('.remove',html).click(function(){
                    	V.confirm('是否删除菜单？',function(){
                        	$.ajax({
				            	url:that.module+'/partner!delRoleMenu.action',
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
            ],
            data:that.menus
		});
	}
	//新增功能菜单
	partnerEdit.prototype.addMenu = function(){
		var that = this;
		var role = that.role;
		var container = this.container;
		
		if (role.businessRole == CONSTANT.BUSINESS_ROLE.ENTERPRISE) {
	 		menuType = CONSTANT.MENU_TYPE.BCP_ENTERPRISE;
	 	} else {
	 		menuType = CONSTANT.MENU_TYPE.BCP_SUPPLIER;
	 	}
	 	
		/**Dialog**/
		var addDlg = new V.Classes['v.ui.Dialog']();
		var tree = $("<div><div id='cont_tree'></div></div>");
		var menu_tree = new V.Classes['v.ui.Tree']();
		addDlg.setContent(tree);
		$.ajax({
			url:that.module+'/menuTree.action',
			type:'post',
			data:{roleId:role.id,menuType:menuType},
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
            	url:that.module+'/partner!step2.action',
               	type:'post',
				data:{roleId:role['id'],checkedIds:checkedIds.substring(0,checkedIds.length-1)},
				//contentType:'json',
                success:function(data){
                	//获取已经保存的菜单信息
                     $.ajax({
			        	url:that.module+'/partner!input.action',
			           	type:'post',
						data: {partnerId: that.record['id']},
			            success:function(data){
							 if(data!=undefined){
								that.menuList.options.data = data.menus;
							 }
							 that.menuList.refresh();
			            }
			        })
			        addDlg.close();
                }
            })
			
		}},{text:"取消",handler:addDlg.close}]});
		addDlg.init({title:'菜单树',height:592,width:660});
	}
		
		 //form校验
	 partnerEdit.prototype.validate = function(name){
		var isValid = true;
		$(name +' *[data-validator]',this.template).each(function(){
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
	//获取经营方式
    partnerEdit.prototype.initBusinessType = function(context){
    	 var that = this;
         $.ajax({
             url:that.module+"/partner!listBusinessType.action",
             type:'post',
             data:{partnerId:that.partner['id']},
             dataType:'json',
             success:function(data){
             	var dom = $('*[partner-data-key=businessType]',that.template);
             	var selected = that.partner.businessType||'';
             	selected = selected.split(',');
             	$.each(data,function(index,d){
             		var name = data[index].dictname;
             		var value = data[index].dictcode;
             		var flag = $.inArray(value,selected);
             		if(flag!=-1){
             			checkbox = '<input type="checkbox" value='+value +' checked disabled >&nbsp;';
             		}else{
             			checkbox = '<input type="checkbox" value='+value +' disabled >&nbsp;';
             		}
             		var item = '<span>'+ name + '</span>&nbsp;';
             		dom.append(checkbox).append(item);
             	})
             }
         })
    }
    //获取结算周期
    partnerEdit.prototype.invSettlePeriod = function(context){
        var that = this;
        var sel = $('*[partner-data-key=settlePeriod]',context).find('select');
        for(key in DictInfo.getVar('PARTNER_SETTLE_PERIOD')){
            var name = DictInfo.getVar('PARTNER_SETTLE_PERIOD')[key];
            var opt = $('<option value=' + key + '>' + name + '</option>');
            sel.append(opt);
        }
        
        var settlePeriod = that.partner['settlePeriod'];
        sel.val(settlePeriod);
        sel.next().text(DictInfo.getVar('PARTNER_SETTLE_PERIOD')[settlePeriod]);
    }
    //获取认证方式
    partnerEdit.prototype.initAccreditationType = function(context){
        var that = this;
        var sel = $('*[partner-data-key=accreditationType]',context).find('select');
        for(key in DictInfo.getVar('ACCREDITATION_TYPE')){
            var name = DictInfo.getVar('ACCREDITATION_TYPE')[key];
            var opt = $('<option value=' + key + '>' + name + '</option>');
            sel.append(opt);
        }
        
        var accreditationType = that.partner['accreditationType'];
        sel.val(accreditationType);
        sel.next().text(sel.find('option:selected').text());
    }
    partnerEdit.prototype.addCrumb = function(){
		V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.crumbsName}});
	}
	})(V.Classes['v.views.backoffice.custom.PartnerEdit']);
},{plugins:["v.ui.step","v.ui.tree",'v.component.fileUpload',"v.views.backoffice.authority.postControlPoint","v.ui.grid","v.ui.dialog","v.component.form","v.views.component.authoritySetting"]});