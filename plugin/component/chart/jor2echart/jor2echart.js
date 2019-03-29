;V.registPlugin("v.component.echart.jor2echart",function(){
    V.Classes.create({
        className:"v.component.echart.Jor2echart",
        init:function(){
            this.ns = 'v.component.echart.jor2echart';
        }   
    });
    (function(Plugin){
		Plugin.prototype.init = function(options){
			
		}
        Plugin.prototype.convert = function(options){
            var _type = null;
            if(options.type == "BarChart"){
                _type = "bar";
            }else if(options.type == "LineChart"){
                _type = "line";
            }else if(options.type == "PieChart"){
                _type = "pie";
            }else{
                return;
            }
            var _opt = {
                title:{
                    show:ture,
                    text:options.background.title||'',
                    link:'',
                    subtext:'',
                    sublink:'',
                    x:'left',
                    y:'top',
                    borderColor:'#ccc',
                    textStyle:'',
                    subtextStyle:''
                },
                legend:{
                    orient:options.legend.verticalLayout?'horizontal':'vertical',//'horizontal' | 'vertical'
                    borderColor:'#ccc',
                    borderWidth:0,
                    itemGap:10,
                    itemWidth:20,
                    itemHeight:20,
                    textStyle:{color:'auto'},
                    selectedMode:true
                },
                xAxis:{
                    name:options.xAxis.title||''
                },
                yAxis:{
                    name:options.xAxis.title||''
                },
                series:[
                    {
                        type:_type,
                        data:[]
                    }
                ]
            }
        }
    })(V.Classes['v.component.echart.Jor2echart'])
},{plugins:['v.component.echart']});