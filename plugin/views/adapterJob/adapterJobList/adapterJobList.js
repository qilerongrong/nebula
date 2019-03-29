/**
 * 任务管理--定时任务
 */
;
V.registPlugin("v.views.adapterJob.adapterJobList", function(){
    V.Classes.create({
        className: "v.views.adapterJob.AdapterJobList",
        superClass: "v.component.SearchList",
        init: function(){
            this.ns = 'v.views.adapterJob.adapterJobList';
            this.module = '';
			this.partner = '';
            this.list = new V.Classes['v.ui.Grid']();
            this.form = new V.Classes["v.component.Form"]();
			this.area = new V.Classes['v.component.Area']();
        }
    });
    (function(TaskManageList){
        TaskManageList.prototype.initConditionForm = function(){
            var Form = V.Classes['v.component.Form'];
            var triggerTypeList = DictInfo.getList("SCRIPT_TYPE");
            this.form.init({
                colspan: 3,
                items: [{
                    label: GatewayLang.Schedule.task_name,
                    type: Form.TYPE.TEXT,
                    name: 'triggerName',
                    value: ''
                },{
					label : '作业类型',
					type : Form.TYPE.SELECT,
					name : 'triggerType',
					value : 'ETL',
					multiList : triggerTypeList
				}]
            });
        }
		TaskManageList.prototype.setPartner = function(opt){
			this.partner = opt.record.partner;
		}
        TaskManageList.prototype.initList = function(){
			
            var list = this.list;
            var pagination = new V.Classes['v.ui.Pagination']();
            list.setPagination(pagination);
//            list.setFilters({triggerType:'ETL'});
			var toolbar = [];
			if(this.partner != undefined && this.partner != ''){
				list.setFilters({partner:this.partner});
				toolbar.push({
                    eventId: 'send',
                    text: GatewayLang.Adapter.commitremote,
                    icon: 'icon-send'
                });
			}else{
 				toolbar.push({
                    eventId: 'addapt',
                    text: GatewayLang.Schedule.New_adapter_job,
                    icon: 'icon-business-link'
                }); 
//				toolbar.push( {
//                    eventId: 'add',
//                    text: GatewayLang.Schedule.Add_a_custom_job,
//                    icon: 'icon-cust-task'
//                });
			}
            var that = this;
            list.init({
                container: $('.list', this.template),
                checkable: false,
                url: "quartzJson/jquartzs!adapterList.action",
                columns: [{
                    displayName: GatewayLang.Schedule.job_name,
                    key: 'triggerName',
                    width: 50
                },{
                    displayName: GatewayLang.Schedule.job_desc,
                    key: 'description'
//                    render: function(record){
//						if(record.description != null && record.description!= undefined && record.description.length > 18){
//							var substring = record.description.substring(0,18)+'...';
//                       		return substring;
//						}
//                    }
                },
				 {
                    displayName: GatewayLang.Schedule.last_start_time,
                    key: 'lastStartTime',
                    width: 40
                }, {
                    displayName: GatewayLang.Schedule.last_end_time,
                    key: 'lastEndTime',
                    width: 40
                }, {
                    displayName: GatewayLang.Schedule.status,
                    key: 'enabled',
                    width: 12,
					render:function(record){
						if (record.enabled != undefined && record.enabled != null && record.enabled == 'Y') {
							return GatewayLang.Public.Resume;
						}
						else 
							if (record.enabled != undefined && record.enabled != null && record.enabled == 'N') {
								return GatewayLang.Public.Pause;
							}
					}
                }, {
                    displayName: GatewayLang.Schedule.job_type,
                    key: 'triggerType',
                    width: 20,
                    render: function(record){
//                        if (record.triggerType == 0) {
//                            return GatewayLang.Schedule.Adapter_job;
//                        }
//                        else if (record.triggerType == 1) {
//                            return GatewayLang.Schedule.Custom_job;
//                        }
                    	return DictInfo.getValue(record.triggerType);
                    }
                }, {
                    displayName: GatewayLang.Public.Action,
                    key: 'action',
                    width: 50,
                    render: function(record){
						var  html = '';
						if (that.partner != undefined && that.partner != '') {
							if (record.enabled == 'Y') {
								html = '<div><a class="pause" href="javascript:void(0);" style="margin:0 4px;" title="' + GatewayLang.Public.Pause + '">' + GatewayLang.Public.Pause + '</a><a class="triggeredit" href="javascript:void(0);" style="margin:0 4px;" title="' + GatewayLang.Public.Edit + '">' + GatewayLang.Public.Edit + '</a><a class="ha_start" href="javascript:void(0);" style="margin:0 4px;" title="' + GatewayLang.Public.Manual_execution + '">远程执行</a><div>';
							} else if (record.enabled == 'N') {
									html = '<div><a class="resume" href="javascript:void(0);" style="margin:0 4px;" title="' + GatewayLang.Public.Resume + '">' + GatewayLang.Public.Resume + '</a><a class="triggeredit" href="javascript:void(0);" style="margin:0 4px;" title="' + GatewayLang.Public.Edit + '">' + GatewayLang.Public.Edit + '</a><a class="ha_start" href="javascript:void(0);" style="margin:0 4px;" title="' + GatewayLang.Public.Manual_execution + '">远程执行</a><div>';
							}
						}else{
							if(record.enabled == 'Y'){
								html = '<div><a class="pause" href="javascript:void(0);" style="margin:0 4px;" title="'+GatewayLang.Public.Pause+'">'+GatewayLang.Public.Pause+'</a><a class="triggeredit" href="javascript:void(0);" style="margin:0 4px;" title="'+GatewayLang.Public.Edit+'">'+GatewayLang.Public.Edit+'</a><a class="remove" href="javascript:void(0);" style="margin:0 4px;" title="'+GatewayLang.Public.Delete+'">'+GatewayLang.Public.Delete+'</a><a class="ha_start" href="javascript:void(0);" style="margin:0 4px;" title="'+GatewayLang.Public.Manual_execution+'">'+GatewayLang.Public.Manual_execution+'</a><div>';
							}else if(record.enabled == 'N'){
								html = '<div><a class="resume" href="javascript:void(0);" style="margin:0 4px;" title="'+GatewayLang.Public.Resume+'">'+GatewayLang.Public.Resume+'</a><a class="triggeredit" href="javascript:void(0);" style="margin:0 4px;" title="'+GatewayLang.Public.Edit+'">'+GatewayLang.Public.Edit+'</a><a class="remove" href="javascript:void(0);" style="margin:0 4px;" title="'+GatewayLang.Public.Delete+'">'+GatewayLang.Public.Delete+'</a><a class="ha_start" href="javascript:void(0);" style="margin:0 4px;" title="'+GatewayLang.Public.Manual_execution+'">'+GatewayLang.Public.Manual_execution+'</a><div>';
							}
						}
                        html = $(html);
                        $('.pause', html).click(function(){
                            V.confirm(GatewayLang.Schedule.Confirmation_suspended_task+"?", function ok(e){
                                that.pauseTask(record);
                            });
                        });
                        $('.start', html).click(function(){
                            V.confirm(GatewayLang.Schedule.Confirm_to_the_task+"?", function ok(e){
                                that.resume(record);
                            });
                        });
                        $('.ha_start', html).click(function(){
							V.confirm(GatewayLang.Schedule.Confirm_execution_of_manual_task + "?", function ok(e){
                                var url = 'quartzJson/jquartzs!doRunJob.action';
		                        var data = {id:record.id,partner:that.partner};
		                        $.ajax({
		                            url: url,
		                            data: data,
		                            type: 'POST',
		                            success: function(data){
		                                if(data == 'success'){
											 V.alert(GatewayLang.Schedule.task_run_succ);
											 that.list.refresh();
										}else if(data == 'success_partner'){
											V.alert("操作成功!温馨提示:已经自动为您提交远程更新,请等待下次心跳自动执行!");
											 that.list.refresh();
										}else{
											 V.alert(GatewayLang.Schedule.task_run_fail);
											 that.list.refresh();
										}
		                            }
		                        });
                            });
							
//                            var th = $(this);
//                            var tr = th.parents('tr')[0];
//                            var flag = $(tr).next().is('.v-grid-subrow');
                            //											if (record.adapterId == 'HENKELORDEREXCEL') {
                            //												var con = $('<div><div class="ctime"></div></div>');
                            //												var form = new V.Classes['v.component.Form']();
                            //												var items = [];
                            //												var item0 = {
                            //													name: 'sTime',
                            //													key: 'sTime',
                            //													label: '开始日期',
                            //													required: true,
                            //													value: '',
                            //													type: V.Classes['v.component.Form'].TYPE.DATE,
                            //												};
                            //												var item1 = {
                            //													name: 'eTime',
                            //													key: 'eTime',
                            //													label: '结束日期',
                            //													required: true,
                            //													value: '',
                            //													type: V.Classes['v.component.Form'].TYPE.DATE,
                            //												};
                            //												items.push(item0);
                            //												items.push(item1);
                            //												form.init({
                            //													container: $('.ctime', con),
                            //													items: items,
                            //													colspan: 2
                            //												});
                            //												var dlg = new V.Classes['v.ui.Dialog']();
                            //												dlg.setContent(con);
                            //												dlg.setBtnsBar({
                            //													position: 'center',
                            //													btns: [{
                            //														text: '确定',
                            //														style: 'btn-primary',
                            //														handler: function(){
                            //															if (form.validate()) {
                            //																if (!flag) {
                            //																	//V.confirm("确认执行手动任务?",function ok(e){
                            //																	var formvalue = form.getValues();
                            //																	if (formvalue != undefined && formvalue != null) {
                            //																		$.each(formvalue, function(n, v){
                            //																			record[n] = v;
                            //																		})
                            //																	}
                            //																	that.list.renderSubrow(record);
                            //																//});
                            //																}
                            //																else {
                            //																	if ($(tr).next('.v-grid-subrow').is(":visible")) {
                            //																		$(tr).next('.v-grid-subrow').hide();
                            //																	}
                            //																	else {
                            //																		$(tr).next('.v-grid-subrow').show();
                            //																	}
                            //																}
                            //																this.close();
                            //															}
                            //														}
                            //													}, {
                            //														text: '取消',
                            //														handler: function(){
                            //															this.close();
                            //														}
                            //													}]
                            //												});
                            //												dlg.init({
                            //													width: 630,
                            //													height: 200,
                            //													title: "抽取时间"
                            //												});
                            //											}
                            
//                            if (!flag) {
//                                V.confirm(GatewayLang.Schedule.Confirm_execution_of_manual_task + "?", function ok(e){
//                                    that.list.renderSubrow(record);
//                                });
//                            }
//                            else {
//                                if ($(tr).next('.v-grid-subrow').is(":visible")) {
//                                    $(tr).next('.v-grid-subrow').hide();
//                                }
//                                else {
//                                    $(tr).next('.v-grid-subrow').show();
//                                }
//                            }
                            
                            
                        });
                        
                        $('.remove', html).click(function(){
                            V.confirm(GatewayLang.Schedule.Confirm_delete_tasks+"?", function ok(e){
                                that.removeTask(record);
                            });
                        });
                        $('.resume', html).click(function(){
                            V.confirm(GatewayLang.Schedule.Confirm_resume_tasks+"?", function ok(e){
                                that.resumeTask(record);
                            });
                        });
                        $('.stop', html).click(function(){
                            V.confirm(GatewayLang.Schedule.Confirm_stop_task+"?", function ok(e){
                                that.stopTask(record);
                            });
                        });
                        $('.triggeredit', html).click(function(){
//                            if (record.triggerType == "ETL") {
//                                that.addEditAptTask(record);
//                            }
//                            else if (record.triggerType = "CUSTOM") {
//                                that.addEditTask(record);
//                            }
                        	that.addEditAptTask(record);
                        });
                        return html;
                    }
                }],
                toolbar: toolbar,
                subrowRender: function(record){
                    var task;
                    var html = $('<div class="taskSteps"><div class="step_icons"></div><div class="step_text"></div></div>');
                    if (record.steps != null && record.steps != undefined) {
                        task = {};
                        task["steps"] = record.steps;
                        task["currentStep"] = record.currentStep;
                        task["id"] = record.id;
                        task["toTask"] = false;
                        task["adapterId"] = record.adapterId;
                        that.InitSteps(task, html);
                    }
                    else {
                        var url = 'quartzJson/jquartzs!runJob.action';
                        var data = {};
                        if (record.sTime != undefined && record.eTime != undefined) {
                            data = {
                                id: record.id,
                                sTime: record.sTime,
                                eTime: record.eTime
                            };
                        }
                        else {
                            data = {
                                id: record.id
                            };
                        }
                        
                        $.ajax({
                            url: url,
                            data: data,
                            dataType: 'json',
                            success: function(task){
                                that.InitSteps(task, html);
                            }
                        });
                    }
                    return html;
                }
            });
            this.subscribe(list, 'add', this.addEditTask);
            this.subscribe(list, 'addapt', this.addEditAptTask);
            this.subscribe(list, 'remove', this.removePosts);
			this.subscribe(list, 'send', this.sendTask);
            this.container.append(this.template);
            
            this.subscribe(list, list.EVENT.DATA_LOADED, function(data){
                $.each(data.options.data, function(i){
                    if (this.steps != null && this.steps != undefined) {
                        that.list.renderSubrow(this);
                        //$('.v-grid-tr:eq('+i+') .ha_start',list.template).trigger('click');
                    }
                });
            });
        }
        TaskManageList.prototype.InitSteps = function(task, html){
            var that = this;
            var id = task.id;
            var steps = task.steps;
            var toTask = task.toTask;
            that.steps = steps;
            var cur = task.currentStep;
            $.each(steps, function(i){
                var node = $('<span class="stepNode"></span>');
                var arrow = $('<span></span>');
                var step_text = $('<span></span>').text(this.toString());
                if (i < cur) {
                    node.addClass('finishedNode');
                    arrow.addClass('arrow1');
                }
                else 
                    if (i == cur) {
                        if (i == 0) {
                            node.addClass('runningNode');
                            arrow.addClass('arrow2');
                        }
                        else {
                            node.addClass('nextNode');
                            arrow.addClass('arrow2');
                        }
                    }
                    else {
                        arrow.addClass('arrow2');
                    }
                $('.step_icons', html).append(node).append(arrow);
                $('.step_text', html).append(step_text);
            });
            var endNode = $('<span class="stepNode endNode"></span>');
            $('.step_icons', html).append(endNode);
            $('.step_text', html).append('<span>'+GatewayLang.Schedule.End+'</span>');
            var msg = $("<span class='msg'></span>");
            $('.step_icons', html).append(msg);
            //$('.step_text',html).append($("<span></span>"));
            //			$('.stop',html).click(function(){
            //				$.ajax({
            //						url: 'quartzJson/Jquartz!interruptJob.action',
            //						data: {id: id},
            //						success: function(data){
            //							 if(data != undefined && data.flag == '0'){
            //		                		 V.alert(data.smsg);
            //								 that.list.refresh();
            //							}else if(data != undefined){
            //								V.alert(data.smsg);
            //							}else{
            //								V.alert("终止失败!");
            //							}
            //						}
            //					});
            //			})
            if (cur == 0 && toTask == undefined) {
                var node = $(".stepNode:eq(0)", html).addClass('runningNode');
                var inter = setInterval(function(){
                    $.ajax({
                        url: 'quartzJson/jquartzs!nextStep.action',
                        data: {
                            id: id,
                            index: cur + 1
                        },
                        success: function(data){
                            if (data == 'start') {
								$(node).removeClass('runningNode').addClass('finishedNode');
								$(node).next().removeClass('arrow2').addClass('arrow1');
								$(node).next().next().addClass('nextNode');
								if (task.adapterId) {
									var action = $('<a style="display:block" href="javascript:void(0)"></a>');
									if (cur == 0) {
										if (task.adapterId != undefined && (task.adapterId.indexOf("ORDER") > -1 || task.adapterId.indexOf("STOCK") > -1)) {
											action.text(GatewayLang.Schedule.View_data);
											action.click(function(){
												that.viewStep1Data(task.adapterId);
											});
											$('.step_text span:eq(' + cur + ')', html).append(action);
										}
									}
									else 
										if (cur == 1) {
											action.text(GatewayLang.Schedule.Download_file);
										}
								}
								//$('.step_text:eq('+cur+')',html).append('<a style="display:block" href="javascript:void()"></a>')
								clearInterval(inter);
								cur += 1;
							}
							else 
								if (data == 'error') {
									$(node).removeClass('runningNode').addClass('errorNode');
									clearInterval(inter);
									$('.msg', html).text(GatewayLang.Schedule.Error_executing);
								}
								else 
									if (data == 'allend') {
										$(node).removeClass('runningNode').addClass('finishedNode');
										$(node).next().removeClass('arrow2').addClass('arrow1');
										$(node).next().next().addClass('nextNode');
										clearInterval(inter);
										cur = 0;
										that.list.refresh();
										V.alert(GatewayLang.Schedule.Error_executing+"!");
									}
                        }
                    });
                }, 3000);
            }
            $('.nextNode', html[0]).live('click', function(){
                var node = this;
                $(node).removeClass('nextNode').addClass('runningNode');
                if (cur == 1) {
                    $('.step_text', html).find("a").hide();
                }
                var inter = setInterval(function(){
                    $.ajax({
                        url: 'quartzJson/jquartzs!nextStep.action',
                        data: {
                            id: id,
                            index: cur,
                            click: "click"
                        },
                        success: function(data){
                            if (data == 'start') {
                                $(node).removeClass('runningNode').addClass('finishedNode');
                                $(node).next().removeClass('arrow2').addClass('arrow1');
                                $(node).next().next().addClass('nextNode');
                                
                                if (cur == 1) {
                                    var action = $('<a style="display:block" href="javascript:void(0)"></a>');
                                    action.text(GatewayLang.Schedule.Download_file);
                                    action.click(function(){
                                        that.downloadData(id);
                                    });
                                    $('.step_text span:eq(' + cur + ')', html).append(action);
                                }
                                cur += 1;
                                if (cur == that.steps.length) {
                                    //V.alert("手动任务执行完毕!");
                                   // that.list.refresh();
                                }else{
									clearInterval(inter);
								}
								
                            }
                            else 
                                if (data == 'error') {
                                    $(node).removeClass('runningNode').addClass('errorNode');
                                    clearInterval(inter);
                                //V.alert("任务执行异常!请到异常任务中查看。");
                                }
                                else 
                                    if (data == 'allend') {
                                        $(node).removeClass('runningNode').addClass('finishedNode');
                                        $(node).next().removeClass('arrow2').addClass('arrow1');
                                        $(node).next().next().addClass('nextNode');
                                        clearInterval(inter);
                                        cur = 0;
                                        that.list.refresh();
										V.alert(GatewayLang.Schedule.Manual_tasks_completed+"!");
                                    //cur += 1;
                                    //if (cur == that.steps.length) {
                                    ///	cur = 0;
                                    //	V.alert("手动任务执行完毕!");
                                    //	that.list.refresh();
                                    //}
                                    }
                        }
                    });
                }, 3000);
            });
        }
		
		TaskManageList.prototype.sendTask = function(){
			var that = this;
			V.confirm(GatewayLang.Adapter.comfirmcommit,function(){
				$.ajax({
					url:'data/center!saveToQueue.action',
					type:'post',
					data:{partner:that.partner},
					success: function(data){
						if (data == 'success') {
							V.alert(GatewayLang.Adapter.remoteupgrade);
						}else  if (data == 'isnull') {
							V.alert(GatewayLang.Adapter.notmodify);
						}
					}
				});
			});
		}
		
        TaskManageList.prototype.downloadData = function(id){
			$.ajax({
                url: 'quartzJson/jquartzs!checkFile.action',
                data: {
                    id: id
                },
                success: function(data){
						if(data != null && data!= undefined && data.flag == 'success' && data.path != ''){
							$('<div class="form_content" style="display:none"></div>').appendTo('body');
			            	var form = $('<div><form name="customform" id="customform" method="POST" action=""></form></div>');
			            	$('body .form_content').append(form);
			            	$("#customform").attr("action", "down/downloadServlet?filePath="+data.path);
			           		 $("#customform").submit();
						}
					}
			});
        }
        TaskManageList.prototype.viewStep1Data = function(adapterId){
            var grid = new V.Classes['v.ui.Grid']();
            var dlg = new V.Classes['v.ui.Dialog']();
            var pagination = new V.Classes['v.ui.Pagination']();
            grid.setPagination(pagination);
            dlg.init({
                title: GatewayLang.Schedule.View_data,
                width: 800,
                height: 450
            });
            if (adapterId.indexOf("ORDER")>-1) {//adapterId == 'HENKELORDEREXCEL'
                grid.init({
                    container: dlg.getContent(),
                    url: 'edisales/sales!outboxList.action',
                    columns: [{
                        displayName: GatewayLang.DataCenter.Sale_code,
                        key: 'orderCode',
                        width: 80
                    }, {
                        displayName: GatewayLang.DataCenter.Sale_endcstmcode,
                        key: 'dealerStoreCode',
                        width: 80
                    }, {
                        displayName: GatewayLang.DataCenter.Sale_endcstmname,
                        key: 'dealerStoreName',
                        width: 80
                    }, {
                        displayName: GatewayLang.DataCenter.Number,
                        key: 'quantity',
                        width: 80
                    }, {
                        displayName: GatewayLang.DataCenter.Tax_price,
                        key: 'unitPrice',
                        width: 80
                    }, {
                        displayName: GatewayLang.DataCenter.Tax_amount,
                        key: 'unitAmount',
                        width: 80
                    }]
                })
                
            }
            else 
                 if (adapterId.indexOf("STOCK")>-1) {//if (adapterId == 'HENKELSTOCKEXCEL') {
                    grid.init({
                        container: dlg.getContent(),
                        url: 'edistock/stock!outboxList.action',
                        columns: [{
                            displayName: GatewayLang.DataCenter.Product_code,
                            key: 'dealerProductCode',
                            width: 80
                        }, {
                            displayName: GatewayLang.DataCenter.Product_name,
                            key: 'dealerProductName',
                            width: 80
                        }, {
                            displayName: GatewayLang.DataCenter.Number,
                            key: 'quantity',
                            width: 80
                        }, {
                            displayName: GatewayLang.DataCenter.Tax_price,
                            key: 'unitPrice',
                            width: 80
                        }, {
                            displayName: GatewayLang.DataCenter.Tax_amount,
                            key: 'unitAmount',
                            width: 80
                        }]
                    })
                }
            
        }
        TaskManageList.prototype.addEditAptTask = function(record){
            var that = this;
            /** Dialog* */
            var html = $('<div><div class="brand"></div></div>');
            var addDlg = new V.Classes['v.ui.Dialog']();
            var form = new V.Classes['v.component.Form']();
            addDlg.setBtnsBar({
                btns: [{
                    text: GatewayLang.Public.Ensure,
                    style: "btn-primary",
                    handler: function(){
                        if (!that.validate(addDlg.template)) {
                            return;
                        }
						that.saveTaskInfo(addDlg,record);
                    }
                }, {
                    text: GatewayLang.Public.Cancel,
                    handler: addDlg.close
                }]
            });
            addDlg.init({
                title: GatewayLang.Schedule.New_adapter_job,
                height: 550,
                width: 760
            });
            /** 将Grid中的数据加入到Dialog中* */
            
            $.ajax({
                url: this.getPath() + "/assets/apt_template.html",
                dataType: 'html',
                success: function(dom){
                    var d = $(dom);
                   
					d = $(V.Util.parseLangEncode(d[0].outerHTML));
                    $('.datepicker', d).datepicker({
                        dateFormat: "yy-mm-dd",
                        showMonthAfterYear: true
                    });
                   that.initQuartzEvent(d);
				   that.initAptData(d, record);
				   addDlg.setContent(d);
//				   that.initAdapterMenuData(addDlg,record);
//				   if (that.partner == '' || that.partner == undefined) {
//				   		that.initProtocolInfo(addDlg, record);
//				   }else{
//						$('.protocol', d).hide();
//						$('.operation', d).hide();
//						$('.partner', d).hide();
//					}
                }
            });
        }
		TaskManageList.prototype.initAdapterMenu = function(addDlg,record){
			 var levels = $('<tr><td>厂商:</td><td><select style="margin-left:10px;" class="sel_level1 input-middle"><option value="-1">请选择</option></select></td></tr>'
					+'<tr><td>产品系列:</td><td><select style="margin-left:10px;" class="sel_level2 input-middle"></select></td></tr>'
					+'<tr><td>版&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;本:</td><td><select style="margin-left:10px;" class="sel_level3 input-middle"></select></td></tr>'
					+'<tr><td>业务类型:</td><td><select style="margin-left:10px;" class="sel_level4 input-middle"></select></td></tr>');
		     this.area.init({container:$('.aptSelect',addDlg.template).empty(),levels:levels,record:record,type:'2',partner:this.partner});
		}
		TaskManageList.prototype.initAdapterMenuData = function(addDlg,record){
			var that = this;
			 var adapterId = record.adapterId;
			 $.ajax({
					url:'party/partyconfig!searchById.action',
					type:'POST',
					data:{id:adapterId,partner:that.partner},
					success:function(data){
						  that.initAdapterMenu(addDlg,data);
					}
				});
		}
		TaskManageList.prototype.saveTaskInfo = function(addDlg,record){
			var that = this;
			var trigger = {};
//			var adapter = $(".sel_level4", addDlg.template).val();
//			if(!adapter){
//				V.alert("请选择适配器信息!");
//				return;
//			}
            if (record != undefined && record != null) {
                trigger['id'] = record.id;
				trigger['enabled'] = record.enabled;
            }
            trigger['triggerName'] = $("input[name=triggerName]", addDlg.template).val();
            trigger['jobName'] = 'com.nebula.commons.timer.AdapterTimer';
            trigger['config'] = $("textarea[name=config]", addDlg.template).val();
            trigger['host'] = $("select[name=host]",addDlg.template).val();
            trigger['dataAdapterId'] = $("select[name=dataAdapterId]",addDlg.template).val();
//            trigger['dataAdapterType'] = $("select[name=dataAdapterType]",addDlg.template).val();
            trigger['triggerType'] = $("select[name=dataAdapterType]",addDlg.template).val();
//			trigger['adapterId'] = adapter;
			trigger['description'] = $("textarea[name=description]", addDlg.template).val();
			trigger['runType'] = $("input[name=runType]:checked", addDlg.template).val();
			trigger['weight']=$("select[name=weight]",addDlg.template).val();
			//trigger['autoSend'] = $("input[name=autoSend]:checked", addDlg.template).val();
//			trigger['autoSend'] = 'Y';
			
//			if(that.partner != '' && that.partner != undefined){
//				trigger['protocol'] = record['protocol'];
//				trigger['operation'] = record['operation'];
//				trigger['partner'] = record['partner'];
//			}else{
//				trigger['protocol'] = $("select[name=protocol]", addDlg.template).val();
//				trigger['operation'] = $("select[name=operation]", addDlg.template).val();
//				trigger['partner'] = $("select[name=partner]", addDlg.template).val();
//				if(trigger['protocol'] == '' || trigger['protocol'] == undefined){
//					 V.alert("请选择业务协议!");
//					 return;
//				}
//				if(trigger['operation'] == '' || trigger['operation'] == undefined){
//					 V.alert("请选择协作交易!");
//					 return;
//				}
//				if(trigger['partner'] == '' || trigger['partner'] == undefined){
//					 V.alert("请选择交易伙伴!");
//					 return;
//				}
//			}
			
			if(trigger['runType'] == '-1' ){
				
			}else if(trigger['runType'] == '2' ){
				  var cron = $("input[name=cron]", addDlg.template).val();
				  var startTime = $("input[name=startTime]", addDlg.template).val();
           		  trigger['startTime'] = startTime;
				  var endTime = $("input[name=endTime]", addDlg.template).val();
           	 	  trigger['endTime'] = endTime;
//				  trigger['mobile'] = $("input[name=mobile]", addDlg.template).val();
//         		  trigger['email'] = $("input[name=email]", addDlg.template).val();
			}else if(trigger['runType'] == '1' ){
				  var repeatInterval = $("input[name=repeatInterval]", addDlg.template).val() || 0;
           		  var repeatCount = $("input[name=repeatCount]", addDlg.template).val() || 0;
				  var startTime = $("input[name=startTime]", addDlg.template).val();
           		  trigger['startTime'] = startTime;
				  var endTime = $("input[name=endTime]", addDlg.template).val();
           	 	  trigger['endTime'] = endTime;
//				  trigger['mobile'] = $("input[name=mobile]", addDlg.template).val();
//           		  trigger['email'] = $("input[name=email]", addDlg.template).val();
			}else if(trigger['runType'] == '0' ){
				 	var startTime = $("input[name=startTime]", addDlg.template).val();
           		 	trigger['startTime'] = startTime;
				 	var endTime = $("input[name=endTime]", addDlg.template).val();
           	 	 	trigger['endTime'] = endTime;
					var hour = $("select[name=hour]", addDlg.template).val();
                    var minute = $("select[name=minute]", addDlg.template).val();
                    var second = $("select[name=second]", addDlg.template).val();
                    var clType = $("input[name=clType]:checked", addDlg.template).val();
                    var monthday = $("select[name=monthday]", addDlg.template).val();
                    var month = $("select[name=month]", addDlg.template).val();
                    var day = $("select[name=day]", addDlg.template).val();
//                    trigger['mobile'] = $("input[name=mobile]", addDlg.template).val();
//           		 	trigger['email'] = $("input[name=email]", addDlg.template).val();
                    var week = new Array();
                    $("input[name=week]:checked", addDlg.template).each(function(){
                        week.push($(this).val());
                    })
			}
			trigger['type'] = 0;
            
            $.ajax({
                url: "quartzJson/jquartzs!save.action",
                type: 'POST',
                data: JSON.stringify({
                    entity: trigger,
                    cron: cron,
                    repeatInterval: repeatInterval,
                    repeatCount: repeatCount,
                    hour: hour,
                    minute: minute,
                    second: second,
                    clType: clType,
                    monthday: monthday,
                    month: month,
                    day: day,
                    week: week,
					partner:that.partner
                }),
                contentType: 'application/json',
                success: function(data){
                    if (data == "success") {
                        V.alert(GatewayLang.Public.Save_success+"!");
                        that.list.refresh();
                        addDlg.close();
                    }else if (data == "success_partner") {
                        V.alert("操作成功,温馨体提示:此命令需要提交远程更新操作!");
						that.list.refresh();
                        addDlg.close();
                    }
                    else if (data == "error_class") {
                        V.alert(GatewayLang.Schedule.The_task_script_is_invalid+"!");
                    }
                    else 
                        if (data == "error_cron") {
                            V.alert(GatewayLang.Schedule.Time_expression_illegal+"!");
                        }
                        else {
                             V.alert(GatewayLang.Schedule.Save_fail+"!");
                        }
                }
            });
		}
		TaskManageList.prototype.dataAdapterList = function(d, trigger){
			$.ajax({
            	url: "dataadapter/data-adapter!dataAdapterList.action",
            	type: 'POST',
            	data: {'type':$("select[name=dataAdapterType]",d).val()},
            	success:function(data){
	            	var options = [];
	            	$.each(data,function(index,dataapter){
	            		options.push("<option value='" + dataapter.id + "'> " + dataapter.docketName + " </option>");
	            	});
	            	$("#dataAdapterId",d).empty();
	            	$("#dataAdapterId",d).append(options.join(''));
	            	if(trigger&&trigger.id!=null){
		            	$("select[name=dataAdapterId]",d).val(trigger['dataAdapterId'] || '');
	            	}
	            }
            });
		}
        TaskManageList.prototype.initAptData = function(d, trigger){
            var that = this;
            var triggerTypeList = DictInfo.getList("SCRIPT_TYPE");
            var options = [];
            $.each(triggerTypeList,function(){
            	options.push("<option value='" + this[1] + "'> " + this[0] + " </option>");
            })
            $("select[name=dataAdapterType]",d).append(options.join(''));
            $("select[name=dataAdapterType]",d).val(trigger['triggerType'] || '');
            
            /*	
            $.ajax({
                url: "runtime/run-time!getAllRunTime.action",
                type: 'POST',
                success:function(data){
	      		  var options = [];
	      		  $.each(data,function(index,runtime){
	      			  options.push("<option value='" + runtime.docketName + "'> " + runtime.docketName + " </option>");
	      		  });
	      		  $("#host",d).append(options.join(''));
	      		  $("select[name=host]",d).val(trigger['host'] || '');
	      		  $("select[name=weight]",d).val(trigger['weight'] || '');
      	  		}
      	  	});
      	  	*/
            
      	  	that.dataAdapterList(d, trigger);
      	  	
            $("input[name=triggerName]", d).val(trigger['triggerName'] || '');
            $("textarea[name=description]", d).val(trigger['description'] || '');
            $("textarea[name=config]", d).val(trigger['config'] || '');
            $("input[name=mobile]", d).val(trigger['mobile'] || '');
            $("input[name=email]", d).val(trigger['email'] || '');
            if (trigger['startTime'] != '' && trigger['startTime'] != null) {
                $("input[name=startTime]", d).val(V.Util.formatlineDate(new Date(trigger['startTime'])))
            }
            if (trigger['endTime'] != '' && trigger['endTime'] != null) {
                $("input[name=endTime]", d).val(V.Util.formatlineDate(new Date(trigger['endTime'])))
            }
//            $("select[name=aptSelect]", d).val(trigger['adapterId'] || '');
            $("input[name=cron]", d).val(trigger['cron'] || '');
            var runType = trigger['runType'] || '';
            $("input[name=runType]", d).each(function(){
                if ($(this).val() == runType) {
                    $(this).attr("checked", true);
                }
            });
            if(trigger.id==null){
            	$("input[name=runType]:eq(0)", d).click();	
            }
            
//			var autoSend = trigger['autoSend'] || '';
//			$("input[name=autoSend]", d).each(function(){
//                if ($(this).val() == autoSend) {
//                    $(this).attr("checked", true);
//                }
//            });
			
            var props = trigger.props;
            if (props == null || props == '') {
                return;
            }
            $("input[name=repeatInterval]", d).val(props['repeatInterval'] || '');
            $("input[name=repeatCount]", d).val(props['repeatCount'] || '');
            var clType = props['clType'] || '';
            $("input[name=clType]", d).each(function(){
                if ($(this).val() == clType) {
                    $(this).attr("checked", true);
                }
            });
            var week = props['week'] || '';
            if (week != '' && week != undefined) {
                $.each(week.split(','), function(){
                    var th = this;
                    $("input[name=week]", d).each(function(){
                        if ($(this).val() == th) {
                            $(this).attr("checked", true);
                        }
                    });
                })
            }
            
            $("select[name=hour]", d).val(props['hour'] || '');
            $("select[name=minute]", d).val(props['minute'] || '');
            $("select[name=second]", d).val(props['second'] || '');
            $("select[name=monthday]", d).val(props['monthday'] || '');
            $("select[name=month]", d).val(props['month'] || '');
            $("select[name=day]", d).val(props['day'] || '');
            
            if (runType == "2") {
                $(".cron", d).show();
                $(".fixed", d).hide();
                $(".week", d).hide();
                $(".week1", d).hide();
                $(".week2", d).hide();
                $(".week3", d).hide();
				$(".startTime", d).show();
				$(".endTime", d).show();
				$(".mobile", d).show();
				$(".email", d).show();
            }
            else 
                if (runType == '1') {
                    $(".cron", d).hide();
                    $(".fixed", d).show();
                    $(".week", d).hide();
                    $(".week1", d).hide();
                    $(".week2", d).hide();
                    $(".week3", d).hide();
					$(".startTime", d).show();
					$(".endTime", d).show();
					$(".mobile", d).show();
					$(".email", d).show();
                }
                else 
                    if (runType == '0') {
                        $(".cron", d).hide();
                        $(".fixed", d).hide();
                        $(".week", d).show();
						$(".startTime", d).show();
						$(".endTime", d).show();
						$(".mobile", d).show();
						$(".email", d).show();
                        that.setValue(clType, d);
                    }
                    else 
                        if (runType == '-1') {
                            $(".cron", d).hide();
                            $(".fixed", d).hide();
                            $(".week", d).hide();
                            $(".week1", d).hide();
                            $(".week2", d).hide();
                            $(".week3", d).hide();
                        }
            
        }
        /**
         * 暂停任务
         * @param {Object} record
         */
        TaskManageList.prototype.pauseTask = function(record){
            var url = "quartzJson/jquartzs!pauseJob.action";
            this.doTask(url, record);
        }
        /**
         * 恢复任务
         * @param {Object} record
         */
        TaskManageList.prototype.resumeTask = function(record){
            var url = "quartzJson/jquartzs!resumeJob.action";
            this.doTask(url, record);
        }
        /**
         * 停止任务
         * @param {Object} record
         */
        TaskManageList.prototype.stopTask = function(record){
            var url = "quartzJson/jquartzs!interruptJob.action";
            this.doTask(url, record);
        }
        /**
         * 开始任务
         * @param {Object} record
         */
        TaskManageList.prototype.startTask = function(record){
            var url = "quartzJson/jquartzs!resumeJob.action";
            this.doTask(url, record);
        }
        /**
         * 手动执行
         * @param {Object} record
         */
        TaskManageList.prototype.manualstartTask = function(record){
            //
            var url = "quartzJson/jquartzs!runJobManual.action";
            this.doTask(url, record);
        }
        /**
         * 删除任务
         * @param {Object} record
         */
        TaskManageList.prototype.removeTask = function(record){
            var url = "quartzJson/jquartzs!removeJob.action";
            this.doTask(url, record);
        }
        TaskManageList.prototype.doTask = function(url, record){
            var that = this;
            $.ajax({
                url: url,
                type: 'POST',
                data: {
                    id: record['id'],
					partner:that.partner
                },
                success: function(data){
                    if (data != undefined && data.flag == '0') {
                        V.alert(data.smsg);
                        that.list.refresh();
                        //addDlg.close();
                    }
                    else 
                        if (data != undefined) {
                            V.alert(data.smsg);
                        }
                        else {
                            V.alert(GatewayLang.Public.Failed_to_run+"!");
                        }
                }
            });
        }
        
        TaskManageList.prototype.addEditTask = function(record){
            var that = this;
            /** Dialog* */
            var html = $('<div><div class="brand"></div></div>');
            var addDlg = new V.Classes['v.ui.Dialog']();
            var form = new V.Classes['v.component.Form']();
            addDlg.setBtnsBar({
                btns: [{
                    text: GatewayLang.Public.Ensure,
                    style: "btn-primary",
                    handler: function(){
                        if (!that.validate(addDlg.template)) {
                            return;
                        }
						var trigger = {};
                        if (record != undefined && record != null) {
                            trigger['id'] = record.id;
							trigger['enabled'] = record.enabled;
                        }
                        trigger['triggerName'] = $("input[name=triggerName]", addDlg.template).val();
                        trigger['jobName'] = $("input[name=jobName]", addDlg.template).val();
                        trigger['config'] = $("textarea[name=config]", addDlg.template).val();
                        trigger['adapterId'] = $("select[name=aptSelect]", addDlg.template).val();
                        trigger['description'] = $("textarea[name=description]", addDlg.template).val();
						trigger['runType'] = $("input[name=runType]:checked", addDlg.template).val();
						trigger['triggerType'] = $("select[name=dataAdapterType]", addDlg.template).val();
						if(that.partner != '' && that.partner != undefined){
							trigger['protocol'] = record['protocol'];
							trigger['operation'] = record['operation'];
							trigger['partner'] = record['partner'];
						}else{
							trigger['protocol'] = $("select[name=protocol]", addDlg.template).val();
							trigger['operation'] = $("select[name=operation]", addDlg.template).val();
							trigger['partner'] = $("select[name=partner]", addDlg.template).val();
						}
						if(trigger['runType'] == '-1' ){
							
						}else if(trigger['runType'] == '2' ){
							  var cron = $("input[name=cron]", addDlg.template).val();
							  var startTime = $("input[name=startTime]", addDlg.template).val();
                       		  trigger['startTime'] = startTime;
							  var endTime = $("input[name=endTime]", addDlg.template).val();
                       	 	  trigger['endTime'] = endTime;
							  trigger['mobile'] = $("input[name=mobile]", addDlg.template).val();
                       		  trigger['email'] = $("input[name=email]", addDlg.template).val();
						}else if(trigger['runType'] == '1' ){
							  var repeatInterval = $("input[name=repeatInterval]", addDlg.template).val() || 0;
                       		  var repeatCount = $("input[name=repeatCount]", addDlg.template).val() || 0;
							  var startTime = $("input[name=startTime]", addDlg.template).val();
                       		  trigger['startTime'] = startTime;
							  var endTime = $("input[name=endTime]", addDlg.template).val();
                       	 	  trigger['endTime'] = endTime;
							  trigger['mobile'] = $("input[name=mobile]", addDlg.template).val();
                       		  trigger['email'] = $("input[name=email]", addDlg.template).val();
						}else if(trigger['runType'] == '0' ){
								var startTime = $("input[name=startTime]", addDlg.template).val();
                       		 	trigger['startTime'] = startTime;
							 	var endTime = $("input[name=endTime]", addDlg.template).val();
                       	 	 	trigger['endTime'] = endTime;
								var hour = $("select[name=hour]", addDlg.template).val();
		                        var minute = $("select[name=minute]", addDlg.template).val();
		                        var second = $("select[name=second]", addDlg.template).val();
		                        var clType = $("input[name=clType]:checked", addDlg.template).val();
		                        var monthday = $("select[name=monthday]", addDlg.template).val();
		                        var month = $("select[name=month]", addDlg.template).val();
		                        var day = $("select[name=day]", addDlg.template).val();
		                        trigger['mobile'] = $("input[name=mobile]", addDlg.template).val();
                       		 	trigger['email'] = $("input[name=email]", addDlg.template).val();
		                        var week = new Array();
		                        $("input[name=week]:checked", addDlg.template).each(function(){
		                            week.push($(this).val());
		                        })
						}
						trigger['type'] = 1;
 
                        $.ajax({
                            url: "quartzJson/jquartzs!save.action",
                            type: 'POST',
                            data: JSON.stringify({
                                entity: trigger,
                                cron: cron,
                                repeatInterval: repeatInterval,
                                repeatCount: repeatCount,
                                hour: hour,
                                minute: minute,
                                second: second,
                                clType: clType,
                                monthday: monthday,
                                month: month,
                                day: day,
                                week: week,
								partner:that.partner
                            }),
                            contentType: 'application/json',
                            success: function(data){
                                if (data == "success") {
                                    V.alert(GatewayLang.Public.Save_success+"!");
                                    that.list.refresh();
                                    addDlg.close();
                                }else if(data == 'success_partner'){
									V.alert("操作成功,温馨提示:此命令需要提交远程更新操作!");
                                    that.list.refresh();
                                    addDlg.close();
								}else 
                                    if (data == "error_class") {
                                        V.alert(GatewayLang.Schedule.The_task_script_is_invalid+"!");
                                    }
                                    else 
                                        if (data == "error_cron") {
                                            V.alert(GatewayLang.Schedule.Time_expression_illegal+"!");
                                        }
                                        else {
                                            V.alert(GatewayLang.Public.Save_fail+"!");
                                        }
                            }
                        });
                    }
                }, {
                    text: GatewayLang.Public.Cancel,
                    handler: addDlg.close
                }]
            });
            addDlg.init({
                title: GatewayLang.Schedule.Add_a_custom_job,
                height: 550,
                width: 790
            });
            /** 将Grid中的数据加入到Dialog中* */
            
            $.ajax({
                url: this.getPath() + "/assets/template.html",
                dataType: 'html',
                success: function(dom){
            	 var d = $(dom);
            	 
					d = $(V.Util.parseLangEncode(d[0].outerHTML));
                    $('.datepicker', d).datepicker({
                        dateFormat: "yy-mm-dd",
                        showMonthAfterYear: true
                    });
                    that.initQuartzEvent(d);
                    that.initData(d, record);
                    addDlg.setContent(d);
                }
            });
        }
        TaskManageList.prototype.initData = function(d, trigger){
            var that = this;
            /*
            $.ajax({
                url: "runtime/run-time!getAllRunTime.action",
                type: 'POST',
                success:function(data){
      		  var options = [];
      		  $.each(data,function(index,runtime){
      			  options.push("<option value='" + runtime.docketName + "'> " + runtime.docketName + " </option>");
      		  });
      		  $("#host",d).append(options.join(''));
      		$("select[name=host]", d).val(trigger['host'] || '');
      	  	}
      	  });
      	  */
             
            $("input[name=triggerName]", d).val(trigger['triggerName'] || '');
            $("input[name=jobName]", d).val(trigger['jobName'] || '');
            $("textarea[name=config]", d).val(trigger['config'] || '');
            $("input[name=mobile]", d).val(trigger['mobile'] || '');
            $("input[name=email]", d).val(trigger['email'] || '');
            if (trigger['startTime'] != '' && trigger['startTime'] != null) {
                $("input[name=startTime]", d).val(V.Util.formatlineDate(new Date(trigger['startTime'])))
            }
            if (trigger['endTime'] != '' && trigger['endTime'] != null) {
                $("input[name=endTime]", d).val(V.Util.formatlineDate(new Date(trigger['endTime'])))
            }
            $("textarea[name=description]", d).val(trigger['description'] || '');
            $("input[name=cron]", d).val(trigger['cron'] || '');
            var runType = trigger['runType'] || '';
            $("input[name=runType]", d).each(function(){
                if ($(this).val() == runType) {
                    $(this).attr("checked", true);
                }
            });
            var props = trigger.props;
            if (props == null || props == '') {
                return;
            }
            $("input[name=repeatInterval]", d).val(props['repeatInterval'] || '');
            $("input[name=repeatCount]", d).val(props['repeatCount'] || '');
            var clType = props['clType'] || '';
            $("input[name=clType]", d).each(function(){
                if ($(this).val() == clType) {
                    $(this).attr("checked", true);
                }
            });
            var week = props['week'] || '';
            if (week != '' && week != undefined) {
                $.each(week.split(','), function(){
                    var th = this;
                    $("input[name=week]", d).each(function(){
                        if ($(this).val() == th) {
                            $(this).attr("checked", true);
                        }
                    });
                })
            }
            
            $("select[name=hour]", d).val(props['hour'] || '');
            $("select[name=minute]", d).val(props['minute'] || '');
            $("select[name=second]", d).val(props['second'] || '');
            $("select[name=monthday]", d).val(props['monthday'] || '');
            $("select[name=month]", d).val(props['month'] || '');
            $("select[name=day]", d).val(props['day'] || '');
            
            if (runType == "2") {
                $(".cron", d).show();
                $(".fixed", d).hide();
                $(".week", d).hide();
                $(".week1", d).hide();
                $(".week2", d).hide();
                $(".week3", d).hide();
				$(".startTime", d).show();
				$(".endTime", d).show();
				$(".mobile", d).show();
				$(".email", d).show();
            }
            else 
                if (runType == '1') {
                    $(".cron", d).hide();
                    $(".fixed", d).show();
                    $(".week", d).hide();
                    $(".week1", d).hide();
                    $(".week2", d).hide();
                    $(".week3", d).hide();
					$(".startTime", d).show();
					$(".endTime", d).show();
					$(".mobile", d).show();
					$(".email", d).show();
                }
                else 
                    if (runType == '0') {
                        $(".cron", d).hide();
                        $(".fixed", d).hide();
                        $(".week", d).show();
						$(".startTime", d).show();
						$(".endTime", d).show();
						$(".mobile", d).show();
						$(".email", d).show();
                        that.setValue(clType, d);
                    }
                    else 
                        if (runType == '-1') {
                            $(".cron", d).hide();
                            $(".fixed", d).hide();
                            $(".week", d).hide();
                            $(".week1", d).hide();
                            $(".week2", d).hide();
                            $(".week3", d).hide();
                        }
            
        }
        TaskManageList.prototype.initQuartzEvent = function(d){
            var that = this;
            
            $("select[name=dataAdapterType]",d).change(function(){
            	that.dataAdapterList(d);
            })
            
            $("input[name=runType]", d).click(function(){
                var value = $(this).val();
                if (value == "2") {
                    $(".cron", d).show();
                    $(".fixed", d).hide();
                    $(".week", d).hide();
                    $(".week1", d).hide();
                    $(".week2", d).hide();
                    $(".week3", d).hide();
                    $(".startTime", d).show();
                    $(".endTime", d).show();
                    $(".mobile", d).show();
                    $(".email", d).show();
                }
                else 
                    if (value == '1') {
                        $(".cron", d).hide();
                        $(".fixed", d).show();
                        $(".week", d).hide();
                        $(".week1", d).hide();
                        $(".week2", d).hide();
                        $(".week3", d).hide();
                        $(".startTime", d).show();
                        $(".endTime", d).show();
                        $(".mobile", d).show();
                        $(".email", d).show();
                    }
                    else 
                        if (value == '0') {
                            $(".cron", d).hide();
                            $(".fixed", d).hide();
                            $(".week", d).show();
                            $(".startTime", d).show();
                            $(".endTime", d).show();
                            $(".mobile", d).show();
                            $(".email", d).show();
                            that.setValue($("input[name=clType]:checked", d).val(), d);
                        }
                        else 
                            if (value == '-1') {
                                $(".cron", d).hide();
                                $(".fixed", d).hide();
                                $(".week", d).hide();
                                $(".week1", d).hide();
                                $(".week2", d).hide();
                                $(".week3", d).hide();
                                $(".startTime", d).hide();
                                $(".endTime", d).hide();
                                $(".mobile", d).hide();
                                $(".email", d).hide();
                            }
            });
            $("input[name=clType]", d).click(function(){
                var value = $(this).val();
                that.setValue(value, d);
            });
        }
        TaskManageList.prototype.setValue = function(value, d){
            if (value == "1") {
                $(".week1", d).hide();
                $(".week2", d).hide();
                $(".week3", d).hide();
            }
            else if (value == '2') {
                $(".week1", d).show();
                $(".week2", d).hide();
                $(".week3", d).hide();
            } else if (value == '3') {
                $(".week1", d).hide();
                $(".week2", d).show();
                $(".week3", d).hide();
            } else if (value == '4') {
                $(".week1", d).hide();
                $(".week2", d).hide();
                $(".week3", d).show();
            }
        }
        TaskManageList.prototype.validate = function(template){
            var isValid = true;
            $('*[data-validator]', template).each(function(){
                var required = $(this).attr('data-required') || false;
                var rules = $(this).attr('data-validator') || '';
                var v = $(this).val();
                if (required == "true" && v == "") {
                    $(this).parent().find('.error_msg').text(GatewayLang.Public.This_value_can_not_be_empty).show();
                    isValid = false;
                }
                else {
                    if (rules) {
                        var msg = Validator.validate(rules, v);
                        if (msg) {
                            $(this).parent().find('.error_msg').text(msg).show();
                            isValid = false;
                        }
                        else {
                            $(this).parent().find('.error_msg').empty().hide();
                        }
                    }
                    else {
                        $(this).parent().find('.error_msg').empty().hide();
                    }
                }
            });
            return isValid;
        }
		
        TaskManageList.prototype.updateCrumb = function(){
			if (this.partner == undefined || this.partner == '') {
				V.MessageBus.publish({eventId: "updateCrumb", data: {ns: this.ns, options: this.options,name: GatewayLang.Schedule.Timing_tasks}});
			}
        }
        TaskManageList.prototype.addCrumb = function(){
            if (this.partner == undefined || this.partner == '') {
				V.MessageBus.publish({eventId: "addCrumb", data: { ns: this.ns, options: this.options,name: GatewayLang.Schedule.Timing_tasks}});
			}
        }
    })(V.Classes['v.views.adapterJob.AdapterJobList']);
}, {
    plugins: ['v.component.searchList', "v.ui.grid", 'v.ui.confirm','v.component.area', 'v.ui.alert', "v.ui.dialog"]
});