/**
 * step plugin模版
 * <div class="step" name="step1"></div>
 * <div class="step" name="step2"></div>
 * <div class="step" name="step3"></div>
 * 每个step div中需要放置需要显示的内容
 */
;V.registPlugin("v.ui.step",function(){
	V.Classes.create({
		className:"v.ui.Step",
		superClass:"v.Plugin",
		init:function(){
			this.ns = 'v.ui.step';
		    this.options = {
				 guide:['step1','step2','step3'],
				 stepNo : 1
			};
			this.template = $("<div class='steps'>\
			<div class='steps_guide'></div>\
			<div class='legend'>\
			<span class='title'></span><span class='btn-group group_edit' style='float:right;'><a id='prev' class='btn btn-mini save btn-success' href='javascript:void(0);' style='display:none'><i  class='icon-arrow-left icon-white'></i> 上一步</a>\
			<a id='next' class='btn btn-mini cancel btn-danger' href='javascript:void(0);'>下一步<i class='icon-arrow-right icon-white'></i></a>\
			<a id='success' class='btn btn-mini cancel btn-danger' style='display:none' href='javascript:void(0);'>完成<i class='icon-ok icon-white'></i></a></span>\
			</div>\
			<div class='step-content'></div>\
			<div class='legend-reverse'><span class='btn-group group_edit' style='float:right;'><a id='prev2' class='btn btn-mini save btn-success' href='javascript:void(0);' style='display:none'><i  class='icon-arrow-left icon-white'></i> 上一步</a>\
			<a id='next2' class='btn btn-mini cancel btn-danger' href='javascript:void(0);'>下一步<i class='icon-arrow-right icon-white'></i></a>\
			<a id='success2' class='btn btn-mini cancel btn-danger' style='display:none' href='javascript:void(0);'>完成<i class='icon-ok icon-white'></i></a>\
			</span>\
			</div></div>");
				}
	});
	(function(Step){
		Step.prototype.init = function(options){
			var that = this;
		    for(prop in options){
			    this.options[prop] = options[prop];
			}
			this.options.maxStep = this.options.guide.length;
			this.container = options.container;
			this.initGuide();
			this.setTitle(this.options.guide[this.options.stepNo-1]);
			this.container.append(this.template);
		}
		Step.prototype.initGuide = function(){
			var guide = this.options.guide;
			var that = this;
			var ol = $('<ol class="guide"></ol>');
			$.each(guide,function(i){
				var li = '';
				if(i == 0){
					li = $('<li class="first">'+this+'</li>')
				}else if(i == guide.length-1){
					li = $('<li class="last">'+this+'</li>')
				}else{
					li = $('<li>'+this+'</li>')
				}
				if(i == that.options.stepNo-1){
					li.addClass('cur');
				};
				ol.append(li);
			});
			$('.steps_guide',this.template).append(ol);
		}
		Step.prototype.getStep = function(stepNo){
			return $('.guide li',this.template).eq(stepNo-1);
		}
		Step.prototype.setTitle = function(title){
		    return;
			$('.title',this.template).eq(0).text(title);
		}
		/**下一步**/
		Step.prototype.next = function(){
		    this.options.stepNo =  this.options.stepNo + 1;
			this.showme();
			if(this.options.stepNo < this.options.maxStep){
				$('#prev,#prev2').show();
				$('#success,#success2').hide();
			}
			if(this.options.stepNo == this.options.maxStep){
				$('#next,#next2').hide();
				$('#success,#success2').show();
			}
			$('.steps_guide ol .cur',this.template).removeClass('cur').next().addClass('cur');
		}
		/**上一步**/
		Step.prototype.previous = function(){
			
		    this.options.stepNo =  this.options.stepNo - 1;
			
			if(this.options.stepNo == 1){
				$('#prev,#prev2').hide();
			}
			if(this.options.stepNo < this.options.maxStep){
				$('#next,#next2').show();
				$('#success,#success2').hide();
			}
			this.showme();
			$('.steps_guide ol .cur',this.template).removeClass('cur').prev().addClass('cur');
			
		}
		
		Step.prototype.showme = function(){
			this.setTitle(this.options.guide[this.options.stepNo-1]);
			var that = this;
			$('.step-content .step',this.template).each(
				function(i){
					if($(this).attr("name") == "step"+that.options.stepNo){
						$(this).show();
						$('#spanid').html(that.options.stepNo);
					}else{
						$(this).hide();
					}
				}
			)
		}
	})(V.Classes['v.ui.Step']);
});
