;V.registPlugin("v.views.component.switchSearchList",function(){
	V.Classes.create({
		className:"v.views.component.SwitchSearchList",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.views.component.switchSearchList';
			this.form = null;
			this.list = null;
			this.options={
				showFilters: true,		  //查询条件显隐	
				showDetail: false,        //显示类型[true:detail,false:header]
				docketType: null,         //单据类型
				headerItemsFilters: null, //头表单条件
				detailItemsFilters: null, //行表单条件
				headerFilters: null,      //头查询条件
				detailFilters: null,      //行查询条件
				listInitFlag:true,        //是否初始化list标识
				toggleText:'切换到明细',
				exportText:'导出'
			};
			this.EVENT.CONDITION_LOADED = "condition_loaded";
			this.template = $('<div class="v-search">\
								<div class="list_toolbar"></div>\
								<div class="filters">\
									<div class="well form-search"></div>\
								</div>\
								<div class="list"></div>\
							</div>');
		}
	});
	(function(SearchList){
		SearchList.prototype.init = function(options){
			var that = this;
			
			this.module = options.module;
			this.container = options.container;
			for(prop in options){
			    this.options[prop] = options[prop];
			}
			
			this.form = new V.Classes["v.component.Form"]();
			this.form.container = $('.form-search',this.template);

			if(this.options.listInitFlag){
				this.list = new V.Classes['v.ui.DynamicGrid']();
				this.list.container = $('.list',this.template);
			}
			
			this.container.append(this.template);
			
			this.subscribe(this.form,this.form.EVENT.INITED,this.searchHandler);
			
			this.initConditionForm();
			
			this.options.toggleText = (this.options.showDetail==true?'切换到汇总':'切换到明细');
		}
		SearchList.prototype.toggle = function(){
			var that = this;
			this.options.showDetail = !this.options.showDetail;
			
			if(!this.options.showDetail){
				this.options.detailFilters = this.form.getValues();
				this.options.detailItemsFilters = this.form.getItemsValues();
				if(this.options.headerItemsFilters==null){
					this.options.headerItemsFilters = {};
				}
			}else{
				this.options.headerFilters = this.form.getValues();
				this.options.headerItemsFilters = this.form.getItemsValues();
				if(this.options.detailItemsFilters==null){
					this.options.detailItemsFilters = {};
				}
			}
			
			this.options.toggleText = (this.options.showDetail==true?'切换到汇总':'切换到明细');
			this.options.filters = this.options.showDetail==true?this.options.detailFilters:this.options.headerFilters;
			
			if(this.options.filters!=null && this.options.tableType!=null){
				this.options.filters.menuCode = this.options.menuCode;
				this.options.filters.tableType = this.options.tableType;
			}
			
			this.reset();
			
			this.init(this.options);

			this.updateCrumb();
		}
		SearchList.prototype.copyJsonHandler = function(headerFilters,detailFilters,showDetail){
			if(headerFilters==null || detailFilters==null) return;
			if(showDetail){
				for(var key in headerFilters){
					detailFilters[key] = headerFilters[key];
				}
			}else{
				for(var key in headerFilters){
					headerFilters[key] = detailFilters[key];
				}
			}
		}
		SearchList.prototype.initConditionForm = function(){
			this.initMenuCondition({'tableType':(this.options.showDetail==true?"detail":"header")});
		}
		SearchList.prototype.initList = function(){
			this.log("initList method should be overwrote.");
		}
		SearchList.prototype.search = function(){
		    if(!this.form.validate()) return; 
		    
		    if(this.list){
				this.list.setFilters(this.getFilters());
				this.list.retrieveData();
		    }
			this.updateCrumb();
		}
		SearchList.prototype.getFilters = function(){
			var filters = {};
			if(this.options.showDetail){
				filters = this.options.detailFilters = this.form.getValues();
				this.options.detailItemsFilters = this.form.getItemsValues();
				if(this.options.tableType!=null){
					this.options.detailFilters.menuCode = this.options.menuCode;
					this.options.detailFilters.tableType = this.options.tableType;
				}
			}else{
				filters = this.options.headerFilters = this.form.getValues();
				this.options.headerItemsFilters = this.form.getItemsValues();
				if(this.options.tableType!=null){
					this.options.headerFilters.menuCode = this.options.menuCode;
					this.options.headerFilters.tableType = this.options.tableType;
				}
			}
			
			filters.docketType = this.options.docketType;
		    filters.showDetail = this.options.showDetail;
		    this.options.filters = filters;
		    return filters;
		}
		SearchList.prototype.searchHandler = function(){
			var that = this;
		    
			var filters = null;
			if(this.options.showDetail){
				filters = this.options.detailFilters = this.form.getValues();
				this.options.detailItemsFilters = this.form.getItemsValues();
				this.copyJsonHandler(this.options.headerFilters,this.options.detailFilters,this.options.showDetail);
			}else{
				filters = this.options.headerFilters = this.form.getValues();
				this.options.headerItemsFilters = this.form.getItemsValues();
				this.copyJsonHandler(this.options.headerFilters,this.options.detailFilters,this.options.showDetail);
			}
			filters.docketType = this.options.docketType;
		    filters.showDetail = this.options.showDetail;
		    if(this.options.tableType!=null){
				filters.menuCode = this.options.menuCode;
				filters.tableType = this.options.tableType;
			}
			
		    this.options.filters = filters;
		    
			var btn_search = $('<button class="btn btn-primary btn-search">查询</button>');
			var btn_reset = $('<button class="btn btn-reset">重置</button>');
			var btn_hide = $('<button class="btn btn-hide">隐藏</button>');
			btn_search.click(function(){
				that.search();
			});
			btn_reset.click(function(){
				that.form.reset();
			});
			btn_hide.click(function(){
				$('.filters',that.template).hide();
			});
			
			$('.form-search',that.template).append($('<div class="row-fluid btns" style="text-align:center"></div>').append(btn_search).append(btn_hide));
			
			if(this.options.showFilters){
				$('.filters',this.template).css('display','block');
			}else{
				$('.filters',this.template).css('display','none');
			}
			
			if(this.options.listInitFlag){
				this.list.setToolbarPlaceholder($('.list_toolbar',this.template));
				this.list.setToolbar([{eventId:'toggle_search',text:'查询',icon:'icon-search'}]);
				this.subscribe(this.list,'toggle_search',function(){
					var isHidden = ($('.filters',that.template).css('display')== 'none');
					if(isHidden){
						$('.filters',that.template).show();
					}else{
						$('.filters',that.template).hide();
					}
				});
				
				btn_search.attr('disabled',true);
				this.subscribe(this.list,this.list.EVENT.DATA_LOADED,function(){
					btn_search.attr('disabled',false);
				});
			}
			
			that.initList();
		}
		SearchList.prototype.initMenuCondition = function(options){
			var that = this;
			this.options.tableType = options.tableType;
			var Form = V.Classes['v.component.Form'];
			$.ajax({
				url:'menucondition.action',
				type:'POST',
				dataType:'json',
				contentType:'application/json',
				data:JSON.stringify({menuCode:that.options.menuCode,tableType:options.tableType}),
				async:false,
				success:function(condition){
					var items = [];
					var plugins = [];
					$.each(condition,function(){
						var label = this.conditionName;
						var type = this.conditionType;
						var name = this.conditionCode;
						var value = this.conditionValue;
						var dictTypeCode = this.dictTypeCode||'';
						var operator = this.conditionOperator;
						var plugin = this.ns;
						var url = this.url||'';
						var params = this.params||'';
						var multiList = [['全部','']];
						var role = this.conditionRole;
						
						if(type==Form.TYPE.DATE){
							if(operator=='9'){
								type = Form.TYPE.DATERANGE;
								if(value==null||value=='')
									value = V.Util.getDateRange();
								else
									value = value.split(',');
							}
						}
						else if(type==Form.TYPE.TEXT || type==Form.TYPE.NUMBER){
							if(operator=='9'){
								type = Form.TYPE.FIELDRANGE;
								if(value==null||value=='')
									value = '';
								else
									value = value.split(',');
							}
						}
						else if(type==Form.TYPE.SELECT){
							value = DictInfo.getDefault(dictTypeCode);
							$.merge(multiList,DictInfo.getList(dictTypeCode));
							if(dictTypeCode=='BUSINESS_TYPE'){
								name = 'businessType';
								multiList = that.queryBusiness();
								var aa = multiList;
							}
						}else if(type==Form.TYPE.PLUGIN){
							plugins.push(plugin);
						}
						
						var item = {
							'label':label,
							'type':type,
							'name':name,
							'value':value,
							'multiList':multiList,
							'operator':operator,
							'plugin':plugin,
							'url':url,
							'params':params
						}
						
						items.push(item);
					});
					
					if(!that.options.showDetail && that.options.headerItemsFilters && $.isEmptyObject(that.options.headerItemsFilters)){
						$.each(items,function(){
							that.options.headerItemsFilters[this.name] = this.value;
						})
					}
					
					that.copyJsonHandler(that.options.headerItemsFilters,that.options.detailItemsFilters,that.options.showDetail);
					var itemsFilters = that.options.showDetail==true?that.options.detailItemsFilters:that.options.headerItemsFilters;
					if(plugins.length>0){
						V.loadPlugins(plugins,function(){
							if(itemsFilters){
								$.each(items,function(m,item){
									var key = item.plugin||item.name;
									item.value = itemsFilters[key]||'';
								});
							}
							that.form.init({
								colspan:2,
								items:items
							});
						});
					}else{
						if(itemsFilters){
							$.each(items,function(m,item){
								var key = item.plugin||item.name;
								item.value = itemsFilters[key]||'';
							});
						}
						that.form.init({
							colspan:2,
							items:items
						});
					}
				}
			})
		}
		SearchList.prototype.queryBusiness = function(){
			var that = this;
			var businessList = [['全部','']];
			$.ajax({
				url : 'finance/query/financequery/finance-query!listBusiness.action',
				dataType : 'json',
				async:false,
				success : function(data){
					$.each(data.businessList,function(){
						businessList.push([this.value,this.key]);
					});
					if(businessList.length==0){
						V.alert('经营方式参数错误，请检查！');
					}
				}
			});
			return businessList;
		}
		SearchList.prototype.exportDockets = function(){
			var pagination = this.list.pagination;
			if (pagination.options.count > 20000) {
				V.alert("导出的数据大于2万条，请修改查询条件。");
				return;
			}
			if (pagination.options.count == 0) {
				V.alert("没有数据可以导出，请修改查询条件。");
				return;
			}
			var form_print = $('.docket_export_form',this.template).empty();
			if(form_print.length==0){
				form_print = $('<form action="excel!exportExcel.action" type="POST" class="docket_export_form" style="display:none"></form>');
			}
			$.each(this.list.filters,function(prop,val){
				if(prop=='page') return true;
				var input = $('<input type="hidden" name="'+prop+'" value='+val+'>');
				form_print.append(input);
			});
			form_print.append('<input type="hidden" name="moduleCode" value='+this.module+'>');
			this.template.append(form_print);
			form_print[0].submit();
		}
		SearchList.prototype.exportPdf = function(record){
			var form_print = $('.docket_export_pdf_form',this.template).empty();
			if(form_print.length==0){
			    form_print = $('<form action="common!exportPdf.action" type="POST" class="docket_export_pdf_form" style="display:none"></form>');
			}
			form_print.append('<input type="hidden" name="id" value='+record["id"]+'>');
			form_print.append('<input type="hidden" name="docketType" value='+this.options.docketType+'>');
			form_print.append('<input type="hidden" name="showDetail" value='+this.options.showDetail+'>');
			this.template.append(form_print);
			form_print[0].submit();
		}
		SearchList.prototype.reset = function(){
			this.template.remove();
			this.template = $('<div class="v-search"><div class="list_toolbar"></div><div class="filters"><div class="well form-search"></div></div><div class="list"></div></div>');
		}
		SearchList.prototype.updateCrumb = function(){
			var name = this.options.menuName;
			if(this.options.showDetail){
				name = name + '(详情)';
			}else{
				name = name + '(汇总)';
			}
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:name}});
		}
		SearchList.prototype.addCrumb = function(){
			var name = this.options.menuName;
			if(this.options.showDetail){
				name = name + '(详情)';
			}else{
				name = name + '(汇总)';
			}
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:name}});
		}
	})(V.Classes['v.views.component.SwitchSearchList']);
},{plugins:['v.component.form','v.ui.dynamicGrid','v.ui.pagination']});
