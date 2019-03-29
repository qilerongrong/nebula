;V.registPlugin("v.views.metadata.table.tableEdit",function(){
	V.Classes.create({
		className:"v.views.metadata.table.TableEdit",
		superClass:"v.views.component.CommonDocket",
		init:function(){
            this.ns = "v.views.metadata.table.tableEdit";
			this.ACTION = {
				INIT:'m-table!listDocket.action',
				SAVE:'m-table!save.action'
			}
			this.isEdit = true;
		}
	});
	(function(Plugin){
		Plugin.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:"表管理"}});
		}
		Plugin.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:"表管理"}});
		}
	})(V.Classes['v.views.metadata.table.TableEdit']);
},{plugins:["v.views.component.commonDocket","v.ui.dialog","v.component.blockForm"]})