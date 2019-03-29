;V.registPlugin("v.views.approve.approveManage.approveDetail",function(){
	V.Classes.create({
		className:"v.views.approve.approveManage.ApproveDetail",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.approve.approveManage.approveDetail";
			this.docket = null;
			
			this.ACTION = {
				HEADER :  'work-flow!getTaskModule.action',
				APPROVE : 'work-flow!workFlowTaskHandler.action'
			}
			
			this.code = "";
			this.module = "";
			
			this.options = {
				title:this.getLang("TITLE_APPROVE"),
				headerTitle:this.getLang("HTITLE_APPROVE_DETAIL")
			}
			this.template = $('<div class="docket">\
				    <div class="header">\
				    	<div class="legend">\
				    		<span class="docket_title"></span>\
				    			<div class="actions"></div>\
				    	</div>\
				    </div><div class="con">\
			    		<div class="title header_title">\
			    			<i class="icon-chevron-down"></i><span></span>\
			    		</div>\
			    		<div class="header_info"></div>\
			    	</div>\
			    </div>');
		}
	});
	(function(approveDetail){
		approveDetail.prototype.init = function(options){
			this.module = options.module;
			this.container = options.container;
			for(prop in options){
			    this.options[prop] = options[prop];
			}
			var that = this;
			$('.docket_title',this.template).text(this.options.title);
			$('.header_title span',this.template).text(this.options.headerTitle);
			this.initDocketHeader();
			this.container.append(this.template);
			this.initEvent();
			
			var actions = $('<div><button class="approve btn btn-success btn-mini saveInsertItems"><i class="icon-check icon-white"></i>'+this.getLang("TIP_APPROVE")+'</button></div>');
			$('.actions',this.template).append(actions);
			$('.approve',this.template).click(this.approveAction);
		}
		approveDetail.prototype.initEvent = function(){
			var that = this;
			$('.title i',this.template).click(function(){
				if($(this).hasClass('icon-chevron-down')){
					$(this).removeClass('icon-chevron-down').addClass('icon-chevron-right');
					$(this).parent().next().slideUp();
				}else{
					$(this).removeClass('icon-chevron-right').addClass('icon-chevron-down');
					$(this).parent().next().slideDown();
				}
			});
		}
		approveDetail.prototype.initDocketHeader = function(){
			var that = this;
			$.ajax({
				url:this.module+"/" +this.ACTION.HEADER,
				data:{taskId:this.options.code},
				dataType:'json',
				success:function(data){
					var header = data.entityData;
					var custom = header.custom;
					var dataRes = header.data;
					var form = new V.Classes['v.component.Form']();
					var items = [];
					var Form = V.Classes['v.component.Form'];
					items.push({label:that.getLang("LABEL_ENTITY_TYPE"),type:Form.TYPE.HIDDEN,name:'entityType',value:data.entityType});
					items.push({label:that.getLang("LABEL_TASK_ID"),type:Form.TYPE.HIDDEN,name:'taskId',value:data.taskId});
					items.push({label:that.getLang("LABEL_RESULT"),type:Form.TYPE.SELECT,name:'result',multiList:[[that.getLang("MULIST_AGREE"),'1'],[that.getLang("MULIST_UNAGREE"),'-1']]});
					items.push({label:that.getLang("LABEL_COMMENT"),type:Form.TYPE.TEXTAREA,name:'approveComments',value:that.getLang("VALUE_AGREE"),required:true});
					
					$.each(custom,function(){
						var isShow = this.isShow;
						if(isShow){
							var item = {
								name:this.fieldName,
								key:this.fieldName
								,label:this.fieldLabel
								,value:dataRes[this.fieldName]||''
								,type:V.Classes['v.component.Form'].TYPE.READONLY
							};
							items.push(item);
						}
					})
					
					form.init({
						container : $('.header_info',this.template),
						items : items
					});
				}
			})
			
			$('select[name="result"]').change(function(){
				var res = $(this).val();
				if(res==='1')
					$('textarea[name="approveComments"]').val(that.getLang("MSG_AGREE"));
				else
					$('textarea[name="approveComments"]').val(that.getLang("MSG_UNAGREE"));	
			});
			
		}
		approveDetail.prototype.approveAction = function(record){
			var taskId = $('input[name="taskId"]').val();
			var result = $('select[name="result"]').val();
			var approveComments = $('textarea[name="approveComments"]').val();
			
			var that = this;
			V.confirm(this.getLang("MSG_IS_APPROVE"),function ok(e){
				var url = 'backoffice/systemsetting/workflow/work-flow!workFlowTaskHandler.action';
	            $.ajax({
	            	url:url,
	               	type:'POST',
					data:{taskId:taskId,result:result,approveComments:approveComments},
	                success:function(data){
	                	if(data.result == 'success'){
	                		V.alert(that.getLang("MSG_ACTION_SUC"));
	                		//that.forward('v.views.trade.tradeManage.orderConfirmList',that.options);
	                	}else{
	                		V.alert(that.getLang("MSG_ACTION_FAIL"));
	                	}
	                }
	            })
			});
		}
	})(V.Classes['v.views.approve.approveManage.ApproveDetail']);
},{plugins:["v.component.form"]})