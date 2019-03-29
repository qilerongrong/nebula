;V.registPlugin("v.views.tools.dataModify.dataModifyList",function(){
	V.Classes.create({
		className:"v.views.tools.dataModify.DataModifyList",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.tools.dataModify.dataModifyList";
			this.form = new V.Classes['v.component.Form']();
			this.filters = {};
			this.options={};
			this.platformNo = null;
			this.customModule = 'backoffice/systemsetting/custom';
			this.dataModule = 'backoffice/datamodify/all';
			this.template = $('<div class="data-modify"><div class="well form-search"></div></div>');
		}
	});
	(function(PluginClass){
		PluginClass.prototype.init = function(options){
			var that = this;
			this.module = options.module;
			this.container = options.container;
			for(prop in options){
			    this.options[prop] = options[prop];
			}
			this.form.container = $('.form-search',this.template);
			this.container.append(this.template);
			
			this.initEvent();

			this.initForm();
		}
		PluginClass.prototype.initEvent = function(options){
			var that = this;
			$('[name=moduleId]',this.template[0]).live('change',function(){
				var moduleCode = this.value;
				var multiList = [];
				var docketType = that.form.getElement('docketType');
				docketType.empty();
				that.getDocketType(moduleCode,multiList);
				$.each(multiList,function(index){
					var opt = $('<option value="'+this[1]+'">'+this[0]+'</option>');
					docketType.append(opt);
				})
			});
			$('[name=platformNo]',this.template[0]).live('change',function(){
				that.platformNo = this.value;

				var systemModules = [];
				var docketTypes = [];

				that.getModuleType(systemModules,docketTypes);
				
				var moduleType = that.form.getElement('moduleId').empty();
				$.each(systemModules,function(index){
					var opt = $('<option value="'+this[1]+'">'+this[0]+'</option>');
					moduleType.append(opt);
				})

				var docketType = that.form.getElement('docketType').empty();
				$.each(docketTypes,function(index){
					var opt = $('<option value="'+this[1]+'">'+this[0]+'</option>');
					docketType.append(opt);
				})

				that.queryPlatformDictInfo(this.value);
			});
		}
		PluginClass.prototype.initForm = function(options){
			var that = this;
			var Form = V.Classes['v.component.Form'];
			
			var partyList = [];
			var systemModules = [];
			var docketTypes = [];
			
			this.getParty(partyList);

			this.getModuleType(systemModules,docketTypes);

			var items = [{
					'label':'主体',
					'type':Form.TYPE.SELECT,
					'name':'platformNo',
					'value':'',
					'multiList':partyList,
					'notip':true
				},{
					'label':'系统模组',
					'type':Form.TYPE.SELECT,
					'name':'moduleId',
					'value':'',
					'multiList':systemModules,
					'notip':true
				},{
					'label':'单据类型',
					'type':Form.TYPE.SELECT,
					'name':'docketType',
					'multiList':docketTypes,
					'value':'',
					'notip':true
				},{
					'label':'单据编码',
					'type':Form.TYPE.TEXT,
					'name':'docketCode',
					'required':true,
					'value':''
				}];

			var itemsFilters = that.options.itemsFilters;
			if(itemsFilters){
				$.each(items,function(m,item){
					var key = item.plugin||item.name;
					item.value = itemsFilters[key]||'';
				});
			}
			that.form.init({
				colspan:2,
				items:items
			});
			
			var btn_search = $('<button class="btn btn-primary btn-search">查询</button>');
			btn_search.click(function(){
				that.search();
			});
			$('.form-search',that.template).append($('<div class="row-fluid btns" style="text-align:center"></div>').append(btn_search));		
		}
		PluginClass.prototype.getModuleType = function(systemModules,docketTypes){
			var that = this;
		     $.ajax({
			 	url:this.customModule+'/custom!queryModule.action',
				dataType:'json',
				async:false,
				success:function(data){
					$.each(data,function(index){
						systemModules.push([this.moduleName,this.moduleCode]);
						if(index==0){
							that.getDocketType(this.moduleCode,docketTypes);
						}
					})
				}
			 });
		};
		PluginClass.prototype.getDocketType = function(moduleCode,docketTypes){
			$('.ticketsType',this.template).empty();
			var that = this;
		    $.ajax({
			 	url:this.customModule+'/custom!init.action',
				dataType:'json',
				async:false,
				data:{moduleCode:moduleCode,platformNo:this.platformNo},
				success:function(data){
					$.each(data,function(index){
						docketTypes.push([this.name,this.value]);
					})
				}
			});
		};
		PluginClass.prototype.getParty = function(partyList){
			$('.ticketsType',this.template).empty();
			var that = this;
		    $.ajax({
			 	url:this.dataModule+'/data-modify!partyList.action',
				dataType:'json',
				async:false,
				data:{},
				success:function(data){
					$.each(data,function(index){
						partyList.push([this.partyName,this.platformNo]);
						if(index==0){
							that.platformNo = this.platformNo;
							that.queryPlatformDictInfo(that.platformNo);
						}
					})
				}
			});
		};
		PluginClass.prototype.search = function(){
			var that = this;
		    if(!this.form.validate()) return; 
		    
		    var filters =  this.form.getValues();

		    V.ajax({
			 	url:this.dataModule+'/data-modify!getEntity.action',
				dataType:'json',
				data:{filterList:filters},
				success:function(data){
					var options = that.options;
					options.module = "common/docket";
					options.docketId = data.id;
					options.variables.docketType = data.docketType;
					options.platformNo = that.platformNo;
					that.forward('v.views.commonDocket.commonDocketEdit',options,function(inst){
						inst.addCrumb();
					});
				}
			});
		}
		PluginClass.prototype.queryPlatformDictInfo = function(platformNo){
        	var that = this;
        	try{
        		var dict = eval('d'+platformNo);
        		DictInfo.platformNo = platformNo;
        	}catch(e){
        		$.ajax({
    				url : 'common!queryDictByPlatform.action',
    				async:false,
    				dataType : 'json',
    				data:{platformNo:platformNo},
    				success : function(data){
    					eval(data);
    					DictInfo.platformNo = platformNo;
    				}
    			});
        	}
        }
		PluginClass.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:"数据修改"}});
		}
		PluginClass.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:"数据修改"}});
		}
	})(V.Classes['v.views.tools.dataModify.DataModifyList']);
},{plugins:[]})