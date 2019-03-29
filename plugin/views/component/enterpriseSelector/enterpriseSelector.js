/**
 * 集团企业选择插件
 */
;V.registPlugin("v.views.component.enterpriseSelector",function(){
	V.Classes.create({
		className:"v.views.component.EnterpriseSelector",
		superClass:"v.views.component.Selector",
		init: function(){
			this.ns = "v.views.component.enterpriseSelector";
			this.options.fields = [
			   {aliasName:'sellerCode',name:'partnerCode',placeholder:'集团编码'}
			];
			var Form = V.Classes["v.component.Form"];
			var that  = this;
			
			this.options.items = [
			                      {label:'编码',type:Form.TYPE.TEXT,name:'partnerCode',value:''},
							       {label:'名称',type:Form.TYPE.TEXT,name:'taxname',value:''}
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
									,{displayName:'名称',key:'taxname',width:160}
									,{displayName:'税号',key:'taxno',width:120}
			                        ];
			this.options.params = {'isBuyer':true};
			this.options.url = 'common!partner.action';
			this.options.title = '选择集团企业';
		}
	});
},{plugins:["v.ui.dialog","v.views.component.selector"]})