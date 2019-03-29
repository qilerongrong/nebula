;V.registPlugin("v.views.backoffice.maintenance.storageCreate",function(){
	V.Classes.create({
		className:"v.views.backoffice.maintenance.StorageCreate",
		superClass:"v.views.component.DocketEdit",
		init:function(){
            this.ns = "v.views.backoffice.maintenance.storageCreate";
			this.ACTION = {
				HEADER : 'returnorder-confirm!qryColumns.action',
				DETAIL : 'returnorder-confirm!itemsInfo.action',
			}
			this.code = '';
			this.headInfo = {};
			this.options.title = "新增信息";
			this.options.headerTitle="仓库头信息";
			this.options.detailTitle="";
		}
	});
	(function(StorageCreate){
		StorageCreate.prototype.EVENT = {
				HEADER_INITED:'header_inited',
				DETAIL_INITED:'detail_inited',
				ADD_DETAIL_ITEM:'add_detail_item',
				EDIT_DETAIL_ITEM:'edit_detail_item',
				REMOVE_DETAIL_ITEM:'remove_detail_item'
		}
		StorageCreate.prototype.init = function(options){
			if(options.headInfo != undefined){
				this.headInfo = options.headInfo;
			}
			
			StorageCreate.superclass.init.call(this,options);
			for(prop in options){
			    this.options[prop] = options[prop];
			}
			var that = this;
			var actions = $('<div><button class="save btn btn-success btn-mini saveInsertItems"><i class="icon-check icon-white"></i> 保存</button></div>');
			$('.actions',this.template).append(actions);
			
			//保存新增订单头和订单行信息
			$('.saveInsertItems',this.template).click(function(){
				that.saveInsertItems();
			})
			
			//$('div.header_info').remove();
			$('div.title.detail_title').remove();
			$('div.detail').remove();
			
			//初始化查询省份，城市
			this.provinceSel();	
			
			//初始化下拉框信息
			if(this.headInfo['hasPlatform']==='0')
				$('select[name="hasPlatform"]').val('0')
			else
				$('select[name="hasPlatform"]').val('1')
			if(this.headInfo['checkMode']===0)
				$('select[name="checkMode"]').val('0')
			else
				$('select[name="checkMode"]').val('1')	
				
		}
	 
		/**新增或修改仓库信息**/
		StorageCreate.prototype.initDocketHeader = function(){
		 
			var that = this;
			var form = new V.Classes['v.component.Form']();
			var Form = V.Classes['v.component.Form'];
			this.form = form;
			var items = [];
			var nowdate = V.Util.formatDate(new Date());
			var item1 = {
					name : 'siteCode',
					key : 'siteCode',
					label : '地点代码',
					value : this.headInfo['siteCode'] == undefined ?'':this.headInfo['siteCode'],
					type : Form.TYPE.TEXT,
					required:true,
					validator:Form.generateValidator(Form.TYPE.TEXT,40,0)
				};
			var item2 = {
					name : 'siteName',
					key : 'siteName',
					label : '地点名称',
					value : this.headInfo['siteName'] == undefined ?'':this.headInfo['siteName'],
					type : V.Classes['v.component.Form'].TYPE.TEXT,
					required:true,
					validator:Form.generateValidator(Form.TYPE.TEXT,200,0)
				};
			var item3 = {
					name : 'address',
					key : 'address',
					label : '地址',
					value : this.headInfo['address'] == undefined ?'':this.headInfo['address'],
					type : V.Classes['v.component.Form'].TYPE.TEXT,
					required:true,
					validator:Form.generateValidator(Form.TYPE.TEXT,600,0)
				};
			var item4 = {
					name : 'linkman',
					key : 'linkman',
					label : '联系人',
					value : this.headInfo['linkman'] == undefined ?'':this.headInfo['linkman'],
					type : V.Classes['v.component.Form'].TYPE.TEXT,
					required:true,
					validator:Form.generateValidator(Form.TYPE.TEXT,30,0)
				};
			var item5 = {
					name : 'tel',
					key : 'tel',
					label : '电话',
					value : this.headInfo['tel'] == undefined ?'':this.headInfo['tel'],
					type : V.Classes['v.component.Form'].TYPE.TEXT,
					required:true,
					validator:Form.generateValidator(Form.TYPE.TEXT,60,0)
				};
			var item6 = {
					name : 'peopleNumber',
					key : 'peopleNumber',
					label : '仓库人数',
					value : this.headInfo['peopleNumber'] == undefined ?'':this.headInfo['peopleNumber'],
					type : V.Classes['v.component.Form'].TYPE.NUMBER,
					required:true,
					validator:Form.generateValidator(Form.TYPE.NUMBER,9,0)
				};
			var item7 = {
					name : 'checkMode',
					key : 'checkMode',
					label : '审核模式',
					value : this.headInfo['checkMode'] == undefined ?'':this.headInfo['checkMode'],
					multiList:[['自动审核','0'],['手动审核','1']],
					type : V.Classes['v.component.Form'].TYPE.SELECT
				};
			var item8 = {
					name : 'hasPlatform',
					key : 'hasPlatform',
					label : '是否有月台',
					value : this.headInfo['hasPlatform'] == undefined ?'':this.headInfo['hasPlatform'],
					multiList:[['是','0'],['否','1']],
					type : V.Classes['v.component.Form'].TYPE.SELECT
				};
			var item9 = {
					name : 'areaSize',
					key : 'areaSize',
					label : '记租面积',
					value : this.headInfo['areaSize'] == undefined ?'':this.headInfo['areaSize'],
					type : V.Classes['v.component.Form'].TYPE.NUMBER,
					required:true,
					validator:Form.generateValidator(Form.TYPE.NUMBER,12,2)
				};	
			var item10 = {
					name : 'areaPrice',
					key : 'areaPrice',
					label : '租金单价',
					value : this.headInfo['areaPrice'] == undefined ?'':this.headInfo['areaPrice'],
					type : V.Classes['v.component.Form'].TYPE.NUMBER,
					required:true,
					validator:Form.generateValidator(Form.TYPE.PRICE,12,4)
				};	
			var item11 = {
					name : 'provinceId',
					key : 'provinceId',
					label : '省份',
					value : this.headInfo['provinceId'] == undefined ?'':this.headInfo['provinceId'],
					type : V.Classes['v.component.Form'].TYPE.SELECT,
					required:true,
					multiList:[],
					validator:Form.generateValidator(Form.TYPE.NUMBER,19,0)
				};		
			var item12 = {
					name : 'cityId',
					key : 'cityId',
					label : '城市',
					value : this.headInfo['cityId'] == undefined ?'':this.headInfo['cityId'],
					type : V.Classes['v.component.Form'].TYPE.SELECT,
					required:true,
					multiList:[],
					validator:Form.generateValidator(Form.TYPE.NUMBER,19,0)
				};					
			items.push(item1);
			items.push(item2);
			items.push(item3);
			items.push(item4);
			items.push(item5);
			items.push(item6);
			items.push(item7);
			items.push(item8);
			items.push(item9);
			items.push(item10);
			items.push(item11);
			items.push(item12);
			
			form.init({
				container : $('.header_info',this.template),
				items : items,
				colspan:2
			});
		}
		StorageCreate.prototype.initDocketDetail = function(){
			//不使用，覆盖父类
		}
		//保存仓库信息
		StorageCreate.prototype.saveInsertItems = function(){
			var that = this;
			
			if(this.form.validate()){//整单验证
				var whinfo = this.headInfo;
				var whinfoTmp=this.form.getValues();
				for(i in whinfoTmp){
					whinfo[i] = whinfoTmp[i];
				}
				V.confirm('是否保存仓库信息？',function(){
					$.ajax({
						url:that.module+'/whinfo!save.action',
						type:'post',
						contentType:'application/json',
						data:JSON.stringify({entity:whinfo}),
						success:function(data){
							if(data == 'success'){
				              	V.alert("仓库保存成功!");
				              	that.forward('v.views.backoffice.maintenance.storage',that.options);
				             }else{
				                V.alert(data);
			                 }	
						}
					})
				});
			}
		}
		StorageCreate.prototype.provinceSel = function(){
			var that = this;
			$.ajax({
				url:'common!province.action',
				success:function(provinces){
					$.each(provinces,function(){
						var option = "<option value='"+this.id+"'>"+this.name+"</option>";
						$('select[name=provinceId]',that.template).append(option);
					});
					
					$('select[name=provinceId]',that.template).change(function(){
						var id = $(this).val();
						$.ajax({
							url:'common!city.action',
							data:{parentId:id},
							success:function(citys){
								$('select[name=cityId]',that.template).empty();
								$('select[name=cityId]',that.template).append("<option value='-1'>请选择</option>");
								$.each(citys,function(){
									var option = "<option value='"+this.id+"'>"+this.name+"</option>";
									$('select[name=cityId]',that.template).append(option);
								});
							}
						})
					});
					
					if(that.headInfo['provinceId'])
						$('select[name="provinceId"]',that.template).val(that.headInfo['provinceId']);
					
					var id = $('select[name=provinceId]',that.template).val();
					$.ajax({
						url:'common!city.action',
						data:{parentId:id},
						success:function(citys){
							$('select[name=cityId]',that.template).empty();
							$('select[name=cityId]',that.template).append("<option value='-1'>请选择</option>");
							$.each(citys,function(){
								var option = "<option value='"+this.id+"'>"+this.name+"</option>";
								$('select[name=cityId]',that.template).append(option);
							});
							
							if(that.headInfo['cityId'])
								$('select[name="cityId"]',that.template).val(that.headInfo['cityId']);
						}
					})
					
					
				}
			})
		}
		StorageCreate.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'仓库信息维护'}});
		}
	})(V.Classes['v.views.backoffice.maintenance.StorageCreate']);
},{plugins:["v.views.component.docketEdit","v.ui.dialog","v.component.form","v.ui.dynamicGrid","v.ui.pagination","v.fn.validator","v.ui.confirm",'v.ui.alert']})