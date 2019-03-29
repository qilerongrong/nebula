/**
 * 报表浏览 - 中心企业
 */
;V.registPlugin("v.views.report.reportManage.viewReport",function(){
	V.Classes.create({
		className:"v.views.report.reportManage.ViewReport",
		superClass:"v.Plugin",
		init:function(){
			this.module = "";
			this.record = {};
			this.pageIndex = 0;
			this.pageCount = 0;
            this.ns = 'v.views.report.reportManage.viewReport';
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
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					that.initParameter();
					that.initIframe();
					that.initEvent();
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
			if(parameters == '' || parameters == undefined){return;}
			var Form = V.Classes['v.component.Form'];
			this.form = new Form();
			var items =[];
			$.each(parameters,function(){
				if(this.type != undefined && this.type != ''){
					if(this.type == V.Classes['v.component.Form'].TYPE.SELECT || this.type == V.Classes['v.component.Form'].TYPE.CHECKBOX){
						var multiList = [];
						if(this.value != undefined && this.value.values != undefined){
							$.each(this.value.values,function(){
								multiList.push([this.text,this.value]);
							});
						}
					 	items.push({label:this.desc,type:this.type,name:this.name,required:this.required,value:'',multiList:multiList});
					}else if(this.type == V.Classes['v.component.Form'].TYPE.PLUGIN){
						if(this.value != undefined && this.value.value != undefined){
							var name = this.name;
							items.push({label:this.desc,type:this.type,name:that.getName(this.name),value:'',required:this.required,plugin:this.value.value});
						}
					}else{
						items.push({label:this.desc,type:this.type,name:this.name,value:(this.value||''),required:this.required});
					}
				}
			});
			
			this.form.init({
				container : $('.form-search',that.container),
				colspan:2,
				items:items
			});
			
			var button = $('<div class="row-fluid" style="text-align:center"><button class="btn btn-primary btn-search">查询</button></div>');
			$(".btn-search",button).click(function(){
				var params = that.getParamsUrl();
				if(params != ''){
					that.getDate(params);
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
				var params = that.getParamsUrl();
				if(params != ''){
					that.pageIndex -= 1;
					if(that.pageIndex <0){that.pageIndex = 0;}
					if (that.pageIndex < that.pageCount) {
						$('.jumptopage',that.container).val(that.pageIndex+1);
						that.getDate(params + "&pageIndex=" + that.pageIndex);
					}
				}
			});
			
			/**下一页**/
			$(".v_pagination .next_page").click(function(){
				var params = that.getParamsUrl();
				if(params != ''){
					that.pageIndex += 1;
					if(that.pageIndex < that.pageCount){
						 $('.jumptopage',that.container).val(that.pageIndex+1);
						 that.getDate(params+"&pageIndex="+that.pageIndex);
					}
				}
			});
			$(".v_pagination",that.container).eq(1).hide();
		};
		ViewReport.prototype.getDate = function(params){
			var that = this;
			var baseurl = 'reportService/reportServlet.do?cmd=run&id='+this.record['id'];
			 var url = baseurl+params;
					 $.ajax({
						url:url,
						type:'post',
						success:function(data_url){
							if(data_url != undefined && data_url.result == true){
								that.pageCount = data_url.pageCount;
								 $(".totalpages",that.container).text("共"+data_url.pageCount+"页");
								$.ajax({
									url:data_url.url,
									dataType:'html',
									success:function(dom){
										 $(".v_pagination",that.container).show();
										 $(".reporttitle",that.container).text(that.record["reportTitle"]);
										 $(".listreport",that.container).empty().append(dom);
										 $(".listreport table tr td",that.container).each(function(){
										 	if($(this).attr("width") == "50%"){
												$(this).remove();
											}
										 })
										 $(".listreport table",that.container).attr("style","width:100%");
										 $(".listreport table table",that.container).addClass("table").addClass("table-striped").addClass("table-bordered").addClass("table-condensed");
										 $(".listreport table table tr",that.container).each(function(){
										  		if($(this).attr("valign") != "top"){
													$(this).remove();
												}
										 })
										 $(".listreport table table tr",that.container).each(function(){
										  		$(this).find("td:first-child").remove();
												$(this).find("td:last-child").remove();
										 })
										 $(".listreport table table tr:first-child  td",that.container).addClass("gridreport"); 
										 $(".listreport table table span",that.container).attr("style","");
									}
							     });
							}
						}
					})
		}
		
		ViewReport.prototype.getParamsUrl = function(){
			var that = this;
			var flag = true;
			var params = "";
			$.each(that.form.options.items,function(){
					var value = $('[name='+this.name+']',that.form.template).val()||'';
					var name = this.name;
					var desc = this.label;
					if(this.type == V.Classes['v.component.Form'].TYPE.PLUGIN){
						var value = $('[name='+name+'Code]',that.form.template).val()||'';
						name = that.getName(name);
					}else if( this.type == V.Classes['v.component.Form'].TYPE.CHECKBOX){
						value = $('[name='+name+']',that.form.template).attr("checked")||'';
						if(value == 'checked'){value = '1'}
					}
					if(!that.validate(this,value)){
						V.alert(desc+"为必填项!");
						flag = false;
						return false;
					}
					params += "&p_" + name + "=" + value;
				});
			if(flag){
				return params;
			}else{
				return "";
			}
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
		ViewReport.prototype.initIframe = function(){
			 
			 
		};
		ViewReport.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'报表详情'}});
		}
	})(V.Classes['v.views.report.reportManage.ViewReport']);
},{plugins:['v.ui.tree']})