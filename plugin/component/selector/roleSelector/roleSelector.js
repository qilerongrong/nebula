;V.registPlugin("v.component.selector.roleSelector",function(){
	V.Classes.create({
		className:"v.component.selector.RoleSelector",
		superClass:"v.component.Selector",
		init: function(){
			this.ns = 'v.component.selector.roleSelector';
			var Form = V.Classes["v.component.Form"];
			var that  = this;
			this.options.items = [
                {label:this.getLang("LABEL_ROLE_CODE"),type:Form.TYPE.TEXT,name:'roleCode',value:''},
		        {label:this.getLang("LABEL_ROLE_NAME"),type:Form.TYPE.TEXT,name:'roleName',value:''}
            ];
			this.options.columns = [
                {displayName:this.getLang("LIST_ROLE_CODE"),key:'roleCode',width:160}
				,{displayName:this.getLang("LIST_ROLE_NAME"),key:'roleName',width:120}
            ];
			this.options.params = {};
			this.options.url = 'common!listrole.action';
			this.options.title = this.getLang("TITLE_CHOOSE_ROLE");
			this.options.isMultiChoose = true;
		}
	});
},{plugins:["v.component.selector"]})