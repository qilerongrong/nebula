;V.registPlugin("v.module.authority.roleMenu",function(){
	V.Classes.create({
		className:"v.module.authority.RoleMenu",
		superClass:"v.Plugin",
		init:function(){
			this.search_result = {};
			this.app_result = {};
			this.template = $('<div></div>');
			this.module = "";
            this.ns = "v.module.authority.roleMenu";
			this.state = 'view';//view || edit;
			this.resource = {
				html:'template.html'
			}
		}
	});
	(function(RoleMenu){
        RoleMenu.prototype.init = function(options){
        	;
			this.module = options.module;
			var that = this;
			var url = this.getPath()+"/assets/"+this.resource.html;
			$.ajax({
				url:url,
				dataType:'html',
				success:function(dom){
					that.template.append($(dom));
					that.initEvent();
					that.initInfo();
				}
			})
		}
		RoleMenu.prototype.initEvent = function(){
		  var that = this;
		  $('#myTab a:first').tab('show');
		  $('#myTab a').click(function (e) {
			  e.preventDefault();
			  $(this).tab('show');
			})
		  $('#search').click(function(){
			;
			var list = new V.Classes['v.ui.Grid']();
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			$('#search_result',that.template).empty();
			var code = $("#code").val();
			if(code == ''){return;};
            list.init({
                container:$('#search_result',that.template),
                checkable:false,
				url:that.module+'/post!partner.action?partnerId='+code,
                columns:[
                    {displayName:'',key:'id',width:320},
                    {displayName:'编码',key:'partnerCode',width:320}
                    ,{displayName:'名称',key:'partnerName',width:320}
                ]
            });
			this.search_result = list;
		  })
		}
		RoleMenu.prototype.initInfo = function(){
			
			var that = this;
			var list = new V.Classes['v.ui.Grid']();
			//var pagination = new V.Classes['v.ui.Pagination']();
			//list.setPagination(pagination);
            var that = this;
			$('#app_result',that.template).empty();
            list.init({
                container:$('#app_result',that.template),
                checkable:true,
				url:this.module+'/post!control.action',
                columns:[
                    {displayName:'单据编码',key:'dictCode',width:320}
                    ,{displayName:'单据名称',key:'dictName',width:320}
                ]
            });
			this.app_result = list;
	  		 
		}

	})(V.Classes['v.module.authority.RoleMenu'])
},{plugins:["v.ui.grid","v.ui.dialog","v.ui.pagination"]});
