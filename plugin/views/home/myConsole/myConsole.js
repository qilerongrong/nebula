;V.registPlugin("v.views.home.myConsole",function(){
    V.Classes.create({
        className:"v.views.home.MyConsole",
		superClass:"v.Plugin",
        init:function(){
            this.ns = 'v.views.home.myConsole';
			//this.template = $('<div class="myConsole"><div class="tools"><button class="btn btn-primary setting">'+this.getLang("CONSOLE_SETTING")+'</button></div><div class="con"></div></div>');
			this.template = $('<div class="myConsole"><div class="tools"></div><div class="con"></div></div>');
			this.EVENT = {
					LOAD_CONTENT : 'load_content'	
			}
        }
    });
    (function(Console){
        Console.prototype.init = function(options){
			var that = this;
            this.container = options.container;
            this.options = options;
            var matrix = that.matrix = new V.Classes['v.ui.Matrix']();
			matrix.init({container:$('.con',this.template),cols:2,height:320});
			this.container.append(this.template);
			this.initEvent();
			// $.ajax({
			// 	url:'bcpconsole/console!list.action',
			// 	success:function(data){
			// 	    that.data = data;
			// 		$.each(data,function(){
			// 			var container = $('<div style="width:100%;height:100%" ns='+this.ns+'></div>');
			// 			var options = {
			// 				module:this.module,
			// 				container:container,
			// 				menuCode:this.menuId,
			// 				menuName:this.homeName,
			// 				navCode:this.menuLevel1Id
			// 			}
			// 			matrix.add(container);
			// 		    that.loadPanel(this.ns,options);
			// 		})
			// 		that.userCustomer(data);
			// 	}
			// })
            var data = [
                {ns:"v.views.console.shortcut"},
                {ns:"v.views.console.todoTask"},
                {ns:"v.views.console.notice"},
                {ns:"v.views.console.news"}
            ]; 
            $.each(data,function(){
                var container = $('<div style="width:100%;height:100%" ns='+this.ns+'></div>');
                var options = {
                    module:this.module,
                    container:container,
                    menuCode:this.menuId,
                    menuName:this.homeName,
                    navCode:this.menuLevel1Id
                }
                matrix.add(container);
                that.loadPanel(this.ns,options);
            })
		}
		Console.prototype.initEvent = function(){
		    var that = this;
		    $(window).scroll(function(){
		        var top = $(window).scrollTop();
		        if(parseInt(top)>=142){
		            $('.tools',that.template).css({position:'fixed',top:'20px',left:'36px'});
		        }else{
		            $('.tools',that.template).css({position:'absolute',top:'10px',left:'0px'});
		        }
		    })
		}
		Console.prototype.loadPanel = function(plugin,options){
			var that = this;
			V.loadPlugin(plugin,function(){
				 var glass = V._registedPlugins[plugin].glass;
				 var inst = new V.Classes[glass]();
				 that.subscribe(inst,inst.EVENT.LOAD_CONTENT,function(data){
				 	var ns = data.plugin;
					var options = data.options;
					options.plugin = options.content||ns;
					options.pluginList = ns;
				 	//that.forward(ns,options);
				 	that.loadContent(options);
				 });
				 inst.init(options);
				 
				 that.subscribe(inst,inst.EVENT.DELETE,function(ns){
				     var selected = that.data;
				     for(var i=0; i<selected.length; i++){
				         var items = selected[i];
				         if(items.ns==ns){
				            selected.splice(i,1);
				            break;    
				         }
				     }
				     $.ajax({
                        url:'common!saveUserHomeComponent.action',
                        type:'post',
                        data:JSON.stringify({userHomeComponents:selected}),
                        contentType:'application/json',
                        success:function(data){
                           if(data=='success'){
                                //V.alert("配置成功!");
                                that.matrix.remove($('div[ns="'+ns+'"]'));
                           }else{
                                V.alert("不");
                           }
                        }
                    })
				 });
				 that.subscribe(inst,inst.EVENT.REFRESH,function(ns){
				     inst.refresh();
				 })
			})
		}
		Console.prototype.loadContent = function(options){
			this.publish({eventId:this.EVENT.LOAD_CONTENT,data:options});
		}
		Console.prototype.userCustomer = function(){
		    var that = this;
            $('.setting',this.template).click(function(){
                var list = new V.Classes['v.ui.Grid']();
                list.init({
                    checkable:true,
                    url:'bcpconsole/console!listAll.action',
                    columns:[
                        {displayName:'名称',key:'homeName',width:220}
                    ]
                });
                
                that.subscribe(list,list.EVENT.DATA_RETRIEVED,function(){
                    //处理列表中出现的记录，在弹出窗口选中
                    var consoleData = that.data;
                    var tempData = list.options.data;
                    $.each(consoleData,function(index,dom){
                        var id = consoleData[index].id;
                        $.each(tempData,function(tIndex,tDom){
                            if(id==tempData[tIndex].id)
                                tempData[tIndex]['checked'] = true;
                        });
                    });
                });
            
                var dlg = new V.Classes['v.ui.Dialog']();
                dlg.setBtnsBar({btns:[
                    {text:"确定",style:"btn-primary",handler:function(){
                        var selected = list.getCheckedRecords();
                        if(selected.length == 0){
                            V.alert("请选择记录！");
                            return;
                        }
                        that.data = selected;
                        $.ajax({
                            url:'common!saveUserHomeComponent.action',
                            type:'post',
                            data:JSON.stringify({userHomeComponents:selected}),
                            contentType:'application/json',
                            success:function(data){
                               if(data=='success'){
                                    //V.alert("配置成功!");
                                    that.refresh(selected);
                                    dlg.close();
                               }else{
                                    //V.alert(data);
                            	   V.alert("不1");
                               }
                            }
                        })
                    }}
                    ,{text:"关闭",style:"btn-primary",handler:dlg.close}
                ]});
                dlg.init({width:560,height:320,title:'控制台配置'});
                dlg.setContent(list.template);
            });
        }
        Console.prototype.refresh = function(data){
            var that = this;
            that.matrix.empty();
            
            $.each(data,function(){
                var container = $('<div style="width:100%;height:100%" ns='+this.ns+'></div>');
                var options = {
                    module:this.module,
                    container:container
                }
                that.matrix.add(container);
                that.loadPanel(this.ns,options);
            })   
        }
    })(V.Classes['v.views.home.MyConsole'])
},{plugins:['v.ui.matrix']});