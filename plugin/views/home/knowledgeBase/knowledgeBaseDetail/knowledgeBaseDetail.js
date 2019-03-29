;V.registPlugin("v.views.home.knowledgeBase.knowledgeBaseDetail",function(){
	V.Classes.create({
		className:"v.views.home.knowledgeBase.KnowledgeBaseDetail",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.views.home.knowledgeBase.knowledgeBaseDetail';
            this.list = new V.Classes['v.ui.Grid']();
            
            this.ACTION = {
				CONTENT :  'work-flow!getTaskModule.action',
				FILE :  'work-flow!getTaskModule.action',
			}
			
			this.module = "";
			
            this.options = {
				title:'知识内容',
				headerTitle:'知识信息',
				detailTitle:'文件列表'
			}
			
            this.template = $('<div class="docket">\
				    <div class="header">\
				    	<div class="legend">\
				    		<span class="docket_title"></span>\
				    			<div class="actions"></div>\
				    	</div>\
				    </div><div class="con">\
			    		<div class="title content_title">\
			    			<i class="icon-chevron-down"></i><span></span>\
			    		</div>\
			    		<div class="content_info"></div>\
			    		<div class="title file_title">\
			    			<i class="icon-chevron-down"></i><span></span>\
			    		</div>\
			    		<div class="file_info"></div>\
			    	</div>\
			    </div>');
		}
	});
	(function(knowledgeBaseDetail){
		knowledgeBaseDetail.prototype.init = function(options){
			this.container = options.container;
			for(prop in options){
			    this.options[prop] = options[prop];
			}
			
			this.addCrumb();
			
			var that = this;
			$('.docket_title',this.template).text(this.options.title);
			$('.content_title span',this.template).text(this.options.headerTitle);
			$('.file_title span',this.template).text(this.options.detailTitle);
			this.initDocketHeader();
			this.container.append(this.template);
			this.initEvent();
		}
		knowledgeBaseDetail.prototype.initEvent = function(){
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
		knowledgeBaseDetail.prototype.initDocketHeader = function(){
			var that = this;
			var formContent = new V.Classes['v.component.Form']();
			var contentItems = [];
			var Form = V.Classes['v.component.Form'];
			contentItems.push({
					label:'主题',
					type:Form.TYPE.TEXT,
					name:'title',
					value:data.title,
					validator:Form.generateValidator(Form.TYPE.TEXT,20,0),
					required:true
				});
			contentItems.push({
					label:'编号',
					type:Form.TYPE.TEXT,
					name:'number',
					value:data.number,
					validator:Form.generateValidator(Form.TYPE.TEXT,20,0),
					required:true
				});
			contentItems.push({label:'内容',
					type:Form.TYPE.TEXTAREA,
					name:'number',
					value:data.content,
					validator:Form.generateValidator(Form.TYPE.TEXT,2000,0),
					required:true
				});
			
			formContent.init({
				container : $('.content_info',that.template),
				items : contentItems
			});
					
			$.ajax({
				url:that.module+"/" +that.ACTION.CONTENT,
				data:{id:that.options.id},
				dataType:'json',
				success:function(data){
					if(data=='success'){
						$.each(formContent.items,function(index,dom){
							var key = this.name;
							var value = data[key];
							this.value = value;
						});
					}
					else{
						V.alert(data);
					}
				}
			})
			
			
			var list = new V.Classes['v.ui.Grid']();
			list.setFilters({isBuyer:false});
			list.setPagination(new V.Classes['v.ui.Pagination']());
			list.init({
				container:$('.file_info',this.template),
				url:that.module+"/" +that.ACTION.FILE,
				columns:[
					{displayName:'名称',key:'fileName',width:120}
				]
			});
		}
		knowledgeBaseDetail.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'知识库详情'}});
		}
	})(V.Classes['v.views.home.knowledgeBase.KnowledgeBaseDetail']);
},{plugins:[]});