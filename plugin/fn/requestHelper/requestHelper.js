;V.registPlugin("v.fn.requestHelper",function(){
	V.RequestHelper = {
		requestMap:{},
		initRequestSetting:function(){
			$.ajaxSetup({
				dataType:'json'
			});
			V.RequestHelper.preFilter();
			$(document).ajaxSend(function(event,jqXHR, settings){
				V.log("Send Request==========="+settings.url+"======data type"+settings.dataType);
			}).ajaxComplete(function(event,jqXHR, settings){
				$.each(V.RequestHelper.requestMap,function(key,val){
					if(jqXHR == val.jqXHR){
						delete V.RequestHelper.requestMap[key];
						V.log("Remove Request==========="+settings.url);
						return false;
					}
				})
			})
		},
		//判断是否为重复请求TODO
		isDuplicate:function(originalOptions){
			var req = this.requestMap[originalOptions.url];
			if(req){
				if(originalOptions.data == req.data){
					return true;
				}else{
					return false;
				}
			}else{
				return false;
			}
		},
		preFilter:function(){
			var hepler = this;
			$.ajaxPrefilter('json',function( options, originalOptions, jqXHR ){
				var isDup = hepler.isDuplicate(originalOptions);
				if(isDup){
					V.log("Duplicate Request Abort==========="+options.url);
					jqXHR.abort();
				}else{
					V.log("Add Request==========="+options.url);
					hepler.requestMap[originalOptions.url] = {
						data:originalOptions.data,
						jqXHR:jqXHR,
						timestamp:new Date().getTime()
					}
				}
			});
		}
	}
	V.RequestHelper.initRequestSetting();
})