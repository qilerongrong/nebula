;V.registPlugin("v.views.approve.approveManage.approveHistoryDetail",function(){
	V.Classes.create({
		className:"v.views.approve.approveManage.ApproveHistoryDetail",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.approve.approveManage.approveHistoryDetail";
			this.docket = null;
			
			this.ACTION = {
				HEADER :  'work-flow!getWorkFlowApproveModel.action',
				APPROVE : 'work-flow!workFlowTaskHandler.action'
			}
			
			this.code = "";
			this.module = "";
			
			this.options = {
				title:this.getLang("TITLE_APPROVE_HISTORY"),
				headerTitle:this.getLang("HTITLE_HISTORY_DETAIL")
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
		}
		approveHistoryDetail.prototype.initEvent = function(){
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
			/*
			$.ajax({
				url:this.module+"/" +this.ACTION.HEADER,
				data:{taskId:this.options.taskId},
				dataType:'json',
				success:function(data){
					var header = data;
					var custom = header.custom;
					var data = header.data;
					var form = new V.Classes['v.component.Form']();
					var items = [];
					$.each(custom,function(){
						var isShow = this.isShow;
						if(isShow){
							var item = {
								name:this.fieldName,
								key:this.fieldName
								,label:this.fieldLabel
								,value:data[this.fieldName]||''
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
			*/
			var form = new V.Classes['v.component.Form']();
			var Form = V.Classes['v.component.Form'];
			form.init({
				container : $('.header_info',this.template),
				items : [ 
					   		{label:this.getLang("LIST_APPROVE_ID"),type:Form.TYPE.TEXT,name:'approveId',value:''},
					   		{label:this.getLang("LIST_APPROVE_RESULT"),type:Form.TYPE.SELECT,name:'result',multiList:[[this.getLang("MULIST_AGREE"),'1'],[this.getLang("MULIST_UNAGREE"),'-1']]},
					   		{label:this.getLang("LIST_APPROVE_COMMENTS"),type:Form.TYPE.TEXTAREA,name:'approveComments',value:''}
					   	]
			});
		}
	})(V.Classes['v.views.approve.approveManage.ApproveHistoryDetail']);
},{plugins:["v.component.form"]})