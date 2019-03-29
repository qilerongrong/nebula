;V.registPlugin("v.views.backoffice.custom.enterpriseInformation",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.EnterpriseInformation",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = "v.views.backoffice.custom.enterpriseInformation";
			this.module = '';
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.Grid']();
		}
	});
	(function(EnterpriseInformation){
		 EnterpriseInformation.prototype.initConditionForm = function(){
			    var Form = V.Classes['v.component.Form'];
				var items = [
					       {label:'文件名称',type:Form.TYPE.TEXT,name:'fileName',value:''}
//					       ,{label:'供应商名称',type:Form.TYPE.TEXT,name:'partnerName',value:''}
					];
				var isBuyer = (LoginInfo.user.businessRole == LoginInfo.businessRole.ENTERPRISE);
				if(isBuyer){
					items.push({label:'销方编码',type:Form.TYPE.PLUGIN,value:'',plugin:'v.views.component.sellerSelector',colspan:2});
				}
				var filters = this.options.filters;
				if(filters&& filters.length>0){
					$.each(items,function(m,item){
						var key = this.name;
						$.each(filters,function(){
							if(key == this.key){
								item.value = this.value;
								return false;
							}
						})
					});
				}
				this.form.init({
					colspan:3,
					items:items
				});
		}
		EnterpriseInformation.prototype.initList = function(){
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			var isBuyer = (LoginInfo.user.businessRole == LoginInfo.businessRole.ENTERPRISE);
			var that = this;
			if(isBuyer){
			    list.init({
	                container : $('.list', this.template),
	                checkable:false,
					url:this.module+'/enterprise-information!list.action',
	                columns:[
	                    {displayName:'文件名称',key:'fileName',width:220},
	                    {displayName:'上传时间',key:'uploadDate',align:'center',width:80},
	                    {displayName:'上传人',key:'uploadUser',align:'center',width:80},
	                    {displayName:'操作',key:'action',width:40,render:function(record){
	                    	var html = $('<div class="action"><a class="download" href="javascript:void(0); style="margin:0 8px;"" title="下载"><i class="icon-download"></i></a></div>');
	                    		$('.download',html).click(function(){
	                    			that.download(record);
	                    		});
	                        return html;
	                    }}
	                ]
	            });
			}else{
			    list.init({
	                container : $('.list', this.template),
	                checkable:false,
					url:this.module+'/enterprise-information!list.action',
	                columns:[
	                    {displayName:'文件名称',key:'fileName',width:220},
	                    {displayName:'上传时间',key:'uploadDate',align:'center',width:80,render:function(record){
	                        var date = new Date(record.uploadDate);
	                        return V.Util.formatDate(date,"YYYY-MM-DD hh:mm:ss");
	                     }},
	                    {displayName:'上传人',key:'uploadUser',align:'center',width:80},
	                    {displayName:'操作',key:'action',width:40,render:function(record){
	                    	var html = $('<div class="action"><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a></div>');
	                    		$('.remove',html).click(function(){
	                    			that.remove(record);
	                    		});
	                        return html;
	                    }}
	                ],
						toolbar:[{eventId:'add',text:'上传文件',icon:'icon-upload'}]
	            });
			}
        
			this.subscribe(list,'add',this.add);
            this.container.append(this.template);
        };
        
        EnterpriseInformation.prototype.uploadFile = function(){
			var upload = new V.Classes['v.component.FileUpload']();
			var that = this;
			upload.init({
				title : '企业资料上传',
				uploadSetting:{
					url:'attribUpload?fileType=enterpriseFile&contractCode='+1,
					complete:function(){
						that.list.refresh();
					}
				}
			});
		}
        /**添加交易伙伴**/
         EnterpriseInformation.prototype.add = function(){
        	 this.uploadFile();
        }
        EnterpriseInformation.prototype.download = function(record){
        	var that = this;
			var info="是否要下载？";
			V.confirm(info,function ok(e){
				window.location.href=that.module+"/enterprise-information!downLoad.action?id="+record.id;
			});
//        	window.location.href=this.module+'/enterprise-information!downLoad.action?id='record.id;
        }
        EnterpriseInformation.prototype.remove = function(record){
        	var that = this;
        	V.confirm('确定删除企业资料？',function(){
        	 $.ajax({
            	url:that.module+'/enterprise-information!delete.action',
               	type:'post',
				data:JSON.stringify({enterpriseInformation:record}),
				contentType:'application/json',
                success:function(data){
                   if(data=='success'){
						V.alert("删除企业资料成功!");
						that.list.removeRecord(record);
				   }else{
	                 	V.alert("删除失败");
	               }
                }
        	 })
        	})
        }
		EnterpriseInformation.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'企业资料列表'}});
		}
	})(V.Classes['v.views.backoffice.custom.EnterpriseInformation'])
},{plugins:['v.views.component.searchList',"v.ui.grid","v.ui.dialog","v.ui.pagination",'v.component.fileUpload',"v.views.component.sellerSelector"]});