;V.registPlugin("v.ui.fckeditor",function(){
	V.Classes.create({
		className:"v.ui.Fckeditor",
		superClass:"v.Plugin",
		init:function(){
		  this.template=$('<div class="ck_editor"><textarea cols="30" class="fckeditor" rows="3"></textarea></div>');
		  this.instance = null;
		  this.options = {
		      "data":""
		  };
		}
	});
	(function(Fckeditor){
		Fckeditor.prototype.init = function(options){
			var that = this;
		    this.container = options.container;
		    $.extend(this.options,options);
			this.container&&this.container.append(this.template);
			V.Util.Loader.loadJS('ckeditor/adapters/jquery.js',function(){
				$('textarea',that.template).ckeditor(
				{
					startupFocus:false,
	    			toolbar :
	    			[
	    				['Source','-','NewPage','-','Undo','-','Redo','-','Preview'],
	    				['Find','Replace','-','RemoveFormat'],
	    				['Link', 'Unlink'],
	    				['TextColor','FontSize', 'Bold', 'Italic','Underline'],
						[ 'NumberedList','BulletedList','-','Outdent','Indent','-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock','-','BidiLtr','BidiRtl'] ,
	    			]
	    		});
	    		that.getInstance().setData(that.options.data);
			})
		};
		Fckeditor.prototype.getData= function(){
			return this.template.val();
		}
		Fckeditor.prototype.setData= function(data){
			this.template.val(data);
			// this.getInstance().setData(data);
		}
		Fckeditor.prototype.getInstance = function(){
			// return this.template.ckeditorGet();
			return $('textarea',this.template).ckeditor().editor;
		}
	})(V.Classes['v.ui.Fckeditor']);
},{jss:['ckeditor/ckeditor.js']});
