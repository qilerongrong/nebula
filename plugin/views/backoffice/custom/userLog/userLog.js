/*
 * 企业后台-业务消息
 */
;V.registPlugin("v.views.backoffice.custom.userLog",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.UserLog",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = "v.views.backoffice.custom.userLog";
			this.module = "";
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes["v.ui.Grid"]();
		}
	});
	(function(UserLogList){
		UserLogList.prototype.initConditionForm = function(){
		    var Form = V.Classes['v.component.Form'];
			var items = [
				       {label:'用户登录名',type:Form.TYPE.TEXT,name:'loginName',value:''},
//				       {label:'操作类型',type:Form.TYPE.SELECT,name:'operType',value:''},
					   {label:'登录时间',type:Form.TYPE.DATERANGE,name:'loginDate',value:V.Util.getDateRange()}
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
		
		UserLogList.prototype.initList = function(options){
			var that = this;
			var list = this.list;
			var filters = this.form.getValues();
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
            list.setFilters(filters);
            list.init({
                container:$('.list',this.template),
                checkable:false,
				url:this.module+'/ac-user-log!list.action',
                columns:[
                    {displayName:'登录名',key:'loginName',width:60},
                    {displayName:'计算机名称',key:'computerName',width:40},
                    {displayName:'登录IP',key:'computerIp',width:40},
                    {displayName:'记录时间',key:'actionTime',width:50},
                    {displayName:'操作类型',key:'type',align:'center',width:50,render:function(record){
                    	if(record.type == 1) {
                    		return "用户登录";
                    	}else if(record.type == 2){
                    		return "访问菜单";
                    	}else if(record.type == 3){
                    		return "用户操作数据";
                    	}else if(record.type == 4){
                    		return "用户注销";
                    	}else if(record.type == 5){
                    		return "删除数据";
                    	}else if(record.type == 6){
                    		return "新建数据";
                    	}
                    }},
                    {displayName:'操作描述',key:'content',width:120},
                    {displayName:'操作',key:'action',width:30,render:function(record){
                    	var html = $('<div class="action"><a class="change" href="javascript:void(0);" title="查看详情"><i class="icon-search"></i></a></div>');
                        $('.change',html).click(function(){
                            that.viewUserLog(record);
                        });
                        return html;
                    }}
                ],
                toolbar:[{eventId:'export',icon:'icon-export-excel',text:'导出用户日志'}]
            });
            this.subscribe(list,'export',this.exportUserLog);
            this.container.append(this.template);
        };
        
       UserLogList.prototype.exportUserLog = function(){
       		//加提示
			var pagination = this.list.pagination;
			if (pagination.options.count > 20000) {
				V.alert("导出的数据大于2万条，请修改查询条件。");
				return;
			}
			var form_print = $('.docket_export_form',this.template).empty();
			if(form_print.length==0){
			    form_print = $('<form action="'+this.module+'/ac-user-log!export.action" type="POST" class="docket_export_form" style="display:none"></form>');
			}
			$.each(this.list.filters,function(prop,val){
				var input = $('<input type="hidden" name="'+prop+'" value='+val+'>');
				form_print.append(input);
			});
			this.template.append(form_print);
			form_print[0].submit();
		}
        
        UserLogList.prototype.viewUserLog = function(record){
			var that = this;
			var titles="查看用户日志";
			/** Dialog* */
			var html = $('<div><div class="department docket"></div><div class="contentInfo" style="margin-top:10px;"></div></div>');
			var addDlg = new V.Classes['v.ui.Dialog']();
			var form = new V.Classes['v.component.Form']();
			addDlg.setBtnsBar({
				btns : [{
					text : "关闭",
					handler : addDlg.close
				}]
			});
			addDlg.init({
				title : titles,
				height : 462,
				width : 760
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
				name : 'loginName',
				label : '登录名',
				value : record['loginName']||'',
				type : V.Classes['v.component.Form'].TYPE.READONLY
			};
			var item3 = {
				name : 'computerName',
				label : '计算机名称',
				value : record['computerName']||'',
				type : V.Classes['v.component.Form'].TYPE.READONLY
			};
			var item4 = {
					name : 'computerIp',
					label : '登录IP',
					value : record['computerIp']||'',
					type : V.Classes['v.component.Form'].TYPE.READONLY
				};
			var item5 = {
					name : 'action',
					label : '操作',
					value : record['action']||'',
					type : V.Classes['v.component.Form'].TYPE.READONLY
				};
			var item6 = {
					name : 'actionTime',
					label : '操作日期',
					value : record['actionTime']||'',//V.Util.formatDate(new Date(record['actionTime']),'YYYY-DD-MM hh:mm:ss')||'',
					type : V.Classes['v.component.Form'].TYPE.READONLY
				};
			var item7 = {
					name : 'content',
					label : '操作详情',
					value : record['content']||'',
					type : V.Classes['v.component.Form'].TYPE.READONLY
				};
			items.push(item1);
			items.push(item2);
			items.push(item3);
			items.push(item4);
			items.push(item5);
			items.push(item6);
			items.push(item7);
			
			form.init({
				container : $('.department', html),
				items : items,
				colspan:2
			});
			if(record.contentInfo!=null){
				$('.contentInfo',html).append('<pre>'+'操作实体json内容：\n'+record.contentInfo+'</pre>');
			}
			addDlg.setContent(html);
		}
        
        UserLogList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'用户日志'}});
		}
	})(V.Classes['v.views.backoffice.custom.UserLog'])
},{plugins:["v.views.component.searchList","v.ui.grid","v.ui.dialog","v.ui.pagination",'v.ui.alert']});