;V.registPlugin("v.ui.fileUpload",function(){
	V.Classes.create({
		className:"v.ui.FileUpload",
		superClass:"v.Plugin",
		init: function(){
			this.ns = 'v.ui.fileUpload';
			this.uploader = {};
			this.fileQueue = [];
			this.setting = {};
		    this.options = {
                url:'',
				browseButton:'',
				width:'',
				height:'',
				multiSelection:true,
				displayText:this.getLang("MSG_BROWSE"),
				//when swf loaded
				maxSize:"6144kb",//kB
				// loadedHandler : null,
				fileTypes:["*.*"],
				//when select files
				fileQueuedHandler : null,
				// fileQueueErrorHandler:null,
				uploadStartHandler:null,//开始上传时触发
				//start upload
				queueCompleteHandler:null,
				//loadding...
				uploadProgress :null,
				params:null,
				uploadSuccess:null,
				uploadComplete:null
			}
		}
	});
	(function(FileUpload){
		FileUpload.prototype.init = function(options){
			var that = this;
			$.each(options,function(prop,value){
				that.options[prop] = value;
			})
			var flash_url = "plugin/ui/fileUpload/assets/Moxie.swf";
			this.setting = {
				url : this.options.url,
				browse_button:this.options.browseButton,
				flash_swf_url : flash_url,
				multi_selection:this.options.multiSelection,
				multipart_params:this.options.params || {},
				filters:{
					// mime_types:[{title:"File",extensions:this.options.fileTypes.join(",")}],
					max_file_size:this.options.maxSize,
					prevent_duplicates:false
				},
				init:{
					FileFiltered: function(uploader, file) {
					},
					FilesAdded:function(uploader,files){
						// that.fileQueue.push(file.id);
						that.options.fileQueuedHandler&&that.options.fileQueuedHandler(uploader,files);
					},
					// Browse:function(){
					// },
					//upload handler
					UploadProgress:this.options.uploadProgress,
					Error : function(uploader,errObj){
						var err_code = errObj.code;
						var err_message = errObj.message;
						//默认处理文件大小和文件类型错误
						if(err_code == plupload.FILE_SIZE_ERROR){
							V.alert("File size exceeds limit");
						}else if(err_code == plupload.FILE_EXTENSION_ERROR){
							V.alert("File extention error");
						}
						that.options.uploadError&&that.options.uploadError(uploader,errObj);
					},
					UploadFile: this.options.uploadStartHandler, 
					custom_settings : {upload_target:this.options.upload_target, instance:this.options.instance},
					FileUploaded:this.options.uploadSuccess||function(){},
					UploadComplete:this.options.uploadComplete||function(){},
					// queue_complete_handler:this.options.queueCompleteHandler
				},
			};
			this.uploader = new plupload.Uploader(this.setting);
			this.uploader.init();
		};
		// FileUpload.prototype.seturl = function(url){
		// 	this.swfu.setUploadURL(url);
		// }
		FileUpload.prototype.upload = function(){
			var that =this;
			that.uploader.start();
		}
		FileUpload.prototype.addParam = function(param){
			var multipart_params = this.uploader.getOption('multipart_params');
			$.extend(multipart_params,param);
		}
		FileUpload.prototype.destroy = function(){
			this.uploader.destroy();
		}
	})(V.Classes['v.ui.FileUpload'])
},{jss:["plugin/ui/fileUpload/assets/plupload.full.min.js"]})
