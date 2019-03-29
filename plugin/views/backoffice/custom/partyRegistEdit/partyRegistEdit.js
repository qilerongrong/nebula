;V.registPlugin("v.views.backoffice.custom.partyRegistEdit",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.PartyRegistEdit",
		superClass:"v.Plugin",
		init:function(){
			this.partner = null;
			this.user = null;
			this.menus = null;
			this.post = {};
			this.module = "";
			this.record = {};
			this.ns = 'v.views.backoffice.custom.partyRegistEdit';
			this.resource = {
			    html:'template.html'
			}
		}
	});
	(function(partyRegistEdit){
		partyRegistEdit.prototype.init = function(options){
			var that = this;
			this.module = options.module;
			this.container = options.container;
			this.options = options;
			this.record = options.record;
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					//that.initPartyVersion();
					that.initParentPlatformNo();
					that.initFormInfo(that.record);
					that.initEvent();
//					that.provinceSel();
//					that.citySel();
//					that.countSel();
					that.initRegionCode();
				}
			})
		}
		partyRegistEdit.prototype.initFormInfo = function(record){
    	  	var that = this;
    		$('#validStartDate',this.template).datepicker({dateFormat: "yy-mm-dd",showMonthAfterYear:true,changeMonth: true,
	             changeYear: true});
    		$('#registeDate',this.template).datepicker({dateFormat: "yy-mm-dd",showMonthAfterYear:true,changeMonth: true,
	             changeYear: true});
    		$('#validEndDate',this.template).datepicker({dateFormat: "yy-mm-dd",showMonthAfterYear:true,changeMonth: true,
	             changeYear: true});
    	  	$('*[party-data-key]',this.template).each(function(){
				var key = $(this).attr('party-data-key');
				var type = $(this).attr('party-data-type');
				var value = record[key];
				if(type == 'select'){
				    var keySel = $('select[name="'+key+'"]',that.template);
                    keySel.val(that.record[key])
                    keySel.next().text(keySel.find('option:selected').text());
				}else if(key == 'parentPlatformNo'){
    				$('.view_text',this).text(value);
    				$('input',this).val(value);
                }else{
    				$('.view_text',this).text(value);
    				$('.edit_input',this).val(value);
                }
			});
    		$.ajax({
            	url:that.module+'/party!input.action',
               	type:'post',
    			data: {platformNo: record['platformNo']},
                success:function(data){
    				 if(data!=undefined){
    				 	that.party = data.party;
    					that.platInfo = data.platInfo;
    					that.user = that.orgUser = data.user;
    					that.role = data.role;
    				 }
    				 if(data!=undefined && data.user !=undefined){
    				 	var user = data.user;
    				 	$('*[user-data-key]',that.template).each(function(){
    						var key = $(this).attr('user-data-key');
    						var value = user[key];
    						$('.view_text',this).text(value);
    						$('.edit_input',this).val(value);
    					});
//    					$('#inputPassword',that.template).next().text('******'); //密码
//    					$('#inputPassword2',that.template).val(user['password']); //确认密码
//    					$('#inputPassword2',that.template).next().text('******');
    				 }
    				 if(data!=undefined && data.platInfo !=undefined){
    					 	var platInfo = data.platInfo;
    					 	$('*[plat-data-key]',that.template).each(function(){
    							var key = $(this).attr('plat-data-key');
    							var value = platInfo[key];
    							$('.view_text',this).text(value);
    							$('.edit_input',this).val(value);
    						});
    				 }
    				 that.authoritySetting();
    				 that.partnertAuthoritySetting();
    				 if(that.party.isMarketing==1){
    				 	that.distributorAuthoritySetting();	
    				 }else{
    				 	$('div[name=step4]',that.template).remove();
						$('div[name=step5]',that.template).attr('name','step4');
    				 }
                }
            })
	  	}
		partyRegistEdit.prototype.uploadFile = function(fileType,platformNo){
			var upload = new V.Classes['v.component.FileUpload']();
			var that = this;
			upload.init({
				title : 'LOGO上传',
				uploadSetting:{
					url:'backoffice/systemsetting/party/party!uploadLogo.action?fileType='+fileType+'&contractCode='+platformNo,
					complete:function(){
						V.alert("上传成功！");
					}
				}
			});
		}
	  partyRegistEdit.prototype.initEvent = function(){
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
        
        $('#uploadBtn',this.template).click(function(){
        	 var platformNo=$("#platformNo").val();
        	 if(platformNo==""||platformNo==null){
        		 V.alert("请先录入平台号，然后再做LOGO上传！")
        	 }else{
        		 that.uploadFile("LOGO",platformNo);
        	 }
        });
        
        $('#printLogo',this.template).click(function(){
        	 var platformNo=$("#platformNo").val();
        	 if(platformNo==""||platformNo==null){
        		 V.alert("请先录入平台号，然后再做打印LOGO上传！")
        	 }else{
        		 that.uploadFile("PRINT_LOGO",platformNo);
        	 }
        });
        //密码是否相同校验
//        $('#inputPassword2',this.template).blur(function(){
//            var msg = '密码和确认密码不相同，请重新输入！';
//            if($('#inputPassword').val()!=$('#inputPassword2').val()){
//                $(this).parent().find('.error_msg').text(msg).show();
//            }else{
//                $(this).parent().find('.error_msg').empty().hide();
//            }
//        });
        
				/**交易伙伴管理-控制点**/
			$('#matchset',this.template).click(function(){
				var controlPoing = new V.Classes['v.views.backoffice.authority.PostControlPoint']();
				controlPoing.init(that.options);
				
				var addDlg = new V.Classes['v.ui.Dialog']();
				addDlg.setBtnsBar({btns:[{text:"确定",style:"btn-primary",handler:function(){
					if($('#code').val() == ''){
						V.alert("没有数据");
						return;
					}
					var control = controlPoing.app_result;
					var selected = controlPoing.app_result.getCheckedRecords();
					if(selected.length < 1){
						V.alert("没有选择应用数据");
						return;
					}
					var sel = [];
					var selName = [];
					for(var i = 0;i < selected.length; i++){
						var obj = selected[i];
						sel.push(obj['dictCode']);
						selName.push(obj['dictName']);
					}
					
					that.submit(sel,selName);
					addDlg.close();
					
				}},{text:"取消",handler:addDlg.close}]});
				addDlg.init({title:'控制点',height:492,width:660});
				/**将Grid中的数据加入到Dialog中**/
				addDlg.setContent(controlPoing.template);
			})
 
			that.edit('.party_group_view','.party_group_edit');
			that.cancel('.party_group_edit','.party_group_view');
			that.edit('.user_group_view','.user_group_edit');
			that.cancel('.user_group_edit','.user_group_view');
			that.edit('.platinfo_group_view','.platinfo_group_edit');
			that.cancel('.platinfo_group_edit','.platinfo_group_view');
			$('.party_group_edit .save',this.template).click(function(){
				var party = that.party;
				if(!that.validate('[name=step1]')) return;
				$('*[party-data-key]',that.template).each(function(){
					var key = $(this).attr('party-data-key');
					if(key == 'parentPlatformNo'){
						return true;	
					}
					if(key == 'regionCode'){
						var areaValues = that.areaPlugin.getValue();
						for(keyy in areaValues){
							party[keyy] = areaValues[keyy];
						}
					}else{
						party[key] = $('.edit_input',this).val();
					}
				});
				if(party['registeFunds']=="")
					party['registeFunds'] = null;
					
				party['businessRole'] = $('#businessRole',that.template).val();
				party['companyCharacter'] = $('#companyCharacter',that.template).val();
				var url = that.module+'/party!step1.action';
	            $.ajax({
	            	url:url,
	               	type:'post',
					data:JSON.stringify({party:party}),
					contentType:'application/json',
	                success:function(data){
	                   if(data != null && data != undefined){
	                	    that.party = data.party;
	   						that.platInfo = data.platInfo;
	   						//that.user = data.user;
	   						
	   						for(key in that.party){
	   							that.record[key] = that.party[key];	
	   						}
	   						
	   						$('*[party-data-key]',that.template).each(function(){
                                var key = $(this).attr('party-data-key');
                                var type = $(this).attr('party-data-type');
                                var value = '';
                                if(key == 'registeDate'){
                                    value =V.Util.formatDate(new Date(party['registeDate']))
                                }else if(key == 'registeFunds'){
                                    value = party[key]||'';
                                }else if(key == 'regionCode'){
                                	that.renderAreaValue(party['regionCode']);
                                	return true;
                                }else{
                                    value = party[key];
                                }
                                if(type == 'select'){
                                    var keySel = $('select[name="'+key+'"]',that.template);
                                    keySel.val(that.party[key])
                                    keySel.next().text(keySel.find('option:selected').text());
                                } else{
                                    $('.view_text',this).text(value);
                                    $('.edit_input',this).val(value);
                                }
                            });
							$(".party_group_edit",that.template).hide();
							$(".party_group_view",that.template).show();
							$(".party_group_view",that.template).parents("fieldset").removeClass("edit").addClass("view");
							V.alert("保存成功!");
					   }
	                }
	            })
			});
			$('.user_group_edit .save',this.template).click(function(){
				var user = that.user;
				var party = that.party;
				//用户编码校验
				var userCodeDom = $('*[user-data-key=loginName]',that.template).find('input');
				var reg = new RegExp('^'+party.userHeader+'[0-9a-zA-Z]+$');
				if(!reg.test(userCodeDom.val())){
					V.alert('用户登录名称必须以'+party.userHeader+'开头！');
					return;
				}
				if(!that.validate('[name=step4]')) return;
				$('*[user-data-key]',that.template).each(function(){
					var key = $(this).attr('user-data-key');
					user[key] = $('.edit_input',this).val();
				});
				var url = that.module+'/party!updateAdminUser.action';
	            $.ajax({
	            	url:url,
	               	type:'post',
					data:JSON.stringify({user:user}),
					contentType:'application/json',
	                success:function(data){
	                	if(data.msg=="error"){
							V.alert(data.info);
						}else  if(data != null && data != undefined){
					   		that.user = data;
					   		
					   		for(key in data){
					   			that.orgUser[key] = data[key];	
					   		}
					   		
					   		$('*[user-data-key]',that.template).each(function(){
                                var key = $(this).attr('user-data-key');
                                var value = that.user[key];
                                $('.view_text',this).text(value);
                                $('.edit_input',this).val(value);
                            });
//                            $('#inputPassword',that.template).next().text('******'); //密码
//                            $('#inputPassword2',that.template).val(user['password']); //确认密码
//                            $('#inputPassword2',that.template).next().text('******');
							$(".user_group_view",that.template).parents("fieldset").removeClass("edit").addClass("view");
							$(".user_group_edit",that.template).hide();
							$(".user_group_view",that.template).show();
							V.alert("保存成功!");
					   }
	                }
	            })
			});
		
		$('.resetPassword',this.template).click(function(){
			that.resetPassword();
		})
		$('.editPassword',this.template).click(function(){
			that.editPassword();
		})
		$(function() {
		    var tooltips = $( "[title]" ).tooltip({
		    	track: false,
		      	position: {
		        	my: "center bottom-10",
        			at: "center top"
		      	}
		    });
		});
	 }
	 partyRegistEdit.prototype.provinceSel = function(){
		var that = this;
		$('select[name=provinceId]',that.template).change(function(){
            var id = $(this).val();
            $.ajax({
                url:'common!city.action',
                data:{parentId:id},
                success:function(citys){
                    $('select[name=cityId]',that.template).empty();
                    $('select[name=cityId]',that.template).append("<option value='-1'>请选择</option>");
                    $.each(citys,function(){
                        var option = "<option value='"+this.id+"'>"+this.name+"</option>";
                        $('select[name=cityId]',that.template).append(option);
                        if (that.record['cityId']){
                            var citySel = $('select[name="cityId"]',that.template);
                            citySel.val(that.record['cityId'])
                            //citySel.next().text(citySel.find('option:selected').text());
                        }
                    });
                }
            })
        });
                
		$.ajax({
			url:'common!province.action',
			success:function(provinces){
				$.each(provinces,function(){
					var option = "<option value='"+this.id+"'>"+this.name+"</option>";
					$('select[name=provinceId]',that.template).append(option);
				});
				var provinceSel = $('select[name="provinceId"]',that.template);
				if(that.record['provinceId']){
                    provinceSel.val(that.record['provinceId']);
                    provinceSel.next().text(provinceSel.find('option:selected').text());
                }
                $.ajax({
                    url:'common!city.action',
                    data:{parentId:that.record['provinceId']},
                    success:function(citys){
                        var citySel = $('select[name="cityId"]',that.template).empty();
                        $.each(citys,function(){
                            var option = "<option value='"+this.id+"'>"+this.name+"</option>";
                            $('select[name=cityId]',that.template).append(option);
                            if (that.record['cityId']){
                                citySel.val(that.record['cityId'])
                                citySel.next().text(citySel.find('option:selected').text());
                            }
                        });
                        citySel.change();
                    }
                })
			}
		})
	}
	 partyRegistEdit.prototype.citySel = function(){
		 var that = this;
		 $('select[name=cityId]',that.template).change(function(){
				var id = $(this).val();
//				 var platformNO  = $('*[party-data-key=platformNo]',that.template).find('input');
//				 platformNO.val(id);
//				 that.party['platformNo'] = id;
				$.ajax({
					url:'common!county.action',
					data:{parentId:id},
					success:function(citys){
						var countySel = $('select[name=countyId]',that.template).empty();
						countySel.append("<option value='-1'>请选择</option>");
						$.each(citys,function(){
							var option = "<option value='"+this.id+"'>"+this.name+"</option>";
							countySel.append(option);
						});
						if (that.record['countyId']){
                            countySel.val(that.record['countyId'])
                            countySel.next().text(countySel.find('option:selected').text());
                        }
					}
				})
			});
	 }
	 partyRegistEdit.prototype.countSel = function(){
		 var that = this;
		 $('select[name=countyId]',that.template).change(function(){
			 var id = $(this).val();

		 });
	 }
	partyRegistEdit.prototype.initPartyVersion = function(){
		var partyVersion = $('select[name=partyVersion]',this.template);
		partyVersion.append('<option value='+CONSTANT.AUTH_TYPE.AUTH_TYPE_PARTY+'>'+'企业版'+'</option>');
		partyVersion.append('<option value='+CONSTANT.AUTH_TYPE.AUTH_TYPE_STANDARD+'>'+'标准版'+'</option>');
		partyVersion.append('<option value='+CONSTANT.AUTH_TYPE.AUTH_TYPE_ALL+'>'+'全部版'+'</option>');
	}
	partyRegistEdit.prototype.edit = function(view ,edit){
	 	var that = this;
	 	$(view+' .edit',this.template).click(function(){
			$(this).parents(view).hide();
			$(edit,that.template).show();
			$(this).parents('fieldset').removeClass('view').addClass('edit');
			
			if(view=='.party_group_view'){
				that.resetPartyViewText();
			}
			if(view=='.user_group_view'){
				that.resetUserViewText();
			}
			//编辑时，清空密码
            if(view == '.user_group_view'){
                $('*[user-data-key="password"]',that.template).find('.edit_input').val('');
                $('*[user-data-key="password2"]',that.template).find('.edit_input').val('');
            }
		});
	}
	partyRegistEdit.prototype.cancel = function(edit,view){
	 	var that = this;
	 	$(edit+' .cancel',this.template).click(function(){
			$(this).parents(edit).hide();
			$(view,that.template).show();
			$(this).parents('fieldset').removeClass('edit').addClass('view');
			//隐藏验证时，产生的信息框
			$('.error_msg',that.template).empty().hide();
		});
	 }
	 partyRegistEdit.prototype.resetPartyViewText = function(){
		 var that = this;
		 $('*[party-data-key]',this.template).each(function(){
			var key = $(this).attr('party-data-key');
			var type = $(this).attr('party-data-type');
			var value = that.record[key];
			
			if(type == 'select'){
			    var keySel = $('select[name="'+key+'"]',that.template);
			    keySel.val(value);
			    if(key=='provinceId')
			    	$('select[name=provinceId]',that.template).change();
			}
			else{
				$('.edit_input',this).val(value);
			}
		 });
	 }
	 partyRegistEdit.prototype.resetUserViewText = function(){
		 var that = this;
		 $('*[user-data-key]',this.template).each(function(){
			var key = $(this).attr('user-data-key');
			var value = that.orgUser[key];
			$('.edit_input',this).val(value);
		 });
	 }
	 partyRegistEdit.prototype.validate = function(dom){
		var isValid = true;
		$(dom +' *[data-validator]',this.template).each(function(){
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
		
		/*
		if(dom=='[name=step4]' && isValid==true){
			var msg = '密码和确认密码不相同，请重新输入！';
			if($('#inputPassword',this.template).val()==''){
				isValid = false;
			}
			else if($('#inputPassword',this.template).val()!=$('#inputPassword2',this.template).val()){
	        	$('#inputPassword2',this.template).parent().find('.error_msg').text(msg).show();
	            isValid = false;
	        }
	        else{
	        	$('#inputPassword2',this.template).parent().find('.error_msg').empty().hide();
	            isValid = true;
	        }
		}
		*/
		return isValid;
	}
	 partyRegistEdit.prototype.submit = function(sel,selName){
			var data = null;
			var pointcode = $('#pointcode').val();
			var code = $('#code').val();
			if(pointcode == 1){
				data = {companyCode:code,id:this.post['id'],orderTypes:sel.join(",")};
			}else if(pointcode == 2){
				data = {companyCode:code,id:this.post['id'],orderTypes:sel.join(",")};
			}else if(pointcode == 3){
				data = {brand:code,id:this.post['id'],orderTypes:sel.join(",")};
			}else if(pointcode == 4){
				data = {companyCode:code,id:this.post['id'],orderTypes:sel.join(",")};
			}
			$.ajax({
            	url:this.module+'/saveauth.action',
               	type:'post',
				data:data,
                success:function(data){
					if(data == 'success'){
						if (pointcode == 1) {
							$("#companyCode",this.template).html(code);
							$("#companyCode_",this.template).html(selName.join(","));
						}
						V.alert("控制点保存成功!");
					}else{
						V.alert("保存失败!");
					}
                      
                }
        	})
		}
	 /**
	  * 步骤内容加载
	  */
	 partyRegistEdit.prototype.initStep2 = function(platformNo){
	 	
	 }
	 partyRegistEdit.prototype.initStep3 = function(){}
	 /**加载用户信息**/
	 partyRegistEdit.prototype.initStep4 = function(){}
	 partyRegistEdit.prototype.initStep5 = function(){}
	 //功能权限编辑插件
	 partyRegistEdit.prototype.authoritySetting = function(){
        var that = this;
        
        //var partyVersion = $('#partyVersion',this.template).val();
        var menuType = CONSTANT.MENU_TYPE.BCP_ENTERPRISE;
		var homeType = CONSTANT.MENU_TYPE.BCP_ENTERPRISE;
        
        var authority = new V.Classes['v.views.component.AuthoritySetting']();
        var data = {
            instance:this,
            id:that.party['id'],
            roleId:that.role['id'],
            module:that.module,
            menuType:menuType,
            homeType:homeType,
            action:'party',
            event:'authority_edit',
            platformNo:that.party['platformNo'],
            businessRole:CONSTANT.BUSINESS_ROLE.ENTERPRISE
        }
        authority.init(data);
        $('#step2-data',that.template).append(authority.template);
    }
    //销方功能权限编辑
    partyRegistEdit.prototype.partnertAuthoritySetting = function(){
        var that = this;
        
        //var partyVersion = $('#partyVersion',this.template).val();
		var menuType = CONSTANT.MENU_TYPE.BCP_SUPPLIER;
		var homeType = CONSTANT.MENU_TYPE.BCP_SUPPLIER;
		
        var authority = new V.Classes['v.views.component.AuthoritySetting']();
        var data = {
            instance:this,
            id:that.party['id'],
            roleId:that.role['id'],
            module:that.module,
            action:'party',
            menuType:menuType,
            homeType:homeType,
            event:'authority_edit_partner',
            platformNo:that.party['platformNo'],
            businessRole:CONSTANT.BUSINESS_ROLE.SUPPLIER
        }
        authority.init(data);
        $('#step3-data',that.template).append(authority.template);
    }
    //经销功能权限编辑
    partyRegistEdit.prototype.distributorAuthoritySetting = function(){
        var that = this;
		var menuType = CONSTANT.MENU_TYPE.BCP_CUSTOMER;
		var homeType = CONSTANT.MENU_TYPE.BCP_CUSTOMER;
		
        var authority = new V.Classes['v.views.component.AuthoritySetting']();
        var data = {
            instance:this,
            id:that.party['id'],
            roleId:that.role['id'],
            module:that.module,
            action:'party',
            menuType:menuType,
            homeType:homeType,
            event:'authority_edit_partner',
            platformNo:that.party['platformNo'],
            businessRole:CONSTANT.BUSINESS_ROLE.CUSTOMER
        }
        authority.init(data);
        $('#step4-data',that.template).append(authority.template);
    }
    partyRegistEdit.prototype.resetPassword = function(){
		var that = this;
		var user = this.user;
		var email = user.email||'';
		var url = 'backoffice/authority/user/user!resetPassword.action';
		var alertMsg="新的密码会发送到邮箱"+email+" , 请确认邮箱有效性，是否重置密码？";
		V.confirm(alertMsg,function(){
			$.ajax({
            	url:url,
               	type:'POST',
				data:{userId:user.id},
                success:function(data){
                     if(data.result=='success'){
                     	V.alert("重置密码成功，请查看邮件"+email+"获取密码！");
                     	that.user = data.user;
                     }else{
                     	V.alert(data);
                     }
                }
            })
		});	
	}
	partyRegistEdit.prototype.editPassword = function(){
		var that = this;
		var user = this.user;
		
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
			user.password = password;
			that.saveEditPassword(addDlg);
		}},{text:"取消",handler:addDlg.close}]});
		addDlg.init({title:'修改密码',height:250,width:500});
	}
	partyRegistEdit.prototype.saveEditPassword = function(addDlg){
		var that = this;
		var url = 'backoffice/authority/user/user!editPassword.action';
		V.ajax({
        	url:url,
           	type:'POST',
			data:{user:this.user},
            success:function(data){
                 if(data.result=='success'){
                 	V.alert("修改密码成功");
                 	addDlg.close();
                 	that.user = data.user;
                 }else{
                 	V.alert(data);
                 }
            }
        })
	}
	partyRegistEdit.prototype.initParentPlatformNo = function(){
		var that = this;
		var parentPlatform = $('*[party-data-key="parentPlatformNo"]');
		var partySelector = new V.Classes['v.views.component.PartySelector']();
		var options = {
			container:parentPlatform
		};
		partySelector.init(options);
		
		that.subscribe(partySelector,partySelector.EVENT.SELECT_CHANGE,function(entity){
	        			if(that.party){
	        				that.party['parentPlatformNo'] = entity.platformNo;
	        				that.party['parentPlatformId'] = entity.id;
	        			}
	        		});
		            		
		var pluginInput = $('[party-data-key=parentPlatformNo]').find('input');
		pluginInput.parent().addClass('edit_input');
	}
	partyRegistEdit.prototype.initRegionCode = function(){
		var that = this;
		var regionCode = $('*[party-data-key="regionCode"]');
		var areaPlugin = this.areaPlugin = new V.Classes['v.component.Area']();
		var options = {
			container:regionCode,
			config:{
				name:"regionCode",
				value:that.record['regionCode']
			}
		};
		areaPlugin.init(options);
		
		$('[party-data-key=regionCode]').find('.area').addClass('edit_input');
		
		this.renderAreaValue(that.record['regionCode']);
	}
	partyRegistEdit.prototype.renderAreaValue = function(code){
		var that = this;
		$.ajax({
			url:'common!listParentArea.action',
			data:{code:code},
			success:function(data){
				var areas = data;
				var length = areas.length;
				var province = {};
				var city = {};
				var county = {};
				var town = {};
				var village = {};
				var val = "";
				if(length>0){
					province = areas[length-1];
					val += province.name;
				}
				if(length>1){
					city = areas[length-2];
					val += city.name
				}
				if(length>2){
					county = areas[length-3];
					val += county.name
				}
				if(length>3){
					town = areas[length-4];
					val += town.name
				}
				if(length>4){
					village = areas[0];
					val += village.name
				};
				$('*[party-data-key="regionCode"]').find('.view_text').text(val);
			}
		})
	}
	partyRegistEdit.prototype.addCrumb = function(){
		V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'编辑主体'}});
	}
	})(V.Classes['v.views.backoffice.custom.PartyRegistEdit']);
},{plugins:["v.ui.step","v.component.area","v.ui.tree","v.views.component.partySelector","v.views.backoffice.authority.postControlPoint","v.ui.dialog","v.component.form","v.views.component.authoritySetting","v.component.fileUpload"]});