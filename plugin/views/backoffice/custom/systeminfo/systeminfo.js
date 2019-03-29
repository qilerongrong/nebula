/*
 * 企业后台-系统通知
 */
;V.registPlugin("v.views.backoffice.custom.systeminfo",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.Systeminfo",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = "v.views.backoffice.custom.systeminfo";
			this.module = "";
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes["v.ui.Grid"]();
		}
	});
	(function(NoticeList){
		NoticeList.prototype.initConditionForm = function(){
		    var Form = V.Classes['v.component.Form'];
			var items = [
				       {label:this.getLang("BIN_TITLE"),type:Form.TYPE.TEXT,name:'title',value:''},
					   {label:this.getLang("BIN_SEND_DATE"),type:Form.TYPE.DATERANGE,name:'sendDate',value:V.Util.getDateRange()}
				];
			var itemsFilters = this.options.itemsFilters;
            if(itemsFilters){
                $.each(items,function(m,item){
                	var key = item.plugin||item.name;
                	item.value = itemsFilters[key]||'';
                });
            }
			this.form.init({
				colspan:2,
				items:items
			});
		};
		
		NoticeList.prototype.initList = function(options){
			var that = this;
			var list = this.list;
			var filters = this.form.getValues();
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
            list.setFilters(filters);
            list.init({
                container:$('.list',this.template),
                checkable:false,
				url:that.module+'/notice!list.action',
                columns:[
                    {displayName:that.getLang("BIN_TITLE"),key:'title',width:220}
                    ,{displayName:that.getLang("BIN_STATUS"),key:'status',width:40,render:function(record){
                    	if(record.status==0){
                    		return that.getLang("TIP_TEMP");
                    	}else{
                    		return that.getLang("TIP_SEND");
                    	}
                    }}
                    ,{displayName:that.getLang("LABEL_FORCE_READ"),key:'isCoercion',width:40,render:function(record){
                    	if(record.isCoercion){
                    		return that.getLang("LABEL_YES");
                    	}else{
                    		return that.getLang("LABEL_NO");
                    	}
                    }}
                    ,{displayName:that.getLang("BIN_SEND_DATE"),key:'sendDate',width:40}
                    ,{displayName:that.getLang("TIP_ACTION"),key:'action',width:50,render:function(record){
                    	var html = $('<div class="action"><a class="view" href="javascript:void(0);" title='+that.getLang("TIP_VIEW")+'><i class="icon-search"></i></a></div>');
                    	$('.view',html).click(function(){
                    		that.viewNotice(record);
                    	});
                    	var edit = $('<a class="change" href="javascript:void(0);" title='+that.getLang("TIP_EDIT")+'><i class="icon-edit"></i></a>');
                    	edit.click(function(){
                        	that.editNotice(record);
                        });
                    	var remove = $('<a class="remove" href="javascript:void(0);" title='+that.getLang("TIO_DELETE")+'><i class="icon-remove"></i></a>');
                    	remove.click(function(){
                        	that.removeNotice(record);
                        });
                    	if(record.status == 0){
                    		html.append(edit).append(remove);
                    	}
                    	return html;
                    }}
                ],
                toolbar:[
			          {eventId:'add',text:this.getLang("TIP_CREATE"),icon:'icon-plus'}
				]
            });
            this.subscribe(list,'add',this.addNotice);
			//this.subscribe(list,'remove',this.removeNotices);
            this.container.append(this.template);
        };
        NoticeList.prototype.viewNotice = function(notice){
        	var options = {};
        	options.module = this.options.module;
        	options.notice = notice;
        	this.forward("v.views.backoffice.custom.noticeView",options,function(plugin){
        		plugin.addCrumb();
        	});
        }
        NoticeList.prototype.removeNotice = function(record){
        	var that = this;
        	V.confirm(this.getLang("CONFIRM_DELETE"),function(){
				$.ajax({
	            	url:that.module+'/notice!delete.action',
	               	type:'post',
					data:{noticeId:record.id},
	                success:function(data){
	                     if(data == 'success'){
	                     	 V.alert(that.getLang("ALTER_SUCCESS"));
	                     	 that.list.removeRecord(record);
	                     }else{
	                     	V.alert(data);
	                     }
	                }
	            })
	        });    
        }
        
        NoticeList.prototype.editNotice = function(notice){
        	var options = {};
        	options.module = this.options.module;
        	options.notice = notice;
        	this.forward("v.views.backoffice.custom.notice",options,function(plugin){
        		plugin.addCrumb();
        	});
        }
        NoticeList.prototype.addNotice = function(){
        	var options = {};
        	options.module = this.options.module;
        	options.notice = null;
        	this.forward("v.views.backoffice.custom.notice",options,function(plugin){
        		plugin.addCrumb();
        	});
        }
        NoticeList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("TIP_SYSTEM_NOTICE")}});
		}
        NoticeList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("TIP_SYSTEM_NOTICE")}});
		}
	})(V.Classes['v.views.backoffice.custom.Systeminfo'])
},{plugins:["v.views.component.searchList","v.ui.grid","v.ui.dialog","v.ui.pagination",'v.ui.alert']});