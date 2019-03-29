;V.registPlugin("v.views.tools.docketManage.match",function(){
	V.Classes.create({
		className:"v.views.tools.docketManage.Match",
		superClass:"v.Plugin",
		init:function(){
			this.car = null;
			this.ns  = 'v.views.tools.docketManage.match';
			this.module = '';
			this.options = {
				matchId : '',
				matchCode:''
			}
			this.matchInfo = null;
			this.EVENT = {
			   
			}
			this.template = $('<div class="match">\
										<div class="con">\
											<div class="docket">\
											    <div class="title header_title"><i class="icon-chevron-down"></i><span>匹配单信息</span></div>\
												<div class="summary">\
												    <div class="base"></div>\
												</div>\
												<div class="title header_title"><i class="icon-chevron-down"></i><span>匹配单匹配信息</span></div>\
												<div class="dockets">\
												</div>\
											</div>\
										</div>\
									</div>')
		}
	});
	(function(Match){
		Match.prototype.init = function(options){
			this.container  = options.container;
			this.module = options.module;
			this.platformNo = options.platformNo;
			for(prop in options){
				this.options[prop] = options[prop];
			}
			this.container.append(this.template);
			this.initEvent();
			this.initDocket();
			//this.addCrumb();
		}
		Match.prototype.initEvent = function(){
			$('.title i',this.template).click(function(){
                if($(this).hasClass('icon-chevron-down')){
                    $(this).removeClass('icon-chevron-down').addClass('icon-chevron-right');
                    $(this).parent().next().slideUp();
                }else{
                    $(this).removeClass('icon-chevron-right').addClass('icon-chevron-down');
                    $(this).parent().next().slideDown();
                }
            })
		}
		
		Match.prototype.initDocket = function(){
			var that = this;
			if(this.options.matchId){
				$.ajax({
					url: this.module + '/queryMatchInfo.action',
					data:{matchId:this.options.matchId,matchCode:this.options.matchCode},
					dataType:'json',
					success:function(match){
						that.matchInfo = match;
						that.initSummary();
						that.initDocketsList();
					}
				})
			}
		}
		//初始化结算车的单据信息
		Match.prototype.initDocketsList = function(){
			var dockets = this.matchInfo.dataTypes;
			var lists = $('<div><ul class="nav nav-tabs"></ul><div class="tab-content"></div></div>');
			var that = this;
			$('.dockets',this.template).empty().append(lists);
			//docket:{name:'入库单',url:''};
			$.each(dockets,function(i){
				var type = this.type;
				var tab = $('<li><a href="javascript:void(0);">'+this.name+'</a></li>').data({type:type});
				var tab_pane = $('<div class="tab-pane"></div>').data({type:type});
				$('.tab-content',lists).append(tab_pane);
				tab.one('click',function(){
					var url = $(this).data('url');
					var type = $(this).data('type');
					var index = $(this).index();
					var tabpane = $('.tab-content .tab-pane:eq('+index+')',lists);
					if(type == CONSTANT.DOCKET_TYPE.INVOICE){
						var list = new V.Classes['v.ui.Grid']();
						var pagination = new V.Classes['v.ui.Pagination']();
			            list.setPagination(pagination); 
						list.init({
							url : url,
							container : tabpane,
							columns:[
							    {displayName:'发票代码',key:'invkind',width:100}
								,{displayName:'发票号码',key:'invnum',width:100}
								,{displayName:'购方税号',key:'buyerTax',width:100}
								,{displayName:'销方税号',key:'sellerTax',width:100}
								,{displayName:'开票日期',key:'invdate',width:100}
								,{displayName:'发票金额',key:'invcost',width:100}
								,{displayName:'发票税率',key:'invrate',width:100}
							]
						});
					}else{
						var list = new V.Classes['v.views.tools.ui.DynamicGrid']();
						var pagination = new V.Classes['v.ui.Pagination']();
			            list.setPagination(pagination);
						list.init({
							url : url,
							container : tabpane
						});
					}
				})
				tab.data('url',this.url);
				$('ul',lists).append(tab);
			});
			var tabs = $('.nav-tabs',lists).children('li');
			var panes = $('.tab-content',lists).children('.tab-pane');
			tabs.click(function(){
				if($(this).hasClass('active')){
					return false;
				}else{
					tabs.removeClass('active');
					$(this).addClass('active');
					panes.removeClass('active');
					var index = $(this).index();
					$(panes.get(index)).addClass('active');
				}
			});
			$(tabs[0]).trigger('click');
		}
		Match.prototype.initSummary = function(){
			$('.summary .base',this.template).empty();
			var base = this.matchInfo.match;
			var detail = this.matchInfo.matchCartDetails;
			var Form = V.Classes['v.component.Form'];
			var form = new Form();
			var items = [{
				label: '购方公司名称',
				name: 'buyerName',
				type: Form.TYPE.READONLY,
				value: base.buyerName
			}, {
				label: '销方公司名称',
				name: 'sellerName',
				type: Form.TYPE.READONLY,
				value: base.sellerName
			}, {
				label: '购方公司编码',
				name: 'buyerCode',
				type: Form.TYPE.READONLY,
				value: base.buyerCode
			}, {
				label: '销方公司编码',
				name: 'sellerCode',
				type: Form.TYPE.READONLY,
				value: base.sellerCode
			}, {
				label: '购方公司税号',
				name: 'buytaxno',
				type: Form.TYPE.READONLY,
				value: base.buytaxno
			}, {
				label: '销方公司税号',
				name: 'selltaxno',
				type: Form.TYPE.READONLY,
				value: base.selltaxno
			}, {
				label: '发票总金额',
				name: 'invsum',
				type: Form.TYPE.READONLY,
				value: base.invsum
			}, {
				label: '发票总张数',
				name: 'invcount',
				type: Form.TYPE.READONLY,
				value: base.invcount
			}, {
				label: '单据总金额',
				name: 'billssum',
				type: Form.TYPE.READONLY,
				value: base.billssum
			}, {
				label: '单据总张数',
				name: 'billscount',
				type: Form.TYPE.READONLY,
				value: base.billscount
			} ,{
				label: '状态',
				name: 'processStatus',
				type: Form.TYPE.READONLY,
				value: DictInfo.getValue('PROCESS_STATUS',base.processStatus,this.platformNo)
			} ];
			form.init({
				container: $('.summary .base', this.template),
				items: items,
				colspan: 2
			});
		}
		Match.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'匹配单详情'}});
		}
	})(V.Classes['v.views.tools.docketManage.Match']);
},{plugins:['v.views.tools.ui.dynamicGrid','v.ui.pagination','v.ui.dialog','v.component.form','v.views.component.docketDetailViewer']});
