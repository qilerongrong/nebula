;V.registPlugin("v.component.layout.layout2.navigation",function(){
	V.Classes.create({
		className:"v.component.layout.layout2.Navigation",
		superClass:"v.component.pages.Navigation",
		init:function(){
		    this.ns = "v.component.layout.layout2.navigation";
		}
	});
	(function(Nav){
		Nav.prototype.initEvent = function(){
			var that = this;
			Nav.superclass.initEvent.call(this);
            var dashboard = $('<li class="dropdown">\
						    <a href="javascript:void(0);" class="dropdown-toggle"><i class="icon-menu icon-console"></i><span class="nav_name">工作台</span></a>\
							<ul class="dropdown-menu">\
							  <li><a href="javascript:void(0);" class="nav_console" data-plugin="v.views.home.myConsole">工作台</a></li>\
							</ul>\
						  </li>');
             $('.nav',this.template).prepend(dashboard);
             dashboard.click(function(e){
             	$('.nav_console',dashboard).click();
             });
			$('.nav_console',this.template).click(function(e){
				 e.stopPropagation();
				 that.publish({eventId:that.EVENT.LOAD_CONTENT,data:{"menu":{plugin:$(this).attr('data-plugin'),menuCode:'1000000000',menuName:'我的控制台',module:'CONSOLE'}}});
			});
		}

		//重写导航，不需要dropdown
		Nav.prototype.initNav = function(){
            var that = this;
			var menus = this.menus;
            $.each(menus,function(){
                var nav = $('<li class="dropdown" nav-code=' + this.id + '><a href="javascript:void(0);" class="dropdown-toggle" data-toggle="dropdown"><i class="icon-menu '+this.icon+'"></i><span class="nav_name">'+this.name+'</span><b class="caret"></b></a><ul class="dropdown-menu"></ul></li>');
                var navCode = this.id;
				var subnavs = this.children;
                $.each(subnavs,function(index){
                    //不显示2级菜单，2级菜单仅仅只画分隔线
                    
                    if(index>0){
                    	var devide_line = '<li class="divider"></li>';
                    	$('ul',nav).append(devide_line);
                    }
                    if(this.children.length>0){
                    	$.each(this.children,function(){
                    		var menuCode = this.id;
							var ns = this.data?this.data.ns:'';
							var menuName = this.name;
							var module = this.data?this.data.module:'';
		                    var subnav = $('<li><a href="javascript:void(0);">'+this.name+'</a></li>');
		                    $('ul',nav).append(subnav);
		                    //存储menu,并绑定加载plugin的事件。
		                    $('a',subnav)
							.data('menu',{plugin:ns,menuCode:menuCode,navCode:navCode,menuName:menuName,module:module})
							.click(function(e){
								//V.MessageBus.publish({eventId:'removeCrumbs'});
								var d = $(this).data('menu');
								$(this).parent().parent().parent().removeClass('open');
		                        that.publish({eventId:that.EVENT.LOAD_CONTENT,data:{menu:d}});
		                    });
                    	})
                    }
                });
				$('.dropdown-toggle',nav).dropdown();

                $('.nav',that.template).append(nav);
            });
        }
	})(V.Classes['v.component.layout.layout2.Navigation']);
},{plugins:["v.component.pages.navigation"]});