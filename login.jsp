<%@page import="org.apache.struts2.components.ElseIf"%>
<%@ page contentType="text/html;charset=UTF-8" %>
<% 
String requestType = request.getHeader("X-Requested-With"); 
response.setHeader("Cache-Control","no-cache");
if("XMLHttpRequest".equals(requestType)){ 

response.sendError(999,"error"); 
return; 
} 
%>

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>JEELDRDP</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<meta http-equiv="X-UA-Compatible" content="IE=11,IE=10,IE=9,IE=8,IE=edge"/>
<link href="css/login.css" rel="stylesheet" type="text/css" />
<link href="favicon.ico" rel="icon" type="image/x-icon" />
<link href="favicon.ico" rel="shortcut icon" type="image/x-icon" />

<link rel="stylesheet" href="jquery/jquery-ui-1.9.2.custom/css/flick/jquery-ui-1.9.2.custom.css"/>
<link rel="stylesheet" href="bootstrap/demo-less/bootstrap.css"/>
<link rel="stylesheet" href="css/style.css"/>
<script src="jquery/jquery.js"></script>

<script src="bootstrap/js/bootstrap.min.js"></script>
<script src="jquery/jquery-ui-1.9.2.custom/js/jquery-ui-1.9.2.custom.min.js"></script>
<script src="jquery/jquery-ui-1.9.2.custom/js/jquery-ui-Datepicker-zh-cn.js"></script>
<script src="v.1.0.js"></script>
<script src="json2.js"></script>
<script src="lang/zh-CN.js"></script>
<script src="js/sha1.js"></script>

<script type="text/javascript">
	function addFavorite(){
		var d="http://localhost:8085/b2bchina";
		var c="Customer Care Management";
		if (document.all) {
			window.external.AddFavorite(d, c)
		} else {
			if (window.sidebar) {
				window.sidebar.addPanel(c, d, "")
			} else {
				alert("\u5bf9\u4e0d\u8d77\uff0c\u60a8\u7684\u6d4f\u89c8\u5668\u4e0d\u652f\u6301\u6b64\u64cd\u4f5c!\n\u8bf7\u60a8\u4f7f\u7528\u83dc\u5355\u680f\u6216Ctrl+D\u6536\u85cf\u672c\u7ad9\u3002")
			}
		}
	}
	//校验，重置密码，发送邮件
	function resetPasswordEmail(form,dlg){
		var loading_mask = $('<div ></div>');
		loading_mask.css({
			top:0,
			left:0,
			position:'absolute',
			opacity:0.7,
			zIndex:9999,
			background:'#efefef url(imgs/loading_16.gif) center no-repeat',
			height:'350px',
			width:'100%'
		}).appendTo($(dlg.template));

		 V.ajax({
			url:'common!resetPasswordEmail.action',
         	type:'post',
         	data:{filterList:form.getValues()},
         	success:function(data){
                 if(data.result=='success'){
                     V.alert(data.info);
                     dlg.close();
                 }else{
                     V.alert(data.info);
                 }
                 loading_mask.remove();
             }
         })
	}
	function forgetPassword(){
		var that = this;
		var form;
		V.loadPlugin('v.ui.alert');
		V.loadPlugin('v.ui.dialog',function(){
			var dlg = new V.Classes['v.ui.Dialog']();
			dlg.setBtnsBar({btns:[
                 {text:"发送邮件",style:"btn-primary",handler:function(){
                       if(!form.validate()) return;
                       resetPasswordEmail(form,dlg);
                 }}
                 ,{text:"关闭",style:"btn",handler:dlg.close}
             ]});
             dlg.init({width:560,height:320,title:'密码重置'});
             
             V.loadPlugin('v.component.form',function(){
     			var Form = V.Classes['v.component.Form'];
     			form = new Form();
                 var items = [
     					{label:'用户名',type:Form.TYPE.TEXT,name:'loginName',value:'',required:true,validator:'text(0,200)'},
                         {label:'电子邮箱',type:Form.TYPE.TEXT,name:'email',value:'',required:true,validator:'email'}
                 	];
                 
                 form.init({
                     colspan:1,
                     items:items,
                     container:dlg.getContent()
                 });
     		})
		});
	}
	function sub() {
		var pwd = $('#password').val();
		$("#j_password").val(pwd);
		$("#j_password").val(hex_sha1(pwd));
		$('#password').attr('disabled','disabled');
	}
	$(document).ready(function(){
		$('.forget_password').click(function(){
			forgetPassword();
		})
	})
	
</script>
</head>

<body onload='document.f.j_username.focus();' style="overflow:hidden;height:100%">
<!--content-->
<div class="login_wrapper">
<div id="login_content">
	<form name='f' action='j_spring_security_check' method="post" onsubmit="return sub();">
		<div id="content_main">
	    <div id="logo"></br></div>
	    <div class="logintitle">企业级分布式快速研发平台</div>
	    <div class="login_item item_username">
		    <input type="text" name="j_username" id="textfield" placeholder="用户名" class="formline"/>
	    </div>
	    <div class="login_item item_pwd">
		    <input type="password" name="password" id="password"  placeholder="密码" class="formline"  />
	    	<input type="hidden" id="j_password" name="j_password"/>
	    </div>
	    <div id="showError"  style="text-align: center"></div>
	    <div class="login_item">
		    <input name="submit" class="btn_login" type="submit" value="登  录" />
	   	</div>
		<a name="forgetPassword" class="forget_password" href="#">忘记密码</a>
	    <input type="hidden" name="targetUrlParameter" value="/index.html"/>
	    </div>
    </form>
</div>
</div>
<!--Copyright-->
<div id="Copyright">
<br>
<!--  --></div>
</div>
<%
	if ("1".equals(request.getParameter("error"))) {
		
%> 
<script type="text/javascript">
	document.getElementById("showError").innerHTML=("<font color=red>用户名或密码无效，请重试！</font>");
</script>
<%
	}
	if ("4".equals(request.getParameter("error"))) {
%>
<script type="text/javascript">
	document.getElementById("showError").innerHTML=("<font color=red>用户已经被锁定，请联系管理员！</font>");
</script>
 <%
	}
if ("3".equals(request.getParameter("error"))) {
%>
<script type="text/javascript">
	document.getElementById("showError").innerHTML=("<font color=red>密码错误，请重试！</font>");
</script>
 <%
	}
if ("5".equals(request.getParameter("error"))) {
%>
<script type="text/javascript">
	document.getElementById("showError").innerHTML=("<font color=red>租户已经过期，请联系管理员！</font>");
</script>
 <%
	}
if ("6".equals(request.getParameter("error"))) {
%>
<script type="text/javascript">
	document.getElementById("showError").innerHTML=("<font color=red>用户被禁用，请联系管理员！</font>");
</script>
 <%
	}
%>

</body>
</html>