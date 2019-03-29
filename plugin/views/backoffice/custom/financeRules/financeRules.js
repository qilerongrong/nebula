;V.registPlugin("v.views.backoffice.custom.financeRules",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.FinanceRules",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.views.backoffice.custom.financeRules';
			this.module='';
			this.financeRule = {};
			this.platformNo = '';
			this.resource = {
				html:'template.html'
			}
		}
	});
	(function(FinanceRules){
		FinanceRules.prototype.init = function(options){
			this.container = options.container;
			this.module = options.module;
			this.platformNo = options.platformNo||'';
			this.party = options.party||'';
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					that.initFinanceRulesInfo();
					that.initEvent();
				}
		     });
			//this.addCrumb();
		}
		FinanceRules.prototype.initEvent = function(){
			var that = this;
			if(this.party){
				$('.partyName',this.template).html('企业名称：'+this.party.partyName)
			}
			
			//时间控件
			$('.datepicker',this.template).datepicker({dateFormat: "yy-mm-dd",showMonthAfterYear:true});
			$('.flowList',this.template).change(function(){
				var val = this.value;
				if(val == 1){
					$('.flow',that.template).hide();
					$('.flow1',that.template).show();
				}else if(val == 2){
					$('.flow',that.template).hide();
					$('.flow2',that.template).show();
				}else if(val == 3){
					$('.flow',that.template).hide();
					$('.flow3',that.template).show();
				}else if(val == 4){
					$('.flow',that.template).hide();
					$('.flow4',that.template).show();
				}
			});
			$('.flow .node',this.template).click(function(){
				var flow = $(this).parents('.flow');
				$('.btn-primary',flow).removeClass('btn-primary');
				$(this).addClass('btn-primary');
				var index = $('.node',flow).index(this);
				$('.params .args',flow).hide();
				$('.params .args:eq('+index+')',flow).show();
			})
			/**设置验证**/
			$('*[data-validator]',this.template).keyup(function(e){
				/*
				var v = this.value;
				var rules = $(this).attr('data-validator');
				var required = $(this).attr('data-required')||false;
				;
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
				*/
				var v = $(this).val();
				var required = $(this).attr('data-required')||false;
                if(required&&v==""){
                        $(this).parent().find('.error_msg').text($(this).attr('data-value')+"值不可为空").show();
                        isValid = false;
                        return false;
                }else{
                    $(this).parent().find('.error_msg').empty().hide();
                }
                
				var e = e||event;
				var keycode = e.which||e.keyCode;
				//this.value=this.value.replace(/\D/g,'');
				this.value=/[0-9-\.]*/.exec(this.value);
			})
			
			//移动
			$('ol .icon-arrow-left',this.template[0]).live('click',function(){
				var item = $(this).parents('li');
				var ol = item.parent('ol');
				var item_index = item.index();
				var sortno1 = item.data('data-info').sortno;
				var prev = item.prev();
				var prev_index = prev.index();
				if(prev_index == 0){
					$('.icon-arrow-left',prev).parent().css('visibility','visible');
					$('.icon-arrow-left',item).parent().css('visibility','hidden');
				}
				if(item_index == $('li',ol).length-1){
					$('.icon-arrow-right',item).parent().css('visibility','visible');
					$('.icon-arrow-right',prev).parent().css('visibility','hidden');
				}
				var sortno2 = prev.data('data-info').sortno;
				item.data('data-info').sortno = sortno2;
				prev.data('data-info').sortno = sortno1;
				item.insertBefore(prev);
			});
			$('ol .icon-arrow-right',this.template[0]).live('click',function(){
				var item = $(this).parents('li');
				var ol = item.parent('ol');
				var item_index =  item.index();
				var sortno1 = item.data('data-info').sortno;
				var next = item.next();
				var next_index = next.index();
				if(next_index == $('li',ol).length-1){
					$('.icon-arrow-right',next).parent().css('visibility','visible');
					$('.icon-arrow-right',item).parent().css('visibility','hidden');
				}
				if(item_index == 0){
					$('.icon-arrow-left',item).parent().css('visibility','visible');
					$('.icon-arrow-left',next).parent().css('visibility','hidden');
				}
				var sortno2 = next.data('data-info').sortno;
				item.data('data-info').sortno = sortno2;
				next.data('data-info').sortno = sortno1;
				item.insertAfter(next);
			});
			
			//reset
			$('.reset',this.template).click(function(){
				that.reset();
			})
			$('.save',this.template).click(function(){
				that.save();
			})
			
			//
			$('.toggle',this.template).toggle(function(){
				$('i',this).removeClass('icon-chevron-up').addClass('icon-chevron-down').attr('title','展开');
				$(this).parent().next().hide();
			},function(){
				$('i',this).removeClass('icon-chevron-down').addClass('icon-chevron-up').attr('title','收起');
				$(this).parent().next().show();
			})
		};
		
		FinanceRules.prototype.initFinanceRulesInfo = function(options){
		   var that = this;
           $.ajax({
				url:this.module+"/finance-rule!input.action",
				dataType:'json',
				data:{platformNo:this.platformNo},
				success:function(dom){
					var businesses = that.businesses = dom.businesses;
				 	var financeRule = that.financeRule = dom.financeRule;
				 	var balanceFlow = dom.balanceFlow;
				 	if(balanceFlow){
				 		that.initBalanceFlow(balanceFlow);
				 	}
				 	$('input[data-key]', this.template).each(function(){
				 		if($(this).attr('type') == "checkbox"){
							var name = $(this).attr('name');
							if(name=='accountCreator'){
                                var val = financeRule[name].split(',');
                                if(val[0]=='3'){
                                    $('input[name='+name+']',that.template).attr('checked',true);
                                }
                                else{
                                    $.each(val,function(){
                                        $('input[name='+name+'][value='+this+']',that.template).attr('checked',true);
                                    });
                                }
                            }
							else if(financeRule[name]== '1'){
							    $(this).attr('checked',true);//复选框选中
					    	}else{
					    		$(this).attr('checked'); //复选框未选中
					    	}
						}else if($(this).attr('type') == "radio"){//根据数据设置radio框
							var name = $(this).attr('name');
							if(financeRule[name]== $(this).val()){
							  $(this).attr('checked',true);
						    }
						}else if($(this).attr('type') == "text"){
								var name = $(this).attr('name');
						    	$(this).val(financeRule[name]);
						}else{
							//目前不需要做任何事
						}
				 	});
				 	// that.data = [{'key':'ly','name':'联营','support':true,'map':[{'key':'grn','name':'收货单','isUsed':true,'priority':true}]}
                                    // ,{'key':'jx','name':'经销','support':false,'map':[{'key':'th','name':'退货单','isUsed':true,'priority':true}]}
                                    // ,{'key':'da','name':'带安','support':true,'map':[{'key':'bc','name':'补差单','isUsed':true,'priority':true}]}
                                    // ,{'key':'dx','name':'代销','support':true,'map':[{'key':'xs','name':'销售单','isUsed':true,'priority':true}]}]
                                                                
				 	var plugin = that.businessPlugin = new V.Classes['v.component.CustomElementSelector']();
				 	plugin.init({
				 	    container:$('.businessContent',that.template),
				 	    data:businesses,
				 	    mainTitle:'未选择',
				 	    attachTitle:'已选择'
				 	});
				 	
				 	var list = new V.Classes['v.ui.Grid']();
                    list.init({
                        container:$('.businessGrid',that.template),
                        data:[],
                        columns:[
                                {displayName:'名称',key:'name',width:140}
                                ,{displayName:'是否使用',key:'isUsed',width:40,align:'center',
                                    render:function(record){
                                        var html = $('<div></div>');
                                        var sel = record.isUsed;
                                        if(sel){
                                            html.append('<i class="icon-ok"></i>');
                                        }else{
                                            html.append('<i class="icon-remove"></i>');
                                        }
                                        html.click(function(){
                                            record.isUsed = !record.isUsed;
                                            list.renderRow(record);
                                        });
                                        return html;
                                    }}
                                ,{displayName:'是否优先结算',key:'priority',width:40,isShow:false,align:'center',
                                    render: function(record){
                                        var html = $('<div></div>');
                                        var sel = record.priority;
                                        if(sel){
                                        	html.append('<i class="icon-ok"></i>');
                                        }else{
                                            html.append('<i class="icon-remove"></i>');
                                        }
                                        html.click(function(){
                                            record.priority = !record.priority;
                                            list.renderRow(record);
                                        });
                                        return html;
                                    }
                                }
                                ,{displayName:'是否可生成折让',key:'rebateFlag',width:60,align:'center',
                                    render: function(record){
                                        var html = $('<div></div>');
                                        var sel = record.rebateFlag;
                                        if(sel){
                                        	html.append('<i class="icon-ok"></i>');
                                        }else{
                                            html.append('<i class="icon-remove"></i>');
                                        }
                                        html.click(function(){
                                            record.rebateFlag = !record.rebateFlag;
                                            record.rebateFlag==false?record.rebateGroup = '':"1";
                                            list.renderRow(record);
                                        });
                                        return html;
                                    }
                                }
                                ,{displayName:'折让分组',key:'rebateGroup',width:40,align:'center',
                                    render: function(record){
                                        var html = $('<div></div>');
                                        var groupLength = list.options.data.length;
                                        
                                        var defaultSel = record.rebateGroup;
                                        var select = $('<select style="width:80px"></select>');
                                        for(var i=1; i<=groupLength; i++){
                                        	select.append('<option value="'+i+'">'+i+'</option>');
                                        }
                                        select.val(defaultSel||0);
                                    	html.append(select);
                                        select.change(function(){
                                            record.rebateGroup = select.val();
                                        });
                                        if(!record.rebateFlag){
                                        	select.attr('disabled',true);
                                        }
                                        return html;
                                    }
                                }
                             ]
                    });
                    $(list.template).hide();
                    that.subscribe(plugin,plugin.EVENT.RIGHT_LI_SELECT,function(data){
                        var key = data.key;
                        
                        $(that.businesses).each(function(){
                            var element = this.key;
                            if(key==element){
                                list.options.data = this.map;
                                list.refresh();
                                return;
                            }
                        });
                        $(list.template).animate({'margin-right':0,opacity:'show'},500);
                    });
                    
                    //是否使用结算单触发
                    var account = $('input[name=isUsedAccount]',that.template);
                    if(account.attr('checked')!='checked'){
                        account.parent().parent().parent().find('div:not(:first-child)').find('input[type]').each(function(){
                            $(this).attr('disabled',true);
                        })
                    }
                    else{
                        account.parent().parent().parent().find('div:not(:first-child)').find('input[type]').each(function(){
                            $(this).attr('disabled',false);
                        })
                    }
                    
                    account.click(function(){
                        if($(this).attr('checked')!='checked'){
                            $(this).parent().parent().parent().find('div:not(:first-child)').find('input[type]').each(function(){
                                $(this).attr('disabled',true);
                            })
                        }
                        else{
                            $(this).parent().parent().parent().find('div:not(:first-child)').find('input[type]').each(function(){
                                $(this).attr('disabled',false);
                            })
                        }
                    });
                    //头注释
                    $('.businessMethod',that.template).find('.help').tooltip({
                            title:'<p style="line-height:20px;width:200px;text-align:left;margin:0;">经营方式</p>'
                               ,placement:'right'
                               ,html:'true'
                              });
                    $('.accountRule',that.template).find('.help').tooltip({
                            title:'<p style="line-height:20px;width:200px;text-align:left;margin:0;">结算单规则</p>'
                               ,placement:'right'
                               ,html:'true'
                              });
                    $('.matchRule',that.template).find('.help').tooltip({
                            title:'<p style="line-height:20px;width:200px;text-align:left;margin:0;">匹配规则</p>'
                               ,placement:'right'
                               ,html:'true'
                              }); 
                    $('.invoiceRemarkRule',that.template).find('.help').tooltip({
                        title:'<p style="line-height:20px;width:200px;text-align:left;margin:0;">发票备注规则</p>'
                           ,placement:'right'
                           ,html:'true'
                          });
                    
                    that.initInvoiceRemarkRule();
				}
			})
        };
        //初始化发票备注规则
        FinanceRules.prototype.initInvoiceRemarkRule = function(){
        	var invoiceRemarkRuleMap = this.financeRule.invoiceRemarkRuleMap;// = [{"name":"分部","checked":true,"key":"docketCode","alias":""},{"name":"分部","checked":true,"key":"docketCode","alias":""},{"name":"分部","checked":true,"key":"docketCode","alias":""},{"name":"分部","checked":true,"key":"docketCode","alias":""}];
        	var invoiceRemarkRule = invoiceRemarkRuleMap.invoiceRemarkRule;
        	var redRule = invoiceRemarkRuleMap.redRule;// = [{"issupport":false,"name":"红色通知单号","key":"redCode","alias":""}];
        	
        	var invoiceRemarkRuleContainer = $('.invoiceRemarkRuleContainer',this.template);
        	var redInvoiceRemarkRuleContainer = $('.redInvoiceRemarkRuleContainer',this.template);
        	var length = invoiceRemarkRule.length;
        	
        	$.each(invoiceRemarkRule, function(index,dom){
        		var checked = this.checked||false;
        		var name = this.name||'';
        		var key = this.key||'';
        		var alias = this.alias||'';
        		var item = $('<div key="'+key+'" style="margin:0px 0px 10px 120px"></div>');
        		var mainCode = $('<span style="margin-left:5px">'+name+'</span>');
        		var mainBox = $('<input type="checkbox">');
        		var aliasName = $('<span style="width:40px;text-align:left">别名</span>');
        		var aliasInput = $('<input type="text">').attr('value',alias);
        		if(checked==true)
        			mainBox.attr('checked',true);
        		item.append(mainBox).append(mainCode).append(aliasName).append(aliasInput);
        		invoiceRemarkRuleContainer.append(item);
        	});
        	
        	$.each(redRule, function(){
        		var issupport = this.issupport||false;
        		var name = this.name||'';
        		var key = this.key||'';
        		var alias = this.alias||'';
        		var item = $('<div key="'+key+'" style="margin:0px 0px 10px 120px"></div>');
        		var mainCode = $('<span style="margin-left:5px">'+name+'</span>');
        		var mainBox = $('<input type="checkbox">');
        		var aliasName = $('<span style="width:40px;text-align:left">别名</span>');
        		var aliasInput = $('<input type="text">').attr('value',alias);
        		if(issupport==true)
        			mainBox.attr('checked',true);
        		item.append(mainBox).append(mainCode).append(aliasName).append(aliasInput);
        		redInvoiceRemarkRuleContainer.append(item);
        	});
        }
		FinanceRules.prototype.save = function(){
			var that = this;
			var businesses = this.businessPlugin.getData();
			var balanceFlow = this.getBalanceFlow();
		    var financeRule= that.financeRule;  
			$('input[data-key]',this.template).each(function(){//遍历界面，组装对象financeRule
				if($(this).attr('type') == "checkbox"){
					var name = $(this).attr('name');
					
				    if(name=='accountCreator'){
				        var val = '';
                        $('input[name='+name+']:checked',that.template).each(function(){
                            if(val){
                                val += ','+$(this).val();
                            }else{
                                val += $(this).val();
                            }
                        });
                        financeRule[name] = val;
				    }
				    else if($(this).attr('checked')=='checked')
				        financeRule[name] = true;
				    else    
				        financeRule[name] = false;
				    
				}else if($(this).attr('type') == "radio"){
					var name = $(this).attr('name');
					financeRule[name] = $('input[name='+$(this).attr('name')+']:checked',that.template).val();
				}else{
					financeRule[$(this).attr('name')] = $(this).val();
				}
		        
	  		});  
			
			var invoiceRemarkRuleMap = this.financeRule.invoiceRemarkRuleMap;
			var invoiceRemarkRule = invoiceRemarkRuleMap.invoiceRemarkRule;
			var redRule = invoiceRemarkRuleMap.redRule;
			$.each(invoiceRemarkRule, function(){ //发票备注规则(蓝票)
				var context = $('.invoiceRule',that.template);
				var key = this.key;
				var ele = $('div[key='+key+']', context);
				var checked = ele.find('input[type=checkbox]').attr('checked')=='checked'?true:false;
				var alias = ele.find('input[type=text]').val();
				this.checked = checked;
				this.alias = alias;
			});
			$.each(redRule, function(){ //发票备注规则(红票)
				var context = $('.invoiceRule',that.template);
				var key = this.key;
				var ele = $('div[key='+key+']', context);
				var checked = ele.find('input[type=checkbox]').attr('checked')=='checked'?true:false;
				var alias = ele.find('input[type=text]').val();
				this.issupport = checked;
				this.alias = alias;
			});
			financeRule['invoiceRemarkRuleMap'] = invoiceRemarkRuleMap;
			
			if(this.validate()){//整单验证
		    	$.ajax({
					url:this.module+'/finance-rule!save.action',
					type:'post',
					contentType:'application/json',
					data:JSON.stringify({financeRule:financeRule,businesses:businesses,balanceFlow:balanceFlow}),
					success:function(data){
						if(data.info == 'success'){
		                     	V.alert("财务规则定制保存成功！");
		                     	that.financeRule.version = data.version;
		                     }else{
		                     	V.alert(data);
		                     }
				
					}
				})
		    }
			
		}
		//获取财物流程设置json串
		FinanceRules.prototype.getBalanceFlow = function(){
			var balanceFlow = {};
			balanceFlow['flowType'] = $('.flowList',this.template).val();
			var params = null;
			if(balanceFlow['flowType'] == 1){
				$('.flow',this.template).hide();
				params = $('.flow1',this.template).show();
			}else if(balanceFlow['flowType'] == 2){
				$('.flow',this.template).hide();
				params =$('.flow2',this.template).show();
			}else if(balanceFlow['flowType'] == 3){
				$('.flow',this.template).hide();
				params = $('.flow3',this.template).show();
			}else if(balanceFlow['flowType'] == 4){
				$('.flow',this.template).hide();
				params =$('.flow4',this.template).show();
			}
			balanceFlow['flow.params.match.confirm'] = $('.params .match select[name=confirm]',params).val();
			balanceFlow['flow.params.match.audit'] = $('.params .match select[name=audit]',params).val();
			balanceFlow['flow.params.match.type'] = $('.params .match select[name=type]',params).val();
			balanceFlow['flow.params.match.matchredntc'] = $('.params .match select[name=matchredntc]',params).val();
			balanceFlow['flow.params.match.item.beforetax'] = $('.params .match input[name=beforetax]',params).attr('checked')?1:0;
			balanceFlow['flow.params.match.item.tax'] = $('.params .match input[name=tax]',params).attr('checked')?1:0;
			balanceFlow['flow.params.match.item.sum'] = $('.params .match input[name=sum]',params).attr('checked')?1:0;
			balanceFlow['flow.params.scan.audit'] = $('.params .scan select[name=audit]',params).val();
			balanceFlow['flow.params.scan.tolerance'] = $('.params .scan input[name=tolerance]',params).val();
			balanceFlow['flow.params.scan.taxtolerance'] = $('.params .scan input[name=taxtolerance]',params).val();
			balanceFlow['flow.params.scan.ciphertext'] = $('.params .scan input[name=ciphertext]',params).val();
			balanceFlow['flow.params.auth.auto'] = $('.params .auth input[name=auto]',params).attr('checked')?1:0;
			balanceFlow['flow.params.auth.manual'] = $('.params .auth input[name=manual]',params).attr('checked')?1:0;
			balanceFlow['flow.params.auth.preauth'] = $('.params .auth input[name=preauth]',params).attr('checked')?1:0;
			balanceFlow['flow.params.post.auto'] = $('.params .post input[name=auto]',params).attr('checked')?1:0;
			balanceFlow['flow.params.post.manual'] = $('.params .post input[name=manual]',params).attr('checked')?1:0;
			balanceFlow['flow.params.post.prepost'] = $('.params .post input[name=prepost]',params).attr('checked')?1:0;
			return balanceFlow;
		};
		//初始化财务流程设置
		FinanceRules.prototype.initBalanceFlow = function(balanceFlow){
			var flowType = balanceFlow.flowType;
			var match_confirm = balanceFlow['flow.params.match.confirm'];
			var match_audit = balanceFlow['flow.params.match.audit'];
			var match_type = balanceFlow['flow.params.match.type'];
			var scan_audit = balanceFlow['flow.params.scan.audit'];
			var auth_auto = balanceFlow['flow.params.auth.auto'];
			var auth_manual = balanceFlow['flow.params.auth.manual'];
			var auth_preauth = balanceFlow['flow.params.auth.preauth'];
			var post_auto = balanceFlow['flow.params.post.auto'];
			var post_manual = balanceFlow['flow.params.post.manual'];
			var post_prepost = balanceFlow['flow.params.post.prepost'];
			var match_matchredntc = balanceFlow['flow.params.match.matchredntc'];
			var match_item_beforetax = balanceFlow['flow.params.match.item.beforetax'];
			var match_item_tax = balanceFlow['flow.params.match.item.tax'];
			var match_item_sum = balanceFlow['flow.params.match.item.sum'];
			var scan_tolerance = balanceFlow['flow.params.scan.tolerance'];
			var scan_ciphertext = balanceFlow['flow.params.scan.ciphertext'];
			var scan_taxtolerance = balanceFlow['flow.params.scan.taxtolerance'];
			$('.flowList option[value='+flowType+']',this.template).attr('selected',true);
			var params = null;
			if(flowType == 1){
				$('.flow',this.template).hide();
				params = $('.flow1',this.template).show();
			}else if(flowType == 2){
				$('.flow',this.template).hide();
				params =$('.flow2',this.template).show();
			}else if(flowType == 3){
				$('.flow',this.template).hide();
				params = $('.flow3',this.template).show();
			}else if(flowType == 4){
				$('.flow',this.template).hide();
				params =$('.flow4',this.template).show();
			}
			$('.params .match select[name=confirm] option[value='+match_confirm+']',params).attr('selected',true);
			$('.params .match select[name=audit] option[value='+match_audit+']',params).attr('selected',true);
			$('.params .match select[name=type] option[value='+match_type+']',params).attr('selected',true);
			$('.params .scan select[name=audit] option[value='+scan_audit+']',params).attr('selected',true);
			$('.params .auth input[name=auto]',params).attr('checked',auth_auto=="1"?true:false);
			$('.params .auth input[name=manual]',params).attr('checked',auth_manual=="1"?true:false);
			$('.params .auth input[name=preauth]',params).attr('checked',auth_preauth=="1"?true:false);
			$('.params .post input[name=auto]',params).attr('checked',post_auto=="1"?true:false);
			$('.params .post input[name=manual]',params).attr('checked',post_manual=="1"?true:false);
			$('.params .post input[name=prepost]',params).attr('checked',post_prepost=="1"?true:false);
			$('.params .match select[name=matchredntc] option[value='+match_matchredntc+']',params).attr('selected',true);
			$('.params .match input[name=beforetax]',params).attr('checked',match_item_beforetax=="1"?true:false);
			$('.params .match input[name=tax]',params).attr('checked',match_item_tax=="1"?true:false);
			$('.params .match input[name=sum]',params).attr('checked',match_item_sum=="1"?true:false);
			$('.params .scan input[name=tolerance]',params).val(scan_tolerance);
			$('.params .scan input[name=ciphertext]',params).val(scan_ciphertext);
			$('.params .scan input[name=taxtolerance]',params).val(scan_taxtolerance);
		};
		FinanceRules.prototype.reset = function(){
			//this.initTicketInfo();
			$.each($('.form-inline'),function(){
				this.reset();
			});
		};
		FinanceRules.prototype.validate = function(){
			var isValid = true;
			$('*[data-validator]',this.template).each(function(){
				var required = $(this).attr('data-required')||false;
				var rules = $(this).attr('data-validator')||'';
				var v = $(this).val();
				if(required&&v==""){
						$(this).parent().find('.error_msg').text($(this).attr('data-value')+"值不可为空").show();
						isValid = false;
						return false;
				}else{
					$(this).parent().find('.error_msg').empty().hide();
				}
				/*
				if(rules){
					var msg = Validator.validate(rules,v);
					if(msg){
						$(this).parent().find('.error_msg').text(msg).show();
						isValid = false;
					}else{
						$(this).parent().find('.error_msg').empty().hide();
					}
				}
				*/
			});
			return isValid;
		}
		FinanceRules.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'财务规则定制详情'}});
		}
	})(V.Classes['v.views.backoffice.custom.FinanceRules']);
},{plugins:['v.ui.dialog',"v.fn.validator",'v.ui.alert','v.component.customElementSelector']})
