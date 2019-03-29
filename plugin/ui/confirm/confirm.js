;V.registPlugin("v.ui.confirm",function(){
	V.Classes.create({
		className:"v.ui.Confirm",
		superClass:"v.ui.Dialog",
		init:function(){
			this.options.title=this.getLang("TITLE_SYS_CHECK_BOX");
			this.options.icons=['close'];
			// Confirm.superclass.init.call(this,options);  覆盖父类的init方法例子
			this.setBtnsBar({btns:[{text:this.getLang("BTN_CONFIRM"),style:"btn-primary",handler:this.isConfirm},{text:this.getLang("BTN_CANCLE"),style:'btn-close',handler:this.noConfirm}]});
			this.ok = null;
			this.cancel = null;
		
		}
	});

	(function(Confirm){
		Confirm.prototype.confirm = function(msg,ok,cancel){//msg 指消息体；ok和cancel指2个操作的方法体
		    if(msg==""){
		    	msg=this.getLang("MSG_IS_SYS_CONFIRM");
		    }
		    var con = $('<div class="v-confirm-con"><span class="icon-confirm"></span><p>'+msg+'</p></div>');
		    this.setContent(con);
		    this.ok = ok;
		    this.cancel = cancel;
			this.open();
		}
		Confirm.prototype.isConfirm = function(){
			this.ok && this.ok();
		    this.close();

		}
		Confirm.prototype.noConfirm = function(){
			this.cancel&& this.cancel();
		    this.close();
		}
		
	})(V.Classes['v.ui.Confirm']);
	V.confirm = function(msg,ok,cancel,isFull){
		var confirmInfo = new V.Classes['v.ui.Confirm']();
		confirmInfo.init({
			height : 216,
			width:506,
			isFull:isFull
		});
		confirmInfo.confirm(msg,ok,cancel);
	};
},{plugins:["v.ui.dialog"]});
