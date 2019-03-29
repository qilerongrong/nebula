;V.registPlugin("v.views.book.bookList",function(){
	V.Classes.create({
		className:"v.views.book.BookList",
		superClass:"v.views.commonDocket.CommonDocketList",
		init:function(){
            this.ns = 'v.views.book.bookList';
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
				width: 180,
				render: function(record){
					var html = {};
					 
					html = $('<div class="action"><a class="remove" href="javascript:void(0);" title="删除">删除</a><a class="edit" href="javascript:void(0);" title="编辑">编辑</a>\
						<a class="view" href="javascript:void(0);" title="查询">明细</a><a class="upload" href="javascript:void(0);" title="上传">上传</a><a class="download" href="javascript:void(0);" title="下载">下载</a><div>');
					
					$('.remove', html).click(function(){
						that.remove(record);
					});
					$('.edit', html).click(function(){
						that.editDetail(record);
					});
					$('.view', html).click(function(){
						that.viewDetail(record);
					});
					$('.upload', html).click(function(){
						that.addAttachment(record);
					});
					$('.download', html).click(function(){
						that.openDownloadAttachement(record);
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
		    	tools.push({eventId:'add',text:"新增",icon:'icon-add'});
		    	tools.push({eventId:'upload',text:"上传demo",icon:'icon-add'});
		    	tools.push({eventId:'viewpdf',text:"PDFdemo",icon:'icon-add'});
		    	//tools.push({eventId:'remove',text:'批量删除',icon:'icon-remove'});
		    	list.addTools(tools);
		    });
		    
			list.init({
				url: this.module+'/book!init.action',
				hasData : true,
				sortable:false,
				checkable:false
			});
			this.subscribe(list,'add',this.add);
			this.subscribe(list,'upload',this.uploadDemo);
			this.subscribe(list,'viewpdf',this.pdfDemo);
			//this.subscribe(list,'remove',this.removeSelected);
		}
		List.prototype.uploadDemo = function(){
			var fileUploader = new V.Classes['v.component.FileUpload']();
			fileUploader.init({
				title:'上传demo',
				uploadSetting:{
					url:'servlet/file.do',
					multiSelection:false
				}
			})
		}
		List.prototype.pdfDemo = function(){
			var pdfUrl = V.contextPath+"/mockData/pdf/demo.pdf";
			var url = "js/pdfjs/viewer.html?file="+pdfUrl;
			window.open(url);
		}
		List.prototype.editDetail = function(record){
			var options = this.options;
			options.module = this.module;
			options.record =  record;
			options.code =  record.docketCode;
			options.docketId = record.id;
			options.hasDetail = this.list.hasDetail;
			// this.forward('v.views.book.demoEdit',options,function(inst){
			// 	inst.addCrumb();
			// });
			var curTabConfig = V.app.layout.getTabByPlugin(this);
			var newTab = $.extend({},curTabConfig,{tabId:'testNewTab',menuName:'测试Tab',plugin:'v.views.book.demoEdit',fromTab:curTabConfig});
			V.MessageBus.publish({eventId:'addTabpane',data:newTab});
		}
		List.prototype.viewDetail = function(record) {
			var options = this.options;
			options.module = this.module;
			options.record =  record;
			options.code =  record.docketCode;
			options.docketId = record.id;
			options.hasDetail = this.list.hasDetail;
			this.forward('v.views.book.bookView',options,function(inst){
				inst.addCrumb();
			});
		}
		List.prototype.add = function(){
			var options = this.options;
			options.module = this.module;
			options.hasDetail = this.list.hasDetail;
			delete options.docketId;
			this.forward('v.views.book.bookEdit',options,function(inst){
				inst.addCrumb();
			});
		}
		/**删除**/
		List.prototype.remove = function(record){
			var that = this;
			var info="是否删除";
			V.confirm(info,function ok(e){
				var url = that.module+'/book!deleteEntityAndDescendant.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
	               	data:{ids:record['id'],docketType:that.options.variables.docketType},
	                success:function(data){
	                	if(data.result == 'success'){
	                		that.list.removeRecord(record);
	                		V.alert("删除成功");
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
				
				var url = that.module+'/book!deleteEntityAndDescendant.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
					data:{ids:rec.join(',')},
	                success:function(data){
	                	if(data.result == 'success'){
	                		that.list.refresh();
	                		V.alert(that.getLang("MSG_REMOVE_SUCCESS"));
	                	}else{
	                		V.alert(that.getLang("MSG_CHOOSE_UNREMOVE"));
	                	}
	                }
	            })
			});
		}
		List.prototype.addAttachment = function(record){
			var that = this;
			var upload = new V.Classes['v.component.FileUpload']();
			
			this.subscribe(upload,upload.EVENT.CLOSE,function(){
				that.attachmentList.refresh();
			});
			
			upload.init({
				title : "上传文件",
				uploadSetting:{
					url:'servlet/file.do',
					params:{'parentDocketId':record.id,'cmd':'UPLOAD','owner':LoginInfo.user.userName,'ownerType':LoginInfo.user.businessRole},
					uploadComplete:function(){
					
					},
					uploadSuccess:function(file, serverData, response){
						var data = JSON.parse(serverData);
						if(data.error && data.error != ''){
							V.alert(data.error);
						} else {
							V.alert("成功");
						}
						//upload.close();
					},
					uploadError:function(){
						V.alert("Failed to upload attachments");
					}
				}
			});
		}
		List.prototype.openDownloadAttachement = function(book){
			var that = this;
			
			var dlg = new V.Classes['v.ui.Dialog']();
			var url = that.module+'/book!attachment.action';
			
			var btns = [];
			btns.push({text:"关闭",style:"btn-primary",handler:dlg.close});
			dlg.setBtnsBar({btns:btns});
			dlg.init({width:800,height:400,title:'附件列表'});
			
			var list = new V.Classes['v.ui.Grid']();
			
			var columns = [
				    {displayName:"文件",key:'realPath',width:200},
				    {displayName:"创建时间",key:'createTime',width:120},
				    {displayName:"创建人",key:'createPerson',width:120},
				    {displayName:"操作",key:'action',width:100,render:function(record){
				    	var html = {};
					 
						html = $('<div class="action"><a class="remove" href="javascript:void(0);" title="删除"><i class="icon-remove"></i></a>\
							<a class="download" href="javascript:void(0);" title="下载"><i class="icon-download"></i></a><div>');
						
						$('.remove', html).click(function(){
							that.removeAttachment(record,list);
						});
						$('.download', html).click(function(){
							that.downloadAttachement(record);
						});
						return html;
				    }}
				];
				
			var filters = {};
			filters.parentDocketId = book.id;
			list.setFilters(filters);
			
			list.init({
				container : dlg.getContent(),
				url: url,
				hasData : true,
				checkable:false,//TODO
				editable : this.isEdit,
				columns : columns
			});
		}
		List.prototype.removeAttachment = function(record,list){
			var that = this;
			V.confirm(this.getLang("CONFIRM_DELETE_ATTACH"),function(){
			    $.ajax({
			    	url:'servlet/file.do',
			    	data:{'cmd':'DELETE','id':record.id},
			    	success:function(){
			    		list.refresh();
			    	}
			    });
			});
		}
		List.prototype.downloadAttachement = function(record){
			var that = this;
		    
		    var form_print = $('.docket_export_form',this.template).empty();
			if(form_print.length==0){
				form_print = $('<form action="servlet/file.do?cmd=DOWNLOAD&id='+record.id + '" method="POST" class="docket_export_form" style="display:none"></form>');
			}
			this.template.append(form_print);
			form_print[0].submit();
		}
		List.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:"书籍录入"}});
		}
		List.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:"书籍录入"}});
		}
	})(V.Classes['v.views.book.BookList']);
},{plugins:['v.views.commonDocket.commonDocketList','v.ui.grid','v.ui.confirm','v.ui.alert','v.component.fileUpload']});
