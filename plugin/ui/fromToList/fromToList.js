;V.registPlugin("v.ui.fromToList",function(){
	V.Classes.create({
		className:"v.ui.FromToList",
		superClass:"v.Plugin",
		init:function(){
		   this.sourceListData = [];
		   this.targetListData = [];
		   this.options = {
		   	   sourceRequest:{
		   		  url:null,
		   		  data:null
		   	   },
		       sourceData:[],
		       targetRequest:{
		   		  url:null,
		   		  data:null
		   	   },
		       targetData:[],
		       uniqueKey:'id',
		       displayField:null
		   };
		   this.template = $('<div class="from_to_list">\
		   	    <div class="from_list"><select multiple="multiple"></select></div>\
		   	    <div class="btns_move"><a href="javascript:void(0);" class="btn btn_move">&gt;&gt;</a><a href="javascript:void(0);" class="btn btn_remove">&lt;&lt;</a></div>\
		   	    <div class="to_list"><select multiple="multiple"></select></div>\
		   	</div>');
		}
	});
	(function(Plugin){
		Plugin.prototype.init = function(options){
		    this.container = options.container;
		    this.container.append(this.template);
		    $.extend(true,this.options,options);
		    this.sourceListData = this.options.sourceData;
		    this.targetListData = this.options.targetData;

		    if(this.options.sourceRequest.url){
			    this.initSourceData();
		    }
		    
		    if(this.options.targetRequest.url){
			    this.initTargetData();
		    }
		    
		    this.initList();
		    this.initEvent();
		}
		Plugin.prototype.initEvent = function(){
			var that = this;
			$('.btn_move',this.template).click(function(){
				that.moveIn();
			});
			$('.btn_remove',this.template).click(function(){
				that.moveOut();
			});
		}
		Plugin.prototype.initSourceData = function(){
			var that = this;
			$.ajax({
            	url:this.options.sourceRequest.url,
               	type:'POST',
               	async:false,
               	data:this.options.sourceRequest.data,
                success:function(data){
                	that.sourceListData = data||[];
                }
            })
		}
		Plugin.prototype.initTargetData = function(){
			var that = this;
			$.ajax({
            	url:this.options.targetRequest.url,
               	type:'POST',
               	async:false,
               	data:this.options.targetRequest.data,
                success:function(data){
                	that.targetListData = data||[];
                }
            })
		}
		Plugin.prototype.initList = function(){
			if(!this.options.displayField == null){
				this.log("display field must be set!");
				return ;
			}
			var field = this.options.displayField;
			var uniqueKey = this.options.uniqueKey;
			var that = this;
			$.each(this.sourceListData,function(index,val){
				var opt = $('<option value='+index+'>'+val[field]+'</option>');
				$('.from_list select',that.template).append(opt);
			});
			$.each(this.targetListData,function(index,val){
				var opt = $('<option value='+val[uniqueKey]+'>'+val[field]+'</option>');
				$('.to_list select',that.template).append(opt);
			});
		}
		Plugin.prototype.moveIn = function(){
			var that = this;
			$('.from_list :selected',this.template).each(function(){
				var index = $(this).val();
				var record = that.sourceListData[index];
				that.add(record);
			})
		}
		Plugin.prototype.add = function(record){
			//quit add if duplicate
			var field = this.options.displayField;
			var uniqueKey = this.options.uniqueKey;
			var isDuplicate = false;
			$.each(this.targetListData,function(){
				if(record[uniqueKey] == this[uniqueKey]){
					isDuplicate = true;
					return false;
				}
			});
			if(!isDuplicate){
				this.targetListData.push(record);
				var opt = $('<option value='+record[uniqueKey]+'>'+record[field]+'</option>');
				$('.to_list select',this.template).append(opt);
			}
		}
		Plugin.prototype.remove = function(key){
			var uniqueKey = this.options.uniqueKey;
			var that = this;
			$.each(this.targetListData,function(index){
				if(key == this[uniqueKey]){
					that.targetListData.splice(index,1);
					return false;
				}
			});
		}
		Plugin.prototype.moveOut = function(key){
			var that = this;
			$('.to_list :selected',this.template).each(function(){
				var key = $(this).val();
				that.remove(key);
			});
			$('.to_list :selected',this.template).remove();
		}
		Plugin.prototype.getSourceData = function(){
			return this.sourceListData;
		}
		Plugin.prototype.getData = function(){
			return this.targetListData;
		}
	})(V.Classes['v.ui.FromToList']);
});
