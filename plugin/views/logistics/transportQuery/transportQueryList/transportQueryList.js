;V.registPlugin("v.views.logistics.transportQuery.transportQueryList",function(){
	V.Classes.create({
		className:"v.views.logistics.transportQuery.TransportQueryList",
		superClass:"v.views.commonDocket.CommonDocketList",
		init:function(){
            this.ns = 'v.views.logistics.transportQuery.transportQueryList';
			this.module = '';
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.DynamicGrid']();
		}
	});
	(function(List){
		List.prototype.initConditionForm = function(){
			this.initMenuCondition({'tableType':'header'});
		}
		
		List.prototype.initList = function(){
			var that = this;
			var list = this.list;
			list.setActionColumn({
				displayName: "操作",
				key: 'action',
				width: 80,
				render: function(record){
					var html = $('<div class="action"><a class="view" href="javascript:void(0);" title="查询"><i class="icon-search"></i></a><div>');
					$('.view', html).click(function(){
						that.viewDetail(record);
					});
					return html;
				}
			});
			var pagination = new V.Classes['v.ui.Pagination']();
		    list.setPagination(pagination);
		    list.setFilters(this.options.filters);
		    
		    this.subscribe(list,list.EVENT.INITED,function(data){
		    	var actions = data.actions;
		    	var tools = [];
		    	//tools.push({eventId:'add',text:"新增",icon:'icon-plus'});
		    	//tools.push({eventId:'remove',text:'批量删除',icon:'icon-remove'});
		    	tools.push({eventId:'export',text:'导出',icon:'icon-export-excel'});
		    	list.addTools(tools);
		    });
		    
			list.init({
				url: this.module+'/transport!init.action',
				hasData : true,
				sortable:false,
				checkable:false
			});
			this.subscribe(list,'add',this.add);
			//this.subscribe(list,'remove',this.removeSelected);
			this.subscribe(list,'export',this.exportWithDetail);
		}
		//导出
		List.prototype.exportWithDetail = function(){
			//加提示
			var pagination = this.list.pagination;
			if (pagination.options.count > 200000) {
				V.alert(this.getLang("MSG_EXPORT_LARGER_20000"));
				return;
			}
			
			var form_print = $('.riskred_export_form',this.template).empty();
			if(form_print.length==0){
			    form_print = $('<form action="logistics/transport/transport!export.action" type="POST" class="riskred_export_form" style="display:none"></form>');
			}
			$.each(this.list.filters,function(prop,val){
				var input = $('<input type="hidden" name="'+prop+'" value="'+val+'">');
				form_print.append(input);
			});
			var input = $('<input type="hidden" name="managerOrQuery" value="query">');
			form_print.append(input);
			var docketType = $('<input type="hidden" name="docketType" value="TRANSPORT">');
			form_print.append(docketType);
			this.template.append(form_print);
			form_print[0].submit();
		}
		
		
		List.prototype.viewDetail = function(record) {
			var options = this.options;
			options.module = this.module;
			options.record =  record;
			options.docketId = record.id;
			options.id=record.id;
			options.variables.transType = record.transType; 
			options.hasDetail = this.list.hasDetail;
			this.forward('v.views.logistics.transportQuery.transportQueryView',options,function(inst){
				inst.addCrumb();
			});
		}
		
		
		List.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:"运输单查询"}});
		}
		List.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:"运输单查询"}});
		}
	})(V.Classes['v.views.logistics.transportQuery.TransportQueryList']);
},{plugins:['v.views.commonDocket.commonDocketList','v.ui.dynamicGrid','v.ui.confirm','v.ui.alert']});