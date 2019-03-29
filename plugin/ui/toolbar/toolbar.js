;V.registPlugin("v.ui.toolbar",function(){
    V.Classes.create({
        className:"v.ui.Toolbar",
		superClass:"v.Plugin",
        init:function(){
            this.ns = 'v.ui.toolbar';
            this.btns = [];
			//{position:'left',eventId:'add',icon:'',text:''}
			this.template = $('<div class="v-toolbar"><span class="right "></span><span class="left"></span></div>');
        }
    });
    (function(Toolbar){
        Toolbar.prototype.init = function(options){
			this.container = options.container;
		    this.btns = options.btns;
			var that = this;
			for(var i=0,l=this.btns.length;i<l;i++){
			    var conf = this.btns[i];
				var post = conf.position || 'left';
				var icon = conf.icon;
				var btn = $('<a href="#javascript:void(0);" class="btn" title="'+conf.text+'">'+conf.text+'</a>');
				if(icon){
					btn.prepend('<i class="'+icon+'"></i>');
				}
				btn.attr('name',conf.eventId);
				btn.data('eventId',conf.eventId);
				btn.click(function(){
					that.publish({
						eventId: $(this).data('eventId')
					})
				});
				if(post == 'left'){
					$('.left',that.template).append(btn);
				}else{
					$('.right',that.template).append(btn);
				}
			}
			this.container.append(this.template);
		}
		Toolbar.prototype.addTool = function(conf){
			var post = conf.position || 'right';
			this.btns.push(conf);
			var that = this;
			var btn = $('<a href="javascript:void(0);"  class="btn" title="'+conf.text+'">'+conf.text+'</a>');
			btn.attr('name',conf.eventId);
			btn.data('eventId',conf.eventId);
			btn.click(function(){
				that.publish({
					eventId: $(this).data('eventId')
				})
			});
			if(post == 'left'){
					$('.left',this.template).append(btn);
				}else{
					$('.right',this.template).append(btn);
				}
		}
		Toolbar.prototype.getTool = function(eventId){
			return $('[name='+eventId+']',this.template);
		}
    })(V.Classes['v.ui.Toolbar'])
});