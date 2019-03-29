;V.registPlugin("v.views.application.applicant.delegate.delegateEdit",function(){
	V.Classes.create({
		className:"v.views.application.applicant.delegate.DelegateEdit",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.application.applicant.delegate.delegateEdit";
			this.delegate = null;
			this.state = 'edit';//view || edit;
			this.module = '';
			this.resource = {
				html:'template.html'
			}
		}
	});
	(function(Plugin){
        Plugin.prototype.init = function(options){
			this.container = options.container;
			this.module = options.module;
			this.delegate = options.delegate || {};
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					var dom1 = '<div class="role">\
						<form class="form-horizontal v-form">\
							<fieldset class="edit">\
								<div class="legend">\
									'+that.getLang("CRUMB_PROXY_CONFIGURE")+'<span class="btn-group group_view" style="float: right;display: none;"><a\
										class="btn btn-success  btn-mini edit" href="javascript:void(0);"><i\
											class="icon-white icon-edit"></i> '+that.getLang("BTN_EDIT")+'</a></span> <span\
										class="btn-group group_edit" style="float: right; "><a\
										class="btn save btn-success btn-mini" href="javascript:void(0);"><i\
											class="icon-check icon-white"></i> '+that.getLang("BTN_SAVE")+'</a><a\
										class="btn cancel btn-danger  btn-mini" href="javascript:void(0);"><i\
											class="icon-remove icon-white"></i> '+that.getLang("BTN_CANCEL")+'</a></span>\
								</div>\
								<div class="row-fluid">\
									<div class="control-group span6" id="password" >\
										<label class="control-label" for="input01"><span\
											style="color: red">*</span>'+that.getLang("LABEL_START_TIME")+'</label>\
										<div class="controls" data-key="startTime">\
											<input type="text"  class="datepicker" name="startTime" id="startTime" >\
											<p class="view_text"></p>\
											<p class="error_msg"></p>\
										</div>\
									</div>\
									<div class="control-group span6" id="password2">\
										<label class="control-label" for="input01"><span\
											style="color: red">*</span>'+that.getLang("LABEL_END_TIME")+'</label>\
										<div class="controls" data-key="endTime">\
											<input type="text" class="datepicker"  name="endTime" \
												id="endTime" data-validator="text(0,40)"\
												data-required="true">\
											<p class="view_text"></p>\
											<p class="error_msg"></p>\
										</div>\
									</div>\
								</div>\
								<div class="row-fluid">\
									<div class="control-group span6">\
										<label class="control-label" for="input01">'+that.getLang("LABEL_DELEGATE_PERSON")+'</label>\
										<div class="controls" data-key="delegate">\
											<input type="text" readonly  id="delegate">&nbsp;&nbsp;<a\
										class="btn btn-mini btn-success view_delegate"\
										href="javascript:void(0);"><i class="icon-white icon-search"></i>\
											'+that.getLang("LABEL_SELETED")+'</a>\
											<p class="view_text"></p>\
											<p class="error_msg"></p>\
										</div>\
									</div>\
									<div class="control-group span6">\
										<label class="control-label" for="input01"></label>\
										<input type="hidden" id="delegateName">\
									</div>\
								</div>\
								<div class="row-fluid">\
									<div class="control-group span6">\
										<label class="control-label" for="input01">'+that.getLang("LABEL_IS_START")+'</label>\
										<div class="controls" data-key="enabled">\
											<input type="radio" name="enabled" class="input-xlarge edit_input" id="input01"\
												value="N">'+that.getLang("LABEL_FORBID")+'\
											<input type="radio" name="enabled" class="input-xlarge edit_input" id="input01"\
												value="Y" checked>'+that.getLang("LABEL_START")+'\
											<p class="view_text"></p>\
											<p class="error_msg"></p>\
										</div>\
									</div>\
									<div class="control-group span6">\
										<label class="control-label" for="input01"></label>\
									</div>\
								</div>\
							</fieldset>\
						</form>\
						<form class="form-horizontal">\
							<fieldset id="workflow">\
								<div class="legend">\
									'+that.getLang("LABEL_MANAGER")+'<span class="btn-group view" style="float: right"><a\
										class="btn btn-mini btn-success view_workflow"\
										href="javascript:void(0);"><i class="icon-white icon-search"></i>\
											'+that.getLang("LABEL_PROCESS")+'</a></span>\
								</div>\
								<div class="control-group">\
									<div class="workflowlist"></div>\
								</div>\
							</fieldset>\
						</form>\
					</div>';
					that.template = $(dom1);
					that.container.append(that.template);
					that.initEvent();
//					if(that.delegate['id'] == null){
//						$("#workflow",that.container).hide();
//						$('form',that.template).removeClass('view').addClass('edit');
//						$('.group_view',that.template).hide();
//						$('.group_edit',that.template).show();
//					} 
					if (that.delegate['id'] != null) {
						 $('#startTime',that.template).val(that.delegate['startTime']);
						 $('#endTime',that.template).val(that.delegate['endTime']);
						 $('input:radio:checked',that.template).val(that.delegate['enabled']);
						 $('#owner',that.template).val(that.delegate['owner']);
						 $('#ownerName',that.template).val(that.delegate['ownerName']);
						 $('#delegate',that.template).val(that.delegate['delegate']);
						 $('#delegateName',that.template).val(that.delegate['delegateName']);
						 
					}
				}
			})
		}
		Plugin.prototype.initEvent = function(){
			var that = this;
			$('.datepicker',this.template).datepicker({
		         dateFormat: "yy-mm-dd",
				 showMonthAfterYear:true,
				 changeMonth: true,
	             changeYear: true
	          });
			$('.group_view .edit',this.template).click(function(){
				$(this).parents('.group_view').hide();
				$('.group_edit',that.template).show();
				$(this).parents('form').removeClass('view').addClass('edit');
				that.resetViewText();
			});
			$('.group_edit .save',this.template).click(function(){
				var delegate = that.delegate;
				that.saveDelegate(delegate);
			});
			$('.group_edit .cancel',this.template).click(function(){
				if(that.delegate.id==null){
					var options = {};
					options.module = that.module;
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
//			$('.view_owner',this.template).click(function(){
//				that.ownerUser();
//			});
			$('.view_delegate',this.template).click(function(){
				that.delegateUser();
			});
			that.getWorkFlow();
			$('.view_workflow',this.template).click(function(){
				that.addWorkflow();
			});
			
			/**设置验证**/
			$('*[data-validator]',this.template).keyup(function(e){
				var v = this.value;
				var rules = $(this).attr('data-validator');
				var required = $(this).attr('data-required')||'false';
				if(required=='true'&&v==""){
					$(this).parent().find('.error_msg').text(that.getLang("MSG_CONNT_NULL")).show();
					return false;
				}
				var msg = Validator.validate(rules,v);
				if(msg){
					$(this).parent().find('.error_msg').text(msg).show();
				}else{
					$(this).parent().find('.error_msg').empty().hide();
				}
			})
			
		}
		Plugin.prototype.saveDelegate = function(delegate){
			var that = this;
			
			//form校验
			if(that.validate()==false) return;
			delegate['startTime'] = $('#startTime',that.template).val();
			delegate['endTime'] = $('#endTime',that.template).val();
			delegate['enabled'] = $('input:radio:checked',that.template).val();
			var url = that.module+'/delegate!save.action';
	            $.ajax({
	            	url:url,
	               	type:'post',
					data:JSON.stringify({delegate:delegate}),
					contentType:'application/json',
	                success:function(data){
	                     if(data){
	                    	that.delegate=data;
							V.alert("success!");
//							$('.group_edit',that.template).hide();
//							$('.group_view',that.template).show();
	                     }
	                }
	            })
		}
		
		Plugin.prototype.getWorkFlow = function(){
			var that = this;
			var container = $('.workflowlist',this.template).empty();
			var grid = this.workflowGrid = new V.Classes['v.ui.Grid']();
			if (this.delegate != null) {
				grid.setFilters({nodeKey:this.delegate.nodeKey});
			}
			grid.init({
				container:container,
				url:this.module+'/delegate!workflow.action',
				columns:[
                    {displayName:this.getLang("LIST_WORK_FLOW_KEY"),key:'workflowKey',width:320}
                    ,{displayName:this.getLang("LIST_WORK_FLOW_NAME"),key:'workflowName',width:320}
                ]
			});
		}
		
		Plugin.prototype.addWorkflow = function(){
			var that = this;
			var tempPost = $("<div></div>");
			var list = this.list = new V.Classes['v.ui.Grid']();
			//var pagination = new V.Classes['v.ui.Pagination']();
			//list.setPagination(pagination);
			list.init({
	                container:tempPost,
	                checkable:true,
					url:this.module+'/delegate!queryWf.action',
	                columns:[
	                    {displayName:this.getLang("LIST_WORK_FLOW_KEY"),key:'workflowKey',width:280}
	                    ,{displayName:this.getLang("LIST_WORK_FLOW_NAME"),key:'workflowName',width:280}
						]
					 });
					 
//			this.subscribe(list,list.EVENT.DATA_RETRIEVED,function(){
//				//处理列表中出现的记录，在弹出窗口选中
//				var postGridData = that.postGrid.options.data||'';
//				var tempData = list.options.data;
//				$.each(postGridData,function(index,dom){
//					var id = postGridData[index].id;
//					$.each(tempData,function(tIndex,tDom){
//						if(id==tempData[tIndex].id)
//							tempData[tIndex]['checked'] = true;
//					});
//				});
//			});
					 
			/**Dialog**/
			var addDlg = new V.Classes['v.ui.Dialog']();
			addDlg.setBtnsBar({btns:[{text:this.getLang("BTN_ACCREDIT"),style:"btn-primary",handler:function(){
				var delegate = that.delegate;
				if (!delegate['id']) {
					V.alert(that.getLang("MSG_FIRST_SAVE"));
					return;
				}
				var selected = list.getCheckedRecords();
				var selected_array = '';
				for (var i = 0; i < selected.length; i++){
					 selected_array = selected_array+selected[i].workflowKey+".*;";
				};
				selected_array = selected_array.substring(0,selected_array.length-1);
				  $.ajax({
	            	url:that.module+'/delegate!saveWf.action',
	               	type:'post',
					data: {nodeKey: selected_array,delegateId:delegate['id']},
	                success:function(data){
	                	if(data=='success'){
						  	addDlg.close();
						  	that.workflowGrid.setFilters({nodeKey:selected_array});
						  	that.workflowGrid.refresh();
						}else{
							V.alert(data);
						}	
	                }
	            })
				
			}},{text:this.getLang("BTN_CANCEL"),handler:addDlg.close}]});
			addDlg.init({title:this.getLang("TITLE_FLOW_LIST"),height:492,width:660});
			addDlg.setContent(tempPost);
		}
		
	
		//自己定义的form验证
		Plugin.prototype.validate = function(){
			var isValid = true;
			var that = this;
			$('*[data-validator]:visible',this.template).each(function(){
				var required = $(this).attr('data-required')||false;
				var rules = $(this).attr('data-validator')||'';
				var v = $(this).val();
				if(required=="true"&&v==""){
						$(this).parent().find('.error_msg').text(that.getLang("MSG_CONNT_NULL")).show();
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
		
		Plugin.prototype.delegateUser = function(){
			var that = this;
			/**Grid**/
			var tempPost = $("<div></div>");
			var list = this.list = new V.Classes['v.ui.Grid']();
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			list.setFilters({flag:'ENTERPRISE'});
			list.init({
	                container:tempPost,
	                checkable:false,
					url:'common!listuser.action',
	                columns:[
	                    {displayName:this.getLang("LIST_USER_CODE"),key:'userCode',width:280,render:function(record){
							var html = $('<a href="javascript:void(0);"></a>');
							html.text(record.userCode);
							html.click(function(){
								//that.choose(record);
								$('#delegate',that.template).val(record.userCode);
								that.delegate['delegateName'] = record.userName;
								that.delegate['delegate'] = record.userCode;
								addDlg.close();
							});
							return html;
						}}
	                    ,{displayName:this.getLang("LIST_USER_NAME"),key:'userName',width:280}
						]
					 });
					 
			/**Dialog**/
			var addDlg = new V.Classes['v.ui.Dialog']();
			addDlg.setBtnsBar({btns:[{text:this.getLang("BTN_CANCEL"),handler:addDlg.close}]});
			addDlg.init({title:this.getLang("TITLE_USER_LIST"),height:492,width:660});
			/**将Grid中的数据加入到Dialog中**/
			addDlg.setContent(tempPost);
		}
		
//		Plugin.prototype.ownerUser = function(){
//			var that = this;
//			/**Grid**/
//			var tempPost = $("<div></div>");
//			var list = this.list = new V.Classes['v.ui.Grid']();
//			var pagination = new V.Classes['v.ui.Pagination']();
//			list.setPagination(pagination);
//			list.init({
//	                container:tempPost,
//	                checkable:true,
//					url:'common!listuser.action',
//	                columns:[
//	                    {displayName:'用户编码',key:'userCode',width:280,render:function(record){
//							var html = $('<a href="javascript:void(0);"></a>');
//							html.text(record.userCode);
//							html.click(function(){
//								//that.choose(record);
//								$('#owner',that.template).val(record.userCode);
//								that.delegate['ownerName'] = record.userName;
//								that.delegate['owner'] = record.userCode;
//								addDlg.close();
//							});
//							return html;
//						}}
//	                    ,{displayName:'用户名称',key:'userName',width:280}
//						]
//					 });
//					 
//			/**Dialog**/
//			var addDlg = new V.Classes['v.ui.Dialog']();
//			addDlg.setBtnsBar({btns:[{text:"取消",handler:addDlg.close}]});
//			addDlg.init({title:'用户列表',height:492,width:660});
//			/**将Grid中的数据加入到Dialog中**/
//			addDlg.setContent(tempPost);
//		}
		
		Plugin.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_PROXY_CONFIGURE")}});
		}
		Plugin.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_PROXY_CONFIGURE")}});
		}
	})(V.Classes['v.views.application.applicant.delegate.DelegateEdit'])
},{plugins:["v.ui.grid","v.ui.pagination","v.ui.dialog",'v.ui.alert','v.fn.validator']});