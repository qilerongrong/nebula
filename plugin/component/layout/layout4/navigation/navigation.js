;V.registPlugin("v.component.layout.layout4.navigation",function(){
	V.Classes.create({
		className:"v.component.layout.layout4.Navigation",
		superClass:"v.component.pages.Navigation",
		init:function(){
		    this.ns = "v.component.layout.layout4.navigation";
		}
	});
	(function(Nav){
		Nav.prototype.initEvent = function(){
			var that = this;
			Nav.superclass.initEvent.call(this);
			//this.initBrand();
            var dashboard = $('<li class="dropdown">\
						    <a href="javascript:void(0);" class="dropdown-toggle"><span class="nav_name">'+this.getLang("MENU_CONCOLE")+'</span></a>\
							<ul class="dropdown-menu">\
							  <li><a href="javascript:void(0);" class="nav_console" data-plugin="v.views.home.myConsole">'+this.getLang("MENU_MY_CONCOLE")+'</a></li>\
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

		//重写导航，不需要dropdown;菜单数据结构固定3级，根据情况显示不同。
		Nav.prototype.initNav = function(){
            var that = this;
			var menus = this.menus;
            $.each(menus,function(index){
            	if(index == 5 && menus.length>5){
                	that.initMore();
                	return false;
                }
                var nav = $('<li class="dropdown" nav-code=' + this.id + '><a href="javascript:void(0);" class="dropdown-toggle"><span class="nav_name">'+this.name+'</span></a><ul class="dropdown-menu"></ul></li>');
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
                    	cateCode = firstChild.cateCode;
                    	docketType = firstChild.docketType;
                    	processKey = firstChild.processKey;
                    }
					//存储menu,并绑定加载plugin的事件。
					$('a',subnav)
					.data('menu',{plugin:ns,menuCode:menuCode,navCode:navCode,menuName:menuName,module:module,variables:{"cateCode":cateCode,"docketType":docketType,"processKey":processKey}})
					.click(function(e){
						//V.MessageBus.publish({eventId:'removeCrumbs'});
						var d = $(this).data('menu');
						$(this).parent().parent().parent().removeClass('open');
						//必须要阻止冒泡，否则会死循环
						e.stopPropagation();
                        that.publish({eventId:that.EVENT.LOAD_CONTENT,data:{menu:d}});
                    });
                });
				//$('.dropdown-toggle',nav).dropdown();

                $('.nav',that.template).append(nav);
            });
			$('.dropdown',this.template).click(function(){
				$('ul li:eq(0) a',this).click()
			})
        },
        Nav.prototype.initMore = function(){
        	var nav = $('<li class="dropdown" ><a href="javascript:void(0);" class="dropdown-toggle" data-toggle="dropdown"><span class="nav_name">更多</span><b class="caret"></b></a><ul class="dropdown-menu"></ul></li>');
        	$('.nav',this.template).append(nav);
        	var that = this;
        	$.each(this.menus.slice(5),function(){
                var navCode = this.id;
                var l2 = this.children[0];
				var ns = l2.data?l2.data.ns:'';
				var menuCode = l2.id;
				var menuName = l2.name;
				var module = l2.data?l2.data.module:'';
                var subnav = $('<li><a href="javascript:void(0);">'+this.name+'</a></li>');
                $('ul',nav).append(subnav);
                //如果有3级菜单，则默认加载第一个3级菜单。
                if(l2.children.length>0){
                	var firstChild = l2.children[0];
                	ns = firstChild.data.ns;
                	menuCode = firstChild.id;
                	module = firstChild.data.module;
                	menuName = firstChild.name;
                	cateCode = firstChild.cateCode;
                	docketType = firstChild.docketType;
                	processKey = firstChild.processKey;
                }
				//存储menu,并绑定加载plugin的事件。
				$('a',subnav)
				.data('menu',{plugin:ns,menuCode:menuCode,navCode:navCode,menuName:menuName,module:module,variables:{"cateCode":cateCode,"docketType":docketType,"processKey":processKey}})
				.click(function(e){
					//V.MessageBus.publish({eventId:'removeCrumbs'});
					var d = $(this).data('menu');
					$(this).parent().parent().parent().removeClass('open');
					//必须要阻止冒泡，否则会死循环
					e.stopPropagation();
                    that.publish({eventId:that.EVENT.LOAD_CONTENT,data:{menu:d}});
                });
            });
            $('.dropdown-toggle',nav).dropdown();
        }
	})(V.Classes['v.component.layout.layout4.Navigation']);
},{plugins:["v.component.pages.navigation"]});