;V.registPlugin("v.views.application.applicant.delegate.delegateList",function(){
	V.Classes.create({
		className:"v.views.application.applicant.delegate.DelegateList",
		superClass:"v.component.SearchList",
		init:function(){
            this.ns = 'v.views.application.applicant.delegate.delegateList';
        	this.module = '';
        	this.list = new V.Classes['v.ui.Grid']();
			this.form = new V.Classes["v.component.Form"]();
		}
	});
	(function(List){
		List.prototype.initConditionForm = function(){
		    var Form = V.Classes['v.component.Form'];
			var items = [
		       {label:this.getLang("LABEL_DELEGATE_NAME"),type:Form.TYPE.TEXT,name:'delegateName',value:''}
		       ,{label:this.getLang("LABEL_ENABLED"),type:Form.TYPE.SELECT,name:'enabled',multiList:[[this.getLang("MULIST_ALL"),''],[this.getLang("MULIST_YSE"),'Y'],[this.getLang("MULIST_NO"),'N']]}
			];
			var filters = this.options.filters;
			if(filters&& filters.length>0){
				$.each(items,function(m,item){
					var key = this.name;
					$.each(filters,function(){
						if(key == this.key){
							item.value = this.value;
							return false;
						}
					})
				});
			}
			this.form.init({
				colspan:3,
				items:items
			});
		}
		List.prototype.initList = function(){
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			var that = this;
			list.init({
				container : $('.list', this.template),
				checkable : false,
				url :'workflow/delegate/delegate!list.action',
				columns : [
					{
						displayName : this.getLang("LIST_OWNER_NAME"),
						key : 'ownerName',
						width : 50
					},
					{
						displayName : this.getLang("LIST_START_TIME"),
						key : 'startTime',
						width : 70
					},
					{
						displayName : this.getLang("LIST_END_TIME"),
						key : 'endTime',
						width : 70
					},
					{
						displayName : this.getLang("LIST_NODE_KEY"),
						key : 'nodeKey',
						width : 70
					},
					{
						displayName : this.getLang("LIST_ENABLED"),
						key : 'enabled',
						width : 70,
						render : function(record) {
							if (record.enabled == 'N') {
								return that.getLang("LIST_NO");
							} else {
								return that.getLang("LIST_YES");
							}
						}
					},
					{
						displayName : this.getLang("LIST_DELEGATE_NAME"),
						key : 'delegateName',
						width : 70
					},
					{
						displayName : this.getLang("LIST_ACTION"),
						key : 'action',
						width : 80,
						render : function(record) {
							var buttonName = '';
							if (record.enabled == 'Y') {
								buttonName = that.getLang("BTN_NO");
							} else {
								buttonName = that.getLang("BTN_YES");
							}
							html = $('<div class="action"><a class="remove" href="javascript:void(0);" title="'+that.getLang("TIP_DELETE")+'"><i class="icon-remove"></i></a><a class="edit" href="javascript:void(0);" title="'+that.getLang("TIP_EDIT")+'"><i class="icon-edit"></i></a><a class="enable" href="javascript:void(0);" title="'+buttonName+'"><i class="icon-ban-circle"></i></a><div>');
							$('.edit', html).click(function() {
								that.editDelegate(record);
							});
							$('.remove', html).click(function() {
								that.removeDelegate(record);
							});
							$('.enable',html).click(function(){
								that.enabled(record);
							});
							return html;
						}
					}
				],
				toolbar:[
				    {eventId:'add',text:this.getLang("TEXT_NEW_PROXY"),icon:'icon-plus'}
				]
			});
			this.subscribe(list,'add',this.addDelete);
		    this.container.append(this.template);
		}
		List.prototype.editDelegate = function(record){
			var options = {};
			options.delegate = record;
			options.module = this.module;
			this.forward("v.views.application.applicant.delegate.delegateEdit",options,function(p){
				p.addCrumb();
			});
		}
		List.prototype.removeDelegate = function(record){
			var that = this;
			V.confirm(this.getLang("MSG_ISDELETE"),function ok(e){ 
				$.ajax({
					url:that.module+'/delegate!delete.action',
					type:'post',
					data: {delegateId:record.id},
					success:function(data){
						if(data=='success'){
							V.alert(data);
							that.list.refresh();
						}else{
							V.alert(data);
						}	
					}
				})
			})
		}
		List.prototype.enabled = function(record){
			var that = this;
			$.ajax({
            	url:that.module+'/delegate!enable.action',
               	type:'post',
				data: {delegateId:record.id},
                success:function(data){
                	if(data=='success'){
					  	V.alert(data);
					  	that.list.refresh();
					}else{
						V.alert(data);
					}	
                }
            })
		}
		List.prototype.addDelete = function(){
			this.options.module = this.module;
			this.forward('v.views.application.applicant.delegate.delegateEdit',this.options,function(p){
				p.addCrumb();
			});
		}
		
		List.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_PROXY_CONFIGURE")}});
		}
		List.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:this.getLang("CRUMB_PROXY_CONFIGURE")}});
		}
	})(V.Classes['v.views.application.applicant.delegate.DelegateList']);
},{plugins:['v.component.searchList','v.ui.grid','v.ui.confirm','v.ui.alert',"v.component.fileUpload"]});
