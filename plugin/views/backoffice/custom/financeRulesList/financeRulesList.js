/**
 * 财务规则定制列表-运维
 */
;V.registPlugin("v.views.backoffice.custom.financeRulesList",function(){
	V.Classes.create({
		className:"v.views.backoffice.custom.FinanceRulesList",
		superClass:"v.views.component.SearchList",
		init:function(){
            this.ns = "v.views.backoffice.custom.financeRulesList";
			this.module = '';
			this.options = {};
			this.form = new V.Classes["v.component.Form"]();
			this.list = new V.Classes['v.ui.Grid']();
		}
	});
	(function(FinanceRulesList){
       FinanceRulesList.prototype.initConditionForm = function(){
		    var Form = V.Classes['v.component.Form'];
			var items = [
				       	{
				       		label:'平台编码',
				       		type:Form.TYPE.TEXT,
				       		name:'platformNo',value:''
				       	},
				       	{
							label : '主体名称',
							type : Form.TYPE.TEXT,
							name : 'partyName',
							value : ''
						}
				];
			var itemsFilters = this.options.itemsFilters;
            if(itemsFilters){
                $.each(items,function(m,item){
                	var key = item.plugin||item.name;
                	item.value = itemsFilters[key]||'';
                });
            }
			this.form.init({
				colspan:3,
				items:items
			});
		};
		/*
        FinanceRulesList.prototype.initList = function(){
            var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			list.setFilters(this.options.filters);
            var that = this;
            list.init({
                container:$('.list',this.template),
                checkable:true,
				url:this.module+'/finance-rule!list.action',
                columns:[
                    {displayName:'标识',key:'id',width:120}
                    ,{displayName:'平台号',key:'platformNo',width:120}
                    ,{displayName:'操作',key:'action',width:50,render:function(record){
                        var html = $('<div class="action"><a class="change" href="javascript:void(0);" title="修改"><i class="icon-edit"></i></a></div>');
                        $('.change',html).click(function(){
                            that.editFinanceRule(record);
                        });
                        return html;
                    }}
                ],
                toolbar:[
			          //{eventId:'add',text:'新增角色',icon:'icon-plus'},
					  //{eventId:'remove',text:'删除角色',icon:'icon-remove'}
					  
				]
            });
            //this.subscribe(list,'add',this.editRole);
			//this.subscribe(list,'remove',this.removeRoles);
            this.container.append(this.template);
        };
        */
        FinanceRulesList.prototype.initList = function() {
			var list = this.list;
			var pagination = new V.Classes['v.ui.Pagination']();
			list.setPagination(pagination);
			list.setFilters(this.options.filters);
			var that = this;
			list.init({
				container : $('.list', this.template),
				checkable : true,
				url : this.module+ '/partyList.action',
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
							displayName : '操作',
							key : 'action',
							width : 40,
							render:function(record){
		                        var html = $('<div class="action"><a class="change" href="javascript:void(0);" title="修改"><i class="icon-edit"></i></a></div>');
		                        $('.change',html).click(function(){
		                            that.editFinanceRule(record);
		                        });
		                        return html;
		                    }
						} ]
			});
		}
        FinanceRulesList.prototype.removeRole = function(role){
        	var that = this;
        	role.modifyDate = null;
			var url = this.module+'/finance-rule!delete.action';
			V.confirm('是否删除财务规则？',function(){
	            $.ajax({
	            	url:url,
	               	type:'POST',
					data:JSON.stringify({role:role}),
					contentType:'application/json',
	                success:function(data){
	                	 if(data == 'success'){
		                     V.alert('删除财务规则操作成功！');
		                     that.list.refresh();
	                     } else if(data.msg="error"){
	                     	  V.alert(data.info);		
	                     }else{
	                    	 V.alert(data);		 
	                     }
	                }
	            })
         	});
        }
        FinanceRulesList.prototype.addRole = function(){
        	this.editFinanceRule();
		}
		FinanceRulesList.prototype.removeFinanceRule = function(){
			var that = this;
			var selected = that.list.getCheckedRecords();
			var selected_array = [];
			for (var i = 0; i < selected.length; i++){
				 selected_array[i] = selected[i].id;
			};
			if(selected_array.length == 0){
				V.alert("请选择财务规则记录！");
				return;
			}
			var url = this.module+'/finance-rule!deleteAll.action';
			V.confirm('是否进行批量财务规则操作？',function(){
	            $.ajax({
	            	url:url,
	               	type:'POST',
					data: {roleIds: selected_array.join(',')},
	                success:function(data){
	                     //处理结果
	                     if(data == 'success'){
	                     	V.alert("批量删除财务规则操作成功！");
							that.list.refresh();
	                     } else if(data.msg="error"){
	                     	  V.alert(data.info);		
	                     }else{
	                    	 V.alert(data);		 
	                     }
	                }
	            })
	      	});
		}
        FinanceRulesList.prototype.editFinanceRule = function(record){
        	this.options.module = this.module;
        	this.options.platformNo = record.platformNo;
        	this.options.party = record;
			this.forward('v.views.backoffice.custom.financeRules',this.options,function(p){
				p.addCrumb();
			});
		}
		FinanceRulesList.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'财务规则定制'}});
		}
		FinanceRulesList.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'财务规则定制'}});
		}
	})(V.Classes['v.views.backoffice.custom.FinanceRulesList'])
},{plugins:["v.ui.grid","v.views.component.searchList","v.ui.pagination","v.component.form"]});
