;V.registPlugin("v.component.pages.footer",function(){
	V.Classes.create({
		className:"v.component.pages.Footer",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.component.pages.footer";
			this.resource = {
			    html:'template.html'
			};
		}
	});
	(function(Footer){
        Footer.prototype.init = function(options){
            this.container = options.container;
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.container.append(dom);
				}
			})
        };
	})(V.Classes['v.component.pages.Footer'])
});
