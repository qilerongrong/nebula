/**
 * 消息设置-消息规则
 */
;V.registPlugin("v.views.backoffice.custom.messageRuleEdit",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.MessageRuleEdit",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.backoffice.custom.messageRuleEdit";
			this.messageRule = '';
			this.messageTemplates = []; //模板
			this.state = 'edit';//view || edit;
			this.module = '';
			this.resource = {
				html:'template.html'
			}
		}
	});
	(function(MessageRuleEdit){
        MessageRuleEdit.prototype.init = function(options){
			this.options = options;
			this.module = options.module;
			this.container = options.container;
			this.messageRule = options.messageRule || '';
			this.platformNo = options.platformNo || '';
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					if(that.messageRule['id'] == null){
						$('form',that.template).removeClass('view').addClass('edit');
						$('.group_view',that.template).hide();
						$('.group_edit',that.template).show();
					} 
					that.initEvent();
					that.initTemplate();
					if(that.messageRule){
						$('.actionName',that.template).val(that.messageRule.actionName);
						$('.actionName',that.template).change();
						//$('.actionName option[value='+that.messageRule.actionName+']',that.template).attr('selected',true);
					}
				}
			})
		}
		MessageRuleEdit.prototype.initEvent = function(){
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
			//选择模板，初始化数据事件
			$('#templateId',this.template).change(function(){
				that.initTemplateData();
				that.initControlStatus();
			});
			//选择类型级联控制规则点
			$('#controlStatus',this.template).change(function(){
                var type = $(':selected',this).attr('dataType');
				that.initRulePoint('change',type);
			})
			//编辑
			$('.group_view .edit',this.template).click(function(){
				$(this).parents('.group_view').hide();
				$('.group_edit',that.template).show();
				$(this).parents('form').removeClass('view').addClass('edit');
				$('#selected',that.template).show();
			});
			//返回
			$('.group_view .back',this.template).click(function(){
				 that.forward("v.views.backoffice.custom.messageRuleList",that.options);
			});
			//取消操作也返回列表页
			$('.group_edit .cancel',this.template).click(function(){
                that.forward("v.views.backoffice.custom.messageRuleList",that.options);
			});
			//保存
			$('.save',this.template).click(function(){
				if(!that.validate()) return;
				var messageRule = that.messageRule;
				$('*[data-key]',that.template).each(function(){
					var key = $(this).attr('data-key');
					if (key == 'isNotice' || key == 'isEmail' || key == 'isMessage'){
						if($('.edit_input',this).attr("checked")){
							messageRule[key] = true;
						} else {
							messageRule[key] = false;
						}
					} else if(key == 'sendType'){
						var tmp = [];
						$('input:checked',this).each(function(){
							tmp.push($(this).val());
						})
						messageRule[key] =tmp.join(',');
					}else if(key == "rulePointMap"){
						var operator = $('.operator',that.template).val();
						var field =  $('#controlStatus',that.template).val();
						var value1 = $('[name=value1]',that.template).val();
						var value2 = $('[name=value2]',that.template).val();
						if(operator !="betweenAnd" && operator!= "fromTo"){
							value2 = "";
						}
						messageRule["rulePointMap"] = {
							msgRule:[
							    {fieldName:field, operator:operator, value1: value1, value2: value2}
							]
						}
					}
					else {
						messageRule[key] = $('.edit_input',this).val();
					}
				});
				var controlName = $('*[data-key=controlStatus]',that.template).find('option:selected').text();
				var ruleDes = '';
				var type = $('#controlStatus option:selected',that.template).attr('dataType');
				var value1 = $('.vals [name=value1]',that.template).val() ;
				var value2 =$('.vals [name=value2]',that.template).val() ;
				if(type == 4){
					value1 = $('.vals [name=value1] option:selected',that.template).text();
					value2 = $('.vals [name=value2] option:selected',that.template).text()
				};
				var rulePoint = that.messageRule.rulePointMap;
				if(rulePoint){
					if(rulePoint.msgRule[0]['operator'] == "fromTo" || rulePoint.msgRule[0]['operator'] == "betweenAnd"){
						ruleDes = "从" + value1 + "到"+value2; 
					}else{
						ruleDes = $('.operator option:selected',that.template).text() +value1;
					}
				}
				messageRule['controlName'] = controlName;
				messageRule['ruleDes'] = ruleDes;
				$.ajax({
	            	url:that.module+'/message-rule!save.action',
	               	type:'post',
					data:JSON.stringify({messageRule:messageRule,platformNo:that.platformNo}),
					contentType:'application/json',
	                success:function(data){
	                     if(data.msg == 'success'){
	                     	 V.alert("保存成功!");
	                     	 that.forward("v.views.backoffice.custom.messageRuleList",that.options);
	                     }else if(data.msg=='isExsitError'){
		                   	 V.alert("规则已经存在,不能重复设定!");
		                 }else{
		                     V.alert("系统存储出现异常！");
		                 }
	                }
	            })
			})
			//全局消息检查是否有模板新增记录
			V.MessageBus.subscribe('v.views.backoffice.custom.emailTemplate.changed',function(){
				that.initTemplate();
			});
            //operater change
            $('.operator',this.template).change(function(){
                if(this.value == "betweenAnd"||this.value == "fromTo"){
                    $('.vals [name=value2]',that.template).show();
                }else{
                    $('.vals [name=value2]',that.template).hide();
                }
            });
			//操作 change
			$('.actionName',this.template).change(function(){
				var controlStatus = $('[data-key=controlStatus]',that.template).parent();
				var rulePoint = $('[data-key=rulePointMap]',that.template).parent();
				if(this.value == 'delete'){
					controlStatus.hide();
					rulePoint.hide();
				}else{
					controlStatus.show();
					rulePoint.show();
				}
			})
		}
		//规则初始化
//		MessageRuleEdit.prototype.initInfo = function(){
//			var that = this;
//			var messageRule = this.messageRule;
//			if(messageRule['id'] != null) {
//				//修改时赋值
//				$('.messageRule *[data-key]',this.template).each(function(){
//					var key = $(this).attr('data-key');
//					var type = $(this).attr('data-type');
//					var value = messageRule[key]||'';
//					if(type=='checkbox'){
//						$('.view_text',this).text(value==true?'是':'否');
//						$('.edit_input',this).attr('checked',value==true?true:false);
//					}else if(key=='sendType'){
//						var tmp = value.split(',');
//						$('input[type=checkbox]',this).each(function(){
//							if($.inArray($(this).val(),tmp)==-1){
//								$(this).attr('checked',false);
//							}else{
//								$(this).attr('checked',true);
//							}
//						});
//					}else if(type=='select'){
//						$('.edit_input',this).val(value);
//						$('.view_text',this).text($('.edit_input',this).find('option:selected').text());
//					}else{
//						$('.view_text',this).text(value);
//						$('.edit_input',this).val(value);
//					}
//                    if(key == 'controlStatus'){
//                        if(type == 'select'){
//                            var option = '<option value="fromTo">from...to...</option>';
//							var option2 = '<option value="equal">等于</option>';
//                            $('.operator',that.template).empty().append(option).append(option2);
//                        }else{
//                            $('.operator',that.template).empty()
//                                .append('<option value="betweenAnd">between...and...</option>')
//                                .append('<option value="equal">等于</option>')
//                                .append('<option value="greaterThan">大于</option>')
//                                .append('<option value="greaterThanOrEqual">大于或等于</option>')
//                                .append('<option value="lessThan">小于</option>')
//                                .append('<option value="lessThanOrEqual">小于或等于</option>');
//                        }
//                    }
//				});
//			}
//		}
		//初始化规则点
		MessageRuleEdit.prototype.initRulePoint = function(control,controlStatusType){
			var that = this;
			var rulemap = this.messageRule.rulePointMap;
			$('.operator',this.template).val();
            if(controlStatusType == 4){
                var option = '<option value="fromTo">from...to...</option>';
				var option2 = '<option value="equal">等于</option>';
                $('.operator',that.template).empty().append(option).append(option2);
                var controlStatus = $('*[data-key=controlStatus],that.template').find('.edit_input');
    			var dictTypeCode = controlStatus.find('option:selected').attr('dictTypeCode');
    			if(dictTypeCode==null || dictTypeCode=='') return;
    			$.ajax({
                	url:that.module+'/message-rule!qryControlPoint.action',
                   	type:'POST',
    				data:JSON.stringify({value:dictTypeCode,platformNo:that.platformNo}),
    				contentType:'application/json',
                    success:function(data){
                    	var customTypes = data||[];
                    	var rulePoint = $('#rulePoint',that.template).empty();
                        var sel1 = $('<select name="value1" class="input-medium"></select>');
                        var sel2 = $('<select name="value2" class="input-medium"></select>');
    					$.each(customTypes,function(index){
    						var opt = '<option value='+this.dictcode+'>'+this.dictname+'</option>';
                            sel1.append(opt);
                            sel2.append(opt);
    					});
						if(rulemap && rulemap.msgRule){
							 if($('#controlStatus',that.template).val() == rulemap.msgRule[0].fieldName){
							  	   sel1.val(rulemap.msgRule[0].value1);
                                   sel2.val(rulemap.msgRule[0].value2);
							  }
							$('.operator',that.template).val(rulemap.msgRule[0].operator);
						}
                        $('.vals',that.template).empty().append(sel1).append(sel2);
						$('.operator',that.template).change();
                    }
           		})
            }else{
                 $('.operator',that.template).empty()
                                .append('<option value="betweenAnd">between...and...</option>')
                                .append('<option value="equal">等于</option>')
                                .append('<option value="greaterThan">大于</option>')
                                .append('<option value="greaterThanOrEqual">大于或等于</option>')
                                .append('<option value="lessThan">小于</option>')
                                .append('<option value="lessThanOrEqual">小于或等于</option>') ;
				var val1 = $('<input name="value1" class="input-small" style="margin-right:20px;"/>');
				var val2 = $('<input name="value2" class="input-small" />');
				 if(rulemap && rulemap.msgRule){
				 	  $('.operator',that.template).val(rulemap.msgRule[0].operator);
					  if($('#controlStatus',that.template).val() == rulemap.msgRule[0].fieldName){
					  	   val1.val(rulemap.msgRule[0].value1);
					       val2.val(rulemap.msgRule[0].value2);
					  }
				 }
                 $('.vals',that.template).empty().append(val1).append(val2);
                 $('.operator',that.template).change();
		    }
		}
		//初始化可控状态
		MessageRuleEdit.prototype.initControlStatus = function(){
           var that = this;
           var entityTypeValue = $('*[data-key=entityType],that.template').find('.edit_input').val();
			$.ajax({
            	url:that.module+'/message-rule!qryColumns.action',
               	type:'POST',
				data:JSON.stringify({value:entityTypeValue,platformNo:that.platformNo}),
				contentType:'application/json',
                success:function(data){
                	var customTypes = data||[];
                	var controlStatus = $('#controlStatus',that.template).empty();
					$.each(customTypes,function(index){
                        if(this.isBlock){
                            return true;
                        }
                        var opt = $('<option dataType='+this.dataType+'  value='+this.fieldName+'>'+this.fieldLabel+'</option>');
						if(this.dataType==4){
							opt.attr('dictTypeCode',this.dictTypeCode);
						}
                        controlStatus.append(opt);
					})
					controlStatus.val(that.messageRule.controlStatus);
					$('#controlStatus .view_text').text($(':selected',controlStatus).text());
                    var type = $('#controlStatus option[value='+that.messageRule.controlStatus+']',that.template).attr('dataType');
					that.initRulePoint('init',type);
	            }
           	})
		}
		//初始化模板数组数据
		MessageRuleEdit.prototype.initTemplate = function(){
           	var that = this;
			$.ajax({
				url:that.module+'/email-template!queryEmailTemplateByPlatformNo.action',
				type:'POST',
				data:JSON.stringify({platformNo:that.platformNo}),
				contentType:'application/json',
				success:function(data){
					that.messageTemplates = data;
					var templateSel = $('#templateId',that.template).empty();
					for(var i=0; i<data.length; i++){
						var opt = $('<option value='+ data[i].id +'>'+data[i].name+'</option>');
						templateSel.append(opt);
					}
					$('#rulePoint',that.template).empty();
					templateSel.val(that.messageRule.templateId);
					that.initTemplateData();
					
					that.initControlStatus();
				}
			})
		}
		//初始化模块，单据数据
		MessageRuleEdit.prototype.initTemplateData = function(){
			var that = this;
			var templateSel = $('#templateId',that.template);
			var templateId = templateSel.val();
			var messageTemplates = that.messageTemplates;
			$('#rulePoint',that.template).empty();
			$.each(messageTemplates,function(){
				var templateThis = this;
				if (templateId == this.id) {
					$('*[data-key]', that.template).each(function(){
						var key = $(this).attr('data-key');
						var type = $(this).attr('data-type');
						var value = templateThis[key] || that.messageRule[key]||'';
						if (type == 'checkbox') {
							$('.view_text', this).text(value == true ? '是' : '否');
							$('.edit_input', this).attr('checked', value == true ? true : false);
						}
						else if (type == 'select') {
							$('.edit_input select', this).val(value);
							$('.view_text', this).text($('.edit_input', this).find('option:selected').text());
						}
						else {
							$('.view_text', this).text(value);
							$('.edit_input', this).val(value);
						}
					    if (key == 'sendType') {
							var tmp = value.split(',');
							$('input[type=checkbox]', this).each(function(){
								if ($.inArray($(this).val(), tmp) == -1) {
									$(this).attr('checked', false);
								}
								else {
									$(this).attr('checked', true);
								}
							});
						}
					});
					return false;
				}
			})
		}
		//自己定义的form验证
		MessageRuleEdit.prototype.validate = function(){
			var isValid = true;
			$('*[data-validator]:visible',this.template).each(function(){
				var required = $(this).attr('data-required')||false;
				var rules = $(this).attr('data-validator')||'';
				var v = $(this).val()||'';
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
	})(V.Classes['v.views.backoffice.custom.MessageRuleEdit'])
},{plugins:["v.ui.grid","v.ui.pagination","v.ui.dialog",'v.ui.alert','v.ui.fckeditor']});
