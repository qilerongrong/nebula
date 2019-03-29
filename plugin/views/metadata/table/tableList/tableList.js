;V.registPlugin("v.views.metadata.table.tableList",function(){
	V.Classes.create({
		className:"v.views.metadata.table.TableList",
		superClass:"v.views.commonDocket.CommonDocketList",
		init:function(){
            this.ns = 'v.views.metadata.table.tableList';
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
					var html = $('<div class="action"><a class="remove" href="javascript:void(0);" title="删除"><i class="icon-remove"></i></a><a class="edit" href="javascript:void(0);" title="编辑"><i class="icon-edit"></i></a><a class="fetch" href="javascript:void(0);" title="生成java对象"><i class="icon-refresh"></i></a><div>');
					
					$('.remove', html).click(function(){
						that.remove(record);
					});
					$('.edit', html).click(function(){
						that.editDetail(record);
					});
					$('.fetch', html).click(function(){
						that.fetchDetail(record);
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
		    	list.addTools(tools);
		    });
		    
			list.init({
				url: V.contextPath+this.module+'/m-table!init.action',
				hasData : true,
				sortable:false,
				checkable:false
			});
			this.subscribe(list,'add',this.add);
		}
		List.prototype.editDetail = function(record){
			var options = this.options;
			options.module = this.module;
			options.record =  record;
			options.code =  record.docketCode;
			options.docketId = record.id;
			options.hasDetail = this.list.hasDetail;
			this.forward('v.views.metadata.table.tableEdit',options,function(inst){
				inst.addCrumb();
			});
		}
		List.prototype.add = function(){
			var options = this.options;
			options.module = this.module;
			options.hasDetail = this.list.hasDetail;
			delete options.docketId;
			this.forward('v.views.metadata.table.tableEdit',options,function(inst){
				inst.addCrumb();
			});
		}
		List.prototype.fetchDetail = function(record) {
			var that = this;
			var info="是否确认生成java对象？";
			V.confirm(info,function ok(e){
				var url = V.contextPath+that.module+'/m-table!fetchData.action';
	            V.ajax({
	            	url:url,
	               	type:'POST',
	               	data:{docketId:record.id},
	                success:function(data){
	                	if(data&&data.result == 'success'){
	                		V.alert("生成java对象成功！");
	                	}else{
	                		V.alert("生成java对象失败！");
	                	}
	                }
	            })
			});
		}
		List.prototype.remove = function(record){
			var that = this;
			var info="是否删除";
			V.confirm(info,function ok(e){
				var url = V.contextPath+that.module+'/m-table!deleteEntityAndDescendant.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
	               	data:{ids:record['id'],docketType:that.options.variables.docketType},
	                success:function(data){
	                	if(data == 'success'){
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
		List.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:"表管理"}});
		}
		List.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:"表管理"}});
		}
	})(V.Classes['v.views.metadata.table.TableList']);
},{plugins:['v.views.commonDocket.commonDocketList','v.ui.dynamicGrid','v.ui.confirm','v.ui.alert']});
