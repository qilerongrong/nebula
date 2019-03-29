/*login user info
 * user:loginUser
 */
;V.registPlugin("v.views.loginInfo",function(){
	LoginInfo = {
		user : null,
		sellerCompany:null,
		financeRule:null,
		pary:null,
		sessionId:null,
		isExportCase:null,
		isEditCaseDetail:null,
		isCareManager:null,
		couponRatio:null,
		ssourl:null,
		isFx:null,
		fileUrl:null,
		businessRole : {ENTERPRISE:'ENTERPRISE',SUPPLIER:'SUPPLIER',CUSTOMER:'CUSTOMER'},
		getLoginInfo : function(){
			$.ajax({
				url : 'common!queryLoginInfo.action',
				async: false,
				dataType:'json',
				success : function(info){
					LoginInfo.user = info.originalUser;//用户信息
					LoginInfo.sellerCompany = info.userCompany;//如果是seller,交易伙伴
					LoginInfo.party = info.belongToParty;//所属主体信息（如果是seller,且没有升级为主体则为空）
					LoginInfo.financeRule = info.financeRule;//财务规则定制
					LoginInfo.sessionId = info.loginSessionID;
					LoginInfo.isSuperPlatform = info.superPlatform;
					LoginInfo.isExportCase = info.exportCase;
					LoginInfo.isEditCaseDetail = info.editCaseDetail;
					LoginInfo.isCareManager = info.careManger;
					LoginInfo.couponRatio = info.couponRatio;
					LoginInfo.isFx = info.isFx;//是否分销中心
					LoginInfo.fileUrl = info.fileUrl;
					LoginInfo.ssourl = info.ssourl;
					V.MessageBus.publish({eventId:'user-info-loaded',data:info});
					V.loadPlugin('v.views.dictInfo');
				}
			})
		}
	};
	LoginInfo.getLoginInfo();
});