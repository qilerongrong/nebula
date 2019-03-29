;V.registPlugin("v.views.backoffice.custom.contractTemplateList",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.ContractTemplateList",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.backoffice.custom.contractTemplateList";
			this.module = "";
			this.resource = {
			    html:'list.html'
			}
		}
	});
	(function(ContractTemplateList){
		ContractTemplateList.prototype.init = function(options){
		
			
			this.options = options;
			this.container = options.container;
			this.module = options.module;
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
        
        ContractTemplateList.prototype.initEvent = function(options){
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
		ContractTemplateList.prototype.initList = function(options){
			var list = this.list = new V.Classes['v.ui.Grid']();
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
            var that = this;
            list.init({
                container:$('.list',this.template),
                checkable:true,
				url:this.module+'/contract-template!list.action',
                columns:[
                	{displayName:'名称',key:'name',width:220}
                    ,{displayName:'标题',key:'title',width:220}
                    ,{displayName:'描述',key:'description',width:220}
                    ,{displayName:'操作',key:'action',width:50,render:function(record){
	                       var html = $('<div><a class="change" href="javascript:void(0);" title="修改"><i class="icon-edit"></i></a><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a><div>');
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
			          {eventId:'add',text:'新增邮件设置',icon:'icon-plus'}
				]
            });
            this.subscribe(list,'add',this.addEmailTemplate);
			this.subscribe(list,'remove',this.removeNotices);
            this.container.append(this.template);
        };
        
        ContractTemplateList.prototype.removeEmailTemplate = function(record){
        	var that = this;
		    var info="确认要删除吗?";
			V.confirm(info,function(e){
				
					$.ajax({
		            	url:that.module+'/contract-template!delete.action',
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
        
        
        ContractTemplateList.prototype.editEmailTemplate = function(contractTemplate){
        	this.options.contractTemplate = contractTemplate;
        	this.forward("v.views.backoffice.custom.contractTemplateEdit",this.options);
        }
        
        ContractTemplateList.prototype.addEmailTemplate = function() {
        	var that = this;
			var url = this.module+'/contract-template!input.action';
            $.ajax({
            	url:url,
               	type:'POST',
				data:JSON.stringify({id:null}),
				contentType:'application/json',
                success:function(data){
                     that.editEmailTemplate(data);
                }
            })
        }
        
       
	})(V.Classes['v.views.backoffice.custom.ContractTemplateList'])
},{plugins:["v.ui.grid","v.ui.dialog","v.ui.pagination",'v.ui.alert']});
