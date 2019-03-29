;V.registPlugin("v.views.home.knowledgeBase.knowledgeBaseList",function(){
	V.Classes.create({
		className:"v.views.home.knowledgeBase.KnowledgeBaseList",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = 'v.views.home.knowledgeBase.knowledgeBaseList';
            
            this.ACTION = {
				CONTENT :  'work-flow!getTaskModule.action',
				FILE 	:  'work-flow!getTaskModule.action',
			}
			
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.Grid']();
		}
	});
	(function(knowledgeBase){
		knowledgeBase.prototype.initConditionForm = function(){
			    var Form = V.Classes['v.component.Form'];
				var items = [
				       {label:'主题',type:Form.TYPE.TEXT,name:'title',value:''},
				       {label:'内容',type:Form.TYPE.TEXT,name:'content',value:''},
				       {label:'知识分类',type:Form.TYPE.SELECT,name:'knowledgeType',value:'',multiList:[['全部',0],['使用说明',1],['操作说明',2]]},
					   {label:'知识权限',type:Form.TYPE.SELECT,name:'knowledgeAuthority',value:'',multiList:[['全部',0],['公共',1],['购方',2],['供应商',3]]}
				];
				this.form.init({
					colspan:2,
					items:items
				});
		}
		knowledgeBase.prototype.initList = function(){
			var that = this;
			var list = this.list;
			
			var pagination = new V.Classes['v.ui.Pagination']();
		    list.setPagination(pagination);
		    
		    this.subscribe(list,list.EVENT.INITED,function(data){
		    	var actions = data.actions;
		    	var tools = [];
		    	for(var i=0;i<actions.length;i++){
		    		if(actions[i] == 'add'){
		    			tools.push({eventId:'add',text:'新增',icon:'icon-plus'});
		    		}
		    		if(actions[i] == 'delete'){
		    			tools.push({eventId:'remove',text:'删除',icon:'icon-remove'});
		    		}
		    	}
		    	list.addTools(tools);
		    });
		    
			list.init({
				columns:[
						{displayName:'编号',key:'userId',width:160},
						{displayName:'主题',key:'title',width:160},
						{displayName:'内容',key:'sender',width:160},
						{displayName:'知识分类',key:'sendName',width:160},
						{displayName:'知识权限',key:'sendDate',width:160},
						{displayName:'创建时间',key:'noticeId',width:160},
						{displayName:'操作',key:'action',width:120,render:function(record){
	                        var html = $('<div class="action"><a class="viewContent" href="javascript:void(0);" title="查看"><i class="icon-search"></i>明细</a>\
	                        								<a class="viewFile" href="javascript:void(0);" title="查看"><i class="icon-search"></i>文件列表</a>\
	                        								<a class="edit" href="javascript:void(0);" title="修改"><i class="icon-edit"></i>修改</a>\
	                        								<a class="delete" href="javascript:void(0);" title="删除"><i class="icon-search"></i>删除</a><div>');
							$('.viewContent', html).click(function(){
								that.viewContent(record);
							});
							$('.viewFile', html).click(function(){
								that.viewFile(record);
							});
							$('.edit', html).click(function(){
								that.addOrEditKnowledgeBase(record);
							});
							$('.delete', html).click(function(){
								that.deleteKnowledgeBase(record);
							});
							return html;
	                    }}
				],
				url: 'backoffice/systemsetting/knowledge/knowledge!query.action',
				hasData : true,
				checkable:true,
			});
			
			this.subscribe(list,'add',this.addOrEditKnowledgeBase);
			this.subscribe(list,'delete',this.deleteAllKnowledgeBase);
		}
		knowledgeBase.prototype.viewContent = function(record){
			var that = this;
			//var knowledgeDetail = $('<div><div class="knowledgeContent"></div><div class="knowledgeFile></div><div>');
			var knowledgeDetail = $('<div class="docket">\
				    <div class="con">\
			    		<div class="title content_title">\
			    			<i class="icon-chevron-down"></i><span>知识信息</span>\
			    		</div>\
			    		<div class="content_info"></div>\
			    		<div class="title file_title">\
			    			<i class="icon-chevron-down"></i><span>文件列表</span>\
			    		</div>\
			    		<div class="file_info"></div>\
			    	</div>\
			    </div>');
			
			$('.title i',knowledgeDetail).click(function(){
				if($(this).hasClass('icon-chevron-down')){
					$(this).removeClass('icon-chevron-down').addClass('icon-chevron-right');
					$(this).parent().next().slideUp();
				}else{
					$(this).removeClass('icon-chevron-right').addClass('icon-chevron-down');
					$(this).parent().next().slideDown();
				}
			});
			    
			$.ajax({
				url:that.module+"/" +that.ACTION.CONTENT,
				data:{id:that.options.id},
				dataType:'json',
				success:function(data){
					var formContent = new V.Classes['v.component.Form']();
					var contentItems = [];
					var Form = V.Classes['v.component.Form'];
					contentItems.push({label:'主题',type:Form.TYPE.TEXT,name:'title',value:data.title});
					contentItems.push({label:'编号',type:Form.TYPE.TEXT,name:'number',value:data.number});
					contentItems.push({label:'内容',type:Form.TYPE.TEXTAREA,name:'number',value:data.content});
					
					formContent.init({
						container : $('.content_info',knowledgeDetail),
						items : contentItems
					});
				}
			})
			
			var list = new V.Classes['v.ui.Grid']();
			list.setFilters({isBuyer:false});
			list.setPagination(new V.Classes['v.ui.Pagination']());
			list.init({
				container:$('.file_info',knowledgeDetail),
				url:that.module+"/" +that.ACTION.FILE,
				columns:[
					{displayName:'名称',key:'fileName',width:120}
				]
			});
			
			var addDlg = new V.Classes['v.ui.Dialog']();
			addDlg.setBtnsBar({btns:[{text:"确定",style:"btn-primary",handler:function(){
				//关闭
				addDlg.close();
			}},{text:"取消",handler:addDlg.close}]});
			addDlg.init({title:'知识库明细',height:562,width:960});
			
			addDlg.setContent(knowledgeDetail);
		}
		knowledgeBase.prototype.viewFile = function(record){
			var that = this;
			var knowledgeDetail = $('<div class="knowledgeFile></div>');
			
			var list = new V.Classes['v.ui.Grid']();
			list.setFilters({isBuyer:false});
			list.setPagination(new V.Classes['v.ui.Pagination']());
			list.init({
				container:knowledgeDetail,
				url:that.module+"/" +that.ACTION.FILE,
				columns:[
					{displayName:'名称',key:'fileName',width:120}
				]
			});
			
			var addDlg = new V.Classes['v.ui.Dialog']();
			addDlg.setBtnsBar({btns:[{text:"确定",style:"btn-primary",handler:function(){
				//关闭
				addDlg.close();
			}},{text:"取消",handler:addDlg.close}]});
			addDlg.init({title:'知识库明细',height:562,width:960});
			
			addDlg.setContent(knowledgeDetail);
		}
		/*
		knowledgeBase.prototype.viewContent = function(record){
			var options = {};
			options.module = this.module;
			options.id =  record.id;
			this.forward('v.views.home.knowledgeBase.knowledgeBaseDetail',options);
		}
		knowledgeBase.prototype.viewFile = function(record){
			var options = {};
			options.module = this.module;
			options.id =  record.id;
			this.forward('v.views.home.knowledgeBase.knowledgeBaseDetail',options);
		}
		*/
		/**知识库新增或者修改**/
		knowledgeBase.prototype.addOrEditKnowledgeBase = function(record){
			var options = {};
			options.knowledge = this.record;
			options.module = this.module;
			this.forward('v.views.home.knowledgeBase.knowledgeBaseDetail',options);
		}
		/**知识库单个删除**/
		knowledgeBase.prototype.deleteKnowledgeBase = function(record){
			var that = this;
			$.ajax({
				url:that.module+"/" +that.ACTION.CONTENT,
				data:{id:record.id},
				dataType:'json',
				success:function(data){
					if(data=='success'){
						V.alert('知识库信息删除成功！');
						that.list.removeRecord(record);
					}
					else{
						V.alert(data);
					}
				}
			})
		}
		/**知识库批量删除**/
		knowledgeBase.prototype.deleteAllKnowledgeBase = function(){
			var that = this;
			var rec = this.getSelectedIds();
			if(rec.length == 0 ){
				V.alert("请选择数据!");
				return;
			}
			
			V.confirm("批量删除知识库信息？",function ok(e){
				var records = that.list.getCheckedRecords();
				var url = that.module+'/order-confirm!deleteAll.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
					data:{ids:rec.join(',')},
	                success:function(data){
	                	if(data == 'success'){
	                		that.list.refresh();
	                		V.alert("知识库信息删除成功!");
	                	}else{
	                		V.alert(data);
	                	}
	                }
	            })
			});
		}
		knowledgeBase.prototype.getSelectedIds = function(){
			var records = this.list.getCheckedRecords();
			var rec = [];
			for(var i = 0;i<records.length;i++){
				var obj = records[i];
				rec.push(obj['id']);
			}
			return rec;
		}
	})(V.Classes['v.views.home.knowledgeBase.KnowledgeBaseList']);
},{plugins:['v.views.component.searchList','v.ui.grid','v.component.form','v.ui.pagination']});
