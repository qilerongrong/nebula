;V.registPlugin("v.views.console.bussinessMessage",function(){
	V.Classes.create({
		className:"v.views.console.BussinessMessage",
		superClass:"v.views.component.ConsolePanel",
		init:function(){
            this.ns = "v.views.console.bussinessMessage";
		    this.title = this.getLang("TITLE_NEW_NOTICE");
			this.module = '';
			this.resource = {
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
				url: 'backoffice/console/bussinessinfo/user-business-info!listcontrol.action',
				columns:[
						{displayName:this.getLang("LIST_TITLE"),key:'title',width:120,render: function(record){
								var html = $('<a href="javascript:void(0);">' + record.title + '</a>');
								html.click(function(){
								    that.systemMessageDetail(record);
								});
								return html;
							}},
						{displayName:this.getLang("LIST_SEND_DATE"),key:'sendDate',width:200}
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
			opt.isBack = record.isBack;
			var data = {
				plugin:'v.views.home.bussinessMessage.bussinessMessageDetail',
				options:opt
			}
			this.publish({eventId:this.EVENT.LOAD_CONTENT,data:data});
		}
		Console.prototype.systemMessageList = function(){
			var opt = {};
			opt.module = this.module;
			var data = {
				plugin:'v.views.home.bussinessMessage',
				options:opt
			}
			this.publish({eventId:this.EVENT.LOAD_CONTENT,data:data});
			
		}
	})(V.Classes['v.views.console.BussinessMessage']);
},{plugins:['v.views.component.consolePanel','v.ui.grid']})