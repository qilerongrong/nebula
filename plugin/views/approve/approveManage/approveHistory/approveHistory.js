;V.registPlugin("v.views.approve.approveManage.approveHistory",function(){
	V.Classes.create({
		className:"v.views.approve.approveManage.ApproveHistory",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.approve.approveManage.approveHistory";
			this.docket = null;
			
			this.ACTION = {
				DETAIL : 'work-flow!getTasksOfUser.action'
			}
			
			this.code = "";
			this.module = "";
			
			this.options = {
				title:this.getLang("TITLE_APPROVE_HISTORY"),
				detailTitle:this.getLang("DTITLE_HISTORY_DETAIL")
			}
			this.template = $('<div class="docket">\
				    				<div class="header">\
				    					<div class="legend">\
				    						<span class="docket_title"></span>\
				    							<div class="actions"></div>\
				    					</div>\
				    				</div>\
									<div class="title detail_title">\
										<i class="icon-chevron-down"></i>\
										<span></span>\
									</div>\
									<div class="detail"></div>\
								</div>');
		}
	});
	(function(approveHistory){
		approveHistory.prototype.init = function(options){
			this.module = options.module;
			this.container = options.container;
			for(prop in options){
			    this.options[prop] = options[prop];
			}
			var that = this;
			$('.docket_title',this.template).text(this.options.title);
			$('.detail_title span',this.template).text(this.options.detailTitle);
			this.initDocketDetail();
			this.container.append(this.template);
			this.initEvent();
		}
		approveHistory.prototype.initEvent = function(){
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
		approveHistory.prototype.initDocketDetail = function(){
			var that = this;
			this.list = new V.Classes['v.ui.Grid']();
			var pagination = new V.Classes['v.ui.Pagination']();
		    this.list.setPagination(pagination);
			var columns = [
						{displayName:this.getLang("LIST_PLATFORM_NO"),key:'platformNo',width:160},
						{displayName:this.getLang("LIST_APPROVE_DATE"),key:'approveDate',width:160},
						{displayName:this.getLang("LIST_ACTION"),key:'detail',width:50,render:function(record){
							var html = $('<div class="action"><a class="view" href="javascript:void(0);" title="'+that.getLang("TIP_VIEW")+'"><i class="icon-search"></i></a><div>');
							$('.view', html).click(function(){
								that.viewDetail(record);
							});
							return html;	
						}}];
						
			this.list.init({
				container : $('.detail',this.template),
				url: this.module+'/'+this.ACTION.DETAIL,
				//data:[{'taskTitle':'11','taskId':'22'}],
				columns:columns
			});
		}
		approveHistory.prototype.viewDetail = function(record){
			var options = {};
			options.module = this.module;
			options.taskId = record.taskId;
			
			this.forward('v.views.approve.approveManage.approveHistoryDetail',options);
		}
	})(V.Classes['v.views.approve.approveManage.ApproveHistory']);
},{plugins:["v.component.form","v.ui.dynamicGrid","v.ui.pagination"]})