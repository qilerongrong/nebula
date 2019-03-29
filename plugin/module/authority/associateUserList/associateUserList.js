;V.registPlugin("v.views.backoffice.authority.associateUserList",function() {
	V.Classes.create({
				className : "v.views.backoffice.authority.AssociateUserList",
				superClass : "v.Plugin",
				init : function() {
					this.ns = 'v.views.backoffice.authority.associateUserList';
					this.module = '';
					this.list = new V.Classes['v.ui.DynamicGrid']();
					this.form = new V.Classes["v.component.Form"]();
				}
			});
	(function(AssociateUserList) {
		AssociateUserList.prototype.initConditionForm = function() {
			var Form = V.Classes['v.component.Form'];
			this.form.init({
				colspan : 3,
				items : [ {
					label : '主体编码',
					type : Form.TYPE.TEXT,
					name : 'brandCode',
					value : ''
				}, {
					label : '主体名称',
					type : Form.TYPE.TEXT,
					name : 'brandName',
					value : ''
				} ]
			});
		}
		AssociateUserList.prototype.init = function(options) {
			this.options = options;
			this.container = options.container;
			this.module = options.module;
			this.initList();
			this.addCrumb();
		}
		AssociateUserList.prototype.initList = function() {
			this.list = new V.Classes['v.ui.Grid']();
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			var that = this;
			list.init({
						container : this.container,
						checkable : false,
						url : this.module
								+ '/partypartner!detailList.action',
						columns : [
								{
									displayName : '主体编码',
									key : 'PLATFORM_NO',
									width : 120
								},
								{
									displayName : '主体名称',
									key : 'PLATFORM_NAME',
									width : 120
								},
								{
									displayName : '关联帐号',
									key : 'loginName',
									width : 120
								},
								{
									displayName : '关联状态',
									key : 'status',
									width : 120
								},
								{
									displayName : '操作',
									key : 'action',
									width : 50,
									render : function(record) {
										var html = $('<div><a class="change" href="javascript:void(0);" title="关联"><i class="icon-edit"></i></a><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="取消关联"><i class="icon-remove"></i></a><div>');
										$('.change', html)
												.click(
														function() {
															that.editAssociate(record);
														});
										$('.remove', html)
												.click(
														function() {
															that.removePost(record);
														});
										return html;
									}
								} ] 
					});
	 
			this.subscribe(list, 'remove', this.removePosts);
			this.container.append(this.template);
		}
		AssociateUserList.prototype.editAssociate = function(record) {
			var options = {};
			options.module = this.module;
			this.forward('v.views.backoffice.authority.associateUser',options);
		}
		AssociateUserList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'关联账号列表'}});
		}
		AssociateUserList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'关联账号列表'}});
		}
	})(V.Classes['v.views.backoffice.authority.AssociateUserList']);
}, {plugins : [ 'v.component.searchList', "v.ui.grid",'v.ui.confirm', 'v.ui.alert', 'v.ui.dynamicGrid',"v.ui.dialog" ]});