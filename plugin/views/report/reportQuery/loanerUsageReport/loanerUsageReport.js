;V.registPlugin("v.views.report.reportQuery.loanerUsageReport",function(){
	V.Classes.create({
		className:"v.views.report.reportQuery.LoanerUsageReport",
		superClass:"v.Plugin",
		init:function(){
			this.module = "";
			this.record = null;
			this.pageIndex = 0;
			this.pageCount = 0;
			this.reportUrl = "";
            this.ns = 'v.views.report.reportQuery.loanerUsageReport';
			this.resource = {
				html:'template.html'
			}
		}
	});
	(function(Plugin){
		Plugin.prototype.init = function(options){
			this.module = options.module;
			this.container = options.container;
//			this.record = options.record;
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.initReport();
					that.template = $(dom);
					that.container.append(that.template);
				}
		     });
		};
		
		Plugin.prototype.initReport = function(){
			var that = this;
			$.ajax({
				url:that.module + '/report!reportByName.action',
//				data:{reportName:'loaner_car_use_rate'},
				data:{reportName:'loaner_car_use_rate2_for_dealer'},
				success:function(report){
					that.record = report;
					that.initParameter();
					that.initEvent();
				}
			})
		};
		Plugin.prototype.initEvent = function(){
			var that = this;
		 	this.addCrumb();
			
		};
		Plugin.prototype.initParameter = function(){
			var that = this;
			var parameters = this.record.parameters;
			if(parameters == '' || parameters == undefined){return;}
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
				if(params != ''){
					that.runReport(params);
				}
			});
			$(".download",that.container).click(function(){
				var params = that.getParamsUrl();
				if(params != ''){
					var baseurl = 'reportService/reportServlet.do?cmd=print&id='+that.record['id'];
					$('.form_content').remove();
					$('<div class="form_content" style="display:none"></div>').appendTo('body');
					var form = $('<div><form name="customform" id="customform" method="POST" action=""></form></div>');
					$('body .form_content').append(form);
					$("#customform").attr("action",baseurl+params);
					$("#customform").submit();
				}
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
		Plugin.prototype.gotoPage = function(pageIndex){
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
			var url = prefix + pageIndex + ".html";
			this.getReport(url);
		}
		Plugin.prototype.runReport = function(params){
			var that = this;
			var baseurl = 'reportService/reportServlet.do?cmd=run&id='+this.record['id'];
			 var url = baseurl+params;
			 $.ajax({
				url:url,
				success:function(data_url){
					if(data_url != undefined && data_url.result == true){
						that.pageCount = data_url.count;
						that.reportUrl = data_url.url;
						that.pageIndex = 1;
						$(".totalpages",that.container).text(that.getLang("TEXT_TOTAL")+" "+data_url.count+" "+that.getLang("TEXT_PAGE"));
						$(".download",that.container).show();
						$(".reporttitle",that.container).text(that.record["reportTitle"]);
						that.getReport(data_url.url);
					}
				}
			})
		};
		Plugin.prototype.getReport = function(reportUrl){
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
		Plugin.prototype.getParamsUrl = function(){
			var that = this;
			var params = "";
			
			if(!this.form.validate()) return params;
			var filterList = this.form.getValues();
			for(key in filterList){
				params += "&p_" + key + "=" + filterList[key];
			}
			
			return params;
		}
		Plugin.prototype.validate = function(th,value){
			if(th.required == 'true'){
				if(value =='' || value == null || value == undefined){
					return false;
				}else{
					return true;
				}
			}
			return true;
		}
		Plugin.prototype.getName = function(name){
			 if(name == 'supplierCode'){
			 	return "buyer";
			 }else if(name == 'buyer'){
			 	return "supplierCode";
			 }else{
			 	return name;
			 }
		}
		Plugin.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_REPORT_DETAIL")}});
		}
	})(V.Classes['v.views.report.reportQuery.LoanerUsageReport']);
},{plugins:['v.component.blockForm','v.ui.tree']})