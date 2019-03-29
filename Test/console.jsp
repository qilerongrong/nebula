<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<link rel="stylesheet" href="../bootstrap/demo-less/bootstrap.css" />
<link rel="stylesheet" href="../css/style.css" />
<link rel="stylesheet" href="../jquery/jquery-ui-1.9.2.custom/css/flick/jquery-ui-1.9.2.custom.css" />
<script src="../jquery/jquery.js"></script>
<script src="../common!dict.action"></script>
<script src="../bootstrap/js/bootstrap.min.js"></script>
<script src="../jquery/jquery-ui-1.9.2.custom/js/jquery-ui-1.9.2.custom.min.js"></script>
<script src="../v.1.0.js"></script>
<script src="../json2.js"></script>
<script type="text/javascript">
	$(document).ready(function() {
		$("#activeTasks").hide();
		$("#processDefinitons").hide();
		$("#processInstances").hide();
		$("#tasks").hide();
		
		$("#activeTasks_buttion").toggle(function() {
			$("#activeTasks").show();
		}, function() {
			$("#activeTasks").hide();
		});
		$("#processDefinitons_buttion").toggle(function() {
			$("#processDefinitons").show();
		}, function() {
			$("#processDefinitons").hide();
		});
		$("#processInstances_buttion").toggle(function() {
			$("#processInstances").show();
		}, function() {
			$("#processInstances").hide();
		});
		$("#tasks_buttion").toggle(function() {
			$("#tasks").show();
		}, function() {
			$("#tasks").hide();
		});
		
	});
	
</script>
</head>
<body>

	工作流管理后台
	<hr />
	待办任务统计信息
	<input id="activeTasks_buttion" type="button" name="" value="显示/隐藏" />	
	流程实例统计信息
	<input id="processInstances_buttion" type="button" name="" value="显示/隐藏" />
	流程定义统计信息：
	<input id="processDefinitons_buttion" type="button" name="" value="显示/隐藏" />
	任务历史统计信息
	<input id="tasks_buttion" type="button" name="" value="显示/隐藏" />
	
	
	<div id="processInstances">
		<table border="1">
			<tr>
				<td>流程实例</td>
				<td>
					<table border="1">
						<tr>
							<td>id</td>
							<td>流程定义</td>
							<td>开始时间</td>
							<td>结束时间</td>
							<td>是否完成</td>
							<td>操作</td>
						</tr>
						<c:forEach items="${processInstances}" var="processInstance">
							<td><c:out value="${processInstance.id}" /></td>
							<td><c:out value="${processInstance.processDefinitionId}" />
							</td>
							<td><fmt:formatDate value="${processInstance.startTime}"
									pattern="yyyy-MM-dd HH:mm:ss" />
							</td>
							<td><c:if test="${processInstance.endTime!=null}">
									<fmt:formatDate value="${processInstance.endTime}"
										pattern="yyyy-MM-dd HH:mm:ss" />
								</c:if>
							</td>
							<td><c:choose>
									<c:when test="${processInstance.endTime!=null}">完成</c:when>
									<c:otherwise>未完成</c:otherwise>
								</c:choose></td>
							<td><a
								href="${pageContext.request.contextPath}/backoffice/systemsetting/workflowConsole/work-flow-console!closeProcessInstance.action?processInstanceId=<c:out value="${processInstance.id}"/>">关闭流程</a>
								<a
								href="${pageContext.request.contextPath}/backoffice/systemsetting/workflowConsole/work-flow-console!closeProcessInstance.action?processInstanceId=<c:out value="${processInstance.id}"/>">删除流程</a>
								<a
								href="${pageContext.request.contextPath}/backoffice/systemsetting/workflowConsole/work-flow-console!showPics.htm?processInstanceId=<c:out value="${processInstance.id}"/>&processDefinitionId=<c:out value="${processInstance.processDefinitionId}"/>"
								target="_blank">显示流程图</a>
							</td>
							</tr>
						</c:forEach>

					</table>
				</td>
			</tr>
		</table>
	</div>
	<div id="activeTasks">
		<table border="1">
			<tr>
				<td>任务</td>
				<td>
					<table border="1">
						<tr>
							<td>所属流程定义</td>
							<td>所属流程实例</td>
							<td>ID</td>
							<td>名称</td>
							<td>处理人</td>
							<td>描述</td>
							<td>创建时间</td>
							<td>预计完成时间</td>
							<td>操作</td>
						</tr>
						<c:forEach items="${activeTasks}" var="task">
							<td><c:out value="${task.processDefinitionId}" /></td>
							<td><c:out value="${task.processInstanceId}" /></td>
							<td><c:out value="${task.id}" /></td>
							<td><c:out value="${task.name}" /> <br /> <c:out
									value="${task.taskDefinitionKey}" /></td>
							<td><c:out value="${task.assignee}" /></td>
							<td><c:out value="${task.description}" /></td>
							<td><fmt:formatDate value="${task.createTime}"
									pattern="yyyy-MM-dd HH:mm:ss" /></td>
							<td><c:if test="${task.dueDate!=null}">
									<fmt:formatDate value="${task.dueDate}"
										pattern="yyyy-MM-dd HH:mm:ss" />
								</c:if>
							</td>
							<td><a
								href="${pageContext.request.contextPath}/workflow/completeTaskByManager.htm?taskId=<c:out value="${task.id}"/>">完成此任务</a>
								&nbsp;&nbsp;&nbsp;
								<form
									action="${pageContext.request.contextPath}/workflow/changeTaskByManager.htm">
									<input type="hidden" name="taskId"
										value="<c:out value="${task.id}"/>" /> 将任务委派给:<input
										type="text" name="assignee" value="" /><br />
									<fmt:message key='87' />
									:<input type="text" name="taskDescription" value="" /><br />
									<input type="submit" name="submit" value="修改" />
								</form>
							</td>
							</tr>
						</c:forEach>
					</table>
				</td>
			</tr>
		</table>
	</div>
	
	<div id="processDefinitons">
		<table border="1">
			<tr>
				<td>流程定义</td>
				<td>
					<table border="1">
						<tr>
							<td>id</td>
							<td>类型</td>
							<td>名字</td>
							<td>key</td>
							<td>版本</td>
							<td>操作</td>
						</tr>
						<c:forEach items="${processDefinitons}" var="processDefiniton">
							<tr>
								<td><c:out value="${processDefiniton.id}" /></td>
								<td><c:out value="${processDefiniton.category}" /></td>
								<td><c:out value="${processDefiniton.name}" /></td>
								<td><c:out value="${processDefiniton.key}" /></td>
								<td><c:out value="${processDefiniton.version}" /></td>
								<td><a
									href="${pageContext.request.contextPath}/workflow/startProcessInstance.htm?processDefinitonKey=<c:out value="${processDefiniton.key}"/>">启动新的流程</a><br />
									<a
									href="${pageContext.request.contextPath}/workflow/deleteProcessDefiniton.htm?processDefinitonKey=<c:out value="${processDefiniton.key}"/>&cascade=true">删除流程定义并级联删除流程实例</a><br />
									<a
									href="${pageContext.request.contextPath}/workflow/deleteProcessDefiniton.htm?processDefinitonKey=<c:out value="${processDefiniton.key}"/>&cascade=false">删除流程定义但不删除流程实例</a><br />
									<a
									href="${pageContext.request.contextPath}/workflow/showPics.htm?processDefinitionId=<c:out value="${processDefiniton.id}"/>"
									target="_blank">显示流程图</a>
								</td>
							</tr>
						</c:forEach>

					</table>
				</td>
			</tr>
		</table>
	</div>
	
	
	<div id="tasks">
		<table border="1">
			<tr>
				<td>任务</td>
				<td>
					<table border="1">
						<tr>
							<td>所属流程定义</td>
							<td>所属流程实例</td>
							<td>ID</td>
							<td>名称</td>
							<td>处理人</td>
							<td>描述</td>
							<td>开始时间</td>
							<td>结束时间</td>
							<td>是否完成</td>
							<td>业务数据</td>
							<td>操作</td>
						</tr>
						<c:forEach items="${tasks}" var="task">
							<td><c:out value="${task.processDefinitionId}" /></td>
							<td><c:out value="${task.processInstanceId}" /></td>
							<td><c:out value="${task.id}" /></td>
							<td><c:out value="${task.name}" /><br />
							<c:out value="${task.taskDefinitionKey}" /></td>
							<td><c:out value="${task.assignee}" /></td>
							<td><c:out value="${task.description}" /></td>
							<td><fmt:formatDate value="${task.startTime}"
									pattern="yyyy-MM-dd HH:mm:ss" />
							</td>
							<td><c:if test="${task.endTime!=null}">
									<fmt:formatDate value="${task.endTime}"
										pattern="yyyy-MM-dd HH:mm:ss" />
								</c:if>
							</td>
							<td><c:choose>
									<c:when test="${task.endTime!=null}">完成</c:when>
									<c:otherwise>未完成</c:otherwise>
								</c:choose>
							</td>
							<td><c:forEach items="${bussinessDataList}" var="bd">
									<c:if test="${bd.taskId == task.id}">
										<c:out value="${bd.taskInfo}" />
									</c:if>
								</c:forEach>
							</td>
							<td><c:if test="${task.endTime==null}">
									<a
										href="${pageContext.request.contextPath}/workflow/completeTaskByManager.htm?taskId=<c:out value="${task.id}"/>">完成此任务</a>
								</c:if>
							</td>
							</tr>
						</c:forEach>
					</table>
				</td>
			</tr>
		</table>
	</div>

</body>
</html>