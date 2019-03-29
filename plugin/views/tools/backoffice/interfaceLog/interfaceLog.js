;V.registPlugin("v.views.tools.backoffice.interfaceLog",function(){
	V.Classes.create({
		className:"v.views.tools.backoffice.InterfaceLog",
		superClass:"v.views.commonDocket.CommonDocketList",
		init:function(){
            this.ns = 'v.views.tools.backoffice.interfaceLog';
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
					if(record.direction =='O' && record.type == 'N'){
						html = $('<div class="action"><a class="resend" href="javascript:void(0);" title="重新发送"><i class="icon-refresh"></i></a><a class="view" href="javascript:void(0);" title="查看详情"><i class="icon-search"></i></a><a class="edit" href="javascript:void(0);" title="请求数据下载"><i class="icon-download"></i></a><a class="process" href="javascript:void(0);" title="响应数据下载"><i class="icon-download"></i></a><div>');
					}else{
						html = $('<div class="action"><a class="view" href="javascript:void(0);" title="查看详情"><i class="icon-search"></i></a><a class="edit" href="javascript:void(0);" title="请求数据下载"><i class="icon-download"></i></a><a class="process" href="javascript:void(0);" title="响应数据下载"><i class="icon-download"></i></a><div>');
					}
					$('.resend', html).click(function(){
						that.resend(record);
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
//		    	tools.push({eventId:'add',text:"新增",icon:'icon-plus'});
		    	//tools.push({eventId:'remove',text:'批量删除',icon:'icon-remove'});
		    	list.addTools(tools);
		    });
		    
			list.init({
				url: this.module+'/interface-log!init.action',
				hasData : true,
				sortable:false,
				checkable:false
			});
			this.subscribe(list,'add',this.add);
			//this.subscribe(list,'remove',this.removeSelected);
		}
	
		//下载请求数据
		List.prototype.editDetail = function(record){
			var pagination = this.list.pagination;
			if (pagination.options.count > 20000) {
//				V.alert("数据超出限制！");
//				return;
			}
			if (pagination.options.count == 0) {
				V.alert("没有数据导出！");
				return;
			}
			var form_print = $('.docket_export_form',this.template).empty();
			if(form_print.length==0){
				form_print = $('<form action='+this.module+'/interface-log!downloadRequest.action type="POST" class="docket_export_form" style="display:none"></form>');
			}
			var input = $('<input type="hidden" name="id" value='+record.requestDataId+'>');
			form_print.append(input);
			
			this.template.append(form_print);
			form_print[0].submit();
		}
		List.prototype.viewDetail = function(record) {
			var that = this;
			var titles="查看接口日志";
			/** Dialog* */
			var html = $('<div><div class="department docket"></div><div class="contentInfo" style="margin-top:10px;"></div></div>');
			var addDlg = new V.Classes['v.ui.Dialog']();
			var form = new V.Classes['v.component.Form']();
			addDlg.setBtnsBar({
				btns : [{
					text : "关闭",
					handler : addDlg.close
				}]
			});
			addDlg.init({
				title : titles,
				height : 462,
				width : 760
			});
			/** 将Grid中的数据加入到Dialog中* */
			var items = [];
			var item1 = {
				name : 'id',
				key : 'id',
				label : 'id',
				value : record['id']||'',
				type : V.Classes['v.component.Form'].TYPE.HIDDEN
			};
			var item2 = {
				name : 'messageId',
				label : '信息ID',
				value : record['messageId']||'',
				type : V.Classes['v.component.Form'].TYPE.READONLY
			};
			var item3 = {
				name : 'sender',
				label : '发送者',
				value : record['sender']||'',
				type : V.Classes['v.component.Form'].TYPE.READONLY
			};
			var item4 = {
					name : 'receiver',
					label : '接收者',
					value : record['receiver']||'',
					type : V.Classes['v.component.Form'].TYPE.READONLY
				};
			var item5 = {
					name : 'direction',
					label : '接收/发出',
					value : record['direction']||'',
					type : V.Classes['v.component.Form'].TYPE.READONLY
				};
			var item6 = {
					name : 'content',
					label : '错误信息',
					colspan:2,
					value : record['content']||'',//V.Util.formatDate(new Date(record['actionTime']),'YYYY-DD-MM hh:mm:ss')||'',
					type : V.Classes['v.component.Form'].TYPE.READONLY
				};
			items.push(item1);
			items.push(item2);
			items.push(item3);
			items.push(item4);
			items.push(item5);
			items.push(item6);
			
			form.init({
				container : $('.department', html),
				items : items,
				colspan:2
			});
			if(record.contentInfo!=null){
				$('.contentInfo',html).append('<pre>'+'操作实体json内容：\n'+record.interfaceId+'</pre>');
			}
			addDlg.setContent(html);
		}
		//下载响应数据
		List.prototype.process = function(record) {
			var pagination = this.list.pagination;
		if (pagination.options.count > 20000) {
//			V.alert("数据超出限制！");
//			return;
		}
		if (pagination.options.count == 0) {
			V.alert("没有数据导出！");
			return;
		}
		var form_print = $('.docket_export_form',this.template).empty();
		if(form_print.length==0){
			form_print = $('<form action='+this.module+'/interface-log!downloadRespose.action type="POST" class="docket_export_form" style="display:none"></form>');
		}
		var input = $('<input type="hidden" name="id" value='+record.reponseDataId+'>');
		form_print.append(input);
		
		this.template.append(form_print);
		form_print[0].submit();
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
				       {label:'订单号',type:Form.TYPE.TEXT,name:'docketCode',value:''},
				       {label:'购方名称',type:Form.TYPE.TEXT,name:'buyerName',value:''}
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
					url:this.module+'/transport!initsell.action'
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
	            	url:that.module+'/transport!saveDelivery.action',
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
		
		/**重发**/
		List.prototype.resend = function(record){
			var that = this;
			var info="是否重发？";
			V.confirm(info,function ok(e){
				var url = that.module+'/interface-log!resend.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
//	               	data:{ids:record['id'],docketType:that.options.variables.docketType},
	               	data:{id:record['id']},
	                success:function(data){
	                	if(data.success == 'success'){
//	                		that.list.removeRecord(record);
	                		V.alert("重发成功！");
	                	}else{
	                		V.alert("重发失败！");
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
	})(V.Classes['v.views.tools.backoffice.InterfaceLog']);
},{plugins:['v.views.commonDocket.commonDocketList','v.ui.dynamicGrid','v.ui.confirm','v.ui.alert','v.component.workflow','v.ui.dialog','v.component.form']});