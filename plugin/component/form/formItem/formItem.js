;V.registPlugin("v.component.form.formItem",function(){
	V.Classes.create({
		className:"v.component.FormItem",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.component.form";
			/**item:{label:'',colspan:1,name:'',value:'',type,required:false,validator:'',styleclass}
			 * select: {...multiList:[[]]}
			 * *colspan:每行多少个
			 */
			this.options = {
				colspan:2,
				record:null,
				items:[]
			}
			this.template = $('<div class="form-horizontal v-form"></div>');
			this.EVENT.INITED = "inited";
			this.COLSPAN = {
				"1":{th:"0.35",td:"0.65"},
			    "2":{th:"0.18",td:"0.32"},
			    "3":{th:"0.15",td:"0.18"},
			    "4":{th:"0.12",td:"0.13"}
			}
		}
	});
	(function(FormItem){
		
	})(V.Classes['v.component.Form']);
},{plugins:['v.fn.validator']})