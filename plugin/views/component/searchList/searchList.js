;V.registPlugin("v.views.component.searchList",function(){
	V.Classes.create({
		className:"v.views.component.SearchList",
		superClass:"v.component.SearchList",
		init:function(){
            this.ns = 'v.views.component.searchList';
			this.options.showDetail = false;
			this.options.exportText = this.getLang("TITLE_EXPORT");
			this.EVENT.CONDITION_LOADED = "condition_loaded";
			//点击重置的时候,防止走searchHandler方法,避免表单以及按钮重画
			this.flag=true;
		}
	});
	(function(SearchList){
		SearchList.prototype.searchHandler = function(){
			if(this.flag === true ){
				var that = this;
			    that.options.filters = this.getFilters();
			    var btn_search = $('<button class="btn btn-primary btn-search"><i class="icon-search"></i>'+this.getLang("BTN_SEARCH")+'</button>');
				var btn_reset = $('<button class="btn btn-reset"><i class="icon-reset"></i>'+this.getLang("BTN_RESET")+'</button>');
				var btn_hide = $('<button class="btn btn-hide"><i class="icon-hide"></i>'+this.getLang("BTN_HIDE")+'</button>');
				
				btn_search.click(function(){
					that.search();
				});
				
				btn_reset.click(function(){
					that.flag=false;
					//初始化colspan的值
					that.form.options.colspan =3;
					
					//luzhimin 2016-8-22 update
					var items = that.form.options.items;
					var Form = V.Classes['v.component.Form'];
					if(items){
						$.each(items,function(){
//							if(this.type == Form.TYPE.PLUGIN){
								this.value = "";
//							}
						})
					}
					that.form.repaint();
					
					//that.initConditionForm();
				});

				btn_hide.click(function(){
					$('.filters',that.template).hide();
				});
				
				$('.form-search',that.template).append($('<div class="row-fluid btns" style="text-align:center"></div>').append(btn_search).append(btn_reset));
				// this.list.setToolbarPlaceholder($('.list_toolbar',this.template));
				if(this.options.showFilters){
					$('.filters',this.template).css('display','block');
				}else{
					// this.list.setToolbar([{eventId:'toggle_search',text:'隐藏筛选',icon:'icon-search'}]);
					this.subscribe(this.list,'toggle_search',function(){
						var isHidden = ($('.filters',that.template).css('display')== 'none');
						var searchTool = this.list.toolbar.getTool('toggle_search');
						if(isHidden){
							searchTool.attr('title','隐藏筛选').text('隐藏筛选');
							$('.filters',that.template).show();
						}else{
							searchTool.attr('title','显示筛选').text('显示筛选');
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
		}
		
		
		SearchList.prototype.initMenuCondition = function(options){
			
//			this.form.container.empty();
			this.form.template.empty();
//			this.form.options.items = [];
			var that = this;
			this.options.tableType = options.tableType;
			var Form = V.Classes['v.component.Form'];
			$.ajax({
				url:'menucondition.action',
				type:'POST',
				dataType:'json',
				contentType:'application/json',
				data:JSON.stringify({menuCode:that.options.menuCode,tableType:options.tableType,docketType:that.options.variables.docketType||''}),
				async:false,
				success:function(condition){
					var items = [];
					var plugins = [];
					$.each(condition,function(){
						var multiList = [];

						var item = {
							'label':this.conditionName,
							'type':this.conditionType,
							'name':this.conditionCode,
							'value':this.conditionValue,
							'multiList':multiList,
							'operator':this.conditionOperator,
							'plugin':this.ns,
							'url':this.url||'',
							'params':this.params||{},
							'dictTypeCode':this.dictTypeCode,
							'emptyText':that.getLang("MULIST_ALL")
							,colspan:this.colspan
							,helper:this.helper
							,cascadingBy:this.cascadingBy
							,cascadingRule:this.cascadingRule
							,rows:this.rows
							,isBlock: this.isBlock
							,block:this.block
						}

						if(this.aliasFieldName){
							item.aliasFieldName = this.aliasFieldName||'';
						}

						if(item.type==Form.TYPE.DATE){
							if(item.operator=='9'){
								item.type = Form.TYPE.DATERANGE;
								if(item.value==null||item.value=='')
									item.value = '';//V.Util.getDateRange();
								else
									item.value = item.value.split(',');
							}
						}
						else if(item.type==Form.TYPE.TEXT || item.type==Form.TYPE.NUMBER){
							if(item.operator=='9'){
								item.type = Form.TYPE.FIELDRANGE;
								if(item.value==null||item.value=='')
									item.value = '';
								else
									item.value = item.value.split(',');
							}
						}
						else if(item.type==Form.TYPE.SELECT){
							item.value = DictInfo.getDefault(item.dictTypeCode);
							//multiList = DictInfo.getList(dictTypeCode);
							$.merge(multiList,DictInfo.getList(item.dictTypeCode));
						}else if(item.type==Form.TYPE.PLUGIN){
				            if(typeof(item.params)=="string"){
								item.params = JSON.parse(item.params);
							}
				            item.handler = function(inst){
				            	if(inst instanceof V.Classes['v.views.component.Selector']){
				            		that.subscribe(inst,inst.EVENT.SELECT_CHANGE,function(entity){
				            			var block = item.block;
				            			that.fillProperties(block, entity, that.form,inst.docketType);
				            		});
				            		that.subscribe(inst,inst.EVENT.SELECT_REMOVE,function(){
				            			var block = item.block;
				            			that.removeProperties(block, that.form,inst.docketType);
				            		});
				            	}
				            }

							plugins.push(item.plugin);
						}
						
						items.push(item);
					});
					if(plugins.length>0){
						V.loadPlugins(plugins,function(){
							var itemsFilters = that.options.itemsFilters;
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
						var itemsFilters = that.options.itemsFilters;
						if(itemsFilters){
							$.each(items,function(m,item){
								var key = item.plugin||item.name;
								item.value = itemsFilters[key]||'';
							});
						}
						that.form.init({
							colspan:3,
							items:items
						});
					}
				}
			})
		}
		SearchList.prototype.exportDockets = function(){
			var pagination = this.list.pagination;
			if (pagination.options.count > 20000) {
				V.alert(this.getLang("MSG_DATE_LARGER_20000"));
				return;
			}
			if (pagination.options.count == 0) {
				V.alert(this.getLang("MSG_NO_DATE"));
				return;
			}
			var form_print = $('.docket_export_form',this.template).empty();
			if(form_print.length==0){
				form_print = $('<form action="export-excel!exportExcel.action" type="POST" class="docket_export_form" style="display:none"></form>');
			}
			$.each(this.list.filters,function(prop,val){
				if(prop=='page') return true;
				var input = $('<input type="hidden" name="'+prop+'" value='+val+'>');
				form_print.append(input);
			});
			form_print.append('<input type="hidden" name="moduleCode" value='+this.module+'>');
			form_print.append('<input type="hidden" name="docketType" value='+this.options.docketType+'>');
			form_print.append('<input type="hidden" name="showDetail" value='+this.options.showDetail+'>');
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
		SearchList.prototype.fillProperties = function(block,entity,form,docketType){
			var that = this;
			$.each(form.options.items,function(){
				if(this.aliasFieldName){
					var alias = this.aliasFieldName;
					var aliaDocketType = "";
					if(alias.indexOf('.')!=-1){
						aliaDocketType = alias.split('.')[0];
						alias = alias.split('.')[1];
					}
					//如何docketType存在，带前缀匹配，否则不带前缀匹配
					if(entity[alias]!=undefined && (aliaDocketType==docketType||!docketType)){
						this.value = entity[alias];
						if(this.type!=V.Classes['v.component.Form'].TYPE.PLUGIN &&this.type!=V.Classes['v.component.Form'].TYPE.SELECT && this.readonly){
							$('*[name='+this.name+']',form.template).text(entity[alias]);
							return;
						}else if(this.type==V.Classes['v.component.Form'].TYPE.SELECT && !this.readonly){
							$('*[name='+this.name+']',form.template).val(entity[alias]);
							return;
						}
						if(this.type==V.Classes['v.component.Form'].TYPE.PLUGIN){
							this.plugin && this.plugin.initValue(entity[alias]);
						}else if(this.type==V.Classes['v.component.Form'].TYPE.READONLY){
							$('*[name='+this.name+']',form.template).text(entity[alias]);
						}else if(this.type==V.Classes['v.component.Form'].TYPE.SELECT){
							var config = form.getItem(this.name);
							var name = DictInfo.getValue(config.dictTypeCode,this.value,that.options.platformNo);
							$(config.element).text(name);
						}else{
							$('*[name='+this.name+']',form.template).val(entity[alias]);
						}
					}
				}
			})
		}
		SearchList.prototype.removeProperties = function(block,form,docketType){
			var that = this;
			$.each(form.options.items,function(){
				if(this.aliasFieldName){ // && this.block==block 不区分block
					var alias = this.aliasFieldName;
					var aliaDocketType = "";
					if(alias.indexOf('.')!=-1){
						aliaDocketType = alias.split('.')[0];
						alias = alias.split('.')[1];
					}
					//如何docketType存在，带前缀匹配，否则不带前缀匹配
					if(aliaDocketType==docketType||!docketType){
						if(this.type==V.Classes['v.component.Form'].TYPE.PLUGIN){
							this.plugin && this.plugin.initValue('');
						}else if(this.type==V.Classes['v.component.Form'].TYPE.READONLY){
							$('*[name='+this.name+']',form.template).text('');
						}else{
							$('*[name='+this.name+']',form.template).val('');
						}
						this.value = '';
					}
				}
			})
		}
	})(V.Classes['v.views.component.SearchList']);
},{plugins:['v.component.searchList']});