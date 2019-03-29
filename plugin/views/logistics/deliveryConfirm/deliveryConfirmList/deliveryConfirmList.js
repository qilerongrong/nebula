;V.registPlugin("v.views.logistics.deliveryConfirm.deliveryConfirmList",function(){
	V.Classes.create({
		className:"v.views.logistics.deliveryConfirm.DeliveryConfirmList",
		superClass:"v.views.commonDocket.CommonDocketList",
		init:function(){
            this.ns = 'v.views.logistics.deliveryConfirm.deliveryConfirmList';
			this.module = '';
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.DynamicGrid']();
		}
	});
	(function(List){
		List.prototype.initConditionForm = function(){
			this.initMenuCondition({'tableType':'header'});
		}
		
		List.prototype.initList = function(){
			var that = this;
			var list = this.list;
			list.setActionColumn({
				displayName: "操作",
				key: 'action',
				width: 80,
				render: function(record){
					var html = {};
					 
//					if (record.status=='PAUSED') {
//						html = $('<div class="action"><a class="view" href="javascript:void(0);" title="查询"><i class="icon-search"></i></a> <a class="run" href="javascript:void(0);" title="运行">运行</a><div>');
//					}else if(record.status=='RUNNING'){
//						html = $('<div class="action"><a class="view" href="javascript:void(0);" title="查询"><i class="icon-search"></i></a> <a class="stop" href="javascript:void(0);" title="暂停">暂停</a><div>');
//					}else{
//						html = $('<div class="action"><a class="view" href="javascript:void(0);" title="查询"><i class="icon-search"></i></a><div>');
//					}
						html = $('<div class="action"><a class="view" href="javascript:void(0);" title="查询"><i class="icon-search"></i></a><a class="edit" href="javascript:void(0);" title="编辑"><i class="icon-edit"></i></a><div>');
					$('.remove', html).click(function(){
						that.remove(record);
					});
					$('.edit', html).click(function(){
						that.editDetail(record);
					});
					$('.view', html).click(function(){
						that.viewDetail(record);
					});
					$('.process', html).click(function(){
						that.process(record);
					});
					$('.run', html).click(function(){
						that.runServer(record);
					});
					$('.stop', html).click(function(){
						that.stopServer(record);
					});
					return html;
				}
			});
			var pagination = new V.Classes['v.ui.Pagination']();
		    list.setPagination(pagination);
		    list.setFilters(this.options.filters);
		    
		    this.subscribe(list,list.EVENT.INITED,function(data){
		    	var actions = data.actions;
		    	var tools = [];
		    	tools.push({eventId:'add',text:"新增",icon:'icon-plus'});
		    	//tools.push({eventId:'remove',text:'批量删除',icon:'icon-remove'});
		    	list.addTools(tools);
		    });
		    
			list.init({
				url: this.module+'/delivery-coordination!init.action',
				hasData : true,
				sortable:false,
				checkable:false
			});
			this.subscribe(list,'add',this.add);
			//this.subscribe(list,'remove',this.removeSelected);
		}
	

		List.prototype.editDetail = function(record){
			var options = this.options;
			options.module = this.module;
			options.record =  record;
			options.code =  record.docketCode;
			options.docketId = record.id;
			options.id=record.id;
			options.hasDetail = this.list.hasDetail;
			this.forward('v.views.logistics.deliveryConfirm.deliveryConfirmEdit',options,function(inst){
					inst.addCrumb();
				
			});
		}
		List.prototype.viewDetail = function(record) {
			var options = this.options;
			options.module = this.module;
			options.record =  record;
			options.docketId = record.id;
			options.id=record.id;
			options.hasDetail = this.list.hasDetail;
			this.forward('v.views.logistics.deliveryConfirm.deliveryConfirmView',options,function(inst){
				inst.addCrumb();
			});
		}
		
		List.prototype.process = function(record) {
			var that = this;
			var dlg = new V.Classes['v.ui.Dialog']();
			var con = $('<div></div>');
			dlg.setContent(con);
			dlg.init({
				title:this.getLang("TITLE_FLOW"),
				width:880,
				height:500
			});
			
			var mask = V.mask(con);
			$.ajax({
				url:'workflow/todo-task!workflowByPro.action',
				data:{proId:record.processInstanceId},
				success:function(data){
					V.unMask(mask);
					var workflow = data.workflow;
					var currentNodeId = data.nodeId;
					var wf = new V.Classes['v.component.Workflow']();
					wf.init({
						container:con
					});
					var lines = [];
					var nodeMap = {};
					$.each(workflow.items,function(){
					    if(this.type == "LINE"){
					    	lines.push(this);
					    	return true;
					    }
					    var ui = $.parseJSON(this.ui);
					    var nodeConfig = {
					    	type : this.type,
					    	text:this.name,
					    	data:this,
					    	position:{top:ui.y,left:ui.x}
					    };
					    var node = addNode(nodeConfig,wf);
					    if(this.id == currentNodeId){
					    	node.addClass("_jsPlumb_endpoint_anchor_ selected");
					    }
					    nodeMap[this.id] = node
					});
					$.each(lines,function(){
						var conn = wf.connect(nodeMap[this.fromNode].get(0),nodeMap[this.toNode].get(0));
						conn.setLabel(this.name);
					});
				},
				error:function(){
					V.unMask(mask);
				}
			});
			function addNode(nodeConfig,wf){
				var type = nodeConfig.type;
				var text = nodeConfig.text;
				var data = nodeConfig.data;
				var position = nodeConfig.position;
				var node;
				if(type == "START"||type == "DBPOLLER"||type == "TIMER"){
					node = wf.addBeginNode(text,position.left,position.top,data);
				}else if(type == "END"){
					node = wf.addEndNode(text,position.left,position.top,data);
				}else{
					node = wf.addNode(text,position.left,position.top,data);
				}
				return node;
			}
		}
		
		List.prototype.add = function(){
			var that = this;
			var template = $('<div class="v-search"><div class="list_toolbar"></div><div class="filters"><div class="well form-search"></div></div><div class="list"></div></div>');
			var btn_search = $('<button class="btn btn-primary btn-search">搜索</button>');
			var btn_reset = $('<button class="btn btn-reset">重置</button>');
			btn_search.click(function(){
				if(!form.validate()) return;
				sellList.setFilters(form.getValues());
				sellList.retrieveData();
			});
			btn_reset.click(function(){
				form.reset();
			});
			var form = new V.Classes["v.component.Form"](); 
			var Form = V.Classes['v.component.Form'];
			var items = [
				       {label:'订单编码',type:Form.TYPE.TEXT,name:'docketCode',value:''},
				       {label:'订单名称',type:Form.TYPE.TEXT,name:'docketName',value:''}
				];
			form.init({
				container:$('.form-search',template),
				colspan:2,
				items:items
			});
			$('.form-search',template).append($('<div class="row-fluid btns" style="text-align:center"></div>').append(btn_search).append(btn_reset));
				
			 var sellList = new V.Classes['v.ui.DynamicGrid']();
			 sellList.setFilters(form.getValues());
			 sellList.setPagination(new V.Classes['v.ui.Pagination']());
			
			 sellList.init({
	                container:template,
	                checkable:true,
	                isSingleChecked:true,
					url:this.module+'/delivery-coordination!initsell.action'
					 });
			/**Dialog**/
			var addDlg = new V.Classes['v.ui.Dialog']();
			addDlg.setBtnsBar({btns:[{text:'选择',style:"btn-primary",handler:function(){
				var selected = sellList.getCheckedRecords();
				if (selected.length == 0) {
					V.alert('请选择');
					return;
				}
				
				  $.ajax({
	            	url:that.module+'/delivery-coordination!saveDelivery.action',
	               	type:'post',
					data: {docketId:selected[0].id},
	                success:function(data){
	                	if (!data.fail) {
	                		addDlg.close();
						  	that.editDetail(data.result)
	                	} else {
	                		V.alert(data.fail);
	                	}
	                	
	                }
	            })
				
			}},{text:'关闭',handler:addDlg.close}]});
			addDlg.init({title:'选择销售订单',height:592,width:860});
			addDlg.setContent(template);
		}
		
		/**删除**/
		List.prototype.remove = function(record){
			var that = this;
			var info="是否删除？";
			V.confirm(info,function ok(e){
				var url = that.module+'/delivery-coordination!delete.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
	               	data:{ids:record['id'],docketType:that.options.variables.docketType},
	                success:function(data){
	                	if(data == 'success'){
	                		that.list.removeRecord(record);
	                		V.alert("删除成功！");
	                	}else{
	                		V.alert("删除失败！");
	                	}
	                }
	            })
			});
		}
		
		
		List.prototype.getSelectedIds = function(){
			var records = this.list.getCheckedRecords();
			var rec = [];
			for(var i = 0;i<records.length;i++){
				var obj = records[i];
				rec.push(obj['id']);
			}
			return rec;
		}
		/**批量删除**/
		List.prototype.removeSelected = function(){
			var that = this;
			var rec = this.getSelectedIds();
			if(rec.length == 0 ){
				V.alert("请选择记录！");
				return;
			}
			V.confirm("确认删除？",function ok(e){
				var records = that.list.getCheckedRecords();
				
				var url = that.module+'/delivery-coordination!delete.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
					data:{ids:rec.join(','),docketType:that.options.variables.docketType},
	                success:function(data){
	                	if(data == 'success'){
	                		that.list.refresh();
	                		V.alert("删除成功！");
	                	}else{
	                		V.alert("删除失败！");
	                	}
	                }
	            })
			});
		}
		List.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:"运输申请"}});
		}
		List.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:"运输申请"}});
		}
	})(V.Classes['v.views.logistics.deliveryConfirm.DeliveryConfirmList']);
},{plugins:['v.views.commonDocket.commonDocketList','v.ui.dynamicGrid','v.ui.confirm','v.ui.alert','v.component.workflow']});