;V.registPlugin("v.views.tools.docketManage.cancelAccountDetail",function(){
	V.Classes.create({
		className:"v.views.tools.docketManage.CancelAccountDetail",
		superClass:"v.Plugin",
		init:function(){
			this.car = null;
			this.ns  = 'v.views.tools.docketManage.cancelAccountDetail';
			this.module = '';
			this.options = {
				docketId : ''
			}
			this.type = '';
			this.docketHeader = {};
			this.showDetail = true;
			this.EVENT = {
			   
			}
			this.template = $('<div class="balanceDocket">\
									    <div class="header"><div class="legend">\
											<div class="docket_title">结算单详情</div>\
										</div></div>\
										<div class="con">\
											<div class="docket">\
											    <div class="title header_title"><i class="icon-chevron-down"></i><span>结算单信息</span></div>\
												<div class="summary">\
												    <div class="base"></div>\
													<div class="detail"></div>\
												</div>\
												<div class="title header_title"><i class="icon-chevron-down"></i><span>结算单单据信息</span></div>\
												<div class="dockets">\
												</div>\
											</div>\
										</div>\
									</div>')
		}
	});
	(function(BalanceDocket){
		BalanceDocket.prototype.init = function(options){
			this.container  = options.container;
			this.module = options.module;
			this.cModule = options.cModule;
			this.options.docketId = options.docketId;
			this.platformNo = options.platformNo;
			this.container.append(this.template);
			this.initEvent();
			this.initDocket();
			//this.addCrumb();不在init方法中触发，在需要的地方手动触发。
			var that = this;
			var btn_toggle = $('<button class="btn switch btn-primary" style="position:absolute;top:0px;right:100px;">切换到汇总</button>');
			btn_toggle.click(function(){
				that.toggle();
			});
			var btn_export = $('<button class="btn btn-primary" style="position:absolute;top:0px;right:0px;">取消结算单</button>');
			btn_export.click(function(){
				that.cancelAccount();
			});
			this.template.append(btn_toggle).append(btn_export);
		}
		BalanceDocket.prototype.initEvent = function(){
			$('.title i',this.template).click(function(){
                if($(this).hasClass('icon-chevron-down')){
                    $(this).removeClass('icon-chevron-down').addClass('icon-chevron-right');
                    $(this).parent().next().slideUp();
                }else{
                    $(this).removeClass('icon-chevron-right').addClass('icon-chevron-down');
                    $(this).parent().next().slideDown();
                }
            });
		}
		BalanceDocket.prototype.initDocket = function(){
			var that = this;
			this.initSummaryBase();
            //this.initSummaryDetail();//获取同一税率列表
            
			$.ajax({
				url: this.module + '/cancel-account!queryAccountInfo.action',
				data:{accountId:this.options.docketId},
				dataType:'json',
				success:function(docket){
					that.initDocketsList(docket);
				}
			})
		}
		BalanceDocket.prototype.cancelAccount = function(){
			var that = this;
			V.confirm('是否进行取消结算单操作',function(){
				$.ajax({
					url: that.cModule+'/cancel-account!cancel.action',
					data:{accountId:that.options.docketId},
					success:function(data){
						if(data=='success'){
							V.alert('取消结算单成功！');
							V.MessageBus.publish({eventId:'backCrumb'});
						}else{
							V.alert(data);
						}
					}
				});
			})
		}
		BalanceDocket.prototype.toggle = function(){
			this.showDetail = !this.showDetail;
			if(this.showDetail){
				$('.switch',this.template).text('切换到汇总');
			}else{
				$('.switch',this.template).text('切换到明细');
			}
			var that = this;
			var tabs = $('.nav-tabs li',this.template);
			//$('.tab-content',this.template).empty();
			$.each(tabs,function(index,tab){
				var list = $(tab).data('list');
				var hasDetail = (list&&list.hasDetail)||false;
				if(hasDetail){
					//不会清楚live的事件（显示影藏的切换事件）;
					$(tab).unbind('click').one('click',function(){
						//var tab_pane = $('<div class="tab-pane"></div>').data({type:this.type});
						//$('.tab-content',that.template).append(tab_pane);
						that.type = $(this).data('type');
						var url = $(this).data('url');
						var type = $(this).data('type');
						var list = new V.Classes['v.views.tools.ui.DynamicGrid']();
						var pagination = new V.Classes['v.ui.Pagination']();
			            list.setPagination(	pagination);
						var index = $(this).index();
						var tabpane = $('.tab-content .tab-pane:eq('+index+')',that.template).empty();
						
			            if(url.indexOf('?') == -1){
			            	url += '?showDetail='+ that.showDetail;
			            }else{
			            	url += '&showDetail='+that.showDetail;
			            }
						list.init({
							url : url,
							container : tabpane,
							platformNo:that.platformNo,
							columns:[
	                            {key:'sellerCode',width:120,render:function(record){
	                                var html = $('<a href="javascript:void(0);" class="link">'+record.sellerCode+'</a>');
	                                html.tooltip({
	                                    title:'<p>销方名称：'+record.sellerName+'</p><p>销方税号：'+record.sellerTax+'</p>',
	                                    placement:'bottom',
	                                    html:true,
	                                    animate:true
	                                });
	                                return html;
	                            }},
	                            {key:'buyerCode',width:120,render:function(record){
	                                var html = $('<a href="javascript:void(0);" class="link">'+record.buyerCode+'</a>');
	                                html.tooltip({
	                                    title:'<p>购方名称：'+record.buyerName+'</p><p>购方税号：'+record.buyerTax+'</p>',
	                                    placement:'bottom',
	                                    html:true,
	                                    animate:true
	                                });
	                                return html;
	                            }}
	                        ]
						});
						$(this).data('list',list);
					});
					if($(tab).data('type') == that.type){
						tab.click();
					}
				}
			});
		}
		//初始化结算车的单据信息
		BalanceDocket.prototype.initDocketsList = function(docket){
			var dockets = docket.dataTypes;
			if(dockets.length == 0){
				this.log('该结算单没有明细单据。');
				return;
			}
			var lists = $('<div><ul class="nav nav-tabs" ></ul><div class="tab-content"></div></div>');
			var that = this;
			$('.dockets',this.template).empty().append(lists);
			//docket:{name:'入库单',url:''};
			$.each(dockets,function(i){
				var tab = $('<li><a href="javascript:void(0);">'+this.name+'</a></li>').data({type:this.type});
				var tab_pane = $('<div class="tab-pane"></div>');
				tab.one('click',function(){
					var type = that.type = $(this).data('type');
					var url = $(this).data('url');
					var list = new V.Classes['v.views.tools.ui.DynamicGrid']();
					var pagination = new V.Classes['v.ui.Pagination']();
		            list.setPagination(pagination);
		            
					var index = $(this).index();
					var tabpane = $('.tab-content .tab-pane:eq('+index+')',that.template).empty();
		            if(url.indexOf('?') == -1){
		            	url += '?showDetail='+ that.showDetail;
		            }else{
		            	url += '&showDetail='+that.showDetail;
		            }
					list.init({
						url : url,
						platformNo:that.platformNo,
						container : tabpane
					});
					$(this).data('list',list);
				});
				tab.data('url',this.url);
				$('ul',lists).append(tab);
				$('.tab-content',lists).append(tab_pane);
			});
			var tabs = $('.nav-tabs',that.template).children('li');
			var panes = $('.tab-content',that.template).children('.tab-pane');
			$('.nav-tabs li',that.template[0]).live('click',function(){
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
			if(that.type != ''){
				$.each(tabs, function(index,dom){
					if($(dom).data('type') == that.type){
						$(dom).click();
					}
				});
			}else{
				tabs[0].click();
			}
			
		}
		//查看同一税率的各单据行信息
		BalanceDocket.prototype.viewDocketDetail = function(record){
		    var that = this;
		    
		    $.ajax({
                url: this.module + '/queryDocketDetailByAccountDetailCode.action',
                data:{accountDetailCode:record.accountDetailCode},
                dataType:'json',
                success:function(docketDetail){
                    var lists = $('<div><ul class="nav nav-tabs" style="margin-bottom:8px"></ul><div class="tab-content"></div></div>');
                    $.each(docketDetail,function(i){
                        var tab = $('<li><a href="javascript:void(0);">'+this.name+'</a></li>');
                        var tab_pane = $('<div class="tab-pane"></div>');
                        if(i == 0){
                            tab.addClass('active');
                            tab_pane.addClass('active');
                            var list = new V.Classes['v.views.tools.ui.DynamicGrid']();
                            var pagination = new V.Classes['v.ui.Pagination']();
                            list.setPagination(pagination);
                            list.init({
                                url : this.url,
                                platformNo:that.platformNo,
                                container : tab_pane
                            });
                        }else{
                            tab.one('click',function(){
                                var url = $(this).data('url');
                                var list = new V.Classes['v.views.tools.ui.DynamicGrid']();
                                var pagination = new V.Classes['v.ui.Pagination']();
                                list.setPagination(pagination);
                                var index = $(this).index();
                                var tabpane = $('.tab-content .tab-pane:eq('+index+')');
                                list.init({
                                    url : url,
                                    platform:that.platform,
                                    container : tabpane
                                });
                            })
                        }
                        tab.data('url',this.url);
                        $('ul',lists).append(tab);
                        $('.tab-content',lists).append(tab_pane);
                    });
                    var tabs = $('.nav-tabs li',lists)
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
                    
                    var dlg = new V.Classes['v.ui.Dialog']();
                    dlg.setBtnsBar({btns:[
                        {text:"关闭",style:"btn-primary",handler:dlg.close}
                    ]});
                    
                    var options = {
                        width:850,
                        height:500,
                        title:'单据明细信息'
                     };
                     
                    dlg.setContent(lists); 
                    dlg.init(options);
                }
            })
		}
		//结算单头信息
		BalanceDocket.prototype.initSummaryBase = function(){
		    var that = this;
			$('.summary .base',this.template).empty();
			
			$.ajax({
                url: this.module + '/queryAccountInfoHead.action',
                data:{accountId:this.options.docketId},
                dataType:'json',
                async:false,
                success:function(data){
                    var header = data;
                    var custom = header.custom;
                    var data = header.data;
                    that.docketHeader = data;
                    var Form = V.Classes['v.component.Form'];
                    var BlockForm = V.Classes['v.component.BlockForm'];
                    var form = new BlockForm();
                    var items = [];
                    
                    $.each(custom,function(){
                        var isUsed = this.isUsed;
                        if(isUsed){
                            var item = {
                            	name:this.fieldName,
                                key:this.fieldName
                                ,label:this.fieldLabel
                                ,value:data[this.fieldName]||''
                                ,type:V.Classes['v.component.Form'].TYPE.READONLY
                                ,isBlock:this.isBlock
                            };
                            if(this.dataType == V.Classes['v.component.Form'].TYPE.SELECT){ //转义select
                            	try{ 
									var dirModule = DictInfo.getVar(this.dictTypeCode,that.platformNo);
									if(dirModule){
										var _dirModule = V.Util.clone(dirModule);
										item.value = _dirModule[data[this.fieldName]];
									}
								}catch(e){ 
									that.log('数据字典没有定义<'+this.dictTypeCode+'>'); 
								}
                            }
                            items.push(item);
                        }
                    });
                    
                    form.init({
                        container: $('.docket .base', that.template),
                        items: items,
                        colspan: 2
                    });
                }
            })
		}
		//结算单行信息	
		BalanceDocket.prototype.initSummaryDetail = function(){
		    var that = this;
		    $('.summary .detail',this.template).empty();
			var detailList = new V.Classes['v.views.tools.ui.DynamicGrid']();
			var pagination = new V.Classes['v.ui.Pagination']();
            detailList.setPagination(pagination);
            detailList.setFilters({accountId:this.options.docketId});
            
			detailList.init({
				container: $('.docket .detail', this.template),
				platformNo:that.platformNo,
				url: this.module + '/queryAccountInfoDetail.action',
				hasData : true
			});
			
			detailList.setActionColumn({
                displayName: '操作',
                key: 'action',
                width: 80,
                render: function(record){
                    var html = $('<div class="action"><a class="view" href="javascript:void(0);" title="查看明细"><i class="icon-search"></i></a></div>');
                    $('.view', html).click(function(){
                        that.viewDocketDetail(record);
                    });
                    return html;
                }
            });
		}
		BalanceDocket.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'结算单查看'}});
		}
	})(V.Classes['v.views.tools.docketManage.CancelAccountDetail']);
},{plugins:['v.views.tools.ui.dynamicGrid','v.ui.dialog','v.component.blockForm']});
