;V.registPlugin("v.views.backoffice.config.addConfig",function(){
	V.Classes.create({
		className:"v.views.backoffice.config.AddConfig",
		superClass:"v.views.component.Docket",
		init:function(){
            this.ns = "v.views.backoffice.config.addConfig";
			this.ACTION = {
					INIT:'njs-protype-conf!listDocket.action'
			}
			this.isEdit = true;
			this.attachmentFileTypeList = []
		}
	});
	(function(Plugin){
		Plugin.prototype.init = function(options){
			this.subscribe(this,this.EVENT.DOCKETFORM_INITED,function(data){
				var docketType = data.docketType;
				var form = data.form;
				this.initCustomEvent(docketType,form);
			});
			Plugin.superclass.init.call(this,options);
		}
		
		Plugin.prototype.initCustomEvent = function(docketType,form){
			
		}
		
		Plugin.prototype.save = function(docketType,cb){
			var _docket = this.docket[docketType];
			var entity = _docket.entity;
			var form = _docket.form;
			if(!form.validate()){
				return;
			}
			var list = _docket.list;
			var vals = form.getValues();
			var format = _docket.format;
			var type = _docket.type;
			//存主表，则docketId为空，非主表，则需传入主表ID。
			var docketId = null;
			if(type != this.TYPE.MAIN){
				docketId = this.docketId;
			}
			var platformNo = this.options.platformNo;
			if (platformNo != '') {
				entity['platformNo'] =  platformNo;
			} 
			var that = this;
			for(prop in vals){
				entity[prop] = vals[prop];
			}
			
			V.ajax({
				url:this.module+'/save.action',
				data:{docket:entity,docketType:docketType,docketId:docketId,cateCode:this.options.cateCode},
				success:function(data){
					if(data.fail){
						V.alert(data.fail);
					}else{
						V.alert('成功!');
					}
					cb&&cb();
				}
			})
		}
		
		Plugin.prototype.approve = function(){
			var that = this;
			var docketType = that.currentDocketType
			var _docket = that.docket[docketType];
			var entity = _docket.entity;
			var form = _docket.form;
			if(!form.validate()){
				return;
			}
			var list = _docket.list;
			var vals = form.getValues();
			var type = _docket.type;
			var docketId = '';
			if(type != that.TYPE.MAIN){
				docketId = that.docketId;
			}
			for(prop in vals){
				entity[prop] = vals[prop];
			}
			
			var mask = V.mask($('.tab-pane:eq(0)',this.template));
			V.ajax({
				url:this.module+'/loaner-reg!approve.action',
				data:{docket:entity,docketType:docketType,docketId:docketId},
				success:function(data){
					V.unMask(mask);
					if(data.fail){
						V.alert(data.fail);
					}else{
						V.alert('success!');
						V.MessageBus.publish({eventId:'backCrumb'});
					}
					
				},
				error:function(){
					V.unMask(mask);
				}
			})
		}
		
		Plugin.prototype.draft = function(){
			var that = this;
			var docketType = that.currentDocketType
			var _docket = that.docket[docketType];
			var entity = _docket.entity;
			var form = _docket.form;
			if(!form.validate()){
				return;
			}
			var list = _docket.list;
			var vals = form.getValues();
			var type = _docket.type;
			var docketId = '';
			if(type != that.TYPE.MAIN){
				docketId = that.docketId;
			}
			for(prop in vals){
				entity[prop] = vals[prop];
			}
			
			var mask = V.mask($('.tab-pane:eq(0)',this.template));
			V.ajax({
				url:this.module+'/loaner-reg!draft.action',
				data:{docket:entity,docketType:docketType,docketId:docketId},
				success:function(data){
					V.unMask(mask);
					if(data.fail){
						V.alert(data.fail);
					}else{
						V.alert('success!');
						that.docketId = data.id;
						that.detailListFilter.docketId= data.id;
						_docket.entity = data;
						form.setRecord(_docket.entity);
						form.repaint();
					}
				},
				error:function(){
					V.unMask(mask);
				}
			})
		}
		Plugin.prototype.print = function(){
			
			var form_print = $('#loanerReg_print_form').empty();
			if(form_print.length==0){
				form_print = $('<form action="print!print.action" type="POST" id="loanerReg_print_form" style="display:none"></form>');
				$('body').append(form_print);
			};
			var input = $('<input type="hidden" name="docketId" value='+this.docketId+'>');
			var input1 = $('<input type="hidden" name="docketType" value="loanerReg">');
			form_print.append(input);
			form_print.append(input1);
			form_print[0].submit();
		}
		Plugin.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'创建种类'}});
		}
		Plugin.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'创建种类'}});
		}
	})(V.Classes['v.views.backoffice.config.AddConfig']);
},{plugins:["v.views.component.docket","v.ui.dialog","v.component.blockForm"]})