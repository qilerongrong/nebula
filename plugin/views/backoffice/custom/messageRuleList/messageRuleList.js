;V.registPlugin("v.views.backoffice.custom.messageRuleList",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.MessageRuleList",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.backoffice.custom.messageRuleList";
			this.module = "";
			this.resource = {
			    html:'list.html'
			}
		}
	});
	(function(MessageRuleList){
		MessageRuleList.prototype.init = function(options){
			this.options = options;
			this.container = options.container;
			this.module = options.module;
			this.platformNo = options.platformNo||'';
			
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
        
        MessageRuleList.prototype.initEvent = function(options){
        	var that = this;
		   $('.filters .btn-search',this.template).click(function(){
				var filters = {notice:{}};
				/*$(':input[name]').each(function(){
					var name = $(this).attr('name');
					filters.notice[name] = $(this).val();
				})
				if(filters.notice['sendDate'] == null || filters.notice['sendDate'] == '') {
					filters.notice['sendDate'] = null;
				}*/
				that.list.filters = filters;
				that.list.retrieveData();
			})
		};
		MessageRuleList.prototype.initList = function(options){
			var list = this.list = new V.Classes['v.ui.Grid']();
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			list.setFilters({platformNo:this.platformNo});
            var that = this;
            list.init({
                container:$('.list',this.template),
                checkable:false,
				url:this.module+'/message-rule!list.action',
                columns:[
                    {displayName:'所用模版',key:'templateName',width:120,align:'center'},
                    {displayName:'功能模块',key:'moduleName',width:80,align:'center'},
                	{displayName:'系统表名',key:'entityName',width:80,align:'center'},
                	{displayName:'触发点',key:'controlName',width:60,align:'center'},
                	{displayName:'触发规则',key:'ruleDes',width:60,align:'center'},
                	{displayName:'发送消息',key:'isNotice',width:40,align:'center',render:function(record){
                		if(record.isNotice==true){
                			return '是';
                		}else{
                			return '否';
                		}
                	}},
                	{displayName:'发送邮件',key:'isEmail',width:40,align:'center',render:function(record){
                		if(record.isEmail==true){
                			return '是';
                		}else{
                			return '否';
                		}
                	}},
                   // ,{displayName:'发送短信',key:'isMessage',width:220},
                    {displayName:'操作',key:'action',width:40,render:function(record){
	                       var html = $('<div class="action"><a class="change" href="javascript:void(0);" title="修改"><i class="icon-edit"></i></a><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a><div>');
	                        $('.change',html).click(function(){
	                           that.editMessageRule(record);
	                        });
	                        $('.remove',html).click(function(){
	                        	that.removeMessageRule(record);
	                        });
	                        return html;
                    }}
                ],
                toolbar:[
			          {eventId:'add',text:'新增消息设置',icon:'icon-plus'}
				]
            });
            this.subscribe(list,'add',this.editMessageRule);
			this.subscribe(list,'remove',this.removeNotices);
            this.container.append(this.template);
        };
        
        MessageRuleList.prototype.removeMessageRule = function(record){
        	var that = this;
		    var info="确认要删除吗?";
			V.confirm(info,function(e){
				$.ajax({
	            	url:that.module+'/message-rule!delete.action',
	               	type:'post',
					data:{id:record.id},
	                success:function(data){
	                     if(data == 'success'){
	                     	 V.alert("删除成功!");
	                     	 that.list.removeRecord(record);
	                     }
	                }
	            })
			});
        }
        
        MessageRuleList.prototype.editMessageRule = function(messageRule){
        	var options = {};
			options.module = this.module;
			options.container = this.container;
        	options.messageRule = messageRule;
        	options.platformNo = this.platformNo;
        	this.forward("v.views.backoffice.custom.messageRuleEdit",options);
        }
        
        MessageRuleList.prototype.addMessageRule = function() {
        	var that = this;
			var url = this.module+'/message-rule!input.action';
            $.ajax({
            	url:url,
               	type:'POST',
				contentType:'json',
                success:function(data){
                     that.editMessageRule(data);
                }
            })
        }
	})(V.Classes['v.views.backoffice.custom.MessageRuleList'])
},{plugins:["v.ui.grid","v.ui.dialog","v.ui.pagination",'v.ui.alert']});
