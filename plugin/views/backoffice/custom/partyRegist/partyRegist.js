/*
 * 运维管理-主体管理-主体注册-主体新增
 */
;V.registPlugin("v.views.backoffice.custom.partyRegist",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.PartyRegist",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.backoffice.custom.partyRegist";
			this.module = "";
			this.menu_tree = new V.Classes['v.ui.Tree']();
			this.party = {};
			this.user = {};
			this.post = {};
			this.role = {};
			this.step = null;
			this.resource = {
			    html:'template.html'
			};
			this.steps = ["基本信息","功能权限","管理员"];//,"企业LOGO管理"
		}
	});
	(function(PartyRegist){
        PartyRegist.prototype.init = function(options){
			this.module = options.module;
			var that = this;
			this.container = options.container;
			this.options = options;
			/**分步骤UI**/
 			var step = this.step = new V.Classes['v.ui.Step']();
			step.init({
					container:that.container,
					maxStep:3,
					stepNo:1,
					guide:that.steps
				});
			/**加载第一步骤内容**/
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					$('.step-content',step.template).append(dom);
					that.container.append(step.template);
					that.initEvent(step);
					
//					that.provinceSel();
//					that.citySel();
//					that.countSel();
//					that.initPartyVersion();
					that.initParentPlatformNo();
					that.initRegionCode();
					//that.initPartyPlatformNo();
					//that.testHelper();//test use
				}
			})
        };
       
        PartyRegist.prototype.uploadFile = function(platformNo){
			var upload = new V.Classes['v.component.FileUpload']();
			var that = this;
			upload.init({
				title : '企业LOGO上传',
				uploadSetting:{
					url:'backoffice/systemsetting/party/party!uploadLogo.action?fileType=LOGO&contractCode='+platformNo,
					complete:function(){
						V.alert("上传成功！");
						$("#platformNo",that.step.template).attr("readonly","true");
					}
				}
			});
		}
        PartyRegist.prototype.initEvent = function(step){
		 	var that = this;
		 	
		 	this.step.getStep(4).hide();
		 	
		 	$('#validStartDate',step.template).datepicker({dateFormat: "yy-mm-dd",showMonthAfterYear:true,changeMonth: true,
			             changeYear: true});
			$('#validEndDate',step.template).datepicker({dateFormat: "yy-mm-dd",showMonthAfterYear:true,changeMonth: true,
	             changeYear: true});
			$('#registeDate',step.template).datepicker({dateFormat: "yy-mm-dd",showMonthAfterYear:true,changeMonth: true,
	             changeYear: true});
			             
			that.keyValidate();
			
			$('#getPlatformNo',step.template).click(function(){
				that.initPartyPlatformNo();
			});
        
	        $('#uploadBtn',step.template).click(function(){
	        	 var platformNo=$("#platformNo",that.step.template).val();
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
	        $('#inputPassword2',step.template).blur(function(){
	            var msg = '密码和确认密码不相同，请重新输入！';
	            if($('#inputPassword',that.step.template).val()!=$('#inputPassword2',that.step.template).val()){
	                $(this).parent().find('.error_msg').text(msg).show();
	            }
	            else{
	                $(this).parent().find('.error_msg').empty().hide();
	            }
	        });
        
	  		/**绑定下一步事件**/
 			$('#next,#next2',step.template).click(function(){
				if(step.options.stepNo == 1){
					if(!that.validate('[name=step1]')) return;
					var party = that.party||{};
					 
					$('*[party-data-key]',step.template).each(function(){
						var key = $(this).attr('party-data-key');
						party[key] = $('.edit_input',this).val();
						if(key=='parentPlatformNo'){
							party[key] = $('input',this).val();
						}
						else if(key=='copyPlatformNo'){
							party[key] = $('input',this).val();
						}else if(key == 'regionCode'){
							var areaValues = that.areaPlugin.getValue();
							for(keyy in areaValues){
								party[keyy] = areaValues[keyy];
							}
						}
					});
					if($("#id",step.template).val() != '' ){
						party['id']= $("#id",step.template).val();
					}
					
					if(party['registeFunds']=="")
						party['registeFunds'] = null;
					
					party['businessRole'] = $('#businessRole',step.template).val();
					party['companyCharacter'] = $('#companyCharacter',step.template).val();
					$.ajax({
		            	url:that.module+"/party!step1.action",
		               	type:'post',
						data:JSON.stringify({party:party}),
						contentType:'application/json',
		                success:function(data){
		                     if(data != null && data.party != null && data.party['id'] != null){
							 	$('#id',step.template).val(data.party['id']);
		                     	$('#platformNo',step.template).val(data.party.platformNo);
		                     	$('#party_code',step.template).val(data.party.id);
		                     	
		                     	that.party = data.party;
		                     	if(data.user!=null)
		                     		that.user = data.user;
		                     	if(data.post!=null)	
		                     		that.post = data.post;
		                     	if(data.role!=null)	
		                     		that.role = data.role;
		                     		
								that.initStep2();
								step.next();
		                     }else{
								V.alert(data);
								return;
		                     }
		                }
		            })
				}
//				else if(step.options.stepNo == 2){
//				    step.next();
//				    that.keyValidate();
//					that.initStep4();
//				    return;
//				}
//				else if(step.options.stepNo == 3){
//					if($('#isMarketing',that.step.template).val()==1){
//						step.next();
//						that.initStep4();
//						return;						
//					}else{
//						step.next();step.next();
//						that.getUserHeader();
//						that.keyValidate();
//						return;
//					}
//				}
				else if(step.options.stepNo == 2){
					step.next();
					that.getUserHeader();
					that.keyValidate();
					return;
				}
			});
			$('#success,#success2',step.template).click(function(){
				if(step.options.stepNo == 3){
					//用户编码校验
					var userCodeDom = $('*[user-data-key=loginName]',that.step.template).find('input');
					var reg = new RegExp('^'+userCodeDom.data('userHeader')+'[0-9a-zA-Z]+$');
					if(!reg.test(userCodeDom.val())){
						V.alert('用户登录名称必须以'+userCodeDom.data('userHeader')+'开头！');
						return;
					}
					
                    var stepName = 'step' + step.options.stepNo;
					if(!that.validate('[name='+stepName+']')) return;
					
					var user = that.user||{};
					$('*[user-data-key]',that.step.template).each(function(){
						var key = $(this).attr('user-data-key');
						user[key] = $('.edit_input',this).val();
					});
					if($("#userid",step.template).val() != '' ){
						user['id']= $("#userid",that.step.template).val();
					}
					//user['modifyDate'] = new Date();
					user['posts'] = null;
					user['platformNo'] = $('#platformNo',step.template).val();
					user['partnerNo'] = $('#platformNo',step.template).val();
					user.password=hex_sha1(user.password);
					$('#success,#success2',that.step.template).attr('disabled',true);
					
					$.ajax({
		            	url:that.module+'/party!step4.action',
		               	type:'post',
						data:JSON.stringify({user:user}),
						contentType:'application/json',
		                success:function(data){
		                     if (data != null && data['id'] != undefined) {
								//that.forward('v.views.backoffice.custom.partyRegistList',that.options);
		                    	 V.MessageBus.publish({eventId:'backCrumb'});
							 }else{
							 	V.alert("保存失败! "+data.info||'');
								return;
							 }
		                }
		            })
					return;
				}
			});
			/**绑定上一步事件**/
			$('#prev,#prev2',step.template).click(function(){
				if(step.options.stepNo == step.options.maxStep){
					if($('#isMarketing',that.step.template).val()==1){
						step.previous();
						return;						
					}else{
						step.previous();
						//step.previous();
						return;
					}
				}else{
					step.previous();
				}
			});
			
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
     //获取平台号
//	 PartyRegist.prototype.getPlatformNo = function(){
//		 alert("11");
//	 }
	 PartyRegist.prototype.provinceSel = function(){
		var that = this;
		$.ajax({
			url:'common!province.action',
			success:function(provinces){
				$.each(provinces,function(){
					var option = "<option value='"+this.id+"'>"+this.name+"</option>";
					$('select[name=provinceId]',that.step.template).append(option);
				});
				var id = $('select[name=provinceId]',that.step.template).val()
//				 var platformNO  = $('*[party-data-key=platformNo]',that.step.template).find('input');
//				 platformNO.val(id);
//				 that.party['platformNo'] = id;
				$.ajax({
                    url:'common!city.action',
                    data:{parentId:$('select[name=provinceId]',that.step.template).val()},
                    success:function(citys){
                        $('select[name=cityId]',that.step.template).empty();
                        $('select[name=cityId]',that.step.template).append("<option value='-1'>请选择</option>");
                        $.each(citys,function(){
                            var option = "<option value='"+this.id+"'>"+this.name+"</option>";
                            $('select[name=cityId]',that.step.template).append(option);
                        });
                    }
                })
                    
				$('select[name=provinceId]',that.step.template).change(function(){
					var id = $(this).val();
//					 var platformNO  = $('*[party-data-key=platformNo]',that.step.template).find('input');
//					 platformNO.val(id);
//					 that.party['platformNo'] = id;
					$.ajax({
						url:'common!city.action',
						data:{parentId:id},
						success:function(citys){
							$('select[name=cityId]',that.step.template).empty();
							$('select[name=cityId]',that.step.template).append("<option value='-1'>请选择</option>");
							$.each(citys,function(){
								var option = "<option value='"+this.id+"'>"+this.name+"</option>";
								$('select[name=cityId]',that.step.template).append(option);
							});
						}
					})
				});
			}
		})
	}
	 PartyRegist.prototype.citySel = function(){
		 var that = this;
		 $('select[name=cityId]',that.step.template).change(function(){
				var id = $(this).val();
//				 var platformNO  = $('*[party-data-key=platformNo]',that.step.template).find('input');
//				 platformNO.val(id);
//				 that.party['platformNo'] = id;
				$.ajax({
					url:'common!county.action',
					data:{parentId:id},
					success:function(citys){
						$('select[name=countyId]',that.step.template).empty();
						$('select[name=countyId]',that.step.template).append("<option value='-1'>请选择</option>");
						$.each(citys,function(){
							var option = "<option value='"+this.id+"'>"+this.name+"</option>";
							$('select[name=countyId]',that.step.template).append(option);
						});
					}
				})
			});
	 }
	 PartyRegist.prototype.countSel = function(){
		 var that = this;
		 $('select[name=countyId]',that.step.template).change(function(){
			 var id = $(this).val();
//			 var platformNO  = $('*[party-data-key=platformNo]',that.step.template).find('input');
//			 platformNO.val(id);
//			 that.party['platformNo'] = id;
		 });
	 }
	PartyRegist.prototype.initPartyVersion = function(){
		var partyVersion = $('select[name=partyVersion]',this.step.template);
		partyVersion.append('<option value='+CONSTANT.AUTH_TYPE.AUTH_TYPE_STANDARD+'>'+'标准版'+'</option>');
		partyVersion.append('<option value='+CONSTANT.AUTH_TYPE.AUTH_TYPE_PARTY+'>'+'企业版'+'</option>');
		partyVersion.append('<option value='+CONSTANT.AUTH_TYPE.AUTH_TYPE_ALL+'>'+'全部版'+'</option>');
	}
	PartyRegist.prototype.initPartyPlatformNo = function(){
		var that = this;
		$.ajax({
			url:that.module+'/party!createPlatformNo.action',
//			data:{parentId:id},
			success:function(data){
				var platformNO  = $('*[party-data-key=platformNo]',that.step.template).find('input');
				 platformNO.val(data);
				 that.party['platformNo'] = data;
			}
		})
	}
	PartyRegist.prototype.initStep2 = function(step){
	 	var container = this.container;
	 	var menu_tree = this.menu_tree;
	 	var menuType;
	 	var role = this.role;
	 	var party = this.party;
	 	if (party.businessRole == CONSTANT.BUSINESS_ROLE.ENTERPRISE) {
	 		menuType = CONSTANT.MENU_TYPE.BCP_ENTERPRISE;
	 	} else {
	 		menuType = CONSTANT.MENU_TYPE.BCP_SUPPLIER;
	 	}
	 	
		this.authoritySetting();
		
		//处理营销是否存在dom
		if($('#isMarketing').val()==1){
			this.step.getStep(4).show();
		}else{
			this.step.getStep(4).hide();
		}
	 }
	 PartyRegist.prototype.initStep3 = function(step){
	 	this.partnertAuthoritySetting();
	 }
	 PartyRegist.prototype.initStep4 = function(step){
	 	this.distributorAuthoritySetting();
	 }
	 PartyRegist.prototype.authoritySetting = function(){
        var that = this;
        var partyVersion = $('#partyVersion',this.step.template).val();
        if($('#step2-data',that.step.template).html()!=''){
        	this.authority.data.partyVersion = partyVersion;
        	return;
        }

        var menuType = CONSTANT.MENU_TYPE.BCP_ENTERPRISE;
		var homeType = CONSTANT.MENU_TYPE.BCP_ENTERPRISE;
		
        var authority = this.authority = new V.Classes['v.views.component.AuthoritySetting']();
        var data = {
            instance:this,
            id:that.party['id'],
            roleId:that.role['id'],
            module:that.module,
            action:'party',
            menuType:menuType,
            homeType:homeType,
            partyVersion:partyVersion,
            event:'authority_edit',
            platformNo:that.party['platformNo'],
            businessRole:CONSTANT.BUSINESS_ROLE.ENTERPRISE
        }
        authority.init(data);
        $('#step2-data',that.step.template).append(authority.template);
    }
    PartyRegist.prototype.partnertAuthoritySetting = function(){
        var that = this;
        var partyVersion = $('#partyVersion',this.step.template).val();
        if($('#step3-data',that.step.template).html()!=''){
        	this.partnertAuthority.data.partyVersion = partyVersion;
        	return;
        }
        
		var menuType = CONSTANT.MENU_TYPE.BCP_SUPPLIER;
		var homeType = CONSTANT.MENU_TYPE.BCP_SUPPLIER;
		
        var authority = this.partnertAuthority = new V.Classes['v.views.component.AuthoritySetting']();
        var data = {
            instance:this,
            id:that.party['id'],
            roleId:that.role['id'],
            module:that.module,
            action:'party',
            menuType:menuType,
            partyVersion:partyVersion,
            homeType:homeType,
            event:'authority_edit_partner',
            platformNo:that.party['platformNo'],
            businessRole:CONSTANT.BUSINESS_ROLE.SUPPLIER
        }
        authority.init(data);
        $('#step3-data',that.step.template).append(authority.template);
    }
    PartyRegist.prototype.distributorAuthoritySetting = function(){
        var that = this;
        var partyVersion = $('#partyVersion',this.step.template).val();
        if($('#step4-data',that.step.template).html()!=''){
        	this.partnertAuthority.data.partyVersion = partyVersion;
        	return;
        }
        
		var menuType = CONSTANT.MENU_TYPE.BCP_CUSTOMER;
		var homeType = CONSTANT.MENU_TYPE.BCP_CUSTOMER;
		
        var authority = this.distributorAuthority = new V.Classes['v.views.component.AuthoritySetting']();
        var data = {
            instance:this,
            id:that.party['id'],
            roleId:that.role['id'],
            module:that.module,
            action:'party',
            menuType:menuType,
            partyVersion:partyVersion,
            homeType:homeType,
            event:'authority_edit_distributor',
            platformNo:that.party['platformNo'],
            businessRole:CONSTANT.BUSINESS_ROLE.CUSTOMER
        }
        authority.init(data);
        $('#step4-data',that.step.template).append(authority.template);
    }
	//获取用户编码首字母
	PartyRegist.prototype.getUserHeader = function(record,context){
        var that = this;
        var url = 'common!getUserHeader.action';
		$.ajax({
		    url:url,
		    type:'post',
		    data:{partyId:that.party.id},
			dataType:'text',
			success:function(data){
			    $('*[user-data-key=loginName]',that.step.template).find('input').data('userHeader',data).val(data);
	        }
	    })
	}
	PartyRegist.prototype.keyValidate = function(){
		/**设置验证**/
        $('*[data-validator]:visible',this.step.template).keyup(function(e){
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
	}
	PartyRegist.prototype.validate = function(dom){
	 	var isValid = true;
	 	
		$(dom+' *[data-validator]',this.step.template).each(function(){
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

		if(dom=='[name=step4]' && isValid==true){
			var msg = '密码和确认密码不相同，请重新输入！';
			if($('#inputPassword',this.step.template).val()==''){
				isValid = false;
			}
			else if($('#inputPassword',this.step.template).val()!=$('#inputPassword2',this.step.template).val()){
	        	$('#inputPassword2',this.step.template).parent().find('.error_msg').text(msg).show();
	            isValid = false;
	        }
	        else{
	        	$('#inputPassword2',this.step.template).parent().find('.error_msg').empty().hide();
	            isValid = true;
	        }
		}
		return isValid;
	}
	PartyRegist.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'新增主体'}});
	}
	PartyRegist.prototype.testHelper = function(){
		var record = {"address":"000000000000007","businessRole":"BUYER","partyName":"测试主体","partyCode":"000000000000007","telephone":"000000000000007","userHeader":"aa","email":"111@111.c","mobile":"13411111111","zipCode":"111111","fax":"1111","remark":null,"partyStatus":"0","props":{},"provinceId":"140000","cityId":"140100","validStartDate":"2014-02-05","validEndDate":"2014-02-28","partyType":null,"partyClass":null,"registeDate":"2014-02-24","registeFunds":100,"partner":"000000000000007","companyCharacter":"1","propsAsJson":"{}","id":2995306,"version":null,"incomingTime":null,"createTime":null,"createPerson":null,"updatePerson":null,"platformNo":"000000000000007","isRemoved":"0","updateTime":null};
//		$('*[party-data-key]',this.template).each(function(){
		$('*[party-data-key]').each(function(){
			var key = $(this).attr('party-data-key');
			var type = $(this).attr('party-data-type');
			var value = record[key];
			if(type == 'select'){
			    var keySel = $('select[name="'+key+'"]',that.template);
                keySel.val(that.record[key])
			}
			else{
				$('.edit_input',this).val(value);
            }
		});
	}
	PartyRegist.prototype.initParentPlatformNo = function(){
		var parentPlatform = $('*[party-data-key="parentPlatformNo"]');
		var partySelector = new V.Classes['v.views.component.PartySelector']();
		var options = {
			container:parentPlatform
		};
		partySelector.init(options);
		
		var copyPlatform = $('*[party-data-key="copyPlatformNo"]');
		var copyPartySelector = new V.Classes['v.views.component.PartySelector']();
		var options = {
			container:copyPlatform
		};
		copyPartySelector.init(options);
	}
	PartyRegist.prototype.initRegionCode = function(){
		var that = this;
		var regionCode = $('*[party-data-key="regionCode"]');
		var areaPlugin = this.areaPlugin = new V.Classes['v.component.Area']();
		var options = {
			container:regionCode,
			config:{
				name:"regionCode"
			}
		};
		areaPlugin.init(options);
	}
	})(V.Classes['v.views.backoffice.custom.PartyRegist'])
},{plugins:["v.ui.step","v.ui.tree","v.component.area",'v.ui.alert','v.views.component.authoritySetting','v.component.fileUpload','v.views.component.partySelector']});
