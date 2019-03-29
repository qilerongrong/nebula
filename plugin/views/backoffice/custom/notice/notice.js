;V.registPlugin("v.views.backoffice.custom.notice",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.Notice",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.backoffice.custom.notice";
			this.notice = null;
			this.state = 'view';//view || edit;
			this.module = '';
			this.resource = {
				html:'template.html'
			}
		}
	});
	(function(Notice){
        Notice.prototype.init = function(options){
        	this.module = options.module;
			this.container = options.container;
			this.notice = options.notice || null;
			this.ckeditIns = null;
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $('<div class="noticeCustom">\
							<form  class="form-horizontal">\
						    <div class="legend">\
						    	'+that.getLang("BIN_SYSTEM_NOTICE")+'\
								<span class="group_edit" style="float:right;">\
								<a class="btn btn-danger  btn-mini init" href="javascript:void(0);">\
								<i class="icon-share icon-white"></i> '+that.getLang("TIP_SAVE")+'</a>\
								<a class="btn btn-danger  btn-mini storage" style="margin-right:10px;display:none" href="javascript:void(0);">\
								<i class="icon-share icon-white"></i> '+that.getLang("TIP_TEMP")+'</a>\
								<a class="btn btn-success btn-mini save" style="margin-right:10px;display:none" href="javascript:void(0);">\
								<i class="icon-check icon-white"></i> '+that.getLang("TIP_SEND")+'</a>\
								</span>\
					        </div>\
					        <div class="control-group" style="margin-top:10px">\
						      <label class="control-label" for="input01"><span style="color:red">*</span>'+that.getLang("LABEL_TITLE")+'：</label>\
						      <div class="controls" data-key="code">\
						      	<input type="text" id="title" class="input-xlarge  edit_input"  name="title"  data-validator="text(0,200)" data-required="true"/>\
								<p class="error_msg" style="color:red"></p>\
						      </div>\
						    </div>\
					        <div class="control-group">\
						      <label class="control-label" for="input01"><span style="color:red">*</span>'+that.getLang("TIP_SEND")+'：</label>\
						      <div class="controls" data-key="code">\
						      	<select id="sendType" name="sendType">\
								  	<option value="1">'+that.getLang("TIP_ALL")+'</option>\
								  	<option value="4">'+that.getLang("TIP_ASSIGN_SEND")+'</option>\
								  </select>\
								  <a class="btn btn-success  btn-mini search" href="javascript:void(0);"><i class="icon-search icon-white"></i> '+that.getLang("TIP_SEARCH_USER")+'</a>\
								  <a class="btn btn-success  btn-mini empty" href="javascript:void(0);"><i class="icon-remove icon-white"></i> '+that.getLang("TIP_CLEAR")+'</a>\
						      </div>\
						    </div>\
						    <div class="control-group" style="margin-top:10px;display:none">\
						      <label class="control-label" for="input01"><span style="color:red">*</span>'+that.getLang("TIP_ASSIGN")+'：</label>\
						      <div class="controls" data-key="designatedPerson">\
						      	<div class="well well-small designatedPersonContainers" style="max-height:100px;overflow:auto;">\
						      	</div>\
						      </div>\
						    </div>\
						    <div class="control-group">\
						      <label class="control-label" for="input01"><span style="color:red">*</span>'+that.getLang("LABEL_FORCE_READ")+'：</label>\
						      <div class="controls" data-key="isForceRead">\
						      	<select id="isCoercion" name="isCoercion">\
								  	<option value="false">'+that.getLang("LABEL_NO")+'</option>\
								  	<option value="true">'+that.getLang("LABEL_YES")+'</option>\
								  </select>\
						      </div>\
						    </div>\
						    <div class="control-group">\
						      <label class="control-label" for="input01"><span style="color:red">*</span>'+that.getLang("LABEL_CONTENT")+'：</label>\
						      <div class="controls" data-key="code">\
						      	<textarea id="noticeContent" data-key="content" name="content" rows="5" cols="80"  data-validator="" data-required="true"></textarea>\
								<p class="error_msg" style="color:red"></p>\
						      </div>\
						    </div>\
						</form>\
					</div>');
					that.container.append(that.template);
					$('#noticeContent',that.template).hide();
					for(i in CKEDITOR.instances){
						if( CKEDITOR.instances[i] ){ 
						    CKEDITOR.remove(CKEDITOR.instances[i]); 
						}
					}
					//ckedit实例初始化
					that.ckeditIns = CKEDITOR.replace('noticeContent',{
						toolbar :
		    			[
		    				['NewPage','-','Undo','Redo'],
		    				['Find','Replace','-','SelectAll','RemoveFormat'],
		    				['Link', 'Unlink'],
		    				['TextColor','FontSize', 'Bold', 'Italic','Underline'],
		    				['NumberedList','BulletedList','-','Blockquote']
		    			]
					});
					that.ckeditIns.setData(that.notice?that.notice.content:'');
					that.initInfo();
					that.initEvent();
				}
			})
		}
		Notice.prototype.initEvent = function(){
			var that = this;
			/**设置验证**/
			$('*[data-validator]',this.template).keyup(function(e){
				var v = this.value;
				if(this.id=='noticeContent')
					v = that.ckeditIns.getData();
					
				var rules = $(this).attr('data-validator');
				var required = $(this).attr('data-required')||false;
				
				if(required&&v==""){
					$(this).next('.error_msg').text(that.getLang("MSG_REMIND_EMPTY")).show();
					return false;
				}
				var msg = Validator.validate(rules,v);
				if(msg){
					$(this).next('.error_msg').text(msg).show();
				}else{
					$(this).next('.error_msg').empty().hide();
				}
			})
			
			//发送
			$('.save',this.template).click(function(){
				if(!that.validate()) return;
				var notice = that.notice;
				if(notice == null) {
					notice = {};
				}
				notice.title = $("#title").val();
				notice.sendType = $("#sendType").val();
				notice.content =that.ckeditIns.getData();
				
				if(notice.sendType==4){
					var items = $('*[data-key=designatedPerson]',that.template).find('.item');
					if(items.length==0){
						V.alert(that.getLang("MSG_ASSIGN_SEND"));
						return false;
					}
					var designatedUsers = [];
					$.each(items,function(){
						designatedUsers.push($(this).data('id'));
					})
					designatedUsers = designatedUsers.join(',');
					notice.designatedUsers = designatedUsers;
				}
				
				if(that.ckeditIns.getData()=='' || $("#title").val()=='') return false;
				
				V.confirm(that.getLang("CONFIRM_SEND_NOTICE"),function(){
					$.ajax({
		            	url:that.module+'/notice!save.action',
		               	type:'post',
						data:JSON.stringify({notice:notice}),
						contentType:'application/json',
		                success:function(data){
		                     if(data.msg == 'success'){
		                     	 V.alert(that.getLang("MSG_SAVE_SUCCESS"));
		                     	 V.MessageBus.publish({eventId:'backCrumb'});
		                     	 //that.forward("v.views.backoffice.custom.systeminfo",that.options);
		                     }else{
		                    	 V.alert(data.info);
		                     }
		                }
		            })
		        });
			})
			//保存
			$('.init',this.template).click(function(){
				if(!that.validate()) return;
				var notice = that.notice;
				if(notice == null) {
					notice = {};
				}
				notice.title = $("#title").val();
				notice.sendType = $("#sendType").val();
				notice.content = that.ckeditIns.getData();
				notice.isCoercion = $("#isCoercion").val();
				if(notice.sendType==4){
					var items = $('*[data-key=designatedPerson]',that.template).find('.item');
					if(items.length==0){
						V.alert(that.getLang("MSG_ASSIGN_SEND"));
						return false;
					}
					var designatedUsers = [];
					$.each(items,function(){
						designatedUsers.push($(this).data('id'));
					})
					designatedUsers = designatedUsers.join(',');
					notice.designatedUsers = designatedUsers;
				}
				if(that.ckeditIns.getData()=='' || $("#title").val()=='') return false;
				V.confirm(that.getLang("CONFIRM_SAVE_NOTICE"),function(){
					$.ajax({
		            	url:that.module+'/notice!storage.action',
		               	type:'post',
						data:JSON.stringify({notice:notice}),
						contentType:'application/json',
		                success:function(data){
		                     if(data.msg != 'fail'){
		                     	V.alert(that.getLang("MSG_SAVE_SUCCESS"));
		                     	that.notice=data;
		                     	$('.init',this.template).hide();
		                     	$('.save',this.template).show();
		                     	$('.storage',this.template).show();
		                     	//$('#attach',this.template).show();
		                     	//that.initFileList();
		                     }
		                     else{
		                    	 V.alert(data);
		                     }
		                }
		            })
		        });    
			});
			//暂存
			$('.storage',this.template).click(function(){
				if(!that.validate()) return;
				var notice = that.notice;
				if(notice == null) {
					notice = {};
				}
				notice.title = $("#title").val();
				notice.sendType = $("#sendType").val();
				notice.content = that.ckeditIns.getData();
				notice.isCoercion = $("#isCoercion").val();
				if(notice.sendType==4){
					var items = $('*[data-key=designatedPerson]',that.template).find('.item');
					if(items.length==0){
						V.alert(that.getLang("MSG_ASSIGN_SEND"));
						return false;
					}
					var designatedUsers = [];
					$.each(items,function(){
						designatedUsers.push($(this).data('id'));
					})
					designatedUsers = designatedUsers.join(',');
					notice.designatedUsers = designatedUsers;
				}
				
				if(that.ckeditIns.getData()=='' || $("#title").val()=='') return false;
				V.confirm(that.getLang("CONFIRM_TEMP_NOTICE"),function(){
					$.ajax({
		            	url:that.module+'/notice!storage.action',
		               	type:'post',
						data:JSON.stringify({notice:notice}),
						contentType:'application/json',
		                success:function(data){
		                     if(data.msg != 'fail'){
		                     	V.alert(that.getLang("MSG_SAVE_SUCCESS"));
		                     	//that.forward('v.views.backoffice.custom.systeminfo',that.options);
		                     	V.MessageBus.publish({eventId:'backCrumb'});
		                     }else{
		                    	 V.alert(data);
		                     }
		                }
		            })
		        });    
			})
			//查询人员
			$('.search',this.template).click(function(){
				that.queryUsers();
			});
			$('.empty',this.template).click(function(){
				$('.designatedPersonContainers',this.template).empty();
			});
			$('select[name=sendType]',that.template).change(function(){
				if($(this).val()==4){
					$('*[data-key=designatedPerson]',that.template).parent().show();
					$('.search',that.template).show();
					$('.empty',that.template).show();
				}
				else{
					$('*[data-key=designatedPerson]',that.template).parent().hide();
					$('.search',that.template).hide();
					$('.empty',that.template).hide();
				}
			}).change();
			
			$('.uploadFile',that.template).click(function(){
				that.uploadFile();
			});
		}
		Notice.prototype.getFilters = function(form){
        	var that = this;
        	var filters = {};
            var Form = V.Classes['v.component.Form'];
            $.each(form.options.items,function(){
		   	    if(this.type == Form.TYPE.PLUGIN){
		   	    	
				}else{
					filters[this.name] = $(':input[name='+this.name+']',form.template).val()||'';
				}
		   })
		   return filters;
        }
		Notice.prototype.queryUsers = function(){
			var that = this;
			var dlg = new V.Classes['v.ui.Dialog']();
            
			var template = $('<div class="v-search"><div class="list_toolbar"></div><div class="filters"><div class="well form-search"></div></div><div class="list"></div></div>');
			var btn_search = $('<button class="btn btn-primary btn-search">'+that.getLang("TIP_QUERY")+'</button>');
			var btn_reset = $('<button class="btn btn-reset">'+that.getLang("TIP_RESET")+'</button>');
			btn_search.click(function(){
				if(!form.validate()) return;
			    var filters = that.getFilters(form);
				list.setFilters(filters);
				list.retrieveData();
			});
			btn_reset.click(function(){
				form.reset();
			});
			
			var form = new V.Classes["v.component.Form"](); 
			var Form = V.Classes['v.component.Form'];
				var items = [
					       {label:that.getLang("LABEL_USER_CODE"),type:Form.TYPE.TEXT,name:'userCode',value:''},
					       {label:that.getLang("LABEL_USER_NAME"),type:Form.TYPE.TEXT,name:'userName',value:''}
					];
			form.init({
				container:$('.form-search',template),
				colspan:2,
				items:items
			});
			$('.form-search',template).append($('<div class="row-fluid btns" style="text-align:center"></div>').append(btn_search).append(btn_reset));
			
			var list = that.userList = new V.Classes['v.ui.Grid']();
            var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			list.setFilters({});
            list.init({
            	container:$('.list',template),
                checkable:true,
                hasAllChecked:true,
                primaryKey:'id',
				url:that.module+'/notice!getAllUser.action',
                columns:[
                    {displayName:that.getLang("LABEL_USER_CODE"),key:'userCode',width:120}
                    ,{displayName:that.getLang("LABEL_USER_NAME"),key:'userName',width:120}
                ]
            });
            
            dlg.setBtnsBar({btns:[
				{text:that.getLang("BIN_CONFIRM"),style:"btn-primary",handler:function(){
					that.addUserList();
					dlg.close();
				}}
				,{text:that.getLang("BIN_CLOSE"),style:"btn",handler:dlg.close}
             ]});
            dlg.setContent(template);
            dlg.init({width:660,height:480,title:that.getLang("LABEL_USER_LIST")});
		}
		//判断container包含item
		Notice.prototype.isContain = function(container,item){
			var key = $(item).data('id');
			var items = $(container).find('.item');
			var flag = false;
			$.each(items,function(){
				if($(this).data('id')==key){
					flag = true;
					return false;
				}
			});
			return flag;
		}
		//用户列表，添加
		Notice.prototype.addUserList = function(){
			var that = this;
			var selected = this.userList.getCheckedKeys();
			if(selected == "all"){
				var filters = this.userList.filters;
				if(filters.page!=undefined){
					delete filters.page;
				}
				V.ajax({
					url:this.module+'/notice!retrieveUserList.action',
					data:{filterList:filters},
					success:function(users){
						that.addUsers(users);
					}
				})
			}else if(selected.length == 0){
				V.alert(that.getLang("LABEL_SELECT_USER"));
				return;
			}else{
				this.addUsers(selected);
			}
		}
		Notice.prototype.addUsers = function(users){
			var designatedPerson = $('.designatedPersonContainers',this.template);
			var that = this;
			$.each(users,function(){
				var item = $('<div class="item" style="margin:2px;padding:2px;"></div>');
				var link = $('<a>'+this.userName+'</a>');
				var span = $('<a class="remove" href="javascript:void(0);" style="margin:0 8px;" title='+that.getLang("TIP_DELETE")+'><i class="icon-remove"></i></a>');
				item.append(link).append(span);
				item.data('id',this.userCode);
				if(that.isContain(designatedPerson,item)){
					return true;
				}
				designatedPerson.append(item);
				
				span.click(function(){
					$(this).parent().remove();
				});
			})
		}
		Notice.prototype.initInfo = function(){
			var that = this;
			if(this.notice&&this.notice.id!=null){
				$.ajax({
	            	url:that.module+'/notice!input.action',
	               	type:'post',
					data:{noticeId:this.notice.id},
	                success:function(data){
	                    var notice = this.notice = data;
	                    $('#title').val(notice.title);
	     				$('#noticeContent').val(notice.content);
	     				$('#sendType').val(notice.sendType);
	     				$('#sendType').change();
	     				$("#isCoercion").val(notice.isCoercion+'');
	     				
	     				var designatedPerson = $('.designatedPersonContainers',that.template);
	     				var users = notice.users||'';
	     				for(key in users){
	     					var item = $('<div class="item" style="margin:2px;padding:2px;"></div>');
	     					var link = $('<a>'+users[key]+'</a>');
	     					var span = $('<a class="remove" href="javascript:void(0);" style="margin:0 8px;" title='+that.getLang("TIP_DELETE")+'><i class="icon-remove"></i></a>');
	     					item.append(link).append(span);
	     					item.data('id',key);
	     					if(that.isContain(designatedPerson,item)){
	     						return true;
	     					}
	     					designatedPerson.append(item);
	     					
	     					span.click(function(){
	     						$(this).parent().remove();
	     					})
	     				}
	     				$('.save',that.template).show();
                     	$('*[data-key=appendix]',that.template).parent().show();
                     	//that.initFileList();
	                }
	            })
	            $('.init',this.template).hide();
				$('.storage',this.template).show();
				$('.save',this.template).show();
			}else{
				$('.init',this.template).show();
				$('.storage',this.template).hide();
				$('.save',this.template).hide();
			}
		}
		//初始化文件列表
		Notice.prototype.initFileList = function(){
			var that = this;
        	var list = that.fileList = new V.Classes["v.ui.Grid"]();
			list.setFilters({noticeId:this.notice.id});
			
            list.init({
                container:$('.fileList',that.template),
                checkable:false,
				url:this.module+'/notice!getAllAttachment.action',
                columns:[
                    {displayName:that.getLang("LABEL_FILE_NAME"),key:'attachment',width:220}
                    ,{displayName:that.getLang("BIN_ACTION"),key:'action',width:50,render:function(record){
                        var html = $('<div class="action"><a class="remove" href="javascript:void(0);" title='+that.getLang("TIP_DELETE")+'><i class="icon-remove"></i></a><div>');
                        $('.remove',html).click(function(){
                        	that.removeNoticeFiles(record);
                        });
                        return html;
                    }}
                ]
            });
		}
		Notice.prototype.removeNoticeFiles = function(record){
			var that = this;
			$.ajax({
            	url:that.module+'/notice!delAttachment.action',
               	type:'post',
				data:{attachmentId:record.id},
                success:function(data){
                     if(data.msg == 'success'){
                     	 V.alert(that.getLang("MSG_DELETE_SUCCESS"));
                     	 that.fileList.removeRecord(record);
                     }else{
                     	V.alert(data);
                     }
                }
            })
		}
		Notice.prototype.uploadFile = function(){
			var upload = new V.Classes['v.component.FileUpload']();
			var that = this;
			var noticeId = this.notice.id||'';
			upload.init({
				title : that.getLang("BIN_UPLOAD"),
				uploadSetting:{
					url:'attribUpload?fileType=noticeFile&contractCode='+noticeId,
					complete:function(){
						that.fileList.refresh();
					}
				}
			});
		}
		//自己定义的form验证
		Notice.prototype.validate = function(){
			var that = this;
			var isValid = true;
			$('*[data-validator]',this.template).each(function(){
				var required = $(this).attr('data-required')||false;
				var rules = $(this).attr('data-validator')||'';
				var v = $(this).val();
				if(this.id=='noticeContent')
					v = that.ckeditIns.getData();
				if(required=="true"&&v==""){
						$(this).parent().find('.error_msg').text(that.getLang("MSG_REMIND_EMPTY")).show();
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
		Notice.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("LABEL_SYSTEM_NOTICE")}});
		}
		Notice.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("LABEL_SYSTEM_NOTICE")}});
		}
	})(V.Classes['v.views.backoffice.custom.Notice'])
},{plugins:["v.ui.grid","v.ui.pagination","v.ui.dialog","v.fn.validator",'v.ui.alert','v.ui.fckeditor','v.component.fileUpload']});
