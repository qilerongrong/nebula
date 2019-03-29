;V.registPlugin("v.ui.pagination",function(){
	V.Classes.create({
		className:'v.ui.Pagination',
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.ui.pagination';
            this.options = {
               current:1,
			   total:1,
			   count:0,
			   pageSize:10
            }
			this.template = $('<div class="v_pagination">\
									<a href="javascript:void(0);" class="first_page" title="'+this.getLang("TIP_FIRST_PAGE")+'"><i class="icon-step-backward"></i></a><a href="javascript:void(0);"  class="pre_page" title="'+this.getLang("TIP_PRE_PAGE")+'"><i class="icon-backward"></i></a><span class="input-append"><input type="text" class="jumptopage" value="1"/><span class=" add-on totalpages"></span></span><a href="javascript:void(0);"  class="next_page" title="'+this.getLang("TIP_NEXT_PAGE")+'"><i class="icon-forward"></i></a><a href="javascript:void(0);"  class="last_page" title="'+this.getLang("TIP_LAST_PAGE")+'"><i class="icon-step-forward"></i></a></div>');
		    this.initEvent();
		}
	});
	(function(Pagination){
		Pagination.EVENT_JUMP = 'jump';
        Pagination.prototype.init = function(options){
			this.container = options.container;
			delete options.container;
		    for(prop in options){
			    this.options[prop] = options[prop];
			}
			//$('.totalcount',this.template).text('总共'+this.options.count+'条记录，');
			//$('.cur',this.template).text(this.options.current);
			$('.totalpages',this.template).text(this.getLang("TEXT_TOTAL")+"  "+this.options.count+"  "+this.getLang("TEXT_RECORD")+'   '+this.getLang("TEXT_TOTAL_PAGE")+" "+this.options.total+" "+this.getLang("TEXT_PAGE"));
			$('.jumptopage',this.template).val(this.options.current);
			this.container.append(this.template);
		}
		Pagination.prototype.initEvent = function(){
			var that = this;
			$('.first_page',this.template).click(function(){
				that.jump(1);
			});
			$('.last_page',this.template).click(function(){
				that.jump(that.options.total);
			});
			$('.jumpto',this.template).click(function(){
				var p = $('.jumptopage',this.template).val();
				if(p){
					that.jump(p);
				}
			});
			$('.pre_page',this.template).click(function(){
				that.pre();
			});
			$('.next_page',this.template).click(function(){
				that.next();
			});
			$('.jumptopage',this.template).keydown(function(event){
				var code = event.keyCode;
				if((code<48||code>57)&&(code<96||code>105)&&code!=8&&code!=13){//增加小键盘数字事件by wei.liu
					return false;
				}else if(code == 13){
					var p =this.value;
					if(p){
						that.jump(p);
					}
				}
			})
		}
		Pagination.prototype.pre = function(){
			var page = this.options.current - 1;
			if(page == 0){
				return;
			}
			this.jump(page);
		}
		Pagination.prototype.next = function(){
			var page = this.options.current +1;
			if(page>this.options.total){
				return;
			}
			this.jump(page);
		}
		Pagination.prototype.jump = function(page){
			this.options.current = page>=1&&page<=this.options.total?page:1;
			$('.jumptopage',this.template).val(this.options.current);
			this.publish({
				eventId: Pagination.EVENT_JUMP,
				data:{
					page: this.options.current
				}
			});
		}
	})(V.Classes['v.ui.Pagination']);
});
