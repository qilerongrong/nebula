;V.registPlugin("v.views.backoffice.custom.customer",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.Customer",
		superClass:"v.Plugin",
		init:function(){
			this.customer = null;
			this.user = null;
			this.post = null;
			this.role = null;
			this.menu_tree = new V.Classes['v.ui.Tree']();
			this.menus = null;
			this.module = "";
			this.ns = 'v.views.backoffice.custom.customer';
			this.resource = {
			    html:'template.html'
			}
			this.steps = ["基本信息","地址信息","功能权限","用户信息"];
		}
	});
	(function(PluginClass){
		PluginClass.prototype.init = function(options){
			this.module = options.module;
			this.options = options;
			var that = this;
			 
			this.container = options.container;
 			var step = this.step = new V.Classes['v.ui.Step']();
			step.init({
					container:that.container,
					maxStep:4,
					stepNo:1,
					guide:that.steps
				});
			 
			var url = this.getPath()+"/assets/"+this.resource.html;
		    $.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					$('.step-content',step.template).append(dom);

					that.container.append(step.template);
					that.initEvent(step);
					that.initBusinessType(step.template);
					
					$('#startDate',step.template).datepicker({dateFormat: "yy-mm-dd",showMonthAfterYear:true,changeMonth: true,
			             changeYear: true});
					$('#endDate',step.template).datepicker({dateFormat: "yy-mm-dd",showMonthAfterYear:true,changeMonth: true,
			             changeYear: true});
				}
			})
		}

	 PluginClass.prototype.initEvent = function(step){
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
 		$('#next,#next2',this.step.template).click(function(){
			if(step.options.stepNo == 1){
				if(!that.validate('[name=step1]')) return;
				var customer = that.customer||{};
				$('*[customer-data-key]',that.step.template).each(function(){
					var key = $(this).attr('customer-data-key');
					if(key=='businessType'){
						var tmp = [];
						$('input[type=checkbox]:checked',this).each(function(){
							tmp.push(this.value);
						});
						customer[key] = tmp.join(',');
					}else{
						customer[key] = $('.edit_input',this).val();
					}
				});
				if(customer['businessType']==''){
					V.alert('必须选择一种经营方式！');
					return;
				}
				$.ajax({
	            	url:that.module+"/customer!step1.action",
	               	type:'post',
					data:JSON.stringify({customer:customer}),
					contentType:'application/json',
	                success:function(data){
					 	if(data == null || data == '' || data == undefined){
							V.alert("保存失败！");
						}else{
							V.alert("保存成功！");
							$('#customerNo',that.step.template).val(data.customer.customerNo);
							that.customer = data.customer;
							if(data.role!=null){
							    that.user = data.user;
                                that.post = data.post;
                                that.role = data.role;
							}
							that.initStep2();
                     		step.next();
						}
	                }
	            })
				return;
			}
            if(step.options.stepNo == 2){
                that.initStep3();
                step.next();
                return;
            }
			if(step.options.stepNo == 3){
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
			if(step.options.stepNo == 4){
				//用户编码校验
				var userCodeDom = $('*[user-data-key=loginName]',that.step.template).find('input');
				var reg = new RegExp('^'+userCodeDom.data('userHeader')+'[0-9a-zA-Z]+$');
				if(!reg.test(userCodeDom.val())){
					V.alert('用户登录名称必须以'+userCodeDom.data('userHeader')+'开头！');
					return;
				}
				
				if(!that.validate('[name=step4]')) return;
				var user = that.user||{};
				$('*[user-data-key]',that.step.template).each(function(){
					var key = $(this).attr('user-data-key');
					user[key] = $('.edit_input',this).val();
				});
			 
				user['posts'] = null;
				$.ajax({
	            	url:that.module+'/customer!step4.action',
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
		$('#prev,#prev2',step.template).click(function(){
			step.previous();
		});
		
        $('.address_group_view',this.template).click(function(){
            that.addAddress();
        })
	}
    PluginClass.prototype.authoritySetting = function(){
        var that = this;
        if($('#step3-data').html()!='') return;
        
        var authority = new V.Classes['v.views.component.AuthoritySetting']();
        var data = {
            instance:this,
            id:that.customer['id'],
            roleId:that.role['id'],
            module:that.module,
            action:'customer'
        }
        authority.init(data);
        $('#step3-data').append(authority.template);
    }
	PluginClass.prototype.initStep2 = function(){
	 	var that = this;
        var container = $('#step2-data',this.template).empty();
        var grid = this.addressList = new V.Classes['v.ui.Grid']();
        
        grid.setFilters({customerId:this.customer.id});
        grid.init({
            container:container,
            url:that.module+'/customer!listAddress.action',
            columns:[
                {displayName:'省市',key:'provinceName'}
                ,{displayName:'城市',key:'cityName'}
                ,{displayName:'区县',key:'countyName'}
                ,{displayName:'地址',key:'address'}
                ,{displayName:'联系人',key:'linkman'}
                ,{displayName:'电话',key:'telephone'}
                ,{displayName:'邮编',key:'zipcode'}
                ,{displayName:'默认地址',key:'isDefault',render:function(record){
                	return record.isDefault=='0'?'否':'是';
                }}
                ,{displayName:'操作',key:'action',width:40,render:function(record){
                    var html = $('<div><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a>\
                    		<a class="edit" href="javascript:void(0);" title="编辑"><i class="icon-edit"></i></a><div>');
                    $('.remove',html).click(function(){
                        V.confirm('是否删除地址？',function(){
                            V.ajax({
                                url:that.module+'/customer!deleteAddress.action',
                                type:'post',
                                data: {customerAddress:record},
                                success:function(data){
                                    if(data.result=='success'){
                                        grid.removeRecord(record);
                                    }
                                    else{
                                        V.alert(data);
                                    }   
                                }
                            })
                        });
                    });
                    $('.edit',html).click(function(){
                    	that.addAddress(record);
                    });
                    return html;
                }}
            ]
        });
	}
    PluginClass.prototype.initStep3 = function(){
        var container = this.container;
        var menu_tree = this.menu_tree;
        var role = this.role;
        this.authoritySetting();
    }
	/**加载用户信息**/
	PluginClass.prototype.initStep4 = function(){

    }
	PluginClass.prototype.validate = function(dom){
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
    PluginClass.prototype.initBusinessType = function(context){
        var that = this;
        $.ajax({
            url:that.module+"/customer!initBusinessType.action",
            type:'post',
            dataType:'json',
            success:function(data){
            	var dom = $('*[customer-data-key=businessType]',that.step.template);
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
    //新增地址
    PluginClass.prototype.addAddress = function(record){
        var that = this;
        
        var addDlg = new V.Classes['v.ui.Dialog']();
        var addressArea = $("<div class='docket'></div>");
        var area = new V.Classes['v.component.Area']();
        area.init({
            container:addressArea
        })
        
        var areaText = $('<span class="areaLabel">行政区域</span>');
		area.template.prepend(areaText);
        addDlg.setContent(addressArea);
        
        var Form = V.Classes['v.component.Form'];
		var form = new Form();
        var items = [
                   {label:'地址',type:Form.TYPE.TEXT,name:'address',validator:'text(0,300)'},
                   {label:'联系人',type:Form.TYPE.TEXT,name:'linkman',validator:'text(0,300)'},
                   {label:'联系电话',type:Form.TYPE.TEXT,name:'telephone',validator:'mobile'},
                   {label:'邮编',type:Form.TYPE.TEXT,name:'zipcode',validator:'zipCode'},
                   {label:'是否默认',type:Form.TYPE.SELECT,name:'isDefault',multiList:[['否','0'],['是','1']]}
            ];
       
        form.init({
        	container:addressArea,
            colspan:2,
            items:items
        });
		
        if(record!=null){
        	area.initValue(record.provinceId,record.cityId,record.countyId);
        	for(key in record){
        		$('*[name='+key+']',form.template).val(record[key]);
        	}
        }
        
        addDlg.setBtnsBar({btns:[{text:"保存",style:"btn-primary",handler:function(){
        	if(!form.validate()){
				return;
			}
        	
            var optProvince = $('.sel_level1 option:selected',this.template);
            var optCity = $('.sel_level2 option:selected',this.template);
            var optCounty = $('.sel_level3 option:selected',this.template);

            if(record==null){
				record = {};
				record.customerId = that.customer.id;
			}
			
            record.provinceId = optProvince.attr('value');
			record.cityId = optCity.attr('value');
			record.countyId = optCounty.attr('value');
			record.provinceName = optProvince.attr('name');
			record.cityName = optCity.attr('name');
			record.countyName = optCounty.attr('name');
			
            if(record.provinceId=='-1' || record.cityId=='-1' || record.countyId=='-1'){
				V.alert('请选择正确的行政区域！');
				return;
			}
			
			var values = form.getValues();
			for(key in values){
				record[key] = values[key];
			}
			
            V.ajax({
                url:that.module+'/customer!saveAddress.action',
                type:'post',
                data:{customerAddress : record},
                //contentType:'json',
                success:function(data){
                    if(data!=undefined){
                        that.addressList.options.data = data.addresses;
                        that.addressList.refresh();
                        addDlg.close();
                    }else{
                        V.alert(data);
                    }
                }
            })
            
        }},{text:"取消",handler:addDlg.close}]});
        addDlg.init({title:'地址维护',height:350,width:600});
    }
    //获取用户编码首字母
    PluginClass.prototype.getUserHeader = function(record,context){
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
    PluginClass.prototype.addCrumb = function(){
		V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'客户新增'}});
	}
	})(V.Classes['v.views.backoffice.custom.Customer']);
},{plugins:["v.ui.step","v.ui.tree","v.ui.dialog","v.fn.validator",'v.ui.alert','v.views.component.authoritySetting','v.component.area']});