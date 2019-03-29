;V.registPlugin("v.views.backoffice.custom.customerEdit",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.CustomerEdit",
		superClass:"v.Plugin",
		init:function(){
			this.customer = null;
			this.user = null;
			this.menus = null;
			this.files=null;
			this.post = {};
			this.module = "";
			this.record = {};
			this.crumbsName = "客户编辑";
			this.ns = 'v.views.backoffice.custom.customerEdit';
			this.resource = {
			    html:'template.html'
			}
		}
	});
	(function(PluginClass){
		PluginClass.prototype.init = function(options){
			var that = this;
			this.module = options.module;
			this.container = options.container;
			this.options = options;
			this.record = options.record;
			this.customer = options.record;
			if(options.record==null){
				this.crumbsName = "我的信息";
			}
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					that.initFormInfo(that.record);
					that.initEvent();
					that.getUserHeader();
					if(LoginInfo.user.userType==CONSTANT.USER_TYPE.CUSTOMER){ //客户不能看到菜单是指和用户信息
						$('#step1',that.template).show();
						$('#step2',that.template).show();
						$('#step3',that.template).hide();
						$('#step4',that.template).hide();
						$('#step5',that.template).show();
					}else{
						//$('#step4',that.template).show();
						$('#fileUpload',that.template).hide();
					}
					$("#fileUpload",this.template).click(function(){
						 that.uploadFile();
	         		});
				}
			})
			//this.addCrumb();
		}
	  PluginClass.prototype.initFormInfo = function(record){
	  	var that = this;
	  	var customerId=""
	  	var isCustomer = (LoginInfo.user.businessRole == LoginInfo.businessRole.ENTERPRISE);
	  	if(record!=null){
	  		customerId=record['id'];
	  	}

	  	$('#startDate',this.template).datepicker({dateFormat: "yy-mm-dd",showMonthAfterYear:true,changeMonth: true,
            changeYear: true});
	  	$('#endDate',this.template).datepicker({dateFormat: "yy-mm-dd",showMonthAfterYear:true,changeMonth: true,
            changeYear: true});
            
		$.ajax({
        	url:that.module+'/customer!input.action',
           	type:'post',
			data: {customerId: customerId},
            success:function(data){
				 if(data!=undefined){
				 	that.post = data.post;
					that.customer = data.customer;
					that.user = data.user;
					that.role = data.role;
					that.menus = data.menus;
					that.files=data.fileList;
					that.addresses=data.addresses;
				 }
				 if(data!=undefined && data.customer !=undefined){
                    var customer = data.customer;
                    $('*[customer-data-key]',that.template).each(function(index,item){
                        var key = $(this).attr('customer-data-key');
                        var value = customer[key]||'';
                        var type = $(this).attr('data-type');
                        if(type=='select'){
                        	$('.edit_input',this).val(value);
                        	$('.view_text',this).text($('.edit_input',this).find('option:selected').text());
                        }else{
                            if(key=='extractType'&&value!=null){
                            	var types = value.split(',');
                            	$.each(types,function(){
                            	    $('input[value='+this+']',item).attr('checked',true);
                            	})
                            }else{
                            	$('.view_text',this).text(value);
                                $('.edit_input',this).val(value);
                            }
                        }
                        $('.view_text',this).css('padding-top','2px');
                    });
                    that.initBusinessType(that.template);
                 }
                 // if(data!=undefined && data.addresses !=undefined){
                 	that.getAddress();
                 // }
				 if(data!=undefined && data.user !=undefined){
				 	var user = data.user;
				 	$('*[user-data-key]',this.template).each(function(){
						var key = $(this).attr('user-data-key');
						var value = user[key];
						$('.view_text',this).text(value);
						$('.edit_input',this).val(value);
						
						$('.view_text',this).css('padding-top','2px');
					});
				 }
				 
				 // if(data!=undefined && data.fileList !=undefined){
					 	var list= that.fileList= new V.Classes["v.ui.Grid"]();
					 	if(isCustomer){
					 		list.init({
				                container:$('.fileList',this.template),
				                checkable:false,
				                data:data.fileList,
				                columns:[
				                    {displayName:'文件名',key:'fileName',width:220},
				                    {displayName:'文件类型',key:'fileType',width:100},
				                    {displayName:'操作',key:'action',width:50,render:function(record){
				                    	var html = $('<div class="action"><a class="download" href="javascript:void(0); style="margin:0 8px;"" title="下载"><i class="icon-download"></i></a></div>');
			                    		$('.download',html).click(function(){
			                    			that.download(record);
			                    		});
				                        return html;
				                    }}
				                ]
				            });
					 	}else{
					 		list.init({
				                container:$('.fileList',this.template),
				                checkable:false,
				                data:data.fileList,
				                columns:[
				                    {displayName:'文件名',key:'fileName',width:220},
				                    {displayName:'文件类型',key:'fileType',width:100,render:function(record){
				                    	return CONSTANT.ENTERPRISE_FILE_TYPE[record.fileType+""];
				                    }},
				                    {displayName:'操作',key:'action',width:50,render:function(record){
				                        var html = $('<div class="action"><a class="remove" href="javascript:void(0);" title="删除"><i class="icon-remove"></i></a><div>');
				                        $('.remove',html).click(function(){
				                        	that.removeFile(record);
				                        });
				                        return html;
				                    }}
				                ]
				            });
					 	}
					 // }
					 
				 if(data!=undefined && data.role !=undefined){
				     that.authoritySetting();
				 }
            }
        })
	  }
	  PluginClass.prototype.download = function(record){
      	var that = this;
			var info="是否要下载？";
			V.confirm(info,function ok(e){
				window.location.href=that.module+"/customer!downLoad.action?fileId="+record.id;
			});
      }
	  PluginClass.prototype.uploadFile = function(){	
			var upload = new V.Classes['v.component.FileUpload']();
			var that = this;
			this.subscribe(upload,upload.EVENT.CLOSE,function(data){
				that.fileList.url = that.module+'/customer!retrieveDownLoadFileList.action';
				that.fileList.refresh();
			});
			upload.init({
				title : '企业资料上传',
				typeList:[{type:"1",text:CONSTANT.ENTERPRISE_FILE_TYPE["1"]}
				    ,{type:"2",text:CONSTANT.ENTERPRISE_FILE_TYPE["2"]}
				    ,{type:"3",text:CONSTANT.ENTERPRISE_FILE_TYPE["3"]}
				    ,{type:"4",text:CONSTANT.ENTERPRISE_FILE_TYPE["4"]}
				    ,{type:"5",text:CONSTANT.ENTERPRISE_FILE_TYPE["5"]}
				  ],
				uploadSetting:{
					url:'attribUpload',
					params:{'fileType':'enterpriseFile'},
					uploadComplete:function(){
						 
					}
				}
			});
		}
	  PluginClass.prototype.removeFile = function(record){
		  var that=this;
		  V.confirm('确定要删除企业资料'+record.fileName+'?',function(){
			  $.ajax({
					url:that.module+'/customer!deleteFile.action',
					type:'post',
					data:{fileId:record.id},
					success:function(data){
						if(data=="success"){
							 that.fileList.removeRecord(record);
						}else{
							V.alert("删除文件失败！");
						}
					}
				});
		  })
	  }
	  PluginClass.prototype.authoritySetting = function(){
        var that = this;
        $('.edit_authority',this.template).click(function(){
            that.publish({eventId:'authority_edit',data:''});
        });
        
        var authority = new V.Classes['v.views.component.AuthoritySetting']();
        var data = {
            instance:this,
            id:that.customer['id'],
            roleId:that.role['id'],
            module:that.module,
            action:'customer'
        }
        authority.init(data);
        $('.authority_list',this.template).append(authority.template);
      }
	  PluginClass.prototype.initEvent = function(){
	 	var that = this;
	 	
	 	/**设置验证**/
		$('*[data-validator]:visible',this.template).keyup(function(e){
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
		
		that.edit('.customer_group_view','.customer_group_edit');
		that.cancel('.customer_group_edit','.customer_group_view');
		that.edit('.customer-view','.customer-edit');
		that.cancel('.customer-edit','.customer-view');
		
		$('.customer_group_edit .cancel',this.template).click();
		
		$('.customer_group_edit .save',this.template).click(function(){
			var customer = that.customer;
			if(!that.validate('[name=step1]')) return;
			$('*[customer-data-key]',that.template).each(function(){
				var key = $(this).attr('customer-data-key');
				if(key=='businessType'||key=='extractType'){
					var tmp = [];
					$('input[type=checkbox]:checked',this).each(function(){
						tmp.push(this.value);
					});
					customer[key] = tmp.join(',');
				}else{
					customer[key] = $('.edit_input',this).val();
				}
				
			});
			
			var url = that.module+'/customer!step1.action';
            $.ajax({
            	url:url,
               	type:'post',
				data:JSON.stringify({customer:customer}),
				contentType:'application/json',
                success:function(data){
                   if(data != null && data != undefined){
						var customer = that.customer = data.customer;
						
						$('*[customer-data-key]',that.template).each(function(){
	                        var key = $(this).attr('customer-data-key');
	                        var value = customer[key]||'';
	                        var type = $(this).attr('data-type');
	                        
	                        if(type=='select'){
	                        	$('.edit_input',this).val(value);
	                        	$('.view_text',this).text($('.edit_input',this).find('option:selected').text());
	                        }else{
	                        	$('.view_text',this).text(value);
	                            $('.edit_input',this).val(value);
	                        }
	                    });
						V.alert("客户基本信息保存成功!");
						$('.customer_group_edit .cancel',this.template).click();
				   }
                }
            })
		});
		$('.customer-edit .save',this.template).click(function(){
			var user = that.user;
			//用户登录名编码校验
			var userCodeDom = $('#userStartCode',that.template).val();
			var loginName=$("#loginName").val();
			var reg = new RegExp('^'+userCodeDom+'[0-9a-zA-Z]+$');
			if(!reg.test(loginName)){
				V.alert('用户登录名称必须以'+userCodeDom+'开头！');
				return;
			}
			if(!that.validate('[name=step4]')) return;
			$('*[user-data-key]',that.template).each(function(){
				var key = $(this).attr('user-data-key');
				user[key] = $('.edit_input',this).val();
			});
			//debugger;
			var url = that.module+'/customer!updateUser.action';
            $.ajax({
            	url:url,
               	type:'post',
				data:JSON.stringify({user:user}),
				contentType:'application/json',
                success:function(data){
                   if(data.msg == 'success'){
				   		that.user = data.user;
				   		
					 	$('*[user-data-key]',this.template).each(function(){
							$('.view_text',this).text($('.edit_input',this).val());
						});
					 	
						V.alert("客户用户信息保存成功!");
						$('.customer-edit .cancel',this.template).click();
				   }else if(data.msg="error"){
					   V.alert(data.info);
				   }
                }
            })
		});
		$('.address_group_view',this.template).click(function(){
			that.addAddress();
		})	
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
	                $('#userStartCode',that.template).val(data);
	            }
	        })
	    }
	 PluginClass.prototype.edit = function(view ,edit){
	 	var that = this;
	 	$(view+' .edit',this.template).click(function(){
			$(this).parents(view).hide();
			$(edit,that.template).show();
			$(this).parents('fieldset').removeClass('view').addClass('edit');
			
			//reset view text area.
			if(view=='.customer_group_view')
			$('*[customer-data-key]',that.template).each(function(){
                var key = $(this).attr('customer-data-key');
                var value = that.customer[key]||'';
                var type = $(this).attr('data-type');
                
                $('.edit_input',this).val(value);
                
                if(type=='select'){
					var selObj = $('select',this);
					selObj.val(value);
					$('.view_text',this).text(selObj.find('option:selected').text());
				}
            });
			if(LoginInfo.user.businessRole == LoginInfo.businessRole.ENTERPRISE){
				$('*[customer-data-key=businessType]',that.template).find('input[type=checkbox]').attr('disabled',false);	
			}else{
				//客户不可编辑的字段
				$('.controls[customer-data-key=code] .edit_input',that.template).attr('disabled',true);	
				$('.controls[customer-data-key=taxnNme] .edit_input',that.template).attr('disabled',true);
				$('.controls[customer-data-key=taxNo] .edit_input',that.template).attr('disabled',true);	
				$('.controls[customer-data-key=bank] .edit_input',that.template).attr('disabled',true);
				$('.controls[customer-data-key=account] .edit_input',that.template).attr('disabled',true);
				
				$('.controls[customer-data-key=isStatement] .edit_input',that.template).attr('disabled',true);
				$('.controls[customer-data-key=extractType]',that.template).find('input[type=checkbox]').attr('disabled',true);
				$('.controls[customer-data-key=settlePeriod] .edit_input',that.template).attr('disabled',true);
				$('.controls[customer-data-key=accreditationType] .edit_input',that.template).attr('disabled',true);
			}		
			if(view=='.customer-view')
		 	$('*[user-data-key]',this.template).each(function(){
				var key = $(this).attr('user-data-key');
				var value = that.user[key];
				$('.edit_input',this).val(value);
			});
		});
	 }
	 PluginClass.prototype.cancel = function(edit,view){
	 	var that = this;
	 	$(edit+' .cancel',this.template).click(function(){
			$(this).parents(edit).hide();
			$(view,that.template).show();
			$(this).parents('fieldset').removeClass('edit').addClass('view');
			//隐藏验证时，产生的信息框
			$('.error_msg').empty().hide();
			$('*[customer-data-key=businessType]',that.template).find('input[type=checkbox]').attr('disabled',true);
			$('*[customer-data-key=extractType]',that.template).find('input[type=checkbox]').attr('disabled',true);
		});
	 }
	 
	 PluginClass.prototype.initStep2 = function(platformNo){
	 	
	 }
	 PluginClass.prototype.initStep3 = function(){}
	 /**加载用户信息**/
	 PluginClass.prototype.initStep4 = function(){}
	 PluginClass.prototype.initStep5 = function(){}
	 
	//初始化获取地址
	PluginClass.prototype.getAddress = function(){
		var that = this;
		var container = $('.address_list',this.template).empty();
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
                    var html = $('<div><a class="remove" href="javascript:void(0);" title="删除"><i class="icon-remove"></i></a>\
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
                   {label:'地址',type:Form.TYPE.TEXT,name:'address',validator:'text(0,300)',required:true},
                   {label:'联系人',type:Form.TYPE.TEXT,name:'linkman',validator:'text(0,300)',required:true},
                   {label:'联系电话',type:Form.TYPE.TEXT,name:'telephone',validator:'mobile',required:true},
                   {label:'邮编',type:Form.TYPE.TEXT,name:'zipcode',validator:'zipCode',required:true},
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
		addDlg.init({title:'地址维护',height:350,width:700});
	}	
		 //form校验
	PluginClass.prototype.validate = function(name){
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
	//获取经营方式
    PluginClass.prototype.initBusinessType = function(context){
    	 var that = this;
         $.ajax({
             url:that.module+"/customer!listBusinessType.action",
             type:'post',
             data:{customerId:that.customer['id']},
             dataType:'json',
             success:function(data){
             	var dom = $('*[customer-data-key=businessType]',that.template);
             	var selected = that.customer.businessType||'';
             	selected = selected.split(',');
             	$.each(data,function(index,d){
             		var name = data[index].dictname;
             		var value = data[index].dictcode;
             		var flag = $.inArray(value,selected);
             		if(flag!=-1){
             			checkbox = '<input type="checkbox" value='+value +' checked disabled >&nbsp;';
             		}else{
             			checkbox = '<input type="checkbox" value='+value +' disabled >&nbsp;';
             		}
             		var item = '<span>'+ name + '</span>&nbsp;';
             		dom.append(checkbox).append(item);
             	})
             }
         })
    }
    PluginClass.prototype.addCrumb = function(){
		V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.crumbsName}});
	}
	})(V.Classes['v.views.backoffice.custom.CustomerEdit']);
},{plugins:["v.ui.step","v.ui.tree",'v.component.fileUpload',"v.views.backoffice.authority.postControlPoint","v.ui.grid","v.ui.dialog","v.component.form","v.views.component.authoritySetting","v.component.area"]});