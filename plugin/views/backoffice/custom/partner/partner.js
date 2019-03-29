;V.registPlugin("v.views.backoffice.custom.partner",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.Partner",
		superClass:"v.Plugin",
		init:function(){
			this.partner = null;
			this.user = null;
			this.post = null;
			this.role = null;
			this.menu_tree = new V.Classes['v.ui.Tree']();
			this.menus = null;
			this.module = "";
			this.ns = 'v.views.backoffice.custom.partner';
			this.resource = {
			    html:'template.html'
			}
//			this.steps = ["基本信息","功能权限","控制点","用户信息"];
			this.steps = ["基本信息","功能权限","用户信息"];
		}
	});
	(function(Partner){
		Partner.prototype.init = function(options){
			this.module = options.module;
			this.options = options;
			var that = this;
			 
			this.container = options.container;
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
					/**将第一步内容及其他步骤Step div 添加到 Step UI中**/
					$('.step-content',step.template).append(dom);
//					$('#createTime',step.template).datepicker({dateFormat: "yy-mm-dd",showMonthAfterYear:true,changeMonth: true,
//			             changeYear: true});
					$('#startDate',step.template).datepicker({dateFormat: "yy-mm-dd",showMonthAfterYear:true,changeMonth: true,
			             changeYear: true});
					$('#endDate',step.template).datepicker({dateFormat: "yy-mm-dd",showMonthAfterYear:true,changeMonth: true,
			             changeYear: true});
					that.container.append(step.template);
					that.initEvent(step);
					//that.initStep2();
					that.initStep3();
					that.initStep4();
					that.invSettlePeriod(step.template);
					that.initBusinessType(step.template);
					
					var accreditationType = $('*[partner-data-key=accreditationType]',step.template).find('select');
					var ACCREDITATION_TYPE = DictInfo.getVar('ACCREDITATION_TYPE');
		        	for(key in ACCREDITATION_TYPE){
		        		var opt = $('<option></option>');
		        		opt.text(ACCREDITATION_TYPE[key]).val(key);
		        		accreditationType.append(opt);
		        	}
					
		        	var tax_limit_sel = $('#invoiceLimit',that.step.template);
		        	var INVOICE_LIMIT = DictInfo.getVar('INVOICE_LIMIT');
			  		for(key in INVOICE_LIMIT){
			  			var option = $('<option value='+key+'>'+INVOICE_LIMIT[key]+'万元</option>');
			  			tax_limit_sel.append(option);
			  		}
				}
			})
		}

	 Partner.prototype.initEvent = function(step){
	 	var that = this;
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
		//密码是否相同校验
        $('#inputPassword2',this.step.template).blur(function(){
            var msg = '密码和确认密码不相同，请重新输入！';
            if($('#inputPassword').val()!=$('#inputPassword2').val()){
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
				var partner = that.partner||{};
				$('*[partner-data-key]',step.template).each(function(){
					var key = $(this).attr('partner-data-key');
					if(key=='businessType'||key=='extractType'){
						var tmp = [];
						$('input[type=checkbox]:checked',this).each(function(){
							tmp.push(this.value);
						});
						partner[key] = tmp.join(',');
					}else{
						partner[key] = $('.edit_input',this).val();
					}
				});
				if(partner['businessType']==''){
					V.alert('必须选择一种经营方式！');
					return;
				}
				if(partner['extractType']==''){
					V.alert('必须选择一种发票抽取方式！');
					return;
				}
				$.ajax({
	            	url:that.module+"/partner!step1.action",
	               	type:'post',
					data:JSON.stringify({partner:partner}),
					contentType:'application/json',
	                success:function(data){
					 	if(data == null || data == '' || data == undefined){
							V.alert("保存失败！");
						}else{
							V.alert("保存成功！");
							$('#partnerNo',that.step.template).val(data.partner.partnerNo);
							that.partner = data.partner;
							if(data.role!=null){
							    that.user = data.user;
                                that.post = data.post;
                                that.role = data.role;
							}
							that.initStep2(data.partner.partnerNo);
                     		step.next();
						}
	                }
	            })
				return;
			}
			/*
			if(step.options.stepNo == 2){
				var postId=that.post.id
				$.ajax({
					url:that.module+'/partner!findauth.action',
					type:'post',
					data:{postId:postId},
					success:function(data){
						that.controlPoint = data;
						 if(data != null && data != undefined){
						 	var html = "";
						 	$.each(data,function(){
						 		html += '<div class="control-group span6">\
								      <label class="control-label" for="input01">'+this.name+'：</label>\
									      <div class="controls">\
									        <p id="'+this.dictcode+'">'+this.code+'</p>\
									      </div>\
								      </div>';
							})
							$(".controlPointList",that.step.template).empty().html(html);
						 }
					}
				});
				
			    step.next();
			    return;
			}
			*/
			if(step.options.stepNo == 2){
				step.next();
				
				if(LoginInfo.user.userType!=CONSTANT.USER_TYPE.MAINTEMNCE){
					that.getUserHeader();
				}
				
				/**设置验证**/
                $('*[data-validator]:visible',that.step.template).keyup(function(e){
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
        
				return;
			}
			 
		});
		$('#success2,#success').click(function(){
			if(step.options.stepNo == 3){
				//用户编码校验
				var userCodeDom = $('*[user-data-key=loginName]',that.step.template).find('input');
				var reg = new RegExp('^'+userCodeDom.data('userHeader')+'[0-9a-zA-Z]+$');
				if(!reg.test(userCodeDom.val())){
					V.alert('用户登录名称必须以'+userCodeDom.data('userHeader')+'开头！');
					return;
				}
				
				if(!that.validate('[name=step3]')) return;
				var user = that.user||{};
				$('*[user-data-key]',that.step.template).each(function(){
					var key = $(this).attr('user-data-key');
					user[key] = $('.edit_input',this).val();
				});
			 
				user['posts'] = null;
				$.ajax({
	            	url:that.module+'/partner!step4.action',
	               	type:'post',
					data:JSON.stringify({user:user}),
					contentType:'application/json',
	                success:function(data){
	                     if(data.result == 'success'){
	                     	V.alert(data.msg);
							V.MessageBus.publish({eventId:'backCrumb'});
	                     }else if(data == 'fail'){
	                     	V.alert("保存失败！");
	                     }
	                }
	            })
				return;
			}
		});
		
		/**绑定上一步事件**/
		$('#prev,#prev2',that.step.template).click(function(){
			step.previous();
		});
		/**交易伙伴管理-控制点**/
			$('#matchset',this.step.template).click(function(){
				var controlPoing = new V.Classes['v.views.backoffice.authority.PostControlPoint']();
				var controlOptions = {};
	            controlOptions.module = that.options.module;
	            controlOptions.controlPoint = that.controlPoint;
	                
				controlPoing.init(controlOptions);
				
				var addDlg = new V.Classes['v.ui.Dialog']();
				addDlg.setBtnsBar({btns:[{text:"确定",style:"btn-primary",handler:function(){
					var textareas = $('.control-list-content',controlPoing.template).find('textarea');
	                if(textareas.length == 0){
	                    alert("没有数据");
	                    return;
	                }
	                var judgeFlag = true;
	                $.each(textareas,function(){
	                    if($(this).val()==''){
	                       //V.alert('控制点内容不能为空！');
	                       $(this).parent().find('.error_msg').text('不能为空，请输入代码！').show();
	                       judgeFlag = false;
	                       return false;
	                    }
	                });
	                if(judgeFlag==false) return;
	                
	                that.submit(controlPoing.template);
	                addDlg.close();
					
				}},{text:"取消",handler:addDlg.close}]});
				addDlg.init({title:'控制点',height:492,width:660});
				/**将Grid中的数据加入到Dialog中**/
				addDlg.setContent(controlPoing.template);
			})
	 }
	 //控制点提交
	 Partner.prototype.submit = function(dom){
	        var that = this;
         var control = $('.control-list-content',dom).find('textarea');
         var controlArr = [];
         var controlStr="";
         control.each(function(){
             var key = $(this).attr('controlpointKey');
             var name = $(this).attr('controlpointName');
             var code = $(this).val();
             
             controlStr+='"'+key+'":"'+code+'",';
             
             var json = {
                 name:name,
                 code:code,
                 key:key
             };
             controlArr.push(json);
         });
         controlStr="{"+controlStr+"}";
         
         $.ajax({
             url:this.module+'/partner!saveauth.action',
             type:'post',
             data:{id:this.post['id'],control:controlStr},
             success:function(data){
                 if(data == 'success'){
                     V.alert("控制点保存成功!");
                     
                     var html = "";
                     $.each(controlArr,function(){
                     html += '<div class="control-group span6">\
                               <label class="control-label" for="input01">'+this.name+'：</label>\
                                   <div class="controls">\
                                     <p id="'+this.dictcode+'">'+this.code+'</p>\
                                   </div>\
                               </div>';
                     })
                     $(".controlPointList",that.step.template).empty().html(html);
                     that.controlPoint = controlArr;
                 }else{
                     V.alert("保存失败!");
                 }
             }
         })		
	 }
	 /**
	  * 步骤内容加载
	  */
	 Partner.prototype.initStep2 = function(platformNo){
	 	var container = this.container;
	 	var menu_tree = this.menu_tree;
	 	var role = this.role;
	 	/*
	 	if($('#step2-data', container).text() == ''){
			$.ajax({
				url:this.module+'/menuTree.action',
				type:'post',
				data:{roleId:role.id,menuType:CONSTANT.MENU_TYPE.BCP_SUPPLIER},
				//dataType:'json',
				success:function(data){
					this.menus = data.treeViews;
					menu_tree.init({
						checkable: true,
						data: this.menus,
						container: $('#step2-data', container)
					});
					
				},
				error:function(){
					that.log('get Menus failed!');
				}
			})
		}
	 	*/
	 	this.authoritySetting();
	 }
	 Partner.prototype.authoritySetting = function(){
        var that = this;
        if($('#step2-data').html()!='') return;
//        $('.edit_authority',this.step.template).click(function(){
//            that.publish({eventId:'authority_edit',data:''});
//        });
        
        var authority = new V.Classes['v.views.component.AuthoritySetting']();
        var data = {
            instance:this,
            id:that.partner['id'],
            roleId:that.role['id'],
            module:that.module,
            action:'partner'
        }
        authority.init(data);
        $('#step2-data').append(authority.template);
    }
	 Partner.prototype.initStep3 = function(){}
	 /**加载用户信息**/
	 Partner.prototype.initStep4 = function(){}
	 
	 Partner.prototype.validate = function(dom){
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
		return isValid;
	}
	//获取经营方式
    Partner.prototype.initBusinessType = function(context){
        var that = this;
        $.ajax({
            url:that.module+"/partner!initBusinessType.action",
            type:'post',
            dataType:'json',
            success:function(data){
            	var dom = $('*[partner-data-key=businessType]',that.step.template);
            	$.each(data,function(index,d){
            		var name = data[index].dictname;
            		var value = data[index].dictcode;
            		var checkbox = '<input type="checkbox" value="'+value +'"/>&nbsp;';
            		var item = '<span>'+ name + '</span>&nbsp;';
            		dom.append(checkbox).append(item);
            	})
            }
        })
    }
    //获取结算周期
    Partner.prototype.invSettlePeriod = function(context){
        var sel = $('*[partner-data-key=settlePeriod]',context).find('select');
        var PARTNER_SETTLE_PERIOD = DictInfo.getVar('PARTNER_SETTLE_PERIOD');
        for(key in PARTNER_SETTLE_PERIOD){
            var name = PARTNER_SETTLE_PERIOD[key];
            var opt = $('<option value=' + key + '>' + name + '</option>');
            sel.append(opt);
        }
    }
  //获取用户编码首字母
    Partner.prototype.getUserHeader = function(record,context){
        var that = this;
        var url = 'common!getUserHeader.action';
        $.ajax({
            url:url,
            type:'post',
            dataType:'text',
            success:function(data){
                $('*[user-data-key=loginName]',that.step.template).find('input').data('userHeader',data).val(data);
            }
        })
    }
    Partner.prototype.addCrumb = function(){
		V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'供应商新增'}});
	}
	})(V.Classes['v.views.backoffice.custom.Partner']);
},{plugins:["v.ui.step","v.ui.tree","v.ui.dialog","v.views.backoffice.authority.postControlPoint","v.fn.validator",'v.ui.alert','v.views.component.authoritySetting']});