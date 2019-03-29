/*
 * 发票查询--发票查询详情(运维管理)
 */
;V.registPlugin("v.views.tools.invoiceManage.invoiceDetail",function(){
    V.Classes.create({
        className:"v.views.tools.invoiceManage.InvoiceDetail",
        superClass:"v.Plugin",
        init:function(){
            this.ns = "v.views.tools.invoiceManage.invoiceDetail";
            this.module = '';
            this.resource = {
                html:'template.html'
            }
        }
    });
    (function(InvoiceDetailList){
        InvoiceDetailList.prototype.init = function(options){
            this.container = options.container;
            this.module = options.module;
            this.invoice = options.invoice;
            var that = this;
            this.platformNo = this.invoice.platformNo;
            
            var url = this.getPath()+"/assets/"+this.resource.html;
            $.ajax({
                url:url,
                dataType:'html',
                success:function(dom){
                    that.template = $(dom);
                    that.container.append(that.template);
                    that.initEvent();
                   
                    that.initInfo();
                    
                    $('*[data-key]',that.template).each(function(){
                        $('.edit_input',this).css({border:'0 none',background:'#fff none','box-shadow':'none','cursor':'default','margin-top':'2px'});
                        $('.edit_input',this).attr('readOnly',true);
                    });
                }
            })
        }
        InvoiceDetailList.prototype.initEvent = function(){
            //this.addCrumb();
        }
        InvoiceDetailList.prototype.initInfo = function(){
        	var that = this;
            var invoice = this.invoice;
            
            $('*[data-key]',this.template).each(function(){
                var key = $(this).attr('data-key');
                var value = invoice[key];
                var type = $(this).attr('data-type');
               
                if(key=='invtype'){
                    $('.edit_input',this).val(DictInfo.getValue('INV_TYPE',value,that.platformNo));
                }else if(key == 'invrate'){
                    $('.edit_input',this).val(DictInfo.getValue('INV_RATE',value,that.platformNo));
                }else if(key == 'invfrom'){
                    $('.edit_input',this).val(DictInfo.getValue('INV_FROM',value,that.platformNo));
                }else if(key == 'invpwd'){
                	var len = value.length;
                	var unit = len/4;
                	if(len==84 || len==108){
                		var invpwd1 = value.substring(0,unit);
                    	var invpwd2 = value.substring(unit,unit*2);
                    	var invpwd3 = value.substring(unit*2,unit*3);
                    	var invpwd4 = value.substring(unit*3,unit*4);
                    	value = invpwd1+'\n'+invpwd2+'\n'+invpwd3+'\n'+invpwd4;
                	}
                	$('.edit_input',this).text(value);
                }else if(key == 'matchstatus'){
                	$('.edit_input',this).val(DictInfo.getValue('MATCH_STATUS',value,that.platformNo));
                }else if(key == 'match2Status'){
                	$('.edit_input',this).val(DictInfo.getValue('MATCH2_STATUS',value,that.platformNo));
                }else if(key == 'scanmatch'){
                	$('.edit_input',this).val(DictInfo.getValue('SCAN_MATCH',value,that.platformNo));
                }else if(key == 'invstatus'){
                	$('.edit_input',this).val(DictInfo.getValue('INV_STATUS',value,that.platformNo));
                }else if(key == 'invresult'){
                	$('.edit_input',this).val(DictInfo.getValue('INV_RESULT',value,that.platformNo));
                }else if(key == 'invtaxsign'){
                	$('.edit_input',this).val(DictInfo.getValue('INV_TAX_SIGN',value,that.platformNo));
                }else if(key == 'redMatchStatus'){
                	$('.edit_input',this).val(DictInfo.getValue('RED_MATCH_STATUS',value,that.platformNo));
                }else if(key == 'match2Date' || key=='matchdate'){
                	$('.edit_input',this).val(value);
                }else if(key == 'inverrinfo'){
                	$('.edit_input',this).text(value);
                }else{
                    $('.edit_input',this).val(value);
                }
            });
            
            if(invoice.invCommentType==CONSTANT.FINANCE_INV_COMMENT_TYPE.RED){
            	$('.redMatch',this.template).show();
            }else{
            	$('.redMatch',this.template).hide();
            }
        }
        InvoiceDetailList.prototype.updateCrumb = function(){
            V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'税票详情'}});
        }
        InvoiceDetailList.prototype.addCrumb = function(){
            V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'税票详情'}});
        }
    })(V.Classes['v.views.tools.invoiceManage.InvoiceDetail'])
},{plugins:["v.ui.grid"]});