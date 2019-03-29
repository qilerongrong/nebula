;V.registPlugin("v.ui.grid",function(){
	V.Classes.create({
		className:"v.ui.Grid",
		superClass:"v.Plugin",
		init:function(){
            this.ns = 'v.ui.grid';
            this.columns = [];
			this.pagination = null;
			this.filters = {};
			this.checkedKeys = {};//{key:record}
            this.options = {
                columns:[],
                checkable:false,//是否有checkbox
                hasSequenceNumber:false,//是否带序号列
                isSingleChecked:false,//是否只能单选
				editable:false,//是否可编辑
				sortable:true,//是否可排序
				url:null,
                width:'100%',
				height:'auto',
				hasAllChecked:false,//是否带全选（所有page）
				isAllPagesChecked:false,//是否全选;
				primaryKey:null,//定义主键，目前用于存储跨页多选
                data:[],
                toolbar:[],
                hasColumnsPicker:false,  //是否设置columns picker
                docketType:null,         //单据类型(columns picker)
                docketModule:null,       //单据模块(columns picker)
                isDetail:false,          //用户习惯新增，默认查询头(columns picker)
				subrowRender:null,
				actionColumnPosition:'end' //start or end
            }
			this.EVENT = {
				DATA_LOADED:'data_loaded',
				DATA_RETRIEVED:'data_retrieved',
			    INITED:'inited',
				AFTEREDIT:'after_edit'
			}
			 this.template = $('<div class="v-grid">\
					 <div class="grid_toolbar"></div>\
					 <div class="grid_table" style="position:relative;z-index:1;overflow:auto;">\
					 <div class="table_header" style="position:relative;left:0;top:0;width:100%;"><table class="table-striped table-bordered table-condensed"><thead class="v-thead"><tr></tr></thead></table></div>\
					 <div class="table_data" style="">\
					 <table class="table table-striped table-bordered table-hover">\
					 <tbody></tbody>\
					 </table></div></div>\
					 <div class="grid_pagination" style="z-index:2"></div></div>');
           //toolbar:add,remove,refresh,
		}
	});
	(function(Grid){
        Grid.prototype.init = function(options){
        	var that = this;
			if(options.container){
				this.container = options.container;
			    delete options['container'];
			}
			this.container&&this.container.append(this.template);
            this.url = options.url;
			delete options.url;
            for(prop in options){
			    this.options[prop] = options[prop];
			}
			this.renderToolbar(this.options.toolbar);
			// $('.grid_table',this.template).css({
			// 	height: this.options.height
			// });
            this.initGrid();
			this.initEvent();
        };
        Grid.prototype.initGrid = function(){
        	this.renderGridHeader();
			if(this.url){
				this.retrieveData();
			}else{
				this.renderData();
			}
			if(this.pagination){
				var that = this;
				this.subscribe(this.pagination,this.pagination.EVENT.EVENT_JUMP,function(data){
					var page = data.page;
					that.jumpTo(page);
				});
			}
        }
        Grid.prototype.renderGridHeader = function(){
        	var cols = this.options.columns;
			//设置checkbox列
            var lastShowTh = {};
            var actionCol;
            this.columns = [];
            var that = this;
            var actionColumn = null;
            var actionTH = null;
            for(var i=0,l=cols.length;i<l;i++){
                var col = new V.Classes['v.ui.Column']();
                var opt = cols[i];
                opt.container = $('thead',this.template);
                col.init(opt);
				var isShow = col.options.isShow;
				if(!isShow){
					continue;
				}
                var th = $('<th data-col='+col.options.key+' sort='+col.options.isSortable+'>'+col.options.displayName+'</th>').css({width:col.options.width});
				if(col.options.key == 'action'){
					th.addClass('actions');
					actionColumn = col;
					actionTH = th;
				}else{
					$('.table_header thead tr',this.template).append(th);
					this.columns.push(col);
				}
				lastShowTh = th;
            }
            if(actionColumn){
            	if(that.options.actionColumnPosition == 'start'){
            		$('.table_header thead tr',this.template).prepend(actionTH);
            		this.columns.unshift(actionColumn);
            	}else{
            		$('.table_header thead tr',this.template).append(actionTH);
            		this.columns.push(actionColumn);
            	}
            }
            if(this.options.hasSequenceNumber){
                var th_sequence = $('<th class="th_seq">序号</th>');
                $('thead tr',this.template).prepend(th_sequence);
            }
            if(this.options.checkable){
            	var that = this;
            	if(!this.options.isSingleChecked){
            		var all_checked_text = "全选";
            		if(this.pagination){
            			all_checked_text = this.getLang("TIP_THE_PAGE");
            		}
            		var th_chk = $('<th class="th_chk" align="center"><span style="margin:0 2px"><input class="thepage" type="checkbox"/></span></th>');
            		if(this.options.hasAllChecked){
            			var allchk = $('<span style="margin:0 2px"><input class="allpage" type="checkbox"/>'+this.getLang("TIP_ALL")+'</span>');
            			$('.allpage',allchk).click(function(){
            				var checked = $(this).attr('checked')?true:false;
            				that.allPagesCheck(checked);
            			});
            			th_chk.append(allchk);
            		}
                    $('.thepage',th_chk).click(function(){
                        var v = $(this).attr('checked');
                        if(v){
                            $('tbody .td_chk input',that.template).attr('checked',true);
                			$.each(that.options.data,function(index,record){
                				record['checked'] = true;
                			});
                        }else{
                            $('tbody .td_chk input',that.template).attr('checked',false);
                            $.each(that.options.data,function(index,record){
                				record['checked'] = false; 
                			});
                        }
                    });
                    $('thead tr',this.template).prepend(th_chk);
            	}
            	else{
            		$('thead tr',this.template).prepend('<th class="th_chk"></th>');
            	}
                
            }
            if(this.options.hasColumnsPicker){
			    this.columnsPickerHandler(cols, lastShowTh);
			}
        }
        Grid.prototype.saveUserCustom = function(userCustoms){
        	var that = this;
        	$.ajax({
				url:'common!saveUserCustom.action',
				type:'POST',
				data:JSON.stringify({
					userCustoms: userCustoms
				}),
				contentType:'application/json',
				success:function(data){
					if(data=='success')
						that.repaint();
				}
			})
        }
		Grid.prototype.initEvent = function(){
			var that = this;
			if(this.options.sortable){
				$('th:not(.actions)[sort=true]',this.template).hover(function(){
					if($(this).hasClass('ascending') || $(this).hasClass('descending')){
						return false;
					}
				    $(this).css('background-position','right center');
			    },function(){
					if($(this).hasClass('ascending') || $(this).hasClass('descending')){
						return false;
					}
			   	     $(this).css('background-position','-20px center');
			    })
			    .toggle(function(){
					var key = $(this).attr('data-col');
					var ascending = -1;
					$('th',that.template).removeClass('ascending').removeClass('descending').css('background-position','-20px center');
					$(this).addClass('descending').css('background-position','right center');
					that.sort(key,ascending);
				 },function(){
					var key = $(this).attr('data-col');
					var ascending = 1;
					$('th',that.template).removeClass('ascending').removeClass('descending').css('background-position','-20px center');
					$(this).addClass('ascending').css('background-position','right center');
					that.sort(key,ascending);
				 });
			}
			// $('.table_data',this.template).unbind('scroll').scroll(function(){
			// 	var div = this;
			// 	setTimeout(function(){
			// 		var scrollLeft = $(div).scrollLeft();
			// 		var _tbodyW = $('.table_header',that.template);
			// 		var _wraperW = $('.grid_table',that.template);
			// 		if(scrollLeft == 0){
			// 			$('.table_header',that.template).css('left',0);
			// 			return;
			// 		}else if(scrollLeft>=_tbodyW-_wraperW-16){
			// 			//$('.table_header',that.template).css('right',0);
			// 		}else{
			// 			$('.table_header',that.template).css('left',0-scrollLeft);
			// 		}
			// 	},100);
			// });
			$('.table_data .v-grid-tr',this.template.get(0)).live('hover',function(){
					$(this).addClass('v-tr-hover');
				},function(){
					$(this).removeClass('v-tr-hover');
			    }
			)
			//多个gird实例会在body上绑定多次此事件 TODO
			if(this.options.editable){
				$('body').click(function(){
					$('.edit',that.template).remove();
				})
			}
		};
		//刷新并显示当前页
        Grid.prototype.refresh = function(){
			if(this.url){
				this.retrieveData();
			}else{
				this.renderData();
			}
			if(this.options.checkable){
				$('.th_chk input',this.template).attr('checked',false);
			}
        };
		//从刷新并显示第一页的数据
		Grid.prototype.reload = function(){
			delete this.filters["page"];
			this.refresh();
		}
		//跳往第几页
		Grid.prototype.jumpTo = function(page){
			this.filters["page"] = {"pageNo":page,"pageSize":this.pagination.options.pageSize};
			this.retrieveData();
			//$('.th_chk input',this.template).attr('checked',false);
		};
		//设置分页
		Grid.prototype.setPagination = function(p){
		    this.pagination = p;
		};
		//设置数据过滤条件
		Grid.prototype.setFilters = function(f){
			this.filters = f||{};
		};
		//为grid设置数据
        Grid.prototype.setData =function(d){
			if(this.pagination){
				this.pagination.init({
					container:$('.grid_pagination',this.template),
					current : d.pageNo,
					total : d.totalPages,
					count : d.totalCount,
					pageSize : d.pageSize
				});
				this.options.data = d.result;
			}else{
				this.options.data = d;
			}
        }
        Grid.prototype.getData = function(){
        	return this.options.data;
        }
		//获取server端数据
		Grid.prototype.retrieveData = function(){
			$('thead .th_chk .thepage',this.template).attr('checked',false);
			if(this.options.isAllPagesChecked){
				$('thead .th_chk input',this.template).attr('checked',true);
			}else{
				$('thead .th_chk input',this.template).attr('checked',false);
			}
			var mask = null;
			var that = this;
			$.ajax({
				url:this.url,
				type:'POST',
				data:JSON.stringify({
					filterList: this.filters
				}),
				contentType:'application/json',
				dataType:'json',
				beforeSend:function(){
					var thead_height = $('.table_header',that.template).height();
					$('.grid_table',that.template).height(126);
					var t_height = 100;
					if($('.grid_table tr',that.template).length > 1){
						t_height = parseInt($('.grid_table',that.template).height());
					}else{
						//如果没有数据，则loadingmask时先将grid高度设置为126,；remove后恢复为auto；
						$('.grid_table',that.template).height(126);
					}
					var css = {
						top:thead_height,
						left:0,
						position:'absolute',
						opacity:0.7,
						zIndex:9999,
						background:'#efefef url(imgs/loading_16.gif) center no-repeat',
						height:t_height,
						width:'100%'
					}
					
					mask = V.mask($('.grid_table',that.template),css);
				},
				success:function(data){
					V.unMask(mask);
					$('.grid_table',that.template).height('auto');
					that.setData(data);
					that.publish({eventId:that.EVENT.DATA_RETRIEVED,data:this});
					that.renderData();
					
					// $('.grid_table',that.template).height(that.options.height);
				},
				error:function(){
					V.unMask(mask);
					$('.grid_table',that.template).height('auto');
					// $('.grid_table',that.template).height(that.options.height);
				}
			})
		}
		//渲染数据
		Grid.prototype.renderData = function(){
			var cols = this.columns;
			var that = this;
			$('.table_data tbody',this.template).empty();
			var data = this.options.data || [];
			var cols_sum = $('thead th',this.template).length;
			var _tdH = $('.table_header',that.template).height();
			var pagination = this.pagination;
			// if(_tdH!=0){
			// 	$('.table_data',that.template).css('margin-top',_tdH+'px');
			// }
			if (data.length == 0) {
				var tr = $('<tr class="v-grid-tr"><td class="empty_data" colspan='+cols_sum+'>'+this.getLang("TIP_DATA_IS_EMPTY")+'</td></tr>');
				$('tbody', this.template).append(tr);
				$('.table_data',this.template).css('height','auto');
			}
			else {
				for (var i = 0, l = data.length; i < l; i++) {
					//render每行数据
					var record = data[i];
					this.renderRow(record);
				}
				//设置垂直滚动条
				var _tbodyH = $('.table_data table',that.template).height();
				var _tbodyW = $('.table_data table',that.template).width();
				if(that.options.height!="auto"&&_tbodyH > that.options.height){
					$('.table_data',that.template).height(that.options.height-_tdH);
					var _w = _tbodyW
//					if($.browser.msie){
//						_w -= 16;
//					}else{
//						_w += 16;
//					}
					_w -= 16;
					$('.table_header',that.template).width(_w);
				}else{
					$('.table_header',that.template).width(_w);
					$('.table_data',that.template).height('auto');
				}
				// $('.table_data',that.template).width(_tbodyW);
				var isAllChecked = ($('.v-grid-tr input:checked',that.template).length == $('.v-grid-tr input',that.template).length);
				if(isAllChecked){
					$('thead .th_chk .thepage',that.template).attr('checked',true);
				}else{
					//非全选则去掉头部的check状态。
					$('thead .th_chk .thepage',that.template).attr('checked',false);
				}
				if(this.options.isAllPagesChecked){
					$('tr .td_chk input',this.template).attr("checked",true);
				}
				$('tr .td_chk input',this.template).attr("disabled",this.options.isAllPagesChecked?true:false);
			}
			this.publish({eventId:this.EVENT.DATA_LOADED,data:this});
		};
		//获取可编辑元素
		Grid.prototype.getEditor = function(e,record,key,td){
			var that = this;
			var cell = $(td);
			var w = cell.innerWidth();
			var h = cell.innerHeight();
			var editor_type = e.dataType;
			var div = $('<div class="edit" style="position:absolute;top:0;left:0;background:#fff;border:1px solid #ccc;box-shadow:0px 1px 1px 1px #fff;"><div style="overflow:hidden;"><button class="btn btn-mini submit" style="float:right;margin:4px 0">保存</button></div></div>');
			div.width(w-2);
			var editor = V.Classes['v.ui.Column'].EDITOR[editor_type];
			var _editor = editor.editor(e);
			_editor.width(w-2).height(h-2);
			div.prepend(_editor);
			div.click(function(e){
				e.stopPropagation();
			});
			$('.submit',div).click(function(){
				if(!e.isValid){
					return false;
				}
//				record[key] = editor.getValue();
//				that.renderRow(record,true);
				var editobj ={};
				editobj[key] = record[key]; 
				div.remove();
				that.publish({eventId:that.EVENT.AFTEREDIT,data:{record:record,key:key,newValue:editor.getValue()}});
			});
			return div;
		}
		//删除一行数据
		Grid.prototype.removeRecord = function(record){
			var data = this.options.data;
			$.each(data,function(i){
				if(this == record){
				    data.splice(i,1);
					return false;
				}
			});
			if(this.url){
				this.retrieveData();
			}else{
				this.renderData();
			}
		}
		//更新一行数据
		Grid.prototype.updateRecord = function(old,record){
			var data = this.options.data;
			$.each(data,function(i){
				if(this == old){
				    data.splice(i,1,record);
					return false;
				}
			});
			this.renderData();
		}
		//渲染某一行数据
		Grid.prototype.renderRow = function(record,isRerender){
			var tr = $('<tr class="v-grid-tr"></tr>').data('record', record);
			var index = this.getRecordIndex(record);
			if(isRerender){
				tr = $('.table_data .v-grid-tr:eq('+index+')',this.template).data('record',record).empty();		
			}else{
				if(index>0){
					$('.table_data .v-grid-tr:eq('+(index-1)+')',this.template).after(tr);
				}else{
					$('.table_data tbody',this.template).append(tr);
				}
				
			}
			var that = this;
			if (this.options.checkable) {
				var td_chk = $('<td class="td_chk" align="center"><input type="checkbox"/></td>');
				$('input', td_chk).click(function(){
					var v = $(this).attr('checked') ? true : false;
					if(that.options.isSingleChecked&&v){
						$('.v-grid-tr .td_chk input',that.template).each(function(){
							$(this).attr('checked',false);
							var record = $(this).parent().parent('tr').data('record');
							record['checked'] = false;
						});
						$(this).attr('checked',true);
					}
					var record = $(this).parent().parent('tr').data('record');
					record['checked'] = v;
					var isAllChecked = ($('.v-grid-tr input:checked',that.template).length == $('.v-grid-tr input',that.template).length);
					if(isAllChecked){
						$('thead .th_chk input',that.template).attr('checked',true);
					}else{
						//非全选则去掉头部的check状态。
						$('thead .th_chk input',that.template).attr('checked',false);
					}
					//DOTO for 跨页选择
					//that.syncCheckedIds(record,v);
				});
				if (record['checked'] == true) 
					$('input', td_chk).attr('checked', true);
				tr.append(td_chk);
			}
			if(this.options.hasSequenceNumber){
				var td_seq = $('<td class="td_seq"></td>');
				var seq_index = i+1;
				if(pagination){
					var currentPage = pagination.options.current;
				    var pageSize = pagination.options.pageSize;
				    seq_index = pageSize*(currentPage-1)+i+1;
				}
				td_seq.text(seq_index);
				tr.append(td_seq);
			}
			var cols = this.columns;
			for (var j = 0, s = cols.length; j < s; j++){
				//render每个cell
				var isShow = cols[j].options.isShow;
				if(!isShow){
					continue;
				}
				var key = cols[j].options.key;
				//var value = record[key] || '';
				var value = record[key];
                if(value===null||value===undefined){
                	value = ''
                }
				var editor = cols[j].options.editor;
				var td = $('<td></td>').css('text-align',cols[j].options.align);
				td.width(cols[j].options.width||"auto");
				if (cols[j].options.render) {
					var html = cols[j].render(record);
					td.append(html);
				}
				else {
					td.text(value);
					td.attr('title',value);
				}
				if(that.options.editable && editor){
					td.data('editor',editor);
					td.hover(function(){
						$(this).addClass('editable');
					},function(){
						$(this).removeClass('editable');
					})
					td.click(function(event){
						 event.stopPropagation();
						 $('.edit',that.template).remove();
						 var e = $(this).data('editor');
						 var colIndex = $(this).index();
					     var key = $('.grid_table thead th:eq('+colIndex+')',that.template).attr('data-col');
						 var _record_index = $(this).parents('.v-grid-tr').index();
						 e.defaultValue = that.options.data[_record_index][key];
			             var _editor = that.getEditor(e,that.options.data[_record_index],key,this);
						 var p = $(this).position();
						 _editor.css(p);
						 $('.grid_table',that.template).append(_editor);
							 // $(this).empty().append(_editor);
					});
				}
				tr.append(td);
			}
		}
		//设置toolbar
		Grid.prototype.setToolbar = function(btns){
			var that = this;
			var toolbars = btns || [];
			if(toolbars.length > 0){
				this.toolbar = new V.Classes['v.ui.Toolbar']();
				this.toolbar.init({
					container:that.getToolbarPlaceholder(),
					btns:toolbars
				});
				$.each(toolbars,function(){
					var btn = this;
					that.subscribe(that.toolbar,this.eventId,function(){
						that.publish({eventId:btn.eventId});
					})
				});
			}
		}
		//新增toolbar的tool或设置toolbar
		Grid.prototype.addTools = function(tools){
			var that = this;
			if (this.toolbar) {
				$.each(tools, function(){
					that.toolbar.addTool(this);
					var btn = this;
					that.subscribe(that.toolbar, this.eventId, function(){
						that.publish({
							eventId: btn.eventId
						});
					});
				})
			}
			else {
					this.toolbar = new V.Classes['v.ui.Toolbar']();
					this.toolbar.init({
						container: that.getToolbarPlaceholder(),
						btns: tools
					});
					$.each(tools, function(){
						var btn = this;
						that.subscribe(that.toolbar, this.eventId, function(){
							that.publish({
								eventId: btn.eventId
							});
						});
					});
			}
		}
		//获取checked的数据;获取本页被选中的record
		Grid.prototype.getCheckedRecords = function(){
			var data = this.options.data;
			var records = [];
			$.each(data,function(i,v){
				if(v.checked){
					records.push(v);
				}
			})
			return records;
		};
		//获取checked的keys;用于跨页check的问题；TODO
		Grid.prototype.getCheckedKeys = function(){
			if(this.options.isAllPagesChecked){
				return "all";
			}else{
				//TODO 实现跨页
				var　records = this.getCheckedRecords();
//				var primaryKey = this.options.primaryKey;
//				var ids = [];
//				if(primaryKey){
//					$.each(records,function(){
//						ids.push(this[primaryKey]);
//					});
//					return ids;
//				}
				return records;
			}
		}
		Grid.prototype.allPagesCheck = function(v){
			this.options.isAllPagesChecked = v?true:false;
			$('.th_chk .thepage,tr .td_chk input',this.template).attr("checked",this.options.isAllPagesChecked).attr("disabled",this.options.isAllPagesChecked);
		}
		//同步checked信息;action = true/false(check/uncheck);
		Grid.prototype.syncCheckedIds = function(record,action){
			var records = this.checkedKeys;
			if(action == "1"){
				records[record[this.options.primaryKey]+''] = record;
			}else if(action == "-1"){
				delete record[record[this.options.primaryKey]+''];
			}
		}
		//获取某行数据在当前list的索引
		Grid.prototype.getRecordIndex = function(record){
			var index = null;
			$.each(this.options.data,function(i){
				if(this == record){
					index = i;
					return false;
				}
			});
			return index;
		};
		//设置放置toolbar的dom
		Grid.prototype.setToolbarPlaceholder = function(placeholder){
			this.toolbarPlaceholder = placeholder;
		}
		Grid.prototype.getToolbarPlaceholder = function(){
			return this.toolbarPlaceholder || $('.grid_toolbar',this.template);
		}
		//渲染toolbar
		Grid.prototype.renderToolbar = function(btns){
			this.addTools(btns);
		};
		//重新画出grid
		Grid.prototype.repaint = function(){
			$('.table_header tr',this.template).empty();
			$('.table_data tbody',this.template).empty();
			this.renderGridHeader();
			this.renderData();
			this.initEvent();
		};
		//渲染某行的附加行信息
		Grid.prototype.renderSubrow = function(record){
			if(this.options.subrowRender){
				var subrow = $('<tr class="v-grid-subrow"></tr>');
				var con = $('<td></td>').attr('colspan',this.options.columns.length);
				con.append(this.options.subrowRender(record));
				subrow.append(con);
				var index = this.getRecordIndex(record);
			    $('.v-grid-tr:eq('+index+')',this.template).after(subrow);
			}
		};
		//排序；ascending 1为升序，-1为降序
		Grid.prototype.sort = function(key,ascending){
		    this.filters['sortby'] = key;
			this.filters['ascending'] = ascending;	
			this.retrieveData();
		}
		//columns picker handler
		Grid.prototype.columnsPickerHandler = function(cols){
		    var that = this;
		    var th = $('.grid_table th:last',this.template);
            th.addClass('picker');
            th.append('<i class="icon-wrench picker_i"></i>');
            th.click(function(e){
            	if($('#picker')[0]!=null) return; 
                var divPicker = $('<div id="picker" class="picker_div"></div>');
                divPicker.append('<div class="picker_title">'+that.getLang("TIP_USER_HABITS")+'</div>');
                
                var pickerCols = $.map(cols,function(ele){
                	var tmp = {};
                	for(key in ele){
                		tmp[key] = ele[key];
                	}
                	return tmp;
                });
                
                for(var i=0,l=pickerCols.length;i<l;i++){
                    var column = pickerCols[i];
                    if(column.isBlock) continue;
                    if(column.key=='action') continue;
                    
                    var name = column.displayName;
                    var fieldName = column.fieldName;
                    var checkStatus = column.isShow;
                    var check;
                    if(checkStatus)
                        check = $('<input index='+i+' name="'+fieldName+'" type="checkbox" checked>');
                    else
                        check = $('<input index='+i+' name="'+fieldName+'" type="checkbox">');
                    check.click(function(){
                        var index = $(this).attr('index');
                        if($(this).attr('checked')=='checked')
                        	pickerCols[index].isShow = true;
                        else
                        	pickerCols[index].isShow = false; 
                    }); 
                        
                    var item = $('<div class="picker_item"></div>');
                    item.append(check).append(name);
                    divPicker.append(item);
                }
                var tool = $('<div style="text-align:center"><p style="clear:both"></p><button class="btn btn-mini btn-close">'+that.getLang("TIP_CLOSE")+'</button><button style="margin-left:10px" class="btn btn-mini btn-primary btn-save">'+that.getLang("TIP_SAVE")+'</button></div>');
                $('.btn-close',tool).click(function(event){
                	divPicker.remove();
                    event.stopPropagation();
                });
                $('.btn-save',tool).click(function(event){
                    var userCustoms = [];
                    
                    for(var i=0; i<pickerCols.length; i++){
                        if(pickerCols[i].isBlock) continue;
                        if(pickerCols[i].key=='action') continue;
                        
                        var custom = $(pickerCols[i]).attr('isShow');
                        if(custom){
                            var tmp = {};
                            tmp['fieldName'] = pickerCols[i].fieldName;
                            tmp['docketType'] = that.options.docketType;
                            tmp['docketModule'] = that.options.docketModule;
                            tmp['isDetail'] = that.filters.showDetail||that.options.isDetail;
                            userCustoms.push(tmp);
                        }
                    }
                    if(userCustoms.length==0){
                        V.alert(that.getLang("MSG_CHOOSE_AT_LEAST_ONE"));
                        return false;
                    }
                    divPicker.remove();
                    that.options.columns = pickerCols;
                    that.saveUserCustom(userCustoms);
                    event.stopPropagation();
                });
                divPicker.append(tool);
                
                //$('.grid_table',that.template).parent().append(div);
                $('body').append(divPicker);
                $('.grid_table',that.template).parent().attr('style','position:relative');
                
                //计算高度空间，columns picker放在上面或者下面
                //var gridHeight = $('.grid_table',that.template).parent().outerHeight();
                var t_top = $('.grid_table',that.template)[0].getBoundingClientRect().top;
                var t_left = $('.grid_table',that.template)[0].getBoundingClientRect().right;
                var divHeight = divPicker.outerHeight();
                var divWidth = divPicker.outerWidth();
                var win_height = $(window).height();
                var scrollTop = $(window).scrollTop();
                var scrollLeft = $(window).scrollLeft();
                if(t_top>divHeight){
                    //divPicker.css({'bottom': gridHeight+'px','z-index':'20000'});
                	divPicker.css({right:56,top:t_top+scrollTop-divHeight});
                }else{
                    //divPicker.css({'top':'29px','z-index':'20000'});
                	divPicker.css({right:56,top:t_top+scrollTop+29});
                }
                divPicker.css({left:t_left+scrollLeft-divWidth,'z-index':'99999'});
            });
		}
	})(V.Classes['v.ui.Grid'])
},{plugins:["v.ui.column","v.ui.toolbar"]})
