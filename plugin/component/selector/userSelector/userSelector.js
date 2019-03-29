;V.registPlugin("v.component.selector.userSelector",function(){
	V.Classes.create({
		className:"v.component.selector.UserSelector",
		superClass:"v.component.Selector",
		init: function(){
			this.ns = 'v.component.selector.userSelector';
			var Form = V.Classes["v.component.Form"];
			var that  = this;
			this.options.items = [
                {label:this.getLang("LABEL_USER_CODE"),type:Form.TYPE.TEXT,name:'userCode',value:''},
		        {label:this.getLang("LABEL_USER_NAME"),type:Form.TYPE.TEXT,name:'userName',value:''}
            ];
			this.options.columns = [
                {displayName:this.getLang("LIST_USER_CODE"),key:'userCode',width:160}
				,{displayName:this.getLang("LIST_USER_NAME"),key:'userName',width:120}
            ];
			this.options.params = {};
			this.options.url = 'common!listuser.action';
			this.options.title = this.getLang("TITLE_CHOOSE_USER");
			this.options.isMultiChoose = true;
		}
	});
},{plugins:["v.component.selector"]})