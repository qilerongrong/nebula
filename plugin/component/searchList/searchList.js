;V.registPlugin("v.component.searchList",function(){
	V.Classes.create({
		className:"v.component.SearchList",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.component.searchList';
			this.form = null;
			this.list = null;
			this.filters = {};
			this.itemsFilters = {};
			this.options={
				showFilters: false,
				entityName:""//子查询类传入实体名作为box的title
			};
			this.template = $('<div class="v-search"><div class="list_toolbar"></div><div class="filters v-box"><div class="v-box-tit searchform_tit"><span class="btn_toggle toggle_up"></span></div><div class="v-box-con well form-search"></div></div><div class="v-box search_result"><div class="v-box-tit list_tit"></div><div class="v-box-con list"></div></div></div>');
			//点击重置的时候,防止走searchHandler方法,避免表单以及按钮重画
			this.vflag=true;
		}
	});
	(function(SearchList){
		SearchList.prototype.init = function(options){
			this.module = options.module;
			this.container = options.container;
			for(prop in options){
			    this.options[prop] = options[prop];
			}
			this.form.container = $('.form-search',this.template);
			this.list.container = $('.list',this.template);
			this.container.append(this.template);
			var that = this;
			this.subscribe(this.form,this.form.EVENT.INITED,this.searchHandler);
			var entityName = this.options.entityName;
			$('.filters .v-box-tit',this.template).append(entityName+"查询");
			$('.search_result .v-box-tit',this.template).append(entityName+"列表");
			this.initConditionForm();
			this.initEvent();
		}
		SearchList.prototype.initEvent = function(){
			var that = this;
			$('.btn_toggle',this.template).toggle(function(){
				$(this).parents('.v-box').children('.v-box-con').slideUp('normal','linear');
				$(this).removeClass('toggle_up').addClass('toggle_down');
			},function(){
				$(this).parents('.v-box').children('.v-box-con').slideDown('normal','linear');
				$(this).removeClass('toggle_down').addClass('toggle_up');
			})
		}
		SearchList.prototype.getFilters = function(){
			var that = this;
			var filters = this.options.filters||{};
			var formFilters = this.form.getValues();
			if(this.options.tableType!=null){
				filters.menuCode = this.options.menuCode;
				filters.tableType = this.options.tableType;
				filters.cateCode = this.options.cateCode||'';
			}
			for(key in formFilters){
				filters[key] = formFilters[key];
			}
			return filters;
		}
		SearchList.prototype.initConditionForm = function(){
			this.log("initConditionForm method should be overwrote.");
		}
		SearchList.prototype.initList = function(){
			this.log("initList method should be overwrote.");
		}
		SearchList.prototype.search = function(){
		    if(!this.form.validate()) return; 
		    
			this.options.itemsFilters = this.form.getItemsValues();
			
		    var filters =	this.getFilters();
			this.options.filters = filters;
			this.list.setFilters(filters);
			this.list.reload();
			this.updateCrumb();
		}
		SearchList.prototype.searchHandler = function(){
			if(this.vflag === true){
				var that = this;
			    that.options.filters = this.getFilters();
				var btn_search = $('<button class="btn btn-primary btn-search"><i class="icon-search"></i>'+this.getLang("BTN_SEARCH")+'</button>');
				var btn_reset = $('<button class="btn btn-reset"><i class="icon-reset"></i>'+this.getLang("BTN_RESET")+'</button>');
				var btn_hide = $('<button class="btn btn-hide"><i class="icon-hide"></i>'+this.getLang("BTN_HIDE")+'</button>');
				btn_search.click(function(){
					that.search();
				});
				btn_reset.click(function(){
					//that.form.reset();
					that.vflag=false;
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
				});
				btn_hide.click(function(){
					$('.filters',that.template).hide();
				});
				$('.form-search',that.template).append($('<div class="row-fluid btns" style="text-align:center"></div>').append(btn_search).append(btn_reset));
				
				// this.list.setToolbarPlaceholder($('.list_toolbar',this.template));
				if(this.options.showFilters){
					$('.filters',this.template).css('display','block');
				}else{
					this.list.setToolbar([{eventId:'toggle_search',text:'隐藏筛选',icon:'icon-search'}]);
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
		SearchList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.options.menuName}});
		}
		SearchList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.options.menuName}});
		}
	})(V.Classes['v.component.SearchList']);
},{plugins:['v.component.form','v.ui.pagination']});
