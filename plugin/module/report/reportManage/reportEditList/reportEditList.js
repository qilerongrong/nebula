;V.registPlugin("v.module.report.reportManage.reportEditList",function(){
	V.Classes.create({
		className:"v.module.report.reportManage.ReportEditList",
		superClass:"v.component.SearchList",
		init:function(){
            this.ns = 'v.module.report.reportManage.reportEditList';
        	this.module = '';
        	this.list = new V.Classes['v.ui.Grid']();
			this.form = new V.Classes["v.component.Form"]();
			this.fileupload = new V.Classes['v.ui.FileUpload']();
		}
	});
	(function(ReportEditList){
		ReportEditList.prototype.initConditionForm = function(){
		    var Form = V.Classes['v.component.Form'];
			var items = [
		       {label:this.getLang("LABEL_REPORT_TITLE"),type:Form.TYPE.TEXT,name:'reportTitle',value:''}
//		       ,{label:this.getLang("LABEL_REPORT_TYPE"),type:Form.TYPE.TEXT,name:'reportType',value:''}
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
		ReportEditList.prototype.initList = function(){
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			var that = this;
			list.init({
				container : $('.list', this.template),
				checkable : false,
				url : this.module + '/report!list.action',
				columns : [
					{
						displayName : this.getLang("LIST_REPORT_TITLE"),
						key : 'reportTitle',
						width : 100
					},
//					{
//						displayName : this.getLang("LIST_TYPE"),
//						key : 'reportType',
//						width : 70
//					},
					{
						displayName : "报表编码",
						key : 'name',
						width : 70
					},
					{
						displayName : this.getLang("LIST_DATE"),
						key : 'createTime',
						width : 70
//						render : function(record) {
//							return V.Util.formatDate(new Date(record.createDate));
//						}
					},
					{
						displayName : this.getLang("LIST_ACTION"),
						key : 'action',
						width : 50,
						render : function(record) {
							html = $('<div class="action"><a class="change" href="javascript:void(0);" title="修改"><i class="icon-edit"></i></a>\
									<a class="remove" href="javascript:void(0);" title="删除"><i class="icon-remove"></i></a><div>');
							$('.change', html).click(function() {
								that.editReport(record);
							});
							$('.remove', html).click(function() {
								that.removeReport(record);
							});
							return html;
						}
					}
				],
				toolbar:[
				    {eventId:'add',text:this.getLang("TEXT_ADD_REPORT"),icon:'icon-plus'}
				]
			});
			this.subscribe(list,'add',this.addReport);
		    this.container.append(this.template);
		}
		ReportEditList.prototype.addReport = function(){
			this.uploadReport();
		}
		ReportEditList.prototype.editReport = function(record){
			 this.uploadReport(record);
		}
		ReportEditList.prototype.removeReport = function(record){
			var that = this;
			V.confirm(this.getLang("MSG_IS_REMOVE"),function(e){
				V.ajax({
					url:that.module+'/report!delete.action',
					type:'post',
					data:({reportInfo:{id:record['id']}}),
					success:function(data){
						if(data.result == 'success'){
			              	V.alert(that.getLang("MSG_REMOVE_SUCCESS"));
			              	that.list.removeRecord(record);
			             }else{
			                V.alert(data);
		                 }	
					}
				})
			});
		}
		ReportEditList.prototype.uploadReport = function(record){
			var　that = this;
			var uploader = new V.Classes['v.component.FileUpload']();
			var params = {};
			if(record){
				params.cmd = "update";
				params.id = record['id'];
			}else{
				params.cmd = "import";
			}
			uploader.init({
				title:this.getLang("TITLE_REPORT_UPLOAD"),
				uploadSetting:{
					url:'reportService/reportServlet.do.do',
					params:params,
					uploadComplete:function(){
						 that.list.refresh();
					},
					uploadSuccess:function(file, serverData, response){
						var data = JSON.parse(serverData);
						if(data.error && data.error != ''){
							V.alert(data.error);
						} else {
							V.alert("上传成功！");
						}
					}
				}
			});
		}
	})(V.Classes['v.module.report.reportManage.ReportEditList']);
},{plugins:['v.component.searchList','v.ui.grid','v.ui.confirm','v.ui.alert',"v.component.fileUpload"]});
