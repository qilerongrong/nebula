;V.registPlugin("v.views.book.bookView",function(){
	V.Classes.create({
		className:"v.views.book.BookView",
		superClass:"v.views.component.CommonDocket",
		init:function(){
            this.ns = "v.views.book.bookView";
			this.ACTION = {
					INIT:'book!listDocket.action'
			}
			this.isEdit = false;
		}
	});
	(function(Plugin){
		Plugin.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:"书籍信息"}});
		}
		Plugin.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:"书籍信息"}});
		}
	})(V.Classes['v.views.book.BookView']);
},{plugins:["v.views.component.commonDocket","v.ui.dialog","v.component.blockForm"]})