/*
 * 接口管理--接口日志详情
 */
;V.registPlugin("v.views.tools.interfaceManage.interfaceLogDetail",function(){
    V.Classes.create({
        className:"v.views.tools.interfaceManage.InterfaceLogDetail",
        superClass:"v.Plugin",
        init:function(){
            this.ns = "v.views.tools.interfaceManage.interfaceLogDetail";
            this.module = '';
            this.list = new V.Classes['v.ui.Grid']();
            this.options={};
        }
    });
    (function(InterfaceLogDetailList){
        InterfaceLogDetailList.prototype.init = function(options){
        	this.module = options.module;
			this.container = options.container;
			for(prop in options){
			    this.options[prop] = options[prop];
			}
			var record = options.record;
			
            var list = this.list;
            var pagination = new V.Classes['v.ui.Pagination']();
            list.setPagination(pagination);
            list.setFilters({logId:record.id});
            var that = this;
            
            list.init({
                container:this.container,
                checkable:false,
                url:this.module+'/interface-log-detail!list.action',
                columns:[
                    {displayName:'状态',key:'levelset',width:80,render:function(record){
                    	if(record.status=='SUCCESS'){
                    		return '成功';
                    	}else{
                    		return '失败';
                    	}
                    }}
                    ,{displayName:'消息内容',key:'message',width:120}
                    ,{displayName:'更新日期',key:'updateTime',width:120}
                    ,{displayName:'操作',key:'action',width:80,render:function(record){
                        var html = $('<div class="action"><a class="view" href="javascript:void(0);" title="查看内容"><i class="icon-search"></i></a></div>');
                        $('.view',html).click(function(){
                            that.viewInterfaceLogContent(record);
                        });
                        return html;
                    }}
                ]
            });
        }
        InterfaceLogDetailList.prototype.viewInterfaceLogContent = function(record){
        	var dlg = new V.Classes['v.ui.Dialog']();
		    var con = $('<div></div>');
		    con.append(record.content);
		    dlg.setBtnsBar({
				btns:[
				   {text:'关闭',handler:function(){
						this.close();
					}}
			    ]
		    });
			dlg.setContent(con);
			dlg.init({
				title:'日志详情内容',
				width:700,
				height:350
			})
        }
        InterfaceLogDetailList.prototype.updateCrumb = function(){
            V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'接口日志详情'}});
        }
        InterfaceLogDetailList.prototype.addCrumb = function(){
            V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'接口日志详情'}});
        }
    })(V.Classes['v.views.tools.interfaceManage.InterfaceLogDetail'])
},{plugins:["v.ui.grid","v.ui.pagination"]});
