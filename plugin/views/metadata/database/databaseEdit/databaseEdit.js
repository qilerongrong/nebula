;V.registPlugin("v.views.metadata.database.databaseEdit",function(){
	V.Classes.create({
		className:"v.views.metadata.database.DatabaseEdit",
		superClass:"v.views.component.CommonDocket",
		init:function(){
            this.ns = "v.views.metadata.database.databaseEdit";
			this.ACTION = {
				INIT:'m-database!listDocket.action',
				SAVE:'m-database!save.action'
			}
			this.isEdit = true;
		}
	});
	(function(Plugin){
		Plugin.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:"数据库管理"}});
		}
		Plugin.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:"数据库管理"}});
		}
	})(V.Classes['v.views.metadata.database.DatabaseEdit']);
},{plugins:["v.views.component.commonDocket","v.ui.dialog","v.component.blockForm"]})