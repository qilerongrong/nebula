;V.registPlugin("v.views.home.bussinessMessage.bussinessMessageDetail",function(){
	V.Classes.create({
		className:"v.views.home.bussinessMessage.BussinessMessageDetail",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.views.home.bussinessMessage.bussinessMessageDetail';
            this.resource = {
    			html:'template.html'
    		}
		}
	});
	(function(bussinessMessageDetail){
		bussinessMessageDetail.prototype.init = function(options){
			for(opt in options){
				this[opt] = options[opt];
			}
			var that = this;
			var id = options.id;
			var isBack = options.isBack;
			$.ajax({
				url:this.getPath()+"/assets/"+this.resource.html,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					$(that.container).append(that.template);
					if(isBack==false){
						$('.back',that.template).hide();
					}
					$.ajax({
						url: 'backoffice/console/bussinessinfo/user-business-info!input.action',
						data:{id:id},
						dataType:'json',
						success:function(data){
							$('.title',that.template).html(data.title);
							$('.sendDate',that.template).html(data.sendDate);
							$('.noticeContent',that.template).html(data.content);
							$('.back',that.template).click(function(){
								that.forward('v.views.home.bussinessMessage',that.options);
							});
						}
					});
				}
			})
			//that.addCrumb();
		}
		bussinessMessageDetail.prototype.reload = function(options){
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
					if(isBack==false){
						$('.back',that.template).hide();
					}
					$.ajax({
						url: 'backoffice/console/bussinessinfo/user-business-info!input.action',
						data:{id:id, noticeId:noticeId},
						dataType:'json',
						success:function(data){
							$('.title',that.template).html(data.title);
							$('.sender',that.template).html(data.sender);
							$('.sendDate',that.template).html(data.sendDate);
							$('.noticeContent',that.template).html(data.content);
							$('.back',that.template).click(function(){
								that.forward('v.views.home.bussinessMessage',that.options);
							});
						}
					});
				}
			})
		}
		bussinessMessageDetail.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'通知内容'}});
		}
	})(V.Classes['v.views.home.bussinessMessage.BussinessMessageDetail']);
},{plugins:[]});