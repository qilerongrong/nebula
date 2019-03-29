;V.registPlugin("v.views.tools.ui.dynamicGrid",function(){
	V.Classes.create({
		className:"v.views.tools.ui.DynamicGrid",
		superClass:"v.ui.Grid",
		init:function(){
			this.options.hasData = true;
			this.options.hasColumnsPicker = true;
			this.options.docketType = null;
			this.options.docketModule = null;
			this.hasDetail = false;
			this.actionColumn = null;
		}
	});
	(function(Grid){
		//SELECT:列为select类型时，从multiList取值显示在列表中，设置render方法。
		Grid.ColumnType = {
			SELECT : '4',
			BOOLEAN : '13'
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
			
			var mask = V.mask(this.options.container);
            V.ajax({
				url:url,
				data:params,
				success:function(d){
					V.unMask(mask);
					that.publish({eventId:that.EVENT.INITED,data:d});
					var config = d.columns;
					that.setData(d.data.list);
					that.hasDetail = d.data.hasDetail;
					var cols = that.options.columns;
					var _cols = [].concat(cols);
					var columns = [];
					that.options.docketType = d.data.docketType;    //picker add
					that.options.docketModule = d.data.docketModule; //picker add
					for(var i=config.length-1;i>=0;i--){
						var col = {};
						col.displayName = config[i].fieldLabel;
						col.fieldName = config[i].fieldName;    //picker add
						col.key = config[i].fieldName;
						col.isShow = config[i].isShowGrid;
						col.isBlock = config[i].isBlock;
						col.isSortable = config[i].isSortable;
						if(config[i].dataType == Grid.ColumnType.SELECT){
							col.dirModule = config[i].dictTypeCode;
							col.render = function(record){
								try{
									_dirModule = DictInfo.getVar(this.options.dirModule,this.options.platfromNo);
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
						        return record[this.options.key]?"是":"否";
						    }
						}else{
						}
						if(config[i].isEditable){
							var editorConfig = {
								dataType:config[i].dataType,
								dataLength:config[i].dataLength,
								precision:config[i].precision,
								multiValues:config[i].multiValues
							};
							col.editor = editorConfig;
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
		Grid.prototype.setRederColumns = function(){
			
		};
	})(V.Classes['v.views.tools.ui.DynamicGrid'])
},{plugins:["v.ui.grid"]});
