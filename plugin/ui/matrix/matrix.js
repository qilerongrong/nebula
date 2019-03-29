;V.registPlugin("v.ui.matrix",function(){
	V.Classes.create({
		className:"v.ui.Matrix",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.ui.matrix";
			this.options = {
				cols:3,
				height:300,
				cells:[]
			}
			this.size= 0;
			this.template = $('<div class="v-matrix" style="position:relative"></div>');
		}
	});
	(function(Matrix){
        Matrix.prototype.init = function(options){
            this.container = options.container;
			delete options.container;
			for (prop in options){
				this.options[prop] = options[prop];
			}
			this.container.append(this.template);
			//this.initEvent();
        };
		Matrix.prototype.initEvent = function(){
			var that = this;
		    $('ul .v-matrix-panel',this.template[0]).live('mousedown',function(e){
				$(document).css('cursor','move');
				$(this).css('z-index',1);
				this.activeIndex = $('ul .v-matrix-panel',this.template).index(this);
				var item = this;
				var pos = $(item).position();
				var left0 = pos.left;
				var top0 = pos.top;
				var mX0 = e.pageX;
				var mY0 = e.pageY;
				$(this).css('opacity','.6');
				$(document).bind('mousemove',function(e){
					var mX1 = e.pageX;
					var mY1 = e.pageY;
					$(item).css({
						left: mX1 - mX0,
						top: mY1 - mY0
					});
				}).bind('mouseup',function(){
					$(this).css('cursor','default').unbind('mousemove')      
					$(item).animate({top:0,left:0,opacity:1},300,function(){
						$(this).css({'z-index':0});
					});
					this.activeIndex = null;
				});
			}).live('mouseenter',function(){
				if(that.activeIndex == undefined || that.activeIndex == null){
					return;
				}
				var index = $('ul .v-matrix-panel',this.template).index(this);
				if(that.activeIndex < index){
					$(item).insertAfter(this);
					that.activeIndex = index+1;
				}else if (that.activeIndex > index) {
					$(item).insertBefore(this);
					that.activeIndex = index-1;
				}
			})
		};
		// Matrix.prototype.add = function(content){
		// 	var cols = this.options.cols;
		// 	var l = $('.v-matrix-panel',this.template).length + 1;
		// 	var item = $('<li class="v-matrix-panel"></li>').addClass('span'+12/cols);
		// 	content.css('height',this.options.height);
		// 	if(l%cols ==1){
		// 		item.css('margin-left',0);
		// 	}else if(l%cols == 0){
		// 		item.css('margin-right',0);
		// 	}
		// 	// item.css('margin-top',"10px");
		// 	item.append(content);
		// 	$('.v-matrix-items',this.template).append(item);
		// };
		Matrix.prototype.add = function(content){
			this.size++;
			var cols = this.options.cols;
			var item = $('<li class="v-matrix-panel"></li>').addClass('span'+12/cols);
			content.css('height',this.options.height);
			item.append(content);
			var row = $('.v-matrix-items:last',this.template);
			if(this.size%cols == 1){
				row = $('<ul class="row-fluid v-matrix-items"></ul>');
				this.template.append(row);
			}
			row.append(item);
			
		}
		Matrix.prototype.remove = function(item){
		    $('.v-matrix-items .v-matrix-panel',this.template).find(item).parent().remove();
		}
		Matrix.prototype.empty = function(){
		    $('ul',this.template).empty();
		}
	})(V.Classes['v.ui.Matrix'])
});
