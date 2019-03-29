;V.registPlugin("v.views.backoffice.authority.postControlPoint",function(){
    V.Classes.create({
        className:"v.views.backoffice.authority.PostControlPoint",
        superClass:"v.Plugin",
        init:function(){
            this.template = $('<div></div>');
            this.module = "";
            this.ns = "v.views.backoffice.authority.postControlPoint";
            this.state = 'view';//view || edit;
            this.resource = {
                html:'template.html'
            };
            this.controlPoint = null; //控制点列表
        }
    });
    (function(PostControlPoint){
        PostControlPoint.prototype.init = function(options){
            this.module = options.module;
            this.controlPoint = options.controlPoint;
            var that = this;
            var url = this.getPath()+"/assets/"+this.resource.html;
            $.ajax({
                url:url,
                dataType:'html',
                async:false,
                success:function(dom){
                    that.template.append($(dom));
                    $.ajax({
                        url:'common!cpType.action', //查询控制点
                        type:'post',
                        success:function(data){
                             if(data != null && data != undefined){
                                var html = "";
                                $.each(data,function(){
                                    html += '<option value="'+this.dictcode+'">'+this.dictname+'</option>';
                                })
                                $("#pointcode",that.template).html(html);
                             }
                             that.initEvent();
                             that.initInfo();
                        }
                    });
                }
            })
        }
        PostControlPoint.prototype.initEvent = function(){
            var that = this;
            $('.addControlPoint',this.template).click(function(){
                var controlpointName = $('option:selected',$('#pointcode')).text();
                var controlpointKey = $('option:selected',$('#pointcode')).val();
                
                var repeatFlag = false;
                $('textarea[controlpointKey]',this.template).each(function(){
                    if($(this).attr('controlpointKey') == controlpointKey){
                        repeatFlag = true;
                    }   
                });
                
                if(repeatFlag==true) return //已经添加，过滤重复
                
                var controlLine = $('<div class="control-group">\
                                  <label class="control-label control-name">'+ controlpointName +'</label>\
                                  <div class="controls" data-key="controlpoint">\
                                        <textarea type="text" class="input-xlarge" controlpointKey="'+controlpointKey+'" controlpointName="'+controlpointName+'"></textarea>\
                                        <input type="button" class="btn btn-mini btn-inverse search" name="search" value="查询匹配">\
                                        <input type="button" class="btn btn-mini btn-inverse delete" name="delete" value="删除">\
                                        <p class="error_msg"></p>\
                                  </div>\
                                </div>');
                $('.delete',controlLine).click(function(){
                    $(this).parent().parent().remove();
                });
                $('.search',controlLine).click(function(){
                    var code = $(this).parent().find('textarea').val();
                    if(code=='') return;
                    that.searchMatch(controlpointKey, code);
                });
                $('textarea',controlLine).keyup(function(e){
                    this.value=/[a-z\A-Z\0-9\?\*\-\;]*/.exec(this.value);
                    if(this.value!='')
                        $(this).parent().find('.error_msg').text('').hide();
                    else
                        $(this).parent().find('.error_msg').text('不能为空，请输入代码！').show();    
                })           
                $('.control-list-content',this.template).append(controlLine);                
            });
        }
        //初始化岗位已经配置的控制点
        PostControlPoint.prototype.initInfo = function(){
            var that = this;
            var controlList = $('.control-list-content',this.template);
            $.each(this.controlPoint, function(index,dom){
                var thatdom = this;
                var controlLine = $('<div class="control-group">\
                                  <label class="control-label control-name">'+ this.name +'</label>\
                                  <div class="controls" data-key="controlpoint">\
                                        <textarea type="text" class="input-xlarge" controlpointKey="'+this.key+'" controlpointName="'+this.name+'">'+this.code+'</textarea>\
                                        <input type="button" class="btn btn-mini btn-inverse search" name="search" value="查询匹配">\
                                        <input type="button" class="btn btn-mini btn-inverse delete" name="delete" value="删除">\
                                        <p class="error_msg"></p>\
                                  </div>\
                                </div>');
                                
                $('.delete',controlLine).click(function(){
                    $(this).parent().parent().remove();
                });
                $('.search',controlLine).click(function(){
                    var code = $(this).parent().find('textarea').val();
                    if(code=='') return;
                    that.searchMatch(thatdom.key, code);
                });
                $('textarea',controlLine).keyup(function(e){
                    this.value=/[a-z\A-Z\0-9\?\*\-\;]*/.exec(this.value);
                    if(this.value!='')
                        $(this).parent().find('.error_msg').text('').hide();
                    else
                        $(this).parent().find('.error_msg').text('不能为空，请输入代码！').show();    
                })
                controlList.append(controlLine);                   
            })        
        }
        //查询匹配
        PostControlPoint.prototype.searchMatch = function(key, code){
            var dlg = new V.Classes['v.ui.Dialog']();
            
            var options = {
                width:600,
                height:400
            };
            if(key=='buyerCode'){  //公司
                 options.title = "公司信息";
                 var list = new V.Classes['v.ui.Grid']();
                 list.setFilters({controls:code});
                 list.setPagination(new V.Classes['v.ui.Pagination']());
                 list.init({
                    container:dlg.getContent(),
                    url:'common!findCompany.action',
                    columns:[
                        {displayName:'编码',key:'partnerCode',width:160}
                        ,{displayName:'名称',key:'partnerName',width:120}
                    ]
                 });
            }
            else if(key=='regionCode'){ //分部
                options.title = "分部信息";
                var list = new V.Classes['v.ui.Grid']();
                list.setFilters({controls:code});
                list.setPagination(new V.Classes['v.ui.Pagination']());
                list.init({
                   container:dlg.getContent(),
                   url:'common!findSalesRegion.action',
                   columns:[
                       {displayName:'编码',key:'regionCode',width:160}
                       ,{displayName:'名称',key:'name',width:120}
                   ]
                });
           }
            else if(key=='departCode'){ //部门
                options.title = "部门信息";
                var list = new V.Classes['v.ui.Grid']();
                list.setFilters({controls:code,key:key});
                list.setPagination(new V.Classes['v.ui.Pagination']());
                list.init({
                   container:dlg.getContent(),
                   url:'common!findDepartMent.action',
                   columns:[
                       {displayName:'编码',key:'departCode',width:160}
                       ,{displayName:'名称',key:'departName',width:120}
                   ]
                });
           }
            else if(key=='storeCode'){ //门店
                 options.title = "门店信息";
                 var list = new V.Classes['v.ui.Grid']();
                 list.setFilters({controls:code,key:key});
                 list.setPagination(new V.Classes['v.ui.Pagination']());
                 list.init({
                    container:dlg.getContent(),
                    url:'common!findOrgByPlatNo.action',
                    columns:[
                        {displayName:'编码',key:'orgCode',width:160}
                        ,{displayName:'名称',key:'name',width:120}
                    ]
                 });
            }
            else if(key=='goodsClsCode'){ //品类
                 options.title = "品类信息";
                 var list = new V.Classes['v.ui.Grid']();
                 list.setFilters({categoryLevel:1,controls:code});
                 list.setPagination(new V.Classes['v.ui.Pagination']());
                 list.init({
                    container:dlg.getContent(),
                    url:'common!goodscatgory.action',
                    columns:[
                        {displayName:'编码',key:'categoryCode',width:160}
                        ,{displayName:'名称',key:'categoryName',width:120}
                    ]
                 });
            }
            else if(key=='sellerCode'){ //交易伙伴
                 var isBuyer = LoginInfo.sellerCompany=='seller'?true:false;
                 options.title = "供应商信息";
                 var list = new V.Classes['v.ui.Grid']();
                 list.setFilters({isBuyer:isBuyer,controls:code});
                 list.setPagination(new V.Classes['v.ui.Pagination']());
                 list.init({
                    container:dlg.getContent(),
                    url:'common!partner.action',
                    columns:[
                        {displayName:'编码',key:'partnerCode',width:160}
                        ,{displayName:'名称',key:'partnerName',width:120}
                    ]
                 });
            }
            else if(key=='brandCode'){ //品牌
                 options.title = "品牌信息";
                 var list = new V.Classes['v.ui.Grid']();
                 list.setFilters({controls:code});
                 list.setPagination(new V.Classes['v.ui.Pagination']());
                 list.init({
                    container:dlg.getContent(),
                    url:'common!brand.action',
                    columns:[
                        {displayName:'编码',key:'brandCode',width:160}
                        ,{displayName:'名称',key:'brandName',width:120}
                    ]
                 });
            }
            dlg.setBtnsBar({btns:[{text:"取消",handler:dlg.close}]});
            dlg.init(options);
        }
    })(V.Classes['v.views.backoffice.authority.PostControlPoint'])
},{plugins:["v.ui.grid","v.ui.dialog","v.ui.pagination","v.ui.tree"]});
