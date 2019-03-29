/*
 * 票单匹配--取消匹配审核详情
 */
;V.registPlugin("v.views.tools.docketManage.cancelMatchDetail",function(){
	V.Classes.create({
		className:"v.views.tools.docketManage.CancelMatchDetail",
		superClass:"v.Plugin",
		init:function(){
			this.ns  = 'v.views.tools.docketManage.cancelMatchDetail';
			this.module = '';
			this.matchId = '';
			this.options = {
				
			}
			this.EVENT = {
			   
			}
			this.template = $('<div class="docket">\
					<div style="position:absolute;top:0px;right:0px;"><button class="btn btn-success cancel">取消匹配</button></div>\
					<div class="match_con">\
				</div>')
		}
	});
	(function(MatchAuditDetail){
		MatchAuditDetail.prototype.init = function(options){
			this.container  = options.container;
			this.module = options.module;
			this.match = options.match;
			this.platfromNo = this.match.platfromNo;
			this.matchId = this.match.id;
			
			this.container.append(this.template);
			this.initEvent();
			
			var match = this.match = new V.Classes['v.views.finance.match.Match']();
			var opt = {
			    container : $('.match_con',this.template),
			    module : this.module,
			    matchId : this.matchId,
			    platfromNo:this.platfromNo
			}
			match.init(opt);
		}
		MatchAuditDetail.prototype.initEvent = function(){
		    var that = this;
		    $('.cancel',this.template).click(function(){
				that.doCancelMatch();
			});
		}
		MatchAuditDetail.prototype.doCancelMatch = function(){
			var that = this;
			V.confirm('是否进行取消匹配单操作',function(){
				$.ajax({
					url: that.module+'/cancel-match!cancel.action',
					data:{matchId:that.matchId},
					success:function(data){
						if(data=='success'){
							V.alert('取消匹配单成功！');
							V.MessageBus.publish({eventId:'backCrumb'});
						}else{
							V.alert(data);
						}
					}
				});
			})
        }
		MatchAuditDetail.prototype.updateCrumb = function(){
			V.MessageBus.publish({eventId:"updateCrumb",data:{ns:this.ns,options:this.options,name:'取消匹配审核详情'}});
		}
		MatchAuditDetail.prototype.addCrumb = function(){
			V.MessageBus.publish({eventId:"addCrumb",data:{ns:this.ns,options:this.options,name:'取消匹配审核详情'}});
		}
	})(V.Classes['v.views.tools.docketManage.CancelMatchDetail']);
},{plugins:['v.views.finance.match.match']});
