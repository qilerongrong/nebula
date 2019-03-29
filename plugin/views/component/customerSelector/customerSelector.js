/**
 * 客户选择插件
 */
;V.registPlugin("v.views.component.customerSelector",function(){
	V.Classes.create({
		className:"v.views.component.CustomerSelector",
		superClass:"v.views.component.Selector",
		init: function(){
			this.docketType = "CUSTOMER";
			this.ns = "v.views.component.customerSelector";
			this.options.fields = [
			   {name:'partnerName',aliasName:'buyerName',placeholder:'订货单位名称'}
			];
			var Form = V.Classes["v.component.Form"];
			var that  = this;
			
			this.options.items = [
			                      {label:'编码',type:Form.TYPE.TEXT,name:'partnerCode',value:''},
							       {label:'名称',type:Form.TYPE.TEXT,name:'partnerName',value:''}
			                     ];
			this.options.columns = [
			                        {displayName:'编码',key:'partnerCode',width:100,render:function(record){
										var html = $('<a href="javascript:void(0);"></a>');
										html.text(record.partnerCode);
										html.click(function(){
											that.choose(record);
										});
										return html;
									}}
									,{displayName:'名称',key:'partnerName',width:160}
			                        ];
			// this.options.params = {};
			this.options.url = 'common!queryCustomer.action';
			this.options.title = '选择订货单位';
		}
	});
},{plugins:["v.ui.dialog","v.views.component.selector"]})