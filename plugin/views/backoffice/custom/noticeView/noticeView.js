;V.registPlugin("v.views.backoffice.custom.noticeView",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.NoticeView",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.backoffice.custom.noticeView";
			this.notice = null;
			this.module = '';
			this.options = {};
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
							<form class="form-horizontal">\
							<div class="legend">\
								'+that.getLang("BIN_SYSTEM_NOTICE")+' </span>\
							</div>\
							<div class="control-group" style="margin-top: 10px">\
								<label class="control-label" for="input01">'+that.getLang("LABEL_TITLE")+'：</label>\
								<div class="controls" data-key="title">\
									<span class="input-view"></span>\
								</div>\
							</div>\
							<div class="control-group">\
								<label class="control-label" for="input01">'+that.getLang("TIP_SEND")+'：</label>\
								<div class="controls" data-key="sendType">\
									<span class="input-view"></span>\
								</div>\
							</div>\
							<div class="control-group" style="margin-top: 10px; display: none">\
								<label class="control-label" for="input01">'+that.getLang("TIP_ASSIGN_SEND")+'：</label>\
								<div class="controls" data-key="users">\
									<div class="well well-small designatedPersonContainers"></div>\
								</div>\
							</div>\
							<div class="control-group">\
								<label class="control-label" for="input01">'+that.getLang("LABEL_FORCE_READ")+'：</label>\
								<div class="controls" data-key="isCoercion">\
									<span class="input-view"></span>\
								</div>\
							</div>\
							<div class="control-group">\
								<label class="control-label" for="input01">'+that.getLang("LABEL_CONTENT")+'：</label>\
								<div class="controls" data-key="content">\
									<div class="input-view"></div>\
								</div>\
							</div>\
						</form>\
					</div>');
					that.container.append(that.template);
					that.initInfo();
					that.initEvent();
				}
			})
		}
		Notice.prototype.initEvent = function(){
			
		}
		Notice.prototype.initInfo = function(){
			var that = this;
			var designatedPerson = $('.designatedPersonContainers',that.template);
			$.ajax({
            	url:that.module+'/notice!input.action',
               	type:'post',
				data:{noticeId:this.notice.id},
                success:function(data){
                	var notice = that.notice = data;
					$('*[data-key]',that.template).each(function(){
						var key = $(this).attr('data-key');
						if(key == 'content'){
							$('.input-view',this).html(notice[key]||'');
						}else if(key == "users"){
							var users = notice.users||[];
							for(key in users){
			 					var item = $('<div class="item" style="margin:2px;padding:2px;"></div>');
			 					var link = $('<a href="javascript:void(0);">'+users[key]+'</a>');
			 					item.append(link)
			 					item.data('id',key);
			 					designatedPerson.append(item);
			 				}
						}else if(key == "isCoercion"){
							$('.input-view',this).text(notice[key]==1?that.getLang("LABEL_YES"):that.getLang("LABEL_NO"));
						}else if(key == "sendType"){
							var type = notice['sendType'];
							var text = '';
							if(type == 1){
								text = that.getLang("TIP_ALL");
							}else if(type == 2){
								text = that.getLang("TIP_BMW");
							}else if(type == 3){
								text = that.getLang("TIP_DEALER");
							}else {
								text = that.getLang("TIP_ASSIGN_SEND");
								designatedPerson.parent().parent().show();
							}
							$('.input-view',this).text(text);
						}else{
							$('.input-view',this).text(notice[key]||'');
						}
					});
		         	$('*[data-key=appendix]',that.template).parent().show();
		         	//that.initFileList();
                }
			});
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
                    {displayName:'文件名',key:'attachment',width:220}
                ]
            });
		}
		Notice.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("LABEL_TITLE_VIEW")}});
		}
		Notice.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("LABEL_TITLE_VIEW")}});
		}
	})(V.Classes['v.views.backoffice.custom.NoticeView'])
},{plugins:["v.ui.grid","v.ui.pagination"]});
