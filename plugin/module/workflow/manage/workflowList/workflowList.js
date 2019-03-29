;V.registPlugin("v.module.workflow.manage.workflowList",function(){
	V.Classes.create({
		className:"v.module.workflow.manage.WorkflowList",
		superClass:"v.component.SearchList",
		init:function(){
            this.ns = 'v.module.workflow.manage.workflowList';
        	this.module = '';
        	this.list = new V.Classes['v.ui.Grid']();
			this.form = new V.Classes["v.component.Form"]();
			this.fileupload = new V.Classes['v.ui.FileUpload']();
		}
	});
	(function(WorkflowList){
		WorkflowList.prototype.initConditionForm = function(){
		    var Form = V.Classes['v.component.Form'];
			var items = [
		       {label:'工作流名字',type:Form.TYPE.TEXT,name:'workflowName',value:''}
		       ,{label:'工作流Key',type:Form.TYPE.TEXT,name:'workflowKey',value:''}
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
		WorkflowList.prototype.initList = function(){
			var list = this.list;
			//var pagination = new V.Classes['v.ui.Pagination']();
			//list.setPagination(pagination);
			var that = this;
			var filters = this.options.filters;
			filters.platformNo = this.options.platformNo;
			list.setFilters(filters);
			
			list.init({
				container : $('.list', this.template),
				checkable : true,
				url :'workflow/workflow!list.action',
				data:[],
				columns : [
					{
						displayName : '工作流',
						key : 'workflowName',
						width : 100
					},
					{
						displayName : '工作流Key',
						key : 'workflowKey',
						width : 100
					},
					{
						displayName : '发布版本号',
						key : 'deployId',
						width : 70
					},
					{
						displayName : '待发布',
						key : 'changed',
						width : 20,
						render : function(record) {
							return record.changed == 1 ? "是" : "否";//V.Util.formatDate(new Date(record.createDate))
						}
					},
					{
						displayName : '更新日期',
						key : 'createTimes',
						width : 70,
						render : function(record) {
							return record.updateTime;//V.Util.formatDate(new Date(record.createDate))
						}
					},
					{
						displayName : '操作',
						key : 'action',
						width : 50,
						render : function(record) {
							html = $('<div class="action"><a class="copy" href="javascript:void(0);" title="复制"><i class="icon-paste"></i></a><a class="change" href="javascript:void(0);" title="修改"><i class="icon-edit"></i></a><a class="deploy" href="javascript:void(0);" title="部署"><i class="icon-monitor"></i></a><div>');
							$('.copy', html).click(function() {
								that.copyWorkflow(record);
							});
							$('.change', html).click(function() {
								that.editWorkflow(record);
							});
							$('.deploy', html).click(function() {
								that.deployWorkflow(record);
							});
							return html;
						}
					}
				],
				data:[],
				toolbar:[
				    {eventId:'add',text:'新建工作流',icon:'icon-plus'}
				    ,{eventId:'batchDeploy',text:'批量部署',icon:'icon-batch-confirm'}
//				    ,{eventId:'undeploy',text:'取消部署',icon:'icon-ban-circle'}
//				    ,{eventId:'startup',text:'启动',icon:'icon-ok'}
				]
			});
			this.subscribe(list,'add',this.addWorkflow);
			this.subscribe(list,'batchDeploy',this.batchDeployWorkflow);
//		    this.container.append(this.template);
		}
		WorkflowList.prototype.getFilters = function(){
			var that = this;
			this.filters = {};
			this.filters = this.form.getValues();
			this.filters.platformNo = this.options.platformNo;
			return this.filters;
		}
		WorkflowList.prototype.addWorkflow = function(){
			this.editWorkflow();
		}
		WorkflowList.prototype.editWorkflow = function(workflow){
			if(workflow){
				this.options.flowData = workflow;
			}else{
				this.options.flowData = null;
			}
			this.options.module = this.module;
			this.options.platformNo = this.options.platformNo;
			this.forward("v.module.workflow.manage.workflowSetting",this.options,function(p){
				p.addCrumb();
			});
		}
		WorkflowList.prototype.removeWorkflow = function(record){
			var that = this;
			V.confirm("是否删除?",function(e){
				$.ajax({
					url:that.module+'/workflow!delete.action',
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
		WorkflowList.prototype.copyWorkflow = function(record){
			var id = record.id;

			//弹出对话框
			var that = this;
			var editDlg = new V.Classes['v.ui.Dialog']();
			var Form = V.Classes['v.component.Form'];
			var form = new Form();
			var items = [];
			
			items.push({label:'工作流名称', type:Form.TYPE.TEXT,name:'workflowName',value:record.workflowName});
			items.push({label:'工作流Key', type:Form.TYPE.TEXT,name:'workflowKey',value:record.workflowKey});
			
			form.init({
				container:editDlg.getContent(),
				items:items,colspan:1
			});
			//editDlg.setContent(con);
			editDlg.setBtnsBar({
				position:'center',
				btns:[
				      {text:'提交',style:'btn-primary',handler:function(){
				    	  var name= $('input[name="workflowName"]',form.template).val();
				    	  var key = $('input[name="workflowKey"]',form.template).val();
				    	  $.ajax({
				    		  url:that.module+'/workflow!copy.action',
				    		  type:'post',
				    		  //contentType:'application/json',
				    		  data:{id:id,workflowName:name,workflowKey:key},
				    		  success:function(data){
				    			  if(data == "success"){
				    				  editDlg.close();
				    				  V.alert("复制成功！");
				    				  //新增成功后处理方法
				    				  //that.getTicketsType(type.moduleCode);
				    			  }else{
				    				  V.alert(data);
				    			  }
				    		  }
				    	  })
				      }},
				      {text:'取消',handler:function(){
				    	  editDlg.close();
				      }}
				      ]
			});
			editDlg.init({
				width:400,
				height:200,
				title:'复制工作流'
			});			
		}
		WorkflowList.prototype.deployWorkflow = function(record){
			var id = record.id;
			var name = record.workflowName;
			$.ajax({
				url:'workflow/workflow!deployed.action',
				data:{workflowId:id},
				success:function(){
					V.alert(name+"流程部署成功。");
				}
			});
		}
		WorkflowList.prototype.batchDeployWorkflow = function(){
			var records = this.list.getCheckedRecords();
			if(records.length==0){
				V.alert('请选择数据！');
				return;
			}
			var workflowIds = [];
			for(i=0; i<records.length; i++){
				workflowIds.push(records[i].id);
			}
			$.ajax({
				url:'workflow/workflow!batchDeployed.action',
				data:{workflowIds:workflowIds.join(',')},
				success:function(){
					V.alert("批量流程部署成功。");
				}
			});
		}
		WorkflowList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'工作流维护'}});
		}
		WorkflowList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'工作流维护'}});
		}
	})(V.Classes['v.module.workflow.manage.WorkflowList']);
},{plugins:['v.component.searchList','v.ui.grid','v.ui.confirm','v.ui.alert',"v.component.fileUpload"]});
