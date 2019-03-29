;V.registPlugin("v.views.backoffice.custom.menuCustomList",function() {
	V.Classes.create({
				className : "v.views.backoffice.custom.MenuCustomList",
				superClass : "v.views.component.SearchList",
				init : function() {
					this.ns = 'v.views.backoffice.custom.menuCustomList';
					this.module = '';
					this.list = new V.Classes['v.ui.Grid']();
					this.form = new V.Classes["v.component.Form"]();
				}
			});
	(function(MenuCustomList) {
		MenuCustomList.prototype.initConditionForm = function() {
			var Form = V.Classes['v.component.Form'];
			var items = [
					       	{
					       		label:'平台编码',
					       		type:Form.TYPE.TEXT,
					       		name:'platformNo',value:''
					       	}
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
		MenuCustomList.prototype.initList = function() {
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			var that = this;
			list.init({
				container : $('.list', this.template),
				checkable : true,
				url : this.module+ '/menu!list.action',
				columns : [
					{
						displayName : '菜单标识',
						key : 'id',
						width : 120
					},{
						displayName : '菜单父标识',
						key : 'parentId',
						width : 120
					},{
						displayName : '菜单名称',
						key : 'menuName',
						width : 120
					},{
						displayName : '菜单级别',
						key : 'menuLevel',
						width : 120
					},{
						displayName : '平台编码',
						key : 'platformNo',
						width : 120
					}
				],
				toolbar:[
			          {eventId:'import',text:'导入',icon:'icon-upload'},
					  {eventId:'export',text:'导出',icon:'icon-download'},
					  {eventId:'batchDelete',text:'批量删除',icon:'icon-remove'}
				]
			});
			this.subscribe(list,'import',this.importMenu);
			this.subscribe(list,'export',this.exportMenu);
			this.subscribe(list,'batchDelete',this.batchDelete);
		}
		MenuCustomList.prototype.importMenu = function(){
			var　that = this;
			var uploader = new V.Classes['v.component.FileUpload']();
			var params = {};
			
			uploader.init({
				title:"上传文件",
				uploadSetting:{
					url:this.module+'/menu!importMenu.action',
					params:params,
					uploadComplete:function(){
						 that.list.refresh();
					},
					uploadSuccess:function(file, serverData, response){
						var data = JSON.parse(serverData);
						if(data.error && data.error != ''){
							V.alert(data.error);
						} else {
							V.alert("菜单导入成功！");
						}
					},
					uploadError:function(){
						V.alert("导入失败！");
					}
				}
			});
		}
		MenuCustomList.prototype.exportMenu = function(){
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
				form_print = $('<form action='+this.module+'/menu!exportMenu.action type="POST" class="docket_export_form" style="display:none"></form>');
			}
			$.each(this.list.filters,function(prop,val){
				if(prop=='page') return true;
				var input = $('<input type="hidden" name="'+prop+'" value='+val+'>');
				form_print.append(input);
			});
			this.template.append(form_print);
			form_print[0].submit();
		}
		MenuCustomList.prototype.batchDelete = function(){
			var that = this;
			var records = this.list.getCheckedRecords();
			if(records.length==0){
				V.alert('请先选择记录！');
				return;
			}
			
			var menuIds = [];
			$.each(records,function(){
				menuIds.push(this.id);
			})
			
			V.ajax({
				url:this.module+'/menu!batchDelete.action',
				data:{menuIds:menuIds.join(",")},
				success:function(data){
					if(data.msg=='fail'){
						V.alert(data.fail);
					}else{
						that.list.refresh();
					}
				}
			})
		}
		MenuCustomList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'菜单管理'}});
		}
	})(V.Classes['v.views.backoffice.custom.MenuCustomList']);
}, {
	plugins : [ 'v.views.component.searchList','v.component.fileUpload']
});