;V.registPlugin("v.component.customElementSelector",function(){
    V.Classes.create({
        className:"v.component.CustomElementSelector",
        superClass:"v.Plugin",
        init:function(){
            this.ns = 'v.component.customElementSelector';
            this.mainTitle = '未使用';
            this.attachTitle = '使用中';
            this.mainData; //主数据
            this.template = $('<div class="ulContainer"><div class="mainContainer well"><span>未使用</span><ul></ul></div><div class="action"></div><div class="attachContainer well"><span>使用中</span><ul></ul></div></div>');
            this.EVENT = {
                LEFT_LI_SELECT:'left_li_select',
                RIGHT_LI_SELECT:'right_li_select'
            }
        }
    });
    (function(FinanceRules){
        FinanceRules.prototype.init = function(options){
            this.container = options.container;
            this.module = options.module;
            
            if(options.mainTitle){
            	this.mainTitle = options.mainTitle;
            	$('.mainContainer',this.template).find('span').text(this.mainTitle);
            }
            if(options.attachTitle){
            	this.attachTitle = options.attachTitle;
            	$('.attachContainer',this.template).find('span').text(this.attachTitle);
            }
            	
            var that = this;
            var mainData = this.mainData = options.data||'';
            var dataLength = this.dataLength = mainData.length||2;
            var mailUl = this.template.find('.mainContainer').find('ul');
            var attachUl = this.template.find('.attachContainer').find('ul');
            $.each(mainData,function(){
                var key = this.key;
                var name = this.name;
                var support = this.support;
                var li = $('<li key='+key+' name='+name+' class="btn">'+name+'</li>');
                if(support){
                    attachUl.append(li);
                }
                else{
                    mailUl.append(li);    
                }
            });
            
            this.container.append(this.template);
            
            this.initEvent();
        }
        FinanceRules.prototype.initEvent = function(){
            var that = this;
            var buttonRight = $('<div title="右移"><i class="icon-arrow-right"></i></div>');
            var buttonLeft = $('<div title="左移"><i class="icon-arrow-left"></i></div>');
            buttonRight.click(function(){
                var li = that.template.find('.mainContainer').find('li.selected').remove();
                that.template.find('.attachContainer').find('ul').append(li);
                li.click();
                
                var elementKey = li.attr('key');
                $(that.mainData).each(function(){
                    if(this.key==elementKey){
                        this['support'] = true;
                        return false;
                    }
                });
            });
            this.template.find('.action').append(buttonRight);
            
            buttonLeft.click(function(){
                var li = that.template.find('.attachContainer').find('li.selected').remove();
                that.template.find('.mainContainer').find('ul').append(li);
                li.click();
                
                var elementKey = li.attr('key');
                $(that.mainData).each(function(){
                    if(this.key==elementKey){
                        this['support'] = false;
                        return false;
                    }
                });
            });
            this.template.find('.action').append(buttonLeft);
            
            $('li',this.template[0]).live('click',function(){
                $('li',that.template).each(function(){
                    $(this).addClass('btn');
                    $(this).removeClass('selected').attr('style','');
                });
                
                var li = $(this);
                if(li.hasClass('selected')){
                    li.addClass('btn');
                    li.removeClass('selected').attr('style','');
                }
                else{
                    li.css('background','#ccc');
                    li.addClass('selected');
                }
                
                var data = {'key':$(this).attr('key'),'name':$(this).attr('name')};
                if(li.parent().parent().hasClass('mainContainer')){
                    that.publish({eventId:that.EVENT.LEFT_LI_SELECT,'data':data});
                }else{
                    that.publish({eventId:that.EVENT.RIGHT_LI_SELECT,'data':data});
                }
            });
            
            var liPro = $('.mainContainer ul li',this.template)[0]||$('.attachContainer ul li',this.template)[0]||'';
            var ht = (liPro.offsetHeight + 5)* that.dataLength + 20;
            $('.mainContainer',this.template).height(ht);
            $('.attachContainer',this.template).height(ht);
            $('.action',this.template).height(ht);
            
            var wt = liPro.offsetWidth<80?80:liPro.offsetWidth;
            $('.mainContainer',this.template).width(wt);
            $('.attachContainer',this.template).width(wt);
            
            $('.mainContainer',this.template).find('span').width(wt);
            $('.attachContainer',this.template).find('span').width(wt);
            
            $('.action',this.template).find('div').css({'margin-top':ht/4});
        };
        FinanceRules.prototype.getData = function(){
        	return this.mainData;
        }
    })(V.Classes['v.component.CustomElementSelector']);
},{plugins:['v.ui.dialog']})