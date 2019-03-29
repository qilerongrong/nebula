;V.registPlugin("v.views.backoffice.custom.systeminfo.noticeList",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.systeminfo.NoticeList",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.backoffice.custom.systeminfo.noticeList";
			this.module = "";
			this.resource = {
			    html:'list.html',
			}
		}
	});
	(function(NoticeList){
		NoticeList.prototype.init = function(options){
			this.options = options;
			this.container = options.container;
			this.module = options.module;
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $('<div>\
						    <div class="filters">\
					        <div class="well form-search">\
						      <span class="span4"><label>\
						         <span>标题：</span> <input type="text"  name="title" data-key="title"/>\
						      </label></span>\
							  <span class="span4"><label >\
						       <span>发送时间：</span> <input type="text" class="datepicker" name="sendDate" data-key="sendDate"/>\
						      </label></span>\
							  <span class="span12" style="text-align: center">\
							  <button class="btn btn-inverse btn-search" >查询</button>\
							  </span>\
					    </div>\
					    </div>\
						<div class="list"></div>\
					</div>');
					that.container.append(that.template);
					//时间控件设置
					$('.datepicker',that.template).datepicker({dateFormat: "yy-mm-dd",showMonthAfterYear:true});
					
					that.initList();
					that.initEvent();
				}
			})
			
        };
        
        NoticeList.prototype.initEvent = function(options){
        	var that = this;
		   $('.filters .btn-search',this.template).click(function(){
				var filters = {notice:{}};
				$(':input[name]').each(function(){
					var name = $(this).attr('name');
					filters.notice[name] = $(this).val();
				})
				if(filters.notice['sendDate'] == null || filters.notice['sendDate'] == '') {
					filters.notice['sendDate'] = null;
				}
				that.list.filters = filters;
				that.list.retrieveData();
			})
		};
		NoticeList.prototype.initList = function(options){
			var list = this.list = new V.Classes['v.ui.Grid']();
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
            var that = this;
            list.init({
                container:$('.list',this.template),
                checkable:false,
				url:this.module+'/notice!list.action',
                columns:[
                    {displayName:'标题',key:'title',width:220}
                    ,{displayName:'发送时间',key:'sendDate',width:220}
                    ,{displayName:'操作',key:'action',width:50,render:function(record){
                    	if(record.status == 0) {
	                       var html = $('<div class="action"><a class="change" href="javascript:void(0);" title="修改"><i class="icon-edit"></i></a><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a><div>');
	                        $('.change',html).click(function(){
	                           that.editNotice(record);
	                        });
	                        $('.remove',html).click(function(){
	                        	that.removeNotice(record);
	                        });
	                        return html;
                        }
                    }}
                ],
                toolbar:[
			          {eventId:'add',text:'新增通知',icon:'icon-plus'}
				]
            });
            this.subscribe(list,'add',this.addNotice);
			this.subscribe(list,'remove',this.removeNotices);
            this.container.append(this.template);
        };
        
        NoticeList.prototype.removeNotice = function(record){
        	var that = this;
        	V.confirm('是否删除系统通知？',function(){
				$.ajax({
	            	url:that.module+'/notice!delete.action',
	               	type:'post',
					data:{noticeId:record.id},
	                success:function(data){
	                     if(data == 'success'){
	                     	 V.alert("系统通知删除成功!");
	                     	 that.list.removeRecord(record);
	                     	// that.forward("v.views.backoffice.custom.noticeList",that.options);
	                     }
	                     else{
	                     	V.alert(data);
	                     }
	                }
	            })
	        });    
        }
        
        
        NoticeList.prototype.editNotice = function(notice){
        	var options = {};
        	options.module = this.module;
        	options.notice = notice;
        	this.forward("v.views.backoffice.custom.notice",options,function(inst){
				inst.addCrumb();
			});
        }
        
       // 
        NoticeList.prototype.addNotice = function(){
        	var options = {};
        	options.module = this.module;
        	this.forward("v.views.backoffice.custom.notice",options,function(inst){
				inst.addCrumb();
			});
        }
       
	})(V.Classes['v.views.backoffice.custom.systeminfo.NoticeList'])
},{plugins:["v.ui.grid","v.ui.dialog","v.ui.pagination",'v.ui.alert']});
