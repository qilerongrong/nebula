;V.registPlugin("v.views.backoffice.custom.contractTemplateEdit",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.ContractTemplateEdit",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.backoffice.custom.contractTemplateEdit";
			this.contractTemplate = null;
			this.state = 'view';//view || edit;
			this.module = '';
			this.fckeditor = new V.Classes['v.ui.Fckeditor']();
			this.resource = {
				html:'template.html'
			}
		}
	});
	(function(ContractTemplateEdit){
        ContractTemplateEdit.prototype.init = function(options){
			this.options = options;
			this.module = options.module;
			this.container = options.container;
			this.contractTemplate = options.contractTemplate || null;
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					
					that.container.append(that.template);
					if(that.contractTemplate['id'] == null){
						$('form',that.template).removeClass('view').addClass('edit');
						$('.group_view',that.template).hide();
						$('.group_edit',that.template).show();
					} 
					that.initInfo();
					that.initEvent();
				}
			})
		}
		ContractTemplateEdit.prototype.initEvent = function(){
			var that = this;
			/**设置验证**/
			$('*[data-validator]',this.template).keyup(function(e){
				var v = this.value;
				var rules = $(this).attr('data-validator');
				var required = $(this).attr('data-required')||false;
				;
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
            	url:that.module+'/contract-template!qryColumns.action',
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
				var tip = '<i id="tootip" rel="tooltip" data-placement="top" title="将选择的标签粘贴到内容中" class="icon-question-sign"></i> ';
				$('#content',that.template).html('${'+value+'}   '+tip);
				$('#tootip',that.template).tooltip('hide');
			})
			
			//编辑
			$('.group_view .edit',this.template).click(function(){
				$(this).parents('.group_view').hide();
				$('.group_edit',that.template).show();
				$(this).parents('form').removeClass('view').addClass('edit');
				$('#selected',that.template).show();
				that.fckeditor.init({container:$('.contract_con',that.template)});
				$('.cke_skin_kama',that.fckeditor.contrator).show();
				that.fckeditor.setData(that.contractTemplate['content'])
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
				var contractTemplate = that.contractTemplate;
				$('*[data-key]',that.template).each(function(){
					var key = $(this).attr('data-key');
					contractTemplate[key] = $('.edit_input',this).val();
				});
				var content = that.fckeditor.template.val();
				contractTemplate['content'] = content;
				$.ajax({
		            	url:that.module+'/contract-template!save.action',
		               	type:'post',
						data:JSON.stringify({contractTemplate:contractTemplate}),
						contentType:'application/json',
		                success:function(data){
		                     if(data == 'success'){
		                     	 V.alert("保存成功!");
		                     	 that.forward("v.views.backoffice.custom.contractTemplateList",that.options);
		                     }
		                }
		            })
			})
			
			
		}
		
		ContractTemplateEdit.prototype.initInfo = function(){
			var that = this;
			var contractTemplate = this.contractTemplate;
			if(contractTemplate['id'] != null) {
				//修改时赋值
				$('*[data-key]',this.template).each(function(){
					var key = $(this).attr('data-key');
					var value = contractTemplate[key];
					$('.view_text',this).html(value);
					$('.edit_input',this).val(value);
				});
				$('#selected',that.template).hide();
				$('.cke_skin_kama',that.fckeditor.contrator).hide();
			} else {
				that.fckeditor.init({container:$('.contract_con',that.template)});
			}
			 that.initCustom();
		}
		
		ContractTemplateEdit.prototype.initCustom = function(){
			var that = this;
            $.ajax({
            	url:that.module+'/contract-template!initCustom.action',
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
            })
		}
		
	})(V.Classes['v.views.backoffice.custom.ContractTemplateEdit'])
},{plugins:["v.ui.grid","v.ui.pagination","v.ui.dialog","v.fn.validator",'v.ui.alert','v.ui.fckeditor']});
