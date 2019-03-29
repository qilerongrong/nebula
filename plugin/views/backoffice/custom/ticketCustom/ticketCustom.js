;V.registPlugin("v.views.backoffice.custom.ticketCustom",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.TicketCustom",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.views.backoffice.custom.ticketCustom';
			this.ticket = null;
			this.dirtyTicket = null;
			this.maxSortNo = 0;
			this.module='';
			this.viewType = "view";//view,edit,setting
			this.resource = {
				html:'template.html'
			}
		}
	});
	//isShow字段暂时没用（界面无相应字段与它对应）。
	(function(TicketCustom){
		TicketCustom.prototype.init = function(options){
			this.options = options;
			this.container = options.container;
			this.module = options.module;
			this.platformNo = options.platformNo||'';
			
			if (this.platformNo == '') {
				this.platformNo = LoginInfo.user.createByPlatformNo;
			}else{
				this.queryPlatformDictInfo(this.platformNo);
			}
			
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
					that.getModuleType();
					// that.initIsAll();
				}
		     });
		}
		TicketCustom.prototype.initIsAll = function(){
			var isSuper = LoginInfo.isSuperPlatform;
			var user = LoginInfo.user;
			if (isSuper && this.platformNo == user.createByPlatformNo) {
		     	$('#isAll',this.template).show();
		     	$('.addBlock',this.template).show();
		     	// $('.addDetailBlock',this.template).show();
		    }else{
		    	$('#isAll',this.template).hide();
		     	$('.addBlock',this.template).hide();
		     	// $('.addDetailBlock',this.template).hide();
		    }
		}
		
		TicketCustom.prototype.initEvent = function(){
			var that = this;
			$('.tab-docket',that.template[0]).live('click',function(){
				var tabs =  $('.nav-tabs',that.template).children('li');
				var panes = $('.tab-content',that.template).children('.tab-pane');
				if($(this).hasClass('active')){
					return false;
				}else{
					tabs.removeClass('active');
					$(this).addClass('active');
					panes.removeClass('active');
					var index = $(this).index();
					$(panes.get(index)).addClass('active');
				}
			});
			//切换视图
			$('.viewType .btn',this.template).click(function(){
				if($(this).hasClass('active')){
					return
				}
				$('.viewType .active',that.template).removeClass('active');
				$(this).addClass('active');
				if($(this).hasClass('type_view')){
					that.switchToView();
				}else if($(this).hasClass('type_edit')){
					that.switchToEdit();
				}else if($(this).hasClass('type_list')){
					that.switchToList();
				}else if($(this).hasClass('type_setting')){
					that.switchToSetting();
				}
			})
			//显示当前对哪个主体进行配置
			// if(this.party){
			// 	$('.partyName',this.template).html('企业名称：'+this.party.partyName)
			// }
			//选择模块
			$('.modulesType',this.template).change(function(){
				var type = this.value;
                //财务模块才有主从的设置。
                if(type == "FINANCE"){
                    $('.lbl_tableType',that.template).show();
                }else{
                    $('.lbl_tableType',that.template).hide();
                };
				that.getTicketsType(type);
			});
			//选择类型
			$('.ticketsType',this.template).change(function(){
				var type = this.value;
				var moduleType = $('.modulesType',this.template).val();
				that.getTicketInfo(type,moduleType);
			});
			$('.saveDocketType',this.template).click(function(){
				that.saveDocketType();
			});
			//block上下移动
			$('.tools .icon-arrow-down',this.template[0]).live('click',function(){
				var item = $(this).parents('.tools');
				var con = item.parent('.block_con');
				var item_index = item.index();
				var sortno1 = item.data('data-info').sortno;
				var next = item.next();
                var sortno2 = next.data('data-info').sortno;
				var next_index = item_index+1;
                that.dirtyTicket.customs = [];
                var block1 = item.data('data-info');
                block1.sortno = sortno2;
                var block2 = next.data('data-info');
                block2.sortno = sortno1;
                that.dirtyTicket.customs.push(block1);
                that.dirtyTicket.customs.push(block2);
                that.moveBlock(function(){
                        if(next_index == $('.subblock',con).length-1){
        					$('.tools .icon-arrow-down',next).parent().show();
        					$('.tools .icon-arrow-down',item).parent().hide();
        				}
        				if(item_index == 0){
        					$('.tools .icon-arrow-up',item).parent().show();
        					$('.tools .icon-arrow-up',next).parent().hide();
        				}
        				item.data('data-info').sortno = sortno1;
        				next.data('data-info').sortno = sortno2;
        				item.insertAfter(next);
                });
			});
			$('.tools .icon-arrow-up',this.template[0]).live('click',function(){
				var item = $(this).parents('.subblock');
				var con = item.parent('.block_con');
				var item_index = item.index();
				var sortno1 = item.data('data-info').sortno;
				var prev = item.prev();
                var sortno2 = prev.data('data-info').sortno;
				var prev_index = item_index-1;
                //var that = this;
                that.dirtyTicket.customs = [];
                var block1 = item.data('data-info');
                block1.sortno = sortno2;
                var block2 = prev.data('data-info');
                block2.sortno = sortno1;
                that.dirtyTicket.customs.push(block1);
                that.dirtyTicket.customs.push(block2);
                that.moveBlock(function(){
                      if(prev_index == 0){
        					$('.tools .icon-arrow-up',prev).parent().show();
        					$('.tools .icon-arrow-up',item).parent().hide();
        				}
        				if(item_index == $('.subblock',con).length-1){
        					$('.tools .icon-arrow-down',item).parent().show();
        					$('.tools .icon-arrow-down',prev).parent().hide();
        				}
        				item.data('data-info').sortno = sortno2;
        				prev.data('data-info').sortno = sortno1;
        				item.insertBefore(prev);
                });
			});
			//编辑模块
			$('.tools .editblock',this.template[0]).live('click',function(){
				var info = $(this).parents('.tools').data('data-info');
				that.editBlock(info);
            });
            //编辑unused字段
            $('.tools .hiddenfield',this.template[0]).live('click',function(){
				var info = $(this).parents('.tools').data('data-info');
				that.editUnusedFields(info);
            });
            $('.tools .removeblock',this.template[0]).live('click',function(){
            	var info = $(this).parents('.tools').data('data-info');
                that.removeBlock(info);
            });
             /**add新增字段事件
             * 
             */
			$('.tools .add',this.template[0]).live('click',function(){
				var block_info = $(this).parents('.tools').data('data-info');
				var info = {isExtend:true,isBlock:false};
				info.block = block_info.block;
				info.isHead = block_info.isHead;
				that.maxSortNo++;
				info.sortno  = that.maxSortNo;
				info.fieldLabel = '扩展字段';
				that.editField(info);
			})
			//字段前后移动
			$('.fieldSetting .icon-arrow-left',this.template[0]).live('click',function(){
				var fields  = $('.fieldSetting',that.template);
				var item = $(this).parents('.fieldSetting');
				var td = item.parent('td');
				var item_index = fields.index(item);
				var sortno1 = item.data('data-info').sortno;
				var prev = $(fields[item_index-1]);
				var sortno2 = prev.data('data-info').sortno;
				item.data('data-info').sortno = sortno2;
				prev.data('data-info').sortno = sortno1;
				that.dirtyTicket.customs = [];
				that.dirtyTicket.customs.push(item.data('data-info'));
				that.dirtyTicket.customs.push(prev.data('data-info'));
				var url = that.module+'/custom!updateItems.action';
				that.save(null,url);

			});
			$('.fieldSetting .icon-arrow-right',this.template[0]).live('click',function(){
				var fields  = $('.fieldSetting',that.template);
				var item = $(this).parents('.fieldSetting');
				var td = item.parent('td');
				var item_index = fields.index(item);
				var sortno1 = item.data('data-info').sortno;
				var next = $(fields[item_index+1]);
				var sortno2 = next.data('data-info').sortno;
				item.data('data-info').sortno = sortno2;
				next.data('data-info').sortno = sortno1;
				that.dirtyTicket.customs = [];
				that.dirtyTicket.customs.push(item.data('data-info'));
				that.dirtyTicket.customs.push(next.data('data-info'));
				var url = that.module+'/custom!updateItems.action';
				that.save(null,url);
			});
			//字段设置为unused
			$('.fieldSetting .icon-remove',this.template[0]).live('click',function(){
				var item = $(this).parents('.fieldSetting');
				var info = item.data('data-info');
				info.isUsed = false;
				that.dirtyTicket.customs = [];
				that.dirtyTicket.customs.push(info);
				var url = that.module+'/custom!saveCustom.action';
				that.save(null,url);
			});
			//字段修改block
			$('.fieldSetting .changeblock',this.template[0]).live('click',function(){
				var item = $(this).parents('li');
				var info = item.data('data-info');
                that.moveField(info);
			});
			/**edit编辑字段*/
			$('.fieldSetting .icon-edit',this.template[0]).live('click',function(){
				var field = $(this).parents('.fieldSetting').data('data-info');
				that.editField(field);
			})
			$('.addBlock',this.template).click(function(){
				that.addBlock();
			})
			
			$('.createCustom',this.template).click(function(){
				that.createCustom();
			})
			$('.extendCustom',this.template).click(function(){
				that.extendCustom();
			})
			$('.isStartWorkflow',this.template).click(function(){
				var isStart = $(this).attr("checked")?true:false;
				that.isStartWorkflow(isStart);
			})
			$('.deleteCustom',this.template).click(function(){
				that.deleteCustom();
			})
			//新增从表
			$('.addDetailDocket',this.template).click(function(){
				that.addDetailDocket();
			})
			//导出表单
			$('.exportType',this.template).click(function(){
				that.exportType();
			})
			//导入表单
			$('.importType',this.template).click(function(){
				that.importType();
			})     
		};
        /**
         * 获取定制数据
         * @param {Object} ticketType
         * @param {Object} moduleCode
         */
		TicketCustom.prototype.getTicketInfo = function(ticketType,moduleCode){
			if(moduleCode==null||moduleCode==""){
				moduleCode=$("#moduleId").val();
			}
			$('.addBlock',this.template).show();
			var that = this;
			$.ajax({
				url:this.module+'/custom!list.action',
				type:'POST',
				dataType:'json',
				data:{value:ticketType,moduleCode:moduleCode,platformNo:that.platformNo},
				success:function(ticketInfo){
					that.ticket = ticketInfo;
					that.initTicketInfo();
					that.initDetailDocketList();
					that.initTypeConfig();
				}
			});
		}
        /**
         * 初始化定制信息
         */
		TicketCustom.prototype.initTicketInfo = function(){
			this.dirtyTicket = V.Util.clone(this.ticket);
			$('.block_con',this.template).empty();
			var info = this.dirtyTicket.customs;
			var orderType = this.dirtyTicket.orderType;
			if(orderType.hasDetail){
				$('.tableType option:eq(0)',this.template).attr('selected',true);
			}else{
				$('.tableType option:eq(1)',this.template).attr('selected',true);
			}
			if(this.viewType == 'view'){
				this.switchToView();
			}else if(this.viewType == 'edit'){
				this.switchToEdit();
			}else if(this.viewType == 'list'){
				this.switchToList();
			}else{
				this.switchToSetting();
			}
		}
		TicketCustom.prototype.editUnusedFields = function(blockinfo){
			var dlg = new V.Classes['v.ui.Dialog']();
			var unusedFields = this.getUnusedFields(blockinfo);
			var list = new V.Classes['v.ui.Grid']();
			var that = this;
			list.init({
				container:dlg.getContent(),
				checkable:true,
				columns:[
				    {displayName:'字段名称',key:'fieldLabel'},
				    {displayName:'key',key:'fieldName'},
				    {displayName:'是否是扩展字段',key:'isExtend',render:function(record){
				    	return record.isExtend?"是":"否"
				    }}
				],
				data:unusedFields
			});
			var btns = [];
			if(unusedFields.length>0){
				btns.push({text:'还原',style:'btn-primary',handler:function(){
					var fields = list.getCheckedRecords();
					$.each(fields,function(){
						this.isUsed = true;
					});
					that.dirtyTicket.customs = fields;
					var url = that.module+'/custom!updateItems.action';
					that.save(null,url);
					dlg.close();
				}},{text:'删除',style:'btn-primary',handler:function(){
					var fields = list.getCheckedRecords();
					that.removeFields(fields);
					dlg.close();
				}})
			}
			btns.push({text:'关闭',handler:dlg.close});
			dlg.setBtnsBar({btns:btns});
			dlg.init({
				width:600,
				height:500,
				title:'未使用字段'
			});
		}
		TicketCustom.prototype.getUnusedFields = function(blockinfo){
			var result = new Array();
			var customs = this.ticket.customs;
			$.each(customs,function(index){
				if(this.block == blockinfo.block && !this.isUsed){
					result.push(this);
				}
			});
			return result;
		}
		//新增or编辑字段
		TicketCustom.prototype.editField = function(info){
			var editDlg = new V.Classes['v.ui.Dialog']();
			var that = this;
		    var Form = V.Classes['v.component.Form'];
		    var form = new Form();
		    form.setRecord(info);
		    var items = [];
		    if(info && info.fieldName){
		    	items.push({label:'数据类型',colspan:1,name:'dataType',type:Form.TYPE.TEXT,readonly:true});
		    }else{
		    	items.push({label:'数据类型',colspan:1,name:'dataType',value:Form.TYPE.TEXT,type:Form.TYPE.SELECT,multiList:[['文本类型',Form.TYPE.TEXT],['文本域类型',Form.TYPE.TEXTAREA],['日期类型',Form.TYPE.DATE],['数字类型',Form.TYPE.NUMBER],['单选类型',Form.TYPE.SELECT],['多选类型',Form.TYPE.CHECKBOX],['计算类型',Form.TYPE.CALCULATE],['隐藏类型',Form.TYPE.HIDDEN],['金额类型',Form.TYPE.PRICE]]});
		    };
		    items.push({label:'字段名',colspan:1,name:'fieldName',type:Form.TYPE.TEXT,readonly:true}
	    	    ,{label:'显示名(中文)',name:'fieldLabel',type:Form.TYPE.TEXT}
	    	    ,{label:'显示名(英文)',name:'fieldLabelEn',type:Form.TYPE.TEXT}
	    	    ,{label:'别名',colspan:2,name:'aliasFieldName',type:Form.TYPE.TEXT}
	    	    ,{label:'数据长度',colspan:2,name:'dataLength',type:Form.TYPE.TEXT}
	    	    ,{label:'小数位数(精度)',colspan:2,name:'precision',type:Form.TYPE.TEXT}
	    	    ,{label:'数据字典',colspan:2,name:'dictTypeCode',type:Form.TYPE.PLUGIN,plugin:'v.views.component.dictTypeCodeSelector',params:{'platformNo':this.platformNo}}
	    	    ,{label:'系统类型NS',colspan:2,name:'ns',type:Form.TYPE.TEXT}
	    	    ,{label:'是否显示',colspan:2,name:'isShowOnDetail',type:Form.TYPE.CHECKBOX,multiList:[['',true]]}
//	    	    ,{label:'显示范围',name:'showRange',type:Form.TYPE.SELECT,multiList:[[CONSTANT.BUSINESS_ROLE.ALL_NAME,CONSTANT.BUSINESS_ROLE.ALL],[CONSTANT.BUSINESS_ROLE.ENTERPRISE_NAME,CONSTANT.BUSINESS_ROLE.ENTERPRISE],[CONSTANT.BUSINESS_ROLE.SUPPLIER_NAME,CONSTANT.BUSINESS_ROLE.SUPPLIER],[CONSTANT.BUSINESS_ROLE.CUSTOMER_NAME,CONSTANT.BUSINESS_ROLE.CUSTOMER],[CONSTANT.BUSINESS_ROLE.NONE_NAME,CONSTANT.BUSINESS_ROLE.NONE]]}
	    	    ,{label:'显示范围(角色)',name:'showByRoles',type:Form.TYPE.TEXT}
	    	    ,{label:'是否在列表显示',colspan:1,name:'isShowGrid',type:Form.TYPE.CHECKBOX,multiList:[['',true]]}
	    	    ,{label:'列宽长度',colspan:1,name:'gridColLength',type:Form.TYPE.TEXT}
	    	    ,{label:'是否可编辑',colspan:2,name:'isEditable',type:Form.TYPE.CHECKBOX,multiList:[['',true]]}
//	    	    ,{label:'编辑范围',name:'editRange',type:Form.TYPE.SELECT,multiList:[[CONSTANT.BUSINESS_ROLE.ALL_NAME,CONSTANT.BUSINESS_ROLE.ALL],[CONSTANT.BUSINESS_ROLE.ENTERPRISE_NAME,CONSTANT.BUSINESS_ROLE.ENTERPRISE],[CONSTANT.BUSINESS_ROLE.SUPPLIER_NAME,CONSTANT.BUSINESS_ROLE.SUPPLIER],[CONSTANT.BUSINESS_ROLE.CUSTOMER_NAME,CONSTANT.BUSINESS_ROLE.CUSTOMER],[CONSTANT.BUSINESS_ROLE.NONE_NAME,CONSTANT.BUSINESS_ROLE.NONE]]}
	    	    ,{label:'编辑范围(角色)',name:'editByRoles',type:Form.TYPE.TEXT}
	    	    ,{label:'是否必填',name:'isMandatory',type:Form.TYPE.CHECKBOX,multiList:[['',true]]}
	    	    ,{label:'占位长度',name:'colspan',type:Form.TYPE.TEXT}
	    	    ,{label:'表达式',name:'expression',type:Form.TYPE.TEXT,colspan:2}
	    	    ,{label:'占位高度',name:'rows',type:Form.TYPE.TEXT}
	    	    ,{label:'提示',name:'helper',type:Form.TYPE.TEXT,colspan:2}
	    	    ,{label:'校验规则',name:'validateRule',rows:'2',type:Form.TYPE.TEXTAREA}
	    	    ,{label:'规则描述',name:'validateMessage',rows:'2',type:Form.TYPE.TEXTAREA}
	    	    // ,{label:'是否级联',name:'isCascading',type:Form.TYPE.CHECKBOX,multiList:[['',true]]}
	    	    ,{label:'级联主字段',name:'cascadingBy',type:Form.TYPE.TEXT}
	    	    ,{label:'级联规则',name:'cascadingRule',type:Form.TYPE.TEXT,colspan:1}
	    	    ,{label:'关联plugin',name:'relativePlugin',type:Form.TYPE.TEXT,colspan:1}
	    	    ,{label:'关联单据',name:'relativeDocketType',type:Form.TYPE.TEXT,colspan:1}
	    	    ,{label:'关联字段',name:'relativeField',type:Form.TYPE.TEXT,colspan:1}
	    	    ,{label:'关联单据module',name:'relativeModule',type:Form.TYPE.TEXT,colspan:1}
	    	);
	    	    
		    form.init({
		    	container:editDlg.getContent().addClass('docket'),
		    	items:items,
		    	colspan:2
		    });
		    //类型change事件
		    $('select',form.getItem('dataType').element).click(function(){
		    	var dataType = $(this).val();
		    	if(dataType == Form.TYPE.NUMBER){
			    	$(form.getItem('dataLength').element).parents('tr').show();
			    	$(form.getItem('precision').element).parents('tr').show();
			    	$(form.getItem('dictTypeCode').element).parents('tr').hide();
			    	$(form.getItem('ns').element).parents('tr').hide();
			    	$(form.getItem('expression').element).parents('tr').hide();
			    }else if(dataType == Form.TYPE.TEXT){
			    	$(form.getItem('dataLength').element).parents('tr').show();
			    	$(form.getItem('precision').element).parents('tr').hide();
			    	$(form.getItem('dictTypeCode').element).parents('tr').hide();
			    	$(form.getItem('ns').element).parents('tr').hide();
			    	$(form.getItem('expression').element).parents('tr').hide();
			    }else if(dataType == Form.TYPE.SELECT || dataType == Form.TYPE.CHECKBOX){
			    	$(form.getItem('dataLength').element).parents('tr').hide();
			    	$(form.getItem('precision').element).parents('tr').hide();
			    	$(form.getItem('dictTypeCode').element).parents('tr').show();
			    	$(form.getItem('ns').element).parents('tr').hide();
			    	$(form.getItem('expression').element).parents('tr').hide();
			    }else if(dataType == Form.TYPE.PLUGIN){
			    	$(form.getItem('dataLength').element).parents('tr').hide();
			    	$(form.getItem('precision').element).parents('tr').hide();
			    	$(form.getItem('dictTypeCode').element).parents('tr').hide();
			    	$(form.getItem('ns').element).parents('tr').show();
			    	$(form.getItem('expression').element).parents('tr').hide();
			    }else if(dataType == Form.TYPE.CALCULATE){
			    	$(form.getItem('dataLength').element).parents('tr').show();
			    	$(form.getItem('precision').element).parents('tr').hide();
			    	$(form.getItem('dictTypeCode').element).parents('tr').hide();
			    	$(form.getItem('ns').element).parents('tr').hide();
			    	$(form.getItem('expression').element).parents('tr').show();
			    }else{
			    	//以text方式显示
			    	$(form.getItem('dataLength').element).parents('tr').show();
			    	$(form.getItem('precision').element).parents('tr').hide();
			    	$(form.getItem('dictTypeCode').element).parents('tr').hide();
			    	$(form.getItem('ns').element).parents('tr').hide();
			    	$(form.getItem('expression').element).parents('tr').hide();
			    }
		    })
		    //勾选事件
		    $('input',form.getItem('isShowOnDetail').element).click(function(){
		    	var checked = $(this).attr('checked');
//		    	if(checked){
//		    		$(form.getItem('showRange').element).parents('tr').show();	
//		    	}else{
//		    		$(form.getItem('showRange').element).parents('tr').hide();
//		    	}
		    })
		    $('input',form.getItem('isEditable').element).click(function(){
		    	var checked = $(this).attr('checked');
		    	if(checked){
//		    		$(form.getItem('editRange').element).parents('tr').show();	
		    	}else{
//		    		$(form.getItem('editRange').element).parents('tr').hide();
		    	}
		    })
		    //根据类型显示相应属性
		    if(info && info.dataType == Form.TYPE.NUMBER){
		    	$(form.getItem('dataLength').element).parents('tr').show();
		    	$(form.getItem('precision').element).parents('tr').show();
		    	$(form.getItem('dictTypeCode').element).parents('tr').hide();
		    	$(form.getItem('ns').element).parents('tr').hide();
		    }else if(info && info.dataType == Form.TYPE.TEXT){
		    	$(form.getItem('dataLength').element).parents('tr').show();
		    	$(form.getItem('precision').element).parents('tr').hide();
		    	$(form.getItem('dictTypeCode').element).parents('tr').hide();
		    	$(form.getItem('ns').element).parents('tr').hide();
		    }else if(info && (info.dataType == Form.TYPE.SELECT || info.dataType == Form.TYPE.CHECKBOX)){
		    	$(form.getItem('dataLength').element).parents('tr').hide();
		    	$(form.getItem('precision').element).parents('tr').hide();
		    	$(form.getItem('dictTypeCode').element).parents('tr').show();
		    	$(form.getItem('ns').element).parents('tr').hide();
		    }else if(info && info.dataType == Form.TYPE.PLUGIN){
		    	$(form.getItem('dataLength').element).parents('tr').hide();
		    	$(form.getItem('precision').element).parents('tr').hide();
		    	$(form.getItem('dictTypeCode').element).parents('tr').hide();
		    	$(form.getItem('ns').element).parents('tr').show();
		    }else{
		    	//以text方式显示
		    	$(form.getItem('dataLength').element).parents('tr').show();
		    	$(form.getItem('precision').element).parents('tr').hide();
		    	$(form.getItem('dictTypeCode').element).parents('tr').hide();
		    	$(form.getItem('ns').element).parents('tr').hide();
		    }
		    //根据属性勾选显示相应属性值
		    if(info){
		    	if(!info.isShowOnDetail){
//		    		$(form.getItem('showRange').element).parents('tr').hide();
		    	}
		    	if(!info.isEditable){
//		    		$(form.getItem('editRange').element).parents('tr').hide();
		    	}
		    }
			editDlg.setBtnsBar({
				position:'center',
				btns:[
				    {text:'保存',style:'btn-primary',handler:function(){
						var vals = form.getValues();
						if(info){
							$.each(vals,function(prop,val){
								info[prop] = val;
							})
						}else{
							info = vals;
						}
						that.dirtyTicket.customs = [];
						that.dirtyTicket.customs.push(info);
						this.close();
						var url = that.module+'/custom!saveCustom.action';
						that.save(null,url);
					}},
					{text:'取消',handler:function(){
						this.close();
					}}
				]
			});
			editDlg.init({
				width:720,
				height:550,
				title:info.fieldLabel
			});
		}
		TicketCustom.prototype.editBlock = function(info){
			var that = this;
			var platformNo=this.platformNo;
    	    var custom = {};
			custom.id = info.id;
			custom.fieldName = info.fieldName;
			custom.fieldLabel=info.fieldLabel;
			custom.typeId=info.typeId;
			var type = that.ticket.orderType;
            var editBlockDlg = new V.Classes['v.ui.Dialog']();
            var con = $('<div>\<div>显示名称：<input type="text" name="name" value=""></div>\</div>');
            $('input[name="name"]',con).val(info.fieldLabel);
            editBlockDlg.setContent(con);
            editBlockDlg.setBtnsBar({
				position:'center',
				btns:[
				    {text:'提交',style:'btn-primary',handler:function(){
						var name= $('input[name="name"]',con).val();
						var isAll = false;
						// var isSuper = LoginInfo.isSuperPlatform;
						// var user = LoginInfo.user;
						// if (isSuper && platformNo == user.createByPlatformNo) {
						// 	isAll=true;
						// }
						var url = that.module+'/custom!updateBlock.action';
						$.ajax({
							url:url,
							type:'post',
							contentType:'application/json',
							data:JSON.stringify({value:name,custom:custom,isAll:isAll}),
							success:function(data){
								if(data == "success"){
									editBlockDlg.close();
									that.getTicketsType(type.moduleCode);
								}else{
									V.alert(data);
								}
							}
						})
					}},
					{text:'取消',handler:function(){
						editBlockDlg.close();
					}}
				]
			});
            editBlockDlg.init({
				width:600,
				height:350,
				title:'修改块名称'
			});
		}
		/**获取模块
		 * 
		 */
		TicketCustom.prototype.getModuleType = function(){
			var that = this;
		     $.ajax({
			 	url:this.module+'/custom!queryModule.action',
				dataType:'json',
				success:function(systemModules){
					systemModules = systemModules||[];
					$.each(systemModules,function(index){
						var opt = $('<option>'+this.moduleName+'</option>');
						opt.attr('value',this.moduleCode);
						$('.modulesType',that.template).append(opt);
						if(index == 0){
                           if(this.moduleCode == "FINANCE"){
                                $('.lbl_tableType',that.template).show();
                            }else{
                                $('.lbl_tableType',that.template).hide();
                            };
							that.getTicketsType(this.moduleCode);
						}
					})
				}
			 });
		};
		/**获取单据类型
		 * 
		 * @param  模块code moduleCode
		 */
		TicketCustom.prototype.getTicketsType = function(moduleCode){
			$('.ticketsType',this.template).empty();
			var that = this;
		     $.ajax({
			 	url:this.module+'/custom!init.action',
				dataType:'json',
				data:{moduleCode:moduleCode,platformNo:that.platformNo},
				success:function(tickets){
					tickets = tickets||[];
					$.each(tickets,function(index){
						var opt = $('<option>'+this.name+'</option>');
						opt.attr('value',this.value);
						$('.ticketsType',that.template).append(opt);
						if(index == 0){
							that.getTicketInfo(this.value,moduleCode);
						}
					})
				}
			 }) ;
		};
		
        //get new block name
		TicketCustom.prototype.getNewBlockName = function(customs){
			var max = 0;
			$.each(customs,function(){
        		if (this.isBlock && this.block>max){
        			max = this.block;
        		}
			})
        	return 'block'+(max+1);
		}
		TicketCustom.prototype.getMaxBlockNum = function(customs){
			var max = 0;
			$.each(customs,function(){
        		if (this.isBlock && this.sortno>max){
        			max = this.sortno;
        		}
			})
        	return max;
		}
		/**新增块
		 * 
		 */
		TicketCustom.prototype.addBlock = function(){
			   //弹出对话框
			    var that = this;
				var editDlg = new V.Classes['v.ui.Dialog']();
                var Form = V.Classes['v.component.Form'];
                var form = new Form();
                var items = [];
                if($('.ticketsType',this.template).val()=="GOODS_ATTRIB"){
                    items.push({
                        type:Form.TYPE.HIDDEN,
                        name:'cat_name'
                    });
                    items.push({
                        type:Form.TYPE.HIDDEN,
                        name:'cat_id'
                    });
                    items.push({
                         label:"品类",
                         type:Form.TYPE.PLUGIN,
                         plugin:'v.views.component.goodsCatSelector',
                         handler:function(p){
                             that.subscribe(p,p.EVENT.SELECT_CHANGE,function(entity){
                                 $('input[name=cat_name]',form.template).val(entity.categoryName);
                                  $('input[name=cat_id]',form.template).val(entity.id);
                             });
                         }
                     });
                }else{
                	var customs = that.ticket.customs;
	                var defaultFieldName = that.getNewBlockName(customs);
                    items.push({label:'模块显示名', type:Form.TYPE.TEXT,name:'blockName'});
                    items.push({label:'模块字段名', type:Form.TYPE.TEXT,name:'fieldName',value:defaultFieldName});
                }
                form.init({
                    container:editDlg.getContent(),
                    items:items,colspan:1
                 });
                $('input[name="fieldName"]',form.template).attr('readOnly',true);
				//editDlg.setContent(con);
				editDlg.setBtnsBar({
					position:'center',
					btns:[
					    {text:'提交',style:'btn-primary',handler:function(){
							var fieldLabel= $('input[name="blockName"]',form.template).val();
							var fieldName = $('input[name="fieldName"]',form.template).val();
							var platformNo = that.platformNo;
							var url=that.module+'/custom!addBlock.action';
							var type = that.ticket.orderType;
							var ticket = that.dirtyTicket.customs;
							var custom = {};
                            if ($('.ticketsType', that.template).val() == "GOODS_ATTRIB") {
                                fieldLabel = $('input[name=cat_name]',form.template).val();
                                custom.block = $('input[name=cat_id]',form.template).val();
                            }
							custom.isHead=true;
							custom.isBlock=true;
							custom.id = null;
							custom.fieldName = fieldName;
							custom.fieldLabel=fieldLabel;
							custom.systemFieldLabel = fieldLabel;
							custom.isShowGrid =false;
							custom.isSystemNecessary = false;
							custom.typeId=type.id;
							custom.isUsed = true;
							custom.platformNo=platformNo;
							var isAll = false;
							var isSuper = LoginInfo.isSuperPlatform;
							var user = LoginInfo.user;
							if (isSuper && platformNo == user.createByPlatformNo) {
								isAll = $('input[name=isAll]',that.template).attr('checked')?true:false;
							}
							$.ajax({
								url:url,
								type:'post',
								contentType:'application/json',
								data:JSON.stringify({custom:custom,isAll:isAll}),
								success:function(data){
									if(data == "success"){
										editDlg.close();
										V.alert("操作成功！");
										//新增成功后处理方法
										//that.getTicketsType(type.moduleCode);
										that.getTicketInfo(type.value,type.moduleCode);
									}else{
										V.alert(data);
									}
								}
							})
						}},
						{text:'取消',handler:function(){
							editDlg.close();
						}}
					]
				});
				editDlg.init({
					width:400,
					height:300,
					title:'新增块'
				});
		};

		//删除单据
		TicketCustom.prototype.deleteCustom = function(){
			var that = this;
			var info="是否删除";
			var type = that.ticket.orderType;
	    	 var typeId = type.id;
			V.confirm(info,function ok(e){
				var url = that.module+'/custom!deleteByType.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
	               	data:{typeId:typeId},
	                success:function(data){
	                	if(data.result == 'success'){
	                		that.getModuleType();
	                		V.alert("删除成功");
	                	}else{
	                		V.alert("删除失败！");
	                	}
	                }
	            })
			});
		}
		//新增单据
		TicketCustom.prototype.createCustom = function(){
			//弹出对话框
			var that = this;
			var editDlg = new V.Classes['v.ui.Dialog']();
			var Form = V.Classes['v.component.Form'];
			var form = new Form();
			var items = [];
			
			var customs = that.ticket.customs;
			var defaultFieldName = that.getNewBlockName(customs);
			items.push({label:'表单类型名称', type:Form.TYPE.TEXT,name:'key',value:''});
			items.push({label:'表单类型编码', type:Form.TYPE.TEXT,name:'keyvalue',value:''});
			
			form.init({
				container:editDlg.getContent(),
				items:items,colspan:1
			});
			//editDlg.setContent(con);
			editDlg.setBtnsBar({
				position:'center',
				btns:[
				      {text:'提交',style:'btn-primary',handler:function(){
				    	  var key= $('input[name="key"]',form.template).val();
				    	  var value = $('input[name="keyvalue"]',form.template).val();
				    	  var platformNo = that.platformNo;
				    	  var url=that.module+'/custom!createCustom.action';
				    	  var type = that.ticket.orderType;
				    	  var typeId = type.id;
				    	  type.id = null;
				    	  type.value = value;
				    	  type.name = key;
				    	  var isAll = false;
				    	  var isSuper = LoginInfo.isSuperPlatform;
				    	  var user = LoginInfo.user;
				    	  if (isSuper && platformNo == user.createByPlatformNo) {
				    		  isAll = $('input[name=isAll]',that.template).attr('checked')?true:false;
				    	  }
				    	  $.ajax({
				    		  url:url,
				    		  type:'post',
				    		  contentType:'application/json',
				    		  data:JSON.stringify({orderType:type,typeId:typeId}),
				    		  success:function(data){
				    			  if(data.result == "success"){
				    				  editDlg.close();
				    				  V.alert("操作成功！");
				    				  //新增成功后处理方法
				    				  that.getTicketsType(type.moduleCode);
				    			  }else{
				    				  V.alert(data);
				    			  }
				    		  }
				    	  })
				      }},
				      {text:'取消',handler:function(){
				    	  editDlg.close();
				      }}
				      ]
			});
			editDlg.init({
				width:400,
				height:300,
				title:'新增定制数据'
			});
		};
		
        /**
         * 保存
         * @param {Object} handler
         * @param {Object} url
         */
		TicketCustom.prototype.save = function(handler,url){
			var ticket = this.dirtyTicket.customs;
			var platformNo = this.dirtyTicket.platformNo = this.platformNo;
			if(ticket == undefined  || ticket.length <= 0){
				V.alert("数据错误!");
				return;
			}
			var flag = true;
			$.each(ticket,function(){
				if(this.multiValues != undefined && this.id == undefined){
					if(this.multiValues.indexOf(':') == -1 && this.multiValues.indexOf(';') == -1){
						flag = false;
						return false;
					}
				}
			})
			if(!flag){
				V.alert("字段多选或单选值的格式不正确!");
				return;
			}
			var isAll = false;
			var isSuper = LoginInfo.isSuperPlatform;
			var user = LoginInfo.user;
			if (isSuper && platformNo == user.createByPlatformNo) {
				isAll = $('input[name=isAll]',this.template).attr('checked')?true:false;
			}
			this.dirtyTicket.isAll = isAll;
			var that = this;
			$.ajax({
				url:url,
				type:'post',
				contentType:'application/json',
				data:JSON.stringify(this.dirtyTicket),
				success:function(data){
					if(data.result == "success"){
						//V.alert("操作成功！");
						var orderType = $('.ticketsType',this.template).val();
						var modulesType=$('.modulesType',this.template).val();
						that.getTicketInfo(orderType,modulesType);
						handler&&handler();
						V.alert(data.info);
					}
				}
			})
		}
       /**删除block
        * @param {Object} field
        * @param all fields  fields
        * @param callback cb
        * TODO:有BUG，只删除block字段，则该block下unused字段无法再在界面中设置为used。
        */
        TicketCustom.prototype.removeBlock = function(blockinfo){
            var isEmpty = true;
            var fields = this.ticket.customs;
			$.each(fields,function(index){
				if(!this.isBlock && this.isUsed && this.block == blockinfo.block){
					isEmpty = false;
                    return false;
				}
			});
            if(isEmpty){
                this.removeFields([blockinfo],cb);
            }else{
                V.alert("只能删除空模块，请先清空该模块下的字段。");
            }
        }

        /**删除字段
         * @param {Object} fields
         * @param {Object} cb
         */
        TicketCustom.prototype.removeFields = function(fields){
            var isAll = $('input[name=isAll]',this.template).attr('checked')?true:false;
            var that = this;
            V.ajax({
                url: this.module + '/custom!delete.action',
                data:{customs:fields,isAll:isAll},
                success:function(){
                    var orderType = $('.ticketsType',that.template).val();
					var modulesType=$('.modulesType',that.template).val();
					that.getTicketInfo(orderType,modulesType);
                }
            })
        }
        /**移动block**/
       TicketCustom.prototype.moveBlock = function(cb){
           var blocks = this.dirtyTicket.customs;
           var isAll = $('input[name=isAll]',this.template).attr('checked')?true:false;
           $.ajax({
                 url: this.module+"/custom!moveBlock.action",
                 type:'post',
				 contentType:'application/json',
				 data:JSON.stringify({customs:blocks,isAll:isAll}),
                 success:function(){
                     cb && cb();
                 }
           });
       }
        //移动字段到其他block
        TicketCustom.prototype.moveField = function(field){
            var dlg = new V.Classes['v.ui.Dialog']();
            var that = this;
            $.ajax({
                url:this.module+'/custom!queryBlock.action',
                data:{typeId:this.ticket.orderType.id},
                dataType:'json',
                success: function(blocks){
                    var con = $("<select></select>");
                    $.each(blocks, function(){
                        var opt = "<option value=" + this.block + ">" + this.fieldLabel + "</option>";
                        con.append(opt);
                    });
                    dlg.setContent(con);
                }
            });
            dlg.setBtnsBar({
					position:'center',
					btns:[
                        {text:"确定",style:'btn-primary',handler:function(){
                            var block = $('select',dlg.template).val();
                            if(block == field.block){
                                this.close();
                                return;
                            }
                            field.block = block;
                             var isAll = $('input[name=isAll]',that.template).attr('checked')?true:false;
                            $.ajax({
                                url:that.module+'/custom!moveField.action',
                                type:'post',
								contentType:'application/json',
								data:JSON.stringify({custom:field,isAll:isAll}),
                                success:function(){
                                    var moduleType = $('.modulesType',that.template).val();
                                    var ticketType = $('.ticketsType',that.template).val();
                                    that.getTicketInfo(ticketType,moduleType);
                                    dlg.close();
                                }
                            })
                        }},
                        {text:'取消',handler:function(){
							this.close();
						}}
                    ]
            });
            dlg.init({
                  title:'请选择要移入的模块：',
                  width:400,
                  height:300    
            });
        }
        /**
         * 继承表单
         * @return {[type]} [description]
         */
        TicketCustom.prototype.extendCustom = function(){
			var that = this;
			var editDlg = new V.Classes['v.ui.Dialog']();
			var Form = V.Classes['v.component.Form'];
			var form = new Form();
			var items = [];
			
			var customs = that.ticket.customs;
			var defaultFieldName = that.getNewBlockName(customs);
			items.push({label:'表单类型名称', type:Form.TYPE.TEXT,name:'key',value:''});
			items.push({label:'表单类型编码', type:Form.TYPE.TEXT,name:'keyvalue',value:''});
			
			form.init({
				container:editDlg.getContent(),
				items:items,colspan:1
			});
			//editDlg.setContent(con);
			editDlg.setBtnsBar({
				position:'center',
				btns:[
				      {text:'提交',style:'btn-primary',handler:function(){
				    	  var key= $('input[name="key"]',form.template).val();
				    	  var value = $('input[name="keyvalue"]',form.template).val();
				    	  var platformNo = that.platformNo;
				    	  var url=that.module+'/custom!extendsType.action';
				    	  var type = that.ticket.orderType;
				    	  var typeId = type.id;
				    	  type.id = null;
				    	  type.value = value;
				    	  type.name = key;
				    	  var isAll = false;
				    	  var isSuper = LoginInfo.isSuperPlatform;
				    	  var user = LoginInfo.user;
				    	  if (isSuper && platformNo == user.createByPlatformNo) {
				    		  isAll = $('input[name=isAll]',that.template).attr('checked')?true:false;
				    	  }
				    	  $.ajax({
				    		  url:url,
				    		  type:'post',
				    		  contentType:'application/json',
				    		  data:JSON.stringify({orderType:type,typeId:typeId}),
				    		  success:function(data){
				    			  if(data == "success"){
				    				  editDlg.close();
				    				  V.alert("操作成功！");
				    				  //新增成功后处理方法
				    				  that.getTicketsType(type.moduleCode);
				    			  }else{
				    				  V.alert(data);
				    			  }
				    		  }
				    	  })
				      }},
				      {text:'取消',handler:function(){
				    	  editDlg.close();
				      }}
				      ]
			});
			editDlg.init({
				width:400,
				height:300,
				title:'继承定制数据'
			});
		};
        /*
         *新增从表
         */
        TicketCustom.prototype.addDetailDocket = function(){
        	var that = this;
			var editDlg = new V.Classes['v.ui.Dialog']();
			var Form = V.Classes['v.component.Form'];
			var form = new Form();
			var items = [];
			var customs = that.ticket.customs;
			//var defaultFieldName = that.getNewBlockName(customs);
			items.push({label:'表单', type:Form.TYPE.PLUGIN,name:'docketType',aliasFieldName:'value',plugin:'v.views.component.docketTypeSelector',params:{platformNo:this.platformNo},required:true});
			items.push({label:'展现形式', type:Form.TYPE.SELECT,name:'showType',multiList:[['列表','L'],['表单','F']],required:true});
			items.push({type:Form.TYPE.HIDDEN,name:'masterTypeId',value:this.ticket.orderType.id});
			items.push({type:Form.TYPE.HIDDEN,name:'platformNo',value:this.platformNo});
			form.init({
				container:editDlg.getContent(),
				items:items,colspan:1
			});
			//editDlg.setContent(con);
			editDlg.setBtnsBar({
				position:'center',
				btns:[
				      {text:'提交',style:'btn-primary',handler:function(){
					      if(!form.validate()){
					      	  return ;
					      }
				    	  var vals = form.getValues();
				    	  var docket = form.getPluginItemsByNs('v.views.component.docketTypeSelector')[0].plugin.getEntity();
				    	  vals.subTypeId = docket.id;
				    	  delete vals.value;
				    	  var isExist = false;
				    	  $.each(that.detailDocketList.getData(),function(){
				    	  	    if(this.subTypeValue == docket.value){
				    	  	    	isExist = true;
				    	  	    	return false;
				    	  	    }
				    	  });
				    	  if(isExist){
				    	  	  V.alert("该从表已存在。");
				    	      return;
				    	  }
				    	  $.ajax({
				        	  url:that.module+'/custom!addSubType.action',
				        	  data:vals,
				        	  success:function(data){
				        	  	  if(data.result == "success"){
				        	  		  V.alert("操作成功！");
				    				  editDlg.close();
				    				  that.detailDocketList.refresh();
				    			  }else{
				    				  V.alert(data);
				    			  }
				        	  }
				          })
				      }},
				      {text:'取消',handler:function(){
				    	  editDlg.close();
				      }}
				      ]
			});
			editDlg.init({
				width:400,
				height:300,
				title:'新增从表'
			});
        }
        /**
         *设置是否启动工作流
         */
        TicketCustom.prototype.isStartWorkflow = function(isStart){
        	$.ajax({
        		url:this.module+"/custom!isStartProcessType.action",
        		data:{startProcessFlag:isStart,typeId:this.ticket.orderType.id},
        		success:function(){
        			 V.alert("操作成功！");
        		}
        	});
        }
        TicketCustom.prototype.initDetailDocketList = function(){
        	var list = this.detailDocketList =  new V.Classes['v.ui.Grid']();
        	var that = this;
        	list.setFilters({masterTypeId:this.ticket.orderType.id,platformNo:this.platformNo});
        	list.init({
        		container:$('.ticketDetail .block_con',this.template),
        		url:this.module+'/custom!subTypeList.action',
        		columns:[
        		    {displayName:'单据编码',key:'subTypeValue',width:200},
        		    {displayName:'单据名称',key:'subTypeName',width:200},
        		    {displayName:'操作',key:'action',render:function(record){
        		    	var html = $('<div class="action"></div>');
        		    	var btn_remove = $("<a href='javascript:void(0)' title='删除'><i class='icon-remove'></i></a>");
        		    	btn_remove.click(function(){
        		    		that.removeDetailDocket(record.id);
        		    	});
        		    	html.append(btn_remove);
        		    	return html;
        		    }}
        		]
        	});
        }
        TicketCustom.prototype.removeDetailDocket = function(id){
        	var that = this;
        	$.ajax({
        		url:this.module+'/custom!deleteSubType.action',
        		data:{typeId:id},
        		success:function(){
        			V.alert("操作成功！");
        			that.detailDocketList.refresh();
        		}
        	});
        }
        TicketCustom.prototype.importType = function(){
			var　that = this;
			var uploader = new V.Classes['v.component.FileUpload']();
			var typeId = this.ticket.orderType.id;;
			var type = that.ticket.orderType;
			uploader.init({
				title:"上传文件",
				uploadSetting:{
					url:this.module+'/custom!importType.action',
					params:typeId,
					uploadComplete:function(){
						V.alert("导入成功！");
						that.getTicketInfo(type.value,type.moduleCode);
					}
				}
			});
		}
        TicketCustom.prototype.exportType = function(){
			var form_print = $('.docket_export_form',this.template).empty();
			if(form_print.length==0){
				form_print = $('<form action='+this.module+'/custom!exportType.action type="POST" class="docket_export_form" style="display:none"></form>');
			}
			var typeId=this.ticket.orderType.id;
			var typeName = this.ticket.orderType.name;
			var inputId = $('<input type="hidden" name="typeId" value='+typeId+'>');
			var inputName = $('<input type="hidden" name="typeName" value='+typeName+'>');
			form_print.append(inputId).append(inputName);
			this.template.append(form_print);
			form_print[0].submit();
		}
		TicketCustom.prototype.initTypeConfig = function(){
			var Form = V.Classes['v.component.Form'];
			var form = this.docketTypeForm =  new Form();
			var orderType = this.ticket.orderType;
			var isFromExtend = orderType.parentDocketType?"是":"否";
			form.init({
				container:$('.ticketConfig .block_con',this.template),
				items:[
				    {label:'表单ID',colspan:1,name:'id',type:Form.TYPE.TEXT,readonly:true}
				    ,{label:'表单编码',colspan:1,name:'value',type:Form.TYPE.TEXT,readonly:true}
				    ,{label:'是否继承',colspan:1,type:Form.TEXT,readonly:true,value:isFromExtend}
				    ,{label:'继承表单',colspan:1,name:'parentDocketType',type:Form.TYPE.TEXT,readonly:true}
				    ,{label:'是否启动流程',colspan:2,name:'startProcessFlag',type:Form.TYPE.SELECT,multiList:[['启动','Y'],['不启动','N']]}
				    ,{label:'预处理JAVA代码',colspan:2,name:'preProcess',type:Form.TYPE.TEXTAREA}
				    ,{label:'后处理JAVA代码',colspan:2,name:'postProcess',type:Form.TYPE.TEXTAREA}
				],
				colspan:2,
				record:orderType
			})
		}
		TicketCustom.prototype.saveDocketType = function(){
			var vals = this.docketTypeForm.getValues();
			var orderType = this.ticket.orderType;
			$.extend(orderType,vals);
			V.ajax({
				url:this.module+'/custom!saveDocketType.action',
				data:{orderType:orderType},
				success:function(data){
					if(data && data.result == 'success'){
						V.alert('保存成功。');
					}
				}
			})
		}
		TicketCustom.prototype.switchToView = function(){
			this.viewType = 'view';
			var info = this.ticket.customs;
			var form = new V.Classes['v.component.BlockForm']();
			var items = [];
			var Form = V.Classes['v.component.Form'];
			$.each(info,function(){
				if(!this.isUsed){
					return true;
				}
				var item = {
					label:this.fieldLabel,
					name:this.fieldName,
					isBlock:this.isBlock,
					block:this.block,
					// type:this.dataType,
					readonly:true
				}
				items.push(item);
			});
			form.init({
				container:$('.ticketHeader .block_con',this.template).empty(),
				items:items,
				colspan:2
			})
		}
		TicketCustom.prototype.switchToEdit = function(){
			this.viewType = 'edit';
			var info = this.ticket.customs;
			var form = new V.Classes['v.component.BlockForm']();
			var items = [];
			var Form = V.Classes['v.component.Form'];
			var that = this;
			$.each(info,function(){
				if(!this.isUsed){
					return true;
				}
				var type = this.dataType;
				var item = {
					name:this.fieldName
					,label:this.fieldLabel
					,type:this.dataType
					,validator:this.validator||V.Classes['v.component.Form'].generateValidator(type,this.dataLength,this.precision)
					,isBlock: this.isBlock
					,block:this.block
					,required:this.isMandatory
					,multiList:this.multiList
					,defaultValue:this.defaultValue
					,aliasFieldName:this.aliasFieldName
					,colspan:this.colspan
					,expression:this.expression
				}
				if(this.dataType ==  V.Classes['v.component.Form'].TYPE.CUSTOM){
					item.getValue = this.getValue;
				}
				else if (this.dataType ==  V.Classes['v.component.Form'].TYPE.PLUGIN) {
		            item.plugin = this.ns;
		            item.url = this.url;
		            item.params = this.params||{};
		            item.params['platformNo'] = that.options.platformNo;
		            item.handler = function(inst){
		            	if(inst instanceof V.Classes['v.views.component.Selector']){
		            		that.subscribe(inst,inst.EVENT.SELECT_CHANGE,function(entity){
		            			var block = item.block;
		            			that.fillProperties(block, entity, form,inst.docketType);
		            		});
		            	}
		            }
				}
				else if(this.dataType == V.Classes['v.component.Form'].TYPE.SELECT){//转义select
					try{
						item.multiList = DictInfo.getList(this.dictTypeCode,that.options.platformNo);
						item.render = function(val){
							return DictInfo.getValue(field.dictTypeCode,val,that.options.platformNo);
						}
					}catch(e){
						that.log('数据字典没有定义<'+this.dictTypeCode+'>');
					}
		        }else if(this.dataType == V.Classes['v.component.Form'].TYPE.CHECKBOX){
					item.multiList = DictInfo.getList(this.dictTypeCode,that.options.platformNo);
					item.render = function(val){
						return DictInfo.getMultiValue(field.dictTypeCode,val,that.options.platformNo);
					}
		        }else if(this.dataType == V.Classes['v.component.Form'].TYPE.PERCENT){
				    item.value = V.Util.Float.mul(data[this.fieldName],100)+'%';
				}
				items.push(item);
			});
			form.init({
				container:$('.ticketHeader .block_con',this.template).empty(),
				items:items,
				colspan:2
			})
		}
		TicketCustom.prototype.switchToList = function(){
			this.viewType = 'list';
			var info = this.ticket.customs;
			var list = new V.Classes['v.ui.Grid']();
			var columns = [];
			$.each(info,function(){
				if(!this.isUsed){
					return true;
				}
				if(this.isShowGrid){
					var column = {
						displayName:this.fieldLabel,
						key:this.fieldName
					}
					columns.push(column);
				}
			})
			list.init({
				container:$('.ticketHeader .block_con',this.template).empty(),
				columns:columns,
				data:[]
			});
		}
		TicketCustom.prototype.switchToSetting = function(){
			this.viewType = 'setting';
			var info = this.ticket.customs;
			var form = new V.Classes['v.component.BlockForm']();
			var items = [];
			var Form = V.Classes['v.component.Form'];
			var block = '';
			var isNextBlock = false;
			var isFirst = false;
			var isLast = false;
			
			var usedFields = [];
			$.each(info,function(){
				if(this.isUsed){
					usedFields.push(this);
				}
			});
			var length = usedFields.length;
			$.each(usedFields,function(index){
				if(block != this.block){
					isNextBlock = true;
				}
				if(isNextBlock && !this.isBlock){
					isFirst = true;
					isNextBlock = false;
				}
				if(index<length-1){
					var nextItem = usedFields[index+1];
					var nextBlock = nextItem.block;
					if(this.block != nextBlock){
						isLast = true;
					}else{
						isLast = false;
					}
				}else{
					isLast = true;
				}
				var item = {
					label:this.fieldLabel,
					name:this.fieldName,
					isBlock:this.isBlock,
					block:this.block,
					type:Form.TYPE.CUSTOM
				};
				if(!this.isBlock){
					var isSys = this.isSystemNecessary;
					var html = '<div class="fieldSetting"><a href="javascript:void(0);"><i class="icon-arrow-right" title="后移"></i></a><a href="javascript:void(0);" title="前移"><i class=" icon-arrow-left"></i></a><a href="javascript:void(0);"><i class=" icon-share-alt changeblock" title="移出"></i></a>';
					if (!isSys) {
						html += '<a href="javascript:void(0)" title="删除"><i class="icon-remove"></i></a>';
					}
					html += '<a href="javascript:void(0)" title="编辑"><i class="icon-edit"></i></a></div>';
					html = $(html);
					html.data('data-info',this);
					if(isFirst){
						$('.icon-arrow-left',html).parent().css('visibility','hidden');
					}
					if(isLast){
						$('.icon-arrow-right',html).parent().css('visibility','hidden');
					}
					item.render = function(){
						return html;
					}
				}else{
					// var html = $('<span class="tools">\
					// 	<a href="javascript:void(0);" class="editblock" title="修改模块"><i class="icon-edit"></i>\
					// 	</a>\
                    //  <a href="javascript:void(0);" class="removeblock" title="删除模块"><i class="icon-remove"></i>\
					// 	</a>\
					// 	<a href="javascript:void(0);" class="hiddenfield" title="未使用字段"><i class="icon-trash"></i>\
					// 	</a>\
					// 	<a href="javascript:void(0);" class="add" title="新增扩展字段"><i class=" icon-plus"></i></a>\
					// 	<a href="javascript:void(0);" title="上移"><i class=" icon-arrow-up"></i></a><a href="javascript:void(0);" title="下移"><i class=" icon-arrow-down"></i></a>\
					// 	</span>');
					var html = $('<span class="tools">\
						<a href="javascript:void(0);" class="editblock" title="修改模块"><i class="icon-edit"></i></a>\
						<a href="javascript:void(0);" class="hiddenfield" title="未使用字段"><i class="icon-trash"></i></a>\
						<a href="javascript:void(0);" class="add" title="新增扩展字段"><i class=" icon-plus"></i></a>\
						</span>');
					html.data('data-info',this);
				    item.render = function(){
						return html;
				    }
				}
				isFirst = false;
				block = this.block;
				items.push(item);
			});
			form.init({
				container:$('.ticketHeader .block_con',this.template).empty(),
				items:items,
				colspan:2
			})
		}
		TicketCustom.prototype.queryPlatformDictInfo = function(platformNo){
        	var that = this;
        	try{
        		var dict = eval('d'+platformNo);
        	}catch(e){
        		$.ajax({
    				url : 'common!queryDictByPlatform.action',
    				async:false,
    				dataType : 'json',
    				data:{platformNo:platformNo},
    				success : function(data){
    					eval(data);
    				}
    			});
        	}
        }
		TicketCustom.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'系统单据详情'}});
		}
	})(V.Classes['v.views.backoffice.custom.TicketCustom']);
},{plugins:['v.ui.dialog','v.ui.alert','v.component.blockForm','v.component.fileUpload','v.views.component.dictTypeCodeSelector']})
