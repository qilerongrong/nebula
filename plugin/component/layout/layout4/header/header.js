;V.registPlugin("v.component.layout.layout4.header",function(){
	V.Classes.create({
		className:"v.component.layout.layout4.Header",
		superClass:"v.component.pages.Header",
		init:function(){
		    this.ns = "v.component.layout.layout4.header";
			this.resource = {
			    html:'template.html'
			}
		}
	});
	(function(Header){
		Header.prototype.EVENT = {
			LOAD_CONTENT:'load_content'
		}
		Header.prototype.init = function(options){
			this.container = options.container;
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					that.initEvent();
					
				}
			})
		};
		Header.prototype.initEvent = function(){
		    var that = this;
		    // $('.dropdown-toggle',this.template).dropdown();
		    var lang = $.cookie('lang')||V.Lang.language;
		    if(lang == "en-US"){
		    	$('.lang',this.template).text("EN");
		    }else if(lang == "zh-CN"){
		    	$('.lang',this.template).text("中文");
		    }
			$('.language_cn',this.template).click(function(){
				that.language('zh-CN');
			});
			$('.language_en',this.template).click(function(){
				that.language('en-US');
			});
			$(".passwordModify",this.template).click(function(){
                var dlg = that.passwordDlg = new V.Classes['v.ui.Dialog']();
                dlg.setBtnsBar({btns:[
                    {text:that.getLang("BIN_CONFIRM"),style:"btn-primary",handler:function(){
                          if(!that.validate()) return;
                          that.passwordSave();
                    }}
                    ,{text:that.getLang("BIN_CLOSE"),style:"btn",handler:dlg.close}
                ]});
                dlg.init({width:560,height:320,title:that.getLang("BIN_CGE_PASSWORD")});
                var url = that.getPath()+"/assets/customPasswordSetting.html";
                $.ajax({
                    url:url,
                    dataType:'html',
                    success:function(dom){
                    	var dom1='<div class="form-horizontal v-form">\
									<div class="control-group">\
									  <label class="control-label" for="input01"><span style="color:red">*</span>'+that.getLang("LABEL_OLD_PASSWORD")+'：</label>\
									  <div class="controls" data-key="orgPassword">\
									    <input type="password" class="input-xlarge edit_input" id="orgInputPassword" data-validator="text3(0,15)" data-required="true">\
										<p class="error_msg" ></p>\
									  </div>\
									</div>\
									<div class="control-group">\
									  <label class="control-label" for="input01"><span style="color:red">*</span>'+that.getLang("LABEL_NEW_PASSWORD")+'：</label>\
									  <div class="controls" data-key="password">\
									    <input type="password" class="input-xlarge edit_input" id="inputPassword" data-validator="text3(6,15)" data-required="true">\
										<p class="error_msg" ></p>\
									  </div>\
									</div>\
									<div class="control-group">\
									  <label class="control-label" for="input01"><span style="color:red">*</span>'+that.getLang("LABEL_CONFIRM_PASSWORD")+'：</label>\
									  <div class="controls" data-key="password2">\
									    <input type="password" class="input-xlarge edit_input" id="inputPassword2" data-validator="text3(6,15)" data-required="true">\
										<p class="error_msg" ></p>\
									  </div>\
									</div>\
								</div>';
                        dlg.setContent(dom1);
                        $('#email',dlg.template).val(LoginInfo.user.email);
                    }
                });
            });
			$(".passwordChange",this.template).click(function(){
                var dlg = that.passwordDlg = new V.Classes['v.ui.Dialogno']();
                dlg.setBtnsBar({btns:[
                    {text:that.getLang("BIN_CONFIRM"),style:"btn-primary",handler:function(){
                          if(!that.validate()) return;
                          that.passwordSave();
                          dlg.close();
                    }}
                ]});
                dlg.init({width:560,height:320,title:that.getLang("MSG_FIRST_PASSWORD")});
                var url = that.getPath()+"/assets/customPasswordSetting.html";
                $.ajax({
                    url:url,
                    dataType:'html',
                    success:function(dom){
                    	var dom1='<div class="form-horizontal v-form">\
									<div class="control-group">\
									  <label class="control-label" for="input01"><span style="color:red">*</span>'+that.getLang("LABEL_OLD_PASSWORD")+'：</label>\
									  <div class="controls" data-key="orgPassword">\
									    <input type="password" class="input-xlarge edit_input" id="orgInputPassword" data-validator="text3(0,15)" data-required="true">\
										<p class="error_msg" ></p>\
									  </div>\
									</div>\
									<div class="control-group">\
									  <label class="control-label" for="input01"><span style="color:red">*</span>'+that.getLang("LABEL_NEW_PASSWORD")+'：</label>\
									  <div class="controls" data-key="password">\
									    <input type="password" class="input-xlarge edit_input" id="inputPassword" data-validator="text3(6,15)" data-required="true">\
										<p class="error_msg" ></p>\
									  </div>\
									</div>\
									<div class="control-group">\
									  <label class="control-label" for="input01"><span style="color:red">*</span>'+that.getLang("LABEL_CONFIRM_PASSWORD")+'：</label>\
									  <div class="controls" data-key="password2">\
									    <input type="password" class="input-xlarge edit_input" id="inputPassword2" data-validator="text3(6,15)" data-required="true">\
										<p class="error_msg" ></p>\
									  </div>\
									</div>\
									<div class="control-group">\
									  <label class="control-label" for="input01"><span style="color:red">*</span>'+that.getLang("LABEL_EMAIL")+'：</label>\
									  <div class="controls" data-key="email">\
									    <input type="text" class="input-xlarge edit_input" id="email" data-validator="email" data-required="true">\
										<p class="error_msg" ></p>\
									  </div>\
									</div>\
								</div>';
                        dlg.setContent(dom1);
                        $('#email',dlg.template).val(LoginInfo.user.email);
                    }
                });
            });
			 if(!LoginInfo.user){
            	V.MessageBus.subscribe('user-info-loaded',function(){
    				that.initCurUser();
    			});
            }else{
            	this.initCurUser();
            }
            
        	this.downloadLogo();   
		}
		//密码修改保存
		Header.prototype.passwordSave = function(){
		    var that = this;
            var url = 'common!updatePwd.action';
            $.ajax({
                url:url,
                type:'post',
                data:{oldPass:$('#orgInputPassword').val(),newPass:$('#inputPassword').val(),email:$('#email').val()},
                success:function(data){
                   if(data=='success'){
//                	   V.confirm(that.getLang("MSG_RELOGIN"),function(){
//            			   that.passwordDlg.close();
//                	       location.href= "j_spring_security_logout";
//                	   },function(){
//                		   that.passwordDlg.close();
//                	   });
                	   V.alert(that.getLang("MSG_RELOGIN"));
                   }else{
                       V.alert(data);
                   }
                }
            })
		}
		Header.prototype.initCurUser = function(){
		    //$("#logo").attr("src","fileDownloadServlet?fileType=logo");
		    if(LoginInfo.user.loginStatus==CONSTANT.LOGIN_STATUS.FIRST_LOGIN){
            	$(".passwordChange",this.template).click();
            }
			var userName=LoginInfo.user.userName;
			// userName=userName+"("+CONSTANT.BMW_USER[LoginInfo.user.businessRole]+")";
			$(".userName",this.template).text(userName);
            $('.userConfig',this.template).mouseover(function(){
                $('.drop',$(this)).css('display','block');
            });
            $('.userConfig',this.template).mouseout(function(){
                $('.drop',$(this)).css('display','none');
            });
            //this.riskRedShow();
		}
		Header.prototype.riskRedShow = function(){
			var that = this;
			$.ajax({
				url:'index!checkRiskRed.action',
				success:function(data){
					var info = '';
					if (data.riskRed) {
						info = info + "There are open Red Alerts";
					}
					if (data.riskSell) {
						info = info + "<br/>There are open  Sales Alerts";
					}
					if (info != '') {
						V.showMessage(info);
					}
				}
			})
		}
		Header.prototype.language = function(language){
			$.cookie('lang',language);
			location.reload();
//			$.ajax({
//				url:'index!language.action',
//				data:{language:language},
//				success:function(){
//                    location.reload();
//				}
//			})
		}
		//下载中心
		// Header.prototype.openDownloadCenter = function(){
		// 	var dlg = new V.Classes['v.ui.Dialog']();
		// 	var con = $('<ul class="downloadList"></ul>');
		// 	$.ajax({
		// 		url:'index!listFilesInDownloadCenter.action',
		// 		success:function(files){
		// 			$.each(files,function(){
		// 				var item =$('<li><a href="'+this.url+'">'+this.name+'</a></li>');
		// 				con.append(item);
		// 			})
		// 		}
		// 	})
		// 	dlg.setContent(con);
		// 	dlg.init({
		// 		width:600,
		// 		height:400,
		// 		title:'下载中心'
		// 	});
		// }
		//自己定义的form验证
        Header.prototype.validate = function(){
            var isValid = true;
            $('*[data-validator]',this.passwordDlg.getContent()).each(function(){
                var required = $(this).attr('data-required')||false;
                var rules = $(this).attr('data-validator')||'';
                var v = $(this).val();
                if(required=="true"&&v==""){
                        $(this).parent().find('.error_msg').text(that.getLang("MSG_REMIND_EMPTY")).show();
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
            
            if(!isValid) return isValid;
            
            var msg = this.getLang("MSG_PASSWORD_OLD_SAME");
            if($('#orgInputPassword').val()==$('#inputPassword').val()){
                $('#inputPassword').next().text(msg).show();
                return false;
            }else{
                $('#inputPassword').next().empty().hide();
            }
            var msg1=this.getLang("MSG_PASSWORD_SIMPLE");
            var passwd=$('#inputPassword').val()
            var passLevel = 0;
            if(passwd.length<8){
            	$('#inputPassword').next().text(msg1).show();
   			    return false;
            }
    		if((/([a-zA-Z])+/).test(passwd)){
    			passLevel ++;
    		}
    		if((/([0-9])+/).test(passwd)){  	 
    			passLevel++;     
    		} 
    		if((/[^a-zA-Z0-9]+/).test(passwd)){   
    			passLevel++;   		  
    		} 
    		if(!(passLevel>=2)){
    			 $('#inputPassword').next().text(msg1).show();
    			 return false;
    		}else{
    			 $('#inputPassword').next().empty().hide();
    		}
            var msg2 = this.getLang("MSG_PASSWORD_CONFIRM_SIME");
            if($('#inputPassword').val()!=$('#inputPassword2').val()){
                $('#inputPassword2').next().text(msg2).show();
                return false;
            }else{
                $('#inputPassword2').next().empty().hide();
            }
            return isValid;
        }
        Header.prototype.downloadLogo = function(){
        	var imgObj = $('#logo');
        	var url = "backoffice/systemsetting/party/party!downloadLogo.action?fileType=LOGO";
        	$.ajax({
        		url:url,
                type:'post',
                data:{},
                success:function(data){
                	if(data=="fail"){
                		imgObj.hide();
                	}else{
                		imgObj.parent().show();
                		imgObj.attr("src","backoffice/systemsetting/party/party!downloadLogo.action?fileType=LOGO");
                	}
                }
        	})
        }
	})(V.Classes['v.component.layout.layout4.Header']);
},{plugins:['v.ui.alert','v.ui.confirm','v.ui.messageBox',"v.ui.dialogno","v.fn.validator"]});