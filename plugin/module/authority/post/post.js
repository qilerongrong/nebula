;V.registPlugin("v.module.authority.post",function(){
	V.Classes.create({
		className:"v.module.authority.Post",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.module.authority.post";
			this.module = '';
			this.post = null;
			this.state = 'view';//view || edit;
			this.resource = {
				html:'template.html'
			}
		}
	});
	(function(Post){
        Post.prototype.init = function(options){
			this.container = options.container;
			this.module = options.module;
			this.post = options.post || null;
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
					//that.getRoles();
				}
			})
		}
		Post.prototype.initEvent = function(){
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
		Post.prototype.initInfo = function(){
			var post = this.post;
			$('*[data-key]',this.template).each(function(){
				var key = $(this).attr('data-key');
				var value = post[key];
				$('.view_text',this).text(value);
				$('.edit_input',this).val(value);
			});
		}
		Post.prototype.getRoles = function(){
			var container = $('.rolelist',this.template).empty();
			var grid = new V.Classes['v.ui.Grid']();
			grid.setFilters({post:{id:this.post.id}});
			grid.init({
				container:container,
				url:this.module+'/post!roleList.action',
				columns:[
                    {displayName:'角色编码',key:'roleCode',width:320}
                    ,{displayName:'角色名称',key:'roleName',width:320}
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
		Post.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'岗位详情'}});
		}
	})(V.Classes['v.module.authority.Post'])
});
