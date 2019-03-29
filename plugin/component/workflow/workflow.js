;V.registPlugin("v.component.workflow",function(){
	V.Classes.create({
		className:"v.component.Workflow",
		superClass:"v.Plugin",
		init: function(){
			this.ns = 'v.component.workflow';
			this.template = $('<div style="width:100%;height:100%"></div>');
			this.workflow = jsPlumb.getInstance();
			this.options = {
				draggable:false,
				nodes:[]
			}
			//设置默认值
			jsPlumb.registerConnectionTypes({
			    "selected":{
			        paintStyle:{strokeStyle:"#1e8151", lineWidth:4}
			    }   
			});
			this.workflow.importDefaults({
				  Endpoint : ["Dot", {radius:3}],
				  HoverPaintStyle : {strokeStyle:"rgb(37,96,152)", lineWidth:2},
				  ConnectionOverlays : [
	        		   [ "Arrow", { 
	        			  location:1,
	        			  width:10,
	                      length:10,
	                      foldback:0.1
	        		   }],
	                   [ "Label", {label:"", id:"label", cssClass:"aLabel"}]
	        	  ],
	        	  container:this.template
	        	  //ConnectionsDetachable:false,
			});
			var connectors = {
				flowchart:{}
			}
			this.nodeConfig = {
				filter:".ep",
				//anchor:["Static", { faces:["top","bottom","left","right"]}],
				connector:[ "Flowchart", { stub:[20, 60], gap:1, cornerRadius:4,alwaysRespectStubs:false } ],
				connectorStyle:{ strokeStyle:"rgb(82,177,221)", lineWidth:2, outlineWidth:2 },
				allowLoopback:true,
				anchor:"Continuous"
			}
			this.EVENT = {
				NODE_SELECT:'node_select',
				LINE_SELECT:'line_select',
				LINE_ESTABLISH:'line_estalish',
				LINE_DETACHED:'line_detached'
			}
		}
	});
	(function(Workflow){
		Workflow.prototype.init = function(options){
		    this.container = options.container;
		    this.container.append(this.template);
		    for(prop in options){
		    	this.options[prop] = options[prop];
		    }
		    var that = this;
		    this.workflow.bind("click", function(conn,originalEvent) {
		    	//conn.toggleType('selected');
		    	that.publish({eventId:that.EVENT.LINE_SELECT,data:conn});
			});	
		    this.workflow.bind("connection", function(info,originalEvent) {
				that.publish({eventId:that.EVENT.LINE_ESTABLISH,data:info});
			});	
		    this.workflow.bind("connectionDetached", function(info,originalEvent) {
				that.publish({eventId:that.EVENT.LINE_DETACHED,data:info});
			});	
		};
		Workflow.prototype.addNode = function(text,x,y,data){
			var node = this.createNode(false,text,x,y,data).data(data);
			this.template.append(node);
			this.workflow.makeSource(node[0],this.nodeConfig);
			this.workflow.makeTarget(node[0],this.nodeConfig);
			if(this.options.draggable){
				this.workflow.draggable(node,{containment : this.template});
			}
			return node;
		}
		Workflow.prototype.addBeginNode = function(text,x,y,data){
			var node = this.createNode(false,text,x,y,data);
			this.template.append(node);
			this.workflow.makeSource(node[0],this.nodeConfig);
			if(this.options.draggable){
				this.workflow.draggable(node);
				node.draggable({
					containment : this.template
				});
			}
			return node;
		}
		Workflow.prototype.addEndNode = function(text,x,y,data){
			var node = this.createNode(true,text,x,y,data);
			$('.ep',node).remove();
			this.template.append(node);
			this.workflow.makeTarget(node[0],this.nodeConfig);
			if(this.options.draggable){
				this.workflow.draggable(node);
				node.draggable({
					containment : this.template
				});
			}
			return node;
		}
		Workflow.prototype.addMemoNode = function(text,x,y,data){
			var node = this.createNode(true,text,x,y,data);
			$('.ep',node).remove();
			this.template.append(node);
			if(this.options.draggable){
				this.workflow.draggable(node);
				node.draggable({
					containment : this.template
				});
			}
			return node;
		}
		Workflow.prototype.createNode = function(isEnd,text,x,y,data){
			var that = this;
			var node = $('<div class="workflow_node">'+text+'</div>').css({left:x,top:y});
			node.data('nodeData',data);
			node.click(function(){
				that.publish({eventId:that.EVENT.NODE_SELECT,data:{target:node}});
			})
			if(!isEnd){
				node.append('<div class="ep"></div>');
			}
			return node;
		}
		Workflow.prototype.addNodes = function(){
			
		}
		Workflow.prototype.connect = function(source,target){
			var conn = this.workflow.connect({
				source:source,
				target:target
			});
			return conn;
		}
		Workflow.prototype.getAllNodes = function(){
			var nodes = $('.workflow_node',this.template);
			return nodes;
		}
		Workflow.prototype.getAllConnections = function(){
			return this.workflow.getAllConnections();
		}
		Workflow.prototype.removeNode = function(node){
			this.workflow.detachAllConnections(node);
			$(node).remove();
		}
	})(V.Classes['v.component.Workflow'])
},{jss:["plugin/component/workflow/assets/jquery.jsPlumb-1.6.2-min.js"]})
