;V.registPlugin("v.component.form",function(){
	V.Classes.create({
		className:"v.component.Form",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.component.form";
			/**item:{label:'',colspan:1,name:'',value:'',type,required:false,validator:'',styleclass}
			 * select: {...multiList:[[]]}
			 * *colspan:每行多少个
			 */
			this.options = {
				colspan:2,
				record:null,
				items:[]
			}
			//级联配置信息
			this.cascadingConfig = null;//{fieldName1:{items:[]},fieldName2:{items:[]}}
			this.template = $('<div class="form-horizontal v-form"></div>');
			this.EVENT.INITED = "inited";
			this.COLSPAN = {
				"1":{th:"0.25",td:"0.75"},
			    "2":{th:"0.18",td:"0.32"},
			    "3":{th:"0.12",td:"0.21"},
			    "4":{th:"0.12",td:"0.13"}
			}
		}
	});
	(function(Form){
		Form.TYPE = {
			TEXT:'TEXT',
			DATE:'DATE',
			NUMBER:'NUMBER',
			SELECT :'SELECT',
			TEXTAREA:'TEXTAREA',
			CHECKBOX :'CHECKBOX',
			// READONLY:'READONLY',
			HIDDEN:'HIDDEN',
			PLUGIN:'PLUGIN',
			BUTTON:'7',
			EMAIL:'EMAIL',
			MOBILE:'MOBILE',
			PHONE:'PHONE',
			PRICE:'PRICE',
			CUSTOM:'-2',
			BOOLEAN:'BOOLEAN',
			DATERANGE:'DATERANGE',
			YEARMONTHRANGE:'DATE_YEAR_MON',
			PERCENT:'PERCENT',
			FIELDRANGE:'FIELDRANGE',
			PASSWORD:'PASSWORD',
			RADIO:'RADIO',
			SUBFORM:'SUBFORM',
			FIXFIELD:'FIX_LENGTH',
			COMMONTEXT:'COMMON_TEXT',
			CALCULATE:'CALCULATE',
			FILE:'FILE'
		};
		Form.CASCADINGRULE = {
			
		}
       //定义对于验证方法
		Form.RULES = {
			"TEXT":'text',
			"TEXTAREA":'text',
			"DATE":'date',
			"EMAIL":'email',
			"NUMBER":'positive',
			"MOBILE":'mobile',
			"PHONE":'phone',
			"PRICE":'price',
			"0":'text',
			"FIX_LENGTH":'exactLength',
			"COMMON_TEXT":'commonText'
		}
		Form.generateValidator = function(dataType,length,precision){
			if(dataType <0){
				return '';
			}
			var rule = Form.RULES[dataType+''];
			if(dataType=='DATE'){
				return rule;
			}
			if(length){
				if(dataType == Form.TYPE.FIXFIELD){
					rule += '('+length+')';
				}else{
					rule += '(0,'+length+')';
				}
			}
			if(precision){
				rule += '('+precision+')';
			}
			return rule;
		}
        Form.prototype.init = function(options){
			if(options.container){
				this.container = options.container;
			    delete options.container;
			}
			if(options.record){
				this.record = options.record;
			}
			for(prop in options){
				this.options[prop] = options[prop];
			}

			this.colspan = this.options.colspan;
			this.container&&this.container.append(this.template);
			this.renderForm();
        };
		Form.prototype.initEvent = function(){
			this.publish({eventId:this.EVENT.INITED,data:this});
			var that =this;
			//TODO  校验应放置在各个item中，避免个性化校验越来越多不好维护
			$('*[data-validator],*[data-required]',this.template).bind('change',function(){

				var required = $(this).attr('data-required')||false;
				var rules = $(this).attr('data-validator')||'';
				var v = $(this).val();
				
				var config = $(this).data('config');
				var customRules = config&&config.validateRule;
				var customMessage = config&&config.validateMessage;
				
				if(required=="true"&&v===""){
					$(this).parent().find('.error_msg').text(that.getLang("MSG_VALUE_CONNOT_NULL")).show();
					return false;
				}else{

					if(customRules&&(v!==""&&v!=null&&v!=undefined)){
						var reg = new RegExp(customRules);
						isValid = reg.test(v);
						if(!isValid){
							$(this).parent().find('.error_msg').show().text(customMessage);
						}else{
							$(this).parent().find('.error_msg').empty().hide();
							if(config.precision){
								var val = parseFloat($(this).val());
								$(this).val(val.toFixed(config.precision));
							}
						}
					}else if(rules&&(v!==""&&v!=null&&v!=undefined)){
						if(config.type == Form.TYPE.PRICE){
							v = V.Util.Number.commafyback(v);
						}
						var msg = Validator.validate(rules,v);
						if(msg){
							$(this).parent().find('.error_msg').show().text(msg);
						}else{
							$(this).parent().find('.error_msg').empty().hide();
							if(config.precision){
								var val = $(this).val();
								val = V.Util.Number.commafyback(val);
								$(this).val(parseFloat(val).toFixed(config.precision));
							}
							if(config.type == Form.TYPE.PRICE){
								var val = $(this).val();
								$(this).val(V.Util.Number.commafy(val));
							}
						}
					}else{
						$(this).parent().find('.error_msg').empty().hide();
					}
				}
			});
			$('select[data-required]',this.template).change(function(){
				var required = $(this).attr('data-required')||false;
				var v = $(this).val();
				if(required=="true"&&v===""){
					$(this).parent().find('.error_msg').text(that.getLang("MSG_VALUE_MUST_CHOOSE")).show();
				}
			});
			//回车到下一个输入项,要监听keydown事件，select回车事，只触发keydown时间，keyup不会触发
			$('input',this.template).bind('keydown',function(e){
				if(e.keyCode == 13){
					var index = $(':input',that.template).index(this);
				    $(':input:eq('+(index+1)+')',that.template).focus();
				}
			});
			//处理级联事件
			this.initCasadingEvent();
		}
		/**
		 * 级联事件处理
		 *由字典类型的字段触发
		 */
		Form.prototype.initCasadingEvent = function(){
			var that = this;
			if(this.cascadingConfig){
				$.each(this.cascadingConfig,function(key,val){
					var cascadingItems = val.items;
					if(cascadingItems.length == 0){
						return true;
					}
					var parentItem = that.getItem(key);
					$('select',that.getItem(key).element).change(function(){
						var parentVal = $(this).val();
						var items = val.items;
						that._doCascading(parentItem,cascadingItems);
					});
					if(that.getItem(key).getValue() == ''){
						var defaultVal = $('select option:eq(1)',that.getItem(key).element).val();
						$('select',that.getItem(key).element).val(defaultVal);
					}
					that._doCascading(parentItem,cascadingItems);
				})
			}
		}
		Form.prototype._doCascading = function(parentItem,cascadingItems){
			var that =this;
			$.each(cascadingItems,function(){
				var rule = this.cascadingRule;
			    var _rule = rule.split('(');
			    var ruleName = _rule[0];
			    var ruleParams = _rule[1].substring(0,_rule[1].length-1).split(',');
			    //避免多次循环，此处传入parentItem
			    if(ruleName == "ShowHide"){
			    	that._doShowHideCascading(parentItem,this,ruleParams);
			    }else if(ruleName == "ValueChange"){
			    	that._doValueChangeCascading(parentItem,this,ruleParams);
			    }else if(ruleName == "ValueFilter"){
			    	that._doValueFilterCascading(parentItem,this,ruleParams);
			    }
			})
		}
		Form.prototype._doShowHideCascading = function(parentItem,item,ruleParam){
			var parentVal = parentItem.getValue();
			var td_con = this.getItem(item.name).element;
			if(parentVal == ruleParam[0]){
				td_con.parent('td').show();
				td_con.parent('td').prev('th').show();
				item.isInvisible = false;
			}else{
				td_con.parent('td').hide();
				td_con.parent('td').prev('th').hide();
				item.isInvisible = true;
			}
		}
		Form.prototype._doValueChangeCascading = function(parentItem,item,ruleParam){
			var dictTypeCode = ruleParam[0];
			var parentVal = parentItem.getValue();
			var parentDictTypeCode = parentItem.dictTypeCode;
			var children = DictInfo.getChildren(parentDictTypeCode,parentVal,dictTypeCode);
			var _val = children[0]||{};
			var val = '';
			$.each(_val,function(prop){
				val = _val[prop];
				return false;
			})
			if(item.type == Form.TYPE.TEXT){
				$('input',item.element).val(val);
			}else if(item.type == Form.TYPE.TEXTAREA){
				$('textarea',item.element).val(val);
			}else if(item.type == Form.TYPE.READONLY){
				$('span',item.element).text(val);
			}
		}
		Form.prototype._doValueFilterCascading = function(parentItem,item,ruleParam){

		}
		Form.prototype.renderForm = function(){
			var table = $('<table class=""></table>');
			var cols = this.colspan;
			this.template.append(table);
			var row = $('<tr></tr>');
			table.append(row);
			var that = this;
			var tdW = this.COLSPAN[cols+""].td;
			var thW = this.COLSPAN[cols+""].th;
			$.each(this.options.items,function(){
				var itemcols = this.colspan || 1;
				if(itemcols>cols){
					itemcols = cols;
				}
				var cell = null;
				if(this.type == Form.TYPE.SUBFORM){
					cell = $('<td colspan='+(2* itemcols-1)+'></td>');
					var item = that.createField(this);
					row.append(cell.append(item));
				}else if(this.type != Form.TYPE.HIDDEN && this.type !=7){
					var _tdW = tdW*100+"%";
					if(itemcols > 1){
						_tdW = (itemcols*(tdW+thW)-tdW)*100+"%"
					}
					var item = that.createField(this);
					itemcols = this.colspan||1;//在创建createField后，有的field会设置其默认的colspan.
					cell = $('<td width='+_tdW+'" fieldName="'+this.name+'" colspan='+(2* itemcols-1)+'></td>');
					cell.append(item)
				}else{
					//类型为hidden和button时,此处有问题，TODO。button类型的应该不在此，且不应该是row.append;
					var item = that.createField(this);
					row.append(item);
				}
				itemcols = this.colspan || 1;
				if(that.options.colspan<0){
					//如果为负数，则用空的td填充row,
					if(that.options.colspan + itemcols > 0){
						var emptyCols = that.options.colspan + itemcols;
						row.append('<td class="td_epmty_filled" colspan='+2* emptyCols+'></td>');
					}
					row = $('<tr></tr>');
					table.append(row);
					that.options.colspan = cols-itemcols;
				}
				if(this.type != Form.TYPE.HIDDEN && this.type !=7){
					var th = that.createLabel(this.label,this.required,this.helper);
					row.append(th);
				}
				row.append(cell);
				// if(this.isCascading){
				// 	if(!that.cascadingConfig[this.name]){
				// 		that.cascadingConfig[this.name] = {items:[]}
				// 	}
				// }
				if(this.cascadingBy){
					var cascadingBy = this.cascadingBy;
					if(!that.cascadingConfig[cascadingBy]){
						that.cascadingConfig[cascadingBy] = {items:[]};
					}
					that.cascadingConfig[cascadingBy].items.push(this);
				}
			});
			if(this.options.colspan>0){
				var emptyCols = that.options.colspan;
				row.append('<td class="td_epmty_filled" colspan='+2*emptyCols+'></td>');
			}
			//事件写在这里，是为了重画时要对事件重新绑定
			this.initEvent();
		}
		//CUSTOM,SUBFORM 的getValue返回值和config.name无关，由各自的方法返回{}对象。
		Form.prototype.createField = function(config){
			var that = this;
		    var item = null;
		    //if record is set, use the value in record, not the value in item config.
		    if(this.record){
		    	if(this.record[config.name]!=null&&this.record[config.name]!=undefined){
		    		config.value = this.record[config.name];
		    	}else{
		    		if(config.value === null||config.value===undefined){
		    			config.value = "";
		    		}
		    		
		    	}
		    }
		    if(config.type!=Form.TYPE.PLUGIN && config.readonly){
		    	item = this.createReadonly(config);
			    config.getValue = function(){
			    	if(config.readonlyRender){
				    	return config.value;
			    	}else{
			    		return	$('*[name="'+this.name+'"]',that.template).text();
			    	}
			    }
		    }else{
		    	switch(config.type){
					case Form.TYPE.TEXT:
					    item = this.createText(config);
					    config.getValue = function(){
					    	return $.trim($(':input[name="'+this.name+'"]',that.template).val());
					    }
						break;
					case Form.TYPE.COMMONTEXT:
					    item = this.createText(config);
					    config.getValue = function(){
					    	return $.trim($(':input[name="'+this.name+'"]',that.template).val());
					    }
						break;
					case Form.TYPE.PASSWORD:
					    item = this.createPassword(config);
					    config.getValue = function(){
					    	return $(':input[name="'+this.name+'"]',that.template).val();
					    }
						break;
					case Form.TYPE.SELECT:
					    item = this.createSelect(config);
					    config.getValue = function(){
					    	return $(':input[name="'+this.name+'"]',that.template).val();
					    }
						break;
					case Form.TYPE.CHECKBOX:
					    item = this.createCheckboxGroup(config);
					    config.getValue = function(){
					    	var tmp = [];
							$(':input[name="'+this.name+'"]:checked',that.template).each(function(){
								tmp.push(this.value);
							})
							return tmp.join(',');
					    }
						break;
					case Form.TYPE.RADIO:
					    item = this.createRadioGroup(config);
					    config.getValue = function(){
					    	return $(':input[name="'+this.name+'"]:checked',that.template).val()||"";
					    }
						break;
					case Form.TYPE.HIDDEN:
					    this.createHiddenField(config);
					    config.getValue = function(){
					    	return $(':input[name="'+this.name+'"]',that.template).val();
					    }
						break;
					case Form.TYPE.NUMBER:
					    item = this.createNumberField(config);
					    config.getValue = function(){
					    	return $(':input[name="'+this.name+'"]',that.template).val();
					    }
						break;
					//去掉readonly，作为itemConfig 的属性，保留原有数据类型
					 case Form.TYPE.READONLY:
					     item = this.createReadonly(config);
					     config.getValue = function(){
					     	if(config.render){
					 	    	return config.value;
					     	}else{
					     		return	$('*[name="'+this.name+'"]',that.template).text();
					     	}
					     }
					 	break;
					case Form.TYPE.PLUGIN:
						item = this.createPluginField(config);
						break;
					case Form.TYPE.DATE:
						item = this.createDateField(config);
						config.getValue = function(){
					    	return $(':input[name="'+this.name+'"]',that.template).val();
					    }
						break;
					case Form.TYPE.TEXTAREA:
						item = this.createTextarea(config);
						config.getValue = function(){
					    	return $(':input[name="'+this.name+'"]',that.template).val();
					    }
						break;
					case Form.TYPE.BUTTON:
						item = this.createButton(config);
						config.getValue = function(){
					    	return $(':input[name="'+this.name+'"]',that.template).val();
					    }
						break;
					case Form.TYPE.EMAIL:
					    item = this.createText(config);
					    config.getValue = function(){
					    	return $(':input[name="'+this.name+'"]',that.template).val();
					    }
						break;
					case Form.TYPE.MOBILE:
					    item = this.createText(config);
					    config.getValue = function(){
					    	return $(':input[name="'+this.name+'"]',that.template).val();
					    }
						break;
					case Form.TYPE.PHONE:
					    item = this.createText(config);
					    config.getValue = function(){
					    	return $(':input[name="'+this.name+'"]',that.template).val();
					    }
						break;
					case Form.TYPE.PRICE:
					    item = this.createPrice(config);
					    config.getValue = function(){
					    	var val = $(':input[name="'+this.name+'"]',that.template).val();
					    	return V.Util.Number.commafyback(val);
					    }
						break;
					case Form.TYPE.CUSTOM:
					    item = this.createCustom(config);
						if(config.getValue == undefined){
							config.getValue == function(){
								return null;
							}
						}
						break;
					case Form.TYPE.BOOLEAN:
					    item = this.createBooleanField(config);
					    config.getValue = function(){
					    	var eleValue = $(':input[name="'+this.name+'"]',that.template).attr('checked');
					    	if(eleValue=='checked')
					    		return true;
					    	else
					    		return false;
					    }
						break;
					case Form.TYPE.DATERANGE:
					    item = this.createDateRange(config);
					    config.getValue = function(){
					    	return $(':input[name="'+this.name+'"]',that.template).val();
					    }
						break;
					case Form.TYPE.YEARMONTHRANGE:
					    item = this.createYearMonthRange(config);
					    config.getValue = function(){
					    	return $(':input[name="'+this.name+'"]',that.template).val();
					    }
						break;
					case Form.TYPE.PERCENT:
					    item = this.createPercent(config);
					    config.getValue = function(){
					    	var value = $(':input[name="'+this.name+'"]',that.template).val();
							value = V.Util.Float.div(value,100);
							return value;
					    }
						break;
					case Form.TYPE.FIELDRANGE:
					    item = this.createFieldRange(config);
					    config.getValue = function(){
					    	return $(':input[name="'+this.name+'"]',that.template).val();
					    }
						break;
					case Form.TYPE.SUBFORM:
						item = this.createSubForm(config);
						break;
					case Form.TYPE.FIXFIELD:
					    item = this.createFixField(config);
					    config.getValue = function(){
					    	return $.trim($(':input[name="'+this.name+'"]',that.template).val());
					    }
						break;
					case Form.TYPE.CALCULATE:
					    item = this.createCalculateField(config);
					    config.getValue = function(){
					    	return $.trim($(':input[name="'+this.name+'"]',that.template).val());
					    }
					    break;
				}
		    }
			config.element = item;
			$(item).find('[data-validator]').data('config',config);
			if(config.type!=Form.TYPE.HIDDEN){
				var item_cols = config.colspan || 1;
				this.options.colspan -= item_cols;
			}
			return item;
		};
		Form.prototype.createLabel = function(lbl,required,helper){
			var thW = this.COLSPAN[this.colspan+""].th;
			thW = thW*100 +"%";
			var required_mark = "";
			if(required == true || required == 'true'){
				required_mark = "<span class='required'>*</span>";
			}
		     var th = $('<th width='+thW+' style="vertical-align:top;" class="" style=""></th>');
			 th.html(required_mark+lbl);
			 if(helper){
			 	var _helper = $('<a href="javascript:void(0);" title='+helper+' class="help" style="vertical-align:middle;margin:2px 0px;"><i class="icon-question-sign"></i></a>');
				th.append(_helper);
				_helper.tooltip({
				  position: {
				    my: "center bottom-20",
					at: "center top",
					using: function(position, feedback) {
					  	$( this ).css(position);
				    }
				  }
			    });
			 }
			 return th;
		};
		Form.prototype.createReadonly = function(config){
			var value = config.value==null?'':config.value;
			if(typeof(value)=="string" && value.indexOf(" 00:00:00")!=-1){
				value = value.split(" 00:00:00")[0];
			}

			if(config.type == Form.TYPE.PRICE && !config.readonlyRender){
				config.readonlyRender = function(){
					return V.Util.Number.commafy(this.value);
				}
			}else if(config.precision && !config.readonlyRender){
				config.readonlyRender = function(){
					if(config.value === "" || config.value === null || config.value=== undefined){
						return "";
					}
					return config.value.toFixed(config.precision);
				}
			}
			if(config.readonlyRender){
				value = config.readonlyRender(value);
				return $('<div></div>').append(value);
			}
			var html = $('<div>\
							<span type="text" class="readonly" name="'+config.name+'">'+value+'</span>\
						  </div>');
			if(config.block){
				$('span',html).attr('block',config.block);
			}
			return html;
		}
		Form.prototype.createButton = function(config){
			var html = $('<input type="button" class="btn btn-primary" name="'+config.name+'" value="'+(config.value||'')+'" />');
		    html.click(function(){
		  	   config.handler && config.handler();
		    });
		    if(config.block){
				html.attr('block',config.block);
			}
			return html;
		}
		Form.prototype.createText = function(config){
			var validator = config.validator||"";
			var required = config.required||false;
			var value = config.value;
			if(value==null){
				value = "";
			}
			//拼写验证长度方法
			var item_size = this.item_size_style;
			var styleClass = config.styleClass||'';
			var html = $('<div>\
                                <input type="text" class="input '+item_size+' '+styleClass+'" name="'+config.name+'" data-validator="'+validator+'" data-required="'+required+'">\
                                <p class="error_msg"></p>\
                         </div>');
			if(config.disabled){
				$('input',html).attr('disabled',true);
			}else{
				$('input',html).attr('disabled',false);
			}
			$('input',html).val(value);
			$('input',html).attr('conType',config.type||'');
			$('input',html).attr('conOperator',config.operator||'');
			if(config.block){
				$('input',html).attr('block',config.block);
			}
			return html;
		}
		Form.prototype.createPrice = function(config){
			var validator = config.validator||"";
			var required = config.required||false;
			var value = config.value;
			if(value==null){
				value = "";
			}

			if(value){
				value = V.Util.Number.commafy(value);
			}

			//拼写验证长度方法
			var item_size = this.item_size_style;
			var styleClass = config.styleClass||'';
			var html = $('<div>\
                                <input type="text" class="input '+item_size+' '+styleClass+'" name="'+config.name+'" data-validator="'+validator+'" data-required="'+required+'">\
                                <p class="error_msg"></p>\
                         </div>');
			$('input',html).val(value);
			$('input',html).attr('conType',config.type||'');
			$('input',html).attr('conOperator',config.operator||'');
			if(config.block){
				$('input',html).attr('block',config.block);
			}
			return html;
		}
		Form.prototype.createPassword = function(config){
			var validator = config.validator||"";
			var required = config.required||false;
			var value = config.value;
			if(value==null){
				value = "";
			}
			var item_size = this.item_size_style;
			var styleClass = config.styleClass||'';
			var html = $('<div>\
                                <input type="password" class="input '+item_size+' '+styleClass+'" name="'+config.name+'" value="'+value+'" data-validator="'+validator+'" data-required="'+required+'">\
                                <p class="error_msg"></p>\
                         </div>');
			$('input',html).attr('conType',config.type||'');
			$('input',html).attr('conOperator',config.operator||'');
			if(config.block){
				$('input',html).attr('block',config.block);
			}
			return html;
		}
		Form.prototype.createNumberField = function(config){
			var validator = config.validator||"";
			var required = config.required||false;
			var item_size = this.item_size_style;
			var styleClass = config.styleClass||'';
			var required_mark = "";
			var value = config.value;
			if(value==null){
				value = "";
			}
			var html = $('<div>\
                                <input type="text" class="input '+item_size+' '+styleClass+'" name="'+config.name+'" value="'+value+'" data-validator="'+validator+'" data-required="'+required+'">\
                                <p class="error_msg"></p>\
                         </div>');
			$('input',html).attr('conType',config.type||'');
			$('input',html).attr('conOperator',config.operator||'');
			if(config.precision){
				$('input',html).val(parseFloat(value).toFixed(config.precision));
			}else{
				$('input',html).val(value);
			}
			if(config.block){
				$('input',html).attr('block',config.block);
			}
			return html;
		}
		Form.prototype.createSelect = function(config){
			var required = config.required||false;
			var item_size = this.item_size_style;
			
			var html = $('<div>\
                                <select autocomplete="off" class="input " name="'+config.name+'" value="'+(config.value||'')+'" data-value="'+(config.value||'')+'" data-required='+required+'></select>\
                                <p class="error_msg"></p>\
                          </div>');
			var emptyText = config.emptyText||"请选择";
			var emptyOpt = $('<option value="">'+emptyText+'</option>');
            var notip = config.notip||false;
            if (!notip) {
				$('select',html).append('<option value="">'+emptyText+'</option>');
			}
		    $.each(config.multiList,function(){
		    	var item = '';
		    	if(config.value==this[1])
		    		item = $('<option value="'+this[1]+'" selected>'+this[0]+'</option>');
		    	else	
					item = $('<option value="'+this[1]+'">'+this[0]+'</option>');
			    $('select',html).append(item);
			});
			$('select',html).attr('conType',config.type||'');
			$('select',html).attr('conOperator',config.operator||'');
			if(config.autocomplete){
				$('select',html).combobox({autocomplete:"off"});
			}
			if(config.block){
				$('input',html).attr('block',config.block);
			}
			return html;
		};
		Form.prototype.createCheckboxGroup = function(config){
			var html = $("<div><div class='form_checkbox'></div><p class='error_msg'></p></div>");
			var value = config.value+""||"";
			var vals = value.split(',');
			$.each(config.multiList,function(){
		    	var item = $('<input type="checkbox" name="'+config.name+'" value="'+this[1]+'"/><span style="margin-right:18px">'+this[0]+'&nbsp;</span>');
			    $('.form_checkbox',html).append(item);
			});
			$.each(vals,function(){
				$('input:checkbox[value='+this+']',html).attr("checked",true);
			})
			$('.form_checkbox',html).attr('conType',config.type||'');
			$('.form_checkbox',html).attr('conOperator',config.operator||'');
			if(config.block){
				$('.form_checkbox',html).attr('block',config.block);
			}
			return html;
		};
		Form.prototype.createRadioGroup = function(config){
			var html = $("<div><div class='form_radio'></div><p class='error_msg'></p></div>");
			var value = config.value+""||"";
			$.each(config.multiList,function(){
		    	var item = $('<input type="radio" name="'+config.name+'" value="'+this[1]+'"></input><span style="margin-right:18px">'+this[0]+'</span>');
			    $('.form_radio',html).append(item);
			})
			if (value) {
				$('input:radio[value='+value+']',html).attr("checked",true);
			}
			$('.form_radio',html).attr('conType',config.type||'');
			$('.form_radio',html).attr('conOperator',config.operator||'');
			if(config.block){
				$('.form_radio',html).attr('block',config.block);
			}
			return html;
		};
		Form.prototype.createTextarea = function(config){
			if(!config.colspan){
				config.colspan = this.colspan;
			}
			var required = config.required||false;
			var rows = config.rows||5;
			//拼写验证长度方法
			var validator = config.validator||"";
			var item_size = this.item_size_style;
			var styleClass = config.styleClass||'';
			var html = $('<div>\
                                <textarea rows='+rows+' class="input '+item_size+' '+styleClass+'" name="'+config.name+'"  data-validator="'+validator+'" data-required="'+required+'">'+(config.value||'')+'</textarea >\
                                <p class="error_msg"></p>\
                         </div>');
			$('textarea',html).attr('conType',config.type||'');
			$('textarea',html).attr('conOperator',config.operator||'');
			if(config.block){
				$('textarea',html).attr('block',config.block);
			}
			return html;
		}
		Form.prototype.createDateField = function(config){
			var validator = config.validator||"";
			var required = config.required||false;
			var item_size = this.item_size_style;
			var styleClass = config.styleClass||'';
			var value = config.value||'';
			if(value.indexOf(" ")!=-1){
				value = value.split(" ")[0];
			}
//			if(cols<3){
//				item_size = "input-xlarge";
//			}
			var html = $('<div class="">\
                                <input type="text" class="input small datepicker '+item_size+' '+styleClass+'" name="'+config.name+'" value="'+(value)+'" data-validator="'+validator+'" data-required="'+required+'">\
                                <p class="error_msg"></p>\
                         </div>');
			 $('.datepicker',html).datepicker({
				         dateFormat: "yy-mm-dd",
						 showMonthAfterYear:true,
						 changeMonth: true,
			             changeYear: true
			          });
			$('input',html).attr('conType',config.type||'');
			$('input',html).attr('conOperator',config.operator||'');
			if(config.block){
				$('input',html).attr('block',config.block);
			}
			return html;
		}
		Form.prototype.createYearMonthRange = function(config){
			var validator = config.validator||'yearMonthRange';
			var required = config.required||false;
			var item_size = this.item_size_style;
			
			if(config.value == null || config.value==undefined||config.value==''){ //['201301','201305']
				config.value = ['',''];
			}
			
			var date1 = config.value[0];
			var date2 = config.value[1];
			
			if(date1+date2=='')  //默认''
				config.value = '';
			
			var myDate = new Date();
			var year = myDate.getFullYear();
			var month = myDate.getMonth()+1;
			var startYear = $('<select class="year"></select>');
			var startMonth = $('<select class="month"></select>');
			var endYear = $('<select class="year"></select>');
			var endMonth = $('<select class="month"></select>');
			for(i=year-5; i<=year+5; i++){
				if(i==year){
					startYear.append('<option value="'+i+'" selected>'+i+'</option>');
					endYear.append('<option value="'+i+'" selected>'+i+'</option>');
				}
				else{
					startYear.append('<option value="'+i+'">'+i+'</option>');
					endYear.append('<option value="'+i+'">'+i+'</option>');
				}
			}
			for(i=1; i<=12; i++){
				i = i<10?('0'+i):i;
				if(i==month){
					startMonth.append('<option value="'+i+'" selected>'+i+'</option>');
					endMonth.append('<option value="'+i+'" selected>'+i+'</option>');
				}
				else{
					startMonth.append('<option value="'+i+'">'+i+'</option>');
					endMonth.append('<option value="'+i+'">'+i+'</option>');
				}
			}
			
			if(date1!=''){
				startYear.val(date1.substring(0,4)||year);
				startMonth.val(date1.substring(4,6)||month);
			}
			if(date2!=''){
				endYear.val(date2.substring(0,4)||year);
				endMonth.val(date2.substring(4,6)||month);
			}
			
			var html = $('<div class=""></div>');
			var hValue = $('<input name="'+config.name+'" value="'+config.value+'" type="hidden" data-validator="'+validator+'">');
			if(config.value==''){
				hValue.val(startYear.val()+startMonth.val()+','+endYear.val()+endMonth.val());
			}
			
			html.append(startYear).append('<span>'+this.getLang("TIP_YEAR")+'</span>').append(startMonth).append('<span>'+this.getLang("TIP_MOUTH")+'</span>').append('<span style="margin:10px;">-</span>')
				.append(endYear).append('<span>'+this.getLang("TIP_YEAR")+'</span>').append(endMonth).append('<span>'+this.getLang("TIP_MOUTH")+'</span>');
			html.append(hValue).append('<p class="error_msg"></p>');
			
			$('select',html).change(function(){
				var value = startYear.val()+startMonth.val()+','+endYear.val()+endMonth.val();
				hValue.val(value);
			})
			$('select.year',html).css({'width':'60px'});
			$('select.month',html).css({'width':'50px'});
			hValue.attr('conType',config.type||'');
			hValue.attr('conOperator',config.operator||'');
			if(config.block){
				hValue.attr('block',config.block);
			}
			return html;
		}
		Form.prototype.createDateRange = function(config){
			if(config.value == null || config.value==undefined||config.value==''){
				config.value = ['',''];
			}
			var item_size = this.item_size_style;
			
			var date1 = config.value[0];
			var date2 = config.value[1];
			
			if(date1+date2=='')  //默认''
				config.value = '';
			
			var validator = config.validator||"dateRange"; //默认dateRange验证
			var required = config.required||false;
			var html = $('<div class="date_range">\
		                    <input type="text" class="input input-small datepicker start"  value="'+(date1||'')+'" />\
							<span class="separator">-</span><input type="text" class="input input-small datepicker end"  value="'+(date2||'')+'" />\
		                    <input type="hidden" class="date-range" name="'+config.name+'" value="'+(config.value||'')+'" data-validator="'+validator+'" data-required="'+required+'"/>\
							<p class="error_msg"></p>\
		                </div>');
			 $('.start',html).datepicker({
			 	dateFormat:"yy-mm-dd",
				showMonthAfterYear:true,
				changeMonth: true,
			    changeYear: true,
				onSelect:function(dateString,inst){
					$('.end',html).datepicker('option','minDate',dateString);
					var end = $('.end',html).val()||"";
					var tmp = [dateString,end];
				 	tmp = tmp.join(',');
				 	tmp = tmp==","?"":tmp;
					$('.date-range',html).val(tmp);
				}
			 }).change(function(){
			 	var start = this.value||"";
			 	var end = $('.end',html).val()||"";
			 	var tmp = [start,end];
			 	tmp = tmp.join(',');
			 	tmp = tmp==","?"":tmp;
				$('.date-range',html).val(tmp);
				$('.end',html).datepicker('option','minDate',start);
			 })	;
			 $('.end',html).datepicker({
			 	dateFormat:"yy-mm-dd",
				showMonthAfterYear:true,
				changeMonth: true,
			    changeYear: true,
				onSelect:function(dateString,inst){
					$('.start',html).datepicker('option','maxDate',dateString);
					var start = $('.start',html).val()||"";
					var tmp = [start,dateString];
				 	tmp = tmp.join(',');
				 	tmp = tmp==","?"":tmp;
					$('.date-range',html).val(tmp);
				}
			 }).change(function(){
			 	var end = this.value||"";
			 	var start = $('.start',html).val()||"";
			 	var tmp = [start,end];
			 	tmp = tmp.join(',');
			 	tmp = tmp==","?"":tmp;
				$('.date-range',html).val(tmp);
				$('.start',html).datepicker('option','maxDate',end);
			 })	;
			 $('.date-range',html).attr('conType',config.type||'');
			 $('.date-range',html).attr('conOperator',config.operator||'');
			 if(config.block){
				$('.date-range',html).attr('block',config.block);
			 }
			 return html;	 
		}
		Form.prototype.createFieldRange = function(config){
			if(config.value == null || config.value==undefined||config.value==''){
				config.value = ['',''];
			}
			var item_size = this.item_size_style;
			
			var value1 = config.value[0];
			var value2 = config.value[1];
			
			if(value1+value1=='')  //默认''
				config.value = '';
			
			var validator = config.validator||"";
			var required = config.required||false;
			var html = $('<div class="">\
		                    <input type="text" class="input input-small start" value="'+(value1||'')+'" />\
							<span class="separator">-</span><input type="text" class="input input-small end"  value="'+(value2||'')+'" />\
		                    <input type="hidden" class="field-range" name="'+config.name+'" value="'+(config.value||'')+'" data-validator="'+validator+'" data-required="'+required+'"/>\
							<p class="error_msg"></p>\
		                </div>');
			 $('.start',html).change(function(){
				 var start = $(this).val();
				 var end = $('.end',html).val();
				 $('.field-range',html).val(start+','+end);
			 });
			 $('.end',html).change(function(){
				 var start = $('.start',html).val();
				 var end = $(this).val();
				 $('.field-range',html).val(start+','+end);
			 });
			 $('.field-range',html).attr('conType',config.type||'');
			 $('.field-range',html).attr('conOperator',config.operator||'');
			 if(config.block){
				$('.field-range',html).attr('block',config.block);
			 }
			 return html;	 
		}
		Form.prototype.createHiddenField = function(config){
			var html = $('<input type="hidden" name="'+config.name+'" value="'+(config.value||'')+'">');
			var hidden_items = $('.hidden',this.template);
			if(hidden_items.length == 0){
				hidden_items = $('<div class="hidden" class="display:none"></div>');
				this.template.prepend(hidden_items);
			}
			html.attr('conType',config.type||'');
			html.attr('conOperator',config.operator||'');
			if(config.block){
				html.attr('block',config.block);
			}
			hidden_items.append(html);
		};
		Form.prototype.createCustom = function(config){
			if(config.render){
				return config.render(config);
			}else{
				return '';
			}
		}
		/**
		 * handler 回调函数
		 * @param {Object} configform
		 */
		Form.prototype.createPluginField = function(config){
			var html = $('<div></div>');
			var plugin = config.plugin;
			var handler = config.handler;
			config.data = this.record;
			var options = {
				config:config,
				container:html
			};
			if(typeof(plugin)=='object'){
				plugin = plugin.ns;
			}
			V.loadPlugin(plugin,function(){
				var glass = V._registedPlugins[plugin].glass;
				var inst = new V.Classes[glass]();
				config.pluginName = plugin;
				config.plugin = inst;
				inst.init(options);
				handler&&handler(inst);
			});
			return html;
		}
		Form.prototype.createBooleanField = function(config){
			var checked = config.value?'checked':'';
			var html = $('<div><input type="checkbox" name="'+config.name+'"' +checked+'/></div>');
			if(config.block){
				$('input',html).attr('block',config.block);
			}
			return html;
		}
		Form.prototype.createPercent = function(config){
			var validator = config.validator||"";
			var required = config.required||false;
			var item_size = this.item_size_style;
			var styleClass = config.styleClass;
			var html = $('<div>\
                                <input type="text" class="'+item_size+' '+styleClass+'" name="'+config.name+'" value="'+V.Util.Float.mul(config.value,100)+'" data-validator="'+validator+'" data-required="'+required+'">%\
                                <p class="error_msg"></p>\
                         </div>');
            if(config.block){
				$('input',html).attr('block',config.block);
			}             
			return html;
		}
		Form.prototype.createSubForm = function(config){
//			var colspan = config.colspan || this.options.colspan;
//			var items = config.items||[];
//			var subform = new V.Classes['v.component.Form']();
//			subform.init
			if(config.render){
				return config.render();
			}else{
				return '';
			}
		}
		Form.prototype.createFileField = function(config){
			var html = $('<a href="javascript:void(0);">点击上传</a>');
			config.getValue = function(){
				
			}
			return html;
		}
		Form.prototype.createCalculateField = function(config){
			var that = this;
			var validator = config.validator||"";
			var required = config.required||false;
			var value = config.value;
			if(value==null){
				value = "";
			}
			//拼写验证长度方法
			var item_size = this.item_size_style;
			var styleClass = config.styleClass||'';
			var html = $('<div>\
                                <input type="text" class="input '+item_size+' '+styleClass+'" name="'+config.name+'" data-validator="'+validator+'" data-required="'+required+'">\
                                <p class="error_msg"></p>\
                         </div>');
			$('input',html).val(value);
			$('input',html).attr('conType',config.type||'');
			$('input',html).attr('conOperator',config.operator||'');
			if(config.block){
				$('input',html).attr('block',config.block);
			}
			var expression = config.expression;
			if(expression!=null && expression!=''){
				var args = expression.match(/\$\{(.)+?\}/g);
				if(args!=null && args!='')
				$.each(args,function(){
					var fieldName = this.substring(2,this.length-1);
					$('[name='+fieldName+']',that.template[0]).live('change',function(){
						that.caculate(config);
					})
				});
			}
			return html;
		}
		Form.prototype.caculate = function(fieldConfig,factors){
			var that = this;
			var expression = fieldConfig.expression;
			var _expression = expression.replace(/\$\{(.)+?\}/g,function(field){
				var fieldName = field.substring(2,field.length-1);
				return that.getItem(fieldName).getValue();
			});
			try{
				var result = eval(_expression);
				$('input[name='+fieldConfig.name+']',fieldConfig.element).val(result);
			}catch(e){
				return ;
			}
		}
		Form.prototype.getValues = function(){
			var that = this;
			var vals = {};
			$.each(this.options.items,function(){
        	   if(this.type == Form.TYPE.PLUGIN){
					var pv = this.plugin.getValue();
					$.each(pv,function(k,v){
						vals[k] = v;
					})
        	   }else if(this.type == Form.TYPE.CUSTOM){
        		   var pv = this.getValue()||{};
					$.each(pv,function(k,v){
						vals[k] = v;
					})
        	   }else if(this.type == Form.TYPE.SUBFORM){
        	   	    var pv = this.getValue()||{};
					$.each(pv,function(k,v){
						vals[k] = v;
					})
        	   }else{
        		   var cv = this.getValue!=null?this.getValue():'';
        		   if(this.name){
        		   	    vals[this.name] = cv;
        		   }
        	   }
			 })
			 return vals;
		}
		Form.prototype.getItemsValues = function(){
			var that = this;
			var vals = {};
			 $.each(this.options.items,function(){
			   	    if(this.type == Form.TYPE.PLUGIN){
						var pv = this.plugin.getValue();
						vals[this.name] = pv;
					}else if(this.type == Form.TYPE.DATERANGE){
						var val = $(':input[name="'+this.name+'"]',that.template).val();
						var valArr = val.split(',');
						vals[this.name] = [valArr[0],valArr[1]||''];
					}else{
						var cv = this.getValue!=null?this.getValue():'';
		        		vals[this.name] = cv;
					}
			   })
			   return vals;
		}
		Form.prototype.createFixField = function(config){
			var validator = config.validator||"";
			var required = config.required||false;
			var value = config.value;
			if(value==null){
				value = "";
			}
			//拼写验证长度方法
			var item_size = this.item_size_style;
			var styleClass = config.styleClass||'';
			var html = $('<div>\
                                <input type="text" class="'+item_size+' '+styleClass+'" name="'+config.name+'" data-validator="'+validator+'" data-required="'+required+'">\
                                <p class="error_msg"></p>\
                         </div>');
			$('input',html).val(value);
			return html;
		}
		//修改校验，支持插件校验
		Form.prototype.validate = function(){
			var that = this;
			var isValid = true;
			$.each(this.options.items,function(){
				if(this.isInvisible){
					return true;
				}
				if(this.isBlock){
					return true;
				}
				if(!this.type||this.type==Form.TYPE.HIDDEN||this.type==Form.TYPE.READONLY||this.type==Form.TYPE.CUSTOM) return true;
				this.element.find('.error_msg').hide();
				if(this.type==V.Classes['v.component.Form'].TYPE.PLUGIN){
					if(this.plugin && this.plugin.validate && !this.plugin.validate()){
						isValid = false;
					}
					return true;
				}
				
				var item = $('*[name="'+this.name+'"]',that.template);
				var required = this.required||false;
				var rules = item.attr('data-validator')||'';
				var v = this.getValue();
				
				var customRules = this.validateRule;
				var customMessage = this.validateMessage;
				if(required&&(v===""||v===null||v===undefined)){
					this.element.find('.error_msg').text(that.getLang("MSG_VALUE_CONNOT_NULL")).show();
					isValid = false;
				}else{
					if(customRules&&(v!==""&&v!=null&&v!=undefined)){
						var reg = new RegExp(customRules);
						isValid = reg.test(v);
						if(!isValid){
							item.parent().find('.error_msg').show().text(customMessage);
						}else{
							item.parent().find('.error_msg').empty().hide();
						}
					}
					else if(rules!=""&&(v!==""&&v!=null&&v!=undefined)){
						var msg = Validator.validate(rules,v);
						if(msg){
							item.parent().find('.error_msg').show().text(msg);
							isValid = false;
						}else{
							item.parent().find('.error_msg').empty().hide();
						}
					}else{
						item.parent().find('.error_msg').empty().hide();
					}
				}
			});
			return isValid;
		}
		//form状态重置
		Form.prototype.reset = function(){
		   	$('input',this.template).val('');
			$('select',this.template).val($('select',this.template).find('option:eq(0)').val());
		}
		//form刷新（运维工具新增）
		Form.prototype.refresh = function(opt){
			this.template.empty();
			var that = this;
			if(opt){
				for(key in opt){
					this.options[key] = opt[key];
				}
			}
			var table = $('<table class=""></table>');
			var cols = this.options.colspan;
			this.template.append(table);
			var row = $('<tr></tr>');
			table.append(row);
			var that = this;
			$.each(this.options.items,function(){
				var itemcols = this.colspan || 1;
				if(that.options.colspan - itemcols < 0 ){
					that.options.colspan = cols;
					row = $('<tr></tr>');
					table.append(row);
				}
				if(this.type != Form.TYPE.HIDDEN && this.type !=7){
					var th = that.createLabel(this.label,this.helper);
					row.append(th);
					var cell = $('<td colspan='+(2* itemcols-1)+' fieldName='+this.name+'></td>');
					var item = that.createField(this);
					row.append(cell.append(item));
				}else{
					//类型为hidden和button时,此处有问题，TODO。button类型的应该不在此，且不应该是row.append;
					var item = that.createField(this);
					row.append(item);
				}
			});
			
			$('*[data-validator],*[data-required]',this.template).bind('change',function(){
				var required = $(this).attr('data-required')||false;
				var rules = $(this).attr('data-validator')||'';
				var v = $(this).val();
				
				var config = $(this).data('config');
				var customRules = config&&config.validateRule;
				var customMessage = config&&config.validateMessage;
				
				if(required=="true"&&v===""){
						$(this).parent().find('.error_msg').text(that.getLang("MSG_VALUE_CONNOT_NULL")).show();
						return false;
				}else{
					if(customRules&&(v!==""&&v!=null&&v!=undefined)){
						var reg = new RegExp(customRules);
						isValid = reg.test(v);
						if(!isValid){
							$(this).parent().find('.error_msg').show().text(customMessage);
						}else{
							$(this).parent().find('.error_msg').empty().hide();
						}
					}
					else if(rules&&(v!==""&&v!=null&&v!=undefined)){
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
		Form.prototype.repaintItem = function(item){
			var name = item.name;
			var td = item.element.parent('td');
			item.element&&item.element.remove();
			item.element = this.createField(item)
			td.append(item.element);
			return item;
		}
		Form.prototype.setRecord = function(record){
			this.record = record;
		}
		Form.prototype.repaint = function(){
			//repaint 需要重置的数据
			this.template.empty();
			this.cascadingConfig = null;
			this.renderForm();
		}
		Form.prototype.refresh = function(){
			//todo
			//use setValue method of every item.
		}
		Form.prototype.getItem=function(name){
			var item = null;
			$.each(this.options.items,function(){
				// if(this.type==Form.TYPE.PLUGIN){
				// 	if(this.pluginName == name){
				// 		item = this;
				// 		return false;
				// 	}
				// }
				// else if(this.name == name){
				// 	item = this;
				// 	return false;
				// }
				if(this.name == name){
					item = this;
					return false;
				}
			})
			return item;
		}
		Form.prototype.getPluginItemsByNs = function(ns){
			var item = [];
			$.each(this.options.items,function(){
				 if(this.type==Form.TYPE.PLUGIN){
				 	if(this.pluginName == ns){
				 		item.push(this);
				 	}
				 }
			})
			return item;
		}
		Form.prototype.getElement=function(name){
			return $('*[name='+name+']',this.template);
		}
	})(V.Classes['v.component.Form']);
},{plugins:['v.fn.validator']})