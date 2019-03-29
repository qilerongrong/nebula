;V.registPlugin("v.component.areaOld",function(){
    V.Classes.create({
        className:"v.component.AreaOld",
		superClass:"v.Plugin",
        init:function(){
            this.ns = 'v.component.areaOld';
			this.curArea = '';
			//初始化区域需要curLevel和curCode
			this.options = {
				//默认3级
				level : 3,
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
			var level1 = $("<select class='sel_level1 input-medium'><option value='-1'>请选择</option></select>");
			var level2 = $("<select class='sel_level2 input-medium'></select>");
			var level3 = $("<select class='sel_level3 input-medium'></select>");
			this.template.append(level1).append(level2).append(level3);
			this.container.append(this.template);
			this.initEvent();
			this.getProvinces();
		};
		Area.prototype.initEvent = function(){
			var that = this;
			$('.sel_level1',this.template).change(function(){
				var code = this.value;
				that.getCities(code);
				that.getCounties(-1);
			});
			$('.sel_level2',this.template).change(function(){
				var code = this.value;
				that.getCounties(code);
			})
		};
		Area.prototype.getProvinces = function(){
			var that = this;
			$.ajax({
					url:'common!province.action',
					async:false,
					success:function(provinces){
						$.each(provinces,function(){
							var flag = true;
							var id = this.id;
							$('.sel_level1 option',that.template).each(function(i){
								 if(id == $(this).val()){
									 flag = false;
									 return;
								 }
							})
							var option = "<option value='"+this.id+"' name='"+this.name+"'>"+this.name+"</option>";
							if(flag){$('.sel_level1',that.template).append(option);}
						});
					}
				})
		};
		Area.prototype.getCities = function(id,value){
			$('.sel_level2',this.template).empty().append("<option value='-1'>请选择</option>");
			if(id != -1){
				var that = this;
				$.ajax({
					url:'common!city.action',
					data:{parentId:id},
					success:function(cities){
						$.each(cities,function(){
							var option = "<option value='"+this.id+"' name='"+this.name+"'>"+this.name+"</option>";
							$('.sel_level2',that.template).append(option);
						});
						$('.sel_level2',that.template).val(value);
					}
				})
			}
		};
		Area.prototype.getCounties = function(id,value){
			$('.sel_level3',this.template).empty().append("<option value='-1'>请选择</option>");
			if(id != -1){
				var that = this;
				$.ajax({
					url:'common!county.action',
					data:{parentId:id},
					success:function(counties){
						$.each(counties,function(){
							var option = "<option value='"+this.id+"' name='"+this.name+"'>"+this.name+"</option>";
							$('.sel_level3',that.template).append(option);
						});
						$('.sel_level3',that.template).val(value);
					}
				})
			}
		}
		Area.prototype.initValue = function(L1value,L2value,L3value){
			$('.sel_level1',this.template).val(L1value);
			this.getCities(L1value,L2value);
			this.getCounties(L2value,L3value);
		}
		Area.prototype.getArrayValue = function(){
			var value = [];
			var optProvince = $('.sel_level1:selected',this.template);
			var optCity = $('.sel_level2:selected',this.template);
			var optCounty = $('.sel_level3:selected',this.template);
			value.push({value:optProvince.attr('value'),name:optProvince.attr('name')});
			value.push({value:optCity.attr('value'),name:optProvince.attr('name')});
			value.push({value:optCounty.attr('value'),name:optProvince.attr('name')});
			return value;
		}
    })(V.Classes['v.component.AreaOld']);
});