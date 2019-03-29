/**
 * 参数配置
 * data:2012-11-19
 */
;V.registPlugin("v.views.backoffice.custom.keyValue",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.KeyValue",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.backoffice.custom.keyValue";
			this.module = '';
			this.data = {};
			this.list = new V.Classes['v.ui.Grid']();
			this.template = $('<div class="ticketCustom"><div class="ticketHeader"></div></div>');
		}
	});
	(function(KeyValue){
        KeyValue.prototype.init = function(options){
			this.options = options;
			this.module = options.module;
			this.container = options.container;
			this.container.append(this.template);
			this.initKeyValues();
			this.initEvent();
		}
		KeyValue.prototype.initEvent = function(){
		    
		}
		//新增或编辑数据字典
		KeyValue.prototype.addOrEditDict = function(data,typelist){
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
            
            if(CONSTANT.USER_TYPE.MAINTEMNCE==LoginInfo.user.userType && this.businessRole!=null){
            	$('*[name=modifyType]',form.template).attr('readOnly',true);
            	$('*[name=modifyType]',form.template).attr('disabled',true);
            }
            if(CONSTANT.USER_TYPE.MAINTEMNCE!=LoginInfo.user.userType){
            	$('*[name=modifyType]',form.template).attr('readOnly',true);
            	$('*[name=modifyType]',form.template).attr('disabled',true);
            	$('*[name=modifyType]',form.template).val('3'); //中心企业，完全修改
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
				width:800,
				height:450,
				title:title
			});
			 
			this.createType(editDlg,false,typelist,data);
		}
		KeyValue.prototype.initKeyValues = function(){
			var that = this;
			
			$.ajax({
		 	 url:this.module+'/key-value!list.action',
		 	 cache:false,
			 dataType:'json',
			 success: function(data){
				 $(".subblock",that.template).empty();
				 var blocks = [];
				 var block = {};
				 $.each(data,function(){
				     if(blocks.length == 0){
				         block = {
				             block:this.block,
				             blockName:this.blockName,
				             fields:[]
				         }
				         blocks.push(block);
				     }
					 if(block.block != this.block){
						 block = {
						     block:this.block,
				             blockName:this.blockName,
				             fields:[]
						 }
						 blocks.push(block);
						 block.fields.push(this);
					 }else{
						 block.fields.push(this);
					 }
				 });
				 $.each(blocks,function(){
					 that.createPanel(this);
				 });
			 }
		   });
		}
		KeyValue.prototype.createPanel = function(block){
			var that = this;
			var html = $('<div class="block_con">\
                	<span class="block_title">'+block.blockName+'</span>\
               		<a href="javascript:void(0);" class="toggle" title="收起"><i class="icon-chevron-up"></i></a>\
           		 </div>');
			$(".ticketHeader",that.template).append(html);
			$(".edit",html).click(function(){
				that.addOrEditDict(model,typelist);
			});
			$(".delete",html).click(function(){
				that.deleteType(model,typelist);
			});
			$('.toggle',html).click(function(){
				if($('i',this).hasClass('icon-chevron-up')){
					$('i',this).removeClass('icon-chevron-up').addClass('icon-chevron-down').attr('title','展开');
					$(this).next().hide();
				}else{
					$('i',this).removeClass('icon-chevron-down').addClass('icon-chevron-up').attr('title','收起');
				    $(this).next().show();
				}
			});
			var list = new V.Classes['v.ui.Grid']();
			list.init({
			    container:html,
			    columns:[
			        {displayName:'名称',key:'labelCn',width:60},
			        {displayName:'值',key:'value',width:120,render:function(record){
			            var html = $('<textarea style="width:98%">'+record.value+'</textarea>');
			            html.keyup(function(){
			                record.value = $(this).val();
			            })
			            return html;
			        }},
			        {displayName:'描述',key:'descCn',width:120},
			        {displayName:'操作',key:'action',width:40,render:function(record){
			            var btn = $('<a href="javascript:void(0)" class="btn btn-small">保存</a>');
			            btn.click(function(){
			                that.saveKeyValue(record);
			            });
			            return btn; 
			        }}
			    ],
			    data:block.fields
			})
			
		}
		KeyValue.prototype.saveKeyValue = function(entity){
		    V.ajax({
		        url:this.module+'/key-value!save.action',
		        data:{keyValue:entity},
		        success:function(){
		            V.alert('保存成功');
		        }
		    })
		}
		KeyValue.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'参数配置'}});
		}
	})(V.Classes['v.views.backoffice.custom.KeyValue'])
},{plugins:["v.ui.grid","v.ui.pagination","v.ui.dialog","v.fn.validator",'v.ui.alert']});
