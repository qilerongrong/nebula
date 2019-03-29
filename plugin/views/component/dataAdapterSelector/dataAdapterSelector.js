/**
 * 适配器选择插件
 */
;V.registPlugin("v.views.component.dataAdapterSelector",function(){
	V.Classes.create({
		className:"v.views.component.DataAdapterSelector",
		superClass:"v.views.component.Selector",
		init: function(){
			this.ns = "v.views.component.dataAdapterSelector";
			this.options.fields = [
			   {aliasName:'parentDocketId',name:'id',placeholder:'数据适配器ID'}
			];
			var Form = V.Classes["v.component.Form"];
			var that  = this;
			this.docketType='dataadapter';
			this.options.items = [
			                      {label:'数据适配器编码',type:Form.TYPE.TEXT,name:'docketCode',value:''},
							       {label:'数据适配器名称',type:Form.TYPE.TEXT,name:'docketName',value:''}
			                     ];
			this.options.columns = [
			                        {displayName:'数据适配器编码',key:'docketCode',width:100,render:function(record){
										var html = $('<a href="javascript:void(0);"></a>');
										html.text(record.docketCode);
										html.click(function(){
											that.choose(record);
										});
										return html;
									}}
									,{displayName:'数据适配器名称',key:'docketName',width:80}
									,{displayName:'父类型',key:'docketType',width:80}
			                        ];
			this.options.params = {};
			this.options.url = 'common!dataadapter.action';
			this.options.title = '选择数据适配器';
		}
	});
},{plugins:["v.views.component.selector"]})