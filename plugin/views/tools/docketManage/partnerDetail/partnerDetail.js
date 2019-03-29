;V.registPlugin("v.views.tools.docketManage.partnerDetail",function(){
	V.Classes.create({
		className:"v.views.tools.docketManage.PartnerDetail",
		superClass:"v.Plugin",
		init:function(){
			this.partner = null;
			this.user = null;
			this.menus = null;
			this.files=null;
			this.post = {};
			this.module = "";
			this.record = {};
			this.crumbsName = "供应商详情";
			this.ns = 'v.views.tools.docketManage.partnerDetail';
			this.resource = {
			    html:'template.html'
			}
		}
	});
	(function(partnerEdit){
		partnerEdit.prototype.init = function(options){
			var that = this;
			this.module = options.module;
			this.container = options.container;
			this.options = options;
			this.record = options.record;
			this.partner = options.record;
			this.platformNo = options.platformNo;
			
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					that.initFormInfo(that.record);
				}
			})
		}
	  partnerEdit.prototype.initFormInfo = function(record){
	  	var that = this;
	  	var partnerId=""
	  	var isBuyer = (LoginInfo.user.businessRole == LoginInfo.businessRole.ENTERPRISE);
	  	if(record!=null){
	  		partnerId=record['id'];
	  	}
	  	
  		var tax_limit_sel = $('#invoiceLimit',that.template);
  		$.each(DictInfo.getVar('INVOICE_LIMIT',that.platformNo),function(prop,val){
  			var option = $('<option value='+prop+'>'+val+'万元</option>');
  			tax_limit_sel.append(option);
  		});
	  	
		V.ajax({
        	url:that.module+'/modify-taxno!input.action',
           	type:'post',
			data: {id: partnerId},
            success:function(data){
				 if(data!=undefined){
                    var partner = data;
                    $('*[partner-data-key]',that.template).each(function(index,item){
                        var key = $(this).attr('partner-data-key');
                        var value = partner[key]||'';
                        var type = $(this).attr('data-type');
                        if(type=='select'){
                        	$('.edit_input',this).val(value);
                        	$('.view_text',this).text($('.edit_input',this).find('option:selected').text());
                        }else{
                            if(key=='extractType'&&value!=null){
                            	var types = value.split(',');
                            	$.each(types,function(){
                            	    $('input[value='+this+']',item).attr('checked',true);
                            	})
                            }else{
                            	$('.view_text',this).text(value);
                                //$('.edit_input',this).val(value);
                            }
                        }
                        $('.view_text',this).css('padding-top','2px');
                    });
                    that.initBusinessType(that.template);
                    that.initAccreditationType(that.template);
                 }
            }
        })
	}
	  
	//获取经营方式
    partnerEdit.prototype.initBusinessType = function(context){
    	 var that = this;
         $.ajax({
             url:that.module+"/modify-taxno!listBusinessType.action",
             type:'post',
             data:{id:that.partner['id'],platformNo:that.platformNo},
             dataType:'json',
             success:function(data){
             	var dom = $('*[partner-data-key=businessType]',that.template);
             	var selected = that.partner.businessType||'';
             	selected = selected.split(',');
             	$.each(data,function(index,d){
             		var name = data[index].dictname;
             		var value = data[index].dictcode;
             		var flag = $.inArray(value,selected);
             		if(flag!=-1){
             			checkbox = '<input type="checkbox" value='+value +' checked disabled >&nbsp;';
             		}else{
             			checkbox = '<input type="checkbox" value='+value +' disabled >&nbsp;';
             		}
             		var item = '<span>'+ name + '</span>&nbsp;';
             		dom.append(checkbox).append(item);
             	})
             }
         })
    }
    //获取认证方式
    partnerEdit.prototype.initAccreditationType = function(context){
        var that = this;
        var sel = $('*[partner-data-key=accreditationType]',context).find('select');
        var accType = DictInfo.getVar('ACCREDITATION_TYPE',that.platformNo);
        for(key in accType){
            var name = accType[key];
            var opt = $('<option value=' + key + '>' + name + '</option>');
            sel.append(opt);
        }
        
        var accreditationType = that.partner['accreditationType'];
        sel.val(accreditationType);
        sel.next().text(sel.find('option:selected').text());
    }
    partnerEdit.prototype.addCrumb = function(){
		V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.crumbsName}});
	}
	})(V.Classes['v.views.tools.docketManage.PartnerDetail']);
},{plugins:["v.ui.step","v.ui.tree",'v.component.fileUpload',"v.views.backoffice.authority.postControlPoint","v.ui.grid","v.ui.dialog","v.component.form","v.views.component.authoritySetting"]});