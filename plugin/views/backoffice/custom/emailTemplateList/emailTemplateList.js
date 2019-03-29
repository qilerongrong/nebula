;V.registPlugin("v.views.backoffice.custom.emailTemplateList",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.EmailTemplateList",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.backoffice.custom.emailTemplateList";
			this.module = "";
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.Grid']();
			this.resource = {
			    html:'list.html',
			}
		}
	});
	(function(EmailTemplateList){
		EmailTemplateList.prototype.init = function(options){
			this.options = options;
			this.container = options.container;
			this.module = options.module;
			this.platformNo = options.platformNo;
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					that.initList();
					//that.initEvent();
				}
			})
        };
        
        EmailTemplateList.prototype.initEvent = function(options){
        	var that = this;
		   $('.filters .btn-search',this.template).click(function(){
				var filters = {notice:{}};
//				$(':input[name]').each(function(){
//					var name = $(this).attr('name');
//					filters.notice[name] = $(this).val();
//				})
//				if(filters.notice['sendDate'] == null || filters.notice['sendDate'] == '') {
//					filters.notice['sendDate'] = null;
//				}
				that.list.filters = filters;
				that.list.retrieveData();
			})
		};
		EmailTemplateList.prototype.initList = function(options){
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			list.setFilters({platformNo:this.platformNo});
            var that = this;
            list.init({
                container:$('.list',this.template),
                checkable:false,
				url:this.module+'/email-template!list.action',
                columns:[
                	{displayName:'名称',key:'name',width:220},
                	{displayName:'标题',key:'title',width:220},
                	{displayName:'描述',key:'description',width:220},
                	{displayName:'业务模块',key:'moduleName',width:60},
                	{displayName:'业务单据',key:'entityName',width:80},
                	{displayName:'操作',key:'action',width:50,render:function(record){
	                       var html = $('<div class="action"><a class="change" href="javascript:void(0);" title="修改"><i class="icon-edit"></i></a><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a><div>');
	                        $('.change',html).click(function(){
	                           that.editEmailTemplate(record);
	                        });
	                        $('.remove',html).click(function(){
	                        	that.removeEmailTemplate(record);
	                        });
	                        return html;
                    }}
                ],
                toolbar:[
			          {eventId:'add',text:'新增消息模板',icon:'icon-plus'}
				]
            });
            this.subscribe(list,'add',this.addEmailTemplate);
			this.subscribe(list,'remove',this.removeNotices);
            this.container.append(this.template);
        };
        
        EmailTemplateList.prototype.removeEmailTemplate = function(record){
        	var that = this;
		    var info="确认要删除吗?";
			V.confirm(info,function(e){
					$.ajax({
		            	url:that.module+'/email-template!delete.action',
		               	type:'post',
						data:{id:record.id},
		                success:function(data){
		                     if(data == 'success'){
		                     	 V.alert("删除成功!");
		                     	 V.MessageBus.publish({eventId:'v.views.backoffice.custom.emailTemplate.changed',data:''});
		                     	 that.list.removeRecord(record);
		                     }
		                }
		            })
			});
        }
        
        EmailTemplateList.prototype.editEmailTemplate = function(emailTemplate){
        	this.options.emailTemplate = emailTemplate;
        	this.options.platformNo = this.platformNo;
        	this.forward("v.views.backoffice.custom.emailTemplateEdit",this.options);
        }
        
        EmailTemplateList.prototype.getTicketsType = function(moduleCode){
			var that = this;
		     $.ajax({
			 	url:this.module+'/email-template!init.action',
				dataType:'json',
				contentType:'json',
				data:{moduleCode:moduleCode,platformNo:this.platformNo},
				success:function(tickets){
					tickets = tickets||[];
					$('#entityType',that.tempDlgCxt).empty();
					$.each(tickets,function(index){
						var opt = $('<option>'+this.name+'</option>').data('record',this);
						opt.attr('value',this.value);
						$('#entityType',that.tempDlgCxt).append(opt);
					});
                    $('#entityType',that.tempDlgCxt).change();
				}
			 }) ;
		};
        
        //新增
        EmailTemplateList.prototype.addEmailTemplate = function() {
        	var that = this;
        	var tempDlgCxt = this.tempDlgCxt = $('<div>\
        			<div style="margin-top:20px">选择模块：<select id="moduleCode" class="input-medium"></select></div>\
                     <div>单据类型：<select id="entityType" class="input-medium"></select><select class="isDetail input-small"><option value="M">主表</option><option value="D">从表</option></select></div>\
           					</div>');
		     $.ajax({
			 	url:this.module+'/email-template!queryModule.action',
				dataType:'json',
				contentType:'json',
				success:function(systemModules){
					systemModules = systemModules||[];
					$.each(systemModules,function(index){
						var opt = $('<option>'+this.moduleName+'</option>');
						opt.attr('value',this.moduleCode);
						$('#moduleCode',tempDlgCxt).append(opt);
						if(index == 0){
							that.getTicketsType(this.moduleCode);
						}
					})
				}
			 }) ;
		 	//选择模块
			$('#moduleCode',tempDlgCxt).change(function(){
				var type = this.value;
				that.getTicketsType(type);
			});
            //选择单据
            $('#entityType',tempDlgCxt).change(function(){
                  var entity = $(':selected',this).data('record');
                  if(entity.hasDetail){
                      $(this).next().show();
                  }else{
                      $(this).next ().hide();
                  }
            });
            $('.type',tempDlgCxt).click(function(){
            	var val = $('input:radio[name="type"]:checked').val();
            	if(val == '1'){
            		$('.template',tempDlgCxt).hide();
            	} else {
            		$('.template',tempDlgCxt).show();
            	}
            })
			var addDlg = new V.Classes['v.ui.Dialog']();
			addDlg.setBtnsBar({btns:[{text:"创建",style:"btn-primary",handler:function(){
            	var entityType = $('#entityType',tempDlgCxt).val();
            	var moduleType = $('#moduleCode',tempDlgCxt).val();
                var level = $('.isDetail',tempDlgCxt).val();
	            $.ajax({
	            	url:that.module+'/email-template!input.action',
	               	type:'POST',
					contentType:'json',
					data:{platform:that.platform},
	                success:function(data){
	                	data['entityType'] = entityType;
	                	data['moduleCode'] = moduleType;
						data['entityLevel'] = level;
	                    that.editEmailTemplate(data);
	                }
	            })
               
				//关闭
				addDlg.close();
			}},{text:"取消",handler:addDlg.close}]});
			addDlg.init({title:'创建消息模板',height:300,width:400});
			addDlg.setContent(tempDlgCxt);
        }
        
       
	})(V.Classes['v.views.backoffice.custom.EmailTemplateList'])
},{plugins:["v.ui.grid","v.ui.dialog",'v.ui.fckeditor',"v.ui.pagination",'v.ui.alert']});
