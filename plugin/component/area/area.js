;V.registPlugin("v.component.area",function(){
    V.Classes.create({
        className:"v.component.Area",
		superClass:"v.Plugin",
        init:function(){
            this.ns = 'v.component.area';
			this.curAreaCode = '';
			//初始化区域需要curLevel和curCode
			this.options = {
				//默认5级
				level : 5,
				curLevel:1,
				curCode : null
			}
			this.EVENT = {
				
			};
			this.template = $("<div class='area'></div>");
        }
    });
    (function(Area){
		Area.prototype.init = function(options){
			this.container = options.container;
			delete options.container;
			for(prop in options){
				this.options[prop] = options[prop];
			}
			if(this.options.config.params){
				var params = eval(this.options.config.params);
				for(prop in params){
					this.options[prop] = params[prop];
				}
			}
			//如果是readonly则调用renderValue方法渲染显示值。
			if(this.options.config.readonly){
				this.renderValue();
				return;
			}
			var level1 = $("<select style='width:100px' class='sel_level1 input-medium'><option value='-1'>"+this.getLang("TIP_PIEASE_CHOOSE")+"</option></select>");
			var level2 = $("<select style='width:100px' class='sel_level2 input-medium'></select>");
			var level3 = $("<select style='width:100px' class='sel_level3 input-medium'></select>");
			var level4 = $("<select style='width:100px' class='sel_level4 input-medium'></select>");
			var level5 = $("<select style='width:100px' class='sel_level5 input-medium'></select>");
			if(this.options.level>0){
				this.template.append(level1)
			}
			if(this.options.level>1){
				this.template.append(level2);
			}
			if(this.options.level>2){
				this.template.append(level3);
			}
			if(this.options.level>3){
				this.template.append(level4);
			}
			if(this.options.level>4){
				this.template.append(level5);
			}
			this.container.append(this.template);
			this.initEvent();
			var value = this.options.config.value;
			if(value){
				this.initValue(value);
			}else{
				this.getProvinces();
			}
		};
		Area.prototype.renderValue = function(){
			var that = this;
			var code = this.options.config.value;
			$.ajax({
				url:'common!listParentArea.action',
				data:{code:code},
				success:function(data){
					var areas = data;
					var length = areas.length;
					var province = {};
					var city = {};
					var county = {};
					var town = {};
					var village = {};
					var val = "";
					if(length>0){
						province = areas[length-1];
						val += province.name;
					}
					if(length>1){
						city = areas[length-2];
						val += city.name
					}
					if(length>2){
						county = areas[length-3];
						val += county.name
					}
					if(length>3){
						town = areas[length-4];
						val += town.name
					}
					if(length>4){
						village = areas[0];
						val += village.name
					};
				    that.container.append('<span>'+val+'</span>');
				}

			})
		}
		Area.prototype.initEvent = function(){
			var that = this;
			$('.sel_level1',this.template).change(function(){
				var code = this.value;
				var id = code;
				if(code != -1){
					id = $(':selected',this).attr('data-areaId');
					that.curAreaCode = code;
				}else{
					that.curAreaCode = "";
				}
				that.getCities(id);
				that.getCounties(-1);
				that.getTowns(-1);
				that.getVillages(-1);
			});
			$('.sel_level2',this.template).change(function(){
				var code = this.value;
				var id = code;
				if(code != -1){
					id = $(':selected',this).attr('data-areaId');
					that.curAreaCode = code;
				}else{
					that.curAreaCode = $(':selected',$(this).prev()).val();
				}
				that.getCounties(id);
				that.getTowns(-1);
				that.getVillages(-1);
			});
			$('.sel_level3',this.template).change(function(){
				var code = this.value;
				var id = code;
				if(code != -1){
					id = $(':selected',this).attr('data-areaId');
					that.curAreaCode = code;
				}else{
					that.curAreaCode = $(':selected',$(this).prev()).val();
				}
				that.getTowns(id);
				that.getVillages(-1);
			});
			$('.sel_level4',this.template).change(function(){
				var code = this.value;
				var id = code;
				if(code != -1){
					id = $(':selected',this).attr('data-areaId');
					that.curAreaCode = code;
				}else{
					that.curAreaCode = $(':selected',$(this).prev()).val();
				}
				that.getVillages(id);
			});
			$('.sel_level5',this.template).change(function(){
				var code = this.value;
				var id = code;
				if(code != -1){
					id = $(':selected',this).attr('data-areaId');
					that.curAreaCode = code;
				}else{
					that.curAreaCode = $(':selected',$(this).prev()).val();
				}
			});
		};
		Area.prototype.getProvinces = function(value){
			var that = this;
			$.ajax({
				url:'common!province.action',
				success:function(provinces){
					if(provinces)
					$.each(provinces,function(){
						var option = "<option value='"+this.areaCode+"' data-areaId='"+this.id+"'>"+this.name+"</option>";
						$('.sel_level1',that.template).append(option);
					});
					$('.sel_level1',that.template).val(value);
				}
			})
		};
		Area.prototype.getCities = function(id,value){
			$('.sel_level2',this.template).empty().append("<option value='-1'>"+this.getLang("TIP_PIEASE_CHOOSE")+"</option>");
			if(id != -1){
				var that = this;
				$.ajax({
					url:'common!city.action',
					data:{parentId:id},
					success:function(cities){
						if(cities)
						$.each(cities,function(){
							var option = "<option value='"+this.areaCode+"' data-areaId='"+this.id+"'>"+this.name+"</option>";
							$('.sel_level2',that.template).append(option);
						});
						$('.sel_level2',that.template).val(value);
					}
				})
			}
		};
		Area.prototype.getCounties = function(id,value){
			$('.sel_level3',this.template).empty().append("<option value='-1'>"+this.getLang("TIP_PIEASE_CHOOSE")+"</option>");
			if(id != -1){
				var that = this;
				$.ajax({
					url:'common!county.action',
					data:{parentId:id},
					success:function(counties){
						if(counties)
						$.each(counties,function(){
							var option = "<option value='"+this.areaCode+"' data-areaId='"+this.id+"'>"+this.name+"</option>";
							$('.sel_level3',that.template).append(option);
						});
						$('.sel_level3',that.template).val(value);
					}
				})
			}else{
				this.getTowns(-1);
			}
		}
		Area.prototype.getTowns = function(id,value){
			$('.sel_level4',this.template).empty().append("<option value='-1'>"+this.getLang("TIP_PIEASE_CHOOSE")+"</option>");
			if(id != -1){
				var that = this;
				$.ajax({
					url:'common!areaChildren.action',
					data:{parentId:id},
					success:function(counties){
						if(counties)
						$.each(counties,function(){
							var option = "<option value='"+this.areaCode+"' data-areaId='"+this.id+"'>"+this.name+"</option>";
							$('.sel_level4',that.template).append(option);
						});
						$('.sel_level4',that.template).val(value);
					}
				})
			}
		}
		Area.prototype.getVillages = function(id,value){
			$('.sel_level5',this.template).empty().append("<option value='-1'>"+this.getLang("TIP_PIEASE_CHOOSE")+"</option>");
			if(id != -1){
				var that = this;
				$.ajax({
					url:'common!areaChildren.action',
					data:{parentId:id},
					success:function(counties){
						if(counties)
						$.each(counties,function(){
							var option = "<option value='"+this.areaCode+"' data-areaId='"+this.id+"'>"+this.name+"</option>";
							$('.sel_level5',that.template).append(option);
						});
						$('.sel_level5',that.template).val(value);
					}
				})
			}
		}
		Area.prototype.initValue = function(code){
			this.curAreaCode = code;
			var that = this;
			$.ajax({
				url:'common!listParentArea.action',
				data:{code:code},
				success:function(data){
					var areas = data;
					var length = areas.length;
					var province = {};
					var city = {};
					var county = {};
					var town = {};
					var village = {};
					if(length>0){
						province = areas[length-1];
						that.getProvinces(province.areaCode);
						if(length == 1 && that.options.level>1){
						    that.getCities();
						}
					}else{
						that.getProvinces();
					}
					if(length>1){
						city = areas[length-2];
						that.getCities(province.id,city.areaCode);
						if(length == 2 && that.options.level>2){
						    that.getCounties(city.id);
						}
					}
					if(length>2){
						county = areas[length-3];
						that.getCounties(city.id,county.areaCode);
						if(length == 3 && that.options.level>3){
						    that.getTowns(county.id);
						}
					}
					if(length>3){
						town = areas[length-4];
						that.getTowns(county.id,town.areaCode);
						if(length == 4 && that.options.level>4){
						    that.getVillages(town.id);
						}
					}
					if(length>4){
						village = areas[0];
						that.getVillages(town.id,village.areaCode);
					}
				}
			})
		}
		Area.prototype.getValue = function(){
			var val = {};
			val[this.options.config.name] = this.curAreaCode;
			return val;
		}
    })(V.Classes['v.component.Area']);
});