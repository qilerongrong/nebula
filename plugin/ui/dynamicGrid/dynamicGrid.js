;V.registPlugin("v.ui.dynamicGrid",function(){
	V.Classes.create({
		className:"v.ui.DynamicGrid",
		superClass:"v.ui.Grid",
		init:function(){
			this.options.hasData = true;
			this.options.hasColumnsPicker = false;
			this.options.docketType = null;
			this.options.docketModule = null;
			this.hasDetail = false;
			this.isDetail = false;
			this.actionColumn = null;
		}
	});
	(function(Grid){
		//SELECT:列为select类型时，从multiList取值显示在列表中，设置render方法。
		var Form = V.Classes['v.component.Form'];
		Grid.ColumnType = {
			SELECT : Form.TYPE.SELECT,
			BOOLEAN : Form.TYPE.BOOLEAN,
			PRICE : Form.TYPE.PRICE
		}
        Grid.prototype.init = function(options){
			var url =  options.url;
			var filters = this.filters||{};
			if(options.filters){
				filters = this.filters = options.filters;
			}
			delete options['url'];
            for(prop in options){
				if(prop == "columns"){
					this.options["columns"] = this.options["columns"].concat(options["columns"]);
				}else{
					this.options[prop] = options[prop];
				}
			}
			var that = this;
			var params = {
				hasData : this.options.hasData,
				filterList : filters
			}
			var t_height = 100;
			var css = {
				//top:0,
				//left:0,
				zIndex:9999,
				//position:'absolute',
				opacity:0.7,
				background:'#efefef url(imgs/loading_16.gif) center no-repeat',
				height:t_height,
				width:'100%'
			}
			// var mask = V.mask(this.options.container,css);
            V.ajax({
				url:url,
				data:params,
				success:function(d){
					// V.unMask(mask);
					that.publish({eventId:that.EVENT.INITED,data:d});
					var config = d.columns;
					that.setData(d.data.list);
					that.hasDetail = d.data.hasDetail=='true'?true:false;
					var cols = that.options.columns;
					var _cols = [].concat(cols);
					var columns = [];
					that.options.docketType = d.data.docketType;    //picker add
					that.options.docketModule = d.data.docketModule; //picker add
					that.options.isDetail = d.data.isDetail=='true'?true:false; //picker add
					for(var i=config.length-1;i>=0;i--){
						//col 设置
						var col = {};
						col.displayName = config[i].fieldLabel;
						col.fieldName = config[i].fieldName;    //picker add
						col.key = config[i].fieldName;
						col.isShow = config[i].isUsed && config[i].isShowGrid;
						col.isBlock = config[i].isBlock;
						col.isSortable = config[i].isSortable;
						col.width = config[i].columnWidth;
						
						if(config[i].relativePlugin){
							col.relativePlugin = config[i].relativePlugin;
							col.relativeDocketType = config[i].relativeDocketType;
							col.relativeField = config[i].relativeField;
							col.relativeModule = config[i].relativeModule;
							col.render = function(record){
								var key = this.options.key;
								var dom = $('<a href="javascript:void(0);">'+record[key]+'</a>');
								dom.data('relativeDocket',{
									relativePlugin:this.options.relativePlugin,
									relativeDocketType:this.options.relativeDocketType,
									relativeField:this.options.relativeField,
									relativeModule:this.options.relativeModule
								});
								dom.click(function(){
									var relativeDocket = $(this).data('relativeDocket');
									that.viewRelativeDocket(record,relativeDocket);
								});
								return dom;
							}
						}
						//editor 设置
						var editorConfig = {};
						if(config[i].isEditable){
							editorConfig = {
								dataType:config[i].dataType,
								dataLength:config[i].dataLength,
								precision:config[i].precision,
								multiValues:config[i].multiValues,
								customRules:config[i].customRules,
								customMessage:config[i].customMessage
							};
							col.editor = editorConfig;
						}
						if(config[i].dataType == Grid.ColumnType.SELECT){
							col.dirModule = config[i].dictTypeCode;
							if(config[i].isEditable){
								editorConfig.multiList = DictInfo.getList(col.dirModule);
							}
							col.render = function(record){
								try{
									_dirModule = DictInfo.getVar(this.options.dirModule);
									if(_dirModule){
										return _dirModule[record[this.options.key]];
									}else{
										return record[this.options.key];
									}
								}catch(e){
									that.log('数据字典没有定义<<<<'+dirModule);
									return record[this.options.key];
								}
							}
						}else if(config[i].dataType == Grid.ColumnType.BOOLEAN){
						    col.render = function(record){
						        return record[this.options.key]?that.getLang("MSG_YES"):that.getLang("MSG_NO");
						    }
						}else if(config[i].dataType == Grid.ColumnType.PERCENT){
						    col.render = function(record){
						        return V.Util.Float.mul(record[this.options.key],100)+'%';
						    }
						}else if(config[i].dataType == Grid.ColumnType.PRICE){
							var precision = config[i].precision;
							col.render = function(record){
								var val = record[this.options.key];
								if(val === null || val === undefined || val === ""){
									return "";
								}
								var fraction_part = (val+"").split('.')[1];
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
						}else if(config[i].precision){ 
							col.precision = config[i].precision;
							col.render = function(record){
								var val = record[this.options.key];
								if(val === null || val === "" || val === undefined){
									return "";
								}
								var val = parseFloat(val);
								return val.toFixed(this.options.precision);
							}
						}
						$.each(_cols,function(index){
							if(this.key == col.key){
								$.extend(col,this);
								_cols.splice(index,1);
								return false;
							}
						})
						columns.unshift(col);
					}
					//columns = columns.concat(_cols);
					if(that.actionColumn){
						columns.unshift(that.actionColumn);
					}
					that.options.columns = columns;
					Grid.superclass.init.call(that,that.options);
					that.url = d.data.url;
				}
			})
        }
		Grid.prototype.setActionColumn = function(col){
			 //this.options.columns.push(col);
			this.actionColumn = col;
		};
		Grid.prototype.viewRelativeDocket = function(record,relativeDocket){
			var entity = record;
			var plugin = relativeDocket.relativePlugin;
			var docketType = relativeDocket.relativeDocketType;
			var docketCode = entity[relativeDocket.relativeField];
			var module = relativeDocket.relativeModule;
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
					module : module,
					variables:{docketType:docketType},
					docketCode : docketCode
				});
			});
		}
	})(V.Classes['v.ui.DynamicGrid'])
},{plugins:["v.ui.grid","v.component.form"]});
