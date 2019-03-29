;V.registPlugin("v.component.chart",function(){
    V.Classes.create({
        className:"v.component.Chart",
        init:function(){
            this.ns = 'v.component.chart';
            this.chart = null;
            this.options = {
            	echartOptions:{
            		backgroundColor:'',
            		// color:[],
            		renderAsImage:false,//非IE8支持
            		calculable:false,
            		animation:true,//建议IE8关闭
            		title:{
            			show:true,
            			text:'',
            			link:'',
            			subtext:'',
            			sublink:'',
            			x:'left',
            			y:'top',
            			borderColor:'#ccc',
            			textStyle:'',
            			subtextStyle:''
            		},
            		tooltip:{
            			show:true,
            			trigger:'item',//item||axis
            			backgroundColor:'rgba(0,0,0,0.7)',
            			borderColor:'#333',
            			borderRadius:4,
            			borderWidth:0
            		},
            		legend:{
            			show:true,
            			orient:'horizontal',//'horizontal' | 'vertical'
            			borderColor:'#ccc',
            			borderWidth:0,
            			itemGap:10,
            			itemWidth:20,
            			itemHeight:20,
            			textStyle:{color:'auto'},
            			selectedMode:true,
            			data:[]
            		},
            		xAxis:{
            			name:'',
            			data:[]
            		},
            		yAxis:{
            			name:''
            		},
            		axis:{
            			type:'category',//'category' | 'value' | 'time' | 'log',
            			show:true,
            			name:'',
            			nameLocation:'end',//'end' | 'start'
            		},
            		series:[
            		    {
            		    	type:null,
            		    	name:null,
            		    	data:[]
            		    }
            		]
            	}
            }
        }
    });
    (function(Plugin){
		Plugin.prototype.init = function(options){
                  if(options.container){
                        this.options.container = options.container;
                  }
                  $.extend(true,this.options.echartOptions,options.echartOptions);
                  this.chart = new V.Classes['v.ui.Chart']();
                  this.chart.init(this.options);
		}
		// Plugin.prototype.convert = function(){
		// 	this.log('this method should be overwrite by subclass if needed');
		// }
    })(V.Classes['v.component.Chart'])
},{plugins:['v.ui.chart']});