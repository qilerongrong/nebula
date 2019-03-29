;V.registPlugin("v.module.report.reportManage.reportList",function(){
	V.Classes.create({
		className:"v.module.report.reportManage.ReportList",
		superClass:"v.component.SearchList",
		init:function(){
            this.ns = 'v.module.report.reportManage.reportList';
        	this.module = '';
        	this.list = new V.Classes['v.ui.Grid']();
			this.form = new V.Classes["v.component.Form"]();
			this.fileupload = new V.Classes['v.ui.FileUpload']();
		}
	});
	(function(ReportList){
		ReportList.prototype.initConditionForm = function(){
		    var Form = V.Classes['v.component.Form'];
			var items = [
		       {label:this.getLang("LABEL_REPORT_TITLE"),type:Form.TYPE.TEXT,name:'reportTitle',value:''}
		       //,{label:'报表分类',type:Form.TYPE.SELECT,name:'reportTypeName',value:''}
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
		ReportList.prototype.initList = function(){
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
						displayName : '报表编码',
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
							html = $('<div class="action"><a class="view" href="javascript:void(0);" title="'+that.getLang("TIP_SEARCH")+'"><i class="icon-search"></i></a><div>');
							$('.view', html).click(function() {
								that.viewReport(record);
							});
							return html;
						}
				    }
				]
			});
		}
		ReportList.prototype.viewReport = function(record){
			var options = {};
			options.module = this.module;
			options.record = record;
			this.forward('v.module.report.reportManage.viewReport',options);
		}
		ReportList.prototype.removeReport = function(record){
			var that = this;
			V.confirm(this.getLang("MSG_IS_REMOVE"),function(e){
				$.ajax({
					url:that.module+'/report!delete.action',
					type:'post',
					data:{id:record['id']},
					success:function(data){
						if(data == 'success'){
			              	V.alert(that.getLang("MSG_REMOVE_SUCCESS"));
			              	that.list.removeRecord(record);
			             }else{
			                V.alert(data);
		                 }	
					}
				})
			});
		}
		 
		ReportList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_REPORT_BROWSE")}});
		}
		ReportList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_REPORT_BROWSE")}});
		}
	})(V.Classes['v.module.report.reportManage.ReportList']);
},{plugins:['v.component.searchList','v.ui.dynamicGrid','v.ui.confirm','v.ui.alert',"v.ui.fileUpload"]});
