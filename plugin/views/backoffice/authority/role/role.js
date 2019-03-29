;V.registPlugin("v.views.backoffice.authority.role",function(){
	V.Classes.create({
		className:"v.views.backoffice.authority.Role",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.backoffice.authority.role";
			this.role = null;
			this.state = 'view';//view || edit;
			this.module = '';
			this.resource = {
				html:'template.html'
			}
		}
	});
	(function(Role){
        Role.prototype.init = function(options){
			this.container = options.container;
			this.module = options.module;
			this.role = options.role || null;
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template = $(dom);
					that.container.append(that.template);
					that.initEvent();
					that.initInfo();
				}
			})
		}
		Role.prototype.initEvent = function(){
			var that = this;
			$('.group_view .edit',this.template).click(function(){
				$(this).parents('.group_view').hide();
				$('.group_edit',that.template).show();
				$(this).parents('form').removeClass('view').addClass('edit');
			});
			$('.group_edit .save',this.template).click(function(){
				$(this).parents('.group_edit').hide();
				$('.group_view',that.template).show();
				$(this).parents('form').removeClass('edit').addClass('view');
			});
			$('.group_edit .cancel',this.template).click(function(){
				$(this).parents('.group_edit').hide();
				$('.group_view',that.template).show();
				$(this).parents('form').removeClass('edit').addClass('view');
			});
			$('.view_roles',this.template).click(function(){
				that.getRoles();
			});
			//this.addCrumb();
		}
		Role.prototype.initInfo = function(){
			var role = this.role;
			$('*[data-key]',this.template).each(function(){
				var key = $(this).attr('data-key');
				var value = role[key];
				$('.view_text',this).text(value);
				$('.edit_input',this).val(value);
			});
		}
		Role.prototype.getRoles = function(){
			var container = $('.rolelist',this.template).empty();
			var grid = new V.Classes['v.ui.Grid']();
			grid.setFilters({role:{id:this.role.id}});
			grid.init({
				container:container,
				//url:this.module+'/role!menuList.action',
				url:'backoffice/authority/role/role!menuList.action',
				columns:[
                    {displayName:'菜单编码',key:'menuCode',width:320}
                    ,{displayName:'菜单名称',key:'menuName',width:320}
                    ,{displayName:'操作',key:'action',width:120,render:function(record){
                        var html = $('<div><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a><div>');
                        $('.remove',html).click(function(){
                           // that.editRole(record);
                        });
                        return html;
                    }}
                ]
			});
		}
		Role.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'角色详情'}});
		}
	})(V.Classes['v.views.backoffice.authority.Role'])
});
