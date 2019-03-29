;V.registPlugin("v.views.home.approveManage.approveDetail",function(){
	V.Classes.create({
		className:"v.views.home.approveManage.ApproveDetail",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.home.approveManage.approveDetail";
			this.docket = null;
			
			this.ACTION = {
				TASK :  'work-flow!getStatusOfPreviousTasks.action',
				HEADER :  'work-flow!getTaskModule.action',
				APPROVE : 'work-flow!workFlowTaskHandler.action'
			}
			
			this.code = "";
			this.module = "";
			this.form = "";
			
			this.options = {
				title:'审批任务',
				taskTitle:'审批历史信息',
				headerTitle:'审批操作信息',
				detailTitle:'审批详细信息'
			}
			this.template = $('<div class="docket">\
				    <div class="header">\
				    	<div class="legend">\
				    		<span class="docket_title"></span>\
				    			<div class="actions"></div>\
				    	</div>\
				    </div><div class="con">\
				    	<div class="title task_title">\
			    			<i class="icon-chevron-down"></i><span></span>\
			    		</div>\
			    		<div class="task_info"></div>\
			    		<div class="title header_title">\
			    			<i class="icon-chevron-down"></i><span></span>\
			    		</div>\
			    		<div class="header_info"><div class="header_info_action"></div><div class="header_info_define"></div></div>\
			    		<div class="title detail_title title_style">\
			    			<i class="icon-chevron-down"></i><span></span>\
			    		</div>\
			    		<div class="detail_info detail_style"></div>\
			    	</div>\
			    </div>');
		}
	});
	(function(approveDetail){
		approveDetail.prototype.init = function(options){
			//this.module = options.module;
			this.module = 'backoffice/systemsetting/workflow';
			this.container = options.container;
			for(prop in options){
			    this.options[prop] = options[prop];
			}
			
			this.addCrumb();
			
			var that = this;
			$('.docket_title',this.template).text(this.options.title);
			$('.task_title span',this.template).text(this.options.taskTitle);
			$('.header_title span',this.template).text(this.options.headerTitle);
			$('.detail_title span',this.template).text(this.options.detailTitle);
			
			this.initTaskInfo();
			this.initDocketHeader();
			this.container.append(this.template);
			this.initEvent();
			
			var actions = $('<div><button class="approve btn btn-success btn-mini saveInsertItems"><i class="icon-check icon-white"></i> 审批</button>\
								<button class="accept btn btn-success btn-mini"><i class="icon-ok icon-white"></i>认领任务</button>\
								<button class="noAccept btn btn-danger btn-mini"><i class="icon-remove icon-white"></i>取消</button></div>');
			$('.actions',this.template).append(actions);
			$('.approve',this.template).click(function(){that.approveAction()});
			$('.accept',this.template).click(function(){that.acceptAction()});
			$('.noAccept',this.template).click(function(){that.noAcceptAction()});
				
			if(this.options.type==1){
				$('.approve',this.template).show();
				$('.accept',this.template).hide();
				//$('.noAccept',this.template).hide();
				$('.header_info_define',this.template).show();
			}else{
				$('.approve',this.template).hide();
				$('.accept',this.template).show();
				//$('.noAccept',this.template).show();
				$('.header_info_define',this.template).hide();
			}
		}
		approveDetail.prototype.initEvent = function(){
			var that = this;
			$('.title i',this.template).click(function(){
				if($(this).hasClass('icon-chevron-down')){
					$(this).removeClass('icon-chevron-down').addClass('icon-chevron-right');
					$(this).parent().next().slideUp();
				}else{
					$(this).removeClass('icon-chevron-right').addClass('icon-chevron-down');
					$(this).parent().next().slideDown();
				}
			});
			
			$('.detail_title i',this.template).click(function(){
			    that.subscribe(that,'pluginDataLoaded',function(data){
			        that.initDetailPlugin(data);
			    });
			});
			$('.detail_title i',this.template).click();
		}
		approveDetail.prototype.initDocketHeader = function(){
			var that = this;
			
			$.ajax({
				url:this.module+"/" +this.ACTION.HEADER,
				data:{taskId:this.options.taskId,taskType:this.options.type},
				dataType:'json',
				success:function(data){
					var header = data.entityData;
					
					that.publish({eventId:'pluginDataLoaded',data:header});
					
					var custom = header.custom||'';
					var dataRes = header.data||'';
					
					var task = that.task = data.task||'';
					var taskCandidateUser = task.assignees||'';
					var taskName = task.name||'';
					var taskDesc = task.desc||'';
					var form = task.form||'';
					var fields = form.fields||'';
					
					//领取任务候选人处理数据
					var taskCandidateUserDom = '';
					for(var i=0; i<taskCandidateUser.length; i++){
						taskCandidateUserDom += taskCandidateUser[i].name;
						if(i!=taskCandidateUser.length-1){
							taskCandidateUserDom += '\r\n';	
						} 
					};
					//taskCandidateUserDom = taskCandidateUserDom.html();
					
					var formAction = that.formAction = new V.Classes['v.component.Form']();
					var formDefine = that.formDefine = new V.Classes['v.component.Form']();
					var formDetail = that.formDetail = new V.Classes['v.component.Form']();
					
					formDefine.name = fields.name||'';
					formDefine.desc = fields.desc||'';
					
					var itemsAction = [];
					var itemsDefine = [];
					var itemsDetail = [];
					
					var Form = V.Classes['v.component.Form'];
					itemsAction.push({label:'模块类型',type:Form.TYPE.HIDDEN,name:'entityType',value:data.entityType});
					itemsAction.push({label:'任务标识',type:Form.TYPE.HIDDEN,name:'taskId',value:data.taskId});
					itemsAction.push({label:'任务摘要',type:Form.TYPE.READONLY,name:'entityTitle',value:data.entityTitle});
					itemsAction.push({label:'任务候选人',type:Form.TYPE.TEXTAREA,name:'taskCandidateUser',value:''});
					itemsAction.push({label:'任务名称',type:Form.TYPE.READONLY,name:'taskName',value:taskName});
					itemsAction.push({label:'任务描述',type:Form.TYPE.READONLY,name:'taskDesc',value:taskDesc});
					//itemsAction.push({label:'审批结果',type:Form.TYPE.SELECT,name:'result',multiList:[['同意','1'],['不同意','-1']]});
					//itemsAction.push({label:'审批意见',type:Form.TYPE.TEXTAREA,name:'approveComments',value:'同意',required:'true',dataLength:1024,validator:Form.generateValidator(Form.TYPE.TEXTAREA,1024,0)});
					
					//处理form信息
					var fieldsType = {
						'text': V.Classes['v.component.Form'].TYPE.TEXT,
						'number': V.Classes['v.component.Form'].TYPE.NUMBER,
						'date': V.Classes['v.component.Form'].TYPE.DATE,
						'enum': V.Classes['v.component.Form'].TYPE.SELECT
					}
					$.each(fields,function(){
						var value = this.values||'';
						var multiList = [];
						var type = 'text';
						//values = [{name:111},{value:222},{addr:333}];
						if(this.type=='enum'){
							$.each(value,function(){
								for(keyTemp in this){
									var key = keyTemp;
									var value = this[key];
									multiList.push([key,value]);
								}
							});
						}
						type = fieldsType[this.type];
						if(this.name=='审批意见'){
							type = V.Classes['v.component.Form'].TYPE.TEXTAREA;
						}
						var item = {
							name:this.name
							,label:this.name
							,value:''
							,type:type
							,required:this.required
							,multiList:multiList
							,defaultValue:this.value
							,validator:Form.generateValidator(fieldsType[this.type],0,0)
						};
						itemsDefine.push(item);
					})
					
					$.each(custom,function(){
						var isShow = this.isShow;
						if(isShow){
							var item = {
								name:this.fieldName,
								key:this.fieldName
								,label:this.fieldLabel
								,value:dataRes[this.fieldName]||''
								,type:V.Classes['v.component.Form'].TYPE.READONLY
							};
							itemsDetail.push(item);
						}
					})
					
					formAction.init({
						container : $('.header_info_action',this.template),
						items : itemsAction
					});
					
					formDefine.init({
						container : $('.header_info_define',this.template),
						items : itemsDefine
					});
					/*
					formDetail.init({
						container : $('.detail_info',this.template),
						items : itemsDetail
					});
					*/
					// var options = {
					    // ns:'v.views.trade.tradeManage.purchaseOrder',
					    // code:'20121221888888999900',
					    // module:''
					// }
					//that.initDetailPlugin(header);
					
					$('select[name="审批结果"]').change(function(){
						var res = $(this).val();
						if(res==='1')
							$('textarea[name="审批意见"]',formDefine.template).val('同意');
						else
							$('textarea[name="审批意见"]',formDefine.template).val('不同意');	
					});
					
					$('TEXTAREA[name=taskCandidateUser]',this.template).val(taskCandidateUserDom);
					$('TEXTAREA[name=taskCandidateUser]',this.template).attr('readOnly',true);
					$('TEXTAREA[name=taskCandidateUser]',this.template).height(taskCandidateUser.length==0?20:taskCandidateUser.length*20);
				}
			})
		}
		approveDetail.prototype.approveAction = function(){
			var that = this;
			//var taskId = $('input[name="taskId"]').val();
			var taskId = this.options.taskId;
			var result = $('select[name="审批结果"]',that.formDefine.template).val();
			var approveComments = $('textarea[name="审批意见"]',that.formDefine.template).val();
			
			var that = this;
			if(that.formDefine.validate()){//整单验证
			V.confirm("确认审批任务?",function ok(e){
				var url = 'backoffice/systemsetting/workflow/work-flow!workFlowTaskHandler.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
					data:{form:that.formDefine.getValues(),taskId:taskId,result:result,approveComments:approveComments},
	                success:function(data){
	                	if(data.result == 'success'){
	                		V.alert("审批任务操作成功!");
	                		that.forward('v.views.home.approveManage.approveTask',that.options);
	                	}else{
	                		V.alert(data);
	                	}
	                }
	            })
			});
			}
		}
		approveDetail.prototype.acceptAction = function(){
			var taskId = this.options.taskId;
			
			var that = this;
			//if(that.formDefine.validate()){//整单验证
			V.confirm("确认认领任务?",function ok(e){
				var url = 'backoffice/systemsetting/workflow/work-flow!assigneeTask.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
					data:{taskId:taskId},
	                success:function(data){
	                	if(data.result == 'success'){
	                		V.alert("认领任务操作成功!");
	                		//that.forward('v.component.approveManage.approveTask',that.options);
	                		$('.approve',this.template).show();
							$('.accept',this.template).hide();
							$('.header_info_define',this.template).show();
							//$('.noAccept',this.template).hide();
							
							//$('.header_title',this.template).show();
							//$('.header_info',this.template).show();
							//$('select[name=result]',that.template).parent().parent().parent().show();
	                	}else{
	                		V.alert("该任务已被别人认领!");
	                	}
	                }
	            })
			});
			//}
		}
		//获取审批任务历史信息内容
		approveDetail.prototype.initTaskInfo = function(){
			var that = this;
			
			$.ajax({
				url:this.module+"/" +this.ACTION.TASK,
				data:{taskId:this.options.taskId},
				dataType:'json',
				success:function(data){
					var Form = V.Classes['v.component.Form'];
					
					$.each(data,function(){
						var formTask = that.formTask = new V.Classes['v.component.Form']();
						
						var name = this.name||'';
						var description = this.description||'';
						var form = this.props||'';
						
						var itemsTask = [];
						
						itemsTask.push({label:'任务名称',type:Form.TYPE.READONLY,name:'taskName',value:name});
						itemsTask.push({label:'任务描述',type:Form.TYPE.READONLY,name:'taskDesc',value:description});
						
						for(key in form){
							var name = key;
							var value = form[key];
							var item = {
								name:name
								,label:name
								,value:value
								,type:Form.TYPE.READONLY
								,multiList:[]
								,defaultValue:value
							};
							itemsTask.push(item);
						}
						
						itemsTask.push({label:'',type:Form.TYPE.READONLY,name:'',value:''});
						itemsTask.push({label:'',type:Form.TYPE.READONLY,name:'',value:''});
						
						formTask.init({
							container : $('.task_info',this.template),
							items : itemsTask
						});
					})
				}
			})
		}
		approveDetail.prototype.noAcceptAction = function(){
			this.forward('v.views.home.approveManage.approveTask',this.options);
		}
		approveDetail.prototype.initDetailPlugin = function(options){
		    var ns = options.ns;
		    var code = options.code;
		    var container = $('.detail_info',this.template);
		    
		    var codeList = [];
            codeList.push(code);
            options.codeList = codeList;
            var index = 0;
            options.codeIndex = index;
            
            V.loadPlugin(ns,function(){
                var glass = V._registedPlugins[ns].glass;
                var inst = new V.Classes[glass]()
                var opt = options||{};
                opt.container = container;
                inst.init(opt);
            })
        }
		approveDetail.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'审批任务详情'}});
		}
	})(V.Classes['v.views.home.approveManage.ApproveDetail']);
},{plugins:["v.component.form"]})