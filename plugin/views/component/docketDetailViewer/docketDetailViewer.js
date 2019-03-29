;V.registPlugin("v.views.component.docketDetailViewer",function(){
	V.Classes.create({
		className:"v.views.component.DocketDetailViewer",
		superClass:"v.ui.Dialog",
		init:function(){
            this.ns = "v.views.component.docketDetailViewer";
			this.options.docketType = "";
			this.options.docketId = "";
			this.options.width = 800;
			this.options.height = 480;
			this.options.isDetail = false;
			this.options.hasDetail = false;
			this.module = "";
			this.docketPlugin = 'v.views.component.docketView';
//			this.docketPlugin[CONSTANT.DOCKET_TYPE.COST] = "v.views.component.docketView";
//			this.docketPlugin[CONSTANT.DOCKET_TYPE.GRN] = 'v.views.component.docketView';
//			this.docketPlugin[CONSTANT.DOCKET_TYPE.SELL] = "v.views.component.docketView";
//			this.docketPlugin[CONSTANT.DOCKET_TYPE.EMS] = "v.views.component.docketView";
//			this.docketPlugin[CONSTANT.DOCKET_TYPE.RETURNGRN] = "v.views.component.docketView";
//			
//			this.docketPlugin[CONSTANT.DOCKET_TYPE.GRN_RENT] = "v.views.component.docketView";
//			this.docketPlugin[CONSTANT.DOCKET_TYPE.GRN_ADJUST] = "v.views.component.docketView";
			
			
		}
	});
	(function(Viewer){
		Viewer.prototype.init = function(options){
			var type = options.docketType;
			//从数据字典获取
			options.title = DictInfo.getValue('DOCKET_TYPE',type) + '详情';
			this.module = options.module;
			Viewer.superclass.init.call(this,options);
			if(type == CONSTANT.DOCKET_TYPE.BALANCE){
				this.docketPlugin = "v.views.finance.balance.balanceDocket";
				this.options.hideBtn = true;
			}else if(type == CONSTANT.DOCKET_TYPE.ORDER){
				if(this.options.isDetail){
					this.docketPlugin = "v.views.trade.tradeManage.orderItemDetailView";
				}else{
					this.docketPlugin = "v.views.trade.tradeManage.queryOrderDetail";
				}
			}else if (type == CONSTANT.DOCKET_TYPE.RETURN_ORDER) {
			       this.docketPlugin = "v.views.trade.tradeManage.returnOrder";  
			}else if(type == CONSTANT.DOCKET_TYPE.INVOICE){
				this.docketPlugin = "v.views.commonDocket.commonDocketView";
			}else if(type == CONSTANT.DOCKET_TYPE.DELIVERY_ITEMS){
				this.docketPlugin = "v.views.commonDocket.commonDocketView";
			}
			this.initDetail();
		}
		Viewer.prototype.initDetail = function(){
			var docket_plugin = this.docketPlugin;
			var that = this;
			var variables = {
				docketType:that.options.docketType
			};
			V.loadPlugin(docket_plugin,function(){
				var glass = V._registedPlugins[docket_plugin].glass;
				var inst = new V.Classes[glass]();
				inst.init({
					container:that.getContent(),
					module:that.module,
					docketType:that.options.docketType,
					idList:[that.options.docketId],
					docketId:that.options.docketId,
					isDetail:that.options.isDetail,
					hasDetail:that.options.hasDetail,
					hideBtn:that.options.hideBtn,
					variables:variables
				});
			});
		}
	})(V.Classes['v.views.component.DocketDetailViewer']);
},{plugins:["v.ui.dialog"]});
