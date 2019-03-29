;V.registPlugin("v.views.metadata.column.columnView",function(){
	V.Classes.create({
		className:"v.views.metadata.column.ColumnView",
		superClass:"v.views.component.CommonDocket",
		init:function(){
            this.ns = "v.views.metadata.column.columnView";
			this.ACTION = {
					INIT:'m-column!listDocket.action'
			}
			this.isEdit = false;
		}
	});
	(function(Plugin){
		Plugin.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:"字段管理"}});
		}
		Plugin.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:"字段管理"}});
		}
	})(V.Classes['v.views.metadata.column.ColumnView']);
},{plugins:["v.views.component.commonDocket","v.ui.dialog","v.component.blockForm"]})