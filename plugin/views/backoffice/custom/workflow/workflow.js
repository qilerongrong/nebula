;V.registPlugin("v.views.backoffice.custom.workflow",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.Workflow",
		superClass:"v.Plugin",
		init: function(){
			this.tasksList = null;
			this.module='';
			this.ns = "v.views.backoffice.custom.workflow";
			this.workflowData = {workfllowName:'',descriptions:'',jsonDataMap:{name:'',desc:'',tasks:[{name:'',assignees:[],desc:'',startWithPrevious:'serial',form:{}}]},moduleType:''}; 
			this.template = $('<div class="workflow">\
			    <input type="hidden" name="id" /><input type="hidden" name="name">\<input type="hidden" name="isDeployed">\
			    <div class="row-fluid">\
				    <label class="span1"><span style="color:red">*</span>名字：</label><div class="span5"><input type="text" class="span12 flow-name" required="required"/><p class="error_msg"></p></div>\
				    <label class="span1">类型：</label><div class="span5"><select class="span12 flow-type"></select></div>\
				</div>\
				<div class="row-fluid">\
				    <label class="span1">描述：</label><div class="span11"><textarea class="span12 flow-desc"></textarea></div>\
				</div>\
				<div class="row-fluid">\
				    <label class="span1">任务：</label><div class="span11"><div class="tasks"></div></div>\
				</div>\
				<div class="row-fluid">\
				    <label class="span1"></label><div class="span11"><button class="btn btn-primary flow-save"><i class="icon-white icon-check"></i>保存</button><button class="btn btn-primary flow-view" style="margin-left:10px;"><i class="icon-white icon-picture"></i>查看流程图</button></div>\
				</div>\
			</div>');
			this.EVENT = {
				UPDATE_ASSIGNEE : 'update_assignee'
			}
		}
	});
	(function(Workflow){
		Workflow.prototype.init = function(options){
			this.container = options.container;
			this.module = options.module;
			if(options.workflowData){
				this.workflowData = options.workflowData;
			}
			this.container.append(this.template);
			this.initWorkflowData();
			this.initEvent();
			this.addCrumb();
		};
		Workflow.prototype.initEvent = function(){
			    var that = this;
		    	$('.flow-save',this.template).click(function(){
					that.save();
				});
				$('.flow-view',this.template).click(function(){
					that.showFlowImage();
				})
		};
		Workflow.prototype.initWorkflowData = function(){
			var data = this.workflowData;
			$('.flow-name',this.template).val(data.workflowName);
			$('input[name=id]',this.template).val(data.id);
			$('input[name=name]',this.template).val(data.name);
			$('input[name=isDeployed]',this.template).val(data.isDeploy);
			$('.flow-desc',this.template).text(data.descriptions);
			this.initFlowType();
			this.initTasks();
		}
		Workflow.prototype.initFlowType = function(){
			var that = this;
			var data = this.workflowData;
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
		Workflow.prototype.initTasks = function(){
			var that = this;
			var  tasks = this.workflowData.jsonDataMap['tasks'];
			var task = {id:'',name:'',desc:'',assignees:[],form:{name:'',desc:'',fields:[{id:'result',name:'审批结果',type:'enum',value:'1',values:[{'同意':'1'},{'不同意':'-1'}],required:true},{id:'comment',name:'审批意见',type:'text',value:'1',required:true}]}};
			if(tasks.length==1){
			    tasks = [];
			    tasks.push(task);
			} 
			this.tasksList = new V.Classes['v.ui.Grid']();
			this.tasksList.init({
				container:$('.tasks',this.template),
				columns:[
					{displayName:'任务标识',key:'name',width:160,render:function(record){
					    var id = record.id||'';
						var name = $("<span style='color:red'>*</span><input type='text' style='width:120px;margin:0;'  value='"+id+"' data-validator='text4' data-required='true'/><p class='error_msg'></p>");
						name.change(function(){
							record.id = this.value;
						});
						return name;
					}},
				    {displayName:'任务名称',key:'name',width:160,render:function(record){
						var name = $("<span style='color:red'>*</span><input type='text' style='width:120px;margin:0;'  value='"+record.name+"' data-validator='' data-required='true'/><p class='error_msg'></p>");
						name.change(function(){
							record.name = this.value;
						});
						return name;
					}},
					{displayName:'描述',key:'desc',width:200,render:function(record){
						var desc = $("<textarea style='width:160px;margin:0;' rows=2>"+record.desc+"</textarea>");
						desc.change(function(){
							record.desc = desc.val();
						})
						return desc;
					}},
					{displayName:'类型',key:'startWithPrevious',width:100,render:function(record){
						var startWithPrevious = record.startWithPrevious || 'serial';
						var type = $("<select style='width:80px;margin:0;' value='"+startWithPrevious+"'><option value='serial'>串行</option><option value='parallel@1'>并行</option></select>");
						//$('option[value='+startWithPrevious+']',type).attr('selected',true);
						if(startWithPrevious == 'serial'){
							$('option:eq(0)',type).attr('selected',true);
						}else{
							$('option:eq(1)',type).attr('selected',true);
						}
						type.change(function(){
							record.startWithPrevious = this.value;
						});
						return type;
					}},
					{displayName:'内容',key:'startWithPrevious',width:80,render:function(record){
						var createBtn = $("<button  class='btn btn-primary margin:0;'>创建表单</button>");
						createBtn.click(function(){
							that.showForm(record);
						})
						return createBtn;
					}},
					{displayName:'指派给',key:'assignee',width:240,render:function(record){
						var user = $("<div align='right'><span class='assignees' style='float:left' required='required'></span><p style='flaot:left' class='error_msg'></p><span style='color:red'>*</span><button class='btn btn-primary assign' style=''>指派</button></div>");
						var assignees = record.assignees;
						if(assignees && assignees.length>0){
							$.each(assignees,function(){
								$('.assignees',user).append('<p style="width:100px;text-align:left">'+this.name+'</p>');
							});
						}
						$('.assign',user).click(function(){
								that.assign(record);
						});
						return user;
					}},
					{displayName:'操作',key:'startWithPrevious',width:60,render:function(record){
						var actions = $("<div><button  class='btn add' style='margin-left:6px;'><i class='icon-plus'></i></button><button  class='btn remove' style='margin-left:6px;'><i class='icon-minus'></i></button></div>");
						//var task = {name:'',desc:'',assignees:[],form:{name:'',desc:'',fields:[{name:'result',type:'enum',value:'1',values:[{'同意':'1'},{'不同意':'-1'}],required:true},{name:'approveComments',type:'text',value:'1',required:true}]}};
						var task = {id:'',name:'',desc:'',assignees:[],form:{name:'',desc:'',fields:[{id:'result',name:'审批结果',type:'enum',value:'1',values:[{'同意':'1'},{'不同意':'-1'}],required:true},{id:'comment',name:'审批意见',type:'text',value:'1',required:true}]}};
						var index = that.tasksList.getRecordIndex(record);
						$('.add',actions).click(function(){
						    that.tasksList.options.data.splice(index+1,0,task);
							that.tasksList.refresh();
						});
						$('.remove',actions).click(function(){
							var size = that.tasksList.options.data.length;
							if(size>1){
								that.tasksList.options.data.splice(index,1);
							    that.tasksList.refresh();
							}
						});
						return actions;
					}}
				],
				data:tasks
			});
			
			this.validateForm(document);
			
			this.subscribe(this,this.EVENT.UPDATE_ASSIGNEE,function(){
			    that.tasksList.refresh();
			});
		};
		Workflow.prototype.assign = function(task){
		    var that = this;
	    	var assignees = task.assignees;
			var dlg = new V.Classes['v.ui.Dialog']();
			var con = $("<div style='overflow:hidden;'>\
				    <div><span class='span1'>用户名：</span><span class='span3'><input type='text' name='userName' /></span><span class='span1'><button class='btn btn-inverse'><i classs='icon-seach icon-white'></i> 查询</button></span></div>\
					<div class='list1' style='float:left;width:400px;'></div>\
					<div style='float:left;width:40px;margin:0 4px;height:181px;line-height:181px;'><a class='btn add' href='javascript:void(0);' title='添加'>&gt;&gt;</a></div>\
					<div class='list2' style='float:left;width:181px;'></div>\
				</div>");
			var list1 = new V.Classes['v.ui.Grid']();
			list1.setPagination(new V.Classes['v.ui.Pagination']());
			list1.init({
				container:$('.list1',con),
				url:this.module+'/work-flow!getSystemUserByPage.action',
				checkable:true,
				height:181,
				columns:[
				    {displayName:'用户名',key:'userName'}
				],
				data:[]
			});
			var list2 = new V.Classes['v.ui.Grid']();
			list2.init({
				container:$('.list2',con),
				height:181,
				columns:[
				    {displayName:'用户名',key:'name'},
					{displayName:'',width:40,key:'action',render:function(record){
						var html = $('<a href="javascript:void(0);"><i class="icon-remove"></i></a>');
						html.click(function(){
							list2.removeRecord(record);
						});
						return html;
					}}
				],
				data:assignees
			});
			dlg.setContent(con);
			dlg.setBtnsBar({btns:[{
			text:'确定',style:'btn-primary',handler:function(){
					saveAssignee();
					dlg.close();
				}
			},{
				text:'取消',handler:function(){
					dlg.close();
				}
			}]});
			dlg.init({
				title:'任务指派',
				width:680,
				height:400
			});
			$('.add',con).click(function(){
				addUser();
			});
			function addUser(){
				var records = list1.getCheckedRecords();
				var _records = list2.options.data || [];
				var items = [];
				$.each(records,function(){
					var isExist = false;
					var r = this;
					$.each(_records,function(){
						if(this.id == r.loginName){
							isExist = true;
							return false;
						}
					});
					if(!isExist){
						r.name = r.userName;
						items.push(r);
					}
				});
				$.each(items,function(){
					var item = {id:this.loginName,type:1,name:this.userName};
					list2.options.data.push(item);
				});
				list2.refresh();
			}
			function saveAssignee(){
//				var data = list2.options.data;
//				assignees.splice(0,assignees.length);
//				$.each(data,function(){
//					assignees.push({id:this.id,type:1,name:this.name});
//				});
				that.publish({eventId:that.EVENT.UPDATE_ASSIGNEE});
			}
		};
		//"name":<name>,"desc":<des;c>,"fields":[field1,field2,...];
		Workflow.prototype.showForm = function(task){
			var that = this;
			var form = task.form||'';
			form.name = form.name||'';
			form.desc = form.desc||'';
			form.fields = form.fields||[];
			var dlg = new V.Classes['v.ui.Dialog']();
			var con = '<div><div class="row-fluid" style="display:none">\
				    <label class="span2"><span style="color:red">*</span>名字：</label><div class="span10"><input type="text" value="'+form.name+'" class="span6 form-name" data-validator="" data-required="true"/><p class="error_msg"></p></div>\
				</div>\
				<div class="row-fluid" style="display:none">\
				    <label class="span2">描述：</label><div class="span10"><textarea class="span12 form-desc">'+form.desc+'</textarea></div>\
				</div>\
				<div class="row-fluid">\
				    <label class="span2" style="display:none">数据：</label><div class="span11"><div class="dataList"></div></div>\
				</div></div>';
			dlg.setContent(con);
			dlg.setBtnsBar({btns:[{
				text:'保存',style:'btn-primary',handler:function(){
					var validateFlag = true;
					
					validateFlag = that.validateCommit(dlg.template);
					
					//校验枚举类型，非空
					$(form.fields).each(function(){
						var type = this.type;
						if(type=='enum'){
							if(this.values&&this.values.length==0){
								V.alert('枚举类型不能为空字段，请配置！');
								validateFlag = false;
							}
						}
					});
					if(validateFlag==true){
						form.name = $('.form-name',dlg.template).val();
						form.desc = $('.form-desc',dlg.template).val();
						dlg.close();
					}
				}
			},{
				text:'删除',handler:function(){
					task.form = {};
					dlg.close();
				}
			}]});
			dlg.init({
				title:'定义任务表单',
				width:750,
				height:400
			});
			var list = new V.Classes['v.ui.Grid']();
			var props = form.fields;
			if(props.length==0){
				var prop = {name:'',value:'',type:'text',required:false}
				props.push(prop);
			}
			list.init({
				container:$('.dataList',dlg.template),
				columns:[
					{displayName:'属性标识',key:'id',render:function(record){
						var html = $('<span style="color:red">*</span><input type="text" style="width:100px;" value="'+record.id+'" data-validator="text4" data-required="true" /><p class="error_msg"></p>');
						//特殊处理result(审批结果)和approveComments
						if(record.id=='result' || record.id=='comment'){
							$(html[1]).attr('readOnly',true);
						}
						html.change(function(){
							record.id = this.value;
						});
						return html;
					}},
			        {displayName:'属性名称',key:'name',render:function(record){
						var html = $('<span style="color:red">*</span><input type="text" style="width:100px;" value="'+record.name+'" data-validator="" data-required="true" /><p class="error_msg"></p>');
						//特殊处理result(审批结果)和approveComments
						if(record.id=='result' || record.id=='comment'){
							$(html[1]).attr('readOnly',true);
						}
						html.change(function(){
							record.name = this.value;
						});
						return html;
					}},
					{displayName:'类型',key:'type',render:function(record){
						var html = $("<select style='width:100px;' value='"+record.type+"'><option value='text'>文本</option><option value='date'>时间</option><option value='number'>数字</option><option value='enum'>枚举</option></select>");
						$('option',html).parent().val(record.type);
						//特殊处理result(审批结果)和approveComments
						if(record.id=='result' || record.id=='comment'){
							$(html[0]).attr('readOnly',true);
						}
						html.change(function(){
							record.type = $(this).val();
							if(record.type=='enum')
								record.required = true;
							list.refresh();
						});
						return html;
					}},
					{displayName:'是否必填',key:'required',render:function(record){
						var html = $("<div style='text-align:center;'><input type='checkbox' /></div>");
						//特殊处理result(审批结果)和approveComments
						if(record.id=='result' || record.id=='comment'){
							$(html[0]).find('input').attr('readOnly',true);
						}
						$(':checkbox',html).attr('checked',record.required);
						$(':checkbox',html).click(function(){
							record.required = this.checked?true:false;
						})
						return html;
					}},
					{displayName:'操作',key:'actions',render:function(record){
						var actions = $("<div style='text-align:center;'><button  class='btn  btn-mini add'><i class='icon-plus'></i></button><button  class='btn remove btn-mini' style='margin-left:6px;'><i class='icon-minus'></i></button></div>");
						var prop = {id:'',name:'',value:'',type:'text',required:false};
						var index = list.getRecordIndex(record);
						$('.add',actions).click(function(){
						    list.options.data.splice(index+1,0,prop);
							list.refresh();
						});
						$('.remove',actions).click(function(){
							var size = list.options.data.length;
							if(size>1){
								list.options.data.splice(index,1);
							    list.refresh();
							}
						});
						
						
						if(record.type=='enum'){
							actions.append("<button  class='btn edit-enum btn-mini' style='margin-left:6px;'><i class='icon-eject'></i></button>");
							record.values = record.values||[];
						}else{
							delete record['values'];
						}
						
						//特殊处理result(审批结果)和approveComments
						if(record.id=='result' || record.id=='comment'){
							$(actions[0]).find('.remove').hide();
							$(actions[0]).find('.edit-enum').hide();
						}
						
						$('.edit-enum',actions).click(function(){
						    var dlgEnum = new V.Classes['v.ui.Dialog']();
							var con = '<div><div class="row-fluid">\
								<div class="row-fluid">\
								    <label class="span2">数据：</label><div class="span10"><div class="dataList"></div></div>\
								</div></div>';
							dlgEnum.setContent(con);
							dlgEnum.setBtnsBar({btns:[{
								text:'保存',style:'btn-primary',handler:function(){
									var validateEnumFlag = true;
									validateEnumFlag = that.validateCommit(dlgEnum.template);
									
									if(validateEnumFlag){
										record.values = [];
										
										$.each(valuesJsonArr,function(){
											var jsonObj = {};
											var key = this.key;
											var value = this.value;
											jsonObj[key] = value;
											record.values.push(jsonObj);
										});
										
										dlgEnum.close();
									}
								}
							},{
								text:'删除',handler:function(){
									record.values = [];
									dlgEnum.close();
								}
							}]});
							dlgEnum.init({
								title:'定义枚举类型',
								width:600,
								height:400
							});
							
							var listEnum = new V.Classes['v.ui.Grid']();
							var propsEnum = form.fields;
							var orgRecord = record;
							var values = record.values;
							//values = [{name:111},{value:222},{addr:333}];
							var valuesJsonArr = [];
							var valuesJson = {};
							$.each(values,function(){
								var key = '';
								var value = '';
								for(keyTmp in this){
									key = keyTmp;
									value = this[key];
								}
								valuesJson = {'key':key,'value':value};
								valuesJsonArr.push(valuesJson);
							});
							
							
							
							if(valuesJsonArr.length==0){
								var valuesJson = {key:'',value:''};
								valuesJsonArr.push(valuesJson);
							}
							listEnum.init({
								container:$('.dataList',dlgEnum.template),
								columns:[
							        {displayName:'属性名',key:'name',render:function(record){
										var html = $('<span style="color:red">*</span><input type="text" style="width:80px;" value="'+record.key+'" data-validator="" data-required="true"/><p class="error_msg"></p>');
										html.change(function(){
											record.key = this.value;
										});
										return html;
									}},
									{displayName:'属性值',key:'value',render:function(record){
										var html = $('<span style="color:red">*</span><input type="text" style="width:80px;" value="'+record.value+'" data-validator="" data-required="true"/><p class="error_msg"></p>');
										html.change(function(){
											record.value = this.value;
										});
										return html;
									}},
									{displayName:'默认值',key:'default',render:function(record){
										var html = '';
										if(orgRecord.value==record.key){
											html = $('<input name="default" type="radio" style="width:80px;" value="" checked/>');
										}
										else{
											html = $('<input name="default" type="radio" style="width:80px;" value=""/>');
										}
										
										html.click(function(){
											orgRecord.value = record.key;
										});
										return html;
									}},
									{displayName:'操作',key:'actions',render:function(record){
										var actions = $("<div style='text-align:center;'><button  class='btn  btn-mini add'><i class='icon-plus'></i></button><button  class='btn remove btn-mini' style='margin-left:6px;'><i class='icon-minus'></i></button></div>");
										var valuesJson = {key:'',value:''};
										var index = listEnum.getRecordIndex(record);
										$('.add',actions).click(function(){
										    listEnum.options.data.splice(index+1,0,valuesJson);
											listEnum.refresh();
										});
										$('.remove',actions).click(function(){
											var size = listEnum.options.data.length;
											if(size>1){
												listEnum.options.data.splice(index,1);
											    listEnum.refresh();
											}
										});
										return actions;
										}
									}
								],
								data:valuesJsonArr
							});
						});
						
						return actions;
					}}
				],
				data:props
			});
		};
		Workflow.prototype.save = function(){
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
				var flow = {moduleType:'',jsonData:''};
			     flow.moduleType = $('.flow-type',this.template).val();
				 flow.workflowName = $('.flow-name',this.template).val();
				 flow.descriptions = $('.flow-desc',this.template).val();
				 flow.id = $('input[name=id]',this.template).val();
				 flow.name = $('input[name=name]',this.template).val();
				 flow.isDeploy = $('input[name=isDeployed]',this.template).val();
				 flow.jsonData = this.getFlowJsonData();
				 if(flow.id){
				 	V.ajax({
					 	url:this.module+'/work-flow!editWorkFlow.action',
						data:{flow:flow},
						success:function(){
							var options = {};
							options.module = that.module;
							that.forward('v.views.backoffice.custom.workflowList',options);
						}
					 })
				 }else{
				 	V.ajax({
					 	url:this.module+'/work-flow!save.action',
						data:{flow:flow},
						success:function(){
							var options = {};
							options.module = that.module;
							that.forward('v.views.backoffice.custom.workflowList',options);
						}
					 })
				 }
			 }
		};
		Workflow.prototype.getFlowJsonData = function(){
			 var jsonData = {}
			 jsonData.name = $('.flow-name',this.template).val();
			 jsonData.desc = $('.flow-desc',this.template).text();
			 var tasks = [];
			 var data = this.tasksList.options.data;
			 $.each(data,function(){
			 	var task = {};
			 	task.id = this.id;
				task.name = this.name;
				task.desc = this.desc;
				task.assignees = this.assignees;
				task.startWithPrevious = this.startWithPrevious;
				task.form = this.form;
				//任务类型，暂时hardcode为userTask；
				task.type = "userTask";
				tasks.push(task);
			 });
			 jsonData.tasks = tasks;
			 return JSON.stringify(jsonData);
		};
		Workflow.prototype.showFlowImage = function(){
			var dlg = new V.Classes['v.ui.Dialog']();
			var con = $('<div></div>');
			var src = this.module+'/work-flow!showImageByJson.action?jsonData='+this.getFlowJsonData();
			var img = new Image();
			img.src=src;
			img.onload = function(){
				dlg.getContent().css('background','none');
			};
			con.append(img);
			dlg.getContent().css('background','url(imgs/loading_16.gif) center no-repeat');
			dlg.setContent(con);
			dlg.init({
				height:300,
				width:400,
				title:'流程图'
			});
		};
		Workflow.prototype.validateForm = function(context){
			$('*[data-validator]:visible',context).live('keyup',function(e){
				var v = this.value;
				var rules = $(this).attr('data-validator');
				var required = $(this).attr('data-required')||'false';
				
				if(required=='true'&&v==""){
					$(this).parent().find('.error_msg').text("该值不可为空").show();
					return false;
				}
				var msg = Validator.validate(rules,v);
				if(msg){
					$(this).parent().find('.error_msg').text(msg).show();
				}else{
					$(this).parent().find('.error_msg').empty().hide();
				}
			});
		};
		Workflow.prototype.validateCommit = function(context){
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
		Workflow.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'工作流设置'}});
		}
	})(V.Classes['v.views.backoffice.custom.Workflow']);
},{plugins:["v.ui.grid","v.ui.pagination",'v.fn.validator']})