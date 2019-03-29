;V.registPlugin("v.views.backoffice.custom.partyRegistList",function() {
	V.Classes.create({
		className : "v.views.backoffice.custom.PartyRegistList",
		superClass : "v.views.component.SearchList",
		init : function() {
			this.ns = 'v.views.backoffice.custom.partyRegistList';
			this.module = '';
			this.list = new V.Classes['v.ui.Grid']();
			this.form = new V.Classes["v.component.Form"]();
		}
	});
	(function(PartyRegistList) {
		PartyRegistList.prototype.initConditionForm = function() {
			var Form = V.Classes['v.component.Form'];
			this.form.init({
				colspan : 3,
				items : [ {
					label : '平台识别码',
					type : Form.TYPE.TEXT,
					name : 'platformNo',
					value : ''
				}, {
					label : '主体名称',
					type : Form.TYPE.TEXT,
					name : 'partyName',
					value : ''
				} ]
			});
		}
		PartyRegistList.prototype.initList = function() {
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			var that = this;
			list.init({
						container : $('.list', this.template),
						checkable : true,
						url : this.module+ '/party!list.action',
						columns : [{
									displayName : '平台编码',
									key : 'platformNo',
									width : 120
								},{
									displayName : '主体编码',
									key : 'partyCode',
									width : 120
								},{
									displayName : '主体名称',
									key : 'partyName',
									width : 240
								},{
									displayName : '状态',
									key : 'partyStatus',
									align:'center',
									width : 50,render:function(record){
										if(record.partyStatus=='0')
											return "正常";
										else
											return "失效";
										}
								},{
									displayName : '注册时间',
									key : 'registeDate',
									align:'center',
									width : 60
								},{
									displayName : '失效时间',
									key : 'validEndDate',
									align:'center',
									width : 60
								},{
									displayName : '操作',
									key : 'action',
									width : 60,
									render : function(record) {
										var html = $('<div class="action"><a class="change" href="javascript:void(0);" title="修改"><i class="icon-edit"></i></a><a class="remove" href="javascript:void(0);" style="margin:0 8px;" title="删除"><i class="icon-remove"></i></a><div>');
										$('.change', html).click(
											function() {
												that.editParty(record);
											});
										$('.remove', html).click(
											function() {
												that.removeParty(record);
											});
										return html;
									}
								} ],
						toolbar : [ {
							eventId : 'add',
							text : '新增主体',
							icon : 'icon-plus'
						}, {
							eventId : 'remove',
							text : '删除主体',
							icon : 'icon-remove'
						}]
					});
			this.subscribe(list, 'add', this.addParty);
			this.subscribe(list, 'remove', this.removeParties);
			this.container.append(this.template);
		}
 
		PartyRegistList.prototype.addParty = function(record){
			var options = {};
			options.module = this.module;
			this.forward('v.views.backoffice.custom.partyRegist',options,function(p){
				p.addCrumb();
			});
		}
		PartyRegistList.prototype.editParty = function(record){
			var options = {};
			options.record = record;
			options.module = this.module;
			this.forward('v.views.backoffice.custom.partyRegistEdit',options,function(p){
				p.addCrumb();
			});
		}
		PartyRegistList.prototype.removeParty = function(record){
		    var that = this;
            var url = this.module+'/party!delete.action';
            V.confirm('是否删除主体'+record.partyName+'？',function(){
                $.ajax({
                    url:url,
                    type:'POST',
                    data:{id:record.id},
                    success:function(data){
                         if(data == 'success'){
                             V.alert('删除主体操作成功！');
                             that.list.refresh();
                         }
                         else{
                              V.alert(data);        
                         }
                    }
                })
            });
		}
		PartyRegistList.prototype.removeParties = function(){
            var that = this;
            var selected = that.list.getCheckedRecords();
            var selected_array = [];
            for (var i = 0; i < selected.length; i++){
                 selected_array[i] = selected[i].id;
            };
            if(selected_array.length == 0){
                V.alert("请选择主体记录！");
                return;
            }
            var url = this.module+'/party!deleteAll.action';
            V.confirm('是否进行批量删除主体操作？',function(){
                $.ajax({
                    url:url,
                    type:'POST',
                    data: {partyIds: selected_array.join(',')},
                    success:function(data){
                         //处理结果
                         if(data == 'success'){
                            V.alert("批量删除主体操作成功！");
                            that.list.refresh();
                         }
                         else{
                            V.alert(data);
                         }
                    }
                })
            });
        }
		PartyRegistList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'主体注册'}});
		}
		PartyRegistList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'主体注册'}});
		}
	})(V.Classes['v.views.backoffice.custom.PartyRegistList']);
}, {plugins:["v.views.component.searchList", "v.ui.grid","v.ui.dynamicGrid"]});