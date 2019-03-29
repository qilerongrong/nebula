;V.registPlugin("v.module.system.emailSetting",function(){
	V.Classes.create({
		className:"v.module.system.EmailSetting",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.module.system.emailSetting";
			this.module = '';
			this.template = $('<div class="emailSetting"><div class="legend">邮箱服务器设置\
		    <span style="float:right;"><a class="btn save btn-success btn-mini" href="javascript:void(0);"><i class="icon-check icon-white"></i> 保存</a></span>\
            </div><div class="setting-form"></div><div>');
		}
	});
	(function(EmailSetting){
		EmailSetting.prototype.init = function(options){
			this.container = options.container;
			this.module = options.module;
			this.container.append(this.template);
			this.initSettingForm();
			this.initEvent();
		}
		EmailSetting.prototype.initSettingForm = function(){
			var that =this;
			$.ajax({
				url:'backoffice/email-setting!input.action',
				success:function(data){
					that.setting = data?$.parseJSON(data):{};
					var Form = V.Classes['v.component.Form'];
					that.settingForm = new Form();
					var items = [ 
					    {label:'邮件服务器',required:true,name:'server',value:that.setting.server||"",type:Form.TYPE.TEXT}
						,{label:'用户名',required:true,name:'user',value:that.setting.user||"",type:Form.TYPE.TEXT,}
						,{label:'密码',required:true,name:'password',value:that.setting.password||"",type:Form.TYPE.PASSWORD}
						,{label:'邮件地址',required:true,name:'mail',value:that.setting.mail||"",type:Form.TYPE.TEXT}
					];
					that.settingForm.init({
						container : $('.setting-form',this.template),
						items : items,
						colspan : 1
					});
				}
			})
			
		}
		EmailSetting.prototype.initEvent = function(){
			var that = this;
			$('.save',this.template).click(function(){
				that.save();
			});
		}
		EmailSetting.prototype.save = function(){
			if(!this.settingForm.validate()){
				return false;
			}
			var setting = this.settingForm.getValues();
			var that = this;
			$.ajax({
				url:'backoffice/email-setting!save.action',
				data:{setting: JSON.stringify(setting)},
				success:function(data){
					if(data == 'success'){
						V.alert("设置成功。");
						
					}else{
						V.alert("设置失败。");
					}
				}
			});
		}
		EmailSetting.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'邮箱设置'}});
		}
	})(V.Classes['v.module.system.EmailSetting'])
},{plugins:['v.component.form']});
