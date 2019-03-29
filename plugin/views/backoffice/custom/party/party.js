;V.registPlugin("v.views.backoffice.custom.party",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.Party",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.backoffice.custom.party";
			this.party = null;
			this.plat = null;
			this.userList = null;
			this.module = "";
			this.resource = {
			    html:'template.html'
			}
		}
	});
	(function(Party){
		Party.prototype.EVENT ={
		    VIEW_PARTY:'view_party'
		};
        Party.prototype.init = function(options){
			this.module = options.module;
            this.container = options.container;
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					that.initpartyInfo();
					that.initEvent();
					
					if(LoginInfo.user.admin==2){ //非超级管理员不显示管理员信息
						$('form[name=step3]',that.template).hide();
					}
				}
			})
			//this.addCrumb();
        };
		 Party.prototype.initEvent = function(options){
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
		 	//密码是否相同校验
            $('#inputPassword2',this.template).blur(function(){
                var msg = '密码和确认密码不相同，请重新输入！';
                if($('#inputPassword').val()!=$('#inputPassword2').val()){
                    $(this).parent().find('.error_msg').text(msg).show();
                }
                else{
                    $(this).parent().find('.error_msg').empty().hide();
                }
            });
        
		 	$(".user_group_view",this.template).click(function(){
				$(".user_group_view").hide();
				$(".user_group_edit").show();
				$(this).parents('form').removeClass('view').addClass('edit');
				$('*[user-data-key]', this.template).each(function(){
					$('.edit_input',this).attr('disabled',false);
				});
				
				//reset information
				$('*[user-data-key]',this.template).each(function(){
					 var key = $(this).attr('user-data-key');
					 var value = that.user[key]||'';
					 $('.edit_input', this).val(value);
				});
				
				//编辑时，清空密码
                $('*[user-data-key="password"]',that.template).find('.edit_input').val('');
                $('*[user-data-key="password2"]',that.template).find('.edit_input').val('');
			});
			$('.user_group_edit .save',this.template).click(function(){
                var user = that.user;
                if(!that.validate('[name=step3]')) return;
                var msg = '密码和确认密码不相同，请重新输入！';
                if($('#inputPassword').val()!=$('#inputPassword2').val()){
                    $('#inputPassword2').next().next().text(msg).show();
                    return;
                }
                else{
                    $('#inputPassword2').next().next().empty().hide();
                }
                
                $('*[user-data-key]',that.template).each(function(){
                    var key = $(this).attr('user-data-key');
                    user[key] = $('.edit_input',this).val();
                });
                //update chenhaijun   step3--->updateUser 修改url
                var url = that.module+'/party!updateUser.action';
                $.ajax({
                    url:url,
                    type:'post',
                    data:JSON.stringify({user:user}),
                    contentType:'application/json',
                    success:function(data){
                       if(data.msg== "success"){
                            //that.user = data;
//                            $('*[user-data-key]',that.template).each(function(){
//                                var key = $(this).attr('user-data-key');
//                                var value = user[key];
//                                $('.view_text',this).text(value);
//                                $('.edit_input',this).val(value);
//                            });
                            
//                            $('#inputPassword').next().text('******'); //密码
//                            $('#inputPassword2').val(user['password']); //确认密码
//                            $('#inputPassword2').next().text('******');
                                
                            $(".user_group_view",that.template).parents("form").removeClass("edit").addClass("view");
                            $(".user_group_edit",that.template).hide();
                            $(".user_group_view",that.template).show();
                            V.alert("保存成功!");
                       }else if(data.msg=="error"){
                    	   V.alert(data.info);
                       }
                    }
                })
            });
			$(".user_group_edit .cancel").click(function(){
				$(this).parents('.user_group_edit').hide();
				$('.user_group_view',that.template).show();
				$(this).parents('form').removeClass('edit').addClass('view');
				
				$('.error_msg').empty().hide();
			});
		 }
 
		Party.prototype.editAssociate = function(record) {
			var options = {};
			options.module = this.module;
			this.forward('v.views.backoffice.authority.associateUser',options);
		}
        Party.prototype.initpartyInfo = function(options){
		   var that = this;
           $.ajax({
				url:this.module+"/party!input.action",
				dataType:'json',
				success:function(dom){
					 var party = dom.party;
					 var plat = dom.platInfo;
					 if (typeof(party) != 'undefined') {
					 	that.party = party;
					 	$('*[party-data-key]', this.template).each(function(){
					 		var key = $(this).attr('party-data-key');
					 		var value = party[key];
					 		if (typeof(value) != 'undefined') {
								if(key=='businessRole'){
									value = CONSTANT.BUSINESS_ROLE[value];
								}
								if(key=='companyCharacter'){
									value = CONSTANT.COMPANY_CHARACTER[value];
								}
					 			$('.edit_input', this).val(value);
								$('.view_text', this).text(value);
					 		}
					 	});
					 }
					if (typeof(plat) != 'undefined') {
						that.plat = plat;
						$('*[plat-data-key]',this.template).each(function(){
							 var key = $(this).attr('plat-data-key');
							 var value = plat[key];
							 if(typeof(value) != 'undefined'){
							 	$('.edit_input', this).val(value);
								$('.view_text', this).text(value);
							 }
						});
					}
					if (typeof(dom.user) != 'undefined') {
						var user = that.user = dom.user;
						$('*[user-data-key]',this.template).each(function(){
							 var key = $(this).attr('user-data-key');
							 var value = that.user[key];
							if(typeof(value) != 'undefined'){
							 	$('.edit_input', this).val(value);
								$('.view_text', this).text(value);
							 }
						});
						$('#inputPassword').next().text('******'); //密码
                        $('#inputPassword2').val(user['password']); //确认密码
                        $('#inputPassword2').next().text('******');
					}
					
				}
			})
        };
        Party.prototype.validate = function(name){
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
        Party.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'我的信息'}});
		}
	})(V.Classes['v.views.backoffice.custom.Party'])
},{plugins:["v.ui.grid","v.ui.dialog","v.ui.pagination",'v.ui.alert']});