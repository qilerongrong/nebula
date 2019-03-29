;V.registPlugin("v.views.pages.console",function(){
    V.Classes.create({
        className:"v.views.pages.Console",
		superClass:"v.Plugin",
        init:function(){
            this.ns = 'v.views.pages.console';
			this.template = $('<div></div>');
        }
    });
    (function(Console){
        Console.prototype.init = function(options){
			var that = this;
            this.container = options.container;
            var matrix = new V.Classes['v.ui.Matrix']();
			matrix.init({container:this.template});
			this.container.append(this.template);
			var that = this;
			$.ajax({
				url:'bcpconsole/console!list.action',
				success:function(data){
					$.each(data,function(){
						var container = $('<div style="width:100%;height:100%"></div>');
						var options = {
							module:this.module,
							container:container
						}
						matrix.add(container);
					    that.loadPanel(this.ns,options);
					})
				}
			})
		}
		Console.prototype.loadPanel = function(plugin,options){
			var that = this;
			V.loadPlugin(plugin,function(){
				 var glass = V._registedPlugins[plugin].glass;
				 var inst = new V.Classes[glass]();
				 that.subscribe(inst,inst.EVENT.LOAD_CONTENT,function(data){
				 	var ns = data.plugin;
					var options = data.options;
				 	that.forward(ns,options);
				 });
				 inst.init(options);
			})
		}
    })(V.Classes['v.views.pages.Console'])
},{plugins:['v.ui.matrix']});