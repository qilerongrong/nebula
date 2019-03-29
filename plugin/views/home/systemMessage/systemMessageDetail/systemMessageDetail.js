;V.registPlugin("v.views.home.systemMessage.systemMessageDetail",function(){
	V.Classes.create({
		className:"v.views.home.systemMessage.SystemMessageDetail",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.views.home.systemMessage.systemMessageDetail';
            this.resource = {
    			html:'template.html'
    		}
		}
	});
	(function(SystemMessageDetail){
		SystemMessageDetail.prototype.init = function(options){
			for(opt in options){
				this[opt] = options[opt];
			}
			
			var that = this;
			var id = options.id;
			var noticeId = options.noticeId;
			var isHaveAttach = options.isHaveAttach;
			var isBack = options.isBack;
			
			$.ajax({
				url:this.getPath()+"/assets/"+this.resource.html,
				dataType:'html',
				success:function(dom){
					that.template = $('<div class="noticeCustom">\
							<form  class="form-horizontal">\
						    <div class="noticeHeader" style="text-align:center;height:50px">\
						    	<span class="title" style="font-size:20px;"></span>\
						    	<div class="list_toolbar" style="float:right">\
						    		<a href="#javascript:void(0);" title="'+that.getLang("TIP_DOWNLOAD")+'" class="download"><i class="icon-tools icon-download"></i></a>\
						    		<a href="#javascript:void(0);" title="'+that.getLang("TIP_BACK")+'" class="back"><i class="icon-tools icon-back"></i></a>\
						    	</div>\
						    </div>\
						    <div style="text-align:right">\
						    	<span>'+that.getLang("LABEL_SEND")+'：</span><span class="sender" style="margin-right:20px"></span>\
						    	<span>'+that.getLang("LABEL_SEND_TIME")+'：</span><span class="sendDate"></span>\
					    	</div>\
						    <div class="noticeContent well well-small" style="margin-top:20px;overflow:hidden">\
						    </div>\
						</form>\
					</div>');
					$(that.container).append(that.template);
				
					if(isHaveAttach==false){
						$('.download',that.template).hide();
					}
					if(isBack==false){
						$('.back',that.template).hide();
					}
					
					$.ajax({
						url: 'backoffice/console/systeminfo/user-notice!input.action',
						data:{id:id, noticeId:noticeId},
						dataType:'json',
						success:function(data){
							$('.title',that.template).html(data.title);
							$('.sender',that.template).html(data.sendName);
							$('.sendDate',that.template).html(data.sendDate);
							$('.noticeContent',that.template).html(data.content);
							$('.download',that.template).click(function(){
								that.download(data.noticeId);
							});
							$('.back',that.template).click(function(){
								that.forward('v.views.home.systemMessage',that.options);
							});
						}
					});
					
					if(isHaveAttach){
						that.getFileLists(noticeId);
					}
				}
			})
			//that.addCrumb();
		}
		SystemMessageDetail.prototype.reload = function(options){
			var that = this;
			this.container.empty();
			var id = options.id;
			var noticeId = options.noticeId;
			var isHaveAttach = options.isHaveAttach;
			var isBack = options.isBack;
			
			$.ajax({
				url:this.getPath()+"/assets/"+this.resource.html,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					$(that.container).append(that.template);
					
					if(isHaveAttach==false){
						$('.download',that.template).hide();
					}
					if(isBack==false){
						$('.back',that.template).hide();
					}
					
					$.ajax({
						url: 'backoffice/console/systeminfo/user-notice!input.action',
						data:{id:id, noticeId:noticeId},
						dataType:'json',
						success:function(data){
							$('.title',that.template).html(data.title);
							$('.sender',that.template).html(data.sender);
							$('.sendDate',that.template).html(data.sendDate);
							$('.noticeContent',that.template).html(data.content);
							
							$('.download',that.template).click(function(){
								that.download(data.noticeId);
							});
							$('.back',that.template).click(function(){
								that.forward('v.views.home.systemMessage',that.options);
							});
						}
					});
					
					if(isHaveAttach){
						that.getFileLists(noticeId);
					}
				}
			})
		}
		SystemMessageDetail.prototype.getFileLists = function(noticeId){
			var that = this;
			$.ajax({
				url: 'backoffice/console/systeminfo/user-notice!getAllAttachment.action',
				data:{noticeId:noticeId},
				dataType:'json',
				success:function(data){
					var fileLists = $('.fileLists',that.template).empty();
					var ul = $('<ol></ol>');
					ul.css({'list-style':'decimal','margin-left':'50px'});
					$.each(data,function(){
						var li = $('<li>'+this.attachment+'</li>');
						ul.append(li);
					})
					fileLists.append(ul);
				}
			});
		}
		SystemMessageDetail.prototype.download = function(noticeId){
			var that = this;
			var info=this.getLang("MSG_CONFIRM_DOWMLOAD");
			V.confirm(info,function ok(e){
				window.location.href="backoffice/console/systeminfo/user-notice!downLoadAttchment.action?noticeId="+noticeId;
			});
		}
		SystemMessageDetail.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("TIP_CONTENT")}});
		}
	})(V.Classes['v.views.home.systemMessage.SystemMessageDetail']);
},{plugins:[]});