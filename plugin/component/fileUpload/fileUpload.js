;V.registPlugin("v.component.fileUpload",function(){
    V.Classes.create({
        className:"v.component.FileUpload",
		superClass:"v.ui.Dialog",
        init:function(UploadDialog){
            this.ns = 'v.component.fileUpload';
			this.fileUploader = new V.Classes['v.ui.FileUpload']();
			this.options.width = 500;
			this.options.height = 360;
			this.options.typeList = [];
			this.options.uploadSetting = {
				url : '',
				fileTypes:[],//[]
				maxSize:'6mb',//MB
				params:'',
				multiSelection:true,
				uploadSuccess:null,
				uploadError:null,
				uploadComplete:null
			}
        }
    });
    (function(UploadDialog){
		UploadDialog.prototype.init = function(options){
			var that =this;
			var con = $('<div class="file_upload_dlg"><div class="upload_top"><a class="btn-browser" href="javascript:void(0);"><i class="icon-upload"></i> Browse...</a><span class="type" style="display:none;float:right">'+this.getLang("TIP_FILE_TYPE")+'<select class="input-medium"></select></span></div><ul class="file_list"></ul></div>');
			this.setContent(con);
			this.setBtnsBar({
				position:'center',
				btns:[
				   {text:this.getLang("BTN_UPLOAD"),style:'btn-primary',handler:function(){
				   	   that.upload();
					}} 
				    ,{text:this.getLang("BTN_CLOSE"),style:'btn-close',handler:function(){
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
			var setting = this.options.uploadSetting = $.extend(this.options.uploadSetting,options.uploadSetting);
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
			// setting.width = '100';
			// setting.height = '20';
			setting.browseButton = $('.btn-browser',this.template).get(0);
			// setting.displayText = this.getLang("MSG_BROWSE");
			// setting.textStyle = 'text-decoration:underline';
			//setting.bgImg = '';
			setting.fileQueuedHandler = function(uploader,files){
				var _queue = uploader.files;
				if(!that.options.uploadSetting.multiSelection&&_queue.length>1){
					_queue.splice(0,1);
					$('.file_list',that.template).empty();
				}
				$.each(files,function(index,file){
					var name = file.name;
					var fileId = file.id;
					var li = $('<li id="file_'+fileId+'"><span>'+name+'</span><span class="upload_status"></span></li>');
					$('.file_list',that.template).append(li);
				})
			};
			setting.uploadProgress = function(upload,file){
				var fileId = file.id;
				var percent = file.percent;
			    $('#file_'+fileId+' .bar',that.template).css('width',percent+'%');
				$('#file_'+fileId+' .upload_status',that.template).text(that.getLang("MSG_UPLOADED")+percent+'%');
			};
			setting.uploadStartHandler = function(uploader,file){
				var fileId = file.id;
				$('#file_'+fileId,that.template).append('<div class="progress progress-striped active"><div class="bar" style="width: 0%;"></div></div>');

			};
			var _success_handler = this.options.uploadSetting.uploadSuccess;
			setting.uploadSuccess = function(upload,file,responseObj){
				var fileId = file.id;
				$('#file_'+fileId+' .progress',that.template).hide();
				_success_handler&&_success_handler(file, responseObj.response,responseObj);
//				that.close();
			};
			var _error_handler = this.options.uploadSetting.uploadError;
			setting.uploadError = function(upload,errObj){
				var file = errObj.file;
				var fileId = file.id;
				$('#file_'+fileId+' .upload_status',that.template).text("Failed").css('color','red');
				$('#file_'+fileId+' .progress',that.template).hide();
				_error_handler&&_error_handler(file, errObj.message, response);
			}
			setting.queueCompleteHandler = options.uploadSetting.complete;
			this.fileUploader.init(setting);
		};
		UploadDialog.prototype.close = function(){
			this.fileUploader.destroy();
			UploadDialog.superclass.close.call(this);
		}
		UploadDialog.prototype.showMsg = function(msg){
			var msg = $('<div class="msg alert"><button type="button" class="close" data-dismiss="alert">&times;</button>\
               <span class="msg_info">'+msg+'</span></div>');
			this.getContent().prepend(msg);
		}
		UploadDialog.prototype.upload = function(){
			if(this.fileUploader.uploader.files.length>0){
				if(this.options.typeList.length > 0){
					var type = $('.type option:selected',this.template).text();
					//var 
					this.fileUploader.addParam({'fileType':type});
				}
				this.fileUploader.upload();
			}else{
				V.alert("请选择要上传的文件！");
			}
		}
    })(V.Classes['v.component.FileUpload'])
},{plugins:['v.ui.fileUpload','v.ui.alert']});