;V.registPlugin("v.views.backoffice.quartz.quartzList",function(){
	V.Classes.create({
		className:"v.views.backoffice.quartz.QuartzList",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = "v.views.backoffice.quartz.quartzList";
			this.module = '';
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.Grid']();
		}
	});
	(function(QuartzList){
//		QuartzList.prototype.initConditionForm = function(){
//			    var Form = V.Classes['v.component.Form'];
//				var items = [
//					       {label:'清单号',type:Form.TYPE.TEXT,name:'matchCode',value:''}
//					       ,{label:'匹配时间',type:Form.TYPE.DATERANGE,name:'matchDate',value:['',''],colspan:2}
//						   ,{label:'购方纳税人识别号',type:Form.TYPE.TEXT,name:'buytaxno',value:''}
//					];
//					var isBuyer = (LoginInfo.user.businessRole == LoginInfo.businessRole.ENTERPRISE);
//					if(isBuyer){
//						items.push({label:'销方纳税人识别号',type:Form.TYPE.TEXT,name:'selltaxno',value:''});
//					}
//				var filters = this.options.filters;
//				if(filters){
//					$.each(items,function(m,item){
//						var key = this.name;
//						if(item.type == Form.TYPE.PLUGIN){
//							var key_code = '';
//							var key_name = '';
//							$.each(filters,function(k,v){
//								if((key+'Code') == k){key_code = v;}
//								if((key+'Name') == k){key_name = v;}
//							})
//						item.value = key_code +'('+ key_name+')';
//						}
//						else if(item.type == Form.TYPE.DATERANGE){
//                            $.each(filters,function(k,v){
//                                if(key == k){item.value = v.split(',');return false;}
//                            })
//                        }
//						else{
//							$.each(filters,function(k,v){
//								if(key == k){item.value = v;return false;}
//							})
//						}
//					});
//				}
//				this.form.init({
//					colspan:3,
//					items:items
//				});
//		};
		//后台定制
		QuartzList.prototype.initList = function(){
			    var list = this.list;
//				var pagination = new V.Classes['v.ui.Pagination']();
//				list.setPagination(pagination);
				list.setFilters(this.options.filters);
	            var that = this;
	            list.init({
					container:$('.list',this.template),
					url:this.module+'/quartz!list.action',
					checkable:true,
	                columns:[
				        {displayName:'trigger_name',key:'trigger_name'},
				        {displayName:'display_name',key:'display_name'},
				        {displayName:'next_fire_time',key:'next_fire_time'},
				        {displayName:'prev_fire_time',key:'prev_fire_time'},
				        {displayName:'start_time',key:'start_time'},
				        {displayName:'end_time',key:'end_time'},
				        {displayName:'triggerState',key:'triggerState'},
					],
					toolbar:[
                          {eventId:'add',text:'增加',icon:'icon-plus'},{eventId:'autodatain',text:'自动执行单据',icon:'icon-go'},{eventId:'autodatainorder',text:'自动执行订单',icon:'icon-go'}
                    ]
	            });
	            
	            
				this.subscribe(list,'add',this.add);
				this.subscribe(list,'autodatain',this.autodatain);
				this.subscribe(list,'autodatainorder',this.autodatainorder);
				
		}
		
		QuartzList.prototype.autodatain = function(){
			var that = this;
			V.confirm('确认立即执行同步单据数据吗？',function(){
			
						$.ajax({
						 	url:that.module+'/autoDataIn.action',
							
							success:function(data){
								
							}
						});
						
			})
			
			
		}
		
		QuartzList.prototype.autodatainorder = function(){
			var that = this;
			V.confirm('确认立即同步订单数据吗？',function(){
			
						$.ajax({
						 	url:that.module+'/autoDataInOrder.action',
							
							success:function(data){
								
							}
						});
						
			})
			
			
		}
		
		
		QuartzList.prototype.viewMatch = function(record){
			var opt = {
				module:this.module,
				matchId:record.id
			}
			this.forward('v.views.backoffice.quartz.match',opt);
		}
		QuartzList.prototype.add = function(){
			var that = this;
			var addDlg = new V.Classes['v.ui.Dialog'](); 
			addDlg.setBtnsBar({
				btns:[{
					text:"确定",
					style:"btn-primary",
					handler:function(){ 
						var json = addfrom.getValues();
						var data = {};
						data.triggerName = json.triggerName;
						data.triggerGroup = json.triggerGroup;
						data.repeatCount = json.repeatCount;
						data.repeatInterval = json.repeatInterval;
						V.ajax({
						 	url:that.module+'/quartz!save.action',
							data:{
								trigger:data,
								startTime:json.startTime,
								endTime:json.endTime
							},
							success:function(data){
								if(data=='success'){
									V.alert("保存成功！");
									that.list.refresh();
									addDlg.close(); 
								}else if(data=="error"){
									V.alert("保存失败！");
								}
							}
						});
					}},{
						text:"取消",handler:addDlg.close
					}]
			}); 
			addDlg.init({title:'增加定时任务',height:300,width:660}); 
			
			var Form = V.Classes['v.component.Form'];
			var addfrom = new V.Classes["v.component.Form"]();
			var items = [
				       {label:'任务名称',type:Form.TYPE.TEXT,name:'triggerName',value:''}
					   ,{label:'任务分组',type:Form.TYPE.TEXT,name:'triggerGroup',value:''}
					   ,{label:'开始时间',type:Form.TYPE.DATE,name:'startTime',value:''}
					   ,{label:'结束时间',type:Form.TYPE.DATE,name:'endTime',value:''}
					   ,{label:'重复次数',type:Form.TYPE.NUMBER,name:'repeatCount',value:''}
					   ,{label:'间隔时间',type:Form.TYPE.NUMBER,name:'repeatInterval',value:''}
				];
			var filters = this.options.filters;
			addfrom.init({
				container:addDlg.getContent(),
				colspan:2,
				items:items
			});
			
			
			
			/**将Grid中的数据加入到Dialog中**/ 
			//addDlg.setContent(addfrom.template);
		}
		QuartzList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'定时任务控制台查询'}});
		}
		QuartzList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'定时任务控制台查询'}});
		}
	})(V.Classes['v.views.backoffice.quartz.QuartzList'])
},{plugins:["v.ui.grid","v.ui.dialog","v.views.component.searchList","v.ui.pagination","v.component.form","v.ui.alert"]});
