;V.registPlugin("v.views.maintenance.partyManage.partyRegist",function(){
	V.Classes.create({
		className:"v.views.maintenance.partyManage.PartyRegist",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.maintenance.partyManage.partyRegist";
			this.module = "";
			this.party = {};
			this.checkedArr = [];
			this.resource = {
			    html:'template.html',
			};
			this.title = {
				BASEINFO:"基本信息", 
				MENU:"功能菜单",
				ADMIN:"管理员",
				ACCOUNTINFO:"账户信息"
			};
		}
	});
	(function(PartyRegist){
        PartyRegist.prototype.init = function(options){
			this.module = options.module;
			var that = this;
			this.container = options.container;
			/**分步骤UI**/
 			var step = new V.Classes['v.ui.Step']();
			step.init({
					container:that.container,
					maxStep:4,
					title:that.title.BASEINFO
				});
			/**加载第一步骤内容**/
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					$('.step-content',step.template).append(dom);
					that.container.append(step.template);
					that.initEvent(step);
				}
			})
        };
		PartyRegist.prototype.initEvent = function(step){
	 	var that = this;
		/**设置验证**/
		$('*[data-validator]',this.template).keyup(function(e){
			var v = this.value;
			var rule = $(this).attr('data-validator');
			var required = $(this).attr('data-required')||false;
			;
			if(required&&v==""){
				$(this).next('.error_msg').text("该值不可为空").show();
				return false;
			}
			var msg = Validator.validate(rule,v);
			if(msg){
				$(this).next('.error_msg').text(msg).show();
			}else{
				$(this).next('.error_msg').empty().hide();
			}
		})

	  	/**绑定下一步事件**/
 		$('#next,#next2',step.template).click(function(){
			if(step.options.stepNo == 1){
				var party = that.party||{};
				step.setTitle(that.title.MENU);
				$('*[party-data-key]',step.template).each(function(){
					var key = $(this).attr('party-data-key');
					party[key] = $('.edit_input',this).val();
				});
				if($("#id").val() != '' ){
					party['id']= $("#id").val();
				}
				$.ajax({
	            	url:that.module+"/step1.action",
	               	type:'post',
					data:JSON.stringify({party:party}),
					contentType:'application/json',
	                success:function(data){
						 ;
	                     if(data != null && data.party != null && data.party['id'] != null){
						 	$('#id').val(data.party['id']);
	                     	V.alert("保存成功！");
							that.initStep2();
							step.next();
	                     }else{
							V.alert("保存失败！");
	                     }
	                }
	            })
				 
			}
			if(step.options.stepNo == 2){
				step.setTitle(that.title.ADMIN);
				this.checkedArr;
//				debugger;
				alert(this.checkedArr);
				return;
				$.ajax({
	            	url:that.module+'/step2.action',
	               	type:'post',
					data:JSON.stringify({user:user}),
					contentType:'application/json',
	                success:function(data){
	                     if (data != null && data.party != null && data.user['id'] != null) {
						 	$('#userid').val(data.user['id']);
							V.alert("保存成功！");
							step.next();
						 }else{
						 	V.alert("保存失败!");
						 }
	                }
	            })
				step.next();
				return;
			}
			if(step.options.stepNo == 3){
				step.setTitle(that.title.ACCOUNTINFO);
				var user = that.user||{};
				$('*[user-data-key]',step.template).each(function(){
					var key = $(this).attr('user-data-key');
					user[key] = $('.edit_input',this).val();
				});
				if($("#userid").val() != '' ){
					user['id']= $("#userid").val();
				}
				//user['modifyDate'] = new Date();
				user['posts'] = null;
				$.ajax({
	            	url:that.module+'/step3.action',
	               	type:'post',
					data:JSON.stringify({user:user}),
					contentType:'application/json',
	                success:function(data){
	                     if (data != null && data == 'success') {
						 	//$('#userid').val(data.user['id']);
							V.alert("保存成功！");
							step.next();
						 }else{
						 	V.alert("保存失败!");
						 }
	                }
	            })
				 
				return;
			}
			
			 
		});
		$('#success,#success2',step.template).click(function(){
			if(step.options.stepNo == 4){
				var PlatInfo = that.PlatInfo||{};
				$('*[plat-data-key]',step.template).each(function(){
					var key = $(this).attr('plat-data-key');
					PlatInfo[key] = $('.edit_input',this).val();
				});
				if($("#platid").val() != '' ){
					PlatInfo['id']= $("#platid").val();
				}
				//PlatInfo['createDate'] = new Date();
				//PlatInfo['validStartDate'] = new Date();
				//PlatInfo['validEndDate'] = new Date();
				
				$.ajax({
	            	url:that.module+'/step3.action',
	               	type:'post',
					data:JSON.stringify({platInfo:PlatInfo}),
					contentType:'application/json',
	                success:function(data){
						;
	                     if (data != null && data.platInfo != null) {
							V.alert("保存成功！");
							that.forward('v.views.maintenance.partyManage.partyRegist');
						 }else{
						 	V.alert("保存失败!");
						 }
	                }
	            })
				return;
			}
		});
		/**绑定上一步事件**/
		$('#prev,#prev2',step.template).click(function(){
			 if(step.options.stepNo == 2){
				step.setTitle(that.title.BASEINFO);
			}
			if(step.options.stepNo == 3){
				step.setTitle(that.title.MENU);
			}
			if(step.options.stepNo == 4){
				step.setTitle(that.title.ADMIN);
			}
			step.previous();
		});
	 }
	 PartyRegist.prototype.initStep2 = function(step){
	 var that = this;
	 	var container = this.container;
	 	var menu_tree = new V.Classes['v.ui.Tree']();
	 	var menuType;
	 	var role = this.role;
	 	var party = this.party;
	 	if (party.businessRole == CONSTANT.BUSINESS_ROLE.ENTERPRISE) {
	 		menuType = CONSTANT.MENU_TYPE.BCP_ENTERPRISE;
	 	} else {
	 		menuType = CONSTANT.MENU_TYPE.SCSP_SELLER;
	 	}
	 	if($('#step2-date', container).text() == ''){
			$.ajax({
				url:this.module+'/menuTree.action',
				//dataType:'json',
				type:'post',
				data:{roleId:role.id,menuType:menuType},
				success:function(data){
					this.menus = data.treeViews;
					menu_tree.init({
						checkable: true,
						data: this.menus,
						container: $('#step2-date', container)
					});
					var checkedArr = menu_tree.getSelectedNodeIds();
					that.checkedArr = checkedArr;
				},
				error:function(){
					that.log('get Menus failed!');
				}
			})
		}
	 }
	})(V.Classes['v.views.maintenance.partyManage.PartyRegist'])
},{plugins:["v.ui.step","v.ui.tree","v.fn.validator",'v.ui.alert']});