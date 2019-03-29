;V.registPlugin("v.views.backoffice.authority.user",function(){
	V.Classes.create({
		className:"v.views.backoffice.authority.User",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.backoffice.authority.user";
			this.user = null;
			this.state = 'view';//view || edit;
			this.module = '';
			this.crumbName = '用户编辑';
			this.resource = {
				html:'template.html'
			}
		}
	});
	(function(User){
        User.prototype.init = function(options){
			this.container = options.container;
			this.module = options.module;
			this.user = options.user || null;
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
//			alert(url);
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					that.initEvent();
					that.initInfo();
					//that.addCrumb();
					if(that.user['id'] == null){
						$("#post",that.container).hide();
						$('form',that.template).removeClass('view').addClass('edit');
						$('.group_view',that.template).hide();
						$('.group_edit',that.template).show();
						
						if(LoginInfo.user.userType!=CONSTANT.USER_TYPE.MAINTEMNCE){
							that.getUserHeader();
						}
					} else {
						$("#businessRole",that.container).attr("disabled","disabled");
						if (that.user.businessRole == CONSTANT.BUSINESS_ROLE.CUSTOMER){
							$("#partnerCode",that.container).show();
							//$("#partyCode",that.container).hide();
							$("#selectorDealer",that.container).hide();
							$("#dealerCode",that.container).attr("disabled","disabled");
						} else {
							$("#partnerCode",that.container).hide();
						}
					}
				}
			})
		}
		User.prototype.initEvent = function(){
			var that = this;
			$('.group_view .edit',this.template).click(function(){
				$(this).parents('.group_view').hide();
				$('.group_edit',that.template).show();
				$(this).parents('form').removeClass('view').addClass('edit');
				that.resetViewText();
			});
			$('.group_edit .save',this.template).click(function(){
				var user = that.user;
				that.saveUser(user);
			});
			$('.group_edit .cancel',this.template).click(function(){
				if(that.user.id==null){
					var options = {};
					options.module = that.module;
					//that.forward('v.views.backoffice.authority.userList',options);
					V.MessageBus.publish({eventId:'backCrumb'});
				}
				else{
					$(this).parents('.group_edit').hide();
					$('.group_view',that.template).show();
					$(this).parents('form').removeClass('edit').addClass('view');
					//隐藏验证时，产生的信息框
					$('.error_msg').empty().hide();
				}
			});
			that.getPosts();
			$('.view_roles',this.template).click(function(){
				that.addPost();
			});
			
			/**设置验证**/
			$('*[data-validator]',this.template).keyup(function(e){
				var v = this.value;
				var rules = $(this).attr('data-validator');
				var required = $(this).attr('data-required')||'false';
				if(required=='true'&&v==""){
					$(this).parent().find('.error_msg').text("不能为空！").show();
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
				var msg = 'The password and confirm password is not the same, please input again';
				if($('#inputPassword').val()!=$('#inputPassword2').val()){
					$(this).parent().find('.error_msg').text(msg).show();
				}else{
					$(this).parent().find('.error_msg').empty().hide();
				}
			});
			
			$('#businessRole',this.template).change(function(){
				if ($('#businessRole',this.template).val() == 'CUSTOMER') {
					$('#partnerCode',this.template).show();
					//$('#partyCode',this.template).hide();
				} else {
					$('#partnerCode',this.template).hide();
					//$('#partyCode',this.template).show();
				}
			});
			$('.view_dealer',this.template).click(function(){
				that.addDealer();
			});
		}
		User.prototype.saveUser = function(user){
			var that = this;
			var flag = false;
			if(user['id'] == null){
				flag = true;
				
//				var userCodeDom = $('*[data-key=loginName]',that.template).find('input');
				
//				var reg = new RegExp('^'+userCodeDom.data('userHeader')+'[0-9a-zA-Z]+$');
//				if(!reg.test(userCodeDom.val())){
//					V.alert('用户登录名必须以'+userCodeDom.data('userHeader')+'开头！');
//					return;
//				}
			}
			//form校验
			if(that.validate()==false) return;
			$('*[data-key]',that.template).each(function(){
				var key = $(this).attr('data-key');
				if(!flag && key != 'userCode' && key != 'password' && key != 'password2'){
					user[key] = $('.edit_input',this).val();
				}
				if(flag && key != 'password2'){
					user[key] = $('.edit_input',this).val();
				}
			});
			user.password=hex_sha1(user.password);
			user['posts'] = null;
			var url = this.module+'/user!save.action';
			//V.confirm('是否保存用户信息？',function(){
	            $.ajax({
	            	url:url,
	               	type:'post',
					data:JSON.stringify({user:user}),
					contentType:'application/json',
	                success:function(data){
	                     if(data == 'modify'){
							V.alert("保存成功!");
							$('*[data-key]',that.template).each(function(){
								var key = $(this).attr('data-key');
								if(key == 'userCode'){
									$('.edit_input',this).attr('disabled','');
									$('#password').css({"display":"none"});
									$('#password2').css({"display":"none"});
								}
								var value = user[key];
								$('.view_text',this).text(value);
								$('.edit_input',this).val(value);
								var type = $(this).attr('data-type');
								if(type=='select'){
									//处理下拉框初始化数据
									var selObj = $('select',this);
									selObj.val(value);
									$('.view_text',this).text(selObj.find('option:selected').text());
								}
							});
							$('form',that.template).removeClass('edit').addClass('view');
							$('.group_edit',that.template).hide();
							$('.group_view',that.template).show();
	                     }else if(data != null && data['id'] != null){
	                     	user['id'] = data['id'];
	                     	$('*[data-key]',that.template).each(function(){
								var key = $(this).attr('data-key');
								if(key == 'userCode'){
									$('.edit_input',this).attr('disabled','');
									$('#password').css({"display":"none"});
									$('#password2').css({"display":"none"});
								}
								var value = user[key];
								$('.view_text',this).text(value);
								$('.edit_input',this).val(value);
								var type = $(this).attr('data-type');
								if(type=='select'){
									//处理下拉框初始化数据
									var selObj = $('select',this);
									selObj.val(value);
									$('.view_text',this).text(selObj.find('option:selected').text());
								}
							});
							V.alert("保存成功！");
							$('form',that.template).removeClass('edit').addClass('view');
							$('.group_edit',that.template).hide();
							$('.group_view',that.template).show();
							$("#post").show();
	                     }else if(data.msg == 'error'){
	                     	V.alert(data.info);
	                     }else{
	                     	V.alert(data);
	                     }
	                }
	            })
	        //});    
		}
		User.prototype.initInfo = function(){
			var user = this.user;
			var flag = false;
			if(user['id'] == null){
				flag = true;
				this.crumbName = 'Create';
				$('*[data-key=admin]',this.template).find('option').each(function(){
					if(this.value==0 || this.value==1){
						$(this).remove();
					}
				});
			}
			else{
				$('*[data-key=admin]',this.template).find('select').attr('disabled',true);
			}
			
			$('*[data-key]',this.template).each(function(){
				var key = $(this).attr('data-key');
				var value = user[key];
				var type = $(this).attr('data-type');
				$('.view_text',this).text(value);
				$('.edit_input',this).val(value);
				if(type=='select'){
					//处理下拉框初始化数据
					var selObj = $('select',this);
					selObj.val(value);
					$('.view_text',this).text(selObj.find('option:selected').text());
				}
				if(flag && key == 'userCode'){
					$('.edit_input',this).removeAttr('disabled');
					$('#password').css({"display":"block"});
					$('#password2').css({"display":"block"});
				}
			});
			$('#input001',this.template).datepicker({
		         dateFormat: "yy-mm-dd",
				 showMonthAfterYear:true,
				 changeMonth: true,
	             changeYear: true
	          });
		}
		User.prototype.resetViewText = function(){
			var user = this.user;
			$('*[data-key]',this.template).each(function(){
				var key = $(this).attr('data-key');
				var value = user[key];
				var type = $(this).attr('data-type');
				$('.edit_input',this).val(value);
				if(type=='select'){
					var selObj = $('select',this);
					selObj.val(value);
					$('.view_text',this).text(selObj.find('option:selected').text());
				}
			});
		}
		User.prototype.getPosts = function(){
			var that = this;
			var container = $('.postlist',this.template).empty();
			var grid = this.postGrid = new V.Classes['v.ui.Grid']();
			//update chenhaijun
			if (this.user.id != null) {
				grid.setFilters({user:{id:this.user.id}});
			}
			grid.init({
				container:container,
				url:this.module+'/user!postList.action',
				columns:[
                    {displayName:'编码',key:'code',width:120}
                    ,{displayName:'名称',key:'name',width:120}
                    ,{displayName:'区域',key:'domain',width:120}
                    ,{displayName:'操作',key:'action',width:120,render:function(record){
                        var html = $('<div><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a><div>');
                        $('.remove',html).click(function(){
                        	V.confirm('确认删除?',function(){
	                            $.ajax({
					            	url:that.module+'/user!delUserPost.action',
					               	type:'post',
									data: {userId:that.user['id'],postId:record['id']},
					                success:function(data){
					                	if(data.msg=='success'){
					                      	grid.removeRecord(record);
					                	}else{
					                    	V.alert(data.info);
					                    }  	
					                }
					            })
				            })
                        });
                        return html;
                    }}
                ]
			});
		}
		//添加岗位
		User.prototype.addPost = function(){
			var that = this;
			/**Grid**/
			var tempPost = $("<div></div>");
			var list = this.list = new V.Classes['v.ui.Grid']();
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			list.init({
	                container:tempPost,
	                checkable:true,
					url:this.module+'/user!post.action',
	                columns:[
	                    {displayName:'岗位编码',key:'code',width:200}
	                    ,{displayName:'岗位名称',key:'name',width:200}
	                    ,{displayName:'区域',key:'domain',width:150}
						]
					 });
					 
			this.subscribe(list,list.EVENT.DATA_RETRIEVED,function(){
				//处理列表中出现的记录，在弹出窗口选中
				var postGridData = that.postGrid.options.data||'';
				var tempData = list.options.data;
				$.each(postGridData,function(index,dom){
					var id = postGridData[index].id;
					$.each(tempData,function(tIndex,tDom){
						if(id==tempData[tIndex].id)
							tempData[tIndex]['checked'] = true;
					});
				});
			});
					 
			/**Dialog**/
			var addDlg = new V.Classes['v.ui.Dialog']();
			addDlg.setBtnsBar({btns:[{text:"授权",style:"btn-primary",handler:function(){
				var selected = list.getCheckedRecords();
				var selected_array = [];
				for (var i = 0; i < selected.length; i++){
					 selected_array[i] = selected[i].id;
				};
				var user = that.user;
				  $.ajax({
	            	url:that.module+'/user!saveupost.action',
	               	type:'post',
					data: {postCodes: selected_array.join(','),id:user['id']},
	                success:function(data){
	                	if(data.msg=='success'){
						  	addDlg.close();
						  	that.postGrid.setFilters({user:{id:that.user.id}});
						  	that.postGrid.refresh();
						}else{
							V.alert(data.info);
						}	
	                }
	            })
				
			}},{text:"取消",handler:addDlg.close}]});
			addDlg.init({title:'岗位列表',height:492,width:660});
			/**将Grid中的数据加入到Dialog中**/
			addDlg.setContent(tempPost);
		}
		//get dealer list
		User.prototype.addDealer = function(){
			var that = this;
			/**Grid**/
			var template = $('<div class="v-search"><div class="list_toolbar"></div><div class="filters"><div class="well form-search"></div></div><div class="list"></div></div>');
			var btn_search = $('<button class="btn btn-primary btn-search">Query</button>');
			var btn_reset = $('<button class="btn btn-reset">Reset</button>');
			btn_search.click(function(){
				if(!form.validate()) return;
				list.setFilters(form.getValues());
				list.retrieveData();
			});
			btn_reset.click(function(){
				form.reset();
			});
			var form = new V.Classes["v.component.Form"](); 
			var Form = V.Classes['v.component.Form'];
			var items = [
				       {label:"Dealer code",type:Form.TYPE.TEXT,name:'code',value:''},
				       {label:"Dealer name",type:Form.TYPE.TEXT,name:'name',value:''}
				];
			form.init({
				container:$('.form-search',template),
				colspan:2,
				items:items
			});
			$('.form-search',template).append($('<div class="row-fluid btns" style="text-align:center"></div>').append(btn_search).append(btn_reset));
			
			var list = this.list = new V.Classes['v.ui.Grid']();
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setFilters(form.getValues());
			list.setPagination(pagination);
			list.init({
	                container:template,
	                checkable:true,
					url:'common!store.action',
	                columns:[
	                    {displayName:'Dealer name',key:'name',width:280,render:function(record){
							var html = $('<a href="javascript:void(0);"></a>');
							html.text(record.name);
							html.click(function(){
								//that.choose(record);
								$('#dealerCode',that.template).val(record.code);
								addDlg.close();
							});
							return html;
						}}
	                    ,{displayName:'Dealer code',key:'code',width:280}
						]
					 });
					 
			/**Dialog**/
			var addDlg = new V.Classes['v.ui.Dialog']();
			addDlg.setBtnsBar({btns:[{text:"Cancel",handler:addDlg.close}]});
			addDlg.init({title:'Dealer list',height:545,width:720});
			/**将Grid中的数据加入到Dialog中**/
			addDlg.setContent(template);
		}
		
		//获取用户编码首字母
		User.prototype.getUserHeader = function(record,context){
            var that = this;
            var url = 'common!getUserHeader.action';
            $.ajax({
                url:url,
                type:'post',
                dataType:'text',
                success:function(data){
                    $('*[data-key=loginName]',that.template).find('input').data('userHeader',data).val(data);
                }
            })
        }
		//自己定义的form验证
		User.prototype.validate = function(){
			var isValid = true;
			$('*[data-validator]:visible',this.template).each(function(){
				var required = $(this).attr('data-required')||false;
				var rules = $(this).attr('data-validator')||'';
				var v = $(this).val();
				if(required=="true"&&v==""){
						$(this).parent().find('.error_msg').text("不能为空！").show();
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
			var msg = 'The password and confirm password is not the same, please input again.';
			if($('#inputPassword').is(":visible") && $('#inputPassword').val()==''){
				isValid = false;
			}
			else if($('#inputPassword').is(":visible") && $('#inputPassword').val()!=$('#inputPassword2').val()){
				$('#inputPassword2').parent().find('.error_msg').text(msg).show();
				isValid = false;
			}else{
				$('#inputPassword2').parent().find('.error_msg').empty().hide();
			}
			return isValid;
		}
		User.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.crumbName}});
		}
	})(V.Classes['v.views.backoffice.authority.User'])
},{plugins:["v.ui.grid","v.ui.pagination","v.ui.dialog",'v.ui.alert','v.fn.validator']});
