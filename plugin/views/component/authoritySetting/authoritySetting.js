;V.registPlugin("v.views.component.authoritySetting",function(){
	V.Classes.create({
		className:"v.views.component.AuthoritySetting",
		superClass:"v.Plugin",
		init: function(){
			this.config = null,
			this.data = {
			    instance:'',
			    id:'',
			    roleId:'',
			    module:'',
			    action:''
			},
			this.ns = 'v.views.component.authoritySetting';
			this.resource = {
				html1:'template.html'
			}
			this.EVENT = {
			    AUTHORITY_EDIT:'authority_edit',
			    AUTHORITY_EDIT_PARTNER:'authority_edit_partner'
			}
			this.showTab = 'menu';
			this.template = $('<div></div>');
			this.menuList;
			this.consoleList;
			this.reportList;
			this.messageList;
		}
	});
	(function(Authority){
		Authority.prototype.init = function(options){
			this.data = options;
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html1;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template.append(dom);
					that.initEvent();
					that.initMenu();
					that.initConsole();
					that.initReport();
					that.initMessage();
				}
		     });
		}
		Authority.prototype.initEvent = function(){
			var that = this;
			$('.myTab a:first',this.template).tab('show');
			$('.myTab a',this.template).click(function (e){
				e.preventDefault();
				$(this).tab('show');
				if($(this).attr('href')=="#menu"){
					$('.tabconsole',that.template).hide();
					$('.tabreport',that.template).hide();
					$('.tabmenu',that.template).show();
					$('.tabmessage',that.template).hide();
					that.showTab = 'menu';
				}else if($(this).attr('href')=="#console"){
					$('.tabconsole',that.template).show();
					$('.tabreport',that.template).hide();
					$('.tabmenu',that.template).hide();
					$('.tabmessage',that.template).hide();
					that.showTab = 'console';
				}else if($(this).attr('href')=="#report"){
			 		$('.tabconsole',that.template).hide();
					$('.tabreport',that.template).show();
					$('.tabmenu',that.template).hide();
					$('.tabmessage',that.template).hide();
					that.showTab = 'report';
			 	}else{
			 		$('.tabconsole',that.template).hide();
					$('.tabreport',that.template).hide();
					$('.tabmenu',that.template).hide();
					$('.tabmessage',that.template).show();
					that.showTab = 'message';
			 	}
			});
			
			$('.edit_authority',this.template).click(function(){
            	if(that.showTab == 'menu'){
			        that.addMenu();
			    }else if(that.showTab == 'console'){
			        that.addConsole();
			    }else if (that.showTab=='report'){
			        that.addReport();
			    }else{
			    	that.addMessage();
			    }
	        });
	        $('.edit_authority_save',this.template).click(function(){
	            if(that.showTab == 'menu'){
			        that.saveMenuRange();
			    }else if(that.showTab == 'console'){
			        that.saveConsoleRange();
			    }else if (that.showTab=='report'){
			        that.saveReportRange();
			    }else{
			    	that.saveMessageRange();
			    }
	        });
	        if(that.data.businessRole==CONSTANT.BUSINESS_ROLE.SUPPLIER || that.data.businessRole==CONSTANT.BUSINESS_ROLE.CUSTOMER){ //销方,经销保存控制
	        	$('.edit_authority_save',this.template).show();
	        }else{
	        	$('.edit_authority_save',this.template).hide();
	        }
		}
		Authority.prototype.initMenu = function(){
			var that = this;
			var container = $('.tabmenu',this.template).empty();
			var grid = this.menuList = new V.Classes['v.ui.Grid']();
			grid.setFilters({
				id:that.data.id,
				roleId:that.data.roleId,
				type:'Y',
				menuType:that.data.menuType,
				partyVersion:that.data.partyVersion,
				businessRole:that.data.businessRole,
				platformNo:that.data.platformNo
			});
			var columns = [];
            if(that.data.businessRole==CONSTANT.BUSINESS_ROLE.SUPPLIER || that.data.businessRole==CONSTANT.BUSINESS_ROLE.CUSTOMER){
            	columns.push({displayName:'默认分配',key:'defaultSelect',width:120,render:function(record){
            			if(record.menuLevel==3){
							var html = $('<input type="checkbox"></input>');
							if(record.defaultSelect==CONSTANT.AUTH_DEFAULT.AUTH_DEFAULT_SELECTED){
								html.attr('checked','checked');
							}
							html.click(function(){
								if(html.attr('checked')=='checked'){
									record.defaultSelect = CONSTANT.AUTH_DEFAULT.AUTH_DEFAULT_SELECTED; //select
								}else{
									record.defaultSelect = CONSTANT.AUTH_DEFAULT.AUTH_DEFAULT_UNSELECT; //no select
								}
							})
							return html;
            			}else{
            				return "<span></span>";
            			}
					}})
            }
            columns.push({displayName:'菜单编码',key:'menuCode',width:320});
            columns.push({displayName:'菜单名称',key:'menuName',width:320});
			grid.init({
				checkable:false,
				container:container,
				url:that.data.module+'/'+that.data.action+'!menuList.action',
				columns:columns
			});
		}
		Authority.prototype.initConsole = function(){
			var that = this;
			var container = $('.tabconsole',this.template).empty();
			var grid = this.consoleList = new V.Classes['v.ui.Grid']();
			grid.setFilters({
				id:that.data.id,
				roleId:that.data.roleId,
				flag:"list",
				homeType:that.data.homeType,
				partyVersion:that.data.partyVersion,
				businessRole:that.data.businessRole,
				platformNo:that.data.platformNo
			});
			var columns = [];
            if(that.data.businessRole==CONSTANT.BUSINESS_ROLE.SUPPLIER || that.data.businessRole==CONSTANT.BUSINESS_ROLE.CUSTOMER){
            	columns.push({displayName:'默认分配',key:'defaultSelect',width:120,render:function(record){
						var html = $('<input type="checkbox"></input>');
						if(record.defaultSelect==CONSTANT.AUTH_DEFAULT.AUTH_DEFAULT_SELECTED){
							html.attr('checked','checked');
						}
						html.click(function(){
							if(html.attr('checked')=='checked'){
								record.defaultSelect = CONSTANT.AUTH_DEFAULT.AUTH_DEFAULT_SELECTED; //select
							}else{
								record.defaultSelect = CONSTANT.AUTH_DEFAULT.AUTH_DEFAULT_UNSELECT; //no select
							}
						})
						return html;
					}})
            }
            columns.push({displayName:'名称',key:'homeName',width:320});
//            columns.push({displayName:'类型',key:'homeType',width:320,render:function(record){
//            	return CONSTANT.B2B.HOME_TYPE.VALUE[record.homeType];
//            }});
			grid.init({
				container:container,
				url:that.data.module+'/'+that.data.action+'!listHomecmts.action',
				columns:columns
			});
		}
		Authority.prototype.initReport = function(){
			var that = this;
            var container = $('.tabreport',this.template).empty();
            var grid = this.reportList = new V.Classes['v.ui.Grid']();
            grid.setFilters({
            	id:that.data.id,
            	roleId:that.data.roleId,
            	partyVersion:that.data.partyVersion,
				businessRole:that.data.businessRole,
				platformNo:that.data.platformNo
            });
            var columns = [];
            if(that.data.businessRole==CONSTANT.BUSINESS_ROLE.SUPPLIER || that.data.businessRole==CONSTANT.BUSINESS_ROLE.CUSTOMER){
            	columns.push({displayName:'默认分配',key:'defaultSelect',width:120,render:function(record){
						var html = $('<input type="checkbox"></input>');
						if(record.props.defaultSelect==CONSTANT.AUTH_DEFAULT.AUTH_DEFAULT_SELECTED){
							html.attr('checked','checked');
						}
						html.click(function(){
							if(html.attr('checked')=='checked'){
								record.props.defaultSelect = CONSTANT.AUTH_DEFAULT.AUTH_DEFAULT_SELECTED; //select
							}else{
								record.props.defaultSelect = CONSTANT.AUTH_DEFAULT.AUTH_DEFAULT_UNSELECT; //no select
							}
						})
						return html;
					}})
            }
            columns.push({displayName:'名称',key:'reportTitle',width:320});
            columns.push({displayName:'类型',key:'reportTypeName',width:320});
            grid.init({
                container:container,
                url:that.data.module+'/'+that.data.action+'!listReport.action?roleId='+that.data.roleId,
                columns:columns
            });
		}
		Authority.prototype.initMessage = function(){
			var that = this;
            var container = $('.tabmessage',this.template).empty();
            var grid = this.messageList = new V.Classes['v.ui.Grid']();
            grid.setFilters({
            	id:that.data.id,
            	roleId:that.data.roleId,
            	partyVersion:that.data.partyVersion,
				businessRole:that.data.businessRole,
				platformNo:that.data.platformNo
            });
            var columns = [];
            if(that.data.businessRole==CONSTANT.BUSINESS_ROLE.SUPPLIER || that.data.businessRole==CONSTANT.BUSINESS_ROLE.CUSTOMER){
            	columns.push({displayName:'默认分配',key:'defaultSelect',width:120,render:function(record){
					var html = $('<input type="checkbox"></input>');
					if(record.defaultSelect==CONSTANT.AUTH_DEFAULT.AUTH_DEFAULT_SELECTED){
						html.attr('checked','checked');
					}
					html.click(function(){
						if(html.attr('checked')=='checked'){
							record.defaultSelect = CONSTANT.AUTH_DEFAULT.AUTH_DEFAULT_SELECTED; //select
						}else{
							record.defaultSelect = CONSTANT.AUTH_DEFAULT.AUTH_DEFAULT_UNSELECT; //no select
						}
					})
					return html;
				}})
            }
            columns.push({displayName:'模块名称',key:'moduleName',width:320});
            columns.push({displayName:'系统表名',key:'tableName',width:320});
            grid.init({
                container:container,
                url:that.data.module+'/listMessage.action?roleId='+that.data.roleId,
                columns:columns
            });
		}
		Authority.prototype.addMenu = function(){
            var that = this;
            var container = this.container;
            var addDlg = new V.Classes['v.ui.Dialog']();
            var tree = $("<div><div id='cont_tree'></div></div>");
            var menu_tree = new V.Classes['v.ui.Tree']();
            addDlg.setContent(tree);
           
            $.ajax({
                url:that.data.module+'/'+that.data.action+'!menuTree.action',
                type:'post',
                data:{
                	id:that.data.id,
                	roleId:that.data.roleId,
                	menuType:that.data.menuType,
            		partyVersion:that.data.partyVersion,
					businessRole:that.data.businessRole,
					platformNo:that.data.platformNo
                },
                success:function(data){
                    this.menus = data;
                    menu_tree.init({
                        checkable: true,
                        data: this.menus,
                        container:addDlg.getContent()
                    });
                },
                error:function(){
                    that.log('get Menus failed!');
                }
            });
            addDlg.setBtnsBar({btns:[{text:"授权",style:"btn-primary",handler:function(){
                var checkedArr = menu_tree.getSelectedNodeIds();
//                if(checkedArr.length == 0) {
//                    V.alert("请选择菜单！");
//                    return;
//                }
                var checkedIds = '';
                for(i=0; i < checkedArr.length; i++) {
                    checkedIds += checkedArr[i]+',';
                }
                $.ajax({
                    url:that.data.module+'/'+that.data.action+'!saveMenu.action',
                    type:'post',
                    data:{
                    	id:that.data.id,
                    	roleId:that.data['roleId'],
                    	checkedIds:checkedIds.substring(0,checkedIds.length-1),
                    	menuType:that.data.menuType,
                    	partyVersion:that.data.partyVersion,
            			homeType:that.data.homeType,
            			businessRole:that.data.businessRole,
            			platformNo:that.data.platformNo
                    },
                    success:function(data){
                    	if(data.msg=='error'){
                    		V.alert(data.info);
                    	}else{
                    		 addDlg.close();
                             that.menuList.refresh();
                    	}
                    }
                })
                
            }},{text:"取消",handler:addDlg.close}]});
            addDlg.init({title:'菜单树',height:592,width:660});
        }
        Authority.prototype.addConsole = function(){
            var that = this;
            var addDlg = new V.Classes['v.ui.Dialog']();
            var tempConsole = $("<div></div>");
            var list  = new V.Classes['v.ui.Grid']();
            list.setFilters({
            	id:that.data.id,
            	roleId:that.data.roleId,
            	flag:"add",
            	partyVersion:that.data.partyVersion,
				businessRole:that.data.businessRole,
				platformNo:that.data.platformNo
            });
            list.init({
                container:tempConsole,
                checkable:true,
                url:that.data.module+'/'+that.data.action+'!listHomecmts.action',
                columns:[
                    {displayName:'名称',key:'homeName',width:280}
//                    ,{displayName:'类型',key:'homeType',width:280,render:function(record){
//                    	return CONSTANT.B2B.HOME_TYPE.VALUE[record.homeType];	
//                    }}
                ]
            });
            this.subscribe(list,list.EVENT.DATA_RETRIEVED,function(){
                //处理列表中出现的记录，在弹出窗口选中
                var consoleData = that.consoleList.options.data||'';
                var tempData = list.options.data;
                $.each(consoleData,function(index,dom){
                    var id = consoleData[index].id;
                    $.each(tempData,function(tIndex,tDom){
                        if(id==tempData[tIndex].id)
                            tempData[tIndex]['checked'] = true;
                    });
                });
                if(that.consoleList.options.data.length==0){
	                $.each(tempData,function(){
	                	if(this['partyVersion']==that.data.partyVersion || this['partyVersion']==CONSTANT.AUTH_TYPE.AUTH_TYPE_ALL){
	                		this['checked'] = true;	
	                	}
	                })
                }
            });
             
            addDlg.setBtnsBar({btns:[{text:"授权",style:"btn-primary",handler:function(){
                var selected = list.getCheckedRecords();
                var selected_array = [];
                for (var i = 0; i < selected.length; i++){
                     selected_array[i] = selected[i].id;
                };
//                if(selected.length == 0) {
//                    V.alert("请选择控制台！");
//                    return;
//                }
                $.ajax({
                    url:that.data.module+'/'+that.data.action+'!saveHomecmt.action',
                    type:'post',
                    data: {id:that.data.id,
                    	roleId:that.data['roleId'],
                    	checkedIds:selected_array.join(','),
                    	partyVersion:that.data.partyVersion,
						businessRole:that.data.businessRole,
						platformNo:that.data.platformNo
                    },
                    success:function(data){
                        if(data.msg == 'success'){
                            addDlg.close();
                            that.consoleList.refresh();
                        }else{
                            V.alert(data.info);
                        }
                    }
                })
            }},{text:"取消",handler:addDlg.close}]});
            addDlg.init({title:'控制台列表',height:492,width:660});
             
            /**将Grid中的数据加入到Dialog中**/
            addDlg.setContent(tempConsole);
        }
        Authority.prototype.addReport = function(){
            var that = this;
            var addDlg = new V.Classes['v.ui.Dialog']();
            var tempReport = $("<div></div>");
            var list  = new V.Classes['v.ui.Grid']();
            list.setFilters({
            	id:that.data.id,
            	roleId:that.data.roleId,
            	partyVersion:that.data.partyVersion,
				businessRole:that.data.businessRole,
				platformNo:that.data.platformNo
            });
            list.init({
                container:tempReport,
                checkable:true,
                url:that.data.module+'/'+that.data.action+'!listRepotAuth.action',
                columns:[
                    {displayName:'名称',key:'reportTitle',width:280}
                    ,{displayName:'类型',key:'reportTypeName',width:280}
                ]
            });
            
            this.subscribe(list,list.EVENT.DATA_RETRIEVED,function(){
                //处理列表中出现的记录，在弹出窗口选中
                var reportData = that.reportList.options.data||'';
                var tempData = list.options.data;
                $.each(reportData,function(index,dom){
                    var id = reportData[index].id;
                    $.each(tempData,function(tIndex,tDom){
                        if(id==tempData[tIndex].id)
                            tempData[tIndex]['checked'] = true;
                    });
                });
                if(that.reportList.options.data.length==0){
	                $.each(tempData,function(){
	                	if(this['partyVersion']==that.data.partyVersion || this['partyVersion']==CONSTANT.AUTH_TYPE.AUTH_TYPE_ALL){
	                		this['checked'] = true;	
	                	}
	                })
                }
            });
             
            addDlg.setBtnsBar({btns:[{text:"授权",style:"btn-primary",handler:function(){
                var selected = list.getCheckedRecords();
                var selected_array = [];
                for (var i = 0; i < selected.length; i++){
                     selected_array[i] = selected[i].id;
                };
//                if(selected.length == 0) {
//                    V.alert("请选择报表权限！");
//                    return;
//                }
                $.ajax({
                    url:that.data.module+'/'+that.data.action+'!saveReportAuth.action',
                    type:'post',
                    data: {
                    	id:that.data.id,
                    	roleId:that.data['roleId'],
                    	checkedIds:selected_array.join(','),
                    	partyVersion:that.data.partyVersion,
						businessRole:that.data.businessRole,
						platformNo:that.data.platformNo
					},
                    success:function(data){
                        if(data.msg == 'success'){
                            addDlg.close();
                            that.reportList.refresh();
                        } else{
                            V.alert(data.info);
                        }
                    }
                })
            }},{text:"取消",handler:addDlg.close}]});
            addDlg.init({title:'报表列表',height:492,width:660});
             
            /**将Grid中的数据加入到Dialog中**/
            addDlg.setContent(tempReport);
        }
        //添加消息
        Authority.prototype.addMessage = function(){
            var that = this;
            var addDlg = new V.Classes['v.ui.Dialog']();
            var tempMessage = $("<div></div>");
            var list  = new V.Classes['v.ui.Grid']();
            list.setFilters({id:that.data.id,
            	roleId:that.data.roleId,
            	partyVersion:that.data.partyVersion,
				businessRole:that.data.businessRole,
				platformNo:that.data.platformNo
			});
            list.init({
                container:tempMessage,
                checkable:true,
                url:that.data.module+'/'+'showAllTable.action',
                columns:[
					{displayName:'模块名称',key:'moduleName',width:320}
					,{displayName:'系统表名',key:'name',width:320}
                ]
            });
            
            this.subscribe(list,list.EVENT.DATA_RETRIEVED,function(){
                //处理列表中出现的记录，在弹出窗口选中
                var messageData = that.messageList.options.data||'';
                var tempData = list.options.data;
                $.each(messageData,function(index,dom){
                    var id = messageData[index].entityTypeTemplateId;
                    $.each(tempData,function(tIndex,tDom){
                        if(id==tempData[tIndex].id)
                            tempData[tIndex]['checked'] = true;
                    });
                });
                if(that.messageList.options.data.length==0){
	                $.each(tempData,function(){
	                	if(this['partyVersion']==that.data.partyVersion || this['partyVersion']==CONSTANT.AUTH_TYPE.AUTH_TYPE_ALL){
	                		this['checked'] = true;	
	                	}
	                })
                }
            });
             
            addDlg.setBtnsBar({btns:[{text:"保存",style:"btn-primary",handler:function(){
                var selected = list.getCheckedRecords();
                var selected_array = [];
                for (var i = 0; i < selected.length; i++){
                     selected_array[i] = selected[i].id;
                };
//                if(selected.length == 0) {
//                    V.alert("请选择消息！");
//                    return;
//                }
                $.ajax({
                    url:that.data.module+'/'+'saveMessageModuleTable.action',
                    type:'post',
                    data: {
                    	id:that.data.id,
                    	roleId:that.data['roleId'],
                    	checkedIds:selected_array.join(','),
                    	partyVersion:that.data.partyVersion,
						businessRole:that.data.businessRole,
						platformNo:that.data.platformNo
                    },
                    success:function(data){
                        if(data.msg == 'success'){
                            addDlg.close();
                            that.messageList.refresh();
                        } else{
                            V.alert(data.info);
                        }
                    }
                })
            }},{text:"取消",handler:addDlg.close}]});
            addDlg.init({title:'消息列表',height:492,width:660});
            addDlg.setContent(tempMessage);
        }
        Authority.prototype.saveMenuRange = function(){
        	var that = this;
        	var data = this.menuList.options.data;
            
            var checkedIds = [];
            for(i=0; i < data.length; i++) {
                if(data[i].defaultSelect==CONSTANT.AUTH_DEFAULT.AUTH_DEFAULT_SELECTED){
                	checkedIds.push(data[i].menuId);	
                }
            }
            if(checkedIds.length == 0) {
                V.alert("请选择记录！");
                return;
            }
            
            $.ajax({
                url:that.data.module+'/'+that.data.action+'!saveMenuRangeDeDefaultSelect.action',
                type:'post',
                data:{
                	id:that.data.id,
                	roleId:that.data['roleId'],
                	checkedIds:checkedIds.join(','),
                	menuType:that.data.menuType,
                	partyVersion:that.data.partyVersion,
        			homeType:that.data.homeType,
        			platformNo:that.data.platformNo,
        			authType:CONSTANT.AUTHTYPE_CONTENT.AUTHTYPE_MENU
                },
                success:function(data){
                	if(data.msg=='error'){
                		V.alert(data.info);
                	}else{
                         that.menuList.refresh();
                	}
                }
            })
        }
        Authority.prototype.saveConsoleRange = function(){
        	var that = this;
            var data = this.consoleList.options.data;
            
            var checkedIds = [];
            for(i=0; i < data.length; i++) {
                if(data[i].defaultSelect==CONSTANT.AUTH_DEFAULT.AUTH_DEFAULT_SELECTED){
                	checkedIds.push(data[i].id);	
                }
            }
            if(checkedIds.length == 0) {
                V.alert("请选择记录！");
                return;
            }
            $.ajax({
                url:that.data.module+'/'+that.data.action+'!saveMenuRangeDeDefaultSelect.action',
                type:'post',
                data:{
                	id:that.data.id,
                	roleId:that.data['roleId'],
                	checkedIds:checkedIds.join(','),
                	menuType:that.data.menuType,
                	partyVersion:that.data.partyVersion,
        			homeType:that.data.homeType,
        			platformNo:that.data.platformNo,
        			authType:CONSTANT.AUTHTYPE_CONTENT.AUTHTYPE_CONSOLE
                },
                success:function(data){
                	if(data.msg=='error'){
                		V.alert(data.info);
                	}else{
                         that.consoleList.refresh();
                	}
                }
            })
        }
        Authority.prototype.saveReportRange = function(){
        	var that = this;
            var data = this.reportList.options.data;
            
            var checkedIds = [];
            for(i=0; i < data.length; i++) {
                if(data[i].props.defaultSelect==CONSTANT.AUTH_DEFAULT.AUTH_DEFAULT_SELECTED){
                	checkedIds.push(data[i].id);	
                }
            }
            if(checkedIds.length == 0) {
                V.alert("请选择记录！");
                return;
            }
            $.ajax({
                url:that.data.module+'/'+that.data.action+'!saveMenuRangeDeDefaultSelect.action',
                type:'post',
                data:{
                	id:that.data.id,
                	roleId:that.data['roleId'],
                	checkedIds:checkedIds.join(','),
                	menuType:that.data.menuType,
                	partyVersion:that.data.partyVersion,
        			homeType:that.data.homeType,
        			platformNo:that.data.platformNo,
        			authType:CONSTANT.AUTHTYPE_CONTENT.AUTHTYPE_REPORT
                },
                success:function(data){
                	if(data.msg=='error'){
                		V.alert(data.info);
                	}else{
                         that.reportList.refresh();
                	}
                }
            })
        }
        Authority.prototype.saveMessageRange = function(){
        	var that = this;
            var data = this.messageList.options.data;
            
            var checkedIds = [];
            for(i=0; i < data.length; i++) {
                if(data[i].defaultSelect==CONSTANT.AUTH_DEFAULT.AUTH_DEFAULT_SELECTED){
                	checkedIds.push(data[i].entityTypeTemplateId);	
                }
            }
            if(checkedIds.length == 0) {
                V.alert("请选择记录！");
                return;
            }
            $.ajax({
                url:that.data.module+'/'+that.data.action+'!saveMenuRangeDeDefaultSelect.action',
                type:'post',
                data:{
                	id:that.data.id,
                	roleId:that.data['roleId'],
                	checkedIds:checkedIds.join(','),
                	menuType:that.data.menuType,
                	partyVersion:that.data.partyVersion,
        			homeType:that.data.homeType,
        			platformNo:that.data.platformNo,
        			authType:CONSTANT.AUTHTYPE_CONTENT.AUTHTYPE_MESSAGE
                },
                success:function(data){
                	if(data.msg=='error'){
                		V.alert(data.info);
                	}else{
                         that.messageList.refresh();
                	}
                }
            })
        }
	})(V.Classes['v.views.component.AuthoritySetting']);
},{plugins:["v.ui.dialog","v.ui.pagination"]})