;V.registPlugin("v.views.metadata.table.tableView",function(){
	V.Classes.create({
		className:"v.views.metadata.table.TableView",
		superClass:"v.views.component.CommonDocket",
		init:function(){
            this.ns = "v.views.metadata.table.tableView";
			this.ACTION = {
					INIT:'m-database!listDocket.action'
			}
			this.isEdit = false;
		}
	});
	(function(Plugin){
		Plugin.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:"表管理"}});
		}
		Plugin.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:"表管理"}});
		}
	})(V.Classes['v.views.metadata.table.TableView']);
},{plugins:["v.views.component.commonDocket","v.ui.dialog","v.component.blockForm"]})