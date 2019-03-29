;V.registPlugin("v.views.home.systemMessage",function(){
	V.Classes.create({
		className:"v.views.home.SystemMessage",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = 'v.views.home.systemMessage';
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.Grid']();
			this.template = $('<div class="v-search"><div class="list_toolbar"></div><div class="filters"><div class="well form-search"></div></div><div class="list"></div></div>');
		}
	});
	(function(SystemMessage){
		SystemMessage.prototype.initConditionForm = function(){
			    var Form = V.Classes['v.component.Form'];
				var items = [
				       {label:this.getLang("BIN_TITLE"),type:Form.TYPE.TEXT,name:'title',value:''},
				       {label:this.getLang("BIN_SEND_TIME"),type:Form.TYPE.DATERANGE,name:'sendDate',value:V.Util.getDateRange()}
				];
				this.form.init({
					colspan:2,
					items:items
				});
		}
		SystemMessage.prototype.initList = function(){
			var that = this;
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
		    list.setPagination(pagination);
		    list.setFilters(this.form.getValues());
	    	var tools = [];
	    	//tools.push({eventId:'remove',text:'批量删除通知',icon:'icon-remove'});
	    	list.addTools(tools);
			list.init({
				columns:[
						{displayName:that.getLang("BIN_TITLE"),key:'title',width:260},
						{displayName:that.getLang("LABEL_SENDER"),key:'sendName',width:120},
						{displayName:that.getLang("BIN_SEND_TIME"),key:'sendDate',width:100},
						{displayName:that.getLang("LABEL_IS_DELETE"),key:'isRemoved',width:160,isShow:false},
						{displayName:that.getLang("LABEL_IS_READ"),key:'isRead',width:60,render:function(record){
							if(record.isRead==true)
								return that.getLang("BIN_READED");
							else
								return that.getLang("BIN_NOT_READ");	
						}},
						{displayName:'id',key:'id',width:160,isShow:false},
						{displayName:that.getLang("BIN_ACTION"),key:'action',width:120,render:function(record){
							var html='';
							if(record.isHaveAttach==true){
		                       html = $('<div class="action"><a class="view" href="javascript:void(0);" title='+that.getLang("BIN_QUERY")+'><i class="icon-search"></i></a><a class="download" href="javascript:void(0);" title="下载"><i class="icon-download"></i></a><div>');
							}else{
		                        html = $('<div class="action"><a class="view" href="javascript:void(0);" title='+that.getLang("BIN_QUERY")+'><i class="icon-search"></i></a><div>');
							}
							//<a class="remove" href="javascript:void(0);" title="删除"><i class=" icon-remove"></i></a>
	                        $('.view', html).click(function(){
								that.viewDetail(record);
							});
							$('.remove', html).click(function(){
								if(record.isRemoved=='0')
									that.remove(record);
								else
									V.alert(that.getLang("MSG_DATA_DELETE"));	
							});
							$('.download',html).click(function(){
							 	that.download(record);
							 })
							return html;
	                    }}
				],
				url: 'backoffice/console/systeminfo/user-notice!list.action',
				hasData : true,
				checkable:true,
			});
			this.subscribe(list,'remove',this.removeSelected);
            $('.list_toolbar',this.template).css({'position':'static'});			
		}
		SystemMessage.prototype.viewDetail = function(record){
			var options = {};
			options.module = this.module;
			options.noticeId =  record.noticeId;
			options.id =  record.id;
			options.isHaveAttach = record.isHaveAttach;
			options.code = record.id +','+ record.noticeId;
			this.forward('v.views.home.systemMessage.systemMessageDetail',options);
		}
		//附件下载
		SystemMessage.prototype.download = function(record){
			var that = this;
			var info=this.getLang("MSG_CONFIRM_DOWNLOAD");
			V.confirm(info,function ok(e){
				window.location.href="backoffice/console/systeminfo/user-notice!downLoadAttchment.action?noticeId="+record['noticeId'];
			});
		}
		SystemMessage.prototype.remove = function(record){
			var that = this;
			var info=this.getLang("BIN_CONFIRM_DELETE");
			V.confirm(info,function ok(e){
				var url = 'backoffice/console/systeminfo/user-notice!delete.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
	               	data:{userNoticeId:record['id']},
	                success:function(data){
	                	if(data == 'success'){
	                		that.list.removeRecord(record);
	                		V.alert("success!");
	                	}else{
	                		V.alert("fail!");
	                	}
	                }
	            })
			});
		}
		SystemMessage.prototype.removeSelected = function(){
			var that = this;
			var rec = this.getSelectedIds();
			if(rec.length == 0 ){
				V.alert(this.getLang("BIN_SELECT_DATA"));
				return;
			}
			V.confirm(this.getLang("BIN_BATCH_DELETE"),function ok(e){
				var records = that.list.getCheckedRecords();
				var url = 'backoffice/console/systeminfo/user-notice!deleteAll.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
					data:{userNoticeIds:rec.join(';')},
	                success:function(data){
	                	if(data == 'success'){
	                		that.list.refresh();
	                		V.alert("success");
	                	}else{
	                		V.alert("fail");
	                	}
	                }
	            })
			});
		}
		SystemMessage.prototype.getSelectedIds = function(){
			var records = this.list.getCheckedRecords();
			var rec = [];
			for(var i = 0;i<records.length;i++){
				var obj = records[i];
				if(obj.isRemoved=='0')
					rec.push(obj['id']);
			}
			return rec;
		}
		 
		SystemMessage.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("BIN_SYSTEM_NOTICE")}});
		}
	})(V.Classes['v.views.home.SystemMessage']);
},{plugins:['v.views.component.searchList','v.ui.dynamicGrid']});
