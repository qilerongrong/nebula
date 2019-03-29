;V.registPlugin("v.views.maintenance.informationMaintain.brandList",function() {
	V.Classes.create({
				className : "v.views.maintenance.informationMaintain.BrandList",
				superClass : "v.views.component.SearchList",
				init : function() {
					this.ns = 'v.views.goods.goodsManage.brandList';
					this.module = '';
					this.list = new V.Classes['v.ui.Grid']();
					this.form = new V.Classes["v.component.Form"]();
				}
			});
	(function(BrandList) {
		BrandList.prototype.initConditionForm = function() {
			var Form = V.Classes['v.component.Form'];
			this.form.init({
				colspan : 3,
				items : [ {
					label : '品牌编码',
					type : Form.TYPE.TEXT,
					name : 'brandCode',
					value : ''
				}, {
					label : '品牌名称',
					type : Form.TYPE.TEXT,
					name : 'brandName',
					value : ''
				} ]
			});
		}
		BrandList.prototype.initList = function() {
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			var that = this;
			list.init({
						container : $('.list', this.template),
						checkable : true,
						url : this.module+ '/brand!init.action',
						columns : [{
									displayName : '品牌编码',
									key : 'brandCode',
									width : 120
								},{
									displayName : '品牌名称',
									key : 'brandName',
									width : 120
								},{
									displayName : '操作',
									key : 'action',
									width : 50,
									align:'center',
									render : function(record) {
										var html = $('<div class="action"><a class="change" href="javascript:void(0);" title="修改"><i class="icon-edit"></i></a><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a><div>');
										$('.change', html).click(
												function() {
													that.addEditBrand(record,"E");
												});
										$('.remove', html).click(
												function() {
													that.removeBrand(record);
												});
										return html;
									}
								} ],
						toolbar : [ {
							eventId : 'add',
							text : '新增品牌',
							icon : 'icon-plus'
						}, {
							eventId : 'remove',
							text : '删除品牌',
							icon : 'icon-remove'
						}]
					});
			this.subscribe(list, 'add', this.addEditBrand);
			this.subscribe(list, 'remove', this.removeBrands);
			this.container.append(this.template);
		}
		BrandList.prototype.removeBrands = function(){
			var that = this;
			var brandIdlist = this.list.getCheckedRecords();
			if(brandIdlist.length<=0){
				V.alert("请选择要删除的品牌!");
				return;
			}
			var ids="";
			$.each(brandIdlist,function(){
				ids +=this.id+",";
			})
			V.confirm('确定删除所选品牌？',function(){
				$.ajax({
					url : that.module + '/brand!deleteAll.action',
					data: {ids:ids},
					success : function(data){
						if(data == 'success'){
							that.list.refresh();
						}
					}
				})
			})
		}
		BrandList.prototype.removeBrand = function(record){
			var that = this;
			V.confirm('确定删除该品牌？',function(){
				$.ajax({
					url : that.module + '/brand!delete.action',
					data: {id:record.id},
					success : function(data){
						if(data == 'success'){
							that.list.refresh();
						}
					}
				})
			})
		}
		BrandList.prototype.addEditBrand = function(record,E) {
			var that = this;
			var titles="新增品牌";
			if(E=='E'){
				titles="编辑品牌";
			}
			/** Dialog* */
			var html = $('<div><div class="brand"></div></div>');
			var addDlg = new V.Classes['v.ui.Dialog']();
			var form = new V.Classes['v.component.Form']();
			addDlg.setBtnsBar({
				btns : [{
					text : "确定",
					style : "btn-primary",
					handler : function(){
						if (!form.validate()) {
							return;
						}
						var brand=form.getValues();
						record["brandCode"] = brand["brandCode"];
						record["brandName"] = brand["brandName"];
						$.ajax({
							url:that.module+'/brand!save.action',
							type:'post',
							contentType:'application/json',
							data:JSON.stringify({brand:record}),
							success:function(data){
								if(data == 'success'){
					              	V.alert("保存成功!");
					              	that.list.retrieveData();
					              	addDlg.close();
					             }else if(data.msg="error"){
									   V.alert(data.info);
								  }else{
									  V.alert("保存失败!");
								  }
							}
						})
					}
				},{
					text : "取消",
					handler : addDlg.close
				}]
			});
			addDlg.init({
				title : titles,
				height : 232,
				width : 560
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
				name : 'brandCode',
				label : '品牌编码',
				value : record['brandCode']||'',
				required:true,
				validator:V.Classes['v.component.Form'].generateValidator(V.Classes['v.component.Form'].TYPE.TEXT,10),
				type : V.Classes['v.component.Form'].TYPE.TEXT
			};
			var item3 = {
				name : 'brandName',
				label : '品牌名称',
				value : record['brandName']||'',
				type : V.Classes['v.component.Form'].TYPE.TEXT
			};
			items.push(item1);
			items.push(item2);
			items.push(item3);
			form.init({
				container : $('.brand', html),
				items : items,
				colspan:1
			});
			addDlg.setContent(html);

		}
		BrandList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'品牌管理'}});
		}
		BrandList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'品牌管理'}});
		}
	})(V.Classes['v.views.maintenance.informationMaintain.BrandList']);
}, {
	plugins : [ 'v.views.component.searchList', "v.ui.grid",
			'v.ui.confirm', 'v.ui.alert', "v.ui.dialog" ]
});
