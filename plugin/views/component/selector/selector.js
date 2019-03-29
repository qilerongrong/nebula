V.registPlugin("v.views.component.selector",function(){
	V.Classes.create({
		className:"v.views.component.Selector",
		superClass:"v.Plugin",
		init: function(){
			this.config = null,
			this.template = $('<div class="selector codeSelect"></div>');
			this.dlgTemplate = $('<div class="v-search"><div class="list_toolbar"></div><div class="filters"><div class="well form-search"></div></div><div class="list"></div></div>');
			this.form = null;
			this.list = null;
			this.dialog = null;
			//选择及清除事件
			this.EVENT.SELECT_CHANGE = 'entity_change',
		    this.EVENT.SELECT_REMOVE = 'entity_remove',
		    this.record = null;//选择的实体对象。
		    this.options = {
		    	//以后不推荐使用fields此配置，init会覆盖，对用户透明，依赖定制
		    	fields:[],//{name:'实体字段',aliasName:'取值字段'} 
		        dynamic:false, //list type(static,dynamic)
		        hasData:true,  //list has data
		        items:[],
		        columns:[],
		        params:{},
		        url:'',
		        title:'选择',
		        //autocomplete setting
		        enableAutoComplete:false,
		        autoFields:"",
		        autoFormatFields:[],
		        enableInput:true
		    }
		}
	});
	(function(Selector){
		Selector.prototype.init = function(options){
			this.container = options.container;
			
			this.config = {value:null,readonly:false}
			for(prop in options){
				this.options[prop] = options[prop];
			};
			var field = {};
			for(cfg in options.config){
				this.config[cfg] = options.config[cfg];
				if(cfg == "name"){
					field.name = this.config[cfg];
				}else if(cfg == "aliasFieldName"){
					var alias = this.config[cfg];
					var _alias = alias.split('.');
					//带dockettype则取第二个，没有则取第一个
				    field.aliasName = _alias[1]||_alias[0];
				}else if(cfg == "label"){
					field.placeholder = this.config[cfg];
				}
			}
			this.options.fields = [];
			this.options.fields.push(field);
			if(this.config.readonly){
				this.container.append(this.renderValue());
				return;
			}
			this.initConfig();

			this.container.append(this.template);
			if(this.options.autoFormatFields.length == 0){
				this.options.autoFormatFields.push(this.options.fields[0].aliasName);
			}
			if(this.options.autoFields == ""){
				this.options.autoFields = this.options.fields[0].aliasName;
			}
			if(this.config.checkable){
				this.mutilRender();
			}else{
				this.render();
			}
			
			this.initValue(this.config.value);
			if(this.options.enableInput && this.options.enableAutoComplete){
				this.enableAutoComplete();
			}
			this.initEvent();
		}
		Selector.prototype.initConfig = function(){
			if(this.config.url){
				this.options.url = this.config.url;
			}
			if(this.config.params){
				var configParams = this.config.params;
				if(typeof(this.config.params)=="string"){
					configParams = JSON.parse(this.config.params);
				}
				
				if(configParams)
				for(key in configParams){
					this.options.params[key] = configParams[key];
				}
			}
			if(this.config.title){
				this.options.title = this.config.title;
			}
		}
		Selector.prototype.render = function(){
			var fields = this.options.fields;
			var con = '';
			var input_class = "input-medium";
			var validator = this.config.validator||"";
			var required = this.config.required||false;
			if(fields.length>1){
				input_class = "input-small";
			}
			$.each(fields,function(){
				var name = this.aliasName||this.name;
				con += '<input type="text" data-validator="'+validator+'" data-required='+required+' class="data-value '+input_class+'" name="'+name+'" placeholder="'+(this.placeholder||"")+'"/>';
			});

			con += '<button type="button" class="btn btn_choose">选择</button>';
			con += '<p class="error_msg"></p>';
			this.template.append(con);
			if(!this.options.enableInput){
				$('input',this.template).attr('disabled',true);
			}
		}
		Selector.prototype.mutilRender = function(){
			var fields = this.options.fields;
			var con = '';
			var input_class = "input-xlarge";
			var validator = this.config.validator||"";
			var required = this.config.required||false;
			if(fields.length>1){
				input_class = "input-large";
			}
			$.each(fields,function(){
				var name = this.aliasName||this.name;
				con += '<textarea type="text" data-validator='+validator+' data-required='+required+' class="data-value '+input_class+'" name="'+name+'" placeholder="'+(this.placeholder||"")+'"></textarea>';
			});
			con += '<button class="btn btn_choose btn-mini"><i class="icon-pencil"></i></button>&nbsp;<button class="btn btn_choose_remove btn-mini"><i class="icon-remove-sign"></i></button>';
			con += '<p class="error_msg"></p>';
			this.template.append(con);
		}
		//readonly时的显示方法
		Selector.prototype.renderValue = function(){
			//you can overwrite the method to render the read-only value with your style.
			var field = this.options.fields[0];
			if(field){
				var name = field.aliasName||field.name;
				var con = "<span name="+name+">"+this.config.value+"<span>";
				return this.template.append(con);
			}else{
				return this.config.value;
			}
		}
		Selector.prototype.initEvent = function(){
			var that = this;
			$('.btn_choose',this.template).click(function(){
				  that.openChooseDlg();
			});
			$('.btn_choose_remove',this.template).click(function(){
				$('.data-value',that.template).val('');
				  that.publish({eventId:that.EVENT.SELECT_REMOVE});
			});
			$('*[data-validator]',this.template).bind('keyup',function(){
				var required = $(this).attr('data-required')||false;
				var rules = $(this).attr('data-validator')||'';
				var v = $(this).val();
				if(required=="true"&&v==""){
						$(this).parent().find('.error_msg').text("该值不可为空").show();
						return false;
				}else{
					if(rules){
						var msg = Validator.validate(rules,v);
						if(msg){
							$(this).parent().find('.error_msg').text(msg).show();
						}else{
							$(this).parent().find('.error_msg').empty().hide();
						}
					}else{
						$(this).parent().find('.error_msg').empty().hide();
					}
				}
			});
		}
		//初始化值
		Selector.prototype.initValue = function(v){
			if(v){
				if(typeof(v) == "string" || typeof(v) == "number"){
					$('.data-value',this.template).val(v);
				}else if(typeof(v) == "object"){
					$('.data-value',this.template).each(function(){
						var name = $(this).attr('name');
						$(this).val(v[name]);
					});
				}else{
					this.log('arguments error');
				}
			}
		}
		Selector.prototype.searchData = function(){
			var that = this;
			if(!this.form.validate()) return;
			var filters = that.form.getValues();
			var params = that.options.params;
			for(key in params){
				filters[key] = params[key];
			}
			that.list.setFilters(filters);
			that.list.retrieveData();
		}
		Selector.prototype.initForm = function(){
			var that = this;
			var form = this.form = new V.Classes["v.component.Form"]();
			
			var search =  this.getLang("BTN_SEARCH");
			var reset =  this.getLang("BTN_RESET");
			var btn_search = $('<button class="btn btn-primary btn-search">'+search+'</button>');
			var btn_reset = $('<button class="btn btn-reset">'+reset+'</button>');
			btn_search.click(function(){
				that.searchData();
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
				container:$('.form-search',this.dlgTemplate).empty(),
				colspan:2,
				items:formItems
			});
			$('.form-search',this.dlgTemplate).append($('<div class="row-fluid btns" style="text-align:center"></div>').append(btn_search).append(btn_reset));
		}
		Selector.prototype.initList = function(){
			var that = this;
			var list = this.list = new V.Classes['v.ui.Grid']();
			if(this.options.dynamic){
				list = this.list = new V.Classes['v.ui.DynamicGrid']();
				list.setActionColumn({
					displayName: '操作',
					key: 'action',
					width: 80,
					render: function(record){
						var html = $('<a href="javascript:void(0);"></a>');
						html.text('选择');
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
				container:$('.list',this.dlgTemplate).empty(),
				url:this.options.url,
				columns:this.options.columns,
				checkable:this.config.checkable||false,
				hasData : this.options.hasData
			});
		}
		Selector.prototype.openChooseDlg = function(){
			var that = this;
			var dlg = this.dialog = new V.Classes['v.ui.Dialog']();
			var options = {
				width:800,
				height:515
			};
			options.title = this.options.title;
			
			this.initForm();
			this.initList();
			
			dlg.init(options);
			dlg.setContent(this.dlgTemplate);
			
			var btns = [{text:this.getLang("BTN_CLOSE"),style:"",handler:dlg.close}];
			var btn_confirm = {text:"确认",style:"btn-primary",handler:function(){
				var records = that.list.getCheckedRecords();
				if(records.length==0){
					V.alert('请选择记录！');
					return;
				}
				var values = [];
				$.each(that.options.fields,function(){
					var entityName = this.name;
					$.each(records,function(){
						values.push(this[entityName]);
					})
					var name = this.aliasName||this.name;
					var element = $('[name='+name+']',that.template);
					if(element.val()!=''){
						values = element.val()+','+values.join(',');
					}else{
						values = values.join(',');
					}
					element.val(values);
				});
				dlg.close();
				this.publish({eventId:this.EVENT.SELECT_CHANGE,data:records});
			}};
			if(this.config.checkable){
				btns.splice(0,0,btn_confirm);
			}
			dlg.setBtnsBar({btns:btns});	
		}
		Selector.prototype.choose = function(entity){
			var that = this;
			this.record = entity;
			$.each(this.options.fields,function(){
				var name = this.aliasName||this.name;
				$('[name='+name+']',that.template).val(entity[this.aliasName]);
			});
			this.dialog.close();
			this.publish({eventId:this.EVENT.SELECT_CHANGE,data:entity});
		}
		Selector.prototype.getValue = function(){
			var that = this;
			var val = {};
			// $.each(this.options.fields,function(){
			// 	var name = this.aliasName||this.name;
			// 	val[name] = $('[name='+name+']',that.template).val();
			// });
			// return val;
			// 取值默认只取第一个field的值
			var field = this.options.fields[0];
			var name = field.aliasName||field.name;
			if(this.config.readonly){
				val[this.config.name] = $('[name='+name+']',this.template).text();
			}else{
				val[this.config.name] = $('[name='+name+']',this.template).val();
			}
			return val;
		}
		Selector.prototype.getEntity = function(){
			return this.record;
		}
		Selector.prototype.setReadOnly = function(config){
			$('.data-value',this.template).attr('readOnly',true);
			$('button',this.template).remove();
		}
		Selector.prototype.clear = function(config){
			$('.data-value',this.template).val('');
		}
		Selector.prototype.validate = function(){
			var isValid = true;
			$('*[data-validator]',this.template).each(function(){
				var required = $(this).attr('data-required')||false;
				var rules = $(this).attr('data-validator')||'';
				var v = $(this).val();
				if(rules=='dateRange' && v==',')
					v='';
				
				if(required=="true"&&(v==""||v==null)){
						$(this).parent().find('.error_msg').text("该值不可为空").show();
						isValid = false;
				}else{
					if(rules){
						var msg = Validator.validate(rules,v);
						if(msg){
							$(this).parent().find('.error_msg').text(msg).show();
							isValid = false;
						}else{
							$(this).parent().find('.error_msg').empty().hide();
						}
					}else{
						$(this).parent().find('.error_msg').empty().hide();
					}
				}
			});
			return isValid;
		}
		Selector.prototype.enableAutoComplete = function(){
			//传入参数autoInputKey,后台根据此参数对编码和名字做模糊查询
			var that = this;
			var filters = {};
			var params = that.options.params;
			for(key in params){
				filters[key] = params[key];
			}
			filters.autoFields = this.options.autoFields;
			$('input',this.template).autocomplete({
				//disabled: true,
				minLength:1,//最小输入
				defer:500,//延迟查询ms
				source: function( request, response ) {
					if(that.options.autoFields){
						var fields = that.options.autoFields.split(',');
							$.each(fields,function(index,field){
							filters[field] = request.term;
						})
					}
					
			        V.ajax({
			          url: that.options.url,
			          data: {filterList:filters},
			          success: function( data ) {
			          	  var result = data.result;
			        	  response( result);
			          }
			        });
			    },
			    // close:function(event, ui){
			    // 	$(this).val();
			    // },
			    change:function(event, ui){
			    	if(ui.item){
			    		that.publish({eventId:that.EVENT.SELECT_CHANGE,data:ui.item});
			    		return;
			    	}
			    	var val = $(this).val();
			    	if(val == ""){
			    		that.publish({eventId:that.EVENT.SELECT_EMPTY});
			    		return;
			    	}
			    	that.publish({eventId:that.EVENT.SELECT_CHANGE,data:ui.item});
			    },
			    focus:function(event, ui){
			    	return false;
			    },
			    select:function(event, ui){
			    	event.stopPropagation();
			    	$.each(that.options.fields,function(){
						var name = this.aliasName||this.name;
						$('[name='+name+']',that.template).val(ui.item[this.name]);
					});
					$(this).autocomplete('close');
					$(this).change();
					
			    	return false;
			    }
			})
			.data( "ui-autocomplete" )._renderItem = function( ul, item ) {
			  var li = $( "<li class='suggest_term'></li>" ).data('entity',item);
			  var item_con = $("<a href='javascript:void(0)' class='term'></a>");
			  li.append(item_con);
			  $.each(that.options.autoFormatFields,function(index,field){
				  var col = "<span class='col'>"+item[field]+"</span>";
				  item_con.append(col);
			  })
		      return li.appendTo( ul );
		    };
		    $('input',this.template).click(function(e){
				// if(e.which == 13){
					$(this).autocomplete("search",$(this).val());
				// }
			})
		}
	})(V.Classes['v.views.component.Selector']);
},{plugins:["v.ui.dialog"]});