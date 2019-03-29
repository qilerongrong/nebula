;V.registPlugin("v.views.console.shortcut",function(){
	V.Classes.create({
		className:"v.views.console.Shortcut",
		superClass:"v.views.component.ConsolePanel",
		init:function(){
            this.ns = "v.views.console.shortcut";
		    this.title = "常用功能";
		    this.icon="icon-shortcut";
			this.module = '';
		}
	});
	(function(Plugin){
		Plugin.prototype.initContent = function(){
			this.publish({eventId:this.EVENT.LOADED});
			var con = $('<div class="shortcut"><ul>\
				    <li class="row1"><div class="item"><a class="xsdh" href="javascritp:void(0)">销售订货</a></div></li>\
				    <li class="row1"><div class="item"><a class="ckdd" href="javascritp:void(0)">查看订单</a></div></li>\
				    <li class="row1"><div class="item"><a class="zzthh" href="javascritp:void(0)">自助退换货</a></div></li>\
				    <li class="row1"><div class="item"><a class="zcbyj" href="javascritp:void(0)">正常报业绩</a></div></li>\
				    <li class="row1 last"><div class="item"><a class="bceyj" href="javascritp:void(0)">报超额业绩</a></div></li>\
				    <li class="row2"><div class="item"><a class="cxyj" href="javascritp:void(0)">查询业绩</a></div></li>\
				    <li class="row2"><div class="item"><a class="zbyj" href="javascritp:void(0)">增报业绩</a></div></li>\
				    <li class="row2"><div class="item"><a class="ckjj" href="javascritp:void(0)">查看奖金</a></div></li>\
				    <li class="row2"><div class="item"><a class="ckyhye" href="javascritp:void(0)">查看压货余额</a></li>\
				    <li class="row2 last"><div class="item"><a class="ckkcye" href="javascritp:void(0)">查看库存余额</a></div></li>\
				</ul></div>');
			$('.con',this.template).append(con);
		}
	})(V.Classes['v.views.console.Shortcut']);
},{plugins:['v.views.component.consolePanel']})