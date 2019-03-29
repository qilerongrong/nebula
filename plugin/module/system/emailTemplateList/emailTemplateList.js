;V.registPlugin("v.module.system.emailTemplateList",function(){
	V.Classes.create({
		className:"v.module.system.EmailTemplateList",
		superClass:"v.component.SearchList",
		init:function(){
            this.ns = 'v.module.system.emailTemplateList';
        	this.module = '';
        	this.list = new V.Classes['v.ui.Grid']();
			this.form = new V.Classes["v.component.Form"]();
		}
	});
	(function(EmailTemplate){
		EmailTemplate.prototype.initConditionForm = function(){
		    var Form = V.Classes['v.component.Form'];
			var items = [
		       {label:'模版名称',type:Form.TYPE.TEXT,name:'name',value:''}
		       ,{label:'模版标题',type:Form.TYPE.TEXT,name:'title',value:''}
			];
			var filters = this.options.filters;
			if(filters&& filters.length>0){
				$.each(items,function(m,item){
					var key = this.name;
					$.each(filters,function(){
						if(key == this.key){
							item.value = this.value;
							return false;
						}
					})
				});
			}
			this.form.init({
				colspan:2,
				items:items
			});
		}
		EmailTemplate.prototype.initList = function(){
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			var that = this;
			list.init({
				container : $('.list', this.template),
				checkable : true,
				url : 'backoffice/email-template!list.action',
				columns : [
					{
						displayName : '模版名称',
						key : 'name',
						width : 100
					},
					{
						displayName : '模版标题',
						key : 'title',
						width : 100
					},
					{
						displayName : '描述',
						key : 'description',
						width : 160
					},
					{
						displayName : '操作',
						key : 'action',
						width : 50,
						render : function(record) {
							html = $('<div class="action"><a class="edit" href="javascript:void(0);" title="修改"><i class="icon-edit"></i></a><a class="delete" href="javascript:void(0);" title="删除"><i class="icon-remove"></i></a><div>');
							$('.edit', html).click(function() {
								that.editTemplate(record);
							});
							$('.delete', html).click(function() {
								that.removeTemplate(record);
							});
							return html;
						}
				    }
				],
				toolbar:[
			          {eventId:'add',text:'新增模版',icon:'icon-plus'},
					  {eventId:'remove',text:'删除模版',icon:'icon-remove'}
				]
			});
			this.subscribe(list,'add',this.editTemplate);
			this.subscribe(list,'remove',this.removeTemplates);
		}
		EmailTemplate.prototype.editTemplate = function(record){
			var options = {};
			options.module = this.module;
			options.emailTemplate = record;
			this.forward('v.module.system.emailTemplateEdit',options,function(p){
				p.addCrumb();
			});
		}
		EmailTemplate.prototype.removeTemplates = function(){
			var ids = "";
			this.removeTemplate(ids);
		}
		EmailTemplate.prototype.removeTemplate = function(ids){
			var that = this;
			if(!ids||ids.length==0){
				V.alert('请选择要删除的模版。');
				return;
			}
			V.confirm("确定删除邮件模版?",function(e){
				$.ajax({
					url:'backoffice/email-template!delete.action',
					type:'post',
					data:{id:record['id']},
					success:function(data){
						if(data == 'success'){
			              	V.alert("删除成功!");
			              	that.list.removeRecord(record);
			             }else{
			                V.alert(data);
		                 }	
					}
				})
			});
		}
		EmailTemplate.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'邮件模版列表'}});
		}
		EmailTemplate.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'邮件模版列表'}});
		}
	})(V.Classes['v.module.system.EmailTemplateList']);
},{plugins:['v.component.searchList','v.ui.dynamicGrid','v.ui.confirm','v.ui.alert',"v.ui.fileUpload"]});
