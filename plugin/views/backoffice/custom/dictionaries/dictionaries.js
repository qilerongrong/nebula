/**
 * 数据字典维护
 * data:2012-11-19
 */
;V.registPlugin("v.views.backoffice.custom.dictionaries",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.Dictionaries",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.backoffice.custom.dictionaries";
			this.module = '';
			this.data = {};
			this.list = new V.Classes['v.ui.Grid']();
			this.resource = {
				html:'template.html'
			}
		}
	});
	(function(Dictionaries){
        Dictionaries.prototype.init = function(options){
			this.options = options;
			this.module = options.module;
			this.container = options.container;
			this.platformNo = options.platformNo;
			if (this.platformNo == null || this.platformNo == undefined) {
				this.platformNo = LoginInfo.user.createByPlatformNo;
			}
			this.party = options.party;
			this.businessRole = options.businessRole;
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					that.initInfo();
					that.initEvent();
				}
			})
		}
		Dictionaries.prototype.initEvent = function(){
			var that = this;
			if(this.party){
				$('.partyName',this.template).html('企业名称：'+this.party.partyName)
			}
			$(".modellist",this.template).change(function(){
				that.refresh();
			});
			$('.new',this.template).click(function(){
				that.addOrEditDict();
			})
//			if(CONSTANT.USER_TYPE.MAINTEMNCE==LoginInfo.user.userType && this.businessRole!=null){
//				$('.new',this.template).hide();
//			}
		}
		 
		Dictionaries.prototype.initInfo = function(){
		   var that = this;
		   $.ajax({
		 	 url:this.module+'/dict-type!init.action',
		 	 type:'POST',
			 dataType:'json',
			 contentType:'application/json',
			 data:JSON.stringify({platformNo:that.platformNo}),
			 success: function(data){
			 	if (data != null && data != undefined) {
					if(data.modelList != undefined && data.modelList.length > 0){
						var module = that.initmodellist(data);
						that.initTypeInfo(module);
					}
			 	}
			 }
		   });
		}
	    //数据字典data列表
		Dictionaries.prototype.createType = function(adddlg,type,typelist,data){
			var that = this;
			this.list = new V.Classes['v.ui.Grid']();
			var list = this.list;
			this.dictType = data; //字典
			
			if(typelist != undefined && typelist.length >0){
				props = typelist;
			}else{
				var prop = {id:null,parentId:null,dicttype:data&&data.id,dictname:'',sortno:'1',status:null,dictcode:'',systemDictname:'',defaultValue:'0'}
				var props = [];
				if(data!="")
					props.push(prop);
			}
			var record;var cols1;var cols2;var cols3;var cols4;var colsId;var colsParentId;var columns = [];
			$.each(props,function(i){
				record=props[i];
				 	cols1 = {displayName:'  编码',key:'id',width:150,render:function(record){
				 		if(CONSTANT.USER_TYPE.MAINTEMNCE==LoginInfo.user.userType && that.businessRole==null){
				 			var html = $('<input type="text" style="width:120px;" value="'+record.dictcode+'" data-validator="text" data-required="true" /><p class="error_msg"></p>');
							html.change(function(){
								record.dictcode = this.value;
							});
							return html;
				 		}
				 		else{
				 			if(that.dictType.modifyType==1 || that.dictType.modifyType==2){
				 				return record.dictcode;
				 			}else{
				 				var html = $('<input type="text" style="width:120px;" value="'+record.dictcode+'" data-validator="text" data-required="true" /><p class="error_msg"></p>');
				 				html.change(function(){
				 					record.dictcode = this.value;
				 				});
				 				return html;
				 			}
				 		}
					}};
				 	cols2 =  {displayName:'<span style="color:red">*</span>名称',key:'name',width:150,render:function(record){
					 		if(CONSTANT.USER_TYPE.MAINTEMNCE==LoginInfo.user.userType && that.businessRole==null){
					 			var html = $('<span style="color:red">*</span><input type="text" style="width:120px;" value="'+record.dictname+'" data-validator="text" data-required="true" /><p class="error_msg"></p>');
								html.change(function(){
									record.dictname = this.value;
									record.systemDictname = this.value;
								});
								return html;
					 		}else{
					 			if(that.dictType.modifyType==1){
					 				return record.dictname;
					 			}else{
					 				var html = $('<span style="color:red">*</span><input type="text" style="width:120px;" value="'+record.dictname+'" data-validator="text" data-required="true" /><p class="error_msg"></p>');
									html.change(function(){
										record.dictname = this.value;
										record.systemDictname = this.value;
									});
									return html;
					 			}
					 		}
						}};
				 	cols3 = {displayName:'  <span style="color:red">*</span>默认值',key:'name',width:80,render:function(record){
				 			var html;
				 			if(record.defaultValue != undefined && record.defaultValue != 0){
								html = $('<input type="radio" style="width:60px;" value="" checked="true"  /><p class="error_msg"></p>');
							}else{
								html = $('<input type="radio" style="width:60px;" value=""   /><p class="error_msg"></p>');
							}
							html.change(function(){
								if(this.checked){
									var listdata = that.list.options.data;
									$.each(listdata,function(){
										this.defaultValue = 0;
									})
									record.defaultValue = 1;
									list.refresh();;
								}
							});
							return html;
						}};
				 	cols4 ={displayName:'  操作',key:'actions',width:200,render:function(record){
							var actions = $("<div style='text-align:center;'><button  class='btn  btn-mini add'><i class='icon-plus'></i></button><button  class='btn remove btn-mini' style='margin-left:6px;'><i class='icon-minus'></i></button><button class='btn up btn-mini' style='margin-left:6px;'><i class='icon-arrow-up'></i></button><button class='btn down btn-mini' style='margin-left:6px;'><i class='icon-arrow-down'></i></button></div>");
							var prop = {id:'',dictid:'',dicttype:data&&data.dictTypeId,dictname:'',sortno:'',status:null,dictcode:'',systemDictname:'',defaultValue:'0'}
							var index = list.getRecordIndex(record);
							$('.add',actions).click(function(){
							    list.options.data.splice(index+1,0,prop);
							    $.each(list.options.data,function(index,dom){
							    	dom.sortno = index + 1;
							    })
								list.refresh();
							});
							$('.remove',actions).click(function(){
								var size = list.options.data.length;
								if(size>1){
									list.options.data.splice(index,1);
									$.each(list.options.data,function(index,dom){
									    dom.sortno = index + 1;
									})
								    list.refresh();
								}
							});
							$('.up',actions).click(function(){
	                            var preRecord = list.options.data[index-1];
	                            var tmpNo = record.sortno;
	                            record.sortno = preRecord.sortno;
	                            preRecord.sortno = tmpNo;
	                            
	                            list.options.data[index] = preRecord;
	                            list.options.data[index-1] = record;
	                            
	                            list.refresh();
	                        });
	                        $('.down',actions).click(function(){
	                        	var nextRecord = list.options.data[index+1];
	                            var tmpNo = record.sortno;
	                            record.sortno = nextRecord.sortno;
	                            nextRecord.sortno = tmpNo;
	                            
	                            list.options.data[index] = nextRecord;
	                            list.options.data[index+1] = record;
	                            
	                            list.refresh();
	                        });
	                        if(index==0){
	                        	$('.up',actions).hide();
	                        }
	                        if(index==list.options.data.length-1){
	                        	$('.down',actions).hide();
	                        }
							return actions;
						}};
						colsId = {displayName:'标识',key:'id',width:100};
						colsParentId = {displayName:'父标识',key:'parentId',width:100,render:function(record){
					 		if(CONSTANT.USER_TYPE.MAINTEMNCE==LoginInfo.user.userType && that.businessRole==null){
					 			var html = $('<input type="text" style="width:100px;" value="'+(record.parentId||'')+'" data-validator="text" data-required="false" /><p class="error_msg"></p>');
								html.change(function(){
									record.parentId = this.value;
								});
								return html;
					 		}
					 		else{
					 			if(that.dictType.modifyType==1 || that.dictType.modifyType==2){
					 				return record.parentId||'';
					 			}else{
					 				var html = $('<input type="text" style="width:100px;" value="'+(record.parentId||'')+'" data-validator="text" data-required="false" /><p class="error_msg"></p>');
					 				html.change(function(){
					 					record.parentId = this.value;
					 				});
					 				return html;
					 			}
					 		}
						}};
				})
				if(CONSTANT.USER_TYPE.MAINTEMNCE==LoginInfo.user.userType && that.businessRole==null){
					columns = [colsId,colsParentId,cols1,cols2,cols3,cols4];
				}else{
					if(data != undefined && data.modifyType == 1){
						columns = [colsId,colsParentId,cols1,cols2];
					}else if(data != undefined && data.modifyType == 2){
						columns = [colsId,colsParentId,cols1,cols2,cols3];
					}else if(data != undefined && data.modifyType == 3){
						columns = [colsId,colsParentId,cols1,cols2,cols3,cols4];
					}
				}
				list.init({
					container:$('.dataList',adddlg.template),
					columns:columns,
					data:props
				});
		}
		Dictionaries.prototype.refresh = function(){
			var module = {};
			module['moduleCode'] = $('.modellist',this.template).val();
			this.initTypeInfo(module);
		}
		Dictionaries.prototype.deleteTypeHandler = function(model,syncFlag){
			var that = this;
			$.ajax({
				url:that.module+'/dict-type!deleteType.action',
				data:JSON.stringify({entity:model,platformNo:that.platformNo,syncFlag:syncFlag}),
				contentType:'application/json',
				type:'POST',
				success: function(data){
			  		if(data.result == 'success'){
						V.alert(data.msg);
						that.refresh();
						that.refreshDic();
					}else{
						V.alert(data.msg);
					}
				}
			})
		}
		Dictionaries.prototype.deleteType = function(model,typelist){
			var that = this;
			if(LoginInfo.user.userType==CONSTANT.USER_TYPE.MAINTEMNCE && this.businessRole==null){
				var con = $('<div>是否同步删除<div>');
				var editDlg = new V.Classes['v.ui.Dialog']();
				editDlg.setContent(con);
				editDlg.setBtnsBar({
					position:'center',
					btns:[
					    {text:'同步删除',style:'btn-danger left',handler:function(){
					    	that.deleteTypeHandler(model,true);
					    	editDlg.close();
						}},
						{text:'不同步删除',style:'btn-primary center',handler:function(){
							that.deleteTypeHandler(model,false);
							editDlg.close();
						}},
						{text:'关闭',style:'right',handler:function(){
							editDlg.close();
						}}
					]
				});
				var title = '删除字典属性' + '--' +model.dictTypeName;
				editDlg.init({
					width:400,
					height:100,
					title:title
				});
			}else{
				V.confirm("确认删除数据字典?",function(){
					that.deleteTypeHandler(model);
				});
			}
		}
		//新增或编辑数据字典
		Dictionaries.prototype.addOrEditDict = function(data,typelist){
			data = data||'';
			var editDlg = new V.Classes['v.ui.Dialog']();
			var that = this;
			var modelName = $('.modellist',this.template).find('option:selected').text();
			var modifyType = [['只读','1'],['部分修改','2'],['完全修改','3']];
		    var con = $('<div><div class="dataType"></div><div class="dataList"></div>');
			
		    var form = new V.Classes['v.component.Form']();
		    var Form = V.Classes['v.component.Form'];
            var items = [
                       {label:'编码',type:Form.TYPE.TEXT,name:'dictTypeCode',value:data.dictTypeCode||'',required:true},
                       {label:'名称',type:Form.TYPE.TEXT,name:'dictTypeName',value:data.dictTypeName||'',required:true},
                       {label:'模块名',type:Form.TYPE.READONLY,name:'moduleName',value:data.moduleName||modelName},
                       {label:'编辑类型',type:Form.TYPE.SELECT,name:'modifyType',value:data.modifyType,multiList:modifyType}
                ];
            
            if(LoginInfo.user.userType==CONSTANT.USER_TYPE.MAINTEMNCE && this.businessRole==null){
            	items.push({label:'是否同步',type:Form.TYPE.BOOLEAN,name:'syncFlag',value:'true'});
            }
            
            form.init({
                colspan:2,
                items:items,
                container:$('.dataType',con)
            });
            
            if(CONSTANT.USER_TYPE.MAINTEMNCE==LoginInfo.user.userType && this.businessRole!=null && data!=''){
            	$('*[name=modifyType]',form.template).attr('readOnly',true);
            	$('*[name=modifyType]',form.template).attr('disabled',true);
            }
            if(CONSTANT.USER_TYPE.MAINTEMNCE!=LoginInfo.user.userType && data!=''){
            	$('*[name=modifyType]',form.template).attr('readOnly',true);
            	$('*[name=modifyType]',form.template).attr('disabled',true);
//            	$('*[name=modifyType]',form.template).val('3'); //中心企业，完全修改
            }
            
            var modifyTypeVal = $('[name=modifyType]',form.template).val(); 
            if(this.businessRole!=null && modifyTypeVal=='1'){
            	$('[name=dictTypeCode]',form.template).attr('readOnly',true);
            	$('[name=dictTypeName]',form.template).attr('readOnly',true);
            }
            else if(this.businessRole!=null && modifyTypeVal=='2'){
            	$('[name=dictTypeCode]',form.template).attr('readOnly',true);
            }
            else if(this.businessRole!=null && modifyTypeVal=='3'){
            	
            }
            
			$(con).data('data',data);
			$(con).data('typelist',typelist);
			
			editDlg.setContent(con);
			if(this.businessRole!=null && modifyTypeVal=='1'){
				
			}else{
				editDlg.setBtnsBar({
					position:'center',
					btns:[
					      {text:'保存',style:'btn-primary',handler:function(){
					    	  var flag = that.validateCommit(editDlg.template);
					    	  if(!flag){
					    		  return;
					    	  }
					    	  var detalist = that.list.options.data;
					    	  flag = false;
//					    	  $.each(detalist,function(){
//					    		  if(this.defaultValue == 1){flag = true;}
//					    	  })
//					    	  if(flag == false){
//					    		  V.alert("请选择默认值!");
//					    		  return;
//					    	  }
					    	  
					    	  if(!form.validate()) return;
					    	  
					    	  var entity = $(con).data('data')||{};
					    	  
					    	  var orgEntity = {};
					    	  for(key in entity){
					    		  orgEntity[key] = entity[key];
					    	  }
					    	  
					    	  var formValues = form.getValues();
					    	  for(key in formValues){
					    		  entity[key] = formValues[key];
					    	  }
					    	  
					    	  entity.dictTypeDesc = entity.dictTypeName;
					    	  entity.moduleName = entity.moduleName||$('.modellist',that.template).find('option:selected').text();
					    	  entity.moduleValue = entity.moduleValue||$('.modellist',that.template).val();
					    	  
					    	  var syncFlag = entity.syncFlag;
					    	  delete entity.syncFlag;
					    	  
					    	  $(con).removeData('data');
					    	  
					    	  $.ajax({
					    		  url:that.module+'/dict-type!saveOrUpdateDictTypeAndData.action',
					    		  data:JSON.stringify({entity:entity,orgEntity:orgEntity,detalist:detalist,platformNo:that.platformNo,syncFlag:syncFlag}),
					    		  contentType:'application/json',
					    		  type:'POST',
					    		  success: function(data){
					    			  if(data.result == 'success'){
					    				  V.alert(data.msg);
					    				  that.refresh();
					    				  that.refreshDic();
					    			  }else{
					    				  V.alert(data.msg);
					    				  that.refresh();
					    			  }
					    		  }
					    	  });
					    	  this.close();
					      }},
					      {text:'取消',handler:function(){
					    	  this.close();
					      }}
					      ]
				});
			}
			var title = '修改字典属性' + '--' +data.dictTypeName;
			if(data==''){
				title = '新增数据字典';
			}
			editDlg.init({
				width:1000,
				height:500,
				title:title
			});
			 
			this.createType(editDlg,false,typelist,data);
		}
		Dictionaries.prototype.refreshDic = function(){
			$('script[src^="common!dict.action"]')[0].src = 'common!dict.action?'+new Date().getTime();
		}
		Dictionaries.prototype.initTypeInfo = function(module){
			var that = this;
			$.ajax({
		 	 url:this.module+'/dict-type!queryAllType.action',
		 	 cache:false,
			 dataType:'json',
			 data:{modelvalue:module.moduleCode,platformNo:that.platformNo},
			 success: function(data){
				 $(".subblock",that.template).empty();
			 	 if (data != null && data != undefined && data.modeltypeList != undefined && data.modeltypeList.length >0) {
					$.each(data.modeltypeList,function(){
						var array = new Array();
						var typeid = this.id;
						$.each(data.detalist,function(){
							if(this.dicttype == typeid){array.push(this);}
						});
						that.createPanel(this,array);
					});
			 	}
			 }
		   });
		}
		Dictionaries.prototype.createPanel = function(model,typelist){
			var that = this;
		 	/**-----------all html------------**/
			var html = $('<div class="subblock_header">\
                	<span class="block_title">'+model.dictTypeName+'</span><span class="tools"><a href="javascript:void(0);" class="edit" title="编辑"><i class="icon-edit"></i></a><a href="javascript:void(0);" class="delete" title="删除"><i class="icon-remove"></i></a></span>\
               		<a href="javascript:void(0);" class="toggle" title="收起"><i class="icon-chevron-up"></i></a>\
           		 </div>');
		    $(html).data("data",model);
			$(html).data("typelist",typelist);
			$(".edit",html).click(function(){
				that.addOrEditDict(model,typelist);
			});
			$(".delete",html).click(function(){
				that.deleteType(model,typelist);
			});
			
			/*中心企业删除权限控制*/
			if(CONSTANT.USER_TYPE.MAINTEMNCE!=LoginInfo.user.userType && (model.modifyType==1 || model.modifyType==2)){
				$(".delete",html).hide();
			}
			if(CONSTANT.USER_TYPE.MAINTEMNCE==LoginInfo.user.userType && this.businessRole!=null && (model.modifyType==1 || model.modifyType==2)){
				$(".delete",html).hide();
			}

			$('.toggle',html).click(function(){
				if($('i',this).hasClass('icon-chevron-up')){
					$('i',this).removeClass('icon-chevron-up').addClass('icon-chevron-down').attr('title','展开');
					$(this).next().hide();
				}else{
					$('i',this).removeClass('icon-chevron-down').addClass('icon-chevron-up').attr('title','收起');
				    $(this).next().show();
				}
			});
			/**-----------ol operation------------**/
			var ol = $('<ol class="con"></ol>');
			$.each(typelist,function(){
				/**-----------li------------**/
				var li = $('<li class="dictli">\
		                            <span class="name">'+this.dictname+'('+this.dictcode+')</span>\
		                        </li>');
				$(li).data("data",this);
//				$(".delete",li).click(function(){
//					that.deleteType($(this).parent().data('data'));
//				});
				ol.append(li);
			})
			html.append(ol);
			$(".subblock",that.template).append(html);
		
		}
		Dictionaries.prototype.initmodellist = function(data){
			var html = "";
			var module = null;
			$.each(data.modelList,function(i){
				if(i == 0 ){module = this};
				html += '<option value="'+this.moduleCode+'" >'+this.moduleName+'</option>';
			});
			$(".modellist",this.template).empty().append(html);
			return module;
		}
		Dictionaries.prototype.validateCommit = function(context){
			var validateFlag = true;
			$('*[data-validator]:visible',context).each(function(){
				var required = $(this).attr('data-required')||false;
				var rules = $(this).attr('data-validator')||'';
				var v = $(this).val();
				if(required=="true"&&v==""){
						$(this).parent().find('.error_msg').text("该值不可为空").show();
						validateFlag = false;
				}else{
					if(rules){
						var msg = Validator.validate(rules,v);
						if(msg){
							$(this).parent().find('.error_msg').text(msg).show();
							validateFlag = false;
						}else{
							$(this).parent().find('.error_msg').empty().hide();
						}
					}else{
						$(this).parent().find('.error_msg').empty().hide();
					}
				}
			});
			return validateFlag;
		}
		Dictionaries.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'数据字典详情'}});
		}
	})(V.Classes['v.views.backoffice.custom.Dictionaries'])
},{plugins:["v.ui.grid","v.ui.pagination","v.ui.dialog","v.fn.validator",'v.ui.alert']});
