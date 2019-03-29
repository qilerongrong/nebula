;V.registPlugin("v.views.constant",function(){
	window.CONSTANT = window.CONSTANT||{};
	$.extend(CONSTANT,{
		PURCHASE_ORDER : {
			ORDER_TEMP_STORAGE : '0',
			'0' : '暂存',
			ORDER_PUBLISHED : '10', 
			'10' : "已发布",
			ORDER_CONFIRMED : '20', 
			'20'  :  '已确认' 
		}
		,APPROVE_STATUS : {
			APPROVE_STATUS_NA:"10",
			APPROVE_STATUS_DRAFT : "20",
			APPROVE_STATUS_PENDING : "30",
			APPROVE_STATUS_APPROVE : "40",
			APPROVE_STATUS_TEMINITE : "50"
		}
		,ORG : {
		    TYPE_GROUP : '1',
			TYPE_PRODUCT_SELECT : '2',
			TYPE_FOR_REGIONAL : '3',
			TYPE_FORENSIC : '4',
			TYPE_BRANCH : '5',
			TYPE_DISTRIBUTION_CENTRE: '6'
		},
	    SHIPPINGBOOKING:{
	    	'SHIPPING_TEMP_STORAGE' : '0'
	       ,'SHIPPING_WAIT_AUDIT' : '10'
	       ,'SHIPPING_AUDITED' : '20'
	       ,'SHIPPING_UN_AUDIT' : '30'
	       ,'SHIPPING_CANCEL_WAIT_AUDIT' : '40'
	       ,'SHIPPING_CANCEL_AUDITED' : '50'
	    },
	    GRNMAIN:{
	    	'GRN_TEMP_STORAGE' : '10'
	    	,'10' : '暂存'	
	        ,'GRN_PUBLISHED' : '20'
	    	,'20' : '发布'   
	    },
	    MENU_TYPE:{
	    	'BCP_ENTERPRISE' : '1000'
	    	,'BCP_SUPPLIER' : '2000'
	    	,'SCSP_SELLER' : '3000'
	    	,'MAINTEMNCE' : '4000'
	    	,'BCP_CUSTOMER' : '5000'
	    },
	    BUSINESS_ROLE:{
	    	'MAINTEMNCE' : 'MAINTEMNCE',
	    	'ENTERPRISE' : 'ENTERPRISE'
	    	,'SUPPLIER' : 'SUPPLIER'
	    	,'CUSTOMER' : 'CUSTOMER'
	    	,'ALL' : 'ALL'
	    	,'NONE' : 'NONE'
	    	,'MAINTEMNCE_NAME' : '平台运维'
	    	,'ENTERPRISE_NAME' : '集团企业'
	    	,'SUPPLIER_NAME' : '供应商'
	    	,'CUSTOMER_NAME' : '客户'
	    	,'ALL_NAME' : '全部'
	    	,'NONE_NAME' : '无'
	    },
	    FILE_TYPE:{
	    	'FILE_TYPE' : 'FILE_TYPE',
	    	'INTERNAL' : 'internal'
	    },
	    USER_TYPE:{
	    	'MAINTEMNCE':'1',
	    	'ENTERPRISE' : '2',
		    'SUPPLIER' : '3',
		    'CUSTOMER' : '4',
	    	'1' : '平台运维',
	    	'2' : '集团企业',
	    	'3' : '供应商',
	    	'4' : '客户'
	    },
	    SFH_USER:{
	    	'ENTERPRISE':'NJS',
	    	'MAINTEMNCE':'SUPERADMIN',
	    	'CUSTOMER':'CUSTOMER'
	    },
	    COMPANY_CHARACTER:{
	    	'STATE_OPERATED' : '1'
	    	,'PRIVATELY-OPERATED' : '2'
	    	,'1' : '国营'
	    	,'2' : '私营'	
	    },
		DATATYPE:{
			'-2':'自定义',
			'-1':'隐藏',
			'0':'只读',
			'1':'文本',
			'2':'日期',
			'3':'数字',
			'4':'单选',
			'5':'多选',
			'6':'文本框',
			'7':'按钮',
			'8':'系统',
			'9':'电子邮箱',
			'10':'手机',
			'11':'电话',
			'12':'价格',
			'13':'布尔'
		},
		CONTRACR_SOURCE:{
			TEMPLATE:['1','模版'],
			MANUAL:['2','手动'],
			FILE:['3','导入']
		},
		BILLS_SOURCE:{
			'ORDER':'1',
			'SB_ORDER':'2',
			'GRN':'3'
		},
		BILLS_STATUS:{
			'TEMP_STORAGE':'10',
			'STORAGE':'20'
		},
		ISSINGLESTORE:{
			COMPANY : 1,
			STORE : 2
		},
		DOCKET_TYPE:{
			COST : 'COST',
			SELL : 'SELL',
			RETURN_SELL:'RETURN_SELL',
			EMS : 'EMS',
			GRN : 'GRN',
			RETURNGRN : 'RETURN_GRN',
			DELIVERY:'DELIVERY',
			RETURN_DELIVERY:'RETURN_DELIVERY',
			BALANCE : 'ACCOUNT',
			RECEIPT : 'INVOICE',
			GRN_ADJUST : 'GRN_ADJUST',
			GRN_RENT : 'GRN_RENT',
			ORDER:'PURCHASE_ORDER',
			RETURN_ORDER:'RETURN_PURCHASE_ORDER',
			STOCK : 'STOCK',
			SHIPPINGBOOKING : 'SHIPPINGBOOKING_ORDER',
			RETURN_SHIPPINGBOOKING : 'RETURN_SHIPPINGBOOKING_ORDER',
			INVOICE:'INVOICE',
			DELIVERY_ITEMS:'DELIVERY_ITEMS',
			TRANSPORT_INVOICE:'TRANSPORT_INVOICE',
			GOODS:'GOODS',
			CONTRACT:'CONTRACT',
			PAYMENT:'PAYMENT',
			CONTACT_MONTH:'CONTACT_MONTH',
			'COST_DESC':'费用单',
			'SELL_DESC':'销售单',
			'RETURN_SELL_DESC':'销售退单',
			'EMS_DESC':'补差单',
			'GRN_DESC':'收货单',
			'RETURN_GRN_DESC':'退货单',
			'DELIVERY_DESC':'发货单',
			'RETURN_DELIVERY_DESC':'退货入库单',
			'ACCOUNT_DESC':'结算单',
			'INVOICE_DESC':'发票单',
			'GRN_ADJUST_DESC':'验收调整单',
			'GRN_RENT_DESC_DESC':'租赁营业额',
			'PURCHASE_ORDER_DESC':'订单',
			'RETURN_PURCHASE_ORDER_DESC':'退单',
			'STOCK_DESC':'库存单',
			'SHIPPINGBOOKING_DESC' : '预约单',
			'RETURN_SHIPPINGBOOKING_DESC' : '预约退单',
			'TRANSPORT_INVOICE_DESC':'运输发票单',
			'GOODS_DESC':'商品',
			'CONTRACT_DESC':'合同',
			'PAYMENT_DESC':'付款单',
			'CONTACT_MONTH_DESC':'往来按月数据'
		},
		RECEIPT_TYPE:{
		    VAT_RECEIPT : 1,
		    SPECIAL_RECEIPT : 2,
		    '1' : '增值税发票',
		    '2' : '专用发票'
		},
		FINANCE_INV_TYPE:{
			"BILL":1,
			"REBATE":2,
			"SERVICE":3,
			"OTHER":4,
			"1":"票折",
			"2":"折让",
			"3":"返开",
			"4":"其他"
		},
		FINANCE_INV_COMMENT_TYPE:{
			"RED":0,
			"BLUE":1,
			"0":"红票",
			"1":"蓝票"
		},
		FINANCE_MATCH_STATE:{
			"AUTO":"0",
			"MANUAL":"1",
			"FORCE":"2",
			"FAILED":"3",
			"NOT_REQUIRED":"4",
			"CANCEL":"5",
			"PENDING_APPROVAL":"6",
			"INIT":"99"
		},
		MATCH_STATUS:{
		    "MATCH_INIT":99,
		    "MATCH_AUTH_OK":10,
		    "MATCH_CANCEL_APPLY":20,
		    "NO_INVOICE_AUTH_APPLY":30,
		    "MATCH_POST_OK":40,
		    "99":"初始",
		    "10":"匹配审核通过",
		    "20":"申请取消匹配",
		    "30":"无票认证申请",
		    "40":"匹配过账通过"
		},
		LOGIN_STATUS:{
			"FIRST_LOGIN" : "0",
			"SECORD_LOGIN" : "1",
			"0" : "初次登陆",
			"1" : "二次登陆"
		},
		EXCEPTION:{
			"SYS":500,
			"SESSION":999
		},
		COST_STATUS:{
			"INIT" : "99",
			"PAYMENT" : "0",
			"CONFIRM" : "1",
			"99" : "初始",
			"0" : "已付款待确认",
			"1" : "已付款已确认"
		},
		COST_PRINT_FLAG:{
			"NOPRINT" : "0",
			"PRINT" : "1",
			"0" : "不可打印",
			"1" : "可以打印"
		},
		COST_INVOICE_SIGN_STATUS:{
			"INIT" : "0",
			"SIGN" : "1",
			"0" : "未签收",
			"1" : "已签收"
		},
		ENTERPRISE_FILE_TYPE:{
			"1":"企业三证资料",
			"2":"新品资料",
			"3":"信息变更资料",
			"4":"合同资料",
			"5":"付款资料"
		},
		ACCOUNT_OPERATE_FLAG:{
			"ACCOUNT_OPERATE_FLAG_DEFAULT" : "0",
			"ACCOUNT_OPERATE_FLAG_CONFIRMED_BY" : "1",
			"ACCOUNT_OPERATE_FLAG_CONFIRM_NOT_THROUGH" : "2",
			"ACCOUNT_OPERATE_FLAG_AUDIT_BY" : "3",
			"ACCOUNT_OPERATE_FLAG_AUDIT__NOT_THROUGH" : "4",
			"ACCOUNT_OPERATE_FLAG_CANCEL" : "5",
			"0":"发布",
			"1":"确认",
			"2":"提出异议",
			"3":"审核通过",
			"4":"驳回异议",
			"5":"作废"
		},
		AUTH_TYPE:{
			AUTH_TYPE_PARTY:'e',
			AUTH_TYPE_STANDARD:'s',
			AUTH_TYPE_ALL:'a'
		},
		AUTH_DEFAULT:{
			AUTH_DEFAULT_SELECTED:'1',
			AUTH_DEFAULT_UNSELECT:'0'
		},
		AUTHTYPE_CONTENT:{
			AUTHTYPE_MENU:'1',
			AUTHTYPE_CONSOLE:'2',
			AUTHTYPE_REPORT:'3',
			AUTHTYPE_MESSAGE:'4'
		}
	});
	$.extend(CONSTANT,{
		B2B:{  				//example
			REPORT_TYPE:{
				JOR:{
					'KEY':'JOR',
					'VALUE':'JOR报表'
				},
				JASPER:{
					'KEY':'JASPER',
					'VALUE':'JASPER报表'
				}
			},
			HOME_TYPE:{
				VALUE:{
					'1000':'中心企业',
					'2000':'供应商',
					'3000':'scsp供应商',
					'4000':'运维',
					'5000':'客户'
				}
			},
			PROJECT_DOCKET_STATUS:{
				'STATUS_DRAFT':'10',
				'STATUS_SUBMIT':'20',
				'STATUS_SUBMIT_REFUSE':'25',
				'STATUS_HANG_AUDITING':'30',
				'STATUS_HANG':'40',
				'STATUS_DEAL_AUDITING':'50',
				'STATUS_DEAL_APPROVE':'55'
			},
			BUYER_DOCKET_STATUS:{
				'BUYER_STATUS_DRAFT':'10',
				'BUYER_STATUS_SUBMIT':'20',
				'BUYER_STATUS_EDIT':'30',
				'BUYER_STATUS_REGISTER':'35',
				'BUYER_STATUS_ACCEPTED':'40',
				'BUYER_STATUS_REJECTED':'50',
				'BUYER_STATUS_BAIL_IN_AUDITING':'60',
				'BUYER_STATUS_BAIL_IN_FIN_AUDITING':'70',
				'BUYER_STATUS_END':'80'
			},
			TASK_STATUS:{
				'RUNNING':'运行中',
				'COMPLETE':'已完成',
				'PAUSED':'暂停中',
				'TERMINATED':'终止'
			}
		},
		SALESORDER:{
			STATUS:{
				'DRAF':'10',
				'COMMITED':'15',
				'PENDING':'20',
				'WAITPAY':'30',
				'PAYFAIL':'35',
				'PAYING':'40',
				'EXECUTING':'50',
				'CANCELING':'60',
				'COMPLETE':'70',
				'CANCEL':'80'
			},
			CHANNEL:{
				'OMS':'OMS',
				'B2B':'B2B',
				'FSS':'FSS'
			},
			CREATETYPE:{
				'CONTRACT':'CONTRACT',
				'MANUAL':'MANUAL'
			}
		},
		CONTRACT:{
			STATUS:{
				'DRAF':'10',
				'COMMITED':'15',
				'PENDING':'20',
				'WAITPAY':'30',
				'PAYING':'40',
				'EXECUTING':'50',
				'CANCELING':'60',
				'COMPLETE':'70',
				'CANCEL':'80'
			},
			CRATE_TYPE:{
				'MANUAL':'MANUAL',
				'ORDER':'ORDER'
			}
		},
		VERIFICATE_RESULT_TYPE:{
			VERIFICATE_RESULT_MATCH:'0',
			VERIFICATE_RESULT_LIT_INVOICE:'1',
			VERIFICATE_RESULT_LIT_BILLS:'2'
		},
		VERIFICATE_MATCH_TYPE:{
			VERIFICATE_MATCH_TYPE_MANUAL:'1',
			VERIFICATE_MATCH_TYPE_FORCE:'2'
		},
		VERIFICATE_STATUS:{
			VERIFICATE_STATUS_NO:'0',
			VERIFICATE_STATUS_YES:'1'
		},
		VERIFICATE_MATCH_STATUS:{
			VERIFICATE_MATCH_STATUS_NO:'0',
			VERIFICATE_MATCH_STATUS_SUCCESS:'1',
			VERIFICATE_MATCH_STATUS_FAIL:'2'
		},
		TIP_MESSAGE:{
			SAVE:'恭喜您，操作成功！'
		},
		FILE_URL:{
			URL:'https://iftracker.china-lin.com/'
		},
		INV_FROM:{
			EXTRACT:'1',
			SCAN:'2',
			MANUAL:'3',
			TAX:'4',
			EMULATE:'5'
		}
	});
});
