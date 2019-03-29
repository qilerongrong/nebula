;V.registPlugin("v.module.report.reportManage.viewReport",function(){
	V.Classes.create({
		className:"v.module.report.reportManage.ViewReport",
		superClass:"v.Plugin",
		init:function(){
			this.module = "";
			this.record = {};
			this.pageIndex = 0;
			this.pageCount = 0;
			this.reportUrl = "";
			this.reportRenderType = "";//HTML,ECHART
			this.reports = [];//{pageIndex:0,pageCount:0,reportUrl:url}
            this.ns = 'v.module.report.reportManage.viewReport';
            this.reportFrame = new V.Classes['v.ui.Frame']();
			this.resource = {
				html:'template.html'
			}
		}
	});
	(function(ViewReport){
		ViewReport.prototype.init = function(options){
			this.module = options.module;
			this.container = options.container;
			this.record = options.record;
			this.reportRenderType = this.record.type;
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					that.initParameter();
					that.initEvent();
					$(".reporttitle",that.container).text(that.record["reportTitle"]);
				}
		     });
		};
		ViewReport.prototype.initEvent = function(){
			var that = this;
		 	this.addCrumb();
			
		};
		ViewReport.prototype.initParameter = function(){
			var that = this;
			var parameters = this.record.parameters;
			if(parameters === '' || parameters == undefined || parameters == null){return;}
			var Form = V.Classes['v.component.Form'];
			this.form = new V.Classes['v.component.BlockForm']();
			var items =[];
			var group = '';
			$.each(parameters,function(){
				if(this.type != undefined && this.type != ''){
					if(group!=this.group && this.group){
						items.push({label:this.group,isBlock:true});
						group = this.group
					}
					var paramVal = this.value||{};
					if(this.type == Form.TYPE.SELECT || this.type == Form.TYPE.CHECKBOXGROUP){
						var multiList = [];
						if(this.value != undefined && paramVal.values != undefined){
							$.each(paramVal.values,function(){
								multiList.push([this.text,this.value]);
							});
						}
					 	items.push({label:this.desc,type:this.type,name:this.name,required:this.required,value:paramVal.value,multiList:multiList});
					}else if(this.type == Form.TYPE.CHECKBOX){
					    var multiList = [];
					    multiList.push(['',paramVal.value]);
					    items.push({label:this.desc,type:this.type,name:this.name,required:this.required,value:paramVal,multiList:multiList});
					}else if(this.type == Form.TYPE.PLUGIN){
						if(paramVal != undefined && paramVal.value != undefined){
							var name = this.name;
							items.push({label:this.desc,type:this.type,name:that.getName(this.name),value:'',required:this.required,plugin:paramVal.value});
						}
					}else{
						items.push({label:this.desc,type:this.type,name:this.name,value:(paramVal.value||''),required:this.required});
					}
				}
			});
			
			this.form.init({
				container : $('.form-search',that.container),
				colspan:2,
				items:items
			});
			
			var button = $('<div class="row-fluid" style="text-align:center"><button class="btn btn-primary btn-search">'+this.getLang("BTN_SEARCH")+'</button></div>');
			$(".btn-search",button).click(function(){
				var params = that.getParamsUrl();
				// if(params != ''){
					that.runReport(params);
				// }
			});
			$(".download",that.container).click(function(){
				var params = that.getParamsUrl();
				// if(params != ''){
					var baseurl = 'reportService/reportServlet.do?cmd=print&format=XLS&id='+that.record['id'];
					$('.form_content').remove();
					$('<div class="form_content" style="display:none"></div>').appendTo('body');
					var form = $('<div><form name="customform" id="customform" method="POST" action=""></form></div>');
					$('body .form_content').append(form);
					$("#customform").attr("action",baseurl+params);
					$("#customform").submit();
				// }
			});
			$(".back",that.template).click(function(){
				that.reports.shift();
				var report = that.reports[0];
				if(that.reports.length == 1){
					$(this).hide();
				}
				that.renderReport(report);
			});
			$('.form-search',that.container).append(button);
			/**上一页**/
			$(".v_pagination .pre_page").click(function(){
				that.gotoPage(that.pageIndex-1);
			});
			
			/**下一页**/
			$(".v_pagination .next_page").click(function(){
				that.gotoPage(that.pageIndex+1);
			});
			
			/**首页**/
			$(".v_pagination .first_page").click(function(){
				that.gotoPage(1);
			});
			
			/**尾页**/
			$(".v_pagination .last_page").click(function(){
				that.gotoPage(that.pageCount);
			});
			$('.jumptopage',this.template).keydown(function(event){
				var code = event.keyCode;
				if((code<48||code>57)&&(code<96||code>105)&&code!=8&&code!=13){//增加小键盘数字事件
					return false;
				}else if(code == 13){
					var p =this.value;
					if(p){
						that.gotoPage(parseInt(p));
					}
				}
			})
			$(".v_pagination",that.container).eq(1).hide();
		};
		ViewReport.prototype.gotoPage = function(pageIndex){
			if(pageIndex<1){
				pageIndex = 1;
			}else if(pageIndex>this.pageCount){
				pageIndex = this.pageCount;
			}
			$('.jumptopage',this.container).val(pageIndex);
			if(this.pageIndex == pageIndex){
				return;
			}
			this.pageIndex = pageIndex;
			var index = this.reportUrl.lastIndexOf("_");
			var prefix = this.reportUrl.substring(0,index+1);
			var url = prefix + (pageIndex-1) + ".html";
			this.getReport(url);
		}
		ViewReport.prototype.runReport = function(params){
			var that = this;
			if(!this.form.validate()) return;
			var baseurl = 'reportService/reportServlet.do?cmd=run&id='+this.record['id'];
			 var url = baseurl+params;
			 $.ajax({
				url:url,
				success:function(data_url){
					if(data_url != undefined && data_url.result == true){
						that.renderReport(data_url);
					}
				}
			})
		};
		ViewReport.prototype.runHyperlinkReport = function(url){
			var that = this;
			$.ajax({
				url:url,
				success:function(data){
					that.pageCount = data.count;
					that.reportUrl = data.url;
					that.pageIndex = 1;
					var report = {
						pageIndex:1,
						pageCount:data.count,
						reportUrl:data.url
					}
					that.reports.unshift(report);
					that.renderReport(report);
					$(".back",that.template).show();
				}
			});
		}
		ViewReport.prototype.renderReport = function(data){
			var that = this;
			that.pageCount = data.count;
			that.reportUrl = data.url;
			that.pageIndex = 1;
			if(data.count <= 1){
				$('.grid_pagination',this.template).hide();
			}
			var report = {
				pageIndex:1,
				pageCount:data.count,
				reportUrl:data.url
			}
			that.reports.push(report);
			that.reportFrame.init({
				container:$('.listreport',that.template)
			});
			this.render(report);

		}
		/**
		 * 用echart展示报表
		 * @return {[type]} [description]
		 */
		// ViewReport.prototype.renderEchart  = function(serverData){
		// 	var data = serverData.data;
		// 	var url = serverData.url;
		// 	var pluginNs = serverData.plugin;
		// 	var that = this;
		// 	V.loadJS(url,function(){
		// 		var glass = V._registedPlugins[pluginNs].glass;
		// 	    var inst = new V.Classes[glass]();
		// 	    inst.init({
		// 	    	container:$('.list',that.tempalte),
		// 	    	data:data
		// 	    });
		// 	})
		// }
		/**
		 * 用iframe展示jasperReport
		 * @return {[type]} [description]
		 */
		ViewReport.prototype.render = function(report){
			$(".download",this.container).show();
			$(".totalpages",this.container).text(this.getLang("TEXT_TOTAL")+" "+report.pageCount+" "+this.getLang("TEXT_PAGE"));
			this.getReport(report.reportUrl);
		}
		ViewReport.prototype.getReport = function(reportUrl){
			this.reportFrame.setUrl(reportUrl);
			return;
			var that = this;
			$.ajax({
				url:reportUrl,
				dataType:'html',
				success:function(dom){
					var con = $('<div></div>').append($('table:first',dom));
					if(that.record.type.toLowerCase()=="jor"){
						$('div:first',con).remove() //标题div
						$(".listreport",that.container).empty().append(con);
						$(".listreport table",that.container).attr("style","width:100%").css('border','1px solid #ddd');
					 	$(".listreport table",that.container).addClass("table").addClass("table-striped").addClass("table-bordered").addClass("table-condensed");
						$(".listreport table tr:first-child td",that.container).addClass("jor_grid_report");
						$(".listreport table span",that.container).attr("style","");
						$(".listreport table p",that.container).css("margin","0 0");
						//处理报表链接;目前只支持简表
						$('*[title^="/b2bchina/reportService/"]',con).click(function(){
							var url = $(this).data('data-url');
							that.runHyperlinkReport(url);
						})
						$('*[title^="/b2bchina/reportService/"]',con).each(function(){
							var url = $(this).attr('title');
							$(this).attr('title','点击查看报表').data('data-url',url);
						});
					 }
					 else{
					 	$(".listreport",that.container).empty().append(con);
						$(".listreport table tr td",that.container).each(function(){
							if($(this).attr("width") == "50%"){
								$(this).remove();
							}
						})
						$(".listreport table",that.container).attr("style","width:100%");
						$(".listreport table",that.container).addClass("table").addClass("table-striped").addClass("table-bordered").addClass("table-condensed").css('border','1px solid #ddd');
						/*
						$(".listreport table table tr",that.container).each(function(){
							if($(this).attr("valign") != "top"){
								$(this).remove();
							}
						})
						*/
						$('td[valign=top]',that.container).children('div').remove();
						/*
						$(".listreport table table tr",that.container).each(function(){
						  		$(this).find("td:first-child").remove();
								$(this).find("td:last-child").remove();
						})
						*/
						$(".listreport table table tr:first-child  td",that.container).addClass("gridreport"); 
						$(".listreport table table span",that.container).attr("style","");
					}
				}
		    });
		};
		ViewReport.prototype.getParamsUrl = function(){
			var that = this;
			var params = "";
			
			if(!this.form.validate()) return params;
			var filterList = this.form.getValues();
			for(key in filterList){
				params += "&p_" + key + "=" + filterList[key];
			}
			return params;
		}
		ViewReport.prototype.validate = function(th,value){
			if(th.required == 'true'){
				if(value =='' || value == null || value == undefined){
					return false;
				}else{
					return true;
				}
			}
			return true;
		}
		ViewReport.prototype.getName = function(name){
			 if(name == 'supplierCode'){
			 	return "buyer";
			 }else if(name == 'buyer'){
			 	return "supplierCode";
			 }else{
			 	return name;
			 }
		}
		ViewReport.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_REPORT_DETAIL")}});
		}
	})(V.Classes['v.module.report.reportManage.ViewReport']);
},{plugins:['v.component.blockForm','v.ui.tree','v.ui.frame']})