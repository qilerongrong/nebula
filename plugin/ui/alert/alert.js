;V.registPlugin("v.ui.alert",function(){
	V.Classes.create({
		className:"v.ui.Alert",
		superClass:"v.ui.Dialog",
		init:function(){
		    this.options.height = 216;
		    this.options.width = 506;
			this.options.title = this.getLang("TITLE_SYS_NOTICE");
			this.options.icons = ['close'];
			this.setBtnsBar({position:'center',btns:[{text:this.getLang("BTN_CONFIRM"),style:"btn-primary",handler:this.close,icon:'icon-ok'}]});
		}
	});
	(function(Alert){
		Alert.prototype.alert = function(msg){
			var con = $('<div class="v-alert-con"><span class="icon-alert"></span><p>'+msg+'</p></div>');
		    this.setContent(con);
			this.open();
		}
	})(V.Classes['v.ui.Alert']);
	V.alert=function(msg){
		var alertInfo = new V.Classes['v.ui.Alert']();
		alertInfo.init({
			title : alertInfo.getLang("TITLE_SYS_NOTICE")
		});
		alertInfo.alert(msg);
	};
},{plugins:["v.ui.dialog"]});
