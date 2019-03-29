;V.registPlugin("v.component.pages.header",function(){
	V.Classes.create({
		className:"v.component.pages.Header",
		superClass:"v.Plugin",
		init:function(){
		    this.ns = "v.component.pages.header";
			this.resource = {
			    html:'template.html'
			}
		}
	});
	(function(Header){
		Header.prototype.init = function(options){
			this.container = options.container;
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					that.initEvent();
				}
			})
		};
		Header.prototype.initEvent = function(){
           
		}
	})(V.Classes['v.component.pages.Header']);
},{plugins:[]});