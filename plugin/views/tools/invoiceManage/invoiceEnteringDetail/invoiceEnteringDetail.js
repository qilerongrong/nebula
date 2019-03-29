/*
 * 发票管理--发票录入详情(运维管理)
 */
;V.registPlugin("v.views.tools.invoiceManage.invoiceEnteringDetail",function(){
    V.Classes.create({
        className:"v.views.tools.invoiceManage.InvoiceEnteringDetail",
        superClass:"v.Plugin",
        init:function(){
            this.ns = "v.views.tools.invoiceManage.invoiceEnteringDetail";
            this.module = '';
            this.resource = {
                html:'template.html'
            }
        }
    });
    (function(InvoiceEnteringList){
        InvoiceEnteringList.prototype.init = function(options){
            this.container = options.container;
            this.module = options.module;
            this.invoice = options.record;
            this.platformNo = options.platformNo;
            this.invoice.platformNo = options.platformNo;
            
            var that = this;
            var url = this.getPath()+"/assets/"+this.resource.html;
            $.ajax({
                url:url,
                dataType:'html',
                success:function(dom){
                    that.template = $(dom);
                    that.container.append(that.template);
                    that.initEvent();
                    that.initInvType();
                    
                    $('.datepicker',this.template).datepicker({dateFormat: "yy-mm-dd"});
                    
                    $('.invpwdArea',that.template).find('div').css('margin-bottom','5px');
                    
                    $('input[name=invpwd]').click(function(){
                        if($(this).val()==1){
                            $('.invpwdArea div',that.template).find('input').attr('data-validator','ciphertext(21)');
                            $('.invpwdArea',this.template).find('input').each(function(){
                                $(this).attr('maxlength','21');
                            })
                        }else{
                            $('.invpwdArea div',that.template).find('input').attr('data-validator','ciphertext(27)');
                            $('.invpwdArea',this.template).find('input').each(function(){
                                $(this).attr('maxlength','27');
                            })
                        }
                    });
                }
            })
        }
        InvoiceEnteringList.prototype.initEvent = function(){
            var that = this;
            
            $('.group_edit .save',this.template).click(function(){
                that.saveInvoice();
            });
            $('.group_edit .cancel',this.template).click(function(){
                var options = {};
                options.module = that.module;
                //that.forward('v.views.finance.invoiceManage.invoiceEntering',options);
                V.MessageBus.publish({eventId:'backCrumb'});
            });
            
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
            
            $('*[data-key=invrate]',that.template).find('select').change(function(){
            	that.invvatCompute();
            });
            $('*[data-key=invcost]',that.template).find('input').blur(function(){
            	$(this).val(parseFloat($(this).val()||0).toFixed(2));
            	that.invvatCompute();
            });
            $('*[data-key=invvat]',that.template).find('input').blur(function(){
            	$(this).val(parseFloat($(this).val()||0).toFixed(2));
            });
            
            $('div[data-key=invtaxsign]',that.template).find('select').change(function(){
            	if($(this).val()==0){
            		$('div[data-key=invtaxno]',that.template).parent().hide();
            	}else{
            		$('div[data-key=invtaxno]',that.template).parent().show();
            	}
            });
            
        }
        //计算税额
        InvoiceEnteringList.prototype.invvatCompute = function(){
        	var invrate = $('*[data-key=invrate]',this.template).find('select').val();
            var invcost = $('*[data-key=invcost]',this.template).find('input').val() || 0;
            $('*[data-key=invvat]',this.template).find('.edit_input').val(((parseFloat(invrate)*1000 * (parseFloat(invcost)*1000))/1000000).toFixed(2));
        }
        //获取发票类型,税率,状态
        InvoiceEnteringList.prototype.initInvType = function(){
            var that = this;
            var invtype = $('div[data-key=invtype]',this.template).find('select').empty();
            var invTypeList = DictInfo.getVar('INV_TYPE',this.platformNo);
            var invTypeDefault = DictInfo.getDefault('INV_TYPE',this.platformNo);
            for(key in invTypeList){
            	var option = $('<option value='+key+'>'+invTypeList[key]+'</option>');
            	if(key==invTypeDefault)
            		option.attr("selected",true);	
            	invtype.append(option);
            }
            
            var invrate = $('div[data-key=invrate]',this.template).find('select').empty();
            var invRateList = DictInfo.getVar('INV_RATE',this.platformNo);
            var invRateDefault = DictInfo.getDefault('INV_RATE',this.platformNo);
            for(key in invRateList){
            	var option = $('<option value='+key+'>'+invRateList[key]+'</option>');
            	if(key==invRateDefault)
            		option.attr("selected",true);	
            	invrate.append(option);
            }
            
            var invstatus = $('div[data-key=invstatus]',this.template).find('select').empty();
            var invStatusList = DictInfo.getVar('INV_STATUS',this.platformNo);
            var invStatusDefault = DictInfo.getDefault('INV_STATUS',this.platformNo);
            for(key in invStatusList){
            	var option = $('<option value='+key+'>'+invStatusList[key]+'</option>');
            	if(key==invStatusDefault)
            		option.attr("selected",true);	
            	invstatus.append(option);
            }
            
            if(that.invoice.id!=null){
                that.initInfo();
            }else{
                $('*[data-key]',that.template).each(function(){
                	var key = $(this).attr('data-key');
                    if(key=="buyerTax"){
                    	var taxno_input = $('<input name="buyerTaxNo" style="width:120px;" value="320102593534197" readonly/>');
                    	var taxname_input = $('<input name="buyerTaxName" style="margin-left:4px;width:190px" value="孩子王儿童用品（中国）有限公司" readonly/>');
                    	$('.edit_input',this).append(taxno_input).append(taxname_input);
                    }else if(key=="sellerTax"){
                    	if(LoginInfo.businessRole.SUPPLIER == LoginInfo.user.businessRole){
                    		var taxno_input = $('<input name="sellerTax" style="width:120px;" value="'+LoginInfo.sellerCompany.taxno+'" readonly/>');
                        	var taxname_input = $('<input name="sellerName" style="margin-left:4px;width:190px" value="'+LoginInfo.sellerCompany.taxname+'" readonly/>');
                        	$('.edit_input',this).append(taxno_input).append(taxname_input);
                    	}else{
                    		var plugin = new V.Classes['v.views.component.AdvanceSellerSelector']();
                        	plugin.init({
                        		container:$('.edit_input',this),
                        		config:{
                        			fields:[
                        				{name:'taxno',value:'',aliasName:'sellerTax',placeholder:'销方纳税人税号'},
                        				{name:'taxname',value:'',aliasName:'sellerName',placeholder:'销方纳税人名称'}
                        			]
                        		}
                        	});
                    	}
                    	
                    	//$('.edit_input',this).append(plugin.template);
                    }else{
                    	$('.edit_input',this).attr('readOnly',false);
                    }
                });
               
            }
            
            that.initRemarkFrame();
        }
        InvoiceEnteringList.prototype.saveInvoice = function(){
            var that = this;
            var invoice = this.invoice;
            var flag = false;
            
            //form校验
            if(that.validate()==false) return;
            
            var invtaxsignValid = $('div[data-key=invtaxsign]',that.template).find('select').val();
            var sellerTax = $('div[data-key=invtaxno]',that.template).find('input').val();
            if(invtaxsignValid==1){
            	var reg = new RegExp('^[0-9][DK][0-9]|[DK][0-9]|[0-9][DK]');
            	if(!reg.test(sellerTax)){
					V.alert('代开纳税人识别号必须含有DK！');
					return;
				}
            }
            
            var invdateValid = $('div[data-key=invdate]',that.template).find('input').val();
            if(new Date(invdateValid).getTime()>new Date().getTime()){
            	V.alert('开票日期不能大于当前日期！');
            	return;
            }
            
            var invCommentType = $('select[name=invCommentType]',that.template).val();
            var invcost = $('div[data-key=invcost]',that.template).find('input').val();
            var invvat = $('div[data-key=invvat]',that.template).find('input').val();
            if(invCommentType==CONSTANT.FINANCE_INV_COMMENT_TYPE.RED){
            	if(parseFloat(invcost)>0){
            		V.alert('当前开票类型为红票，未税金额不能为正数！');
            		return;
            	}
            	if(parseFloat(invvat)>0){
            		V.alert('当前开票类型为红票，税额不能为正数！');
            		return;
            	}
            }
            if(invCommentType==CONSTANT.FINANCE_INV_COMMENT_TYPE.BLUE){
            	if(parseFloat(invcost)<0){
            		V.alert('当前开票类型为蓝票，未税金额不能为负数！');
            		return;
            	}
            	if(parseFloat(invvat)<0){
            		V.alert('当前开票类型为蓝票，税额不能为负数！');
            		return;
            	}
            }
            
            var invpwd = '';
            $('*[data-key]:visible',this.template.find('.invoiceBase')).each(function(){
                var name = $(this).attr('data-key');
                if($(this).attr('data-type') == "radio"){
                    invoice[name] = $('input[name='+name+']:checked',this).val();
                }else if(name=='invpwd1'||name=='invpwd2'||name=='invpwd3'||name=='invpwd4'){
                    invpwd = invpwd + $('.edit_input',this).val();
                }else if(name == "buyerTax"){
                	invoice["buyerTax"] = $('[name=buyerTaxNo]',this).val();
                	invoice["buyerName"] = $('[name=buyerTaxName]',this).val();
                }else if(name == "sellerTax"){
                	invoice["sellerTax"] = $('[name=sellerTax]',this).val();
                	invoice["sellerName"] = $('[name=sellerName]',this).val();
                }else{
                    invoice[name] = $('.edit_input',this).val();
                }
            });
            invoice['invpwd'] = invpwd;
            invoice['invsum'] = parseFloat(invoice['invcost']) + parseFloat(invoice['invvat']);
            
            var remarkTmp = [];
            var remarkValid = true;
            $('*[data-key]:visible',this.template.find('.invoiceRemark')).each(function(){  //备注信息合并
                var key = $(this).attr('data-key');
                var ele = $(this);
                var prev = ele.prev();
                var input = ele.find('.edit_input');
                var name = prev.text();
                var value = input.val();
                
                if(key!='accountCode' && value!='' && value!=null){
                	var tmpValue = value.replace(/，/g,',');
                	var reg = new RegExp(',');
    				if(reg.test(tmpValue)){
    					V.alert(name+'值不能包含逗号！');
    					remarkValid = false;
    					return false;
    				}
                }
                
                if(value!=null && value!='')
                	remarkTmp.push(name+value);
            });
            if(remarkValid==false) return;
            
            remarkTmp = remarkTmp.join(';');
            invoice['invcomment'] = remarkTmp;
            
            var url = this.module+'/saveInvoice.action';
            if(that.invoice.id!=null){
                url = this.module+'/updateInvoice.action';    
            }
            V.confirm('是否保存发票信息？',function(){
                $.ajax({
                    url:url,
                    type:'post',
                    data:JSON.stringify({invoice:invoice}),
                    contentType:'application/json',
                    success:function(data){
                        if(data=='success'){
                            //V.alert('发票保存成功!');
                            //$('.group_edit .cancel',this.template).click();
                        	V.MessageBus.publish({eventId:'backCrumb'});
                        }else if(data.msg=='error') {
                        	V.alert(data.info);
                        } else {
                            V.alert(data);
                        }
                    }
                })
            });    
        }
        InvoiceEnteringList.prototype.initInfo = function(){
        	var that = this;
            var invoice = this.invoice;
            
            $('*[data-key]',this.template).each(function(){
                var key = $(this).attr('data-key');
                var value = invoice[key];
                var type = $(this).attr('data-type');
                
                if(type=='select'){
                    var selObj = $('select',this);
                    selObj.val(value);
                }else if(type == "radio"){
                    $('input[value='+value+']',this).attr('checked',true);
                }else if(key == "buyerTax"){
                	var taxno_input = $('<input name="buyerTaxNo" style="width:120px;" value="'+invoice.buyerTax+'" readonly/>');
                	var taxname_input = $('<input name="buyerTaxName" style="margin-left:4px;width:190px" value="'+invoice.buyerName+'" readonly/>');
                	$('.edit_input',this).append(taxno_input).append(taxname_input);
                }else if(key == "sellerTax"){
//                	var plugin = new V.Classes['v.views.component.AdvanceSellerSelector']();
//                	plugin.init({
//                		container:$('.edit_input',this),
//                		config:{
//                			fields:[
//                				{name:'taxno',value:invoice.sellerTax,aliasName:'sellerTax',placeholder:'销方纳税人税号'},
//                				{name:'taxname',value:invoice.sellerName,aliasName:'sellerName',placeholder:'销方纳税人名称'}
//                			]
//                		}
//                	});
                	var taxno_input = $('<input name="sellerTax" style="width:120px;" value="'+invoice.sellerTax+'" readonly/>');
                	var taxname_input = $('<input name="sellerName" style="margin-left:4px;width:190px" value="'+invoice.sellerName+'" readonly/>');
                	$('.edit_input',this).append(taxno_input).append(taxname_input);
                }else{
                    $('.edit_input',this).val(value);
                }
            });
            //密文信息分拆显示
            var invpwd = invoice['invpwd']||'';
            var invpwdLength = invpwd.length;
            var inputSize = invpwdLength/4;
            var invpwd1 = invpwd.substring(0,inputSize);
            var invpwd2 = invpwd.substring(inputSize,inputSize*2);
            var invpwd3 = invpwd.substring(inputSize*2,inputSize*3);
            var invpwd4 = invpwd.substring(inputSize*3,invpwdLength);
            $('div[data-key=invpwd1]',this.template).find('.edit_input').val(invpwd1);
            $('div[data-key=invpwd2]',this.template).find('.edit_input').val(invpwd2);
            $('div[data-key=invpwd3]',this.template).find('.edit_input').val(invpwd3);
            $('div[data-key=invpwd4]',this.template).find('.edit_input').val(invpwd4);
            
            if(invpwdLength==84){
                $('input[name=invpwd]:eq(0)',this.template).attr('checked',true).click();
                $('.invpwdArea div',that.template).find('input').attr('data-validator','ciphertext(21)');
                $('.invpwdArea',this.template).find('input').each(function(){
                    $(this).attr('maxlength','21');
                })
            }else{
                $('input[name=invpwd]:eq(1)',this.template).attr('checked',true).click();
                $('.invpwdArea div',that.template).find('input').attr('data-validator','ciphertext(27)');
                $('.invpwdArea',this.template).find('input').each(function(){
                    $(this).attr('maxlength','27');
                })
            }
            
            $('div[data-key=invtaxsign]',this.template).find('select').change();
            
            $('.remark .legend',this.template).find('.help').tooltip({
                title:'<p style="line-height:20px;width:200px;text-align:left;margin:0;">多个单据号以逗号分隔，其它备注项不能包含逗号</p>'
                   ,placement:'right'
                   ,html:'true'
                  });
        }
        //备注信息初始化
        InvoiceEnteringList.prototype.initRemarkInfo = function(invoice, redConfig){
        	var that = this;
        	var invoiceRemark = "";
        	if(invoice==null) return;
        	V.ajax({
                url:this.module+'/getInvoiceRemarkInfo.action',
                data:({invoice:invoice}),
                success:function(data){
                	if(data.msg=='success'){
                		var invoiceRemark = data.result;
                		var context = $('.invoiceRemark',that.template);
                		for(ele in invoiceRemark){
                			$('*[data-key='+ele+']', context).find('.edit_input').val(invoiceRemark[ele]);
                		}
                	}
                	else if(data.msg=='error'){
                		var msgInfo = $('*[data-key=msgInfo]',that.template).find('div').show();
                		var origin = that.invoice.invcomment;
                		if(origin!=null && origin!=''){
                			var originInfo = $('<div>错误备注：'+origin+'</div>'+'');
                			msgInfo.append(originInfo);
                		}
                		var errorInfo = $('<div>错误信息：'+data.info+'</div>'+'');
            			msgInfo.append(errorInfo);
                	}
                }
            })
        }
        //备注结构初始化
        InvoiceEnteringList.prototype.initRemarkFrame = function(){
        	var that = this;
        	var financeRule = LoginInfo.financeRule;
        	var invoiceRemarkRuleMap = financeRule.invoiceRemarkRuleMap;
        	var invoiceRemarkRule = invoiceRemarkRuleMap.invoiceRemarkRule;
        	var redRule = invoiceRemarkRuleMap.redRule;
        	
        	var container = $('.invoiceRemarkRuleContainer',this.template);
        	$.each(invoiceRemarkRule, function(){
        		var checked = this.checked;
        		var name = this.name;
        		var key = this.key;
        		
        		var ele = $('<div class="row-fluid">\
        						<div class="control-group span6">\
        							<label class="control-label" for="input01">'+name+'：</label>\
        							<div class="controls" data-key="'+key+'">\
        								<input type="text" class="input-xlarge edit_input" id="input001" data-validator="" data-required="">\
				    				</div>\
        						</div>\
        					</div>');
			 
        		if(checked){
        			container.append(ele);
        		}
        	})
        	
        	var redContainer = $('.redInvoiceRemarkRuleContainer',this.template);
        	var redConfig = false;
        	$.each(redRule, function(){
        		var checked = this.issupport;
        		redConfig = checked;
        		var name = this.name;
        		var key = this.key;
        		
        		var ele = $('<div class="row-fluid">\
        						<div class="control-group span6">\
        							<label class="control-label" for="input01">'+name+'：</label>\
        							<div class="controls" data-key="'+key+'">\
        								<input type="text" class="input-xlarge edit_input" id="input001" data-validator="" data-required="">\
				    				</div>\
        						</div>\
        					</div>');
        		redContainer.append(ele);
        	})
        	var msgInfo = $('<div class="control-group">\
						      	<div class="controls" data-key="msgInfo">\
						        	<div style="resize:none;display:none;border:0 none;background:#fff none;box-shadow:none;cursor:default;color:red"></div>\
						        </div>\
						    </div>');
        	msgInfo.find('div').attr('readOnly',true);
        	$('.invoiceMsgInfo',this.template).append(msgInfo);
        	
        	var invCommentType = $('select[name=invCommentType]',that.template);
        	invCommentType.change(function(){
        		var selValue = $(this).val();
        		var redDiv = $('.redInvoiceRemarkRuleContainer',that.template);
        		var blueDiv = $('.invoiceRemarkRuleContainer',that.template);
        		var invcost = $('*[data-key=invcost]',that.template).find('.edit_input');
        		var invcostValue = Math.abs(invcost.val()*1);
        		if(selValue==1){
        			redDiv.hide();
        			blueDiv.show();
        			invcost.val(invcostValue);
        		}
        		else{
        			if(redConfig){
        				redDiv.show();
        				blueDiv.hide();
        			}
        			else{
        				redDiv.hide();
        				blueDiv.show();
        			}
        			invcost.val(-1*invcostValue);
        		}
        	});
        	invCommentType.change();
                	
        	if(that.invoice.id!=null)
        		that.initRemarkInfo(that.invoice||'', redConfig);
        }
        //自己定义的form验证
        InvoiceEnteringList.prototype.validate = function(){
            var that = this;
            var isValid = true;
            
            var invpwd1 = $('div[data-key=invpwd1]',this.template).find('.edit_input').val();
            var invpwd2 = $('div[data-key=invpwd2]',this.template).find('.edit_input').val();
            var invpwd3 = $('div[data-key=invpwd3]',this.template).find('.edit_input').val();
            var invpwd4 = $('div[data-key=invpwd4]',this.template).find('.edit_input').val();
            
            var invpwdValue = invpwd1+invpwd2+invpwd3+invpwd4;
            if(invpwdValue!='' && (invpwdValue.length!=84 && invpwdValue.length!=108)){
            	V.alert('密文信息输入错误！');
            	return false;
            }
            var sellerTax = $('input[name=sellerTax]',this.template); //校验
            if(sellerTax.val()==''){
            	$('*[data-key=sellerTax]',this.template).find('.error_msg').text("该值不可为空").show();
            	return false;
            }else{
            	$('*[data-key=sellerTax]',this.template).find('.error_msg').empty().hide();
            }
            
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
                        }
                        else{
                            $(this).parent().find('.error_msg').empty().hide();
                        }
                    }else{
                        $(this).parent().find('.error_msg').empty().hide();
                    }
                }
            });
            return isValid;
        }
        InvoiceEnteringList.prototype.updateCrumb = function(){
            V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'税票处理操作'}});
        }
        InvoiceEnteringList.prototype.addCrumb = function(){
            V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'税票处理操作'}});
        }
    })(V.Classes['v.views.tools.invoiceManage.InvoiceEnteringDetail'])
},{plugins:['v.fn.validator','v.views.component.advanceSellerSelector']});
