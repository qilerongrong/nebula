;V.registPlugin("v.ui.mask",function(){
	V.Classes.create({
		className:"v.ui.Mask",
		superClass:"v.Plugin",
		init:function(){
			this.template = $('<div></div>');
			this.options = {};
		}
	});
	(function(Mask){
		Mask.prototype.init = function(options){
		  	this.container = options.container;
			for(prop in options){
			    this.options[prop] = options[prop];
			}
			this.container&&this.container.append(this.template);
			this.mask(options.css);
		}
		Mask.prototype.mask = function(css){
			if(css){
				this.template.css(css);
			}else{
				this.template.css({
					top:0,
					left:0,
					position:'absolute',
					opacity:0.7,
					zIndex:9999,
					background:'#efefef url(imgs/loading_16.gif) center 200px no-repeat',
					height:'100%',
					width:'100%'
				});
			}
		}
		Mask.prototype.remove = function(){
		   this.template.remove();
		}
	})(V.Classes['v.ui.Mask']);
	V.mask = function(container,css){
		var options = {
			container:container,
			css:css
		}
		var mask = new V.Classes['v.ui.Mask']();
		mask.init(options);
		return mask;
	};
	V.unMask = function(mask){
		mask&&mask.template.remove();
	}
},{plugins:[]});
