;V.registPlugin("v.views.backoffice.authority.associateUser",function(){
	V.Classes.create({
		className:"v.views.backoffice.authority.AssociateUser",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.backoffice.authority.associateUser";
		 
			this.module = "";
			
			this.options = {
				title:'关联信息',
				headerTitle:'基本信息'
			}
			this.template = $('<div class="docket">\
			    <div class="header"><div class="legend"><div class="docket_title"></div><div class="actions"></div></div></div><div class="con"><div class="title header_title"><i class="icon-chevron-down"></i><span></span></div><div class="header_info"></div></div></div>');
		}
	});
	(function(AssociateUser){
		AssociateUser.prototype.init = function(options){
			this.module = options.module;
			this.container = options.container;
			this.code = options.code;
			var that = this;
			$('.docket_title',this.template).text(this.options.title);
			$('.header_title span',this.template).text(this.options.headerTitle);
			 
			this.initDocketHeader();
			this.initDocketDetail();
			this.container.append(this.template);
			this.initEvent();
		}
		AssociateUser.prototype.initEvent = function(){
			$('.title i',this.template).click(function(){
				if($(this).hasClass('icon-chevron-down')){
					$(this).removeClass('icon-chevron-down').addClass('icon-chevron-right');
					$(this).parent().next().slideUp();
				}else{
					$(this).removeClass('icon-chevron-right').addClass('icon-chevron-down');
					$(this).parent().next().slideDown();
				}
			})
			$(".view_users",this.template).click(function(){
				var html = "";
				var dlg = new V.Classes['v.ui.Dialog']();
				dlg.setBtnsBar({btns:[
      			    {text:"确定",style:"btn-primary",handler:function(){
      			    	 
      			    }}
      			    ,{text:"关闭",style:"btn-primary",handler:dlg.close}
      			]});
      			dlg.init({width:560,height:280,title:'查询用户'});
      			dlg.setContent(html);
			})
			this.addCrumb();
		}
		AssociateUser.prototype.initDocketHeader = function(){
			 //ajax
			var form = new V.Classes['v.component.Form']();
			var items = [];
			 
			var item1 = {
				name : 'brandCode',
				label : '主体识别码',
				value : '',
				type : V.Classes['v.component.Form'].TYPE.READONLY
			};
			var item2 = {
				name : 'brandName',
				label : '主体名称',
				value : '',
				type : V.Classes['v.component.Form'].TYPE.READONLY
			};
			var item3 = {
					name : 'companyCharacter',
					label : '公司性质',
					value : '',
					type : V.Classes['v.component.Form'].TYPE.READONLY
			};
			var item4 = {
					name : 'partyClass',
					label : '主体类别',
					value : '',
					type : V.Classes['v.component.Form'].TYPE.READONLY
			};
			var item5 = {
					name : 'brandName',
					label : '地址',
					value : '',
					type : V.Classes['v.component.Form'].TYPE.READONLY
			};
			var item6 = {
					name : 'telephone',
					label : '联系电话',
					value : '',
					type : V.Classes['v.component.Form'].TYPE.READONLY
			};
			var item7 = {
					name : 'fax',
					label : '传真',
					value : '',
					type : V.Classes['v.component.Form'].TYPE.READONLY
			};
			var item8 = {
					name : 'fax',
					label : '备注',
					value : '',
					type : V.Classes['v.component.Form'].TYPE.READONLY
			};
			items.push(item1);
			items.push(item2);
			items.push(item3);
			items.push(item4);
			items.push(item5);
			items.push(item6);
			items.push(item7);
			items.push(item8);
			form.init({
				container : $('.header_info', this.template),
				items : items,
				colspan:2
			});
		}
		
		AssociateUser.prototype.initDocketDetail = function(){
 
			var html = $('<div class="row-fluid"><div class="span12"><div class="control-group"><label class="control-label">\
					关联账户:</label><div class="controls"><p><input type="text" class="input-xlarge" name="plstformNo"  data-validator="" data-required="true"><a style="margin-left:40px;" class="btn btn-success view_users btn-mini" href="javascript:void(0);"><i class="icon-white icon-search"></i> 查找</a></p></div></div></div></div>');
			$('.v-form', this.template).append(html);
			var actions = $('<button  class="confirm btn btn-success btn-mini "><i class="icon-ok icon-white"></i>关联</button>\
					<button  class="confirm btn btn-success btn-mini "><i class="icon-ban-circle icon-white"></i>拒绝</button>');
			$('.actions', this.template).append(actions);
		}
		AssociateUser.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'关联信息'}});
		}
	})(V.Classes['v.views.backoffice.authority.AssociateUser']);
},{plugins:["v.component.form","v.ui.dynamicGrid","v.ui.pagination"]})