/**
 * 定制单据选择器
 */
;V.registPlugin("v.views.component.docketTypeSelector",function(){
	V.Classes.create({
		className:"v.views.component.DocketTypeSelector",
		superClass:"v.views.component.Selector",
		init: function(){
			var Form = V.Classes["v.component.Form"];
			this.ns = "v.views.component.docketTypeSelector";
			var that  = this;
			this.options.fields = [
			   {aliasName:'docketType',name:'value',placeholder:'表单'}                    
			];
			this.options.items = [
			                      {label:'表单编码',type:Form.TYPE.TEXT,name:'value',value:''},
							      {label:'表单名称',type:Form.TYPE.TEXT,name:'name',value:''}
			                     ];
			this.options.columns = [
			                        {displayName:'表单编码',key:'value',width:120,render:function(record){
											var html = $('<a href="javascript:void(0);"></a>');
											html.text(record.value);
											html.click(function(){
												that.choose(record);
											});
											return html;
										}},
									  {displayName:'表单名称',key:'name',width:160}
			                        ];
			this.options.params = {};
			this.options.url = 'common!OrderTypeList.action';
			this.options.title = '选择表单';
		}
	});
//	(function(Plugin){
//		Plugin.prototype.getValue = function(){
//			var val = {};
//			val[this.config.name] = this.record.value;
//			return val;
//	    }
//	})(V.Classes['v.views.component.DocketTypeSelector'])
},{plugins:["v.ui.dialog","v.views.component.selector"]})