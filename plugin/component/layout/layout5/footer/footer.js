;V.registPlugin("v.component.layout.layout5.footer",function(){
	V.Classes.create({
		className:"v.component.layout.layout5.Footer",
		superClass:"v.component.pages.Footer",
		init:function(){
            this.ns = "v.component.layout.layout5.footer";
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
	})(V.Classes['v.component.layout.layout5.Footer'])
});
