;V.registPlugin("v.views.backoffice.custom.partyAss",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.PartyAss",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.backoffice.custom.partyAss";
			this.party = null;
			this.plat = null;
			this.userList = null;
			this.module = "";
			this.resource = {
			    html:'template.html',
			}
		}
	});
	(function(PartyAss){
		PartyAss.prototype.EVENT ={
		    VIEW_PARTY:'view_party'
		};
        PartyAss.prototype.init = function(options){
			this.module = options.module;
            this.container = options.container;
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					that.initpartyInfo();
					//that.initUserList();
					that.initEvent();
				}
			})
        };
		 PartyAss.prototype.initEvent = function(options){
		 	var that = this;
        
            /**设置验证**/
            $('*[data-validator]:visible',this.template).keyup(function(e){
                var v = this.value;
                var rules = $(this).attr('data-validator');
                var required = $(this).attr('data-required')||'false';
                
                if(required=='true'&&v==""){
                    $(this).parent().find('.error_msg').text("该值不可为空").show();
                    return false;
                }
                var msg = Validator.validate(rules,v);
                if(msg){
                    $(this).parent().find('.error_msg').text(msg).show();
                }else{
                    $(this).parent().find('.error_msg').empty().hide();
                }
            })
            
                /**交易伙伴管理-控制点**/
            $('#matchset',this.template).click(function(){
                var controlPoing = new V.Classes['v.views.backoffice.authority.PostControlPoint']();
                controlPoing.init(that.options);
                
                var addDlg = new V.Classes['v.ui.Dialog']();
                addDlg.setBtnsBar({btns:[{text:"确定",style:"btn-primary",handler:function(){
                    if($('#code').val() == ''){
                        V.alert("没有数据");
                        return;
                    }
                    var control = controlPoing.app_result;
                    var selected = controlPoing.app_result.getCheckedRecords();
                    if(selected.length < 1){
                        V.alert("没有选择应用数据");
                        return;
                    }
                    var sel = [];
                    var selName = [];
                    for(var i = 0;i < selected.length; i++){
                        var obj = selected[i];
                        sel.push(obj['dictCode']);
                        selName.push(obj['dictName']);
                    }
                    
                    that.submit(sel,selName);
                    addDlg.close();
                    
                }},{text:"取消",handler:addDlg.close}]});
                addDlg.init({title:'控制点',height:492,width:660});
                /**将Grid中的数据加入到Dialog中**/
                addDlg.setContent(controlPoing.template);
            })
            
            that.edit('.party-view','.party-edit');
            that.cancel('.party-edit','.party-view');
            $('.icon-remove').click();
            
            $('.party-view').hide();
            $('.view_menu').hide();
            $('.group_edit').hide();
		 }
		PartyAss.prototype.initUserList = function() {
			this.list = new V.Classes['v.ui.Grid']();
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			var that = this;
			list.init({
						container : $(".list",this.template),
						checkable : false,
						url : this.module
								+ '/party!detailList.action',
						columns : [
								{
									displayName : '主体编码',
									key : 'PLATFORM_NO',
									width : 120
								},
								{
									displayName : '主体名称',
									key : 'PLATFORM_NAME',
									width : 120
								},
								{
									displayName : '关联帐号',
									key : 'loginName',
									width : 120
								},
								{
									displayName : '关联状态',
									key : 'status',
									width : 120,
									render: function(record){
										if(record.status = '1'){
											return "已关联";
										}
									}
								},
								{
									displayName : '操作',
									key : 'action',
									width : 120,
									render : function(record) {
										var html = $('<div><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="取消关联"><i class="icon-remove"></i></a><div>');
										$('.remove', html)
												.click(
														function() {
															that.removePost(record);
														});
										return html;
									}
								}] 
					});
	 
			//this.subscribe(list, 'remove', this.removePosts);
			this.container.append(this.template);
		}
		PartyAss.prototype.editAssociate = function(record) {
			var options = {};
			options.module = this.module;
			this.forward('v.views.backoffice.authority.associateUser',options);
		}
        PartyAss.prototype.initpartyInfo = function(options){
		   var that = this;
           $.ajax({
                url:that.module+'/party!input.action',
                type:'post',
                data: {partnerId: 111},
                success:function(data){
                     //debugger;
                     if(data!=undefined){
                        that.post = data.post;
                        that.party = data.party;
                        that.user = data.user;
                        that.role = data.role;
                        that.menus = data.menus;
                     }
                     if(data!=undefined && data.user !=undefined){
                        var user = data.user;
                        $('*[user-data-key]',this.template).each(function(){
                            var key = $(this).attr('user-data-key');
                            var value = user[key];
                            $('.view_text',this).text(value);
                            $('.edit_input',this).val(value);
                            
                            $('.view_text',this).css('padding-top','2px');
                        });
                        that.initControls();
                     }
                     if(data!=undefined && data.role !=undefined){
                         that.authoritySetting();
                     }
                }
            })
        };
        PartyAss.prototype.save = function(){
			var that = this;
			
			var partyData = {};
			$('*[party-data-key]', this.template).each(function(){
		 		var key = $(this).attr('party-data-key');
		 		var value = $('.edit_input', this).val();
		 		if (typeof(value) != 'undefined') {
		 			partyData[key] = value;
		 		}
		 	});
					 	
            $.ajax({
            	url:that.module+"/party!updateParty.action?platformNo=123456789",
               	type:'POST',
				data:JSON.stringify({party:partyData}),
				contentType:'application/json',
                success:function(data){
                	if(data=='success'){
                		V.alert('保存成功！');
                	}
                	else
                        V.alert('保存失败！');
                }
            });
		}
		PartyAss.prototype.removePost = function(record){
			var that = this;
            $.ajax({
            	url:that.module+"/party!removeRelate.action?platformNo=123456789",
               	type:'POST',
				data:{id:record.id},
                success:function(data){
                	if(data=='success'){
                		V.alert('删除成功！');
                		that.list.refresh();
                	}
                	else
                        V.alert('删除失败！');
                }
            });
		}
		PartyAss.prototype.authoritySetting = function(){
            var that = this;
            $('.edit_authority',this.template).click(function(){
                that.publish({eventId:'authority_edit',data:''});
            });
            
            var authority = new V.Classes['v.views.component.AuthoritySetting']();
            var data = {
                instance:this,
                id:that.party['id'],
                roleId:that.role['id'],
                module:that.module,
                action:'party'
            }
            authority.init(data);
            $('.authority_list').append(authority.template);
          }
		PartyAss.prototype.edit = function(view ,edit){
            var that = this;
            $(view+' .edit',this.template).click(function(){
                $(this).parents(view).hide();
                $(edit,that.template).show();
                $(this).parents('fieldset').removeClass('view').addClass('edit');
            });
         }
         PartyAss.prototype.cancel = function(edit,view){
            var that = this;
            $(edit+' .cancel',this.template).click(function(){
                $(this).parents(edit).hide();
                $(view,that.template).show();
                $(this).parents('fieldset').removeClass('edit').addClass('view');
                //隐藏验证时，产生的信息框
                $('.error_msg').empty().hide();
            });
         }
          PartyAss.prototype.initControls = function(){
            var that = this;
                $.ajax({
                    url:'common!cpType.action',
                    type:'post',
                    success:function(data){
                         if(data != null && data != undefined){
                            var html = "";
                            $.each(data,function(){
                            html += '<div class="control-group span6">\
                                      <label class="control-label" for="input01">'+this.dictName+'：</label>\
                                          <div class="controls">\
                                            <p id="'+this.dictCode+'">*</p>\
                                          </div>\
                                      </div>\
                                    <div class="control-group span6">\
                                     <label class="control-label" for="input01">应用单据：</label>\
                                        <div class="controls">\
                                        <p id="'+this.dictCode+'_"></p>\
                                      </div>\
                                    </div>';
                            })
                            $(".controlPointList",that.template).html(html);
                            if(that.post != null && that.post != undefined){
                                $.ajax({
                                    url:that.module+'/control.action',
                                    type:'post',
                                    success:function(data){
                                        that.setCodeAndName(data,that.post.authorities,that.post.controles);
                                        }
                                    });
                             }
                         }
                    }
                });
          }
          PartyAss.prototype.setCodeAndName = function(data,authorities,controles){
            var that = this;
                if(authorities.brandCode != undefined){$("#brandCode",that.template).text(authorities.brandCode);}
                if(authorities.buyerCode != undefined){$("#buyerCode",that.template).text(authorities.buyerCode);}
                if(authorities.code != undefined){$("#code",that.template).text(authorities.code);}
                if(authorities.sellerCode != undefined){$("#sellerCode",that.template).text(authorities.sellerCode);}
                if(authorities.goodsClsCode != undefined){$("#code",that.template).text(authorities.goodsClsCode);}
                if(controles.brandCode != undefined){$("#brandCode_",that.template).text(this.getControlsName(data,controles.brandCode));}
                if(controles.buyerCode != undefined){$("#buyerCode_",that.template).text(this.getControlsName(data,controles.buyerCode));}
                if(controles.code != undefined){$("#code_",that.template).text(this.getControlsName(data,controles.code));}
                if(controles.sellerCode != undefined){$("#sellerCode_",that.template).text(this.getControlsName(data,controles.sellerCode));}
                if(controles.goodsClsCode != undefined){$("#goodsClsCode_",that.template).text(this.getControlsName(data,controles.goodsClsCode));}
         }
         PartyAss.prototype.getControlsName = function(data,point){
                var name = ""
                var po = point.split(';');
                for(var p in po){
                    $.each(data,function(){
                        if(po[p] == this.dictCode){
                            name += this.dictName + ';';
                            return;
                        }
                    })
                }
                return name;
        }
	})(V.Classes['v.views.backoffice.custom.PartyAss'])
},{plugins:["v.ui.grid","v.ui.dialog","v.ui.pagination",'v.ui.alert','v.fn.validator','v.views.component.authoritySetting']});