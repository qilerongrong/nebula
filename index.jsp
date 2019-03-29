<%@ page contentType="text/html;charset=UTF-8" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>CCO平台</title>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<!--
<link rel="stylesheet/less" href="bootstrap/demo-less/bootstrap.less">
<script src="less/less-1.3.0.min.js"></script>
-->
<link href="favicon.ico" rel="icon" type="image/x-icon" />
<link href="favicon.ico" rel="shortcut icon" type="image/x-icon" />
<link rel="stylesheet" href="jquery/jquery-ui-1.9.2.custom/css/flick/jquery-ui-1.9.2.custom.css"/>
<link rel="stylesheet" href="bootstrap/css/bootstrap.css"/>
<link rel="stylesheet" href="css/style.css"/>
<link rel="stylesheet" href="css/b2bstyle.css"/>
<link rel="stylesheet" href="css/demo.css"/>
<script src="jquery/jquery.js"></script>
<script src="jquery/jquery.cookie.js"></script>
<script src="js/sha1.js"></script>
<!--
<script src="jquery/jqplot/dist/excanvas.js"></script>
<script src="jquery/jqplot/dist/jquery.jqplot.min.js"></script>
<script src="jquery/jqplot/dist/plugins/jqplot.pieRenderer.min.js"></script>
<script src="jquery/jqplot/dist/plugins/jqplot.donutRenderer.min.js"></script>
-->
<script src="common!dict.action"></script>
<script src="bootstrap/js/bootstrap.min.js"></script>
<script src="jquery/jquery-ui-1.9.2.custom/js/jquery-ui-1.9.2.custom.min.js"></script>
<script src="jquery/jquery-ui-1.9.2.custom/js/jquery-ui-Datepicker-zh-cn.js"></script>
<script src="v.1.0.js"></script>
<script src="json2.js"></script>
<script src="lang/zh-CN.js"></script>
</head>
<body>
<script>
    $(function(){
        var lang = navigator.language;  
		if(!lang){
			lang = navigator.browserLanguage;  
		}
        V.Util.Loader.loadJS('lang/'+lang+'.js',function(){
            V.loadPlugin('v.views.pages.main',function(){
				var l = new V.Classes['v.views.pages.Main']();
				l.init();
			});
        });
	    
	});
</script>
</body>
</html>