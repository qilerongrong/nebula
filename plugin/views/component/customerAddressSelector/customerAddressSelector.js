/**
 * 客户地址选择插件
 */
;V.registPlugin("v.views.component.customerAddressSelector",function(){
	V.Classes.create({
		className:"v.views.component.CustomerAddressSelector",
		superClass:"v.views.component.Selector",
		init: function(){
			this.ns = "v.views.component.customerAddressSelector";
			this.options.fields = [
			   {aliasName:'address',name:'address',placeholder:'地址'}
			];
			var Form = V.Classes["v.component.Form"];
			var that  = this;
			
			this.options.items = [
			                      {label:'地址',type:Form.TYPE.TEXT,name:'address',value:''},
							       {label:'联系人',type:Form.TYPE.TEXT,name:'linkman',value:''}
			                     ];
			this.options.columns = [
			                        {displayName:'地址',key:'address',width:100,render:function(record){
										var html = $('<a href="javascript:void(0);"></a>');
										html.text(record.address);
										html.click(function(){
											that.choose(record);
										});
										return html;
									}}
									,{displayName:'联系人',key:'linkman',width:160}
									,{displayName:'电话',key:'telephone',width:120}
									,{displayName:'邮编',key:'zipcode',width:120}
			                        ];
			this.options.params = {};
			this.options.url = 'common!customerAddress.action';
			this.options.title = '选择客户地址';
		}
	});
},{plugins:["v.ui.dialog","v.views.component.selector"]})