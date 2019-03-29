;V.registPlugin("v.views.backoffice.custom.orderRules",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.OrderRules",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.views.backoffice.custom.orderRules';
			this.ticket = null;
			this.dirtyTicket = {};
			this.maxSortNo = 0;
			this.module='';
			this.resource = {
				html:'template.html'
			}
		}
	});
	(function(OrderRules){
		OrderRules.prototype.init = function(options){
			this.container = options.container;
			this.module = options.module;
			this.platformNo = options.platformNo||'';
			this.party = options.party||'';
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					that.initOrderRulesInfo();
					that.initEvent();
				}
		     });
		}
		OrderRules.prototype.initEvent = function(){
			var that = this;
			
			if(this.party){
				$('.partyName',this.template).html('企业名称：'+this.party.partyName)
			}
			
			//时间控件
			$('.datepicker',this.template).datepicker({dateFormat: "yy-mm-dd",showMonthAfterYear:true});
			
			/**设置验证**/
			$('*[data-validator]',this.template).keyup(function(e){
				/*
				var v = this.value;
				var rules = $(this).attr('data-validator');
				var required = $(this).attr('data-required')||false;
				;
				if(required&&v==""){
					$(this).parent().find('.error_msg').text("该值不可为空").show();
					return false;
				}
				var msg = Validator.validate(rules,v);
				if(msg){
					$(this).parent().find('.error_msg').text(msg).show();
				}else{
					$(this).parent().find('.error_msg').empty().hide();
				}
				*/
				var e = e||event;
				var keycode = e.which||e.keyCode;
				this.value=this.value.replace(/\D/g,'');
			})
			
			//移动
			$('ol .icon-arrow-left',this.template[0]).live('click',function(){
				var item = $(this).parents('li');
				var ol = item.parent('ol');
				var item_index = item.index();
				var sortno1 = item.data('data-info').sortno;
				var prev = item.prev();
				var prev_index = prev.index();
				if(prev_index == 0){
					$('.icon-arrow-left',prev).parent().css('visibility','visible');
					$('.icon-arrow-left',item).parent().css('visibility','hidden');
				}
				if(item_index == $('li',ol).length-1){
					$('.icon-arrow-right',item).parent().css('visibility','visible');
					$('.icon-arrow-right',prev).parent().css('visibility','hidden');
				}
				var sortno2 = prev.data('data-info').sortno;
				item.data('data-info').sortno = sortno2;
				prev.data('data-info').sortno = sortno1;
				item.insertBefore(prev);
			});
			$('ol .icon-arrow-right',this.template[0]).live('click',function(){
				var item = $(this).parents('li');
				var ol = item.parent('ol');
				var item_index =  item.index();
				var sortno1 = item.data('data-info').sortno;
				var next = item.next();
				var next_index = next.index();
				if(next_index == $('li',ol).length-1){
					$('.icon-arrow-right',next).parent().css('visibility','visible');
					$('.icon-arrow-right',item).parent().css('visibility','hidden');
				}
				if(item_index == 0){
					$('.icon-arrow-left',item).parent().css('visibility','visible');
					$('.icon-arrow-left',next).parent().css('visibility','hidden');
				}
				var sortno2 = next.data('data-info').sortno;
				item.data('data-info').sortno = sortno2;
				next.data('data-info').sortno = sortno1;
				item.insertAfter(next);
			});
			
			//reset
			$('.reset',this.template).click(function(){
				that.reset();
			})
			$('.save',this.template).click(function(){
				that.save();
			})
			
			//
			$('.toggle',this.template).toggle(function(){
				$('i',this).removeClass('icon-chevron-up').addClass('icon-chevron-down').attr('title','展开');
				$(this).parent().next().hide();
			},function(){
				$('i',this).removeClass('icon-chevron-down').addClass('icon-chevron-up').attr('title','收起');
				$(this).parent().next().show();
			})
			
		};
		
		OrderRules.prototype.initOrderRulesInfo = function(options){
		   var that = this;
           $.ajax({
				url:this.module+"/order-rules!queryOrderRules.action",
				data:{platformNo:this.platformNo},
				dataType:'json',
				success:function(dom){
					 var orderRules = dom.orderRuls;	
					 var jsonMap = orderRules.jsonMap;			
					 if (typeof(orderRules) != 'undefined') {
					 	that.orderRules = orderRules;
					 	$('input[data-key]', that.template).each(function(){
					 		
					 		if($(this).attr('type') == "checkbox"){
								var name = $(this).attr('name');
								if(jsonMap[name]== '1'){
								    $(this).attr('checked',true);//复选框选中
						    	}else{
						    		$(this).attr('checked'); //复选框未选中
						    	}
							}else if($(this).attr('type') == "radio"){//根据数据设置radio框
								var name = $(this).attr('name');
								if(jsonMap[name]== $(this).val()){
								  $(this).attr('checked',true);
							    }
							}else if($(this).attr('type') == "text"){
									var name = $(this).attr('name');
							    	$(this).val(jsonMap[name]);
							}else{
								//目前不需要做任何事
							}
					 		
					 	});
					 }

				}
			})
        };
		OrderRules.prototype.save = function(){
			var that = this;
			var orderRules = this.orderRules;
		    var jsonMap={};//定义一个对象变量
			$('input[data-key]',this.template).each(function(){//遍历界面，组装对象orderRules
				if($(this).attr('type') == "checkbox"){
					var name = $(this).attr('name');
					if(jsonMap[name]== undefined){
						var val = '';
					    $('input[name='+name+']:checked',that.template).each(function(){
					    	if(val){
					    		val += ','+$(this).val();
					    	}else{
					    		val += $(this).val();
					    	}
					    });
					    jsonMap[name] = val;
				    }
				}else if($(this).attr('type') == "radio"){
					var name = $(this).attr('name');
					if(jsonMap[name]== undefined){
					    jsonMap[name] = $('input[name='+$(this).attr('name')+']:checked',that.template).val();
				    }
				}else{
					jsonMap[$(this).attr('name')] = $(this).val();
				}
				//日期格式，设置null 有待改进，先设置为空
				//orderRules['poOrderCloseDate'] = null; 
				//orderRules['rpoOrderCloseDate'] = null; 
		
	  		});  
	  		//orderRules.jsonMap = jsonMap;
			//if(this.validate()){//整单验证
		    	$.ajax({
					url:this.module+'/order-rules!saveOrUpdateOrderRules.action',
					type:'post',
					contentType:'application/json',
					data:JSON.stringify({orderRuls:orderRules,jsonMap:jsonMap}),
					success:function(data){
						if(data == 'success'){
		                     	V.alert("采销规则定制保存成功！");
		                     }else{
		                     	V.alert(data);
		                     }
				
					}
				})
		    //}
			
		}
		OrderRules.prototype.reset = function(){
			//this.initTicketInfo();
			$.each($('.form-inline',this.template),function(){
				this.reset();
			});
		};
		OrderRules.prototype.validate = function(){
			var isValid = true;
			$('*[data-validator]',this.template).each(function(){
				var required = $(this).attr('data-required')||false;
				var rules = $(this).attr('data-validator')||'';
				var v = $(this).val();
				if(required&&v==""){
						$(this).parent().find('.error_msg').text($(this).attr('data-value')+"值不可为空").show();
						isValid = false;
						return false;
				}else{
					$(this).parent().find('.error_msg').empty().hide();
				}
				/*
				if(rules){
					var msg = Validator.validate(rules,v);
					if(msg){
						$(this).parent().find('.error_msg').text(msg).show();
						isValid = false;
					}else{
						$(this).parent().find('.error_msg').empty().hide();
					}
				}
				*/
			});
			return isValid;
		}
		OrderRules.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'采销规则定制'}});
		}
	})(V.Classes['v.views.backoffice.custom.OrderRules']);
},{plugins:['v.ui.dialog',"v.fn.validator",'v.ui.alert']})
