;V.registPlugin("v.views.book.demoEdit",function(){
	V.Classes.create({
		className:"v.views.book.DemoEdit",
		superClass:"v.Plugin",
		init:function(){
            this.ns = "v.views.book.demoEdit";
            this.template = $('<div class="docket2"><div class="con"></div><div class="btns"><a href="javascript:void(0);" class="btn"><i class="icon-add"></i>按钮1</a></a><a href="javascript:void(0);" class="btn forward">跳转</a></div></div>');
            this.options = {};
		}
	});
	(function(Plugin){
		Plugin.prototype.init = function(options){
			this.container = options.container;
			$.extend(true,this.options,options);
			this.container.append(this.template);
			this.initFormBlock();
			this.initList1Block();
			this.initList2Block();
			this.initDemo1Feature();
			this.initEvent();
		}
		Plugin.prototype.initEvent = function(){
			var that = this;
			$('.v-box :input',this.template.get(0)).live('keydown',function(e){
				if(e.keyCode == 13){
					var index = $('.v-box :input',that.template).index(this);
				    $('.v-box :input:eq('+(index+1)+')',that.template).focus();
				}
			});
			$('.forward',this.template).click(function(){
				that.forwardExample();
			});
		}
		Plugin.prototype.initDemo1Feature = function(){
			var box = this.addBox("FromToList");
			var fromToList = new V.Classes['v.ui.FromToList']();
			fromToList.init({
				container:$('.v-box-con',box),
				uniqueKey:'key',
				displayField:'text',
				sourceData:[
				    {key:'key1',text:'item1'},
				    {key:'key2',text:'item2'},
				    {key:'key3',text:'item3'},
				    {key:'key4',text:'item4'},
				    {key:'key5',text:'item5'}
				],
				targetData:[
				    {key:'key6',text:'item6'},
				    {key:'key7',text:'item7'},
				    {key:'key8',text:'item8'},
				    {key:'key9',text:'item9'},
				    {key:'key10',text:'item10'}
				]
			})

		}
		Plugin.prototype.initFormBlock = function(){
			var box1 = this.addBox("Info1");
			var Form = V.Classes['v.component.Form'];
			this.form1 = new Form();
			this.form1.init({
				colspan:3,
				items:[
				    {label:'Label1',name:'name1',type:Form.TYPE.TEXT,required:true}
				    ,{label:'Label2',name:'name2',type:Form.TYPE.TEXT,disabled:true}
				    ,{label:'Label3',name:'name3',type:Form.TYPE.TEXT}
				    ,{label:'Label4',name:'name4',type:Form.TYPE.SELECT,multiList:[["选项1",1],["选项2",2],["选项3",3]],value:1}
				    ,{label:'Label24',name:'name24',type:Form.TYPE.SELECT,multiList:[["选项1",1],["选项2",2],["选项3",3]],value:1,autocomplete:true}
				    ,{label:'Label14',name:'name14',type:Form.TYPE.RADIO,multiList:[["选项1",1],["选项2",2]],value:1}
				    ,{label:'Label5',name:'name5',type:Form.TYPE.TEXT,value:'item5'}
				    ,{label:'Label6',name:'name6',type:Form.TYPE.TEXT,value:'item6',readonly:true}
				    ,{label:'Label7',name:'name7',type:Form.TYPE.TEXT,colspan:2}
				    ,{label:'Label8',name:'name8',type:Form.TYPE.TEXTAREA,colspan:3}
				    ,{label:'Label9',name:'name9',type:Form.TYPE.CUSTOM,colspan:3,render:function(config){
				    	var html = $('<div></div>');
				    	var editor = new V.Classes['v.ui.Fckeditor']();
				    	editor.init({
				    		container:html,
				    		data:"123"
				    	});
				    	// editor.setData("123");
				    	return html;
				    }}
				],
				container:$('.v-box-con',box1).addClass('docket')
			});
		}
		Plugin.prototype.addBox = function(title,noToggle){
			var box = $('<div class="v-box"><div class="v-box-tit">'+title+'<span class="btn_toggle toggle_up"></span></div><div class="v-box-con"></div></div>');
			if(noToggle){
				$('.btn_toggle',box).hide();
			}
			$('.btn_toggle',box).toggle(function(){
				$(this).parents('.v-box').children('.v-box-con').slideUp('normal','linear');
				$(this).removeClass('toggle_up').addClass('toggle_down');
			},function(){
				$(this).parents('.v-box').children('.v-box-con').slideDown('normal','linear');
				$(this).removeClass('toggle_down').addClass('toggle_up');
			})
			$('.con',this.template).append(box);
			return box;
		}
		Plugin.prototype.initList1Block = function(){
			var box = this.addBox("Info2",true);
			var list = new V.Classes['v.ui.Grid']();
			list.init({
				container:$('.v-box-con',box),
				columns:[
				    {displayName:'Column1',key:'key1'}
				    ,{displayName:'Column2',key:'key2'}
				    ,{displayName:'Column3',key:'key3',render:function(record){
				    	var html = $("<div><input></input></div>");
				    	$('input',html).change(function(){
				    		record.key3 = $(this).val();
				    	});
				    	return html;
				    }}
				    ,{displayName:'Column4',key:'key4'}
				    ,{displayName:'Column5',key:'key5'}
				    ,{displayName:'Column6',key:'key6',render:function(record){
				    	var html = $("<div><input></input></div>");
				    	$('input',html).change(function(){
				    		record.key3 = $(this).val();
				    	});
				    	return html;
				    }}
				],
				data:[
				    {key1:'Value1',key2:'Value2',key3:'Value3',key4:'Value4',key5:'Value5',key6:'Value6',key7:'Value7'}
				]
			});
		}
		Plugin.prototype.initList2Block = function(){
			var box = this.addBox("Info3");
			var list = new V.Classes['v.ui.Grid']();
			list.init({
				container:$('.v-box-con',box),
				columns:[
				    {displayName:'Column1',key:'key1'}
				    ,{displayName:'Column2',key:'key2',align:'left'}
				    ,{displayName:'Column3',key:'key3',render:function(record){
				    	var html = $("<div><input></input></div>");
				    	$('input',html).change(function(){
				    		record.key3 = $(this).val();
				    	});
				    	return html;
				    }}
				    ,{displayName:'Column4',key:'key4',align:'center'}
				    ,{displayName:'Column5',key:'key5',align:'left'}
				    ,{displayName:'Column6',key:'key6',render:function(record){
				    	var html = $("<div><input></input></div>");
				    	$('input',html).change(function(){
				    		record.key3 = $(this).val();
				    	});
				    	return html;
				    }}
				    ,{displayName:'Column7',key:'action',render:function(record){
				    	var html = $('<div><a href="javascript:void(0);" class="btn btn-remove"><i class="icon-add"></i>删除</a></div>');
				    	$('.btn-remove',html).click(function(){
				    		list.removeRecord(record);
				    	});
				    	return html;
				    }}
				],
				data:[
				    {key1:'Value1',key2:'Value2',key3:'Value3',key4:'Value4',key5:'Value5',key6:'Value6',key7:'Value7'}
				]
			});
			$('tr input:last',list.template.get(0)).live('keydown',function(e){
				if(e.keyCode == 13){
					var record = {key1:'Value1',key2:'Value2',key3:'Value3',key4:'Value4',key5:'Value5',key6:'Value6',key7:'Value7'};
				    list.getData().push(record);
				    list.renderRow(record);
				}
			})
		}
		Plugin.prototype.forwardExample = function(){
			this.forward("v.views.book.demoEdit2",{},function(inst){
				inst.addCrumb();
			});
		}
		Plugin.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:"编辑"}});
		}
		Plugin.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:"编辑"}});
		}
	})(V.Classes['v.views.book.DemoEdit']);
},{plugins:["v.component.form","v.ui.fckeditor","v.ui.fromToList"]})