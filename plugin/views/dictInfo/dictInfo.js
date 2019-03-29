/*login user dict info
 * user:loginUser
 */
;V.registPlugin("v.views.dictInfo",function(){
	DictInfo = {
		platformNo : null,//中心企业平台号
		initDictInfo : function(){
//			if(LoginInfo.user.userType!=1){
//				DictInfo.platformNo = LoginInfo.user.createByPlatformNo;
//			}
			DictInfo.platformNo = LoginInfo.user.createByPlatformNo;
			
			try{
				eval('d'+DictInfo.platformNo);
			}catch(e){
				V.log("数据字典加载失败");
				var url = 'common!dict.action';
				 $.ajax({
					url:url,
		            async:false,
		            dataType:'text',
	                success:function(data){
	                   var script = $("<script type='text/javascript'></script>").append(data);
	                   $('body').append(script);
	               }
				 })
			}
			
		},
		getVar:function(module,platformNo){
			if(platformNo!=null && platformNo!='')
				DictInfo.platformNo = platformNo;
			try{
				return eval('d'+DictInfo.platformNo)[module.toUpperCase()]['list'];
			}catch(e){
				return '';
			}
		},
		getValue:function(module,key,platformNo){
			if(platformNo!=null && platformNo!='')
				DictInfo.platformNo = platformNo;
			try{
				return eval('d'+DictInfo.platformNo)[module.toUpperCase()]['list'][key]||key;
			}catch(e){
				return '';
			}
		},
		getMultiValue:function(module,key,platformNo){
			if(key==null || key=='' || key=='undefined'){
				return '';
			}
			if(platformNo!=null && platformNo!='')
				DictInfo.platformNo = platformNo;
			try{
				var multiValue = [];
				var multiTypeCode = key.split(',');
				var multiType = this.getVar(module,DictInfo.platformNo);
				for(index in multiTypeCode){
					multiValue.push(multiType[multiTypeCode[index]]);
				}
				return multiValue.toString();
			}catch(e){
				return '';
			}
		},
		getList:function(module,platformNo){
			if(platformNo!=null && platformNo!='')
				DictInfo.platformNo = platformNo;
			var array = [];
			try{
				var list = eval('d'+DictInfo.platformNo)[module.toUpperCase()]['list'];
				for(key in list){
					array.push([list[key],key]);
				}
				return array;
			}catch(e){
				return array;
			}
		},
		getDefault:function(module,platformNo){
			if(platformNo!=null && platformNo!='')
				DictInfo.platformNo = platformNo;
			try{
				var value = eval('d'+DictInfo.platformNo)[module.toUpperCase()];
				return value['defaultValue']||'';
			}catch(e){
				return '';
			}
		},
		getChildren:function(module,key,childModule,platformNo){
			if(platformNo!=null && platformNo!='')
				DictInfo.platformNo = platformNo;
			try{
				var children = eval('d'+DictInfo.platformNo)[module.toUpperCase()]['children'][key][childModule];
				return children||null;
			}catch(e){
				return null;
			}
		}
	};
	DictInfo.initDictInfo();
});