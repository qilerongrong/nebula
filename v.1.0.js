/*********************************|
 *** VV mini framework         ****|
 *** @author: victor             ****|
******* **************************/

;if(!window['VV']&&!window['V']){
    window['V'] = window['VV'] = {};
}
V.contextPath = 'http://192.168.1.115:8085/h3c';
/*===================================Log================================*/
/*TODO << 为每个模块设置log开关，以免所有的日志都打出来开发者不好找关心的日志。
*/
/*===================================Log================================*/
V.Log = function(){ }
V.Log.ENABLE = true;//手动设置Log开关
V.Log.prototype.info = function(msg){
    if(V.Log.ENABLE){
	    var time = new Date().toTimeString();
	    console.info(time+"  "+msg);
	}else{
	    //当第一次知道已关闭则不再做判断了。
	    this.info = function(){
		    return;
		}
	}
}
//如果不支持console对象则无法使用Log功能
if(!window["console"]){
    V.Log.ENABLE = false;
}
var _log = new V.Log();
V.log = function(msg){
    _log.info(msg);
};

/*=================================Class================================*/
/*option:
**name:className
**superClass:superClassName
**init:function(){} //constructor;
*/
/*=================================Class================================*/
V.Classes = {
    create:function(option){
	    var class_name = option.className,
		    super_class = option.superClass?this[option.superClass]:undefined;
	    var glass = function(){
			if(super_class){
			    super_class.prototype.constructor.apply(this,arguments);
			}
			this.getClassName = function(){
			    return class_name;
			}
		    option.init&&option.init.apply(this,arguments);
		};
		if(super_class){
		    this.extend(glass,super_class)
		}
		this[class_name] = glass;
		this[class_name].classname = class_name;
		this[class_name].superclassname = option.superClass;
		V.log("Class: "+class_name+" has beed created.");
		return glass;
	},
	destroy:function(classname){
	    delete this[classname];
	},
	extend:function(subClass,superClass){
	    var F = function(){};
		F.prototype = superClass.prototype;
		subClass.prototype = new F();
		subClass.prototype.constructor = subClass;
		subClass.superclass = superClass.prototype;
		if(superClass.prototype.constructor == Object.prototype.constructor){
			superClass.prototype.constructor = superClass;
		}
	}
}

/*
|------------------------------MessageBus------------------------------|
| subject:eventId,data                                                                             | 
|------------------------------MessageBus------------------------------|
*/
/*TODO ?是否需要抽象出Dispatcher。
V.Classes.create({
    className:'Dispatcher',
    init:function(){
        this.query = {}
    }
})
(function(Dispatcher){
    
})(V.Classes['Dispatcher']);
*/
V.MessageBus = {
    query:{},
	publish:function(subject){
	    var eventId = subject.eventId;
		var data = (subject.data==null||subject.data==undefined)?{}:subject.data;
		this.query[eventId] = this.query[eventId]||[];
		var subscribers = this.query[eventId];
		var length = subscribers.length;
		V.log('MessageBus publish:'+subject.eventId+' callbacks:'+length);
		$.each(subscribers,function(){
			 var context = this.context;
			 var handler = this.handler;
			 if(context){
			     handler&&handler.call(context,data);
			 }else{
			     handler&&handler(data);
			 }
		});
	},
	subscribe:function(eventId,handler,context){
	    V.log('MessageBus subscribe event:'+eventId);
		this.query[eventId] = this.query[eventId]||[];
	    this.query[eventId].push({context:context,handler:handler});
	},
	unsubscribe:function(eventId,fn){
	    var subscribers = this.query[eventId];
		if(subscribers){
		    for(var i=0,l=subscribers.length;i<l;i++){
				var handler = subscribers[i].handler;
				if(fn == handler){
					//subscribers.splice(i,1);publish的时候做遍历会出问题。
					subscribers[i].handler = null;
					break;
				}
			}
		}
	}
}
/*
|------------------------basepath--------------------------|
*/
V._getBasePath = function(){
	var result = "";
	var scripts = document.getElementsByTagName("script");
	var  reg = /v([.-]\d)*\.js(\W|$)/ig;
	for(var i=0, len=scripts.length; i<len; i++){
		var src = !!document.querySelector?scripts[i].src:scripts[i].getAttribute("src",4);
		if(src && reg.test(src)){
			result = src;
			break;
		}
	}
	return result.substr( 0, result.lastIndexOf("/") + 1 );
},
V.basePath = V._getBasePath();


/*
|--------------------------------Plugin---------------------------------|
*/
V.Classes.create({
    className:"v.Plugin",
	init:function(){
	    this.ns = 'v.plugin';
        this.query = {};
		this.getNS = function(){
		    return this.ns;
		};
		//对外的事件接口
		this.EVENT = {};
	}
});
(function(Plugin){
    Plugin.prototype.EVENT_LOADED = '.loaded';
	Plugin.prototype.init = function(){}
	Plugin.prototype.getPath = function(){
		var url = V.basePath+'plugin';
		var ns = this.ns;
		var nsArr = ns.split(".");
		for(var i=1,l=nsArr.length;i<l;i++){
			url += "/"+nsArr[i];
		}
		return url;
	}
	/**
	 * plugin跳转
	 * @param {Object} p  plugin
	 * @param {Object} data , plugin需要的数据。(即options)
	 */
	Plugin.prototype.forward = function(p,data,callback){
		var that = this;
		this.container.empty();
		V.loadPlugin(p,function(){
			var glass = V._registedPlugins[p].glass;
			var inst = new V.Classes[glass]()
			var opt = data||{};
			opt.container = that.container;
			inst.init(opt);
			callback&&callback(inst);
			//that = null;
		})
	}
	Plugin.prototype.log = function(msg){
		V.log("Plugin:"+this.getNS()+"<<<<<"+msg);
	}
	Plugin.prototype.publish = function(subject){
		var eventId = subject.eventId;
		var data = subject.data||{};
		this.query[eventId] = this.query[eventId]||[];
		var subscribers = this.query[eventId];
		V.log('Message Bus <Plugin:'+this.ns+'>: publish:'+subject.eventId+' callbacks:'+subscribers.length);
		for(var i=0,l=subscribers.length;i<l;i++){
			if(subscribers[i]){
			    var context = subscribers[i].context;
				var handler = subscribers[i].handler;
				if(context){
				    handler.call(context,data);
				}else{
				    handler(data);
				}
			}
		}
	}
	Plugin.prototype.subscribe = function(pluginInst,eventId,handler){
        if(pluginInst instanceof Plugin){
            this.log('Message Bus <Plugin:'+this.ns+'>: subscribe event of '+pluginInst.ns+': '+eventId);
            pluginInst.query[eventId] = pluginInst.query[eventId]||[];
	        pluginInst.query[eventId].push({context:this,handler:handler});
        }
	}
    Plugin.prototype.unsubscribe = function(inst,eventId,fn){
        var subscribers = inst.query[eventId];
		if(subscribers){
		    for(var i=0,l=subscribers.length;i<l;i++){
				var handler = subscribers[i].handler;
				if(fn == handler){
					subscribers.splice(i,1);
					break;
				}
			}
		}
    }
    Plugin.prototype.getLang = function(key){
        var val = V.Lang.get(key,this.ns);
        if(val!="#MISSTEXT#"){
            return val;
        }
        var className = this.getClassName();
        var superclassName = V.Classes[className].superclassname;
        while(superclassName!=undefined){
            var m = superclassName.lastIndexOf('.');
		    var ns = superclassName.substring(0,m+1)+superclassName.charAt(m+1).toLowerCase()+superclassName.substring(m+2);
            val = V.Lang.get(key,ns);
            if(val!="#MISSTEXT#"){
                return val;
            }
            superclassName =  V.Classes[superclassName].superclassname;
        }
        return val;
    }
})(V.Classes['v.Plugin']);

V._registedPlugins = {};
V.getPluginInstByNs = function(ns){
	var glass = V._registedPlugins[ns].glass;
	if(glass){
		return new V.Classes[glass]();
	}else{
		return null;
	}
}
V.loadPlugin = function(ns,handler){
    ns = $.trim(ns);
	V.log('begin to load plugin: '+ns);
	V.MessageBus.subscribe(ns+'.loaded',function(){
		V.MessageBus.unsubscribe(ns+'.loaded',arguments.callee);//必须在执行handler之前取消该load事件监听，避免handler执行时因为publish load事件而出错。
	    handler&&handler();
    });
	if(V._registedPlugins[ns]){
		if(V._registedPlugins[ns].state){
			this.log("plugin: " + ns + " has beed loaded.");
			V.MessageBus.publish({eventId:ns+'.loaded'});
			//handler&&handler();
		}
	}else{
			V._registedPlugins[ns] = {state:0};
			var nsArr = ns.split('.');
			var url = V.basePath+"plugin";
			for(var i=1,l=nsArr.length;i<l;i++){
				url += "/"+nsArr[i];
			}
			url += "/" + nsArr[nsArr.length-1] + ".js";
			V.Util.Loader.loadJS(url);
	}
}
//使用defer对象
V.loadPlugins = function(nss,handler){
	function load(ns){
		var dfd = $.Deferred();
		V.loadPlugin(ns,function(){
			dfd.resolve();
		});
		return dfd.promise();
	}
	var promises = [];
	$.each(nss,function(){
		var plugin = this;
		promises.push(load(plugin));
	});
	$.when.apply(this,promises).then(handler);
	
}
/*
 * requires:{plugins:[],js:[],css:[]}
 */
V.registPlugin = function(ns,doRegist,requires){
    var mb = V.MessageBus;
	var plugins = requires&&requires.plugins?requires.plugins:[];
	var jss = requires&&requires.jss?requires.jss:[];
	ns = $.trim(ns);
	//如果加载了lang plugin则增加国际化功能，此处需加载语言包
	/*
	if(V.Lang){
	    var langJsUrl = V.basePath+'plugin';
		var nsArr = ns.split(".");
		for(var i=1,l=nsArr.length;i<l;i++){
			langJsUrl += "/"+nsArr[i];
		}
		var lang = V.Lang.language;
		langJsUrl += "/assets/lang/"+lang+".js";
	    jss.push(langJsUrl);
	}
	*/
	if(plugins.length ==0&& jss.length ==0){
		requires = null;
	}
    function glass(ns){
	    var m = ns.lastIndexOf('.');
		return ns.substring(0,m+1)+ns.charAt(m+1).toUpperCase()+ns.substring(m+2);
	}
	V._registedPlugins[ns].requires = plugins;
	V._registedPlugins[ns].regist = doRegist;
	V._registedPlugins[ns].glass = glass(ns);
	if(!requires){
	    regist(ns);
		return;
	}else{
		for(var i=0,l=plugins.length;i<l;i++){
		    V.loadPlugin(plugins[i],checkloadAndDoRegist);
		}
		for(var i=0,l=jss.length;i<l;i++){
			if(jss[i].indexOf("http://")==-1&&jss[i].indexOf("http://")==-1){
				//如果是相对路径
				jss[i] = V.basePath + jss[i];
			}
			V.Util.Loader.loadJS(jss[i],checkloadAndDoRegist);
		}
		//并行加载，顺序执行，ajax方法实现；缺点，不能跨域
		//V.Util.Loader.loadJSs(jss,checkloadAndDoRegist);
	}
	function checkloadAndDoRegist(){
		for(var i=0,l=plugins.length;i<l;i++){
			var _ns = plugins[i];
			if(V._registedPlugins[_ns]&&V._registedPlugins[_ns].state){
				continue;
			}else{
				return false;
			}
		}
		var loadedQueue = V.Util.Loader._loadedQueue;
		for(var i=0,l=jss.length;i<l;i++){
			if($.inArray(jss[i],loadedQueue) == -1){
				return false;
			};
		}
		regist(ns);
	}
	function regist(ns){
	    V._registedPlugins[ns].regist();
		V._registedPlugins[ns].state = 1;
		mb.publish({eventId:ns+'.loaded'});
	}
}
V.Util = {
    clone:function(o){
	    var fd = this;
		var objClone;
		if (o.constructor == Object || o.constructor ==  Array) objClone = new o.constructor(); 
		else objClone = new o.constructor(o.valueOf()); 
		for (var key in o){
			if (objClone[key] != o[key]){ 
				if (typeof(o[key]) == 'object'){ 
					objClone[key] = fd.clone(o[key]);
				}else{
					objClone[key] = o[key];
				}
			}
		}
		objClone.toString = o.toString;
		objClone.valueOf = o.valueOf;
		return objClone; 
	},
	//formater YYYY-MM-DD hh:mm:ss
	formatDate:function(date,formater){
		var year = date.getFullYear();
		var month = date.getMonth()+1;
		month = month<10?"0"+month:month;
		var day = date.getDate();
		day = day<10?"0"+day:day;
		var hour = date.getHours();
		hour = hour<10?"0"+hour:hour;
		var minute  = date.getMinutes();
		minute = minute<10?"0"+minute:minute;
		var second = date.getSeconds();
		second = second<10?"0"+second:second;
		var _after = year + '-' + month + '-' + day;
		if(formater){
			_after = formater.replace('YYYY',year).replace('MM',month).replace('DD',day).replace('hh',hour).replace('mm',minute).replace('ss',second);
		}
		return _after;
	},
	// formatDate:function(date){
	// 	var year = date.getFullYear();
	// 	var month = date.getMonth()+1;
	// 	var date = date.getDate();
	// 	return year + '/' + month + '/' + date;
	// },
	formatlineDate:function(date){
		var year = date.getFullYear();
		var month = date.getMonth()+1;
		var date = date.getDate();
		return year + '-' + month + '-' + date;
	},
	formatFullDate:function(time){
		if(time==null) return;
		var year = time.getFullYear();
		var month = time.getMonth()+1;
		var date = time.getDate();
		var hours = time.getHours();
		var minutes = time.getMinutes();
		var seconds = time.getSeconds();
		return year + '-' +  this.rightTwo(month) + '-' + this.rightTwo(date) + ' ' + this.rightTwo(hours) + ':' + this.rightTwo(minutes) + ':' + this.rightTwo(seconds);
	},
	changeTwoDecimal:function(x){
		var f_x = parseFloat(x);
		if (isNaN(f_x))
		{
			return x;
		}
		f_x = Math.round(f_x*100)/100;
		var s_x = f_x.toString();
		var pos_decimal = s_x.indexOf('.');
		if (pos_decimal < 0)
		{
			pos_decimal = s_x.length;
			s_x += '.';
		}
		while (s_x.length <= pos_decimal + 2)
		{
			s_x += '0';
		}
		return s_x;
	},
	rightTwo:function(data){
		var data = '0'+data;
		return data.substring(data.length-2,data.length);
	},
	parseLangEncode:function(str){
		return str.replace(/{([A-Za-z0-9_.]+)}/g, function(m){
			return eval(m.substring(1,m.length-1))
		})
	},
	getDateRange:function(){
		var myDate = new Date();
		var year = myDate.getFullYear();
	    var month = myDate.getMonth()+1;
	    var date = myDate.getDate();
	    if (month<10){
	        month = "0"+month;
	    }
	    if(date<10){
	    	date = "0"+date;
	    }
		var startValue = year+'-'+month+'-'+'01';
		var endValue = year+'-'+month+'-'+date;
		return [startValue,endValue];
	},
	parseLangEncode:function(str){
		return str.replace(/{([A-Za-z0-9_.]+)}/g, function(m){
			return eval(m.substring(1,m.length-1))
		})
	}
}
V.Util.Date = {
	formatDate:function(date,formater){
		var year = date.getFullYear();
		var month = date.getMonth()+1;
		month = month<10?"0"+month:month;
		var day = date.getDate();
		day = day<10?"0"+day:day;
		var hour = date.getHours();
		hour = hour<10?"0"+hour:hour;
		var minute  = date.getMinutes();
		minute = minute<10?"0"+minute:minute;
		var second = date.getSeconds();
		second = second<10?"0"+second:second;
		var _after = year + '-' + month + '-' + day;
		if(formater){
			_after = formater.replace('YYYY',year).replace('MM',month).replace('DD',day).replace('hh',hour).replace('mm',minute).replace('ss',second);
		}
		return _after;
	},
	//parseDate,支持2种分割符的时间 eg: YYYY-MM-DD hh:mm:ss  YYYY/MM/DD hh:mm:ss,或者毫秒数
	parse:function(str){
		if(typeof(str)=="number"){
			return new Date(str);
		}
		str = jQuery.trim(str);
		_arr = str.split(" ");
		_date = _arr[0];
		_time = _arr[1];
		var year,month,day,hour,mimute,second;
		if(_date){
			if(_date.indexOf('-')!=-1){
				_dateArr = _date.split('-');
				year = _dateArr[0];
				month = _dateArr[1]-1;
				day = _dateArr[2];
			}else if(_date.indexOf('/')!=-1){
				_dateArr = _date.split('/');
				year = _dateArr[0];
				month = _dateArr[1]-1;
				day = _dateArr[2];
			}else{
				
			}
		}
		if(_time){
			_timeArr = _time.split(':');
			hour = _timeArr[0];
			minute = _timeArr[1];
			second = _timeArr[2];
		}
		return new Date(year,month,day,hour,minute,second);
	}
}
V.Util.Number = {
    commafy:function(num){
    	if (num!=undefined) {
    		return (num + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
    	} else {
    		return '';
    	}
    },
    //返回字符串，避免精度丢失
    commafyback:function(str){
    	if(str) {
    		str = (str+'').replace(/,/g,'');
    		var fraction_part = str.split('.')[1];
    		var length = 0;
    		if(fraction_part){
    			length = fraction_part.length;
    		}
    		return parseFloat(str).toFixed(length);
    	} else {
    		return 0;
    	}
    }
}
//float tool
V.Util.Float = {
	add:function(arg1,arg2){
		if(arg1=='' || arg2=='' || arg1==null || arg2==null) return '';
		var r1,r2,m;  
		try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0}  
		try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0}  
		m=Math.pow(10,Math.max(r1,r2))  
		return (arg1*m+arg2*m)/m;
	},
	sub:function(arg1,arg2){
		if(arg1=='' || arg2=='' || arg1==null || arg2==null) return '';
		var r1,r2,m,n;  
		try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0}  
		try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0}  
		m=Math.pow(10,Math.max(r1,r2));  
		//动态控制精度长度  
		n=(r1>=r2)?r1:r2;  
		return ((arg1*m-arg2*m)/m).toFixed(n);
	},
	mul:function(arg1,arg2){
		if(arg1=='' || arg2=='' || arg1==null || arg2==null) return '';
		var m=0,s1=arg1.toString(),s2=arg2.toString();   
		try{m+=s1.split(".")[1].length}catch(e){}   
		try{m+=s2.split(".")[1].length}catch(e){}   
		return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m);
	},
	div:function(arg1,arg2){
		if(arg1=='' || arg2=='' || arg1==null || arg2==null) return '';
		var t1=0,t2=0,r1,r2;   
		try{t1=arg1.toString().split(".")[1].length}catch(e){}   
		try{t2=arg2.toString().split(".")[1].length}catch(e){}   
		with(Math){   
			r1=Number(arg1.toString().replace(".",""))   
			r2=Number(arg2.toString().replace(".",""))   
			return (r1/r2)*pow(10,t2-t1); 
		}
	}
}
/*for struts2  json-plugin*/
V.ajax = function(option){
	$.ajax({
		url:option.url,
		type:'POST',
		data:JSON.stringify(option.data||{}),
		contentType:'application/json',
		dataType:'json',
		success:function(data){
			option.success&&option.success(data);
		},
		error:function(data){
		    option.error&&option.error(data);
		}
	});
}
V.Util.Loader = {
    _loadedQueue:[],
    loadJS:function(url,callback){
	    var that = this;
	    
		if($.inArray(url, this._loadedQueue)!=-1){
			callback&&callback();
			return ;
		}
	 	var script = document.createElement("script");
        var that = this;	
	   	script.type = "text/javascript";
	   	if (script.readyState){
			script.onreadystatechange = function(){
			   if(script.readyState == "loaded" || script.readyState == "complete"){
			        V.log("file:"+url+" is loaded.")
					script.onreadystatechange = null; 
					that._loadedQueue.push(url);
					callback&&callback();
			   }
			};
		}else {
			script.onload = function(a,b,c){	
			    that._loadedQueue.push(url);
			    callback&&callback();
			};
			script.onerror = function(a,b,c){	
			    //that._loadedQueue.push(url);
			    callback&&callback();
			};
	    }
		script.src = url+ "?" + new Date().getTime(); //时间戳
		document.getElementsByTagName("head")[0].appendChild(script);
	},
	//异步加载，不保证顺序执行
//	loadJSs2:function(jss,callback){
//		var queue = jss||[];
//		var s = queue.length;
//		function  checkAllLoaded(){
//			
//		}
//	},
	//异步加载,顺序执行（不可跨域）
	loadJSs:function(jss,callback){
		var queue = jss || [];
		var _script = {};
		var loaded = 0;
		var s = queue.length;
		function executeJss(){
			var head = document.getElementsByTagName("head")[0];
			for(var i=0;i<s;i++){
				var script = document.createElement("script");
				script.type = 'text/javascript';
				script.text = _script[queue[i]];
				document.getElementsByTagName("head")[0].appendChild(script);
			}
			callback&&callback();
		};
		var loader = V.Util.Loader;
		$.each(queue,function(index,url){
			if($.inArray(url, loader._loadedQueue) !=-1){
				loaded++;
				if(loaded == s){
					executeJss();
				}
				return true;
			}
			$.ajax({
				url:url,
				success:function(data){
					V.Util.Loader._loadedQueue.push(url);
					loaded++;
				    _script[url] = data;
					if(loaded == s){
						executeJss();
					}
				}
			})
		});
	},
	loadCSS:function(url){
	    var cssLink = document.createElement("link");
		cssLink.rel = "stylesheet";
		cssLink.rev = "stylesheet";
		cssLink.type = "text/css";
		cssLink.media = "screen";
		cssLink.href = url;
		document.getElementsByTagName("head")[0].appendChild(cssLink);
	}
}
V.Lang = {
    language:'zh-CN',
    Plugins:{},
    get:function(key,scope){
        var scope = this.Plugins[scope]||{};
        return scope[key]||"#MISSTEXT#";
    }
}
