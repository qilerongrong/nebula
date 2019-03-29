;V.registPlugin("v.views.console.news",function(){
	V.Classes.create({
		className:"v.views.console.News",
		superClass:"v.views.component.ConsolePanel",
		init:function(){
            this.ns = "v.views.console.news";
		    this.title = "新闻中心";
		    this.icon = "icon-news";
			this.module = '';
		}
	});
	(function(Plugin){
		Plugin.prototype.initContent = function(){
			this.publish({eventId:this.EVENT.LOADED});
			var con = $('<div class="news list1"><ul>\
				    <li><a href="" class="item">新时代健康新时代健康新时代健康新时代健康新时代健康</a><span class="time">2016-11-18</span></li>\
				    <li><a href="" class="item">新时代健康新时代健康新时代健康新时代健康新时代健康</a><span class="time">2016-11-18</span></li>\
				    <li><a href="" class="item">新时代健康新时代健康新时代健康新时代健康新时代健康</a><span class="time">2016-11-18</span></li>\
				    <li><a href="" class="item">新时代健康新时代健康新时代健康新时代健康新时代健康</a><span class="time">2016-11-18</span></li>\
				    <li><a href="" class="item">新时代健康新时代健康新时代健康新时代健康新时代健康</a><span class="time">2016-11-18</span></li>\
				</ul><div><a class="more" href="javascript:void(0);">更多&gt;&gt;</a></div></div>');
			$('.con',this.template).append(con);
		}
	})(V.Classes['v.views.console.News']);
},{plugins:['v.views.component.consolePanel']})