;V.registPlugin("v.views.backoffice.custom.orgCustom",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.OrgCustom",
		superClass:"v.Plugin",
		init:function(){
			this.org = {};
			this.module = "";
            this.ns = 'v.views.backoffice.custom.orgCustom';
//			this.area_comp = new V.Classes['v.component.AreaOld'];
//			this.area_store = new V.Classes['v.component.AreaOld'];
//			this.area_dc = new V.Classes['v.component.AreaOld'];
			this.resource = {
				html:'template.html'
			}

			this.orgType = {
				GROUP : CONSTANT.ORG.TYPE_GROUP, //集团
				PRODUCT : CONSTANT.ORG.TYPE_PRODUCT_SELECT,//产品部门
				REGIONAL : CONSTANT.ORG.TYPE_FOR_REGIONAL,//分管区域
				FORENSIC : CONSTANT.ORG.TYPE_FORENSIC,//
				BRANCH : CONSTANT.ORG.TYPE_BRANCH,//分公司
				DISTRIBUTION : CONSTANT.ORG.TYPE_DISTRIBUTION_CENTRE//分销中心
			}
			
			this.EVENT = {
                'ADD_GROUP' : 'add_group',
                'ADD_PRODUCT' : 'add_product_select',
                'ADD_REGIONAL' : 'add_for_regional',
                'ADD_FORENSIC' : 'add_forensic',
                'ADD_BRANCH' : 'add_branch',
                'ADD_DISTRIBUTION' : 'add_distribution_centre',
                'REMOVE' : 'remove',
                'START' : 'start',
                'STOP' : 'stop',
                'SAVE_ORG_SUCCESS' : 'save_org'
            };
		}
	});
	(function(OrgCustom){
		
		OrgCustom.prototype.init = function(options){
			var that = this;
			this.module = options.module;
			this.container = options.container;
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				cache:false,
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					that.initOrgTree();
					that.initEvent();
				}
		     });
		}
		
		OrgCustom.prototype.initEvent = function(){
			var that = this;
			//编辑
  			$('.edit',this.template).click(function(){
				var block = $(this).parents('.view');
				block.removeClass('view').addClass('edit');
				//that.pedit();
			});
			//保存
			$('.save',this.template).click(function(){
				if(that.node != null){
					that.saveEvent();
				}
				that.saveOrgInfo();
			});
			$('.cancel',this.template).click(function(){
				var block = $(this).parents('.edit');
				block.removeClass('edit').addClass('view');
				//that.pshow();
				$(".error_msg",that.template).hide();
			});
			$('.view_branch_salearea',this.template).click(function(){
				that.addSaleArea();//分公司--销售区域
			});
			$('.view_distribution_customer',this.template).click(function(){
				that.addCustomer();//分销中心--经销商
			});
		}
		
//		OrgCustom.prototype.pedit = function(){
//		}
//		OrgCustom.prototype.pshow = function(){
//		}
		
		OrgCustom.prototype.initOrgTree = function(){
			var that = this;
//			var accreditationType = $('select[name=accreditationType]',this.template);
//			var ACCREDITATION_TYPE = DictInfo.getVar('ACCREDITATION_TYPE');
//			if(ACCREDITATION_TYPE){
//	        	for(key in ACCREDITATION_TYPE){
//	        		var opt = $('<option></option>');
//	        		opt.text(ACCREDITATION_TYPE[key]).val(key);
//	        		accreditationType.append(opt);
//	        	}
//			}
		    this.orgTree = new V.Classes['v.ui.Tree']();
			this.orgTree.init({
				container:$('.org_tree',this.template),
				 dragable : true,
				 dropable : true,
				 url : this.module+'/organization!input.action',
				 async : true,
				 contextMenu:function(node){
					 var rightMenu = [];
					 var useFlag = node.data.isUsed;
				     if(node.treeNodeType == CONSTANT.ORG.TYPE_GROUP){//集团
				    	// rightMenu.push({eventId:that.EVENT.ADD_PRODUCT,text:'产品部门',icon:'icon-plus'});
				    	 //rightMenu.push({eventId:that.EVENT.ADD_REGIONAL,text:'分管区域',icon:'icon-plus'});
				    	// rightMenu.push({eventId:that.EVENT.ADD_FORENSIC,text:'法务部门',icon:'icon-plus'});
					 }else if(node.treeNodeType == CONSTANT.ORG.TYPE_PRODUCT_SELECT){//产品部门
//						 if(useFlag=='0')
//							 rightMenu.push({eventId:that.EVENT.STOP,text:'停用',icon:'icon-ban-circle'});
//						 else
//							 rightMenu.push({eventId:that.EVENT.START,text:'启用',icon:'icon-ok'});
					 }else if(node.treeNodeType == CONSTANT.ORG.TYPE_FOR_REGIONAL){//分管区域
						 //rightMenu.push({eventId:that.EVENT.ADD_BRANCH,text:'分公司',icon:'icon-plus'});
//						 if(useFlag=='0')
//							 rightMenu.push({eventId:that.EVENT.STOP,text:'停用',icon:'icon-ban-circle'});
//						 else
//							 rightMenu.push({eventId:that.EVENT.START,text:'启用',icon:'icon-ok'});
					 }else if(node.treeNodeType == CONSTANT.ORG.TYPE_BRANCH){//分公司
						// rightMenu.push({eventId:that.EVENT.ADD_DISTRIBUTION,text:'分销中心',icon:'icon-plus'});
//						 if(useFlag=='0')
//							 rightMenu.push({eventId:that.EVENT.STOP,text:'停用',icon:'icon-ban-circle'});
//						 else
//							 rightMenu.push({eventId:that.EVENT.START,text:'启用',icon:'icon-ok'});
					 }else if(node.treeNodeType == CONSTANT.ORG.TYPE_DISTRIBUTION_CENTRE){//分销中心
//						 if(useFlag=='0')
//							 rightMenu.push({eventId:that.EVENT.STOP,text:'停用',icon:'icon-ban-circle'});
//						 else
//							 rightMenu.push({eventId:that.EVENT.START,text:'启用',icon:'icon-ok'});
					 }else{
					 	return null;
					 }
				     return rightMenu;
				 }
			});
			
			//监听contextMenu操作;
			
			//产品部门
		    this.subscribe(this.orgTree,this.EVENT.ADD_PRODUCT,function(node){
		    	
				if(node.options.data != null && node.options.data.treelevel > 10){
					V.alert("分类的最大级数不能超过10级!");
					return;
				}
				that.node = null;
				var org = {
					orgType : CONSTANT.ORG.TYPE_PRODUCT_SELECT,
					parentId : node.options.id,
					parentCode : node.options.data.orgCode,
					treelevel : node.options.data.treelevel+1
				}
				that.org = org;
				that.addOrg(node,org);
			});
		    
			//分管区域
			this.subscribe(this.orgTree,this.EVENT.ADD_REGIONAL,function(node){
				if(node.options.data != null && node.options.data.treelevel > 10){
					V.alert("分类的最大级数不能超过10级!");
					return;
				}
				that.node = null;
				var org = {
					orgType : CONSTANT.ORG.TYPE_FOR_REGIONAL,
					parentId:node.options.id,
					parentCode : node.options.data.orgCode,
					treelevel : node.options.data.treelevel+1
				}
				//that.pedit();
				that.org = org;
				that.addOrg(node,org);
			});
			
			//法务部门
			this.subscribe(this.orgTree,this.EVENT.ADD_FORENSIC,function(node){
				if(node.options.data != null && node.options.data.treelevel > 10){
					V.alert("分类的最大级数不能超过10级!");
					return;
				}
				that.node = null;
				var org = {
					orgType : CONSTANT.ORG.TYPE_FORENSIC,
					parentId:node.options.id,
					parentCode : node.options.data.orgCode,
					treelevel : node.options.data.treelevel+1
				}
				//that.pedit();
				that.org = org;
				that.addOrg(node,org);
			});
			
			//分公司
			this.subscribe(this.orgTree,this.EVENT.ADD_BRANCH,function(node){
				if(node.options.data != null && node.options.data.treelevel > 10){
					V.alert("分类的最大级数不能超过10级!");
					return;
				}
				that.node = null;
				var org = {
					orgType : CONSTANT.ORG.TYPE_BRANCH,
					parentId : node.options.id,
					parentCode : node.options.data.orgCode,
					treelevel : node.options.data.treelevel+1
				}
				//that.pedit();
				that.org = org;
				that.addOrg(node,org);
				
			});
			
			//分销中心
			this.subscribe(this.orgTree,this.EVENT.ADD_DISTRIBUTION,function(node){
				if(node.options.data != null && node.options.data.treelevel > 10){
					V.alert("分类的最大级数不能超过10级!");
					return;
				}
				that.node = null;
				var org = {
					orgType : CONSTANT.ORG.TYPE_DISTRIBUTION_CENTRE,
					parentId : node.options.id,
					parentCode : node.options.data.orgCode,
					treelevel : node.options.data.treelevel+1
				}
				//that.pedit();
				that.org = org;
				that.addOrg(node,org);
			});
			
			//删除节点
			this.subscribe(this.orgTree,this.EVENT.REMOVE,function(node){
				if(node.options.data != null && node.options.data.treelevel > 10){
					V.alert("分类的最大级数不能超过10级!");
					return;
				}
				V.confirm("确认删除!",function(e){
					 that.removeOrg(node);
				});
				
			});
			
			//启用节点
			this.subscribe(this.orgTree,this.EVENT.START,function(node){
				if(node.options.data != null && node.options.data.treelevel > 10){
					V.alert("分类的最大级数不能超过10级!");
					return;
				}
				V.confirm("确认启用!",function(e){
					 that.startOrg(node);
				});
				
			});
			
			//停用节点
			this.subscribe(this.orgTree,this.EVENT.STOP,function(node){
				if(node.options.data != null && node.options.data.treelevel > 10){
					V.alert("分类的最大级数不能超过10级!");
					return;
				}
				V.confirm("确认停用!",function(e){
					 that.stopOrg(node);
				});
				
			});
			
			//选择节点
			this.subscribe(this.orgTree,this.orgTree.EVENT.SELECT,function(data){
				var node = data.node;
				that.node = node;
				var id = node.options.id;
				var type = node.options.treeNodeType;
				var isRoot = data.node.options.data.isRoot;
				
				$.ajax({
					url:this.module+'/organization!data.action',
					data:{orgType:type,orgId:id},
					dataType:'json',
					success:function(nodeData){
						if(nodeData.msg!="error"){
							node.data = nodeData;
							that.org = nodeData;
							that.showOrgInfo(false);
							that.getSaleArea(isRoot);
							that.getCustomer(isRoot);
						}else{
							V.alert(nodeData.info);
						}
					}
				});
				
			});
			
		};
		
		OrgCustom.prototype.saveEvent =  function(){
			
			var that = this;
			this.subscribe(this,this.EVENT.SAVE_ORG_SUCCESS,function(data){
				
				that.orgTree.updateNode(that.node,data.name);
				that.unsubscribe(that,that.EVENT.SAVE_ORG_SUCCESS,arguments.callee);
			});
		}

		OrgCustom.prototype.showOrgInfo = function(editable){
			
			var that = this;
			 var org = this.org;
		     var orginfo_selecter = '';
		     
			 switch(org.orgType){
			 	case this.orgType.GROUP:
				        orginfo_selecter=".group_info";
						break;
				case this.orgType.PRODUCT:
				        orginfo_selecter=".product_info";
						break;
				case this.orgType.REGIONAL:
				        orginfo_selecter=".regional_info";
						break;
				case this.orgType.FORENSIC:
				        orginfo_selecter=".forensic_info";
						break;
				case this.orgType.BRANCH:
				        orginfo_selecter=".branch_info";
						break;
				case this.orgType.DISTRIBUTION:
				        orginfo_selecter=".distribution_info";
						break;
			 }
			$(orginfo_selecter+' [data-key]',this.template).each(function(){
				var key = $(this).attr('data-key');
				var value = org[key] || '';
				var type = $(this).attr('data-type');
				if(type=='select'){
					$('.edit_input',this).val(value);
					$('.view_text',this).text($('.edit_input',this).find('option:selected').text());
				}else if(type=='checkbox'){
					var valueArr = value.split(',');
					$('input[type=checkbox]',this).each(function(){
						var checkValue = $(this).val();
						if($.inArray(checkValue,valueArr)!=-1){
							$(this).attr('checked',true);
						}
						else{
							$(this).attr('checked',false);
						}
					});
				}else{
					$('.view_text',this).text(value);
					$('.edit_input',this).val(value);
				}
			})
			
			$('.block',this.template).removeClass('cur');
			$(orginfo_selecter,this.template).addClass('cur');
			if(editable){
				$('.org_info .cur .view',this.template).removeClass('view').addClass('edit');
			}else{
				$('.org_info .cur .edit',this.template).removeClass('edit').addClass('view');
			}
			$('.org_info',this.template).animate({'margin-right':0},500);
			$('*[data-validator]',this.template).each(function(){
			 		$(this).parent().find('.error_msg').hide();
			});
		}
		
		
		OrgCustom.prototype.addOrg = function(porg,org){
			
			var that = this;
			this.org = org;
			this.showOrgInfo(true);
			//$('.org_info .cur .edit',this.template).trigger('click');
			this.subscribe(this,this.EVENT.SAVE_ORG_SUCCESS,function(data){
				
				 var config = {};
				 if(data.orgType == that.orgType.PRODUCT){
				 	config.name = data.name;
				 }else if(data.orgType == that.orgType.REGIONAL){
				 	config.name = data.name;
				 }else if(data.orgType == that.orgType.FORENSIC){
				 	config.name = data.name;
				 }else if(data.orgType == that.orgType.BRANCH){
				 	config.name = data.name;
				 }else if(data.orgType == that.orgType.DISTRIBUTION){
				 	config.name = data.name;
				 }
				 config.treeNodeType = data.orgType;
				 config.parentId = data.parentId;
				 config.data = data;
				 config.isLeaf = true;
				 config.isUsed = data.isUsed;
				 config.id = data.id;
				 config.treelevel = data.treelevel;
				 that.orgTree.addNode(config,porg);
				 that.unsubscribe(that,that.EVENT.SAVE_ORG_SUCCESS,arguments.callee);
			});
		}
		
		
		OrgCustom.prototype.getCurrentOrg = function(){
			
			var org = this.org
			$('.cur [data-key]',this.template).each(function(){
				var key = $(this).attr('data-key');
				var type = $(this).attr('data-type');
				if(type=='checkbox'){
					var valueArr = [];
					$('input[type=checkbox]:checked',this).each(function(){
						valueArr.push($(this).val());
					});
					valueArr = valueArr.join(',');
					org[key] = valueArr;
				}
				else{
					org[key] = $('.edit_input',this).val();
				}
			});
			return org;
		}
		
		
		OrgCustom.prototype.setInfo = function(orginfo_selecter,info){
			$(orginfo_selecter+' [data-key]',this.template).each(function(){
					var key = $(this).attr('data-key');
					if(key=='parentId') return true;
					$('.edit_input',this).val(info[key]||'');
			})
			//this.area_comp.initValue(info.provinceId,info.cityId,info.countyId);
		}
		
		OrgCustom.prototype.saveOrgInfo = function(){
			
			var that = this;
			if(!that.validate()) return;
			var url = this.module+"/organization!save.action";
			var org = this.getCurrentOrg();
			if(org.parentCode==null||org.parentCode==""){
				V.alert("集团属于默认级不能编辑！");
				return;
			}
			V.ajax({
				url:url,
				data:{data:org},
				success:function(data){
					 if(data.result == "success"){
						
//						if(org['id'] == undefined){
							org['id']=data.id;
//						}
						//org['treelevel'] = data.treelevel;
					 	var editable = false;
						//that.pshow();
					 	that.showOrgInfo(editable);
						that.publish({eventId:that.EVENT.SAVE_ORG_SUCCESS,data:org});
						 V.alert(data.info);
					 }
				}
			});
			
		}
		
		
		OrgCustom.prototype.removeOrg = function(node){
			var that = this;
			var url = this.module+"/organization!delete.action";
			$.ajax({
				url : url,
				data : {id:node.options.id},
				success : function(data){
					if(data== "success"){
						that.orgTree.removeNode(node);
						$('.block.cur',that.template).removeClass('cur');
						
					}else{
						V.alert(data.info);
					}
				}
			});
		}
		
		
		OrgCustom.prototype.startOrg = function(node){
			var that = this;
			var url = this.module+"/organization!useOrg.action";
			$.ajax({
				url : url,
				data : {id:node.options.id},
				success : function(data){
					if(data.result== "success"){
						var icon = 'icon-list-alt';
						if(node.options.isLeaf){
							icon = 'icon-file';
						}
						node.changeIcon(icon);
						node.options.data.isUsed = '0';
						node.initEvent();
						V.alert(data.info);
					}
				}
			});
		}
		
		
		OrgCustom.prototype.stopOrg = function(node){
			var that = this;
			var url = this.module+"/organization!lockOrg.action";
			$.ajax({
				url : url,
				data : {id:node.options.id},
				success : function(data){
					if(data.result== "success"){
						var icon = 'icon-ban-circle';
						node.changeIcon(icon);
						node.options.data.isUsed = '1';
						node.initEvent();
						V.alert(data.info);
					}
				}
			});
		}
		
		OrgCustom.prototype.validate = function(){
			var isValid = true;
			 var org = this.org;
		     var orginfo_selecter = '';
			 switch(org.orgType){
			 	case this.orgType.GROUP:
				        orginfo_selecter=".group_info";
						break;
				case this.orgType.PRODUCT:
				        orginfo_selecter=".product_info";
						break;
				case this.orgType.REGIONAL:
				        orginfo_selecter=".regional_info";
						break;
				case this.orgType.FORENSIC:
			        orginfo_selecter=".forensic_info";
					break;
				case this.orgType.BRANCH:
				        orginfo_selecter=".branch_info";
						break;
				case this.orgType.DISTRIBUTION:
				        orginfo_selecter=".distribution_info";
						break;
			 }
			
			$(orginfo_selecter + ' *[data-validator]',this.template).each(function(){
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
		
		//获取经销商信息
		OrgCustom.prototype.getCustomer = function(isRoot){
			var that = this;
			var container = $('.distributionCustomerlist',this.template).empty();
			var grid = this.customerGrid = new V.Classes['v.ui.Grid']();
			//update chenhaijun
			if (this.node.data.id != null) {
				grid.setFilters({org:{id:this.node.data.id,orgCode:this.node.data.orgCode}});
			}
			if(isRoot){//是根节点
				$('#distribution_customerID').hide();
				grid.init({
					container:container,
					url:this.module+'/organization!customerList.action',
					columns:[
	                    {displayName:'经销商编码',key:'partnerCode',width:120}
	                    ,{displayName:'经销商名称',key:'partnerName',width:120}
	                ]
				});
			}else{//不是根节点
				$('#distribution_customerID').show();
				grid.init({
					container:container,
					url:this.module+'/organization!customerList.action',
					columns:[
	                    {displayName:'经销商编码',key:'partnerCode',width:120}
	                    ,{displayName:'经销商名称',key:'partnerName',width:120}
	                    ,{displayName:'操作',key:'action',width:120,render:function(record){
	                        var html = $('<div><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a><div>');
	                        $('.remove',html).click(function(){
	                        	V.confirm('确认删除?',function(){
		                            $.ajax({
		                            	url:that.module+'/organization!delCustomer.action',
						               	type:'post',
						               	data: {customerId:record['id']},
						                success:function(data){
						                	if(data.msg=='success'){
						                      	grid.removeRecord(record);
						                      	V.alert(data.info);
						                	}else{
						                    	V.alert(data.info);
						                    }  	
						                }
						            })
					            })
	                        });
	                        return html;
	                    }}
	                ]
				});
			}
//			if(LoginInfo.isFx == 'FXZXJL'){//经销商
//				grid.init({
//					container:container,
//					url:this.module+'/organization!customerList.action',
//					columns:[
//	                    {displayName:'经销商编码',key:'partnerCode',width:120}
//	                    ,{displayName:'经销商名称',key:'partnerName',width:120}
////	                    ,{displayName:'操作',key:'action',width:120,render:function(record){
////	                        var html = $('<div><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a><div>');
////	                        $('.remove',html).click(function(){
////	                        	V.confirm('确认删除?',function(){
////		                            $.ajax({
////		                            	url:that.module+'/organization!delCustomer.action',
////						               	type:'post',
////						               	data: {customerId:record['id']},
////						                success:function(data){
////						                	if(data.msg=='success'){
////						                      	grid.removeRecord(record);
////						                      	V.alert(data.info);
////						                	}else{
////						                    	V.alert(data.info);
////						                    }  	
////						                }
////						            })
////					            })
////	                        });
////	                        return html;
////	                    }}
//	                ]
//				});
//			}else{
//				grid.init({
//					container:container,
//					url:this.module+'/organization!customerList.action',
//					columns:[
//	                    {displayName:'经销商编码',key:'partnerCode',width:120}
//	                    ,{displayName:'经销商名称',key:'partnerName',width:120}
//	                    ,{displayName:'操作',key:'action',width:120,render:function(record){
//	                        var html = $('<div><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a><div>');
//	                        $('.remove',html).click(function(){
//	                        	V.confirm('确认删除?',function(){
//		                            $.ajax({
//		                            	url:that.module+'/organization!delCustomer.action',
//						               	type:'post',
//						               	data: {customerId:record['id']},
//						                success:function(data){
//						                	if(data.msg=='success'){
//						                      	grid.removeRecord(record);
//						                      	V.alert(data.info);
//						                	}else{
//						                    	V.alert(data.info);
//						                    }  	
//						                }
//						            })
//					            })
//	                        });
//	                        return html;
//	                    }}
//	                ]
//				});
//			}
		}
		
		//添加经销商
		OrgCustom.prototype.addCustomer = function(){
			var that = this;
			/**Grid**/
			var tempPost = $("<div></div>");
			var list = this.list = new V.Classes['v.ui.Grid']();
			//var pagination = new V.Classes['v.ui.Pagination']();
			//list.setPagination(pagination);
			
		
			if(that.node.data.id){
				list.setFilters({node:{orgCode:that.node.data.orgCode}});
			}

			list.init({
	                container:tempPost,
	                checkable:true,
	            	url:this.module+'/organization!customers.action',
	                columns:[
	                    {displayName:'经销商编码',key:'partnerCode',width:200}
	                    ,{displayName:'经销商名称',key:'partnerName',width:200}
	                    //,{displayName:'分销中心',key:'ext1',width:150}
						]
					 });
			
			this.subscribe(list,list.EVENT.DATA_RETRIEVED,function(){
				//处理列表中出现的记录，在弹出窗口选中
				var postGridData = that.customerGrid.options.data||'';
				var tempData = list.options.data;
				$.each(postGridData,function(index,dom){
					var id = postGridData[index].id;
					$.each(tempData,function(tIndex,tDom){
						if(id==tempData[tIndex].id)
							tempData[tIndex]['checked'] = true;
					});
				});
			});

			/**Dialog**/
			var addDlg = new V.Classes['v.ui.Dialog']();
			addDlg.setBtnsBar({btns:[{text:"保存",style:"btn-primary",handler:function(){
				var selected = list.getCheckedRecords();
				var selected_array = [];
				for (var i = 0; i < selected.length; i++){
					 selected_array[i] = selected[i].id;
				};
				var org = that.org;
				  $.ajax({
					url:that.module+'/organization!savecustomer.action',
	               	type:'post',
					data: {customerIds: selected_array.join(','),id:org['id']},
	                success:function(data){
	                	if(data.msg=='success'){
	                		V.alert(data.info);
						  	addDlg.close();
						  	that.customerGrid.setFilters({org:{id:org['id']}});
						  	that.customerGrid.refresh();
						}else{
							V.alert(data.info);
						}	
	                }
	            })
				
			}},{text:"取消",handler:addDlg.close}]});
			addDlg.init({title:'经销商列表',height:550,width:700});
			/**将Grid中的数据加入到Dialog中**/
			addDlg.setContent(tempPost);
		}

		
//		//获取销售关系
//		OrgCustom.prototype.getSaleArea = function(){
//			var that = this;
//			var container = $('.branchSalearealist',this.template).empty();
//			var saleAreaGroupGrid =that.saleAreaGroupGrid = new V.Classes['v.ui.Grid']();
//			
//			if (this.node.data.orgCode != null) {
//				saleAreaGroupGrid.setFilters({org:{orgCode:this.node.data.orgCode}});
//			}
//			
//			//saleAreaGroupGrid.setPagination(new V.Classes['v.ui.Pagination']());
//			saleAreaGroupGrid.init({
//				container:container,
//				url:this.module+'/organization!saleGroupList.action',
//				columns:[
//                    {displayName:'销售关系名称',key:'salesGroupName',width:120}
//                    ,{displayName:'操作',key:'action',width:120,render:function(record){
//                    	var html = $('<div><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a><a class="edit" href="javascript:void(0);" style="margin:0 8px;" title="编辑"><i class="icon-edit"></i></a><a class="view" href="javascript:void(0);" style="margin:0 8px;" title="查看"><i class="icon-search"></i></a><div>');
//                    	
//                    	//var html = $('<div><a class="edit" href="javascript:void(0);" style="margin:0 8px;" title="编辑"><i class="icon-edit"></i></a><div>');
//                      
//                        var org = that.org;
//                        $('.remove',html).click(function(){
//                        	V.confirm('删除销售关系可能会影响到分销中心中的经销商,确认删除吗?',function(){
//	                            $.ajax({
//	                            	url:that.module+'/organization!delSaleGroup.action',
//					               	type:'post',
//					            	data: {salesGroupId:record['id'],orgCode:org.orgCode},
//					                success:function(data){
//					                	if(data.msg=='success'){
//										  	saleAreaGroupGrid.removeRecord(record);
//										  	saleAreaGroupGrid.refresh();
//					                		V.alert(data.info);
//					                	}else{
//					                    	V.alert(data.info);
//					                    }  	
//					                }
//					            })
//				            })
//                        });
//                        
//                       
//                        $('.edit',html).click(function(){
//	                            $.ajax({
//	                            	url:that.module+'/organization!editSaleGroup.action',
//					               	type:'post',
//					               	data: {salesGroupId:record['id']},
//					                success:function(data){
//					                	if(data.msg=='success'){
//					                		that.editSaleArea(data);
//					                      	//grid.removeRecord(record);
//					                      	//V.alert(data.info);
//					                	}else{
//					                    	V.alert(data.info);
//					                    }  	
//					                }
//					            })
//                        });
//                        return html;
//                    }}
//                ]
//			});
//		}
		//获取销售关系
		OrgCustom.prototype.getSaleArea = function(isRoot){
			var that = this;
			var container = $('.branchSalearealist',this.template).empty();
			var saleAreaGroupGrid =that.saleAreaGroupGrid = new V.Classes['v.ui.Grid']();
			if (this.node.data.orgCode != null) {
				saleAreaGroupGrid.setFilters({org:{orgCode:this.node.data.orgCode}});
			}
			if(isRoot){//根节点
				saleAreaGroupGrid.init({
					container:container,
					url:this.module+'/organization!saleGroupList.action',
					columns:[
	                    {displayName:'销售关系名称',key:'salesGroupName',width:120}
	                    ,{displayName:'客户类型',key:'customerType',width:120,render:function(record){
					    	 return DictInfo.getVar('CUSTOMER_TYPE')[record.customerType];
					     }}
	                    ,{displayName:'操作',key:'action',width:120,render:function(record){
	                    	$('#branch_saleareaID').hide();
	                    	$('#branchCompanyId').hide();
	                    	var html = $('<div><a class="view" href="javascript:void(0);" style="margin:0 8px;" title="查看"><i class="icon-search"></i></a><div>');
	                    	
	                        var org = that.org;
	                        $('.view',html).click(function(){
		                            $.ajax({
		                            	url:that.module+'/organization!editSaleGroup.action',
						               	type:'post',
						               	data: {salesGroupId:record['id']},
						                success:function(data){
						                	if(data.msg=='success'){
						                		that.viewSaleArea(data);
						                	}else{
						                    	V.alert(data.info);
						                    }  	
						                }
						            })
	                        });
	                        return html;
	                    }}
	                ]
				});
			}else{//不是根节点
				saleAreaGroupGrid.init({
					container:container,
					url:this.module+'/organization!saleGroupList.action',
					columns:[
	                    {displayName:'销售关系名称',key:'salesGroupName',width:120}
	                    ,{displayName:'客户类型',key:'customerType',width:120,render:function(record){
					    	 return DictInfo.getVar('CUSTOMER_TYPE')[record.customerType];
					     }}
	                    ,{displayName:'操作',key:'action',width:120,render:function(record){
	                    	var html = $('<div><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a><a class="edit" href="javascript:void(0);" style="margin:0 8px;" title="编辑"><i class="icon-edit"></i></a><div>');
	                    	
	                        var org = that.org;
	                        $('.remove',html).click(function(){
	                        	V.confirm('删除销售关系可能会影响到分销中心中的经销商,确认删除吗?',function(){
		                            $.ajax({
		                            	url:that.module+'/organization!delSaleGroup.action',
						               	type:'post',
						            	data: {salesGroupId:record['id'],orgCode:org.orgCode},
						                success:function(data){
						                	if(data.msg=='success'){
											  	saleAreaGroupGrid.removeRecord(record);
											  	saleAreaGroupGrid.refresh();
						                		V.alert(data.info);
						                	}else{
						                    	V.alert(data.info);
						                    }  	
						                }
						            })
					            })
	                        });
	                        $('.edit',html).click(function(){
		                            $.ajax({
		                            	url:that.module+'/organization!editSaleGroup.action',
						               	type:'post',
						               	data: {salesGroupId:record['id']},
						                success:function(data){
						                	if(data.msg=='success'){
						                		that.editSaleArea(data);
						                      	//grid.removeRecord(record);
						                      	//V.alert(data.info);
						                	}else{
						                    	V.alert(data.info);
						                    }  	
						                }
						            })
	                        });
	                        return html;
	                    }}
	                ]
				});
			}
//			if(LoginInfo.user.admin === "0"){//bjadmin
//				saleAreaGroupGrid.init({
//					container:container,
//					url:this.module+'/organization!saleGroupList.action',
//					columns:[
//	                    {displayName:'销售关系名称',key:'salesGroupName',width:120}
//	                    ,{displayName:'操作',key:'action',width:120,render:function(record){
//	                    	var html = $('<div><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a><a class="edit" href="javascript:void(0);" style="margin:0 8px;" title="编辑"><i class="icon-edit"></i></a><div>');
//	                    	
//	                        var org = that.org;
//	                        $('.remove',html).click(function(){
//	                        	V.confirm('删除销售关系可能会影响到分销中心中的经销商,确认删除吗?',function(){
//		                            $.ajax({
//		                            	url:that.module+'/organization!delSaleGroup.action',
//						               	type:'post',
//						            	data: {salesGroupId:record['id'],orgCode:org.orgCode},
//						                success:function(data){
//						                	if(data.msg=='success'){
//											  	saleAreaGroupGrid.removeRecord(record);
//											  	saleAreaGroupGrid.refresh();
//						                		V.alert(data.info);
//						                	}else{
//						                    	V.alert(data.info);
//						                    }  	
//						                }
//						            })
//					            })
//	                        });
//	                        $('.edit',html).click(function(){
//		                            $.ajax({
//		                            	url:that.module+'/organization!editSaleGroup.action',
//						               	type:'post',
//						               	data: {salesGroupId:record['id']},
//						                success:function(data){
//						                	if(data.msg=='success'){
//						                		that.editSaleArea(data);
//						                      	//grid.removeRecord(record);
//						                      	//V.alert(data.info);
//						                	}else{
//						                    	V.alert(data.info);
//						                    }  	
//						                }
//						            })
//	                        });
//	                        return html;
//	                    }}
//	                ]
//				});
//			}else{//分公司
//				saleAreaGroupGrid.init({
//					container:container,
//					url:this.module+'/organization!saleGroupList.action',
//					columns:[
//	                    {displayName:'销售关系名称',key:'salesGroupName',width:120}
//	                    ,{displayName:'操作',key:'action',width:120,render:function(record){
//	                    	$('#branch_saleareaID').hide();
//	                    	var html = $('<div><a class="view" href="javascript:void(0);" style="margin:0 8px;" title="查看"><i class="icon-search"></i></a><div>');
//	                    	
//	                        var org = that.org;
//	                        $('.view',html).click(function(){
//		                            $.ajax({
//		                            	url:that.module+'/organization!editSaleGroup.action',
//						               	type:'post',
//						               	data: {salesGroupId:record['id']},
//						                success:function(data){
//						                	if(data.msg=='success'){
//						                		that.viewSaleArea(data);
//						                	}else{
//						                    	V.alert(data.info);
//						                    }  	
//						                }
//						            })
//	                        });
//	                        return html;
//	                    }}
//	                ]
//				});
//			}
		}
		
		//编辑销售关系组
		OrgCustom.prototype.editSaleArea = function(data){
			
			var that = this;
			/**Grid**/
			//var tempPost = $("<div><div class='list_group' style='margin:1px 1px 15px'><label>销售关系名称：</label><input id='salesGroupId' type='text' name='salesGroupName' /></div><div class='list_area' style='margin:1px 1px 15px'><label>销售区域：</label></div><div class='list_cate'><label>产品分类：</label></div></div>");
			var tempPost = $("<div><div class='list_group' style='margin:1px 1px 15px;width:300px'><div><label><span style='color:red'>*</span>销售关系名称：</label><input id='salesGroupId' type='text' name='salesGroupName' /></div><div><label><span style='color:red'>*</span>客户类型：</label><select id='customerTypeId' name='customerType'><option value='ALL'>全部</option><option value='DEALER'>经销商</option><option value='MAJOR'>种植大户</option></select></div></div><div class='list_area' style='margin:1px 1px 15px'><label><span style='color:red'>*</span>销售区域：</label></div><div class='list_cate'><label><span style='color:red'>*</span>产品分类：</label></div></div>");
			
			//销售关系名称回显
			$("#salesGroupId",tempPost).val(data.salesGroupData.salesGroupName);
			$("#customerTypeId",tempPost).val(data.salesGroupData.customerType);
			
			//分类
			var listCate = new V.Classes['v.ui.Grid']();
			
			//var paginationCate = new V.Classes['v.ui.Pagination']();
			//listCate.setPagination(paginationCate);
			
			//var filterdata = that.postGrid.options.data||'';
			//list.setFilters({'filterdata':filterdata});    thepage   data_loaded
			
			
			this.subscribe(listCate,listCate.EVENT.DATA_RETRIEVED,function(){
				
				//处理列表中出现的记录，在弹出窗口选中
				if(data.goodsCatData != null){
					var tempData = data.goodsCatData;//回显数据
					var postGridData = listCate.options.data;//全部数据
					$.each(tempData,function(index,dom){
						var id = tempData[index].id;
						$.each(postGridData,function(tIndex,tDom){
							if(id==postGridData[tIndex].id)
								postGridData[tIndex]['checked'] = true;
						});
					});
				}

			});
			
			listCate.init({
	                container:$('.list_cate',tempPost),
	                checkable:true,
	            	url:'common!goodsCatAllList.action',
	            	height:200,
	                columns:[
	                    {displayName:'分类编码',key:'categoryCode',width:200}
	                    ,{displayName:'分类名称',key:'categoryName',width:200}
					]
				    //data:data.goodsCatData
			});
					 
			
			//销售区域
			var listArea = new V.Classes['v.ui.Grid']();
			//var paginationArea = new V.Classes['v.ui.Pagination']();
			//listArea.setPagination(paginationArea);
			//var filterdata = that.postGrid.options.data||'';
			//list.setFilters({'filterdata':filterdata});
			
			listArea.init({
	                container:$('.list_area',tempPost),
	                checkable:true,
	                height:200,
	            	url:this.module+'/organization!salearea.action',
	                columns:[
	                    {displayName:'销售区域编码',key:'areaCode',width:200}
	                    ,{displayName:'销售区域名称',key:'name',width:200}
	                ]
	               // data:data.salesAreaData
			});
			
			
			this.subscribe(listArea,listArea.EVENT.DATA_RETRIEVED,function(){
				
				if(data.countryDate == true){//表示全国存储
//					//全选头
//					$(".thepage",listCate.template).attr('checked',true);
//					//所有行
//	                $('tbody .td_chk input',listCate.template).attr('checked',true);
//	    			$.each(listCate.options.data,function(index,record){
//	    				record['checked'] = true;
//	    			});	
					
					//处理列表中出现的记录，在弹出窗口选中
					//var tempData = data.goodsCatData||'';//回显数据
					var postGridData = listArea.options.data;//全部数据
					$.each(postGridData,function(index,dom){
						postGridData[index]['checked'] = true;
						//var id = tempData[index].id;
						//$.each(postGridData,function(tIndex,tDom){
							//if(id==postGridData[tIndex].id)
								//postGridData[tIndex]['checked'] = true;
						//});
					});
					
				}else{//普通存储
					//处理列表中出现的记录，在弹出窗口选中
					if(data.salesAreaData != null){
						var tempData= data.salesAreaData;//回显数据
						var postGridData= listArea.options.data;//所有数据
						$.each(tempData,function(index,dom){
							var id = tempData[index].id;
							$.each(postGridData,function(tIndex,tDom){
								if(id==postGridData[tIndex].id)
									postGridData[tIndex]['checked'] = true;
							});
						});
					}
				}
			});
			/**Dialog**/
			var addDlg = new V.Classes['v.ui.Dialog']();
			addDlg.setBtnsBar({btns:[{text:"保存",style:"btn-primary",handler:function(){
				
				//获取关系名称值
				var salesGroupName = $("#salesGroupId",tempPost).val();
				debugger;
				var customerType = $("#customerTypeId",tempPost).val();
				
				var selectedArea = listArea.getCheckedRecords();
				var selected_arrayArea = [];
				for (var i = 0; i < selectedArea.length; i++){
					 selected_arrayArea[i] = selectedArea[i].areaCode;
				};
				
				var selectedCate = listCate.getCheckedRecords();
				var selected_arrayCate = [];
				for (var i = 0; i < selectedCate.length; i++){
					 selected_arrayCate[i] = selectedCate[i].categoryCode;
				};
				
				var org = that.org;
				  $.ajax({
					url:that.module+'/organization!savesalesgroup.action',
	               	type:'post',
					data: {categoryCode: selected_arrayCate.join(','),saleAreaCode: selected_arrayArea.join(','),orgCode:org['orgCode'],salesGroupName:salesGroupName,customerType:customerType,salesGroupId:data.salesGroupData.id},
	                success:function(data){
	                	if(data.msg=='success'){
						  	addDlg.close();
						  	V.alert(data.info);
						  	that.saleAreaGroupGrid.refresh();
						}else{
							V.alert(data.info);
						}	
	                }
	            })
				
	            
	            
			}},{text:"取消",handler:addDlg.close}]});
			addDlg.init({title:'编辑销售关系',height:550,width:700});
			/**将Grid中的数据加入到Dialog中**/
			addDlg.setContent(tempPost);
		}	
			
			
			//查看销售关系组
			OrgCustom.prototype.viewSaleArea = function(data){
				
				var that = this;
				/**Grid**/
				var tempPost = $("<div><div class='list_group' style='margin:1px 1px 15px'><label><span style='color:red'>*</span>销售关系名称：</label><input id='salesGroupId' type='text' name='salesGroupName' /></div><div class='list_area' style='margin:1px 1px 15px'><label><span style='color:red'>*</span>销售区域：</label></div><div class='list_cate'><label><span style='color:red'>*</span>产品分类：</label></div></div>");
				//销售关系名称回显
				$("#salesGroupId",tempPost).val(data.salesGroupData.salesGroupName);
				$("#salesGroupId",tempPost).attr('disabled',"true");
				//分类
				var listCate = new V.Classes['v.ui.Grid']();
				this.subscribe(listCate,listCate.EVENT.DATA_RETRIEVED,function(){
//					var checkArr = $(".list_area",tempPost).children().get(1);
//					$("*input[type=checkbox]",checkArr).disabled = true;
					$(":checkbox",listCate.template).attr("disabled",true);
					//处理列表中出现的记录，在弹出窗口选中
					if(data.goodsCatData != null){
						var tempData = data.goodsCatData;//回显数据
						var postGridData = listCate.options.data;//全部数据
						
						$.each(tempData,function(index,dom){
							var id = tempData[index].id;
							$.each(postGridData,function(tIndex,tDom){
								if(id==postGridData[tIndex].id)
									postGridData[tIndex]['checked'] = true;
							});
						});
					}

				});
				this.subscribe(listCate,listCate.EVENT.DATA_LOADED,function(){
					$(":checkbox",listCate.template).attr("disabled",true);
				})
				listCate.init({
		                container:$('.list_cate',tempPost),
		                checkable:true,
		            	url:'common!goodsCatAllList.action',
		            	height:200,
		                columns:[
		                    {displayName:'分类编码',key:'categoryCode',width:200}
		                    ,{displayName:'分类名称',key:'categoryName',width:200}
						]
				});
				//销售区域
				var listArea = new V.Classes['v.ui.Grid']();
				listArea.init({
		                container:$('.list_area',tempPost),
		                checkable:true,
		                height:200,
		            	url:this.module+'/organization!salearea.action',
		                columns:[
		                    {displayName:'销售区域编码',key:'areaCode',width:200}
		                    ,{displayName:'销售区域名称',key:'name',width:200}
		                ]
				});
				this.subscribe(listArea,listArea.EVENT.DATA_RETRIEVED,function(){
					
					if(data.countryDate == true){//表示全国存储
						var postGridData = listArea.options.data;//全部数据
						$.each(postGridData,function(index,dom){
							postGridData[index]['checked'] = true;
						});
						
					}else{//普通存储
						//处理列表中出现的记录，在弹出窗口选中
						if(data.salesAreaData != null){
							var tempData= data.salesAreaData;//回显数据
							var postGridData= listArea.options.data;//所有数据
							$.each(tempData,function(index,dom){
								var id = tempData[index].id;
								$.each(postGridData,function(tIndex,tDom){
									if(id==postGridData[tIndex].id)
										postGridData[tIndex]['checked'] = true;
								});
							});
						}
					}
				});
				this.subscribe(listArea,listArea.EVENT.DATA_LOADED,function(){
					$(":checkbox",listArea.template).attr("disabled",true);
				})
			/**Dialog**/
			var addDlg = new V.Classes['v.ui.Dialog']();
//			addDlg.setBtnsBar({btns:[{text:"保存",style:"btn-primary",handler:function(){
//				
//				//获取关系名称值
//				var salesGroupName = $("#salesGroupId",tempPost).val();
//				
//				var selectedArea = listArea.getCheckedRecords();
//				var selected_arrayArea = [];
//				for (var i = 0; i < selectedArea.length; i++){
//					 selected_arrayArea[i] = selectedArea[i].areaCode;
//				};
//				
//				var selectedCate = listCate.getCheckedRecords();
//				var selected_arrayCate = [];
//				for (var i = 0; i < selectedCate.length; i++){
//					 selected_arrayCate[i] = selectedCate[i].categoryCode;
//				};
//				
//				var org = that.org;
//				  $.ajax({
//					url:that.module+'/organization!savesalesgroup.action',
//	               	type:'post',
//					data: {categoryCode: selected_arrayCate.join(','),saleAreaCode: selected_arrayArea.join(','),orgCode:org['orgCode'],salesGroupName:salesGroupName,salesGroupId:data.salesGroupData.id},
//	                success:function(data){
//	                	if(data.msg=='success'){
//						  	addDlg.close();
//						  	V.alert(data.info);
//						  	that.saleAreaGroupGrid.refresh();
//						}else{
//							V.alert(data.info);
//						}	
//	                }
//	            })
//				
//	            
//	            
//			}},{text:"取消",handler:addDlg.close}]});
			addDlg.init({title:'查看销售关系',height:550,width:700});
			/**将Grid中的数据加入到Dialog中**/
			addDlg.setContent(tempPost);
		}
		
		
		//添加销售关系组
		OrgCustom.prototype.addSaleArea = function(){
			var that = this;
			/**Grid**/
			var tempPost = $("<div><div class='list_group' style='margin:1px 1px 15px'><label><span style='color:red'>*</span>销售关系名称：</label><input id='salesGroupId' type='text' name='salesGroupName' /><label><span style='color:red'>*</span>客户类型：</label><select id='customerTypeId' name='customerType'><option value='ALL'>全部</option><option value='DEALER'>经销商</option><option value='MAJOR'>种植大户</option></select></div><div class='list_area' style='margin:1px 1px 15px'><label><span style='color:red'>*</span>销售区域：</label></div><div class='list_cate'><label><span style='color:red'>*</span>产品分类：</label></div></div>");
			
			//分类
			var listCate = new V.Classes['v.ui.Grid']();
			
			//var paginationCate = new V.Classes['v.ui.Pagination']();
			//listCate.setPagination(paginationCate);
			
			//var filterdata = that.postGrid.options.data||'';
			//list.setFilters({'filterdata':filterdata});    thepage   data_loaded
			
			this.subscribe(listCate,listCate.EVENT.DATA_LOADED,function(){
				//全选头
				$(".thepage",listCate.template).attr('checked',true);
				//所有行
                $('tbody .td_chk input',listCate.template).attr('checked',true);
    			$.each(listCate.options.data,function(index,record){
    				record['checked'] = true;
    			});
    			
				//处理列表中出现的记录，在弹出窗口选中
				//var postGridData = that.listCate.options.data||'';
				//var tempData = listCate.options.data;
				//$.each(postGridData,function(index,dom){
				//	postGridData[index]['checked'] = true;
				//});
				
//				$.each(postGridData,function(index,dom){
//					var id = postGridData[index].id;
//					$.each(tempData,function(tIndex,tDom){
//						if(id==tempData[tIndex].id)
//							tempData[tIndex]['checked'] = true;
//					});
//				});
				
			});
			
			listCate.init({
	                container:$('.list_cate',tempPost),
	                checkable:true,
	            	url:'common!goodsCatAllList.action',
	            	height:200,
	                columns:[
	                    {displayName:'分类编码',key:'categoryCode',width:200}
	                    ,{displayName:'分类名称',key:'categoryName',width:200}
						]
			});
					 
			
				
			
			//销售区域
			var listArea = new V.Classes['v.ui.Grid']();
			//var paginationArea = new V.Classes['v.ui.Pagination']();
			//listArea.setPagination(paginationArea);
			//var filterdata = that.postGrid.options.data||'';
			//list.setFilters({'filterdata':filterdata});
			
			listArea.init({
	                container:$('.list_area',tempPost),
	                checkable:true,
	                height:200,
	            	url:this.module+'/organization!salearea.action',
	                columns:[
	                    {displayName:'销售区域编码',key:'areaCode',width:200}
	                    ,{displayName:'销售区域名称',key:'name',width:200}
	                    ]
			});
			
			//this.subscribe(listArea,listArea.EVENT.DATA_LOADED,function(){
				//处理列表中出现的记录，在弹出窗口选中
//				var postGridData = that.listArea.options.data||'';
//				var tempData = listArea.options.data;
//				$.each(postGridData,function(index,dom){
//					var id = postGridData[index].id;
//					$.each(tempData,function(tIndex,tDom){
//						if(id==tempData[tIndex].id)
//							tempData[tIndex]['checked'] = true;
//					});
//				});
			//});
					 

			
			/**Dialog**/
			var addDlg = new V.Classes['v.ui.Dialog']();
			addDlg.setBtnsBar({btns:[{text:"保存",style:"btn-primary",handler:function(){
				
				
				//获取关系名称值
				var salesGroupName = $("#salesGroupId",tempPost).val();
				var customerType = $("#customerTypeId",tempPost).val();
				
				var selectedArea = listArea.getCheckedRecords();
				var selected_arrayArea = [];
				for (var i = 0; i < selectedArea.length; i++){
					 selected_arrayArea[i] = selectedArea[i].areaCode;
				};
				
				var selectedCate = listCate.getCheckedRecords();
				var selected_arrayCate = [];
				for (var i = 0; i < selectedCate.length; i++){
					 selected_arrayCate[i] = selectedCate[i].categoryCode;
				};
				
				var org = that.org;
				  $.ajax({
					url:that.module+'/organization!savesalesgroup.action',
	               	type:'post',
					data: {categoryCode: selected_arrayCate.join(','),saleAreaCode: selected_arrayArea.join(','),orgCode:org['orgCode'],salesGroupName:salesGroupName,customerType:customerType},
	                success:function(data){
	                	if(data.msg=='success'){
						  	addDlg.close();
						  	V.alert(data.info);
						  	that.saleAreaGroupGrid.refresh();
						}else{
							V.alert(data.info);
						}	
	                }
	            })
				
			}},{text:"取消",handler:addDlg.close}]});
			addDlg.init({title:'新增销售关系',height:550,width:700});
			/**将Grid中的数据加入到Dialog中**/
			addDlg.setContent(tempPost);
		}
		
		OrgCustom.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'组织机构'}});
		}
		
		
	})(V.Classes['v.views.backoffice.custom.OrgCustom']);
},{plugins:['v.ui.tree','v.ui.tree','v.fn.validator','v.ui.grid','v.ui.pagination','v.ui.dialog','v.fn.validator']})