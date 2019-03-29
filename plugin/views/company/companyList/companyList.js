;V.registPlugin("v.views.company.companyList",function(){
	V.Classes.create({
		className:"v.views.company.CompanyList",
		superClass:"v.views.commonDocket.CommonDocketList",
		init:function(){
            this.ns = 'v.views.company.companyList';
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
				width: 80,
				render: function(record){
					var html = $('<div class="action"><a class="view" href="javascript:void(0);" title="查询"><i class="icon-search"></i></a><a class="edit" href="javascript:void(0);" title="编辑"><i class="icon-edit"></i></a><a class="remove" href="javascript:void(0);" title="删除"><i class="icon-remove"></i></a><div>');
					$('.view', html).click(function(){
						that.viewDetail(record);
					});
					$('.edit', html).click(function(){
						that.edit(record);
					});
					$('.remove', html).click(function(){
						that.remove(record);
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
		    	tools.push({eventId:'add',text:"新增",icon:'icon-plus'});
		    	//tools.push({eventId:'import',text:'导入',icon:'icon-upload'});
		    	//tools.push({eventId:'remove',text:'批量删除',icon:'icon-remove'});
		    	list.addTools(tools);
		    });
		    
			list.init({
				url: this.module+'/company!init.action',
				hasData : true,
				sortable:false,
				checkable:false
			});
			this.subscribe(list,'add',this.add);
			//this.subscribe(list,'import',this.importStation);
			//this.subscribe(list,'remove',this.removeSelected);
		}
		
		//导入
//		List.prototype.importStation = function(){
//			var　that = this;
//			var uploader = new V.Classes['v.component.FileUpload']();
//			var params = {};
//			
//			uploader.init({
//				title:"上传文件",
//				uploadSetting:{
//					url:this.module+'/ship-fee!importArea.action',
//					params:params,
//					uploadComplete:function(){
//						 that.list.refresh();
//					}
//				}
//			});
//		}
		
		//添加
        List.prototype.add = function(){
			var options = this.options;
			options.module = this.module;
			options.hasDetail = this.list.hasDetail;
			delete options.docketId;
			this.forward('v.views.company.companyEdit',options,function(inst){
				inst.addCrumb();
			});
		}
	
		List.prototype.viewDetail = function(record) {
			var options = this.options;
			options.module = this.module;
			options.record =  record;
			options.docketId = record.id;
			options.id=record.id;
			options.hasDetail = this.list.hasDetail;
			this.forward('v.views.company.companyView',options,function(inst){
				inst.addCrumb();
			});
		}
		
		//编辑
		List.prototype.edit = function(record) {
			var options = this.options;
			options.module = this.module;
			options.record =  record;
			options.docketId = record.id;
			options.id=record.id;
			options.hasDetail = this.list.hasDetail;
			this.forward('v.views.company.companyEdit',options,function(inst){
				inst.addCrumb();
			});
		}
		
		/**删除**/
		List.prototype.remove = function(record){
			var that = this;
			var info="是否删除？";
			V.confirm(info,function ok(e){
				var url = that.module+'/company!delete.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
	               	data:{ids:record['id'],docketType:that.options.variables.docketType},
	                success:function(data){
	                	if(data.result){
	                		that.list.removeRecord(record);
	                		V.alert("删除成功！");
	                	}else{
	                		V.alert("删除失败！");
	                	}
	                }
	            })
			});
		}
		
		
		List.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:"运输单查询"}});
		}
		List.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:"运输单查询"}});
		}
	})(V.Classes['v.views.company.CompanyList']);
},{plugins:['v.views.commonDocket.commonDocketList','v.ui.dynamicGrid','v.ui.confirm','v.ui.alert','v.component.fileUpload']});