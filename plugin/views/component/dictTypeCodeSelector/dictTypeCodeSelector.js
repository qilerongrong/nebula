/**
 * 字典plugin选择
 */
;V.registPlugin("v.views.component.dictTypeCodeSelector",function(){
	V.Classes.create({
		className:"v.views.component.DictTypeCodeSelector",
		superClass:"v.views.component.Selector",
		init: function(){
			this.ns = "v.views.component.dictTypeCodeSelector";
			this.options.fields = [
			   {name:'dictTypeCode',placeholder:'字典编码'}                    
			];
			var Form = V.Classes["v.component.Form"];
			var that  = this;
			
			this.options.items = [
			                      {label:'编码',type:Form.TYPE.TEXT,name:'dictTypeCode',value:''},
					              {label:'名称',type:Form.TYPE.TEXT,name:'dictTypeName',value:''}
			                    ];
			this.options.columns = [
									{displayName:'字典编码',key:'dictTypeCode',width:160,render:function(record){
										var html = $('<a href="javascript:void(0);"></a>');
										html.text(record.dictTypeCode);
										html.click(function(){
											that.choose(record);
										});
										return html;
									}}
									,{displayName:'字典名称',key:'dictTypeName',width:120}
			                        ];
			this.options.params = {};
			this.options.url = 'backoffice/systemsetting/custom/custom!queryDict.action';
			this.options.title = '选择字典';
		}
	});
},{plugins:["v.views.component.selector"]})