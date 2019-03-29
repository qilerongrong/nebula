//grid中的column
;V.registPlugin("v.ui.column",function(){
    V.Classes.create({
        className:"v.ui.Column",
		superClass:'v.Plugin',
        init:function(){
            this.ns = 'v.ui.column';
            this.options = {
                displayName:'Column',
                key:'',
                group:[],//{column}
                type:'default',
                render:null,
                width:'auto',
				isShow:true,
				align:'left',
                sortable:false,
				//{dataType,dataLength,precision,multiValues}
				editor:null
            }
        }
    });
    (function(Column){
		Column.EDITORTYPE = {
			TEXT:'TEXT',
			DATE:'DATE',
			NUMBER:'NUMBER',
			SELECT :'SELECT',
			TEXTAREA:'TEXTAREA',
			CHECKBOX :'CHECKBOX',
			PRICE:'PRICE'
		}
		Column.EDITOR = {}
		Column.EDITOR[Column.EDITORTYPE.TEXT] = {
			//e:{类型；长度；精度；初始值}
			editor:function(e){
				this._editor = $('<input class="grid_editor" type="text"  />');
				this.setValue(e.defaultValue);
				var Form = V.Classes['v.component.Form'];
				var rule = Form.generateValidator(e.dataType,e.dataLength,e.precision);
				var customRule = e.customRule;
				var customMessage = e.customMessage;
				this._editor.change(function(){
					var value = this.value;
					var isValid = true;
					if(customRule&&(value!=""&&value!=null&&value!=undefined)){
						var reg = new RegExp(customRules);
						isValid = reg.test(value);
						if(!isValid){
							V.alert(customMessage);
						}else{
							if(config.precision){
								var val = parseFloat($(this).val());
								$(this).val(val.toFixed(config.precision));
							}
						}
					}else if(rule&&(value!=""&&value!=null&&value!=undefined)){
						var msg = Validator.validate(rule,value);
						isValid = msg?false:true
						if(msg){
							V.alert(msg);
						}else{
						}
					}else{
					}
					e.isValid = isValid;
				})
				return this._editor;
			},
			setValue:function(val){
				this._editor.val(val);
			},
			getValue:function(){
				return this._editor.val();
			}
		}
		Column.EDITOR[Column.EDITORTYPE.NUMBER] = {
			editor:function(e){
				this._editor = $('<input class="grid_editor" type="text" />');
				this.setValue(e.defaultValue);
				var Form = V.Classes['v.component.Form'];
				var rule = Form.generateValidator(e.dataType,e.dataLength,e.precision);
				var customRule = e.customRule;
				var customMessage = e.customMessage;
				this._editor.change(function(){
					var value = this.value;
					var isValid = false;
					if(customRule&&(value!=""&&value!=null&&value!=undefined)){
						var reg = new RegExp(customRules);
						isValid = reg.test(value);
						if(!isValid){
							//$(this).parent().find('.error_msg').show().text(customMessage);
							
							V.alert(customMessage);
						}else{
							$(this).parent().find('.error_msg').empty().hide();
							if(e.precision){
								var val = parseFloat($(this).val());
								$(this).val(val.toFixed(e.precision));
							}
						}
					}else if(rule&&(value!=""&&value!=null&&value!=undefined)){
						var msg = Validator.validate(rule,value);
						isValid = msg?false:true
						if(msg){
							//$(this).parent().find('.error_msg').show().text(msg);
							V.alert(msg);
						}else{
							// $(this).parent().find('.error_msg').empty().hide();
							if(e.precision){
								var val = parseFloat($(this).val());
								$(this).val(val.toFixed(e.precision));
							}
						}
					}else{
						// $(this).parent().find('.error_msg').empty().hide();
					}
					e.isValid = isValid;
				})
				return this._editor;
			},
			setValue:function(val){
				this._editor.val(val);
			},
			getValue:function(){
				return this._editor.val();
			}
		}
		Column.EDITOR[Column.EDITORTYPE.PRICE] = {
			editor:function(e){
				this._editor = $('<input class="grid_editor" type="text" />');
				this.setValue(e.defaultValue);
				var Form = V.Classes['v.component.Form'];
				var rule = Form.generateValidator(e.dataType,e.dataLength,e.precision);
				var customRule = e.customRule;
				var customMessage = e.customMessage;
				this._editor.change(function(){
					var value = this.value;
					var isValid = false;
					if(customRule&&(value!=""&&value!=null&&value!=undefined)){
						var reg = new RegExp(customRules);
						isValid = reg.test(value);
						if(!isValid){
							//$(this).parent().find('.error_msg').show().text(customMessage);
							
							V.alert(customMessage);
						}else{
							$(this).parent().find('.error_msg').empty().hide();
							if(e.precision){
								var val = parseFloat($(this).val());
								$(this).val(val.toFixed(e.precision));
							}
						}
					}else if(rule&&(value!=""&&value!=null&&value!=undefined)){
						var msg = Validator.validate(rule,value);
						isValid = msg?false:true
						if(msg){
							//$(this).parent().find('.error_msg').show().text(msg);
							V.alert(msg);
						}else{
							// $(this).parent().find('.error_msg').empty().hide();
							if(e.precision){
								var val = parseFloat($(this).val());
								$(this).val(val.toFixed(e.precision));
							}
						}
					}else{
						// $(this).parent().find('.error_msg').empty().hide();
					}
					e.isValid = isValid;
				})
				return this._editor;
			},
			setValue:function(val){
				this._editor.val(val);
			},
			getValue:function(){
				return this._editor.val();
			}
		}
		Column.EDITOR[Column.EDITORTYPE.DATE] = {
			editor:function(e){
				this._editor = $('<input class="grid_editor" type="text" />');
				this.isValid = true;
				e.isValid = this.isValid;
				this._editor.datepicker({
			        dateFormat: "yy-mm-dd",
					showMonthAfterYear:true,
					changeMonth: true,
		            changeYear: true
		        });
		        this._editor.keyup(function(){
		        	return false;
		        })
				this.setValue(e.defaultValue);
				return this._editor;
			},
			setValue:function(val){
				this._editor.val(val);
			},
			getValue:function(){
				return this._editor.val();
			}
		}
		Column.EDITOR[Column.EDITORTYPE.SELECT] = {
			editor:function(e){
				var dom = this._editor = $('<select class="grid_editor"/></select>');
				var multiList = e.multiList;
				this.isValid = true;
				e.isValid = this.isValid;
				$.each(multiList,function(index,opt){
					var opt = $('<option value='+opt[1]+'>'+opt[0]+'</option>');
					dom.append(opt);
				})
				dom.val(e.defaultValue);
				return this._editor;
			},
			setValue:function(val){
				this._editor.val(val);
			},
			getValue:function(){
				return this._editor.val();
			}
		}
        Column.TYPE = {
            text:0,
            checkbox:1,
            customized:2
        }
        Column.prototype.init = function(options){
            for(prop in options){
			    this.options[prop] = options[prop];
			}
            if(this.options.group){
            	var cols = this.options.group;
            	var group = [];
            	$.each(cols,function(){
            		var col = new V.Classes['v.ui.Column']();
            		col.init(this);
            		group.push(col);
            	});
            	this.options.group = group;
            }
        }
        Column.prototype.render = function(record){
            var options = this.options;
            return (options.render&&options.render.call(this,record))||record[this.options.key]||'';
        }
    })(V.Classes['v.ui.Column'])
});