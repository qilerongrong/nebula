;V.registPlugin("v.views.backoffice.custom.emailSetting",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.EmailSetting",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.backoffice.custom.emailSetting";
			this.emailSmtp = null;
			this.state = 'view';//view || edit;
			this.module = '';
			this.resource = {
				html:'template.html'
			}
		}
	});
	(function(EmailSetting){
        EmailSetting.prototype.init = function(options){
			this.options = options;
			this.module = options.module;
			this.container = options.container;
			this.emailSmtp = options.emailSmtp || {};
			this.platformNo = options.platformNo||'';
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					that.initInfo();
					that.initEvent();
				}
			})
		}
		EmailSetting.prototype.initEvent = function(){
			var that = this;
			/**设置验证**/
			$('*[data-validator]',this.template).keyup(function(e){
				var v = this.value;
				var rules = $(this).attr('data-validator');
				var required = $(this).attr('data-required')||false;
				
				if(required&&v==""){
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
			//编辑
			$('.group_view .edit',this.template).click(function(){
				$(this).parents('.group_view').hide();
				$('.group_edit',that.template).show();
				$(this).parents('form').removeClass('view').addClass('edit');
			});
			//取消
			$('.group_edit .cancel',this.template).click(function(){
				$(this).parents('.group_edit').hide();
				$('.group_view',that.template).show();
				$(this).parents('form').removeClass('edit').addClass('view');
			});
			
			//保存
			$('.save',this.template).click(function(){
				if(!that.validate()) return;
				var emailSmtp = that.emailSmtp;
				$('*[data-key]',that.template).each(function(){
					var key = $(this).attr('data-key');
					if(key == 'auth'){
						if($('.edit_input',this).attr("checked")){
							emailSmtp[key] = true;
						} else {
							emailSmtp[key] = false;
						}
					} else {
						emailSmtp[key] = $('.edit_input',this).val();
					}
				});
				$.ajax({
		            	url:that.module+'/email-stmp!save.action',
		               	type:'post',
						data:JSON.stringify({emailSmtp:emailSmtp,platformNo:that.platformNo}),
						contentType:'application/json',
		                success:function(data){
		                     if(data == 'success'){
		                     	V.alert("保存成功!");
		                     	//$('.group_edit .cancel',this.template).click();
		                     	that.forward("v.views.backoffice.custom.emailSetting",that.options);
		                     }
		                }
		            })
			})
			
			
		}
		
		EmailSetting.prototype.initInfo = function(){
			var that = this;
			var url = that.module+'/email-stmp!input.action';
            $.ajax({
            	url:url,
               	type:'POST',
				data:JSON.stringify({id:null,platformNo:that.platformNo}),
				contentType:'application/json',
                success:function(data){
                	if(data!=null){
                		var emailSmtp = data;
                    	that.emailSmtp = data;
    					$('*[data-key]',this.template).each(function(){
    						var key = $(this).attr('data-key');
    						var value = emailSmtp[key];
    						if(key == 'auth') {
    							$('.view_text',this).text(value ? '是' : '否');
    							$('.edit_input',this).attr('checked',value?true:false);
    						}else if(key == 'password'){
    							$('.view_text',this).text('*****');
    							$('.edit_input',this).val(value);
    						}else{
    							$('.view_text',this).text(value);
    							$('.edit_input',this).val(value);
    						}
    					});
                	}
                }
            })
		}
		 EmailSetting.prototype.validate = function(){
			var isValid = true;
			$('*[data-validator]',this.template).each(function(){
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
	})(V.Classes['v.views.backoffice.custom.EmailSetting'])
},{plugins:["v.ui.grid","v.ui.pagination","v.ui.dialog","v.fn.validator",'v.ui.alert']});
