;V.registPlugin("v.views.component.orgRegionSelector",function(){
	V.Classes.create({
		className:"v.views.component.OrgRegionSelector",
		superClass:"v.views.component.Selector",
		init: function(){
			this.ns = "v.views.component.orgRegionSelector";
			this.options.fields = [
			   {name:'regionCode',placeholder:'分部编码'}                    
			];
			var Form = V.Classes["v.component.Form"];
			var that  = this;
			this.options.items = [
								{label:'分部编码',type:Form.TYPE.TEXT,name:'regionCode',value:''},
								{label:'分部名称',type:Form.TYPE.TEXT,name:'name',value:''}
			                     ];
			this.options.columns = [
			                        {displayName:'分部编码',key:'regionCode',width:160,render:function(record){
										var html = $('<a href="javascript:void(0);"></a>');
										html.text(record.regionCode);
										html.click(function(){
											that.choose(record);
										});
										return html;
									}}
									,{displayName:'分部名称',key:'name',width:120}
			                        ];
			this.options.params = {};
			this.options.url = 'common!findSalesRegion.action';
			this.options.title = '选择分部';
		}
	});
},{plugins:["v.views.component.selector"]})