V.registPlugin("v.component.selector",function(){
	V.Classes.create({
		className:"v.component.Selector",
		superClass:"v.ui.Dialog",
		init: function(){
			this.form = null;
			this.list = null;
			//选择及清除事件
			this.EVENT.SELECT_CHANGE = 'entity_change',
		    this.EVENT.SELECT_REMOVE = 'entity_remove',
		    this.record = null;//选择的实体对象。
		    this.options = $.extend(this.options,{
		        dynamic:false, //list type(static,dynamic)
		        hasData:true,  //list has data
		        isMultiChoose:false,
		        enableAutoComplete:false,
		        items:[],
		        columns:[],
		        params:{},
		        url:'',
		        title:this.getLang("TITLE_CHOOSE")
		    });
		}
	});
	(function(Selector){
		Selector.prototype.init = function(options){
			var content = $('<div class="v-search"><div class="list_toolbar"></div><div class="filters"><div class="well form-search"></div></div><div class="list"></div></div>');
			this.setContent(content);
			var that = this;
			for(key in options){
				this.options[key] = options[key];
			}
			var btns = [{text:this.getLang("BTN_CLOSE"),style:"",handler:this.close}];
			var btn_confirm = {text:this.getLang("BTN_SURE"),style:"btn-primary",handler:function(){
				var records = this.list.getCheckedRecords();
				if(records.length==0){
					V.alert(that.getLang("MSG_CHOOSE_RECORD"));
					return;
				}
				this.close();
				this.publish({eventId:this.EVENT.SELECT_CHANGE,data:records});
			}};
			if(this.options.isMultiChoose){
				btns.splice(0,0,btn_confirm);
			}
			this.setBtnsBar({btns:btns});
			Selector.superclass.init.call(this,{
				width:800,
				height:500,
				title:this.options.title
			});
			this.initForm();
			this.initList();
		}
		Selector.prototype.initForm = function(){
			var that = this;
			var form = this.form = new V.Classes["v.component.Form"]();
			var btn_search = $('<button class="btn btn-primary btn-search">'+this.getLang("BTN_SEARCH")+'</button>');
			var btn_reset = $('<button class="btn btn-reset">'+this.getLang("BTN_RESET")+'</button>');
			btn_search.click(function(){
				if(!form.validate()) return;
				var filters = that.form.getValues();
				var params = that.options.params;
				for(key in params){
					filters[key] = params[key];
				}
				that.list.setFilters(filters);
				that.list.retrieveData();
			});
			btn_reset.click(function(){
				form.reset();
			});
			
			//复制配置项，this.options.items不变，以供多次使用
			var formItems = [];
			var items = this.options.items;
			$.each(items,function(index,ele){
				var obj = {};
				for(key in ele){
            		obj[key] = ele[key];
            	}
				formItems.push(obj);
			})
			
			form.init({
				container:$('.form-search',this.template).empty(),
				colspan:2,
				items:formItems
			});
			$('.form-search',this.template).append($('<div class="row-fluid btns" style="text-align:center"></div>').append(btn_search).append(btn_reset));
		}
		Selector.prototype.initList = function(){
			var that = this;
			var list = this.list = new V.Classes['v.ui.Grid']();
			if(this.options.dynamic){
				list = this.list = new V.Classes['v.ui.DynamicGrid']();
				list.setActionColumn({
					displayName: this.getLang("LIST_ACTION"),
					key: 'action',
					width: 80,
					render: function(record){
						var html = $('<a href="javascript:void(0);"></a>');
						html.text(that.getLang("TEXT_CHOOSE"));
						html.click(function(){
							that.choose(record);
						});
						return html;
					}
				});
			}
			var filters = this.form.getValues();
			var params = this.options.params;
			for(key in params){
				filters[key] = params[key];
			}
			list.setFilters(filters);
			list.setPagination(new V.Classes['v.ui.Pagination']());
			var url = this.options.url;
			list.init({
				container:$('.list',this.template).empty(),
				url:this.options.url,
				columns:this.options.columns,
				checkable:this.options.isMultiChoose||false,
				hasData : this.options.hasData
			});
		}
//		Selector.prototype.openChooseDlg = function(){
//			var that = this;
//			var dlg = this.dialog = new V.Classes['v.ui.Dialog']();
//			var options = {
//				width:800,
//				height:600
//			};
//			options.title = this.options.title;
//			
//			this.initForm();
//			this.initList();
//			
//			dlg.init(options);
//			dlg.setContent(this.dlgTemplate);
//			
//			var btns = [{text:"关闭",style:"",handler:dlg.close}];
//			var btn_confirm = {text:"确认",style:"btn-primary",handler:function(){
//				var records = that.list.getCheckedRecords();
//				if(records.length==0){
//					V.alert('请选择记录！');
//					return;
//				}
//				var values = [];
//				$.each(that.options.fields,function(){
//					var entityName = this.name;
//					$.each(records,function(){
//						values.push(this[entityName]);
//					})
//					var name = this.aliasName||this.name;
//					var element = $('[name='+name+']',that.template);
//					if(element.val()!=''){
//						values = element.val()+','+values.join(',');
//					}else{
//						values = values.join(',');
//					}
//					element.val(values);
//				});
//				dlg.close();
//				this.publish({eventId:this.EVENT.SELECT_CHANGE,data:records});
//			}};
//			if(this.config.checkable){
//				btns.splice(0,0,btn_confirm);
//			}
//			dlg.setBtnsBar({btns:btns});	
//		}
		Selector.prototype.choose = function(entity){
			var that = this;
			this.record = entity;
			$.each(this.options.fields,function(){
				var name = this.aliasName||this.name;
				$('[name='+name+']',that.template).val(entity[this.name]);
			});
			this.dialog.close();
			this.publish({eventId:this.EVENT.SELECT_CHANGE,data:entity});
		}
		Selector.prototype.getValue = function(){
			var that = this;
			var val = {};
			$.each(this.options.fields,function(){
				var name = this.aliasName||this.name;
				val[name] = $('[name='+name+']',that.template).val();
			});
			return val;
		}
		Selector.prototype.getEntity = function(){
			return this.record;
		}
//		Selector.prototype.setReadOnly = function(config){
//			$('.data-value',this.template).attr('readOnly',true);
//			$('button',this.template).remove();
//		}
//		Selector.prototype.clear = function(config){
//			$('.data-value',this.template).val('');
//		}
//		Selector.prototype.validate = function(){
//			var isValid = true;
//			$('*[data-validator]',this.template).each(function(){
//				var required = $(this).attr('data-required')||false;
//				var rules = $(this).attr('data-validator')||'';
//				var v = $(this).val();
//				if(rules=='dateRange' && v==',')
//					v='';
//				
//				if(required=="true"&&(v==""||v==null)){
//						$(this).parent().find('.error_msg').text("该值不可为空").show();
//						isValid = false;
//				}else{
//					if(rules){
//						var msg = Validator.validate(rules,v);
//						if(msg){
//							$(this).parent().find('.error_msg').text(msg).show();
//							isValid = false;
//						}else{
//							$(this).parent().find('.error_msg').empty().hide();
//						}
//					}else{
//						$(this).parent().find('.error_msg').empty().hide();
//					}
//				}
//			});
//			return isValid;
//		}
	})(V.Classes['v.component.Selector']);
},{plugins:["v.ui.dialog"]});