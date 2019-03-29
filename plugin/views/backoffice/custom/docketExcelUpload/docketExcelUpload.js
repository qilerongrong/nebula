;V.registPlugin("v.views.backoffice.custom.docketExcelUpload",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.DocketExcelUpload",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.views.backoffice.custom.docketExcelUpload';
			this.resource = {
				html:'template.html'
			}
		}
	});
	(function(PluginClass){
		PluginClass.prototype.init = function(options){
			var that = this;
			this.container = options.container;
			this.module = options.module;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					that.initEvent();
					that.getModuleType();
					that.msgList();
					$('.msg',that.template).hide();
				}
		     });
		};
		PluginClass.prototype.initEvent = function(){
			var that = this;
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
			//选择单据结构
			$('.tableType',this.template).change(function(){
				var type = this.value;
				if(that.dirtyTicket){
					that.dirtyTicket.hasDetail = type;
					that.updateType(that.dirtyTicket.orderType.id,type);
				}
				if(type == "true"){
					$('.ticketDetail',this.template).show();
				}else{
					$('.ticketDetail',this.template).hide();
				}
			})
			$('.icon-upload',this.template).click(function(){
				that.uploadFile();
			})
		};
		PluginClass.prototype.uploadFile = function(){	
			var upload = new V.Classes['v.component.FileUpload']();
			var that = this;
			this.subscribe(upload,upload.EVENT.CLOSE,function(){
				
			});
			upload.init({
				title : '单据资料上传',
				uploadSetting:{
					url:'attribUpload',
					params:{
						'fileType':'excelImport',
						'moduleCode':$('.modulesType',that.template).val(),
						'docketType':$('.ticketsType',that.template).val()
					},
					uploadComplete:function(){
						 
					},
					uploadSuccess:function(file, serverData, response){
						var data = JSON.parse(serverData);
						if(data.result=='error'){ //业务错误
							if($.isArray(data.msg)){
								that.msgList.options.data = data.msg;
								that.msgList.refresh();
								$('.msg',that.template).show();
							}else{
								V.alert(data.msg);
								$('.msg',that.template).hide();
							}
						}if(data.result=='typeerror'){ //文件类型错误
							V.alert('文件类型错误！');
							$('.msg',that.template).hide();
						}else{
							V.alert(data.msg);
							$('.msg',that.template).hide();
						}
						upload.close();
					}
				}
			});
		}
		PluginClass.prototype.getTicketInfo = function(ticketType,moduleCode){
			if(moduleCode==null||moduleCode==""){
				moduleCode=$(".modulesType",this.template).val();
			}
			var that = this;
			$.ajax({
				url:this.module+'/custom!list.action',
				type:'POST',
				dataType:'json',
				data:{value:ticketType,moduleCode:moduleCode,platformNo:that.platformNo},
				success:function(ticketInfo){
					that.ticket = ticketInfo;
				}
			})
		};
		PluginClass.prototype.getModuleType = function(){
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
		PluginClass.prototype.getTicketsType = function(moduleCode){
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
		PluginClass.prototype.msgList = function(){
			var that = this;
			var list = this.msgList = new V.Classes['v.ui.Grid']();
			list.init({
				container : $('.msg', this.template),
				checkable : false,
				data : [],
				columns : [{
							displayName : '错误字段数据',
							key : 'KEY',
							width : 80
						},{
							displayName : '错误单据编码',
							key : 'ERRORCODE',
							width : 80
						},{
							displayName : '错误内容',
							key : 'MESSAGE',
							width : 240,
							render:function(record){
								var message = record.MESSAGE;
								var dom = $('<a href="javascript:void(0)"></a>');
								if(message.length>200){
									dom.html(record.MESSAGE.substring(0,200)+'...');
								}else{
									dom.html(record.MESSAGE);
								}
								dom.click(function(){
									var addDlg = new V.Classes['v.ui.Dialog']();
									addDlg.init({title:'错误消息',height:450,width:700});
									addDlg.setBtnsBar({btns:[{text:"关闭",handler:addDlg.close}]});
									addDlg.setContent('<div>'+message+'</div>');
								})
								return dom;
							}
						}]
			});
		}
		PluginClass.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'单据资料上传'}});
		}
	})(V.Classes['v.views.backoffice.custom.DocketExcelUpload']);
},{plugins:['v.ui.dialog','v.ui.alert','v.component.fileUpload']})
