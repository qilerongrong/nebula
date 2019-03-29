;V.registPlugin("v.module.system.emailTemplateEdit",function(){
	V.Classes.create({
		className:"v.module.system.EmailTemplateEdit",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.module.system.emailTemplateEdit";
			this.module = '';
			this.template = $('<div class="emailTemplate"><div class="legend">邮件模版设置\
		    <span style="float:right;"><a class="btn save btn-success btn-mini" href="javascript:void(0);"><i class="icon-check icon-white"></i> 保存</a><a class="btn cancel btn-success btn-mini" href="javascript:void(0);"><i class="icon-check icon-white"></i> 取消</a></span>\
            </div><div class="v-form_1 tempalte-form"></div><div>');
			this.templateCon = new V.Classes['v.ui.Fckeditor']();
			this.emailTemplate = null;
		}
	});
	(function(Template){
		Template.prototype.init = function(options){
			this.container = options.container;
			this.module = options.module;
			this.emailTemplate = options.emailTemplate||{};
			this.container.append(this.template);
			this.initTemplateForm();
			this.initEvent();
		}
		Template.prototype.initTemplateForm = function(){
			var Form = V.Classes['v.component.Form'];
			this.templateForm = new Form();
			var that = this;
			var items = [ 
			    {label:'模版名称',required:true,name:'name',value:this.emailTemplate.name||"",type:Form.TYPE.TEXT}
			    ,{label:'模版描述',required:true,name:'description',value:this.emailTemplate.description||"",type:Form.TYPE.TEXTAREA}
				,{label:'邮件标题',required:true,name:'title',value:this.emailTemplate.title||"",type:Form.TYPE.TEXT}
				,{label:'收件人',required:false,name:'receiver',value:this.emailTemplate.receiver||"",type:Form.TYPE.TEXT}
				,{label:'抄送',required:false,name:'cc',value:this.emailTemplate.cc||"",type:Form.TYPE.TEXT}
				,{label:'密送',required:false,name:'bcc',value:this.emailTemplate.bcc||"",type:Form.TYPE.TEXT}
				,{label:'邮件内容',required:true,name:'content',value:this.emailTemplate.content||"",type:Form.TYPE.CUSTOM,render:function(){
					var con = $('<div class="template_con"></div>');
					return con;
				},getValue:function(){
					return {content:that.templateCon.getData()};
				}}
			];
			this.templateForm.init({
				container : $('.tempalte-form',this.template),
				items : items,
				colspan : 1
			});
			this.initEmailContent();
		}
		Template.prototype.initEmailContent = function(){
			this.templateCon.init({
				container:$('.template_con',this.template)
			});
			this.templateCon.setData(this.emailTemplate.content);
		}
		Template.prototype.initEvent = function(){
			var that = this;
			$('.save',this.template).click(function(){
				that.save();
			});
			$('.cancel',this.template).click(function(){
				V.MessageBus.publish({eventId:'backCrumb'});
			})
		}
		Template.prototype.save = function(){
			if(!this.templateForm.validate()){
				return false;
			}
			var emailTemplate = $.extend(this.emailTemplate,this.templateForm.getValues());
			var that = this;
			V.ajax({
				url:'backoffice/email-template!save.action',
				data:{emailTemplate:emailTemplate},
				success:function(data){
					if(data.result == 'success'){
						V.alert("保存模版成功。");
						V.MessageBus.publish({eventId:'backCrumb'});
					}else{
						V.alert("保存失败。");
					}
				}
			});
		}
		Template.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'邮箱设置'}});
		}
	})(V.Classes['v.module.system.EmailTemplateEdit'])
},{plugins:['v.component.form','v.ui.fckeditor']});
