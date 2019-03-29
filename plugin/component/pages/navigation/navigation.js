;V.registPlugin("v.component.pages.navigation",function(){
	V.Classes.create({
		className:"v.component.pages.Navigation",
		superClass:"v.Plugin",
		init:function(){
		    this.ns = "v.component.pages.navigation";
			this.template =$( '<div class="navbar">\
				  <div class="navbar-inner">\
				    <div class="container">\
				      <ul class="nav">\
					  </ul>\
				    </div>\
				  </div>\
				</div>');
			this.menus = [];
			this.EVENT = {
					LOAD_CONTENT:'load_content'
				}
		}
	});
	(function(Nav){
		Nav.prototype.init = function(options){
			this.container = options.container;
			this.menus = options.menus;
			this.container.append(this.template);
            this.initNav();
			this.initEvent();
		};
		Nav.prototype.initEvent = function(){
			var that = this;
            $('.nav>li',this.template[0]).live('click',function(){
                $('.active',that.template).removeClass('active');
                $(this).addClass('active');
            });
		}
        Nav.prototype.initNav = function(){
            var that = this;
			var menus = this.menus;
            $.each(menus,function(){
                var nav = $('<li class="dropdown" nav-code=' + this.id + '><a href="javascript:void(0);" class="dropdown-toggle" data-toggle="dropdown"><i class="icon-menu '+this.icon+'"></i><span class="nav_name">'+this.name+'</span><b class="caret"></b></a><ul class="dropdown-menu"></ul></li>');
                var navCode = this.id;
				var subnavs = this.children;
                $.each(subnavs,function(){
                    var menuCode = this.id;
					var ns = this.data?this.data.ns:'';
					var menuName = this.name;
					var module = this.data?this.data.module:'';
                    var subnav = $('<li><a href="javascript:void(0);">'+this.name+'</a></li>');
                    $('ul',nav).append(subnav);
                    //如果有3级菜单，则默认加载第一个3级菜单。
                    if(this.children.length>0){
                    	var firstChild = this.children[0];
                    	ns = firstChild.data.ns;
                    	menuCode = firstChild.id;
                    	module = firstChild.data.module;
                    	menuName = firstChild.name;
                    }
					//存储menu,并绑定加载plugin的事件。
					$('a',subnav)
					.data('menu',{plugin:ns,menuCode:menuCode,navCode:navCode,menuName:menuName,module:module})
					.click(function(e){
						//V.MessageBus.publish({eventId:'removeCrumbs'});
						var d = $(this).data('menu');
						$(this).parent().parent().parent().removeClass('open');
						e.stopPropagation();
                        that.publish({eventId:that.EVENT.LOAD_CONTENT,data:{menu:d}});
                    });
                });
				$('.dropdown-toggle',nav).dropdown();
                $('.nav',that.template).append(nav);
            });
        }
	})(V.Classes['v.component.pages.Navigation']);
});