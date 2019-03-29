;V.registPlugin("v.views.book.bookEdit",function(){
	V.Classes.create({
		className:"v.views.book.BookEdit",
		superClass:"v.views.component.CommonDocket",
		init:function(){
            this.ns = "v.views.book.bookEdit";
			this.ACTION = {
				INIT:'book!listDocket.action',
				SAVE:'book!save.action',
				DELETE:'book!delete.action'
			}
			this.isEdit = true;
		}
	});
	(function(Plugin){
		Plugin.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:"编辑"}});
		}
		Plugin.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:"编辑"}});
		}
	})(V.Classes['v.views.book.BookEdit']);
},{plugins:["v.views.component.commonDocket","v.ui.dialog","v.component.blockForm"]})