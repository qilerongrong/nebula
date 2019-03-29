;V.registPlugin("v.views.report.reportManage.reportEditList",function(){
	V.Classes.create({
		className:"v.views.report.reportManage.ReportEditList",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.views.report.reportManage.reportEditList';
        	this.module = '';
        	this.syslist = new V.Classes['v.ui.Grid']();
			this.custlist = new V.Classes['v.ui.Grid']();
			this.form = new V.Classes["v.component.Form"]();
			this.fileupload = new V.Classes['v.ui.FileUpload']();
			this.template = '<div class="v-search">\
									<ul class="nav nav-tabs" style="margin-bottom:0px;" id="myTab">\
									  <li class="active"><a href="#systemlist">系统模版</a></li>\
									  <li><a href="#customlist">自定义模版</a></li>\
									</ul>\
									<div class="tab-content">\
									    <div class="tab-pane active" id="systemlist">\
									        <div class="systemlist">\
									        </div>\
									    </div>\
									    <div class="tab-pane" id="customlist">\
									        <div class="customlist">\
									         <div class="filters" style="display:block"><div class="well form-search"></div></div>\
									        </div>\
									    </div>\
									</div>\
								</div>';
			}
	});
	(function(ReportEditList){
		ReportEditList.prototype.EVENT = {
			BUYER_ON_CHANGE:'buyer_on_change'
		}
		ReportEditList.prototype.init = function(options){
			this.module = options.module;
			this.container = options.container;
			this.container.append(this.template);
			this.initForm();
			this.initEvent();
			this.initSysList();
			this.initCustList();
		}
		ReportEditList.prototype.initEvent = function(){
			var that = this;
 			$('#myTab a:first').tab('show');
		  	$('#myTab a').click(function (e) {
			  e.preventDefault();
			  $(this).tab('show');
			})
		}
		ReportEditList.prototype.initForm = function(){
			var that = this;
			var Form = V.Classes['v.component.Form'];
			this.form = new Form();
			 
			var items = [];
			var item1 = {label: '企业',type: Form.TYPE.PLUGIN,name: 'buyer',value: '',plugin: 'v.views.component.buyerSelector',colspan: 2 };
			items.push(item1);
			this.form.init({
				container : $('.form-search',this.container),
				colspan:3,
				items:items
			});
			var btn_search = $('<button class="btn btn-primary btn-search">查询</button>');
			btn_search.click(function(){
				that.search();
			});
			$('.form-search',this.container).append($('<div class="row-fluid" style="text-align:center"></div>').append(btn_search));
		}
		ReportEditList.prototype.search = function(){
			var filters ={platformPartyNo:$('[name=buyerCode]',this.form.template).val()};
			this.custlist.url = this.module + '/report!getListByPlatformPartyNo.action',
			this.custlist.setFilters(filters);
			this.custlist.retrieveData();
		}
		ReportEditList.prototype.getFilters = function(){
			var that = this;
			this.filters = {};
			$.each(this.form.options.items,function(){
				if(this.type == V.Classes['v.component.Form'].TYPE.PLUGIN){
					that.filters[this.name+'Code'] = $('[name='+this.name+'Code]',that.form.template).val();
					that.filters[this.name+'Name'] = $('[name='+this.name+'Name]',that.form.template).val();
				}else{
					that.filters[this.name] = $('[name='+this.name+']',that.form.template).val();
				}
			});
			return this.filters;
		}
		ReportEditList.prototype.initSysList = function(){
			var list = this.syslist;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			var that = this;
			//list.setFilters({isSystemReport:true});
			list.init({
					container : $('.systemlist', this.container),
					checkable : false,
					url : this.module + '/report!getTypeListBySystem.action',
					columns : [{
								displayName : '报表标题',
								key : 'reportTitle',
								width : 70
							},
							{
								displayName : '类型',
								key : 'reportTypeName',
								width : 70
							},
							{
								displayName : '日期',
								key : 'createDate',
								width : 70,
								render : function(record) {
									return V.Util.formatDate(new Date(record.createDate));
								}
							},
							{
								displayName : '操作',
								key : 'action',
								width : 50,
								render : function(record) {
									html = $('<div class="action"><a class="change" href="javascript:void(0);" title="修改"><i class="icon-edit"></i></a><div>');
									$('.change', html).click(function() {
										that.editReport(record);
									});
									$('.remove', html).click(function() {
										that.removeReport(record);
									});
									return html;
								}
							}]
				});
		}
			ReportEditList.prototype.initCustList = function(){
			var list = this.custlist;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			//list.setFilters({isSystemReport:false});
			var that = this;
			list.init({
					container : $('.customlist', this.container),
					checkable : false,
					url : this.module + '/report!getListByPlatformPartyNo.action',
					columns : [{
								displayName : '报表标题',
								key : 'reportTitle',
								width : 70
							},
							{
								displayName : '类型',
								key : 'reportTypeName',
								width : 70
							},
							{
								displayName : '日期',
								key : 'createDate',
								width : 70,
								render : function(record) {
									return V.Util.formatDate(new Date(record.createDate));
								}
							},
							{
								displayName : '操作',
								key : 'action',
								width : 50,
								render : function(record) {
									html = $('<div class="action"><a class="change" href="javascript:void(0);" title="修改"><i class="icon-edit"></i></a><a class="remove" href="javascript:void(0);" title="删除"><i class="icon-remove"></i></a><div>');
									$('.change', html).click(function() {
										that.editReport(record);
									});
									$('.remove', html).click(function() {
										that.removeReport(record);
									});
									return html;
								}
							}]
				});
		}
		ReportEditList.prototype.editReport = function(record){
			 this.uploadReport(record);
		}
		ReportEditList.prototype.removeReport = function(record){
			var that = this;
			V.confirm("是否删除?",function(e){
				$.ajax({
					url:that.module+'/report!delete.action',
					type:'post',
					data:{id:record['id']},
					success:function(data){
						if(data == 'success'){
			              	V.alert("删除成功!");
			              	that.list.removeRecord(record);
			             }else{
			                V.alert(data);
		                 }	
					}
				})
			});
		}
		ReportEditList.prototype.uploadReport = function(record){
			var that = this;
			var dlg = new V.Classes['v.ui.Dialog']();
			var con = $("<div><div class='up'><div class='temp'></div></div></div>");
			var file = $("<div style='background:#F9F9F9;border:1px solid #EEE;width:390px;height:50px;float:left;margin-top:10px;'><div class='span4 filename' style='margin-top:10px;'>文件名:<span class='filename_'></span>\
					 	<div id='divFileProgress' class='divFileProgress' style='height: 10px;width:210px;display:none'>\
							<div class='progress progress-striped active' style='height:7px;'>\
								<div class='bar' style='width: 0%;'></div>\
							</div>\
						</div>\
					</div>\
					<a href='javascript:void(0)' class='btn' style='margin-top:10px;padding:0px;height:19px;'><span id='select_file' class='select_files'></span></a>\
					</div>");
			$(".up",con).append(file);
			dlg.setContent(con);
			$("#template",con).change(function(){
				if($(this).val() == '1'){
					$(this).parent().parent().find(".company").hide();
				}else{
					$(this).parent().parent().find(".company").show();
				}
			});
			
			dlg.setBtnsBar({btns:[{
				text:'上传',style:'btn-primary',handler:function(){
					that.fileupload.upload();
				}
			},{
				text:'取消',handler:function(){
					dlg.close();
				}
			}]});
			dlg.init({
				title:'导入报表',
				width:430,
				height:250
			});
			this.initFileUpload(dlg,record);
		}
		ReportEditList.prototype.initFileUpload = function(dlg,record){
			var that = this;
			var options = {};
			options.width = 54;
			options.height = 19;
			options.url = "reportService/reportServlet.do?cmd=edit&id="+record['id'];
			options.placeholderId = "select_file";
			options.fileQueuedHandler = "fsUploadProgress";
			options.upload_target = "divFileProgress";
			options.displayText = "选择...";
			options.button_text_top_padding = 0;
			options.button_text_style = ".butt{color:white}";
			options.fileTypes = "*.zip";
			options.uploadError = this.uploadError;
			options.uploadSuccess = function(file,serverData){
			$("#divFileProgress",that.template).hide();
			//**文件上传成功**//
			var progress = new FileProgress(file,  this.customSettings.upload_target);
			$(".up .success",dlg.template).empty();
			var succ = $('<div class="success"><div style="width:390px;height:20px;float:left;margin-top:20px;"><div class="alert alert-info" style="padding:0">上传成功!</div></div></div>');
			$(".up",dlg.template).append(succ);
			$(".progress",dlg.template).removeClass('active');
			if(serverData != undefined || serverData != null ){
				 
			}else{
				V.alert("服务器异常!");
			}
		};
		options.fileQueuedHandler = function(file){
			//**文件上传事件处理**//
			$(".filename",dlg.template).show();
			$(".filename_",dlg.template).text(file.name);
			$(".divFileProgress",dlg.template).show();
			$(".up .success",dlg.template).empty();
			$("#"+this.customSettings.upload_target+" .bar",dlg.template).attr("style","width:0%;");
		};
		//**进度条**//
		options.uploadProgress = function(file, bytesLoaded){
			try {
				var percent = Math.ceil((bytesLoaded / file.size) * 100);
				var progress = new FileProgress(file,  this.customSettings.upload_target);
				progress.setProgress(percent);
				if (percent === 100) {
					progress.toggleCancel(false, this);
				} else {
					progress.toggleCancel(true, this);
				}
				var dom = this.customSettings.upload_target;
				$(".progressName",dlg.template).hide();
				$("#"+dom+" .bar",dlg.template).attr("style","width:"+percent+"%;");
			} catch (ex) {
				this.debug(ex);
			}
		};
		
		options.container = this.container; 
		this.fileupload.init(options); 
		}
		
	FileProgress.prototype.toggleCancel = function (show, swfuploadInstance) {
		this.fileProgressElement.childNodes[0].style.visibility = show ? "visible" : "hidden";
		if (swfuploadInstance) {
			var fileID = this.fileProgressID;
			this.fileProgressElement.childNodes[0].onclick = function () {
				swfuploadInstance.cancelUpload(fileID);
				return false;
			};
		}
	};
	ReportEditList.prototype.uploadError = function(file, errorCode, message) {
		var imageName =  "error.gif";
		var progress;
		try {
			switch (errorCode) {
			case this.fileupload.UPLOAD_ERROR.FILE_CANCELLED:
				try {
					progress = new FileProgress(file,  this.customSettings.upload_target);
					progress.setCancelled();
					progress.setStatus("Cancelled");
					progress.toggleCancel(false);
				}
				catch (ex1) {
					this.debug(ex1);
				}
				break;
			case this.fileupload.UPLOAD_ERROR.UPLOAD_STOPPED:
				try {
					progress = new FileProgress(file,  this.customSettings.upload_target);
					progress.setCancelled();
					progress.setStatus("Stopped");
					progress.toggleCancel(true);
				}
				catch (ex2) {
					this.debug(ex2);
				}
			case this.fileupload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
				imageName = "uploadlimit.gif";
				break;
			default:
				alert(message);
				break;
			}
	
			addImage("images/" + imageName);
	
		} catch (ex3) {
			this.debug(ex3);
		}
}
	
	function fadeIn(element, opacity) {
	var reduceOpacityBy = 5;
	var rate = 30;	// 15 fps


	if (opacity < 100) {
		opacity += reduceOpacityBy;
		if (opacity > 100) {
			opacity = 100;
		}

		if (element.filters) {
			try {
				element.filters.item("DXImageTransform.Microsoft.Alpha").opacity = opacity;
			} catch (e) {
				// If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
				element.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + opacity + ')';
			}
		} else {
			element.style.opacity = opacity / 100;
		}
	}

	if (opacity < 100) {
		setTimeout(function () {
			fadeIn(element, opacity);
		}, rate);
	}
	}	
	function uploadComplete(file) {
	try {
		/*  I want the next upload to continue automatically so I'll call startUpload here */
		if (this.getStats().files_queued > 0) {
			this.startUpload();
		} else {
			var progress = new FileProgress(file,  this.customSettings.upload_target);
			progress.setComplete();
			progress.setStatus("All images received.");
			progress.toggleCancel(false);
		}
	} catch (ex) {
		this.debug(ex);
	}
	}
	/* ******************************************
	 *	FileProgress Object
	 *	Control object for displaying file info
	 * ****************************************** */
	
	function FileProgress(file, targetID) {
		this.fileProgressID = "divFileProgress1";
	
		this.fileProgressWrapper = document.getElementById(this.fileProgressID);
		if (!this.fileProgressWrapper) {
			this.fileProgressWrapper = document.createElement("div");
			this.fileProgressWrapper.className = "progressWrapper";
			this.fileProgressWrapper.id = this.fileProgressID;
	
			this.fileProgressElement = document.createElement("div");
			this.fileProgressElement.className = "progressContainer";
	
			var progressCancel = document.createElement("a");
			progressCancel.className = "progressCancel";
			progressCancel.href = "#";
			progressCancel.style.visibility = "hidden";
			progressCancel.appendChild(document.createTextNode(" "));
	
			var progressText = document.createElement("div");
			progressText.className = "progressName";
			progressText.appendChild(document.createTextNode(file.name));
	
			var progressBar = document.createElement("div");
			progressBar.className = "progressBarInProgress";
	
			var progressStatus = document.createElement("div");
			progressStatus.className = "progressBarStatus";
			progressStatus.innerHTML = "&nbsp;";
	
			this.fileProgressElement.appendChild(progressCancel);
			this.fileProgressElement.appendChild(progressText);
			this.fileProgressElement.appendChild(progressStatus);
			this.fileProgressElement.appendChild(progressBar);
	
			this.fileProgressWrapper.appendChild(this.fileProgressElement);
	
			document.getElementById(targetID).appendChild(this.fileProgressWrapper);
			fadeIn(this.fileProgressWrapper, 0);
	
		} else {
			this.fileProgressElement = this.fileProgressWrapper.firstChild;
			this.fileProgressElement.childNodes[1].firstChild.nodeValue = file.name;
		}
	
		this.height = this.fileProgressWrapper.offsetHeight;
	
	}
	FileProgress.prototype.setProgress = function (percentage) {
		this.fileProgressElement.className = "progressContainer green";
		this.fileProgressElement.childNodes[3].className = "progressBarInProgress";
		this.fileProgressElement.childNodes[3].style.width = percentage + "%";
	};
	FileProgress.prototype.setComplete = function () {
		this.fileProgressElement.className = "progressContainer blue";
		this.fileProgressElement.childNodes[3].className = "progressBarComplete";
		this.fileProgressElement.childNodes[3].style.width = "";
	
	};
	FileProgress.prototype.setError = function () {
		this.fileProgressElement.className = "progressContainer red";
		this.fileProgressElement.childNodes[3].className = "progressBarError";
		this.fileProgressElement.childNodes[3].style.width = "";
	
	};
	FileProgress.prototype.setCancelled = function () {
		this.fileProgressElement.className = "progressContainer";
		this.fileProgressElement.childNodes[3].className = "progressBarError";
		this.fileProgressElement.childNodes[3].style.width = "";
	
	};
	FileProgress.prototype.setStatus = function (status) {
		this.fileProgressElement.childNodes[2].innerHTML = status;
	};
	function uploadError(file, errorCode, message) {
	var imageName =  "error.gif";
	var progress;
	try {
		switch (errorCode) {
		case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
			try {
				progress = new FileProgress(file,  this.customSettings.upload_target);
				progress.setCancelled();
				progress.setStatus("Cancelled");
				progress.toggleCancel(false);
			}
			catch (ex1) {
				this.debug(ex1);
			}
			break;
		case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
			try {
				progress = new FileProgress(file,  this.customSettings.upload_target);
				progress.setCancelled();
				progress.setStatus("Stopped");
				progress.toggleCancel(true);
			}
			catch (ex2) {
				this.debug(ex2);
			}
		case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
			imageName = "uploadlimit.gif";
			break;
		default:
			alert(message);
			break;
		}

		addImage("images/" + imageName);

	} catch (ex3) {
		this.debug(ex3);
	}
	}
 
	})(V.Classes['v.views.report.reportManage.ReportEditList']);
},{plugins:['v.views.component.searchList','v.ui.dynamicGrid','v.ui.confirm','v.ui.alert',"v.ui.fileUpload"]});
