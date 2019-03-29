;V.registPlugin("v.views.backoffice.custom.messageSettingList",function() {
	V.Classes.create({
				className : "v.views.backoffice.custom.MessageSettingList",
				superClass : "v.views.component.SearchList",
				init : function() {
					this.ns = 'v.views.backoffice.custom.messageSettingList';
					this.module = '';
					this.list = new V.Classes['v.ui.Grid']();
					this.form = new V.Classes["v.component.Form"]();
				}
			});
	(function(PartyRegistList) {
		PartyRegistList.prototype.initConditionForm = function() {
			var Form = V.Classes['v.component.Form'];
			var items = [
					       	{
					       		label:'平台编码',
					       		type:Form.TYPE.TEXT,
					       		name:'platformNo',value:''
					       	},
					       	{
								label : '主体名称',
								type : Form.TYPE.TEXT,
								name : 'partyName',
								value : ''
							}
					];
			
			var itemsFilters = this.options.itemsFilters;
            if(itemsFilters){
                $.each(items,function(m,item){
                	var key = item.plugin||item.name;
                	item.value = itemsFilters[key]||'';
                });
            }
			this.form.init({
				colspan:3,
				items:items
			});
		}
		PartyRegistList.prototype.initList = function() {
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			list.setFilters(this.options.filters);
			var that = this;
			list.init({
						container : $('.list', this.template),
						checkable : true,
						url : this.module+ '/partyList.action',
						columns : [{
									displayName : '平台编码',
									key : 'platformNo',
									width : 120
								},{
									displayName : '主体编码',
									key : 'partyCode',
									width : 120
								},{
									displayName : '主体名称',
									key : 'partyName',
									width : 240
								},{
									displayName : '操作',
									key : 'action',
									width : 40,
									render : function(record) {
										var html = $('<div class="action"><a class="edit" href="javascript:void(0);" title="编辑系统单据"><i class="icon-edit"></i></a><div>');
										$('.edit', html).click(
											function() {
												that.editTicket(record);
											});
										return html;
									}
								} ]
					});
		}
		PartyRegistList.prototype.editTicket = function(record){
			var options = {};
			options.platformNo = record.platformNo;
			options.party = record;
			options.module = this.module;
			this.forward('v.views.backoffice.custom.messageSetting',options,function(p){
				p.addCrumb();
			});
		}
		PartyRegistList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'消息设置'}});
		}
	})(V.Classes['v.views.backoffice.custom.MessageSettingList']);
}, {
	plugins : [ 'v.views.component.searchList', "v.ui.grid",'v.ui.dynamicGrid']
});

		
 
