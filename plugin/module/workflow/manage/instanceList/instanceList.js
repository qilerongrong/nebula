;V.registPlugin("v.module.workflow.manage.instanceList",function(){
	V.Classes.create({
		className:"v.module.workflow.manage.InstanceList",
		superClass:"v.component.SearchList",
		init:function(){
            this.ns = 'v.module.workflow.manage.instanceList';
        	this.module = '';
        	this.list = new V.Classes['v.ui.Grid']();
			this.form = new V.Classes["v.component.Form"]();
		}
	});
	(function(InstanceList){
		InstanceList.prototype.initConditionForm = function(){
		    var Form = V.Classes['v.component.Form'];
			var items = [
		       {label:'任务名称',type:Form.TYPE.TEXT,name:'taskName',value:''}
		       ,{label:'创建人',type:Form.TYPE.TEXT,name:'creator',value:''}
		       ,{label:'创建时间',type:Form.TYPE.DATERANGE,name:'createTime',value:''}
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
			this.form.init({
				colspan:3,
				items:items
			});
		}
		InstanceList.prototype.initList = function(){
			var list = this.list;
			//var pagination = new V.Classes['v.ui.Pagination']();
			//list.setPagination(pagination);
			var that = this;
			list.init({
				container : $('.list', this.template),
				checkable : false,
				url :'workflow/workflow!list.action',
				columns : [
					{
						displayName : '任务名称',
						key : 'taskName',
						width : 100
					},
					{
						displayName : '流程名称',
						key : 'workflowName',
						width : 70
					},
					{
						displayName : '创建人',
						key : 'deployId',
						width : 70
					},
					{
						displayName : '创建时间',
						key : 'createTimes',
						width : 70,
						render : function(record) {
							return V.Util.formatDate(new Date(record.createDate));
						}
					},
					{
						displayName : '状态',
						key : 'status',
						width : 70
					},
					{
						displayName : '待办类型',
						key : 'taskType',
						width : 70
					},
					{
						displayName : '操作',
						key : 'action',
						width : 50,
						render : function(record) {
							html = $('<div class="action"><a class="change" href="javascript:void(0);" title="修改"><i class="icon-edit"></i></a><div>');
							$('.change', html).click(function() {
								that.editWorkflow(record);
							});
							$('.remove', html).click(function() {
								that.removeWorkflow(record);
							});
							return html;
						}
					}
				],
				data:[]
//				toolbar:[
//				    {eventId:'add',text:'新建工作流',icon:'icon-plus'}
//				    ,{eventId:'deploy',text:'部署',icon:'icon-share'}
//				    ,{eventId:'undeploy',text:'取消部署',icon:'icon-ban-circle'}
//				    ,{eventId:'startup',text:'启动',icon:'icon-ok'}
//				]
			});
//			this.subscribe(list,'add',this.addWorkflow);
		    this.container.append(this.template);
		}
		InstanceList.prototype.addWorkflow = function(){
			this.editWorkflow();
		}
		InstanceList.prototype.editWorkflow = function(workflow){
			if(workflow){
				this.options.workflow = workflow;
			}
			this.options.module = this.module;
			this.forward("v.module.workflow.manage.workflowSetting",this.options,function(p){
				p.addCrumb();
			});
		}
		InstanceList.prototype.removeWorkflow = function(record){
			var that = this;
			V.confirm("是否删除?",function(e){
				$.ajax({
					url:that.module+'/report!delete.action',
					type:'post',
					data:{id:record['id']},
					success:function(data){
						if(data == 'success'){
			              	V.alert("删除成功!");
			              	that.list.removeRecord(record);
			             }else{
			                V.alert(data);
		                 }	
					}
				})
			});
		}
		InstanceList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'工作流维护'}});
		}
		InstanceList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'工作流维护'}});
		}
	})(V.Classes['v.module.workflow.manage.InstanceList']);
},{plugins:['v.component.searchList','v.ui.grid','v.ui.confirm','v.ui.alert',"v.component.fileUpload"]});
