;V.registPlugin("v.ui.groupGrid",function(){
	V.Classes.create({
		className:"v.ui.GroupGrid",
		superClass:"v.ui.Grid",
		init:function(){
		    this.groupBar = [];
		}
	});
	(function(GroupGrid){
		GroupGrid.prototype.renderData = function(){
		    var cols = this.columns;
            var that = this;
            $('tbody',this.template).empty();
            var data = this.options.data || [];
            var cols_sum = $('thead th',this.template).length;
            if (data.length == 0) {
                var tr = $('<tr class="v-grid-tr"><td class="empty_data" colspan='+cols_sum+'>当前没有数据。</td></tr>');
                $('tbody', this.template).append(tr);
            }
            else {
                for (var i = 0, l = data.length; i < l; i++) {
                    //render groupBar
                    var groupData = data[i].groupData;
                    var groupTitle = data[i].groupTitle;
                    var summaryText = data[i].summaryText;
                    
                    var trGroup = $('<tr class="v-grid-tr groupBar" groupId="'+groupTitle+'"></tr>').data('group',data[i]);
                    
                    var tdGroup = $('<td class="td_chk" colspan='+cols_sum+'></td>').css({'background-color':'#eee'});
                    
                    var fold = $('<span><i class="icon-chevron-down"></i></span>').css({'cursor':'pointer'});
                    fold.click(function(){
                        var groupId = $(this).parent().parent().data('group').groupTitle;
                        if($('i',this).hasClass('icon-chevron-down')){
                            $('i',this).removeClass('icon-chevron-down').addClass('icon-chevron-right');
                            $('tr[groupId='+groupId+']:not(".groupBar")',that.template).slideUp();
                        }else{
                            $('i',this).removeClass('icon-chevron-right').addClass('icon-chevron-down');
                            $('tr[groupId='+groupId+']:not(".groupBar")',that.template).slideDown();
                        }
                    })
                    tdGroup.append(fold);
                    
                    if (this.options.checkable){
                        var td_chk = $('<span><input type="checkbox"/></span>');
                        $('input', td_chk).click(function(){
                            var group = $(this).parent().parent().parent().data('group');
                            var v = $(this).attr('checked') ? true : false;
                            group['checked'] = v;
                            $.each(group.groupData,function(index,record){
                                record['checked'] = v; 
                            });
                            
                            var groupId = group.groupTitle;
                            $('tr[groupId='+groupId+']',that.template).each(function(){
                                $('.td_chk input',this).attr('checked',v);
                            });
                        });
                        if (data[i]['checked'] == true) 
                            $('input', td_chk).attr('checked', true);
                        tdGroup.append(td_chk);
                    }
                    
                    tdGroup.append($('<span class="title">'+groupTitle+'</span>'));
                    tdGroup.append($('<span class="summary">'+summaryText+'</span>'));
                    
                    trGroup.append(tdGroup);
                    
                    $('tbody', this.template).append(trGroup);
                    
                    //render每行数据
                    for(var a = 0, b = groupData.length; a < b; a++){
                        var record = groupData[a];
                        var tr = $('<tr class="v-grid-tr" groupId="'+groupTitle+'"></tr>').data('record', record);
                        if (this.options.checkable) {
                            var td_chk = $('<td class="td_chk" align="center"><input type="checkbox"/></td>');
                            $('input', td_chk).click(function(){
                                var v = $(this).attr('checked') ? true : false;
                                var record = $(this).parent().parent('tr').data('record');
                                record['checked'] = v;
                            });
                            if (record['checked'] == true) 
                                $('input', td_chk).attr('checked', true);
                            tr.append(td_chk);
                        }
                        for (var j = 0, s = cols.length; j < s; j++){
                            //render每个cell
                            var isShow = cols[j].options.isShow;
                            if(!isShow){
                                continue;
                            }
                            var key = cols[j].options.key;
                            var value = record[key] || '';
                            var editor = cols[j].options.editor;
                            var td = $('<td></td>').css('text-align',cols[j].options.align);
                            if (cols[j].options.render) {
                                var html = cols[j].render(record);
                                td.append(html);
                            }
                            else {
                                td.text(value);
                            }
                            if(that.options.editable && editor){
                                td.data('editor',editor);
                                td.click(function(){
                                    if($('.edit',this).length >0){
                                        return false;
                                    }else{
                                         var e = $(this).data('editor');
                                         var colIndex = $(this).index();
                                         var key = $('.grid_table thead th:eq('+colIndex+')',that.template).attr('data-col');
                                          e.defaultValue = record[key];
                                         var _record_index = $(this).parents('.v-grid-tr').index();
                                         var _editor = that.getEditor(e,that.options.data[_record_index],key);
                                         _editor.width(td.width());
                                         _editor.click(function(e){
                                            e.stopPropagation();
                                         })
                                         $(this).append(_editor);
                                    }
                                })
                            }
                            tr.append(td);
                        }
                        $('tbody', this.template).append(tr);
                    }
                    
                }
            }
            this.publish({eventId:this.EVENT.DATA_LOADED,data:this});
		}
		//获取checked的数据
        GroupGrid.prototype.getCheckedRecords = function(){
            var data = this.options.data;
            var records = [];
            $.each(data,function(i,v){
                var groupData = v.groupData;
                $.each(groupData,function(j,w){
                    if(w.checked){
                        records.push(w);
                    }
                })
            })
            return records;
        };
	})(V.Classes['v.ui.GroupGrid']);
},{plugins:["v.ui.dialog"]});
