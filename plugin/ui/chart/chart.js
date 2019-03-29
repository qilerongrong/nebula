/**
 * render chart with echart                                                                                                          [description]
 */
;V.registPlugin("v.ui.chart",function(){
	V.Classes.create({
		className:"v.ui.Chart",
		superClass:"v.Plugin",
		init:function(){
            this.ns="v.ui.chart";
			this.template = $('<div class="chart" style="width:100%;height:100%"></div>');
			this.options = {
				echartOptions:{}
			};
			this.echart = null;
			this.EVENT = {
				RENDERED:'rendered'
			}
		}
	});
	(function(Plugin){
		Plugin.prototype.init = function(options){
		    if(options.container){
                this.container = options.container;
            }
            this.container.append(this.template);

            $.extend(true,this.options,options);
            this.render();
		}
		Plugin.prototype.render = function(){
               this.echart = echarts.init(this.template.get(0));
               this.echart.setOption(this.options.echartOptions);
		}
	})(V.Classes['v.ui.Chart'])
},{jss:['echarts/echarts.js']});
