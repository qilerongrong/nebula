;V.registPlugin("v.component.selector.postSelector",function(){
	V.Classes.create({
		className:"v.component.selector.PostSelector",
		superClass:"v.component.Selector",
		init: function(){
			this.ns = 'v.component.selector.postSelector';
			var Form = V.Classes["v.component.Form"];
			var that  = this;
			this.options.items = [
                {label:this.getLang("LABEL_POST_CODE"),type:Form.TYPE.TEXT,name:'code',value:''},
		        {label:this.getLang("LABEL_POST_NAME"),type:Form.TYPE.TEXT,name:'name',value:''}
            ];
			this.options.columns = [
                {displayName:this.getLang("LIST_POST_CODE"),key:'code',width:160}
				,{displayName:this.getLang("LIST_POST_NAME"),key:'name',width:120}
            ];
			this.options.params = {};
			this.options.url = 'common!listpost.action';
			this.options.title = this.getLang("TITLE_CHOOSE_POST");
			this.options.isMultiChoose = true;
		}
	});
},{plugins:["v.component.selector"]})