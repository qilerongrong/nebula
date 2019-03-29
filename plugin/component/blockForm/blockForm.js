;V.registPlugin("v.component.blockForm",function(){
	V.Classes.create({
		className:"v.component.BlockForm",
		superClass:"v.component.Form",
		init:function(){
            this.ns = "v.component.blockForm";
		}
	});
	(function(BlockForm){
		BlockForm.prototype.init = function(options){
			if(options.container){
				this.container = options.container;
			    delete options.container;
			}
			this.record = options.record;
			for(prop in options){
				this.options[prop] = options[prop];
			}
			this.colspan = this.options.colspan;
			this.container.append(this.template);
			this.renderForm();
			
		}
		//如果block存在render则把
		BlockForm.prototype.renderForm = function(){
			var Form = V.Classes['v.component.Form'];
			var table = $('<table class="" ></table>');
			var cols = this.colspan;
			this.template.append(table);
			var row = $('<tr></tr>');
			table.append(row);
			var that = this;
			var tdW = this.COLSPAN[cols+""].td;
			var thW = this.COLSPAN[cols+""].th;
			$.each(this.options.items,function(i){
				var itemcols = this.colspan || 1;
				if(itemcols>cols){
					itemcols = cols;
				}
				var cell = null;
				if(this.isBlock){
					cell = $('<td class="td_block" colspan='+2*cols+' fieldName='+this.name+'></td>');
					var item = that.createBlockField(this);
					cell.append(item);
				}else{
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
						cell = $('<td style = "width:'+_tdW+'" fieldName='+this.name+' colspan='+(2* itemcols-1)+'></td>');
						cell.append(item)
					}else{
						//类型为hidden和button时,此处有问题，TODO。button类型的应该不在此，且不应该是row.append;
						var item = that.createField(this);
						row.append(item);
					}
				}
				itemcols = this.colspan || 1;
				if(that.options.colspan<0){
					//如果为负数，则用空的td填充row,
					if(that.options.colspan + itemcols > 0){
						var emptyCols = that.options.colspan + itemcols;
						row.append('<td class="td_epmty_filled" colspan='+2* emptyCols+'></td>');
					}
					that.options.colspan = cols-itemcols;
					row = $('<tr></tr>');
					table.append(row);
				}
				if(!this.isBlock&&this.type != Form.TYPE.HIDDEN && this.type !=7){
					var th = that.createLabel(this.label,this.required,this.helper);
					row.append(th);
				}
				if(this.isBlock){
					row.addClass('tr_block');
				}
				row.append(cell);
				if(this.cascadingBy){
					if(!that.cascadingConfig){
						that.cascadingConfig = {};
					}
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
			this.initEvent();
		}
		BlockForm.prototype.createBlockField = function(config){
			//设置block colspan为占满一行
			config.colspan = this.colspan;
			this.options.colspan -= this.colspan
			//config.getValue = function(){};
			var that = this;
			var blockStyle = "block";
			var html = $('<div class="'+blockStyle+'"><span style="vertical-align:middle"><b>'+config.label+':</b></span></div>');
			if(config.name.substring(0,8) == "subblock"){
				blockStyle = "subblock";
				var btn_toggle = $('<a class="block_toggle" href="javascript:void(0);"><i class="icon-minus"></i></a>');
				btn_toggle.toggle(function(){
					$('i',this).removeClass('icon-minus').addClass('icon-plus');
					that.toggle(config.block,"close");
				},function(){
					$('i',this).removeClass('icon-plus').addClass('icon-minus');
					that.toggle(config.block,"open");
				});
				html.append(btn_toggle);
			}
			html.addClass(blockStyle);
			if(config.render){
				var rightDiv = $('<div class="block_toolbar"></div>');
				rightDiv.append(config.render());
				html.append(rightDiv);
			}
			return html;
		};
        BlockForm.prototype.getValues = function(){
			var that = this;
			var vals = {};
            var Form = V.Classes["v.component.Form"];
			$.each(this.options.items,function(){
                if(this.isBlock){
                    return true;
                }
        	   if(this.type == Form.TYPE.PLUGIN){
        	   		if(this.plugin.getValue){
						var pv = this.plugin.getValue();
						$.each(pv,function(k,v){
							vals[k] = v;
						})
        	   		}
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
		};
		BlockForm.prototype.toggle = function(block,status){
			var items = this.options.items;
			$.each(items,function(){
				if(this.block === block && !this.isBlock){
					if(status == "close"){
						this.element&&this.element.parent('td').parent('tr').hide();
					}else{
						this.element&&this.element.parent('td').parent('tr').show();
					}
				}
			})
		}
 		
	})(V.Classes['v.component.BlockForm']);
},{plugins:['v.fn.validator','v.component.form']})