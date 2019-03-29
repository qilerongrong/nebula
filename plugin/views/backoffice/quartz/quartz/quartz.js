;V.registPlugin("v.views.backoffice.custom.quartz",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.Quartz",
		superClass:"v.Plugin",
		init: function(){
			this.tasksList = null;
			this.module='';
			this.ns = "v.views.backoffice.custom.quartz";
			this.quartzData = {workfllowName:'',descriptions:'',jsonDataMap:{name:'',desc:'',tasks:[{name:'',assignees:[],desc:'',startWithPrevious:'serial',form:{}}]},moduleType:''}; 
			this.template = $('<div class="quartz">\
			    <input type="hidden" name="id" /><input type="hidden" name="name">\<input type="hidden" name="isDeployed">\
			    <div class="row-fluid">\
				    <label class="span1"><span style="color:red">*</span>任务名称：</label><div class="span5"><input type="text" class="span12 model-triggerName" required="required"/><p class="error_msg"></p></div>\
					<label class="span1"><span style="color:red">*</span>任务分组：</label><div class="span5"><input type="text" class="span12 model-triggerGroup" required="required"/><p class="error_msg"></p></div>\
				</div>\
				<div class="row-fluid">\
				    <label class="span1"><span style="color:red">*</span>开始时间：</label><div class="span5"><input type="text" class="span12 model-startTime" required="required"/><p class="error_msg"></p></div>\
					<label class="span1"><span style="color:red">*</span>结束时间：</label><div class="span5"><input type="text" class="span12 model-endTime" required="required"/><p class="error_msg"></p></div>\
				</div>\
				<div class="row-fluid">\
				    <label class="span1"><span style="color:red">*</span>重复次数：</label><div class="span5"><input type="text" class="span12 model-repeatCount" required="required"/><p class="error_msg"></p></div>\
					<label class="span1"><span style="color:red">*</span>间隔时间：</label><div class="span5"><input type="text" class="span12 model-repeatInterval" required="required"/><p class="error_msg"></p></div>\
				</div>\
				<div class="row-fluid">\
				    <label class="span1"></label><div class="span11"><button class="btn btn-primary flow-save"><i class="icon-white icon-check"></i>保存</button></div>\
				</div>\
			</div>');
			this.EVENT = {
				UPDATE_ASSIGNEE : 'update_assignee'
			}
		}
	});
	(function(Quartz){
		Quartz.prototype.init = function(options){
			this.container = options.container;
			this.module = options.module;
			if(options.quartzData){
				this.quartzData = options.quartzData;
			}
			this.container.append(this.template);
			//this.initQuartzData();
			this.initEvent();
			this.addCrumb();
		};
		Quartz.prototype.initEvent = function(){
			    var that = this;
		    	$('.flow-save',this.template).click(function(){
					that.save();
				});
				$('.flow-view',this.template).click(function(){
					that.showFlowImage();
				})
		};
		Quartz.prototype.initQuartzData = function(){
			var data = this.quartzData;
			$('.flow-name',this.template).val(data.quartzName);
			$('input[name=id]',this.template).val(data.id);
			$('input[name=name]',this.template).val(data.name);
			$('input[name=isDeployed]',this.template).val(data.isDeploy);
			$('.flow-desc',this.template).text(data.descriptions);
			this.initFlowType();
			this.initTasks();
		}
		Quartz.prototype.initFlowType = function(){
			var that = this;
			var data = this.quartzData;
			$.ajax({
				url:this.module+'/work-flow!getModuleTypeData.action',
				success:function(types){
					$.each(types,function(){
						var option = "<option value='"+this.moduleTypeCode+"'>"+this.moduleTypeName+"</option>";
						$('.flow-type',that.template).append(option);
					});
					$('.flow-type',that.template).val(data.moduleType);
				}
			})
		}
		Quartz.prototype.save = function(){
			var that = this;
			
			var flag = true;
			flag = that.validateCommit(this.template);
			
			$('span[required=required]',this.template).each(function(){
				if($(this).find('p').length==0){
					$(this).next().empty().append('指派用户不能为空，请指派！').show();
					flag = false;
					return false;
				}
				else{
					$(this).next().empty().hide();
				}
			});
			if(flag){
				var model = {};
				//任务名称
				model.triggerName = $('.model-triggerName',this.template).val();
				//任务分组
				model.triggerGroup = $('.model-triggerGroup',this.template).val();
				//开始时间
				model.startTime = $('.model-startTime',this.template).val();
				//结束时间
				model.endTime = $('.model-endTime',this.template).val();
				//重复次数
				model.repeatCount = $('.model-repeatCount',this.template).val();
				//间隔时间
				model.repeatInterval = $('.model-repeatInterval',this.template).val();
			 	V.ajax({
				 	url:this.module+'/quartz!save.action',
					data:{flow:flow},
					success:function(){
						var options = {};
						options.module = that.module;
						that.forward('v.views.backoffice.custom.quartzList',options);
					}
				})
			 }
		};
		Quartz.prototype.validateCommit = function(context){
			var validateFlag = true;
			$('*[data-validator]:visible',context).each(function(){
				var required = $(this).attr('data-required')||false;
				var rules = $(this).attr('data-validator')||'';
				var v = $(this).val();
				if(required=="true"&&v==""){
						$(this).parent().find('.error_msg').text("该值不可为空").show();
						validateFlag = false;
				}else{
					if(rules){
						var msg = Validator.validate(rules,v);
						if(msg){
							$(this).parent().find('.error_msg').text(msg).show();
							validateFlag = false;
						}else{
							$(this).parent().find('.error_msg').empty().hide();
						}
					}else{
						$(this).parent().find('.error_msg').empty().hide();
					}
				}
			});
			return validateFlag;
		}
		Quartz.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'定时任务设置'}});
		}
	})(V.Classes['v.views.backoffice.custom.Quartz']);
},{plugins:["v.ui.grid","v.ui.pagination",'v.fn.validator']})