;V.registPlugin("v.fn.util",function(){
	 Util = {};
	 Util.generateId = function(){
		 var chars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
	     var res = "";
		 for(var i = 0; i < 10 ; i ++) {
	         var id = Math.ceil(Math.random()*35);
	         res += chars[id];
	     }
	     return "V"+res;
	 };
	 // $.extend(true,V.Util,{
	 // 	Number:{
	 // 		zeroPadding:function(num,precision){
	 // 			num.toFixed(precision);
	 // 		}
	 // 	}
	 // })
});
