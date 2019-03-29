;V.registPlugin("v.ui.fileUpload",function(){
	V.Classes.create({
		className:"v.ui.FileUpload",
		superClass:"v.Plugin",
		init: function(){
			this.ns = 'v.ui.fileUpload';
			this.swfu = {};
			this.fileQueue = [];
			this.setting = {};
		    this.options = {
                url:'',
				placeholderId:'',
				width:'',
				height:'',
				displayText:this.getLang("MSG_BROWSE"),
				//when swf loaded
				maxSize:"6144",//kB
				loadedHandler : null,
				//when select files
				fileQueuedHandler : null,
				fileQueueErrorHandler:null,
				uploadStartHandler:null,
				//start upload
				uploadStartHander:null,
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
			var flash_url = "plugin/ui/fileUpload/assets/swfupload.swf";
			this.setting = {
				upload_url : this.options.url,
				flash_url : flash_url,
				post_params:this.options.params || {},
				file_size_limit:this.options.maxSize,
				//*.jpg
				file_types : this.options.fileTypes,
				//button
				button_placeholder_id : this.options.placeholderId,
				button_width :this.options.width,
				button_height:this.options.height,
				button_text:this.options.displayText,
				button_text_top_padding:this.options.button_text_top_padding,
				button_text_style:this.options.textStyle,
				button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
				button_cursor: SWFUpload.CURSOR.HAND,
				use_query_string:true,
				//select dialog handler
				file_queued_handler:function(file){
					that.fileQueue.push(file.id);
					that.options.fileQueuedHandler(file);
				},
				file_queue_error_handler:function(file,errorCode,message){
					V.alert(message);
				},
				//upload handler
				upload_progress_handler:this.options.uploadProgress,
				upload_error_handler : this.options.uploadError,
				upload_start_handler: this.options.uploadStartHandler, 
				custom_settings : {upload_target:this.options.upload_target, instance:this.options.instance},
				upload_success_handler:this.options.uploadSuccess,
				upload_complete_handler:this.options.uploadComplete,
				queue_complete_handler:this.options.queueCompleteHandler
			};
			V.Util.Loader.loadJS(this.getPath()+'/assets/swfupload.queue.js',function(){
				that.swfu = new SWFUpload(that.setting);
			});
		};
		FileUpload.prototype.seturl = function(url){
			this.swfu.setUploadURL(url);
		}
		FileUpload.prototype.upload = function(){
			var that =this;
			that.swfu.startUpload();
		}
//		FileUpload.prototype.uploadFormParam = function(param){
//			var that =this;
//            that.swfu.setPostParams(param);
//			that.swfu.startUpload();
//		}
        FileUpload.prototype.cancelUpload = function(fileId,trigger_error_event){
        	var that =this;
			that.swfu.cancelUpload(fileId,trigger_error_event);
        }
		FileUpload.prototype.destroy = function(){
			this.swfu.destroy();
		}
	})(V.Classes['v.ui.FileUpload'])
},{jss:["plugin/ui/fileUpload/assets/swfupload.js"]})
