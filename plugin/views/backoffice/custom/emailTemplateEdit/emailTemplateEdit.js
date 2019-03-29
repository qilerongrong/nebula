;V.registPlugin("v.views.backoffice.custom.emailTemplateEdit",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.EmailTemplateEdit",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.backoffice.custom.emailTemplateEdit";
			this.emailTemplate = null;
			this.state = 'view';//view || edit;
			this.module = '';
			this.fckeditor = new V.Classes['v.ui.Fckeditor']();
            this.options = {
            }
			this.resource = {
				html:'template.html'
			}
		}
	});
	(function(EmailTemplateEdit){
        EmailTemplateEdit.prototype.init = function(options){
			this.options = options;
			this.module = options.module;
			this.container = options.container;
			this.emailTemplate = options.emailTemplate || null;
			this.platformNo = options.platformNo;
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					if(that.emailTemplate['id'] == null){
						$('form',that.template).removeClass('view').addClass('edit');
						$('.group_view',that.template).hide();
						$('.group_edit',that.template).show();
					}
					that.initInfo();
					that.initEvent();
				}
			})
		}
		EmailTemplateEdit.prototype.initEvent = function(){
			var that = this;
			/**设置验证**/
			$('*[data-validator]',this.template).keyup(function(e){
				var v = this.value;
				var rules = $(this).attr('data-validator');
				var required = $(this).attr('data-required')||false;
				if(required&&v==""){
					$(this).next('.error_msg').text("该值不可为空").show();
					return false;
				}
				var msg = Validator.validate(rules,v);
				if(msg){
					$(this).next('.error_msg').text(msg).show();
				}else{
					$(this).next('.error_msg').empty().hide();
				}
			})
			
			//选择类型
			$('#customType',this.template).change(function(){
				var value = $('#customType',that.template).val();
				if(value == '') {
					return;
				}
				$.ajax({
            	url:that.module+'/email-template!qryColumns.action',
               	type:'POST',
				data:JSON.stringify({value:value}),
				contentType:'application/json',
                success:function(data){
                	var customTypes = data||[];
                	//去除option
                	$('#custom',that.template).html('');
                	var opt1 = $('<option>请选择</option>');
                	opt1.attr('value','');
                	$('#custom',that.template).append(opt1);
					$.each(customTypes,function(index){
						var opt = $('<option>'+this.fieldLabel+'</option>');
						opt.attr('value',this.fieldName);
						$('#custom',that.template).append(opt);
					})
                   }
           		})
			})
			//选择字段
			$('#custom',this.template).change(function(){
				var value = $('#custom',that.template).val();
				if(value == '') {
					return;
				}
				var tip = '<i id="tootip" rel="tooltip" data-placement="top" title="将选择的标签粘贴到内容中" class="icon-question-sign"></i>';
				$('#content',that.template).html('${'+value+'}   '+tip);
				$('#copy',that.template).show();
				$('#tootip',that.template).tooltip('hide');
			})
			
			//复制
			$('#copy',this.template).click(function(){
				var txt = $('#content',that.template).text();
				 if (window.clipboardData) {
				        window.clipboardData.clearData();
				        window.clipboardData.setData("Text", txt);
				        alert("已经成功复制到剪帖板上！");
				    } else if (navigator.userAgent.indexOf("Opera") != -1) {
				        window.location = txt;
				    } else if (window.netscape) {
				        try {
				            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
				        } catch (e) {
				            alert("被浏览器拒绝！\n请在浏览器地址栏输入'about:config'并回车\n然后将'signed.applets.codebase_principal_support'设置为'true'");
				        }
				        var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);
				        if (!clip) return;
				        var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
				        if (!trans) return;
				        trans.addDataFlavor('text/unicode');
				        var str = new Object();
				        var len = new Object();
				        var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
				        var copytext = txt;
				        str.data = copytext;
				        trans.setTransferData("text/unicode", str, copytext.length * 2);
				        var clipid = Components.interfaces.nsIClipboard;
				        if (!clip) return false;
				        clip.setData(trans, null, clipid.kGlobalClipboard);
				        alert("已经成功复制到剪帖板上！");
				    }
			})
			
			//编辑
			$('.group_view .edit',this.template).click(function(){
				$(this).parents('.group_view').hide();
				$('.group_edit',that.template).show();
				$(this).parents('form').removeClass('view').addClass('edit');
				$('#selected',that.template).show();
				that.fckeditor.init({container:$('.contract_con',that.template)});
				that.fckeditor.setData(that.emailTemplate['content']);
				$('.cke_skin_kama',that.fckeditor.contrator).show();
			});
			//返回
			$('.group_view .back',this.template).click(function(){
				 that.forward("v.views.backoffice.custom.emailTemplateList",that.options);
			});
			//取消
			$('.group_edit .cancel',this.template).click(function(){
				$(this).parents('.group_edit').hide();
				$('.group_view',that.template).show();
				$(this).parents('form').removeClass('edit').addClass('view');
				$('#selected',that.template).hide();
				$('.cke_skin_kama',that.fckeditor.contrator).hide();
			});
			//保存
			$('.save',this.template).click(function(){
				if(!that.validate()) return;
				var emailTemplate = that.emailTemplate;
				$('*[data-key]',that.template).each(function(){
					var key = $(this).attr('data-key');
					emailTemplate[key] = $('.edit_input',this).val();
				});
				var content = that.fckeditor.getData();
				if(content == '') {
					V.alert("内容不可为空！");
					return;
				}
				emailTemplate['content'] = content;
				$.ajax({
		            	url:that.module+'/email-template!save.action',
		               	type:'post',
						data:JSON.stringify({emailTemplate:emailTemplate,platformNo:that.platformNo}),
						contentType:'application/json',
		                success:function(data){
		                     if(data == 'success'){
		                     	 V.alert("保存成功!");
		                     	 V.MessageBus.publish({eventId:'v.views.backoffice.custom.emailTemplate.changed',data:''});
		                     	 that.forward("v.views.backoffice.custom.emailTemplateList",that.options);
		                     }else{
		                    	 V.alert("保存失败!");
		                     }
		                }
		            })
			})
		}
		
		EmailTemplateEdit.prototype.initInfo = function(){
			var that = this;
			var emailTemplate = this.emailTemplate;
			if(emailTemplate['id'] != null) {
				//修改时赋值
				$('*[data-key]',this.template).each(function(){
					var key = $(this).attr('data-key');
					var value = emailTemplate[key];
					$('.view_text',this).html(value);
					$('.edit_input',this).val(value);
				});
				$('#selected',that.template).hide();
				$('#fckeditid',that.template).hide();
			} else {
				this.fckeditor.init({container:$('.contract_con',that.template)});
			}
			 that.initCustom();
		}
		
		EmailTemplateEdit.prototype.initCustom = function(){
			/*var that = this;
            $.ajax({
            	url:that.module+'/email-template!initCustom.action',
               	type:'POST',
				data:JSON.stringify({id:null}),
				contentType:'application/json',
                success:function(data){
                	var customTypes = data||[];
					$.each(customTypes,function(index){
						var opt = $('<option>'+this.name+'</option>');
						opt.attr('value',this.value);
						$('#customType',that.template).append(opt);
					})
                }
            })*/
           var that = this;
           var emailTemplate = that.emailTemplate;
				$.ajax({
            	url:that.module+'/email-template!qryColumns.action',
               	type:'POST',
				data:JSON.stringify({value:emailTemplate.entityType,platformNo:this.platformNo}),
				contentType:'application/json',
                success:function(data){
                	var customTypes = data||[];
                	//去除option
                	$('#custom',that.template).html('');
                	var opt1 = $('<option>请选择</option>');
                	opt1.attr('value','');
                	$('#custom',that.template).append(opt1);
					$.each(customTypes,function(index){
						var opt = $('<option>'+this.fieldLabel+'</option>');
						opt.attr('value',this.fieldName);
						$('#custom',that.template).append(opt);
					})
                  }
           		})
		}
		
		//整单验证
		EmailTemplateEdit.prototype.validate = function(){
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
	})(V.Classes['v.views.backoffice.custom.EmailTemplateEdit'])
},{plugins:["v.ui.grid","v.ui.pagination","v.ui.dialog","v.fn.validator",'v.ui.alert','v.ui.fckeditor']});
