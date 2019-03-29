;V.registPlugin("v.views.component.partySelector",function(){
	V.Classes.create({
		className:"v.views.component.PartySelector",
		superClass:"v.views.component.Selector",
		init: function(){
			this.ns = "v.views.component.partySelector";
			this.options.fields = [
			   {name:'partyCode',placeholder:'主体编码'}                    
			];
			var Form = V.Classes["v.component.Form"];
			var that  = this;
			
			this.options.items = [
			                       {label:'编码',type:Form.TYPE.TEXT,name:'partyCode',value:''},
			                       {label:'名称',type:Form.TYPE.TEXT,name:'partyName',value:''}
			                     ];
			this.options.columns = [
			                        {displayName:'编码',key:'partyCode',width:160,render:function(record){
										var html = $('<a href="javascript:void(0);"></a>');
										html.text(record.partyCode);
										html.click(function(){
											that.choose(record);
										});
										return html;
									}}
									,{displayName:'名称',key:'partyName',width:120}
									,{displayName:'平台号',key:'platformNo',width:120}
			                        ];
			this.options.params = {};
			this.options.url = 'common!listParty.action';
			this.options.title = '选择主体';
		}
	});
},{plugins:["v.views.component.selector"]})