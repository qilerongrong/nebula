;V.registPlugin("v.views.pages.userNotices",function(){
	V.Classes.create({
		className:"v.views.pages.UserNotices",
		superClass:"v.Plugin",
		init: function(){
			this.ns = 'v.views.pages.userNotices';
			this.template = $('<div></div>');
			this.options = {
			};
			this.userNotice = {};
			this.userNoticeOptions = [];
			this.userNoticeOptionsIndex = 0;
		}
	});
	(function(UserNotices){
		UserNotices.prototype.init = function(options){
			this.alertUserNotice();
		}
		UserNotices.prototype.initEvent = function(){
			
		}
		UserNotices.prototype.alertUserNotice = function(){
			var that = this;
			var userNotice = this.userNotice = new V.Classes['v.views.home.systemMessage.SystemMessageDetail']();
			
        	var template = $('<div></div>');
        	var url = 'backoffice/console/systeminfo/user-notice!spelList.action';
        	$.ajax({
            	url:url,
               	type:'POST',
               	data:{},
                success:function(data){
                	var result = data.result;
                	var isCoercionLength = 0;
                	var userNoticeOptions = that.userNoticeOptions = [];
                	
                	$.each(result,function(i){
                		if(!this.isCoercion){
                			return true;
                		}
                		isCoercionLength = isCoercionLength + 1;
                		var options = {};
                		options.noticeId =  this.noticeId;
            			options.id =  this.id;
            			options.isHaveAttach = this.isHaveAttach;
            			options.container = template;
            			options.isBack = false;
            			userNoticeOptions.push(options);
                	});
                	
                	if(isCoercionLength==0) return;
                	
                	userNotice.init(userNoticeOptions[0]);
                	
                	var dlg = new V.Classes['v.ui.Dialog']();
                	dlg.setBtnsBar({btns:[
                	    {text:that.getLang("BIN_PREVIOUS"),style:"btn-primary prevRecord",handler:function(){
                	    	if(that.userNoticeOptionsIndex==0){
                	    		return;
                	    	}
                	    	that.userNoticeOptionsIndex = that.userNoticeOptionsIndex-1; 
                	    	userNotice.reload(that.userNoticeOptions[that.userNoticeOptionsIndex]);
                	    	$('.nextRecord',dlg.template).show();
                	    	if(that.userNoticeOptionsIndex==0){
        						$('.prevRecord',dlg.template).hide();
        					}
        				}}
        				,{text:that.getLang("BIN_NEXT"),style:"btn nextRecord",handler:function(){
        					if(that.userNoticeOptionsIndex==isCoercionLength-1){
        						return;
        					}
        					that.userNoticeOptionsIndex = that.userNoticeOptionsIndex+1;
        					userNotice.reload(that.userNoticeOptions[that.userNoticeOptionsIndex]);
        					$('.prevRecord',dlg.template).show();
        					if(that.userNoticeOptionsIndex==isCoercionLength-1){
        						$('.nextRecord',dlg.template).hide();
        					}
        				}}
        	           ]});
                	dlg.setContent(template);
                	dlg.init({width:800,height:500,title:that.getLang("BIN_NOTICE")});
                	$('.prevRecord',dlg.template).hide();
                	if(isCoercionLength==1)
                		$('.nextRecord',dlg.template).hide();	
                }
            })
        }
	})(V.Classes['v.views.pages.UserNotices']);
},{plugins:["v.ui.dialog","v.views.home.systemMessage.systemMessageDetail"]})