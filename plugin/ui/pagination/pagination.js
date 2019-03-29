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
			// this.template = $('<div class="v_pagination">\
			// 						<a href="javascript:void(0);" class="first_page" title="'+this.getLang("TIP_FIRST_PAGE")+'"><i class="icon-step-backward"></i></a><a href="javascript:void(0);"  class="pre_page" title="'+this.getLang("TIP_PRE_PAGE")+'"><i class="icon-backward"></i></a><span class="input-append"><input type="text" class="jumptopage" value="1"/><span class=" add-on totalpages"></span></span><a href="javascript:void(0);"  class="next_page" title="'+this.getLang("TIP_NEXT_PAGE")+'"><i class="icon-forward"></i></a><a href="javascript:void(0);"  class="last_page" title="'+this.getLang("TIP_LAST_PAGE")+'"><i class="icon-step-forward"></i></a></div>');
		    this.template = $('<div class="v-pagination">\
		    	    <div class="page_left">共<span class="totalpages"></span>页/<span class="totalcount"></span>条记录\
		    	    当前显示<span class="beginIndex"></span>-<span class="endIndex"></span>条\
		    	    每页显示<select class="pageSize">\
		    	    <option value="1">1</option><option value="5">5</option><option class="10">10</option><option class="15" selected>15</option><option class="20">20</option>\
		    	    </select>条\
		    	    跳转至<input class="jumptopage" />页\
		    	    </div>\
		    	    <div class="page_right">\
			    	    <div class="btn-group">\
						  <button class="btn first_page"></button>\
						  <button class="btn pre_page"></button>\
						  <button class="btn page_num">1</button>\
						  <button class="btn next_page"></button>\
						  <button class="btn last_page"></button>\
						</div>\
					</div>\
		    	</div>');
		    this.initEvent();
		    this.EVENT = {
		    	EVENT_JUMP:'jump'
		    }
		}
	});
	(function(Pagination){
        Pagination.prototype.init = function(options){
			this.container = options.container;
			delete options.container;
		    for(prop in options){
			    this.options[prop] = options[prop];
			}
			// this.options.total = 5;
			//$('.totalcount',this.template).text('总共'+this.options.count+'条记录，');
			//$('.cur',this.template).text(this.options.current);
			$('.totalcount',this.template).text(this.options.count);
			$('.totalpages',this.template).text(this.options.total);
			$('.beginIndex',this.template).text(this.options.pageSize*(this.options.current-1)+1);
			$('.pageSize',this.template).val(this.options.pageSize);
			if(this.options.current<this.options.total){
				$('.endIndex',this.template).text(this.options.pageSize*this.options.current);
			}else{
				$('.endIndex',this.template).text(this.options.count);
			}
			$('.jumptopage',this.template).val(this.options.current);
			this.container.append(this.template);
			this.initPageNum();

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
			});
			$('.page_num',this.template.get(0)).live('click',function(){
				if($(this).hasClass('omission')){
					return;
				}
                var index = $(this).text();
                that.jump(index);
            });
            $('.pageSize',this.template).change(function(){
            	var pageSize = $(this).val();
            	that.resizePage(pageSize);
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
				eventId: this.EVENT.EVENT_JUMP,
				data:{
					page: this.options.current
				}
			});
		}
		Pagination.prototype.resizePage = function(pageSize){
			this.options.current = 1;
			this.options.pageSize = pageSize;
			this.publish({
				eventId: this.EVENT.EVENT_JUMP,
				data:{
					page: this.options.current,
					pageSize:pageSize
				}
			});
		}
		Pagination.prototype.initPageNum = function(){
			var curPage = this.options.current;
			var totalpages = this.options.total;
			var count = this.options.count;
			$('.page_num',this.template).remove();
			if(curPage<5){
				var size = totalpages;
				if(totalpages>5){
					size = 5;
				}
				for(var i=0;i<size;i++){
					var page_item = $('<button class="btn page_num">'+(i+1)+'</button>');
					if(i == curPage-1){
						page_item.addClass('active');
					}
					page_item.insertBefore($('.next_page',this.template));
				}
			}else{
				if(totalpages>5){
					for(var i=0;i<3;i++){
						var page_item = $('<button class="btn page_num">'+(i+1)+'</button>');
						page_item.insertBefore($('.next_page',this.template));
					}
					var omission = $('<button class="btn page_num omission">…</button>');
					omission.insertBefore($('.next_page',this.template));
					
					if(curPage<totalpages){
						var cur_item = $('<button class="btn page_num active">'+curPage+'</button>');
					    cur_item.insertBefore($('.next_page',this.template));
						var next_item = $('<button class="btn page_num">'+(curPage+1)+'</button>');
					    next_item.insertBefore($('.next_page',this.template));
					}else{
						var cur_item = $('<button class="btn page_num">'+(curPage-1)+'</button>');
					    cur_item.insertBefore($('.next_page',this.template));
						var next_item = $('<button class="btn page_num active">'+curPage+'</button>');
					    next_item.insertBefore($('.next_page',this.template));
					}
				}
			}
			if(curPage === 1 || totalpages === 0){
				$('.first_page',this.template).attr('disabled',true);
				$('.pre_page',this.template).attr('disabled',true);
			}else{
				$('.first_page',this.template).attr('disabled',false);
				$('.pre_page',this.template).attr('disabled',false);
			}
			if(curPage === totalpages||totalpages === 0){
				$('.last_page',this.template).attr('disabled',true);
				$('.next_page',this.template).attr('disabled',true);
			}else{
				$('.last_page',this.template).attr('disabled',false);
				$('.next_page',this.template).attr('disabled',false);
			}
		}
	})(V.Classes['v.ui.Pagination']);
});
