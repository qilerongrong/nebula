;V.registPlugin("v.ui.frame",function(){
    V.Classes.create({
        className:"v.ui.Frame",
		superClass:"v.Plugin",
        init:function(){
            this.ns = 'v.ui.frame';
            this.url = "";
			this.EVENT = {
				
			};
			this.template = $("<iframe class='v-frame' style='width:100%;height:auto;border:0 none;' width='100%' height='100%'></iframe>");
        }
    });
    (function(Plugin){
		Plugin.prototype.init = function(options){
			this.container = options.container;
			
			var iframe = this.template.get(0);
			if(this.url){
				this.template.attr('src',this.url);
			}
			var that = this;
			//自适应高度
			iframe.onload = function(){
				var document = iframe.Document||iframe.contentDocument;
				that.template.height($(document).height());
			}
			this.container.append(this.template);
		};
		Plugin.prototype.setUrl = function(url){
			this.url = url;
			var iframe = this.template.get(0);
			this.template.attr('src',this.url);
		}
    })(V.Classes['v.ui.Frame']);
});