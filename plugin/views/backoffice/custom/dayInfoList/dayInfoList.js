;V.registPlugin("v.views.backoffice.custom.dayInfoList",function() {
	V.Classes.create({
				className : "v.views.backoffice.custom.DayInfoList",
				superClass : "v.views.component.SearchList",
				init : function() {
					this.ns = 'v.views.backoffice.custom.dayInfoList';
					this.module = '';
					this.list = new V.Classes['v.ui.Grid']();
					this.form = new V.Classes["v.component.Form"]();
				}
			});
	(function(DayInfoList) {
		DayInfoList.prototype.initConditionForm = function() {
			var Form = V.Classes['v.component.Form'];
			var items = [
//					       	{
//					       		label:'平台编码',
//					       		type:Form.TYPE.TEXT,
//					       		name:'platformNo',value:''
//					       	}
					];
			
			var itemsFilters = this.options.itemsFilters;
            if(itemsFilters){
                $.each(items,function(m,item){
                	var key = item.plugin||item.name;
                	item.value = itemsFilters[key]||'';
                });
            }
			this.form.init({
				colspan:3,
				items:items
			});
		}
		DayInfoList.prototype.initList = function() {
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			var that = this;
			list.init({
				container : $('.list', this.template),
				checkable : true,
				url : this.module+ '/day-info!list.action',
				columns : [
					{
						displayName : '日期类型',
						key : 'type',
						width : 120
					},{
						displayName : '日期',
						key : 'day',
						width : 120
					},{
						displayName : '描述',
						key : 'desc',
						width : 120
					}
				],
				toolbar:[
			          {eventId:'import',text:'导入',icon:'icon-upload'},
					  {eventId:'export',text:'导出',icon:'icon-download'},
					  {eventId:'batchDelete',text:'批量删除',icon:'icon-remove'}
				]
			});
			this.subscribe(list,'import',this.importDayInfo);
			this.subscribe(list,'export',this.exportDayInfo);
			this.subscribe(list,'batchDelete',this.batchDelete);
		}
		DayInfoList.prototype.importDayInfo = function(){
			var　that = this;
			var uploader = new V.Classes['v.component.FileUpload']();
			var params = {};
			
			uploader.init({
				title:"上传文件",
				uploadSetting:{
					url:this.module+'/day-info!importDayInfo.action',
					params:params,
					uploadComplete:function(){
						 that.list.refresh();
					}
				}
			});
		}
		DayInfoList.prototype.exportDayInfo = function(){
			var pagination = this.list.pagination;
			if (pagination.options.count > 20000) {
				V.alert("数据超出限制！");
				return;
			}
			if (pagination.options.count == 0) {
				V.alert("没有数据导出！");
				return;
			}
			var form_print = $('.docket_export_form',this.template).empty();
			if(form_print.length==0){
				form_print = $('<form action='+this.module+'/day-info!exportDayInfo.action type="POST" class="docket_export_form" style="display:none"></form>');
			}
			$.each(this.list.filters,function(prop,val){
				if(prop=='page') return true;
				var input = $('<input type="hidden" name="'+prop+'" value='+val+'>');
				form_print.append(input);
			});
			this.template.append(form_print);
			form_print[0].submit();
		}
		DayInfoList.prototype.batchDelete = function(){
			var that = this;
			var records = this.list.getCheckedRecords();
			if(records.length==0){
				V.alert('请先选择记录！');
				return;
			}
			
			var infoIds = [];
			$.each(records,function(){
				infoIds.push(this.id);
			})
			
			V.ajax({
				url:this.module+'/day-info!batchDelete.action',
				data:{infoIds:infoIds.join(",")},
				success:function(data){
					if(data.msg=='fail'){
						V.alert(data.fail);
					}else{
						that.list.refresh();
					}
				}
			})
		}
		DayInfoList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'节假日维护'}});
		}
	})(V.Classes['v.views.backoffice.custom.DayInfoList']);
}, {
	plugins : [ 'v.views.component.searchList','v.component.fileUpload']
});