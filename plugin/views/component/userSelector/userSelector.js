/**
 * 项目责任人选择插件
 */
;V.registPlugin("v.views.component.userSelector",function(){
	V.Classes.create({
		className:"v.views.component.UserSelector",
		superClass:"v.views.component.Selector",
		init: function(){
			this.ns = "v.views.component.userSelector";
			this.options.fields = [
			    {aliasName:'inchargePersonCode',name:'userCode',placeholder:'项目责任人'}
			];
			var Form = V.Classes["v.component.Form"];
			var that  = this;
			
			this.options.items = [
			                      {label:'编码',type:Form.TYPE.TEXT,name:'userCode',value:''},
							       {label:'名称',type:Form.TYPE.TEXT,name:'userName',value:''}
			                     ];
			this.options.columns = [
			                        {displayName:'编码',key:'userCode',width:100,render:function(record){
										var html = $('<a href="javascript:void(0);"></a>');
										html.text(record.userCode);
										html.click(function(){
											that.choose(record);
										});
										return html;
									}}
									,{displayName:'名称',key:'userName',width:160}
			                        ];
			this.options.url = 'common!listuser.action';
			this.options.title = '选择项目责任人';
		}
	});
},{plugins:["v.ui.dialog","v.views.component.selector"]})