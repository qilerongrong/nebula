;V.registPlugin("v.views.backoffice.custom.conditionCustom",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.ConditionCustom",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.views.backoffice.custom.conditionCustom';
			this.module='';
			this.menus=null;
			this.resource = {
				html:'template.html'
			}
		}
	});
	(function(ConditionCustom){
		ConditionCustom.prototype.init = function(options){
			this.container = options.container;
			this.module = options.module;
			this.platformNo = options.platformNo||'';
			this.party = options.party||'';
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					that.initEvent();
					that.getMenus();
					that.initIsAll();
				}
		     });
			
			this.dateHelper = {
				getDate:function(){
					var myDate = new Date();
					var year = myDate.getFullYear();
				    var month = myDate.getMonth()+1;
				    var date = myDate.getDate();
				    if (month<10){
				        month = "0"+month;
				    }
				    if(date<10){
				    	date = "0"+date;
				    }
					var value = year+'-'+month+'-'+date;
					return value;
				},
				getWeekStartDate:function(){
					var myDate = new Date();
					var year = myDate.getFullYear();
				    var month = myDate.getMonth()+1;
				    var date = myDate.getDate();
				    var day = myDate.getDay();
				    if(day==0){
				    	day == 7;
				    }
					var value = year+'-'+month+'-'+(date-day+1);
					return value;
				},
				getMonthStartDate:function(){
					var myDate = new Date();
					var year = myDate.getFullYear();
				    var month = myDate.getMonth()+1;
				    var date = myDate.getDate();
				    if (month<10){
				        month = "0"+month;
				    }
				    if(date<10){
				    	date = "0"+date;
				    }
					var value = year+'-'+month+'-'+'01';
					return value;
				}
			}
		}
		
		ConditionCustom.prototype.initIsAll = function(){
			var isSuper = LoginInfo.isSuperPlatform;
			var user = LoginInfo.user;
			 if (isSuper && this.platformNo == user.createByPlatformNo) {
		     	$('#isAll',this.template).show();
		     	$('input[name=isAll]',this.template).attr("checked",true);
		     }
		}
		
		ConditionCustom.prototype.initEvent = function(){
			var that = this;
			if(this.party){
				$('.partyName',this.template).html('企业名称：'+this.party.partyName)
			}
			
			//选择角色
			$('#businessRole',this.template).change(function(){
				that.getMenus();
			});
			//选择菜单
			$('#menuId',this.template).change(function(){
				var sel = $(this).find('option:checked').index();
				that.getTicketsType(that.menus[sel]);
			});
			//选择单据类型
			$('.ticketsType',this.template).change(function(){
				var tableType = $(this).find('option:selected').attr('hasDetail');
				if(tableType=='true'){
					$('.ticketDetail',this.template).show();
				}else{
					$('.ticketDetail',this.template).hide();
				}
				var sel = $('#menuId',that.template).find('option:checked').index();
				that.getMenuCondition(that.menus[sel]);
			});
			$('.toggle',this.template[0]).live('click',function(){
				if($('i',this).hasClass('icon-chevron-up')){
					$('i',this).removeClass('icon-chevron-up').addClass('icon-chevron-down').attr('title','展开');
					$(this).parent().next().hide();
				}else{
					$('i',this).removeClass('icon-chevron-down').addClass('icon-chevron-up').attr('title','收起');
				    $(this).parent().next().show();
				}
			});
		};
		ConditionCustom.prototype.initConditionEvent = function(con){
			//选择条件类型
			var that = this;
			var dom = con;
			var conditionType =$('select[name=conditionType]',dom).val();
			$('select[name=conditionOperator]',dom).change(function(){
				var cvFirst = $('*[data-key=conditionValue]',dom).find('input:eq(0)');
				var cvSecond = $('*[data-key=conditionValue]',dom).find('input:eq(1)');
				if(conditionType==V.Classes['v.component.Form'].TYPE.TEXT || conditionType==V.Classes['v.component.Form'].TYPE.NUMBER){
					$('*[data-key=conditionValue]',dom).parent().show();
					if($(this).val()==9){
						cvSecond.show();
						cvSecond.prev().show();
						
						cvFirst.val(cvFirst.val()||'');
						cvSecond.val(cvSecond.val()||'');
					}else{
						cvSecond.hide();
						cvSecond.prev().hide();
						cvFirst.val(cvFirst.val()||'');
					}
				}else if(conditionType==V.Classes['v.component.Form'].TYPE.DATE){
					$('*[data-key=conditionValue]',dom).parent().show();
					if($(this).val()==9){
						cvSecond.show();
						cvSecond.prev().show();
						
						cvFirst.datepicker({
					         dateFormat: "yy-mm-dd",
							 showMonthAfterYear:true,
							 changeMonth: true,
				             changeYear: true
				          });
						cvSecond.datepicker({
					         dateFormat: "yy-mm-dd",
							 showMonthAfterYear:true,
							 changeMonth: true,
				             changeYear: true
				          });
					}else{
						cvSecond.hide();
						cvSecond.prev().hide();
						cvFirst.datepicker({
					         dateFormat: "yy-mm-dd",
							 showMonthAfterYear:true,
							 changeMonth: true,
				             changeYear: true
				          });
					}
				}else{
					$('*[data-key=conditionValue]',dom).parent().hide();
				}
				/** ns属性继承定制数据表
				if(conditionType==8){
					$('*[data-key=ns]',dom).parent().show();
				}else{
					$('*[data-key=ns]',dom).parent().hide();
				}
				**/
			})
			$('select[name=conditionOperator]',dom).change();
			$('.row-fluid [class*="span"]',dom).css({'margin-left':'0px'});
		}
		//获取菜单
		ConditionCustom.prototype.getMenus = function(){
			var that = this;
			var menuType = $('#businessRole',this.template).val();
			$.ajax({
				url:'common!queryMenuByType.action',
				type:'POST',
				dataType:'json',
				data:{menuType:menuType,platformNo:that.platformNo},
				success:function(data){
//					var menus = this.menus = [{'menuName':'结算单查询','menuCode':'90','moduleCode':'FINANCE','docketType':'ACCOUNT','docketName':'结算单'},
//					 			             {'menuName':'发票查询','menuCode':'0001','moduleCode':'FINANCE','docketType':'INVOICE','docketName':'发票单'}];
					$('#menuId',that.template).empty();
					var menus = that.menus = data;
		 			$.each(menus,function(index){
		 				var opt = $('<option>'+this.menuName+'</option>');
		 				opt.attr('value',this.id);
		 				$('#menuId',that.template).append(opt);
		 				
		 				if(index==0)
		 					that.getTicketsType(this);
		 			})
				}
			})
		};
		//获取单据类型
		ConditionCustom.prototype.getTicketsType = function(menu){
			var that = this;
			$.ajax({
				url:that.module+'/ticketList.action',
				type:'POST',
				dataType:'json',
				data:{moduleCode:menu.moduleCode,platformNo:that.platformNo,docketType:menu.docketType},
				success:function(data){
					$('.ticketsType',that.template).empty();
					if(data&&data.length==0){
						$('.ticketHeader .block_con',this.template).empty();
						$('.ticketDetail .block_con',this.template).empty();
					}
					$.each(data,function(index){
						var opt = $('<option>'+this.name+'</option>');
						opt.attr('value',this.value);
						opt.attr('hasDetail',this.hasDetail);
						$('.ticketsType',that.template).append(opt);
		 				
		 				if(index==0){
		 					if(this.hasDetail){
		 						$('.ticketDetail',this.template).show();
		 					}else{
		 						$('.ticketDetail',this.template).hide();
		 					}
		 					that.getMenuCondition(menu);
		 				}
		 			})
				}
			})
		};
		//获取菜单条件
		ConditionCustom.prototype.getMenuCondition = function(menu){
			this.menu = menu;
			var that = this;
			$('.ticketHeader .block_con',this.template).empty();
			
			var dictType = {'TEXT':'文本','DATE':'时间','NUMBER':'数字','CHECKBOX':'多选','SELECT':'单选','PLUGIN':'插件','DATE_YEAR_MON':'年月','PERCENT':'百分比','HIDDEN':'隐藏'};
			var dictOperator = {'1':'小于','2':'小于等于','3':'等于','4':'大于','5':'大于等于','6':'不等于','7':'like','8':'in','9':'between'};
			
            var headerList = this.headerMenuConditionList = new V.Classes['v.ui.Grid']();
            var menuCode = menu.id;
            var moduleCode = menu.moduleCode;
            var docketType = $('.ticketsType',this.template).val();
            
            var pagination = new V.Classes['v.ui.Pagination']();
            headerList.setPagination(pagination);
            headerList.setFilters({'menuCode':menuCode,'moduleCode':moduleCode,'tableType':'header','platformNo':that.platformNo});
            
            headerList.init({
                container:$('.ticketHeader .block_con',this.template),
                checkable:false,
                url:this.module+'/menu-condition!getMenuConditionByMenu.action',
                columns:[
                    {displayName:'菜单名称',key:'menuName',width:120}
                    ,{displayName:'条件名称',key:'conditionName',width:120}
                    ,{displayName:'条件类型',key:'conditionType',width:120,render:function(record){
                    	return dictType[record.conditionType]||record.conditionType;
                    }}
                    ,{displayName:'条件操作符',key:'conditionOperator',width:120,render:function(record){
                    	return dictOperator[record.conditionOperator]||record.conditionOperator;
                    }}
                    ,{displayName:'单据编码',key:'docketType',width:120}
                    ,{displayName:'单据名称',key:'docketName',width:120}
                    ,{displayName:'操作',key:'action',width:80,render:function(record){
                        var html = $('<div class="action"><a class="edit" href="javascript:void(0);" title="编辑"><i class="icon-edit"></i></a><a class="remove" href="javascript:void(0);" title="删除"><i class="icon-remove"></i></a>\
                        			<a class="move-up" href="javascript:void(0);" title="上移"><span class="icon-arrow-up"></span></a><a class="move-down" href="javascript:void(0);" title="下移"><span class="icon-arrow-down"></span></a></div>');
                        $('.edit',html).click(function(){
                            that.editMenuCondition(record,'header');
                        });
                        $('.remove',html).click(function(){
                            that.removeMenuCondition(record,'header');
                        });
                        $('.move-up',html).click(function(){
                            that.moveUpMenuCondition(record,'header');
                        });
                        $('.move-down',html).click(function(){
                            that.moveDownMenuCondition(record,'header');
                        });
                        return html;
                    }}
                ],
                toolbar:[{eventId:'headerNew',icon:'icon-plus',text:'新增条件'}]
            });
            this.subscribe(headerList,'headerNew',this.headerNewMenuCondition);
            
            $('.ticketDetail .block_con',this.template).empty();
            var detailList = this.detailMenuConditionList = new V.Classes['v.ui.Grid']();
            
            var paginationn = new V.Classes['v.ui.Pagination']();
            detailList.setPagination(paginationn);
            detailList.setFilters({'menuCode':menuCode,'moduleCode':moduleCode,'tableType':'detail','platformNo':that.platformNo});
            
            detailList.init({
                container:$('.ticketDetail .block_con',this.template),
                checkable:false,
                url:this.module+'/menu-condition!getMenuConditionByMenu.action',
                columns:[
                    {displayName:'菜单名称',key:'menuName',width:120}
                    ,{displayName:'条件名称',key:'conditionName',width:120}
                    ,{displayName:'条件类型',key:'conditionType',width:120,render:function(record){
                    	return dictType[record.conditionType]||record.conditionType;
                    }}
                    ,{displayName:'条件操作符',key:'conditionOperator',width:120,render:function(record){
                    	return dictOperator[record.conditionOperator]||record.conditionOperator;
                    }}
                    ,{displayName:'操作',key:'action',width:80,render:function(record){
                        var html = $('<div class="action"><a class="edit" href="javascript:void(0);" title="编辑"><i class="icon-edit"></i></a><a class="remove" href="javascript:void(0);" title="删除"><i class="icon-remove"></i></a>\
                        			<a class="move-up" href="javascript:void(0);" title="上移"><span class="icon-arrow-up"></span></a><a class="move-down" href="javascript:void(0);" title="下移"><span class="icon-arrow-down"></span></a></div>');
                        $('.edit',html).click(function(){
                            that.editMenuCondition(record,'detail');
                        });
                        $('.remove',html).click(function(){
                            that.removeMenuCondition(record,'detail');
                        });
                        $('.move-up',html).click(function(){
                            that.moveUpMenuCondition(record,'detail');
                        });
                        $('.move-down',html).click(function(){
                            that.moveDownMenuCondition(record,'detail');
                        });
                        return html;
                    }}
                ],
                toolbar:[{eventId:'newDetail',icon:'icon-plus',text:'从表新增条件'}]
            });
            this.subscribe(detailList,'newDetail',this.detailNewMenuCondition);
            
            this.subscribe(headerList,headerList.EVENT.DATA_LOADED,function(){
            	$('.icon-arrow-up',that.template.find('.ticketHeader .block_con')).first().hide();
            	$('.icon-arrow-down',that.template.find('.ticketHeader .block_con')).last().hide();
            });
            this.subscribe(detailList,detailList.EVENT.DATA_LOADED,function(){
            	$('.icon-arrow-up',that.template.find('.ticketDetail .block_con')).first().hide();
            	$('.icon-arrow-down',that.template.find('.ticketDetail .block_con')).last().hide();
            });
		};
		ConditionCustom.prototype.headerNewMenuCondition = function(){
			var that = this;
			var menu = this.menu;
			var docketType = $('.ticketsType',this.template).val();
			V.ajax({
				url:this.module+'/menu-condition!getDocketTypeCols.action',
				type:'POST',
				dataType:'json',
				data:{menu:that.menu,docketType:docketType,tableType:'header',platformNo:that.platformNo},
				success:function(ticketInfo){
					that.ticket = ticketInfo;
					that.menuConditionDialog(ticketInfo,'header');
				}
			})
			
		}
		ConditionCustom.prototype.detailNewMenuCondition = function(){
			var that = this;
			var menu = this.menu;
			var docketType = $('.ticketsType',this.template).val();
			V.ajax({
				url:this.module+'/menu-condition!getDocketTypeCols.action',
				type:'POST',
				dataType:'json',
				data:{menu:that.menu,docketType:docketType,tableType:'detail',platformNo:that.platformNo},
				success:function(ticketInfo){
					that.ticket = ticketInfo;
					that.menuConditionDialog(ticketInfo,'detail');
				}
			})
			
		}
		ConditionCustom.prototype.menuConditionDialog = function(ticketInfo,tableType){
			var that = this;
			var list = new V.Classes['v.ui.Grid']();
			var columns = ticketInfo.customs;
			var Form = V.Classes['v.component.Form'];
			var diaDlg = new V.Classes['v.ui.Dialog']();
			var con = $('<div></div>');
			
			list.init({
                container:con,
                checkable:true,
                data:columns,
                columns:[
                    {displayName:'字段名称',key:'fieldLabel'},
                    {displayName:'插件名称',key:'ns'},
                    {displayName:'字典编码',key:'dictTypeCode'}
                ]
            });
			
			diaDlg.setContent(con);
			diaDlg.setBtnsBar({
				position:'center',
				btns:[
				      {text:'确定',style:'btn-primary',handler:function(){
				    	  that.saveDocketTypeToMenuCondition(list,diaDlg,tableType);
				      }},
				      {text:'取消',handler:function(){
				    	  this.close();
				      }}
				      ]
			});
			diaDlg.init({
				width:900,
				height:500,
				title:'新增条件'
			});
		}
		ConditionCustom.prototype.saveDocketTypeToMenuCondition = function(list,diaDlg,tableType){
			var that = this;
			var docketType = $('.ticketsType',this.template).val();
			var docketName = $('.ticketsType',this.template).find('option:selected').text();
			var businessRole = $('#businessRole',this.template).val();
			var lastSort = -1;
			if(tableType=='header'){
				var arr = this.headerMenuConditionList.options.data;
				var ele = arr[arr.length-1]||'';
				lastSort = ele.sort||-1;
			}else{
				var arr = this.detailMenuConditionList.options.data;
				var ele = arr[arr.length-1]||'';
				lastSort = ele.sort||-1;
			}
			var menuCondition = {
				'menuCode':this.menu.id,
				'menuName':this.menu.menuName,
				'moduleCode':this.menu.moduleCode,
				'moduleName':this.menu.moduleName,
				'docketType':docketType,
				'docketName':docketName,
				'tableType':tableType,
				'sort':lastSort,
				'platformNo':this.platformNo,
				'conditionRole':businessRole
			}
			var selected = list.getCheckedRecords();
            if(selected.length==0){
                V.alert('请选择记录!');
                return;
            }
            var url = that.module+'/menu-condition!saveDocketTypeToMenuCondition.action';
            //
			var isAll = $('input[name=isAll]',that.template).attr('checked')?true:false;
            //V.confirm('是否新增条件?',function(){
            	V.ajax({
                    url:url,
                    type:'post',
                    data:{customs:selected,menuCondition:menuCondition,isAll:isAll},
                    success:function(data){
                        if(data.result=='success'){
                        	if(tableType=='header')
                        		that.headerMenuConditionList.refresh();
                        	else
                        		that.detailMenuConditionList.refresh();
                        }else if(data.result=='error'){
                        	V.alert(data.info);
                        }else{
                            V.alert(data);
                        }
                        diaDlg.close();
                    }
                })
            //});
		}
		ConditionCustom.prototype.editMenuCondition = function(record,tableType){
			var that = this;
			
			var url = this.getPath()+"/assets/condition.html";
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					var Form = V.Classes['v.component.Form'];
					var diaDlg = new V.Classes['v.ui.Dialog']();
					var con = $('<div></div>');
					con.append(dom);
					
					/**设置验证**/
					$('*[data-validator]',con).keyup(function(e){
						var v = this.value;
						var rules = $(this).attr('data-validator');
						var required = $(this).attr('data-required')||'false';
						if(required=='true'&&v==""){
							$(this).parent().find('.error_msg').text("该值不可为空").show();
							return false;
						}
						var msg = Validator.validate(rules,v);
						if(msg){
							$(this).parent().find('.error_msg').text(msg).show();
						}else{
							$(this).parent().find('.error_msg').empty().hide();
						}
					})
					
					$('*[data-key]',con).each(function(){
						var key = $(this).attr('data-key');
						var value = record[key]||'';
						if(key=='conditionValue'){
							value = value.split(',');
							if(record.conditionType==V.Classes['v.component.Form'].TYPE.TEXT || record.conditionType==V.Classes['v.component.Form'].TYPE.NUMBER){
								if(record.conditionOperator==V.Classes['v.component.Form'].TYPE.PLUGIN){
									$(this).find('.edit_input:eq(0)',this).val(record[key]||'');
								}else{
									$(this).find('.edit_input:eq(0)',this).val(value[0]||'');
									$(this).find('.edit_input:eq(1)',this).val(value[1]||'');
								}
							}else if(record.conditionType==V.Classes['v.component.Form'].TYPE.DATE){
								if(record.conditionOperator==9){
									$(this).find('.edit_input:eq(0)',this).val(value[0]||'');
									$(this).find('.edit_input:eq(1)',this).val(value[1]||'');
								}else{
									$(this).find('.edit_input:eq(0)',this).val(value[0]||'');
								}
							}
						}else{
							$(this).find('.edit_input').val(value);
						}
					})
					
					diaDlg.setContent(con);
					diaDlg.setBtnsBar({
						position:'center',
						btns:[
						      {text:'确定',style:'btn-primary',handler:function(){
						    	  that.saveMenuCondition(diaDlg,record,tableType);
						      }},
						      {text:'取消',handler:function(){
						    	  this.close();
						      }}
						      ]
					});
					diaDlg.init({
						width:900,
						height:300,
						title:'编辑条件'
					});
					that.initConditionEvent(con);
				}
		     });
		}
		ConditionCustom.prototype.saveMenuCondition = function(diaDlg,record,tableType){
			if(!this.validate(diaDlg.getContent())) return;
			var that = this;
			$('*[data-key]:visible',diaDlg.getContent()).each(function(){
				var key = $(this).attr('data-key');
				if(key == 'conditionValue'){
					var value = [];
					$(this).find('.edit_input:visible').each(function(){
						if($(this).val()!='')
							value.push($(this).val());
					})
					record[key] = value.join(',');
				}
				else{
					record[key] = $('.edit_input',this).val();
				}
			});
			
			var url = this.module+'/menu-condition!save.action';
			
			//
			var isAll = $('input[name=isAll]',that.template).attr('checked')?true:false;
			
			//V.confirm('是否保存条件？',function(){
	            V.ajax({
	            	url:url,
	               	type:'post',
					data:{menuCondition:record,isAll:isAll},
	                success:function(data){
	                	if(data.result=='success'){
	                		if(tableType=='header')
	                			that.headerMenuConditionList.refresh();
	                		else
	                			that.detailMenuConditionList.refresh();
                        	diaDlg.close();
                        }else if(data.result=='error'){
                        	V.alert(data.info);
                        }else{
                            V.alert(data);
                        }
	                }
	            })
			//})   
		}
		ConditionCustom.prototype.removeMenuCondition = function(record,tableType){
			var that = this;
			var url = that.module+'/menu-condition!removeMenuCondition.action';
			//
			var isAll = $('input[name=isAll]',that.template).attr('checked')?true:false;
            V.confirm('是否删除条件?',function(){
            	V.ajax({
                    url:url,
                    type:'post',
                    data:{menuCondition:record,platformNo:that.platformNo,isAll:isAll},
                    success:function(data){
                        if(data.result=='success'){
                        	if(tableType=='header')
                        		that.headerMenuConditionList.removeRecord(record);
                        	else
                        		that.detailMenuConditionList.removeRecord(record);
                        }else if(data.result=='error'){
                        	V.alert(data.info);
                        }else{
                            V.alert(data);
                        }
                    }
                })
            });
		}
		//上移
		ConditionCustom.prototype.moveUpMenuCondition = function(record,tableType){
			var that = this;
			var conditionList = this.headerMenuConditionList;
			if(tableType=='detail')
				conditionList = this.detailMenuConditionList;
			
			var oprIndex = conditionList.getRecordIndex(record);
			var preRecord = conditionList.options.data[oprIndex-1];
			var menuConditions = [];
			menuConditions.push(record);
			menuConditions.push(preRecord);
			
			var url = that.module+'/menu-condition!moveUpMenuCondition.action';
			//
			var isAll = $('input[name=isAll]',that.template).attr('checked')?true:false;
        	V.ajax({
                url:url,
                type:'post',
                data:{menuConditions:menuConditions,platformNo:that.platformNo,isAll:isAll},
                success:function(data){
                    if(data.result=='success'){
                    	if(tableType=='header')
                    		that.headerMenuConditionList.refresh();
                    	else
                    		that.detailMenuConditionList.refresh();
                    }else if(data.result=='error'){
                    	V.alert(data.info);
                    }else{
                        V.alert(data);
                    }
                }
            })
		}
		//下移
		ConditionCustom.prototype.moveDownMenuCondition = function(record,tableType){
			var that = this;
			var conditionList = this.headerMenuConditionList;
			if(tableType=='detail')
				conditionList = this.detailMenuConditionList;
			
			var curIndex = conditionList.getRecordIndex(record);
			var nextRecord = conditionList.options.data[curIndex+1];
			var menuConditions = [];
			menuConditions.push(record);
			menuConditions.push(nextRecord);
			
			var url = that.module+'/menu-condition!moveDownMenuCondition.action';
			//
			var isAll = $('input[name=isAll]',that.template).attr('checked')?true:false;
        	V.ajax({
                url:url,
                type:'post',
                data:{menuConditions:menuConditions,platformNo:that.platformNo,isAll:isAll},
                success:function(data){
                    if(data.result=='success'){
                    	if(tableType=='header')
                    		that.headerMenuConditionList.removeRecord(record);
                    	else
                    		that.detailMenuConditionList.removeRecord(record);
                    }else if(data.result=='error'){
                    	V.alert(data.info);
                    }else{
                        V.alert(data);
                    }
                }
            })
		}
		//自己定义的form验证
		ConditionCustom.prototype.validate = function(dom){
			var isValid = true;
			$('*[data-validator]:visible',dom).each(function(){
				var required = $(this).attr('data-required')||false;
				var rules = $(this).attr('data-validator')||'';
				var v = $(this).val();
				if(required=="true"&&v==""){
						$(this).parent().find('.error_msg').text("该值不可为空").show();
						isValid = false;
				}else{
					if(rules){
						var msg = Validator.validate(rules,v);
						if(msg){
							$(this).parent().find('.error_msg').text(msg).show();
							isValid = false;
						}else{
							$(this).parent().find('.error_msg').empty().hide();
						}
					}else{
						$(this).parent().find('.error_msg').empty().hide();
					}
				}
			});
			return isValid;
		}
		ConditionCustom.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'查询条件详情'}});
		}
	})(V.Classes['v.views.backoffice.custom.ConditionCustom']);
},{plugins:['v.ui.dialog','v.ui.alert']})
