/**
 * 运行选择插件
 */
;V.registPlugin("v.views.component.dataSourceSelector",function(){
	V.Classes.create({
		className:"v.views.component.DataSourceSelector",
		superClass:"v.views.component.Selector",
		init: function(){
			this.ns = "v.views.component.dataSourceSelector";
			this.options.fields = [
			   {aliasName:'resourceId',name:'id',placeholder:'资源ID'}
			];
			var Form = V.Classes["v.component.Form"];
			var that  = this;
			this.docketType='datasource';
			this.options.items = [
			                      {label:'资源编码',type:Form.TYPE.TEXT,name:'docketCode',value:''},
							       {label:'资源名称',type:Form.TYPE.TEXT,name:'docketName',value:''}
			                     ];
			this.options.columns = [
			                        {displayName:'资源编码',key:'docketCode',width:100,render:function(record){
										var html = $('<a href="javascript:void(0);"></a>');
										html.text(record.docketCode);
										html.click(function(){
											that.choose(record);
										});
										return html;
									}}
									,{displayName:'资源名称',key:'docketName',width:80}
									
			                        ];
			this.options.params = {};
			this.options.url = 'common!datasource.action';
			this.options.title = '选择数据资源';
		}
	});
},{plugins:["v.views.component.selector"]})