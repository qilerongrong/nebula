/**
 * 采销规则定制列表-运维
 */
;V.registPlugin("v.views.backoffice.custom.orderRulesList",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.OrderRulesList",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = "v.views.backoffice.custom.orderRulesList";
			this.module = '';
			this.options = {};
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.Grid']();
		}
	});
	(function(OrderRulesList){
       OrderRulesList.prototype.initConditionForm = function(){
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
		};
        OrderRulesList.prototype.initList = function() {
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
							render:function(record){
		                        var html = $('<div class="action"><a class="change" href="javascript:void(0);" title="修改"><i class="icon-edit"></i></a></div>');
		                        $('.change',html).click(function(){
		                            that.editFinanceRule(record);
		                        });
		                        return html;
		                    }
						} ]
			});
		}
        OrderRulesList.prototype.editFinanceRule = function(record){
        	this.options.module = this.module;
        	this.options.platformNo = record.platformNo;
        	this.options.party = record;
			this.forward('v.views.backoffice.custom.orderRules',this.options,function(p){
				p.addCrumb();
			});
		}
		OrderRulesList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'采销规则定制'}});
		}
		OrderRulesList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'采销规则定制'}});
		}
	})(V.Classes['v.views.backoffice.custom.OrderRulesList'])
},{plugins:["v.ui.grid","v.views.component.searchList","v.ui.pagination","v.component.form"]});
