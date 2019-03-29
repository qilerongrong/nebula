;V.registPlugin("v.views.console.systemMessage",function(){
	V.Classes.create({
		className:"v.views.console.SystemMessage",
		superClass:"v.views.component.ConsolePanel",
		init:function(){
            this.ns = "v.views.console.systemMessage";
		    this.title = this.getLang("TITLE_SYS_MSG");
			this.module = '';
			this.resource = {
				//html:'template.html'
			}
		}
	});
	(function(Console){
		Console.prototype.EVENT = {
			LOAD_CONTENT:'load_content'
		}
		Console.prototype.initContent = function(){
			var that = this;
			var con = $('<div></div>');
			var list = new V.Classes['v.ui.Grid']();
			this.subscribe(list,list.EVENT.DATA_LOADED,function(){
				that.publish({eventId:that.EVENT.LOADED});
			});
			list.init({
				container:con,
				url: 'backoffice/console/systeminfo/user-notice!listcontrol.action',
				columns:[
						{displayName:this.getLang("LIST_USER_ID"),key:'userId',width:160,isShow:false},
						{displayName:this.getLang("LIST_TITLE"),key:'title',width:160,render: function(record){
								var html = $('<a href="javascript:void(0);">' + record.title + '</a>');
								html.click(function(){
								    that.systemMessageDetail(record);
								});
								return html;
							}},
						{displayName:this.getLang("LIST_SENDER"),key:'sender',width:160,isShow:false},
						{displayName:this.getLang("LIST_SENDER_NAME"),key:'sendName',width:160,isShow:false},
						{displayName:this.getLang("LIST_SEND_DATE"),key:'sendDate',width:160,isShow:true},
						{displayName:this.getLang("LIST_IS_REMOVED"),key:'isRemoved',width:160,isShow:false},
						{displayName:this.getLang("LIST_IS_READ"),key:'isRead',width:160,isShow:false,render:function(record){
							if(record.isRead==true)
								return that.getLang("MSG_READ");
							else
								return that.getLang("MSG_NO_READ");	
						}},
						{displayName:'id',key:'id',width:160,isShow:false}
				]
			});
			var more = $('<a href="javascript:void(0);" class="more">'+this.getLang("TIP_MORE")+'&gt;&gt;</a>');
			more.click(function(){
				that.systemMessageList();
			});
			con.append(more);
			$('.con',this.template).append(con);
		}
		Console.prototype.systemMessageDetail = function(record){
			var opt = {};
			opt.module = this.module;
			
			opt.id=record.id;
			opt.noticeId=record.noticeId;
			opt.isHaveAttach = record.isHaveAttach;
			opt.isBack = record.isBack;
			var data = {
				plugin:'v.views.home.systemMessage.systemMessageDetail',
				options:opt
			}
			this.publish({eventId:this.EVENT.LOAD_CONTENT,data:data});
			
			//this.forward('v.component.systemMessage.systemMessageDetail',opt);
		}
		Console.prototype.systemMessageList = function(){
			var opt = {};
			opt.module = this.module;
			var data = {
				plugin:'v.views.home.systemMessage',
				options:opt
			}
			this.publish({eventId:this.EVENT.LOAD_CONTENT,data:data});
			
		}
	})(V.Classes['v.views.console.SystemMessage']);
},{plugins:['v.views.component.consolePanel','v.ui.grid']})