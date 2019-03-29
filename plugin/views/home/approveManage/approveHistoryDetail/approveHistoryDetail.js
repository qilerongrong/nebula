;V.registPlugin("v.views.home.approveManage.approveHistoryDetail",function(){
	V.Classes.create({
		className:"v.views.home.approveManage.ApproveHistoryDetail",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.home.approveManage.approveHistoryDetail";
			this.docket = null;
			
			this.ACTION = {
				HEADER :  'work-flow!getWorkFlowApproveModel.action'
			}
			
			this.code = "";
			this.module = "";
			
			this.options = {
				title:'审批历史',
				headerTitle:'审批历史详细信息',
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
	(function(approveHistoryDetail){
		approveHistoryDetail.prototype.init = function(options){
			//this.module = options.module;
			this.module = 'backoffice/systemsetting/workflow';
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
		}
		approveHistoryDetail.prototype.initEvent = function(){
			var actions = $('<button class="goBack btn btn-danger btn-mini"><i class="icon-remove icon-white"></i>取消</button></div>');
			$('.actions',this.template).append(actions);
			$('.goBack',this.template).click(function(){that.goBack()});
			
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
		approveHistoryDetail.prototype.initDocketHeader = function(){
			
			$.ajax({
				url:this.module+"/" +this.ACTION.HEADER,
				data:{id:this.options.code},
				dataType:'json',
				success:function(data){
					var approveData = data.approveDataMap;
					var result = approveData.result==='1'?'同意':'不同意';
					var form = new V.Classes['v.component.Form']();
					var items = [];
					var Form = V.Classes['v.component.Form'];
					items.push({label:'审批结果',type:Form.TYPE.READONLY,name:'result',value:result});
					items.push({label:'审核意见',type:Form.TYPE.TEXTAREA,name:'approveComments',value:approveData.approveComments});
					
					items.push({label:'审核日期',type:Form.TYPE.READONLY,name:'approveDate',value:data.approveDate});
					items.push({label:'审核人',type:Form.TYPE.READONLY,name:'approver',value:data.approver});
					items.push({label:'审核标识',type:Form.TYPE.HIDDEN,name:'approverId',value:data.approverId});
					items.push({label:'审核标题',type:Form.TYPE.READONLY,name:'entityTitle',value:data.entityTitle});
					items.push({label:'实体标识',type:Form.TYPE.HIDDEN,name:'entityId',value:data.entityId});
					items.push({label:'标识',type:Form.TYPE.HIDDEN,name:'id',value:data.id});
					items.push({label:'平台标识',type:Form.TYPE.HIDDEN,name:'platformNo',value:data.platformNo});
					items.push({label:'版本',type:Form.TYPE.HIDDEN,name:'version',value:data.version});
					
					form.init({
						container : $('.header_info',this.template),
						items : items
					});
					
					$('textarea[name="approveComments"]').attr("readOnly",true);
				}
			})
		}
		approveHistoryDetail.prototype.goBack = function(){
			this.forward('v.views.home.approveManage.approveTask',this.options);
		}
	})(V.Classes['v.views.home.approveManage.ApproveHistoryDetail']);
},{plugins:["v.component.form"]})