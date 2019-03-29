;V.registPlugin("v.views.backoffice.maintenance.storage",function(){
	V.Classes.create({
		className:"v.views.backoffice.maintenance.Storage",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = 'v.views.backoffice.maintenance.storage';
			this.module = '';
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.DynamicGrid']();
			var that=this;
		}
	});
	(function(Storage){
		Storage.prototype.initConditionForm = function(){
			    var Form = V.Classes['v.component.Form'];
				 
				var	items = [
	 			           {label:'地点名称',type:Form.TYPE.TEXT,name:'siteCode',value:'',colspan:1},
	 			           {label:'地点代码',type:Form.TYPE.TEXT,name:'siteName',value:'',colspan:1},
	 			           {label:'联系人',type:Form.TYPE.TEXT,name:'linkman',value:'',colspan:1}
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
		Storage.prototype.initList = function(){
			var list = this.list = new V.Classes['v.ui.Grid']();
				var pagination = new V.Classes['v.ui.Pagination']();
				list.setPagination(pagination);
	            var that = this;
	            
	            var tools = [];
	            tools.push({eventId:'add',text:'新建',icon:'icon-plus'});
	            //tools.push({eventId:'del',text:'删除选择',icon:'icon-remove'});
	            list.addTools(tools);
	            this.subscribe(list,'add',this.createOrEditStorage);
	            //this.subscribe(list,'del',this.removeStorageBatch);
	            
	            list.init({
	                container:$('.list',this.template),
	                checkable:false,
					url:this.module+'/whinfo!list.action',
	                columns:[
	                    {displayName:'地点代码',key:'siteCode',width:120}
	                    ,{displayName:'地点名称',key:'siteName',width:120}
	                   // ,{displayName:'库位代码',key:'brandCode',width:120}
	                    //,{displayName:'库位名称',key:'brandName',width:120}
	                    ,{displayName:'地址',key:'address',width:120}
	                    ,{displayName:'联系人',key:'linkman',width:120}
	                    ,{displayName:'电话',key:'tel',width:120}
	                    ,{displayName:'仓库人数',key:'peopleNumber',width:120}
	                   // ,{displayName:'单位装卸能力',key:'peopleAbility',width:120}
	                    //,{displayName:'机械数量',key:'machineNumber',width:120}
	                    //,{displayName:'单位机械折合人力',key:'machineAbility',width:120}
	                   // ,{displayName:'最大装卸能力',key:'fullAbility',width:120}
	                   // ,{displayName:'警戒装卸能力',key:'partAbility',width:120}
	                    //,{displayName:'已用装卸能力',key:'usedAbility',width:120}
	                   // ,{displayName:'收货时间',key:'workTime',width:120}
	                    ,{displayName:'审核模式',key:'checkMode',width:120}
	                    ,{displayName:'是否有月台',key:'hasPlatForm',width:120}
	                    ,{displayName:'记租面积',key:'areaSize',width:120}
	                    ,{displayName:'租金单价',key:'areaPrice',width:120}
	                    
	                    ,{displayName:'操作',key:'action',width:120,render:function(record){
	                        var html = $('<div class="action"><a class="editAddItems" href="javascript:void(0);" title="修改"><i class=" icon-edit"></i></a><a class="removeAddItems" href="javascript:void(0);" title="删除"><i class=" icon-remove"></i></a><div>');
							$('.editAddItems', html).click(function(){
								 that.createOrEditStorage(record);
							});
							$('.removeAddItems', html).click(function(){
								 that.removeStorage(record);
							});
						
							return html;
	                    }}
	                ]
	            });
	            this.container.append(this.template);
		}
		
		Storage.prototype.createOrEditStorage = function(record){
			var options = {};
			options.module = this.module;
			options.container = this.container;
			options.headInfo = record;
			//debugger;
			this.forward('v.views.backoffice.maintenance.storageCreate',options);
		}
		
		//删除仓库信息
		
		Storage.prototype.removeStorage = function(record){
			var that = this;
			var id = record['id'];
			
			V.confirm('是否删除仓库信息？',function(){
				$.ajax({
					url:that.module+'/whinfo!delete.action',
					type:'post',
					data:{id:id},
					success:function(data){
						if(data == 'success'){
			              	V.alert("仓库信息删除成功!");
			              	that.list.removeRecord(record);
			             }else{
			                V.alert(data);
		                 }
					}
				})
			});
		}
		
		//批量删除仓库信息
		Storage.prototype.removeStorageBatch = function(){
			var rec = this.getSelectedIds();
			if(rec.length == 0 ){
				V.alert("请选择数据!");
				return;
			}
			V.confirm("批量删除仓库信息?",function ok(e){
				var that = this;
				var records = this.list.getCheckedRecords();
				
				var url = this.module+'/whinfo!deleteAll.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
					data:{poIds:rec.join(',')},
	                success:function(data){
	                	if(data == 'success'){
	                		that.list.refresh();
	                		V.alert("删除成功!");
	                	}else{
	                		V.alert(data);
	                	}
	                }
	            })
			});
			
		}
		Storage.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'仓库维护'}});
		}
		Storage.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'仓库维护'}});
		}
	})(V.Classes['v.views.backoffice.maintenance.Storage']);
},{plugins:['v.views.component.searchList','v.ui.dynamicGrid','v.ui.confirm','v.ui.alert']});