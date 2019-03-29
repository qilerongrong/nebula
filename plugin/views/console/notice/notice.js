;V.registPlugin("v.views.console.notice",function(){
	V.Classes.create({
		className:"v.views.console.Notice",
		superClass:"v.views.component.ConsolePanel",
		init:function(){
            this.ns = "v.views.console.notice";
		    this.title = "通知公告";
		    this.icon = "icon-notice";
			this.module = '';
		}
	});
	(function(Plugin){
		Plugin.prototype.initContent = function(){
			this.publish({eventId:this.EVENT.LOADED});
			var con = $('<div class="notice list1"><ul>\
				    <li><a href="" class="item">新时代健康新时代健康新时代健康新时代健康新时代健康</a><span class="time">2016-11-18</span></li>\
				    <li><a href="" class="item">新时代健康新时代健康新时代健康新时代健康新时代健康</a><span class="time">2016-11-18</span></li>\
				    <li><a href="" class="item">新时代健康新时代健康新时代健康新时代健康新时代健康</a><span class="time">2016-11-18</span></li>\
				    <li><a href="" class="item">新时代健康新时代健康新时代健康新时代健康新时代健康</a><span class="time">2016-11-18</span></li>\
				    <li><a href="" class="item">新时代健康新时代健康新时代健康新时代健康新时代健康</a><span class="time">2016-11-18</span></li>\
				</ul><div><a class="more" href="javascript:void(0);">更多&gt;&gt;</a></div></div>');
			$('.con',this.template).append(con);
		}
	})(V.Classes['v.views.console.Notice']);
},{plugins:['v.views.component.consolePanel']})