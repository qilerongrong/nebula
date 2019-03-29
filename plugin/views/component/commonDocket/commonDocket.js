;V.registPlugin("v.views.component.commonDocket",function(){
	V.Classes.create({
		className:"v.views.component.CommonDocket",
		superClass:"v.views.component.Docket",
		init:function(){
            this.ns = "v.views.component.commonDocket";
            this.variables = {};
            this.options.isRenderAllDocket = false;
            this.options.isCommonDocket = true;
            this.ACTION.INIT = "common-docket!listDocket.action";
            this.ACTIONBUTTONS.terminate = {text:"撤销审批",handler:this.teminateByPro}
		}
	});
	(function(CommonDocketClass){
		CommonDocketClass.prototype.renderFormDocket = function(url,docketType,container,readonly,docketIndex){
			var that =this;
			var type = that.docket[docketType].type;
			var format = that.docket[docketType].format;
			var entity = that.docket[docketType].entity||{};
			V.ajax({
				url:url,
				dataType:'json',
				data:{docketType:docketType,docketId:entity.id||null,docketCode:entity.docketCode,parentDocketId:this.docketId||null,docket:entity,isEdit:this.isEdit,variables:this.variables,format:format,platformNo:this.options.platformNo},
				success:function(docket){
					var custom = docket.custom;
					var data = docket.data||{};
					
					if(that.variables["cateCode"]){
						data['cateCode'] = that.variables["cateCode"];
					}

					if(type != that.TYPE.MAIN){
						data['parentDocketId'] = that.docketId||null;
						data['parentDocketType'] = that.mainDocketType;
					}
					data['docketType'] = docketType;
			
					// that.docket[docketType].entity = data;
					if(type == that.TYPE.MAIN && !that.mainDocketId && that.mainDocket){
						that.docket[docketType].entity = that.mainDocket;
						data = that.mainDocket;
					}
					that.docket[docketType].entity = data;
					if(that.docketId==null && that.docket[docketType].type == that.TYPE.MAIN){
						that.docketId = data.id;
						that.detailListFilter.parentDocketId= data.id;
						that.mainDocketId = data.id;
					}
					
					that.docket[docketType].form = that.renderForm(custom,data,docketType,container,readonly,null,docketIndex);
					that.publish({eventId:that.EVENT.DOCKETFORM_INITED,data:{docketType:docketType,form:that.docket[docketType].form}});
			   }
			})
		}
		CommonDocketClass.prototype.renderDocketStatus = function(container,otherFilter){
			var that = this;
			var list = this.docketStatus = new V.Classes['v.ui.Grid']();
			var filterList = {docketId:that.docketId,docketType:that.mainDocketType};
			list.setFilters(filterList);
			var columns = [
				    {displayName:'操作人',key:'createPerson',width:120},
				    {displayName:'操作动作',key:'action',width:120},
				    {displayName:'操作内容',key:'content',width:120},
				    {displayName:'操作时间',key:'actionTime',width:120},
				    {displayName:'单据状态',key:'docketStatus',width:200}
				];
			
			var statusUrl = "common!queryDocketStatus.action";
			list.init({
				container:container,
				url:statusUrl,
				columns:columns
			});	
		}
		CommonDocketClass.prototype.renderPlugin = function(url,key,tab_pane,index){
			var that = this;
			if(key.toLocaleLowerCase().indexOf('execution')!=-1){
				var html = $('<div><div class="formInfo"><div class="form"></div></div>\
					<div class="gridInfo"><div class="block_tit">操作日志</div><div class="grid"></div></div></div>');
				tab_pane.empty().append(html);

				this.renderFormDocket(url,key,$('.form',html),true,index);
				that.renderDocketStatus($('.grid',html));
			}else{
				this.pluginTemplate = $('<div class="docket">\
					    <ul class="nav nav-tabs docketTypes"></ul>\
					    <div class="tab-content docketList"></div>\
					</div>');
				tab_pane.append(this.pluginTemplate);
				V.ajax({
					url:url,
					data:{docketId:this.docketId||null,isEdit:this.isEdit,docketType:key,platformNo:this.options.platformNo},
					dataType:'json',
					success:function(dockets){
						$('.docketTypes .tab-docket',tab_pane[0]).live('click',function(){
							var tabs = that.tabs = $('.docketTypes',tab_pane).children('li');
							var panes = $('.docketList',tab_pane).children('.tab-pane');
							if($(this).hasClass('active')){
								return false;
							}else{
								that.currentDocketType = $(this).data('docketType');
								tabs.removeClass('active');
								$(this).addClass('active');
								panes.removeClass('active');
								var index = $(this).index();
								$(panes.get(index)).addClass('active');
							}
						});
						$.each(dockets,function(index){
							that.renderPluginDocket(this,tab_pane,index,false);
						});
					}
				})
			}
		}
		CommonDocketClass.prototype.renderPluginDocket = function(docketConfig,container,docketIndex,isEditable){
			var that = this;
			var name = docketConfig.name;//docket name
			var type = docketConfig.type;//docket type(主，从，附件)
			var key = docketConfig.key;//具体单据
			var detailActions = docketConfig.detailActions;
			var format = docketConfig.format;//展现形式
			var actions = docketConfig.actions;
			var entity = null;
			
			that.docket[key] = {
				type:type,
				entity:entity,
				form:null,
				list:null,
				format:format,
				detailActions:detailActions
			}
			var tab = $('<li class="tab-docket"><a href="javascript:void(0);">'+name+'</a></li>').data('docketType',key).data('type',type);
			var tab_pane = $('<div class="tab-pane"><div class="legend"><div class="actions" style="margin-top: 5px;"></div></div></div>');
			$('.docketTypes',container).append(tab);
			$('.docketList',container).append(tab_pane);
			tab.data('url',docketConfig.urlMap.query);
			tab.data('format',format);
			
			//此click事件在代理click事件(live)之前执行。
			tab.one('click',function(){
				that.clickPluginTabRender(this,container,isEditable);
			});
			if(docketIndex==0){
				tab.click();	
			}
		}
		CommonDocketClass.prototype.clickPluginTabRender = function(clickTab,container,isEditable){
			var that = this;
			var tab = $(clickTab);
			var url = tab.data('url');
			var key = tab.data('docketType');
			that.currentDocketType = key;
			var type = tab.data('type');
			var index = tab.index();
			var format = tab.data('format');

			var tabpane = $('.docketList .tab-pane:eq('+index+')',container);
			
			if(type == that.TYPE.FILE){
				that.initAttachment(tabpane,key,index);
				return;
			}
		    if(format == 'grid'){
		    	that.renderPluginListDocket(url,key,tabpane,isEditable);
		    }else if(format == 'form'){
		    	var isEdit = that.isEdit;
		    	if(that.taskConfig && that.taskConfig[key]){
		    		isEdit = that.taskConfig[key].isEdit;
		    	}
		    	that.renderFormDocket(url,key,tabpane,!isEdit,index);
		    }else{
		    	
		    }
		}
		CommonDocketClass.prototype.renderPluginListDocket = function(url,docketType,container,isEditable){
			var that = this;
			var list = new V.Classes['v.ui.DynamicGrid']();
			this.docket[docketType].list = list;
			var actions = this.docket[docketType].detailActions;
			if(this.taskConfig && this.taskConfig[docketType] && !$.isEmptyObject(this.taskConfig[docketType].actions)){
				var _actions = JSON.parse(this.taskConfig[key].actions);
				if(_actions.columnactions){
					actions = _actions.columnactions;
				}
			}
			
			// && this.isEdit
			var isEdit = this.isEdit;
			if(isEditable!=null){
				isEdit = isEditable;
			}
			if(this.taskConfig && this.taskConfig[docketType]){
				isEdit = this.taskConfig[docketType].isEdit;
			}
			if(actions){
				list.setActionColumn({
					displayName:this.getLang("TIP_OPERATION"),
					key:'action',
					width: 80,
					render:function(record){
						var html = $('<span class="action"></span>');
						$.each(actions,function(index,action){
							var config = that.COLUMNACTIONS[action];
							var btn = $('<a href="javascript:void(0)" title="'+config.text+'"><i class='+config.icon+'></i></a>');
							btn.click(function(){
								config.handler&&config.handler.call(that,record);
							});
							html.append(btn);
						});
						return html;
					}
				});
			}
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			var filters = {};
			filters.parentDocketId = this.detailListFilter['parentDocketId'];
			filters['docketType'] = docketType;
			filters['platformNo'] = this.options.platformNo;
			list.setFilters(filters);
			container.find('div.v-grid').remove();
			list.init({
				container : container,
				url: url,
				hasData : true,
				checkable:false,//TODO
				editable : isEdit
			});
			this.subscribe(list,list.EVENT.AFTEREDIT,function(data){
				var record = data.record;
				//修改后刷新列表
				that._save(docketType,record,container,function(){
					list.refresh();
				});
			})
		}
		CommonDocketClass.prototype.teminateByPro = function(){
			var that = this;
			var _docket = this.docket[this.mainDocketType];
			var entity = _docket.entity;
			var info="是否撤销审批！";
			V.confirm(info,function ok(e){
				var url = 'workflow/todo-task!teminateByPro.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
	               	data:{proId:entity.processId},
	                success:function(data){
	                	if(data.result == 'success'){
	                		V.MessageBus.publish({eventId:'backCrumb'});
	                		V.alert("撤销审批成功！");
	                	}else{
	                		V.alert(data.msg);
	                	}
	                }
	            })
			});
		}
	})(V.Classes['v.views.component.CommonDocket']);
},{plugins:["v.views.component.docket"]})