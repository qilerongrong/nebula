V.registPlugin("v.views.component.databaseTableSelector",function(){
	V.Classes.create({
		className:"v.views.component.DatabaseTableSelector",
		superClass:"v.views.component.Selector",
		init: function(){
			this.ns = "v.views.component.databaseTableSelector";
			this.options.fields = [
			   {aliasName:'databaseId',placeholder:'数据库标识',name:'id'}                    
			];
			var Form = V.Classes["v.component.Form"];
			var that  = this;
			this.options.items = [
			                       {label:'数据库名称',type:Form.TYPE.TEXT,name:'name',value:''},
			                     ];
			this.options.columns = [
									{displayName:'数据库标识',key:'id',width:120,render:function(record){
										var html = $('<a href="javascript:void(0);"></a>');
										html.text(record.id);
										html.click(function(){
											that.choose(record);
										});
										return html;
									}}
									,{displayName:'数据库名称',key:'name',width:120}
									,{displayName:'编码',key:'code',width:120}
			                        ];
			this.options.params = {};
			this.options.url = 'common!databaseList.action';
			this.options.title = '选择数据库';
		}
	});
},{plugins:["v.views.component.selector"]});