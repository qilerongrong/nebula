;V.registPlugin("v.module.taskManage.createTask",function() {
	V.Classes.create({
				className : "v.module.taskManage.CreateTask",
				superClass : "v.Plugin",
				init : function() {
					this.partner = {};
					this.ns = 'v.module.taskManage.createTask';
					this.module = '';
				}
			});
	(function(CreateTask) {
		CreateTask.prototype.init = function(options) {
			var that = this;
			/** Dialog* */
			var html = $('<div><div class="brand"></div></div>');
			var addDlg = new V.Classes['v.ui.Dialog']();
			var form = new V.Classes['v.component.Form']();
			addDlg.setBtnsBar({
				btns : [{
					text : "确定",
					style : "btn-primary",
					handler : function(){
						if(!that.validate(addDlg.template)){
							return;
						}
						var tigger = {};
						tigger['triggerName'] = $("input[name=triggerName]").val();
						tigger['jobName'] = $("input[name=jobName]").val();
						tigger['config'] = $("textarea[name=config]").val();
						var startTime = $("input[name=startTime]").val();
						tigger['startTime'] = startTime;
						var endTime = $("input[name=endTime]").val();
						tigger['endTime'] = endTime;
						tigger['triggerType'] = $("input[name=triggerType]:checked").val();
						var cron = $("input[name=cron]").val();
						var repeatInterval = $("input[name=repeatInterval]").val()||0;
						var repeatCount = $("input[name=repeatCount]").val()||0;
						var hour = $("select[name=hour]").val();
						var minute = $("select[name=minute]").val();
						var second = $("select[name=second]").val();
						var clType = $("input[name=clType]:checked").val();
						var monthday = $("select[name=monthday]").val();
						var month = $("select[name=month]").val();
						var day = $("select[name=day]").val();
						  $.ajax({
							url:"quartzJson/Jquartz!save.action",
			               	type:'POST',
							data:JSON.stringify({entity:tigger,cron:cron,repeatInterval:repeatInterval,repeatCount:repeatCount,hour:hour,minute:minute,second:second,clType:clType,monthday:monthday,month:month,day:day}),
							contentType:'application/json',
			                success:function(data){
			                	if(data=="success"){
			                		 V.alert("保存成功!");
									 addDlg.close();
									 that.forward("v.module.taskManage.taskManageList",that.options);
			                	}else if (data == "error_class") {
									V.alert("对象名/类名无效!");
								}else if (data == "error_cron") {
									V.alert("非法的时间表达式!");
								}else {
									V.alert("保存失败!");
								}
			                }
					     });
					}
				},{
					text : "取消",
					handler : function(){
						that.forward("v.module.taskManage.taskManageList",that.options);
						addDlg.close();
					}
				}]
			});
			addDlg.init({
				title : '增加新任务',
				height : 450,
				width : 740
			});
			
			var form = new V.Classes["v.component.Form"]();
			var that = this;
			this.module = options.module;
			this.container = options.container;
			var that = this;
			$.ajax({
				url:this.getPath()+"/assets/template.html",
				dataType:'html',
				success:function(dom){
						var d = $(dom);
						$('.datepicker',d).datepicker({dateFormat: "yy-mm-dd",showMonthAfterYear:true});
						that.initQuartzEvent(d);
						addDlg.setContent(d);
					}
				});
		}
		 CreateTask.prototype.initQuartzEvent = function(d){
			var that = this;
			$("input[name=triggerType]",d).click(function(){
				var value = $(this).val();
				if (value == "2") {
					$(".cron", d).show();
					$(".fixed", d).hide();
					$(".week", d).hide();
					$(".week1", d).hide();
					$(".week2", d).hide();
					$(".week3", d).hide();
				}
				else 
					if (value == '1') {
						$(".cron", d).hide();
						$(".fixed", d).show();
						$(".week", d).hide();
						$(".week1", d).hide();
						$(".week2", d).hide();
						$(".week3", d).hide();
					}
					else 
						if (value == '0') {
							$(".cron", d).hide();
							$(".fixed", d).hide();
							$(".week", d).show();
							that.setValue($("input[name=clType]:checked", d).val(), d);
						}
						else 
							if (value == '-1'){
								$(".cron", d).hide();
								$(".fixed", d).hide();
								$(".week", d).hide();
								$(".week1", d).hide();
								$(".week2", d).hide();
								$(".week3", d).hide();
							}
			});
			$("input[name=clType]",d).click(function(){
				var value = $(this).val();
				that.setValue(value,d);
			});
		}
		CreateTask.prototype.setValue = function(value,d){
			if(value == "1"){
				$(".week1",d).hide();
				$(".week2",d).hide();
				$(".week3",d).hide();
			}else if(value == '2'){
				$(".week1",d).show();
				$(".week2",d).hide();
				$(".week3",d).hide();
			}else if(value == '3'){
				$(".week1",d).hide();
				$(".week2",d).show();
				$(".week3",d).hide();
			}else if(value == '4'){
				$(".week1",d).hide();
				$(".week2",d).hide();
				$(".week3",d).show();
			}
		}
		CreateTask.prototype.validate = function(template){
			var isValid = true;
			$('*[data-validator]',template).each(function(){
				var required = $(this).attr('data-required')||false;
				var rules = $(this).attr('data-validator')||'';
				var v = $(this).val();
				if(required=="true"&&v==""){
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
	})(V.Classes['v.module.taskManage.CreateTask']);
}, {
	plugins : [ 'v.component.searchList', "v.ui.grid",
			'v.ui.confirm', 'v.ui.alert', "v.ui.dialog" ]
});