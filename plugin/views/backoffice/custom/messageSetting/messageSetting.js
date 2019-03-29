 ;V.registPlugin("v.views.backoffice.custom.messageSetting",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.MessageSetting",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.views.backoffice.custom.messageSetting';
			this.module = '';
			this.resource = {
				html1:'template.html'
			}
		}
	});
	(function(MessageSetting){
		MessageSetting.prototype.init = function(options){
			this.options = options;
			this.container = options.container;
			this.module = options.module;
			this.platformNo = options.platformNo||'';
			this.party = options.party||'';
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html1;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					that.initEmailSmtp();
					that.initMessageTemplate();
					that.initMessageRule();
					that.initEvent();
					
				}
		     });
			//this.addCrumb();
		}
		
		MessageSetting.prototype.initEmailSmtp = function(){
			var home = new V.Classes['v.views.backoffice.custom.EmailSetting']();
		  	home.init({
		  		container:$('#tabemailSmtp'),
		  		module:this.module,
		  		platformNo:this.platformNo
		  	});
		}
		MessageSetting.prototype.initMessageTemplate = function(){
			var messageTemplate = this.messageTemplate = new V.Classes['v.views.backoffice.custom.EmailTemplateList']();
		  	messageTemplate.init({
		  		container:$('#tabmessageTemplate'),
		  		module:this.module,
		  		platformNo:this.platformNo
		  	});
		}
		
		MessageSetting.prototype.initMessageRule = function(){
			var messageRule = this.messageRule = new V.Classes['v.views.backoffice.custom.MessageRuleList']();
			messageRule.init({
				container:$('#tabmessageSetting'),
			  	module:this.module,
			  	platformNo:this.platformNo
			});
		}
		
		MessageSetting.prototype.initEvent = function(){
			if(this.party){
				$('.partyName',this.template).html('企业名称：'+this.party.partyName)
			}
			
			var that = this;
			$('#myTab a:first').tab('show');
		    $('#myTab a').click(function (e) {
			  e.preventDefault();
			  $(this).tab('show');
			  if( $(this).attr('href')=="#emailSmtp"){
			  	$('#tabmessageTemplate').hide();
			  	$('#tabmessageSetting').hide();
			  	$('#tabemailSmtp').show();
			  }else if($(this).attr('href')=="#messageTemplate"){
			  	$('#tabmessageTemplate').show();
			  	$('#tabmessageSetting').hide();
			  	$('#tabemailSmtp').hide();
			  } else {
			  	$('#tabmessageTemplate').hide();
			  	$('#tabmessageSetting').show();
			  	$('#tabemailSmtp').hide();
			  }
			});
		}
		MessageSetting.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'消息设置详情'}});
		}
	})(V.Classes['v.views.backoffice.custom.MessageSetting']);
},{plugins:['v.views.component.searchList','v.ui.dynamicGrid','v.ui.confirm','v.ui.alert','v.views.backoffice.custom.emailSetting','v.views.backoffice.custom.emailTemplateList','v.views.backoffice.custom.messageRuleList']});