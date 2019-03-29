;V.registPlugin("v.views.home.bussinessMessage",function(){
	V.Classes.create({
		className:"v.views.home.BussinessMessage",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = 'v.views.home.bussinessMessage';
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.Grid']();
			this.template = $('<div class="v-search"><div class="list_toolbar"></div><div class="filters"><div class="well form-search"></div></div><div class="list"></div></div>');
		}
	});
	(function(BussinessMessage){
		BussinessMessage.prototype.initConditionForm = function(){
			    var Form = V.Classes['v.component.Form'];
				var items = [
				       {label:'标题',type:Form.TYPE.TEXT,name:'title',value:''},
				       {label:'发送时间',type:Form.TYPE.DATERANGE,name:'sendDate',value:V.Util.getDateRange()}
				];
				this.form.init({
					title:'业务消息类表',
					colspan:2,
					items:items
				});
		}
		BussinessMessage.prototype.initList = function(){
			var that = this;
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
		    list.setPagination(pagination);
		    list.setFilters(this.form.getValues());
	    	var tools = [];
	    	tools.push({eventId:'remove',text:'批量删除业务消息',icon:'icon-remove'});
	    	list.addTools(tools);
			list.init({
				columns:[
				        {displayName:'消息标题',key:'title',width:220},
						{displayName:'发送日期',key:'sendDate',width:260},
						{displayName:'是否已读',key:'isProcess',width:60,render:function(record){
							if(record.isProcess==true)
								return '已读';
							else
								return '未读';	
						}},
						{displayName:'操作',key:'action',width:120,render:function(record){
							var html = $('<div class="action"><a class="view" href="javascript:void(0);" title="查看"><i class="icon-search"></i></a><a class="remove" href="javascript:void(0);" title="删除"><i class=" icon-remove"></i></a><div>');
	                        $('.view', html).click(function(){
								that.viewDetail(record);
							});
							$('.remove', html).click(function(){
								if(record.isRemoved=='0')
									that.remove(record);
								else
									V.alert("数据不能删除!");	
							});
							return html;
	                    }}
				],
				url: 'backoffice/console/bussinessinfo/user-business-info!list.action',
				hasData : true,
				checkable:true,
			});
			this.subscribe(list,'remove',this.removeSelected);
            $('.list_toolbar',this.template).css({'position':'static'});			
		}
		BussinessMessage.prototype.viewDetail = function(record){
			var options = {};
			options.module = this.module;
			options.noticeId =  record.noticeId;
			options.id =  record.id;
			options.isHaveAttach = record.isHaveAttach;
			options.code = record.id +','+ record.noticeId;
			this.forward('v.views.home.bussinessMessage.bussinessMessageDetail',options);
		}
		BussinessMessage.prototype.remove = function(record){
			var that = this;
			var info="是否删除？";
			V.confirm(info,function ok(e){
				var url = 'backoffice/console/bussinessinfo/user-business-info!delete.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
	               	data:{businessInfoId:record['id']},
	                success:function(data){
	                	if(data == 'success'){
	                		that.list.removeRecord(record);
	                		V.alert("删除成功!");
	                	}else{
	                		V.alert("删除失败!");
	                	}
	                }
	            })
			});
		}
		BussinessMessage.prototype.removeSelected = function(){
			var that = this;
			var rec = this.getSelectedIds();
			if(rec.length == 0 ){
				V.alert("请选择数据!");
				return;
			}
			V.confirm("批量删除业务消息?",function ok(e){
				var records = that.list.getCheckedRecords();
				var url = 'backoffice/console/bussinessinfo/user-business-info!deleteAll.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
					data:{businessInfoIds:rec.join(';')},
	                success:function(data){
	                	if(data == 'success'){
	                		that.list.refresh();
	                		V.alert("删除成功!");
	                	}else{
	                		V.alert("删除失败!");
	                	}
	                }
	            })
			});
		}
		BussinessMessage.prototype.getSelectedIds = function(){
			var records = this.list.getCheckedRecords();
			var rec = [];
			for(var i = 0;i<records.length;i++){
				var obj = records[i];
				if(obj.isRemoved=='0')
					rec.push(obj['id']);
			}
			return rec;
		}
		 
		BussinessMessage.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'业务消息'}});
		}
	})(V.Classes['v.views.home.BussinessMessage']);
},{plugins:['v.views.component.searchList','v.ui.dynamicGrid']});
