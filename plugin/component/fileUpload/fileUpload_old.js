;V.registPlugin("v.component.fileUpload",function(){
    V.Classes.create({
        className:"v.component.FileUpload",
		superClass:"v.ui.Dialog",
        init:function(UploadDialog){
            this.ns = 'v.component.fileUpload';
			this.uploader = new V.Classes['v.ui.FileUpload']();
			this.options.width = 500;
			this.options.height = 360;
			this.options.typeList = [];
			this.options.uploadSetting = {
				url : '',
				//fileType:'*',//[]
				maxSize:'6',//MB
				params:'',
				uploadSuccess:null,
				uploadError:null,
				uploadComplete:null
			}
        }
    });
    (function(UploadDialog){
		UploadDialog.prototype.init = function(options){
			var that =this;
			var con = $('<div class="file_upload_dlg"><div><span>如果在上传文件时遇到问题，请安装最新的Adobe Flash Player。下载地址：<br/>http://get.adobe.com/cn/flashplayer/<br/><br/><br/></span></div><div class="upload_top"><span id="swf_placeholder"></span><span class="type" style="display:none;float:right">'+this.getLang("TIP_FILE_TYPE")+'<select class="input-medium"></select></span></div><ul class="file_list"></ul></div>');
			this.setContent(con);
			this.setBtnsBar({
				position:'center',
				btns:[
				   {text:this.getLang("BTN_UPLOAD"),style:'btn-primary',handler:function(){
				   	   that.upload();
					}} 
				    ,{text:this.getLang("BTN_CLOSE"),handler:function(){
						this.close();
					}}
			    ]
			});
			UploadDialog.superclass.init.call(this,options);
			if(this.options.typeList.length > 0){
				$.each(this.options.typeList,function(){
					var opt = $('<option value="'+this.type+'">'+this.text+'</option>');
					$('.type select',con).append(opt);
					$('.type',con).show();
				})
			}else{
				$('.type',con).hide();
			}
			var setting = options.uploadSetting;
			var sessionId = $.cookie('JSESSIONID');
			if(!sessionId){
				sessionId = LoginInfo.sessionId;
			}
			//setting.url += ';jsessionid='+sessionId;
			if(!setting.params){
				setting.params = {};
			}
			//setting.params.jsessionid = sessionId;
			var index = setting.url.indexOf('?');
			if(index!=-1){
				setting.url = setting.url.substring(0,index)+';jsessionid='+sessionId+setting.url.substring(index,setting.url.length);
			}else{
				setting.url += ';jsessionid='+sessionId;
			}
			setting.width = '100';
			setting.height = '28';
			setting.placeholderId = 'swf_placeholder';
			setting.displayText = this.getLang("MSG_BROWSE");
			setting.textStyle = 'text-decoration:underline';
			//setting.bgImg = '';
			setting.fileQueuedHandler = function(file){
				var name = file.name;
				var li = $('<li><span>'+name+'</span><span class="btn_queue_cancel" style="float:right;cursor:pointer;margin-left:10px">&#215;</span><span class="upload_status"></span></li>');
				$('.file_list',that.template).append(li);
				$('.btn_queue_cancel',li).click(function(){
					V.confirm("确定取消上传该文件？",function(){
						var trigger_error_event = (file.filestatus == -2)
						that.uploader.cancelUpload(file.id,trigger_error_event);
						li.remove();
					});
				})
			}
			setting.uploadProgress = function(file, bytes, total){
				var index = file.index;
				var percent = Math.ceil((bytes / total) * 100);
			    $('.file_list li:eq('+index+') .bar',that.template).css('width',percent+'%');
				$('.file_list li:eq('+index+') .upload_status',that.template).text(that.getLang("MSG_UPLOADED")+percent+'%');
			}
			setting.uploadStartHandler = function(file){
				var index = file.index;
				$('.file_list li:eq('+index+')',that.template).append('<div class="progress progress-striped active"><div class="bar" style="width: 0%;"></div></div>');
			}
			var _success_handler = this.options.uploadSetting.uploadSuccess;
			setting.uploadSuccess = function(file, serverData, response){
				var index = file.index;
				$('.file_list li:eq('+index+') .progress',that.template).hide();
				_success_handler&&_success_handler(file, serverData, response);
//				that.close();
			}
			setting.queueCompleteHandler = options.uploadSetting.complete;
			this.uploader.init(setting);
		};
		UploadDialog.prototype.close = function(){
			this.uploader.destroy();
			UploadDialog.superclass.close.call(this);
		}
		UploadDialog.prototype.upload = function(){
			if(this.options.typeList.length > 0){
				var type = $('.type option:selected',this.template).text();
				//var 
				this.uploader.swfu.addPostParam('type',type);
			}
			this.uploader.upload();
		}
    })(V.Classes['v.component.FileUpload'])
},{plugins:['v.ui.fileUpload']});