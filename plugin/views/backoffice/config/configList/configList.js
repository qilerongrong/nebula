;V.registPlugin("v.views.backoffice.config.configList",function(){
	V.Classes.create({
		className:"v.views.backoffice.config.ConfigList",
		superClass:"v.component.SearchList",
		init:function(){
            this.ns = 'v.views.backoffice.config.configList';
        	this.module = '';
        	this.list = new V.Classes['v.ui.Grid']();
			this.form = new V.Classes["v.component.Form"]();
			this.isDocketEdit = false; 
			this.platformNo = '';
		}
	});
	(function(List){
		List.prototype.initConditionForm = function(){
		    var Form = V.Classes['v.component.Form'];
			var items = [
		       {label:'种类编码',type:Form.TYPE.TEXT,name:'cateCode',value:''}
		       ,{label:'种类名称',type:Form.TYPE.TEXT,name:'cateName',value:''}
			];
			var filters = this.options.filters;
			if(filters&& filters.length>0){
				$.each(items,function(m,item){
					var key = this.name;
					$.each(filters,function(){
						if(key == this.key){
							item.value = this.value;
							return false;
						}
					})
				});
			}
			var platformNo = this.options.platformNo;
			if(platformNo){
				this.platformNo = platformNo;
			}
			this.form.init({
				colspan:2,
				items:items
			});
		}
		List.prototype.initList = function(){
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			var filters = this.options.filters;
			filters.platformNo = this.platformNo;
			this.module = 'njs/njsprotypeconf';
			list.setFilters(filters);
			var that = this;
			list.init({
				container : $('.list', this.template),
				checkable : false,
				url :that.module+'/njs-protype-conf!list.action',
				columns : [
					{
						displayName : '操作',
						key : 'action',
						width : 50,
						render : function(record) {
							html = $('<div class="action"><a class="change" href="javascript:void(0);" title="修改"><i class="icon-edit"></i></a><a class="delete" href="javascript:void(0);" title="删除"><i class="icon-remove"></i></a><div>');
							$('.change', html).click(function() {
								that.editConfig(record);
							});
							$('.delete', html).click(function() {
								that.deleteConfig(record);
							});
							
							return html;
						}
					},
//					{
//						displayName : '操作编码',
//						key : 'opeCode',
//						width : 50
//					},
					{
						displayName : '种类编码',
						key : 'cateCode',
						width : 50
					},
					{
						displayName : '种类名称',
						key : 'cateName',
						width : 80
					},
					{
						displayName : '表单类型',
						key : 'docketTypeForStart',
						width : 120
					},
					{
						displayName : '单据名称',
						key : 'docketTypeName',
						width : 120
					},
					{
						displayName : '创建时间',
						key : 'createTime',
						width : 60
					},
					{
						displayName : '创建人',
						key : 'createPerson',
						width : 60
					}
//					,
//					{
//						displayName : '待办类型',
//						key : 'taskType',
//						width : 70
//					}
//					{
//						displayName : '操作',
//						key : 'action',
//						width : 50,
//						render : function(record) {
//							html = $('<div class="action"><a class="change" href="javascript:void(0);" title="修改"><i class="icon-edit"></i></a><div>');
//							$('.change', html).click(function() {
//								that.editWorkflow(record);
//							});
//							$('.remove', html).click(function() {
//								that.removeWorkflow(record);
//							});
//							return html;
//						}
//					}
				],
				toolbar:[{eventId:'add',text:'新建种类',icon:'icon-plus'}]
//				    ,{eventId:'deploy',text:'部署',icon:'icon-share'}
//				    ,{eventId:'undeploy',text:'取消部署',icon:'icon-ban-circle'}
//				    ,{eventId:'startup',text:'启动',icon:'icon-ok'}
//				]
			});
			this.subscribe(list,'add',this.addConf);
		    this.container.append(this.template);
		}
		List.prototype.addConf = function(){
			this.options.module = this.module;
			this.options.record = null;
			this.options.docketId = null;
			this.options.platformNo = this.platformNo;
			this.forward("v.views.backoffice.config.addConfig",this.options,function(p){
				p.addCrumb();
			});
		}
		List.prototype.deleteConfig = function(record) {
			var that = this;
			var info="是否删除";
			V.confirm(info,function ok(e){
				var url = that.module+'/njs-protype-conf!deleteByCateCode.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
	               	data:{cateCode:record['cateCode']},
	                success:function(data){
	                	if(data == 'success'){
	                		that.list.removeRecord(record);
	                		V.alert("删除成功");
	                	}else{
	                		V.alert("删除失败！");
	                	}
	                }
	            })
			});
		}
		List.prototype.editConfig = function(record){
			
			this.options.module = this.module;
			this.options.record = record;
			this.options.docketId = record.id;
			this.forward("v.views.backoffice.config.addConfig",this.options,function(p){
				p.addCrumb();
			});
		}
		List.prototype.editWorkflow = function(workflow){
			if(workflow){
				this.options.workflow = workflow;
			}
			this.options.module = this.module;
			this.forward("v.views.application.approver.workflowSetting",this.options,function(p){
				p.addCrumb();
			});
		}
		List.prototype.removeWorkflow = function(record){
			var that = this;
			V.confirm(this.getLang("MSG_IS_DELETE"),function(e){
				$.ajax({
					url:that.module+'/report!delete.action',
					type:'post',
					data:{id:record['id']},
					success:function(data){
						if(data == 'success'){
			              	V.alert(that.getLang("MSG_DEL_SUC"));
			              	that.list.removeRecord(record);
			             }else{
			                V.alert(data);
		                 }	
					}
				})
			});
		}
		List.prototype.showDetai = function(task){
			var options = {};
			if(task){
				options.taskId = task.taskId;
			}
			options.module = this.module;
			this.forward("v.views.application.approver.task",options,function(p){
				p.addCrumb();
			});
		}
		List.prototype.aggree = function(){
			
		}
		List.prototype.disaggree = function(){
			
		}
		List.prototype.quit = function(){
			
		}
		List.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'种类管理'}});
		}
		List.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'种类管理'}});
		}
	})(V.Classes['v.views.backoffice.config.ConfigList']);
},{plugins:['v.component.searchList','v.ui.grid','v.ui.confirm','v.ui.alert',"v.component.fileUpload"]});