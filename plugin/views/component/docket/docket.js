;V.registPlugin("v.views.component.docket",function(){
	V.Classes.create({
		className:"v.views.component.Docket",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.component.docket";
			//由子类初始化具体的action
			this.ACTION = {
				INIT:'',
				SAVE:'docket!save.action',
				DELETE:'delete.action'
			}
			//subclass should config this to tell the supperclass how to do with the action
			this.ACTIONBUTTONS = {
			    'add':{text:this.getLang("TIP_CREATE"),handler:this.add},
			    'save':{text:this.getLang("TIP_SAVE"),handler:this.save,callback:function(){
			    	V.alert(CONSTANT.TIP_MESSAGE.SAVE);
			    }},
			    'remove':{text:this.getLang("TIP_DELETE"),handler:this.removeItems},
			    'addFile':{text:this.getLang("TIP_CREATE_ATTACH"),handler:this.addAttachment},
			    'approve':{text:"提交审批",handler:this.approve},
			    'flow':{text:"流程图",handler:this.showWorkflow}
			}
			this.currentDocketType = '';
			this.mainDocketType = ''; //main docket type
			this.COLUMNACTIONS = {
			    'edit':{text:this.getLang("TIP_EDIT"),icon:'icon-edit',handler:this.edit},
			    'remove':{text:this.getLang("TIP_DELETE"),icon:'icon-remove',handler:this.removeItem},
			    'view':{text:this.getLang("TIP_VIEW"),icon:'icon-search',handler:this.view},
			    'removeFile':{text:this.getLang("TIP_DELETE"),icon:'icon-remove',handler:this.removeAttachment},//删除附件
			    'downloadFile':{text:this.getLang("TIP_DOWNLOAD"),icon:'icon-download',handler:this.downloadAttachement}//下载附件
			}
			//附件类型列表，子类需定义
			this.attachmentFileTypeList = [];
			this.TYPE = {
				MAIN:'main',
				DETAIL:'detail',
				FILE:'file',
				PLUGIN:'plugin'
			}
			this.isEdit = false;
			this.docketId = '';//当前表单id
			this.mainDocketId = '';
			this.mainDcoket = null;//主表
			this.docketCode = '';//主表单据code
			this.detailListFilter = {parentDocketId:"",docketType:""};
			//存放所有单据对象{docketType:{entity:{},form:form,list:list,itemActions}}
			this.docket = {};//
			this.module = "";
			this.tabs = null;
			this.options = {
				fieldsPerRow:2,
				isRenderAllDocket:false,
				platformNo:'',
				isUseBeanShell:true //action方法中是否使用后台beanshell脚本
			}
			this.EVENT={
				DOCKETFORM_INITED:'docketform_inited',
				DETAILLIST_INITED:'detaillist_inited',
				DOCKET_TAB_SELECTED:'docket_tab_selected'
			}
			this.template = $('<div class="docket">\
					    <ul class="nav nav-tabs docketTypes"></ul>\
					    <div class="tab-content docketList"></div>\
					</div>');
//			this.template = $('<div class="docket">\
//			    <div class="header"><div class="legend"><span class="docket_title"></span><div class="actions" style="margin-top: 5px;"></div></div></div><div class="con"><div class="title header_title head"><i class="icon-chevron-down"></i><span></span></div><div class="header_info"><div></div></div>\
//				<div class="title header_title detail_title" style="display:none;"><i class="icon-chevron-down"></i><span></span></div><div class="detail" style="display:none;"></div></div></div>');
		}
	});
	(function(Docket){
		Docket.prototype.init = function(options){
			var variables = this.variables = options.variables||{};//流程参数
			this.module = options.module;
			this.container = options.container;
			this.docketId = options.docketId||null;
			this.mainDocketId = options.docketId||null;
			this.docketCode = options.docketCode||null;
			this.mainDocket = options.mainDocket||null;
			this.taskConfig = options.taskConfig;//任务配置
//			if(this.taskConfig!=null && this.taskConfig!=''){
//				this.taskConfig = $.parseJSON(this.taskConfig);
//			}
			this.detailListFilter.parentDocketId = this.docketId;

			for(prop in options){
				this.options[prop] = options[prop];
			}
			this.container.append(this.template);
			if(this.options.isEdit!=null&&this.options.isEdit!=undefined){
				this.isEdit = this.options.isEdit;
			}
			this.initDockets();
		}
		Docket.prototype.initDockets = function(){
			var that = this;
			this.subscribe(this,this.EVENT.DOCKETFORM_INITED,function(data){
				var form = data.form;
				var tabpane = form.template.parents('.tabpane')[0];
				$('.actions .btn',tabpane).removeAttr("disabled").removeClass("disable");
			});
			V.ajax({
				url:this.module+"/" +this.ACTION.INIT,
				data:{docketId:this.docketId||null,docketCode:this.docketCode,isEdit:this.isEdit,variables:this.variables,platformNo:this.options.platformNo},
				dataType:'json',
				success:function(dockets){
					$('.docketTypes .tab-docket',that.template[0]).live('click',function(){
						var tabs = that.tabs = $('.docketTypes',that.template).children('li');
						var panes = $('.docketList',that.template).children('.tab-pane');
						if($(this).hasClass('active')){
							return false;
						}else{
							var mainDocket = that.docket[that.mainDocketType];
							var type = $(this).data('type');
							if(type!=that.TYPE.MAIN &&!that.mainDocketId){
								V.alert('请先保存'+mainDocket.name+'！');
								return;
							}
							that.currentDocketType = $(this).data('docketType');
							var docket = that.docket[that.currentDocketType];
							tabs.removeClass('active');
							$(this).addClass('active');
							panes.removeClass('active');
							var index = $(this).index();
							$(panes.get(index)).addClass('active');
							var isRendered = $(this).data('isRendered');
							var isReload = docket.isReload;
							if(!isRendered){
								$(this).data('isRendered',true);
								that.clickTabRender(this);
							}else if(isReload){
								that.clickTabRender(this);
							}
							that.publish({eventId:that.EVENT.DOCKET_TAB_SELECTED,data:that.currentDocketType})
						}
					});
					$.each(dockets,function(index){
						var docketType = this.key;
						//如果工作流任务节点对表单配置时，对子表有定制配置项。
						if(that.taskConfig && that.taskConfig[docketType] && !that.taskConfig[docketType].isShow){
							return true;
						}
						that.renderDocket(this,index);
					});
					
				}
			})
		}
		Docket.prototype.initMainDocket = function(url,docketType,container,index){
			var isEdit = this.isEdit;
	    	if(this.taskConfig && this.taskConfig[docketType]){
	    		isEdit = this.taskConfig[docketType].isEdit;
	    	}
			this.renderFormDocket(url,docketType,container,!isEdit,index);
		}
		Docket.prototype.renderDocket = function(docketConfig,docketIndex){
			var that = this;
			var name = docketConfig.name;//docket name
			var type = docketConfig.type;//docket type(主，从，附件)
			var key = docketConfig.key;//具体单据
			var detailActions = docketConfig.detailActions;
			var format = docketConfig.format;//展现形式
			var actions = docketConfig.actions;
			var entity = null;
			var isReload = docketConfig.isReload||false;
			if(type == this.TYPE.MAIN){
				entity = {id:this.docketId,docketCode:this.docketCode};
			}
			that.docket[key] = {
				name:name,
				type:type,
				entity:entity,
				isReload:isReload,
				form:null,
				list:null,
				format:format,
				detailActions:detailActions
			}
			var tab = $('<li class="tab-docket"><a href="javascript:void(0);">'+name+'</a></li>').data('docketType',key).data('type',type);
			var tab_pane = $('<div class="tab-pane"><div class="legend"><div class="actions" style="margin-top: 5px;"></div></div></div>');
			$('.docketTypes',this.template).append(tab);
			$('.docketList',this.template).append(tab_pane);
			tab.data('url',docketConfig.urlMap.query);
			tab.data('format',format);
			
			if(this.options.isRenderAllDocket){
				tab.data('isRendered',true);
				var url = docketConfig.urlMap.query;
				var index = tab.index();

				if(type == that.TYPE.MAIN){
					that.mainDocketType = key;
					that.initMainDocket(url,key,tab_pane,index);
				}else if(type == that.TYPE.FILE){
//					that.initAttachment(tab_pane,key,index);
				}else if(type == that.TYPE.PLUGIN){
					that.renderPlugin(url,key,tab_pane,index);
				}else{
				    if(format == 'grid'){
				    	that.renderListDocket(url,key,tab_pane);
				    }else if(format == 'form'){
				    	var isEdit = that.isEdit;
				    	if(that.taskConfig && that.taskConfig[key]){
				    		isEdit = that.taskConfig[key].isEdit;
				    	}
				    	that.renderFormDocket(url,key,tab_pane,!isEdit,index);
				    }
				}
				
				// tab.one('click',function(){
				// 	that.clickTabRender(this);
				// });
			}else{
				//此click事件在代理click事件(live)之前执行。
				// tab.one('click',function(){
				// 	that.clickTabRender(this);
				// });
			}
			
			if(this.taskConfig && this.taskConfig[key] && !$.isEmptyObject(this.taskConfig[key].actions)){
				var _actions = JSON.parse(this.taskConfig[key].actions);
				if(_actions.actionButtons){
					actions = _actions.actionButtons;
				}
			}
			/* TODO
			if(this.isEdit){
				if(this.taskConfig && this.taskConfig[key] && !this.taskConfig[key].isEdit){
					
				}else{
					this.initActions(actions,key,tab_pane,type);
				}
			}else if(!this.isEdit){
				if(this.taskConfig && this.taskConfig[key] && !$.isEmptyObject(this.taskConfig[key].actions)){
					this.initActions(actions,key,tab_pane,type);
				}
			}
			*/
			if(this.taskConfig && this.taskConfig[key] && !this.taskConfig[key].isEdit){

			}else{
				this.initActions(actions,key,tab_pane,type);
			}
			
			if(type == that.TYPE.MAIN){
				that.currentDocketType = key;
				tab.click();
			}
		}
		Docket.prototype.clickTabRender = function(clickTab){
			var that = this;
			var tab = $(clickTab);
			var url = tab.data('url');
			var key = tab.data('docketType');
			that.currentDocketType = key;
			var type = tab.data('type');
			var index = tab.index();
			var format = tab.data('format');

			var tabpane = $('.docketList .tab-pane:eq('+index+')',that.template);
			
			if(type == that.TYPE.FILE){
				that.initAttachment(tabpane,key,index);
				return;
			}
			if(type == that.TYPE.PLUGIN){
				that.renderPlugin(url,key,tabpane,index);
				return;
			}
			if(type == that.TYPE.MAIN){
				$('.actions .btn',tabpane).attr("disabled","disabled").addClass("disable");
				that.mainDocketType = key;
				that.initMainDocket(url,key,tabpane,index);
				return;
			}
		    if(format == 'grid'){
		    	that.renderListDocket(url,key,tabpane);
		    }else if(format == 'form'){
		    	$('.actions .btn',tabpane).attr("disabled","disabled").addClass("disable");;
		    	var isEdit = that.isEdit;
		    	if(that.taskConfig && that.taskConfig[key]){
		    		isEdit = that.taskConfig[key].isEdit;
		    	}
		    	that.renderFormDocket(url,key,tabpane,!isEdit,index);
		    }else{
		    	
		    }
		}
		Docket.prototype.renderPlugin = function(url,docketType,container,readonly,docketIndex){
			
		}
		Docket.prototype.renderFormDocket = function(url,docketType,container,readonly,docketIndex){
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
					if(type == that.TYPE.MAIN && !that.mainDocketId && that.mainDocket){
						data = that.mainDocket;
					}
					that.docket[docketType].entity = data;
					if(!that.docketId && that.docket[docketType].type == that.TYPE.MAIN){
						that.docketId = data.id;
						that.detailListFilter.parentDocketId= data.id;
						that.mainDocketId = data.id;
					}
					var actions = docket.actions || null;
					that.docket[docketType].form = that.renderForm(custom,data,docketType,container,readonly,null,docketIndex);
					that.publish({eventId:that.EVENT.DOCKETFORM_INITED,data:{docketType:docketType,form:that.docket[docketType].form}});
			   }
			})
		}
		Docket.prototype.renderForm = function(fields,data,docketType,container,readonly,colspan,docketIndex){
			var that = this;
			var docketCustom = null; //workflow user node docket config
			if(this.taskConfig && this.taskConfig[docketType] && !$.isEmptyObject(this.taskConfig[docketType].customs)){
				docketCustom = $.parseJSON(this.taskConfig[docketType].customs);
			}
			var items = [];
			var Form = V.Classes['v.component.BlockForm'];
			var form = new Form();
			$.each(fields,function(){
				//判断显示view还是edit状态
				var isEditable = readonly?false:true;
				var editRange = this.editRange;
				//如果edit状态判断范围内是否edit
				if(isEditable){
					if(editRange != LoginInfo.user.businessRole && editRange!= CONSTANT.BUSINESS_ROLE.ALL){
						isEditable = false;
					}
				}
				//如果仍然edit，再判断该字段后台过滤后isEditable
				if(isEditable){
					isEditable = this.isEditable;
				}
				var type= this.dataType;
				// var value = data[this.fieldName];
				// if(value==null||value==undefined){
		        // 	value = ''
		        // }
				var field = this;
				
				
				var item = {
					name:this.fieldName
					,label:this.fieldLabel
					// ,value:value
					,type:type
					,dataLength:this.dataLength
					,precision:this.precision
					,validator:this.validator||V.Classes['v.component.Form'].generateValidator(type,this.dataLength,this.precision)
					,isBlock: this.isBlock
					,block:this.block
					,required:this.isMandatory
					,dictTypeCode:this.dictTypeCode
					,multiList:this.multiList
					,render:this.render
					,defaultValue:this.defaultValue
					,aliasFieldName:this.aliasFieldName
					,colspan:this.colspan
					,helper:this.helper
					,expression:this.expression
					// ,isCascading:this.isCascading
					,cascadingBy:this.cascadingBy
					,cascadingRule:this.cascadingRule
					,rows:this.rows
					,validateRule:this.validateRule
					,validateMessage:this.validateMessage
					,isUppercase:this.isUppercase
				};
				if(!isEditable && !this.isBlock && type!=V.Classes['v.component.Form'].TYPE.HIDDEN && type!=V.Classes['v.component.Form'].TYPE.PLUGIN){//是否可编辑	
					item.readonly = true;
				}
				//如果是关联字段
				if(!isEditable && this.relativePlugin){
					item.relativePlugin = this.relativePlugin;
					item.relativeDocketType = this.relativeDocketType;
					item.relativeField = this.relativeField;
					item.relativeModule = this.relativeModule;
					item.render = function(){
						var dom = $('<a href="javascript:void(0);">'+this.value+'</a>');
						dom.data('relativeDocket',{
							relativePlugin:this.relativePlugin,
							relativeDocketType:this.relativeDocketType,
							relativeField:this.relativeField,
							relativeModule:this.relativeModule
						});
						dom.click(function(){
							var relativeDocket = $(this).data('relativeDocket');
							that.viewRelativeDocket(relativeDocket);
						});
						return dom;
					}
				}
				//如果有对表单做了特定配置则覆盖原有定制属性值
				if(docketCustom){
					var docketCustomItem = docketCustom[this.fieldName];
					if(docketCustomItem)
					for(docketKey in docketCustomItem){
						item[docketKey] = docketCustomItem[docketKey];
					}
				}
				
				if(this.dataType ==  V.Classes['v.component.Form'].TYPE.CUSTOM){
					item.getValue = this.getValue;
				}
				else if (this.dataType ==  V.Classes['v.component.Form'].TYPE.PLUGIN) {
		            item.plugin = this.ns;
		            item.url = this.url;
		            item.readonly = !isEditable;
		            item.params = this.params||{};
		            
		            if(typeof(item.params)=="string"){
						item.params = JSON.parse(item.params);
					}
		            item.params['platformNo'] = that.options.platformNo;
		            item.handler = function(inst){
		            	if(inst instanceof V.Classes['v.views.component.Selector']){
		            		that.subscribe(inst,inst.EVENT.SELECT_CHANGE,function(entity){
		            			var block = item.block;
		            			that.fillProperties(block, entity, form,inst.docketType);
		            		});
		            	}
		            }
		            that.setPluginField(item,this,data);
				}
				else if(this.dataType == V.Classes['v.component.Form'].TYPE.SELECT){//转义select
					try{
						item.multiList = DictInfo.getList(this.dictTypeCode,that.options.platformNo);
						item.readonlyRender = function(val){
							return DictInfo.getValue(field.dictTypeCode,val,that.options.platformNo);
						}
					}catch(e){
						that.log('数据字典没有定义<'+this.dictTypeCode+'>');
					}
		        }else if(this.dataType == V.Classes['v.component.Form'].TYPE.CHECKBOX){
					item.multiList = DictInfo.getList(this.dictTypeCode,that.options.platformNo);
					item.readonlyRender = function(val){
						return DictInfo.getMultiValue(field.dictTypeCode,val,that.options.platformNo);
					}
		        }else if(this.dataType == V.Classes['v.component.Form'].TYPE.PERCENT){
				    item.value = V.Util.Float.mul(data[this.fieldName],100)+'%';
				}else if(this.dataType == V.Classes['v.component.Form'].TYPE.PRICE){
					item.readonlyRender = function(val){
						if(val==='' || val===null || val===undefined) return '';
						var fraction_part = (val+"").split('.')[1];
						var precision = item.precision;
						//补零
						if(fraction_part){
							var length = fraction_part.length;
							if(precision>length){
								val = val.toFixed(precision);
							}
						}else{
							val = val.toFixed(precision);
						}
						return V.Util.Number.commafy(val);
					}
				}
				items.push(item);
			})
			container.find('div.v-form').remove();
			form.init({
				container : container,
				items : items,
				record : data,
				colspan:colspan||2
			});
			this.renderFormCallback(form,data);
			return form;
		}
		Docket.prototype.renderFormCallback = function(form){
			
		}
		Docket.prototype.renderListDocket = function(url,docketType,container){
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
			this.subscribe(list,list.EVENT.DATA_LOADED,function(){
				this.publish({eventId:this.EVENT.DETAILLIST_INITED,data:{docketType:docketType,list:that.docket[docketType].list}})
			});
			list.init({
				container : container,
				url: url,
				hasData : true,
				checkable:false,//TODO
				editable : this.isEdit
			});
			this.subscribe(list,list.EVENT.AFTEREDIT,function(data){
				var record = data.record;
				var key = data.key;
				var newValue = data.newValue;
				var obj = {};
				obj[key] = newValue;
				var _record = $.extend({},record,obj);
				//修改后刷新列表
				that._save(docketType,_record,container,function(){
					list.refresh();
				});
			})
		}
		Docket.prototype.initAttachment = function(container,key,index){
			var list = this.attachmentList = new V.Classes['v.ui.Grid']();
			var that = this;
//			var docketType =this.currentDocketType;
			var actions = this.docket[key].detailActions;
			list.setFilters({parentDocketId:that.docketId});
			var columns = [
				    {displayName:this.getLang("LABEL_ATTACHMENT_NAME"),key:'realPath',width:200},
				    //{displayName:this.getLang("LABEL_ATTACHMENT_TYPE"),key:'category',width:120},
				    {displayName:this.getLang("LABEL_ATTACHMENT_TIME"),key:'createTime',width:120},
				    {displayName:this.getLang("LABEL_ATTACHMENT_PERSON"),key:'createPerson',width:120}
				];
			
			if(actions && actions.length>0){
				columns.push(
					{displayName:this.getLang("TIP_OPERATION"),key:'action',width:'80',render:function(record){
				    	var html = $('<div class="action"></div>');
				    	$.each(actions,function(index,action){
							var config = that.COLUMNACTIONS[action];
							var btn = $('<a href="javascript:void(0)" title="'+config.text+'"><i class='+config.icon+'></i></a>');
							btn.click(function(){
								config.handler&&config.handler.call(that,record.id);
							});
							html.append(btn);
						});
				    	var filename = record.realPath;
						var type = filename.substring(filename.lastIndexOf('.')+1).toUpperCase();
						if(type == "JPG" || type == "JPEG" || type == "BMP" || type == "GIF" || type == "PNG"){
							var img_src = LoginInfo.fileUrl+record.filePath;
//							var img_src = "imageview.jsp?filePath="+record.filePath;
							var btn = $('<a target="_blank" href="'+img_src+'" title="预览"><i class="icon-search"></i></a>');
							// btn.click(function(){
							// 	that.viewPicAttrachment(record.id);
							// });
							html.append(btn);
						}
				    	return html;
				    }}
				);
			}
			container.find('div.v-grid').remove();
			list.init({
				container:container,
				url:'common!attachment.action',
				columns:columns
			});
		}
		Docket.prototype.viewPicAttrachment = function(fileId){
			var url="common!download.action?id="+fileId;
			var mask = $('<div style="position:fixed;;width:100%;height:100%;top:0;left:0;z-index:9999"><div class="v-mask" style="background:#000;opacity:0.8;width:100%;height:100%"></div><div style="position:fixed;;width:100%;height:100%;top:0;left:0;text-align:center;display:table"><a style="display:table-cell;vertical-align:middle"><img style="vertical-align:middle;max-width:800px;" src="'+url+'"></a></div></div>');
			$('img',mask).click(function(e){
				e.stopPropagation();
			});
			mask.click(function(){
				mask.remove();
			})
			$('body').append(mask);
		}
		Docket.prototype.addAttachment = function(){
			var upload = new V.Classes['v.component.FileUpload']();
			var that = this;
			var fileType = this.currentDocketType;
			this.subscribe(upload,upload.EVENT.CLOSE,function(){
				that.attachmentList.refresh();
			});
			var _docket = this.docket[this.mainDocketType];
			var entity = _docket.entity;
			var mainDocketId = entity.mainDocketId;
			
			var mainDocket = this.docket[this.mainDocketType];
			if(this.docketId==null || this.docketId==''){
				V.alert('请先保存'+mainDocket.name+'！');
				return;
			}
			
			upload.init({
				title : this.getLang("LABEL_ATTACHMENT_UPLOAD"),
				typeList:this.attachmentFileTypeList,
				uploadSetting:{
					url:'attribUpload.do',
					params:{'fileType':fileType,parentDocketId:this.docketId,mainDocketId:mainDocketId,platformNo:this.options.platformNo},
					uploadComplete:function(){
						 //V.alert("success");
					},
					uploadSuccess:function(file, serverData, response){
						var data = JSON.parse(serverData);
						if(data.error && data.error != ''){
							V.alert(data.error);
						} else {
							V.alert("成功");
						}
						//upload.close();
					},
					uploadError:function(){
						V.alert("Failed to upload attachments");
					}
				}
			});
		}
		Docket.prototype.removeAttachment = function(fileIds,callback){
			var that = this;
			V.confirm(this.getLang("CONFIRM_DELETE_ATTACH"),function(){
			    $.ajax({
			    	url:'common!deleteFile.action',
			    	data:{fileIds:fileIds},
			    	success:function(){
			    		that.attachmentList.refresh();
			    	}
			    });
			});
		}
		Docket.prototype.downloadAttachement = function(fileId){
			var that = this;
			var info=this.getLang("CONFIRM_DOWNLOAD_ATTACH");
			V.confirm(info,function(e){
				window.location.href="common!download.action?id="+fileId;
			});
		}
		Docket.prototype.setPluginField = function(item,config,data){
			this.log('this method should be overwrite by subclass if have plugin field.');
		}
		//只有通过renderFormDocket/renderListDocket 方法才能将表单注入到docket里面
		Docket.prototype.save = function(docketType,callback,container){
			var that = this;
			var _docket = this.docket[docketType];
			var entity = _docket.entity;
			var form = _docket.form;
			if(!form.validate()){
				V.alert("表单存在未录入的必填项或数据录入错误，请确认！");
				return;
			}
			
			var list = _docket.list;
			var vals = form.getValues();
			var format = _docket.format;
			var type = _docket.type;

			for(prop in vals){
				entity[prop] = vals[prop];
			}
			
			//存主表，则docketId为空，非主表，则需传入主表ID。
			var mainDocket = this.docket[this.mainDocketType];
			var docketId = null;
			if(type != this.TYPE.MAIN){
				docketId = this.docketId;
				if(docketId==null || docketId==''){
					V.alert('请先保存'+mainDocket.name+'！');
					return;
				}
			}
			// $('.actions .save',container).attr("disabled","disabled").addClass("disable");
			
			this._save(docketType,entity,container,callback);
		}
		//通用保存方法
		Docket.prototype._save = function(docketType,entity,container,callback){
			var that = this;
			var _docket = this.docket[docketType];
			var list = _docket.list;
			var format = _docket.format;
			var form = _docket.form;
			var type = _docket.type;
			var mask = V.mask($('.tab-pane:eq(0)',this.template));	
			V.ajax({
				url:this.module+'/'+this.ACTION.SAVE,
				data:{docket:entity,docketType:docketType,parentDocketId:entity.parentDocketId||null,taskId:that.variables.taskId||null,platformNo:this.options.platformNo,isUseBeanShell:this.options.isUseBeanShell},
				success:function(data){
					V.unMask(mask);
					if(data.fail){
						V.alert(data.fail);
					}else{
						// V.alert('恭喜您，操作成功！');
						if(format == 'form'){
							if(type == that.TYPE.MAIN){
								that.docketId = data.result.id;
								that.mainDocketId = data.result.id;
							}
							that.detailListFilter.parentDocketId= that.docketId;
							_docket.entity = data.result;
							form.setRecord(_docket.entity);
							form.repaint();
							that.publish({eventId:that.EVENT.DOCKETFORM_INITED,data:{docketType:docketType,form:form}});
							that.renderFormCallback(form,_docket.entity);
						}else{
							list&&list.refresh();
						}
						callback&&callback.call(that,docketType);
					}
					$('.actions .save',container).removeAttr("disabled").removeClass("disable");
				},
				error:function(){
					V.unMask(mask);
				}
			})
		}
		Docket.prototype.approve = function(){
			var that = this;
			var docketType = that.currentDocketType
			var _docket = that.docket[docketType];
			var entity = _docket.entity;
			
			var mainDocket = this.docket[this.mainDocketType];
			if(entity.id==null || entity.id==""){
				V.alert("请先保存"+mainDocket.name+"！");
				return;
			}
			
			var form = _docket.form;
			
			if(!form.validate()){
				V.alert("表单存在未录入的必填项或数据录入错误，请确认！");
				return;
			}
			
			var list = _docket.list;
			var vals = form.getValues();
			var type = _docket.type;
			
			for(prop in vals){
				entity[prop] = vals[prop];
			}
			
			var variables = {};
//			for(docketTypeKey in that.docket){
//				var docketTypeValue = that.docket[docketTypeKey];
//				if(docketTypeValue.format == 'form' && docketTypeValue.entity!=null && docketTypeValue.entity.id!=""){
//					variables['TYPEID_'+docketTypeKey] = docketTypeValue.entity.id;
//				}
//			}
			var mask = V.mask($('.tab-pane:eq(0)',this.template));	
			V.ajax({
//				url:this.module+'/njs-pro!approve.action',
				url:'common/docket/docket!approve.action',
				data:{docket:entity,docketType:docketType,parentDocketId:entity.parentDocketId||null,variables:variables,processKey:this.variables.processKey},
				success:function(data){
					V.unMask(mask);
					if(data.fail){
						V.alert(data.fail);
					}else{
						V.alert('提交成功!');
						V.MessageBus.publish({eventId:'backCrumb'});
					}
				},
				error:function(){
					V.unMask(mask);
				}
			})
		}
		Docket.prototype.removeItem = function(record){
			var docketType = this.currentDocketType;
			var _docket = this.docket[docketType];
			var list = _docket.list;
//			var id = _docket.entity.id;
			var id = record.id;
			this.remove([id],function(){
				list.refresh();
			});
		}
		Docket.prototype.removeItems = function(){
			var docketType = this.currentDocketType;
			var _docket = this.docket[docketType];
			var list = _docket.list;
			var records = list.getCheckedRecords();
			var ids = [];
			$.each(records,function(){
				ids.push(this.id);
			});
			this.remove(ids,function(){
				list.refresh();
			});
		}
		Docket.prototype.remove = function(ids,callback){
			if(ids.length == 0){
				V.alert(this.getLang("MSG_SELECT_RECORD"));
				return;
			}
			var that = this;
			V.confirm(this.getLang("MSG_CONFIRM_DELETE"),function(){
				$.ajax({
//					url:'common/docket/docket!delete.action',
					url:that.module+'/'+that.ACTION.DELETE,
					data:{ids:ids.join(','),docketType:that.currentDocketType,parentDocketId:that.docketId,platformNo:that.options.platformNo,isUseBeanShell:that.options.isUseBeanShell},
					success:function(){
						V.alert(that.getLang("MSG_SUCCESS"));
						callback&&callback();
					}
				})
			});
		}
		Docket.prototype.add = function(){
			if(this.docketId){
				var docketType = this.currentDocketType;
				var _docket = this.docket[docketType];
				_docket.entity = null;
				this.openDocketDialog(docketType,false);
			}else{
				V.alert(this.getLang("MSG_SAVE_MAIN"));
			}
		}
		Docket.prototype.edit = function(record){
			var docketType = this.currentDocketType;
			if(record){
				var _docket = this.docket[docketType];
				_docket.entity = record;
				this.openDocketDialog(docketType,false);
			}
		}
		Docket.prototype.view = function(record){
			var docketType = this.currentDocketType;
			if(record){
				var _docket = this.docket[docketType];
				_docket.entity = record;
				this.openDocketDialog(docketType,true);
			}
		}
		Docket.prototype.openDocketDialog = function(docketType,readonly){
			var dlg = new V.Classes['v.ui.Dialog']();
//			var url = this.module+'/inputItem.action';
			var url = 'common/docket/docket!inputItem.action';
			this.renderFormDocket(url,docketType,dlg.getContent().addClass('docket'),readonly);
			var that = this;
			var btns = [];
			if(!readonly){
				btns.push({text:this.getLang("TIP_SAVE"),style:"save",handler:function(){
					that.save(docketType,function(){
						V.alert('恭喜您，操作成功！');
						that.listCallBack(docketType,null,dlg);
					});
				}});
			}
			btns.push({text:this.getLang("TIP_CLOSE"),style:"btn-primary",handler:dlg.close});
			dlg.setBtnsBar({btns:btns});
			dlg.init({width:800,height:400,title:this.getLang("TIP_TITLE_NAME")});
		}
		Docket.prototype.listCallBack = function(docketType,list,dlg){
			list&&list.refresh();
			dlg&&dlg.close();
		}
		// Docket.prototype.refresh = function(){
		// 	this.docketId = this.docket.id;
		// 	this.initDocketHeader();
		// 	this.list.setFilters({docketId:this.docketId});
		// 	this.list.refresh();
		// }
		Docket.prototype.initActions = function(actions,docketType,container,type){
			var that = this;
			if(actions)
			$.each(actions,function(index,action){
				var actionbtn = that.ACTIONBUTTONS[action];
				if(actionbtn){
					var btn = $('<button class="btn '+action+'" style="margin:0 3px;float:right">'+actionbtn.text+'</button>');
					btn.click(function(){
						if(btn.hasClass('disable')){
							return;
						}
						actionbtn.handler&&actionbtn.handler.call(that,that.currentDocketType,actionbtn.callback,container);
					});
					$('.actions',container).append(btn);
				}
			});
		}
		Docket.prototype.fillProperties = function(block,entity,form,docketType){
			var that = this;
			$.each(form.options.items,function(){
				if(this.aliasFieldName && this.block==block){
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
		//获取当前单据的最新值（修改后）,只对于表单
		Docket.prototype.getDocketEntity = function(){
			var docket = this.docket[this.currentDocketType];
			if(!docket.form){
				return null;
			}
			return $.extend({},docket.entity,docket.form.getValues());
		}
		//存放的是原始数据（编辑前的数据）
		Docket.prototype.getOriginDocketEntity = function(){
			var docket = this.docket[this.currentDocketType];
			if(!docket.form){
				return null;
			}
			return docket.entity;
		}
		//根据定制查看关联单据，根据docketCode查询
		Docket.prototype.viewRelativeDocket = function(relativeDocket){
			var entity = this.getDocketEntity();
			var plugin = relativeDocket.relativePlugin;
			var docketType = relativeDocket.relativeDocketType;
			var module = relativeDocket.relativeModule;
			var docketCode = entity[relativeDocket.relativeField];
			var dlg = new V.Classes['v.ui.Dialog']();
			dlg.init({
				title:'单据查看',
				width:800,
				height:480
			});
			V.loadPlugin(plugin,function(){
				var inst = V.getPluginInstByNs(plugin);
				inst.init({
					container : dlg.getContent(),
					module:module,
					variables:{docketType:docketType},
					docketCode : docketCode
				});
			});
		}
		Docket.prototype.showWorkflow = function(){
			var that = this;

			var docket = this.docket[this.mainDocketType];
			var record = docket.form.record;

			var dlg = new V.Classes['v.ui.Dialog']();
			var con = $('<div></div>');
			dlg.setContent(con);
			dlg.init({
				title:"流程图",
				width:1000,
				height:500
			});
			var loading_mask = $('<div ></div>');
			loading_mask.css({
				top:0,
				left:0,
				position:'absolute',
				opacity:0.7,
				zIndex:9999,
				background:'#efefef url(imgs/loading_16.gif) center no-repeat',
				height:'100%',
				width:'100%'
			});
			con.append(loading_mask);
			$.ajax({
				url:'workflow/todo-task!workflowByPro.action',
				data:{proId:record.processId},
				success:function(data){
					loading_mask.remove();
					var workflow = data.workflow;
					var currentNodeId = data.nodeId;
					var wf = new V.Classes['v.component.Workflow']();
					wf.init({
						container:con
					});
					var lines = [];
					var nodeMap = {};
					$.each(workflow.items,function(){
					    if(this.type == "LINE"){
					    	lines.push(this);
					    	return true;
					    }
					    var ui = $.parseJSON(this.ui);
					    var nodeConfig = {
					    	type : this.type,
					    	text:this.name,
					    	data:this,
					    	position:{top:ui.y,left:ui.x}
					    };
					    var node = addNode(nodeConfig,wf);
					    if(currentNodeId!=null){
					    	if(this.id == currentNodeId){
					    		node.addClass("_jsPlumb_endpoint_anchor_ selected");
					    	}
					    }else{
					    	if(this.type =="END"){
					    		node.addClass("_jsPlumb_endpoint_anchor_ selected");
					    	}	
					    }
					    nodeMap[this.id] = node
					});
					$.each(lines,function(){
						var conn = wf.connect(nodeMap[this.fromNode].get(0),nodeMap[this.toNode].get(0));
						conn.setLabel(this.name);
					});
				},
				error:function(){
					loading_mask.remove();
				}
			});
			function addNode(nodeConfig,wf){
				var type = nodeConfig.type;
				var text = nodeConfig.text;
				var data = nodeConfig.data;
				var position = nodeConfig.position;
				var node;
				if(type == "START"||type == "DBPOLLER"||type == "TIMER"){
					node = wf.addBeginNode(text,position.left,position.top,data);
				}else if(type == "END"){
					node = wf.addEndNode(text,position.left,position.top,data);
				}else{
					node = wf.addNode(text,position.left,position.top,data);
				}
				return node;
			}
		}
	})(V.Classes['v.views.component.Docket']);
},{plugins:["v.component.blockForm","v.ui.dynamicGrid","v.ui.pagination","v.views.component.selector",'v.component.fileUpload','v.component.workflow']})