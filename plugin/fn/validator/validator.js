;V.registPlugin("v.fn.validator",function(){
	    Validator = {
	    	getLang:function(key){
				 return V.Lang.get(key,"v.fn.validator");
			}
	    };
		Validator.rules = {
			text:{
				validate:function(value,params){
					//var reg=/^[0-9a-zA-Z_\s\+\(\)\-!\。\.\,\，\?\{\}\[\]=$@%\u4e00-\u9fa5\ufe30-\uffa0]+$/;//\ufe30-\uffa0为中文标点符号
					//var reg=/^[0-9a-zA-Z_'"\s\+\(\)\-!\.\,\?\{\}\[\]=$@%\ufe30-\uffa0]+$/;
					//var reg=/^[0-9a-zA-Z_:;'"!=$@&%~#<>\s\^\|\\\/\+\*\.\,\?\(\)\{\}\[\]-]+$/;
					//var reg = /[\u4e00-\u9fa5\<\>]/;
					var reg = /^[\w\W]+$/;
					var ret = reg.test(value);
					if(params){ 
					  	ret =ret && value.length >= params[0] &&  value.length <= params[1];
					  }
					return ret;
		        },
		        message:Validator.getLang("MSG_ENTER_CORRECT_CONTENT_LENGTH_0_1")
		    }
			,text1:{
				validate:function(value,params){
					var reg = /^[0-9a-zA-Z_-]+$/;
					var ret =reg.test(value);
					if(params){
						ret = ret && value.length>=params[0] && value.length<=params[1];
					}
					return ret;
				},
				message:Validator.getLang("MSG_ENTER_CORRECT_CONTENT_LENGTH_0_1")
			}
			,text3:{
				validate:function(value,params){
					var reg = /^[\w\W]+$/;
					var ret =reg.test(value);
					if(params){
						ret = ret && value.length>=params[0] && value.length<=params[1];
					}
					return ret;
				},
				message:Validator.getLang("MSG_ENTER_CORRECT_CONTENT_LENGTH_0_1")
			},commonText:{
				validate:function(value,param){
					var reg = /[\<\>]/;
					var ret = !reg.test(value);
		    		if(param){
						ret = ret && value.length>=param[0] && value.length<=param[1];
					}
					return ret;
		        },
		        message:Validator.getLang("MSG_ENTER_CORRECT_CONTENT_LENGTH_0_1")
		    }
			,text4:{
				validate:function(value,param){
		    		var reg=/^[a-zA-Z][0-9a-zA-Z\u4e00-\u9fa5]*$/;
		    	    return reg.test(value);
		        },
		        message:Validator.getLang("MSG_ENTER_VALID_NUM_ENG_CHN")
		    },commafyNumber:{
		    	validate:function(value,params){
		    		value = V.Util.Number.commafyback(value)+"";
		    		var ret = false;
		    		if(params){
		    			var index = value.indexOf('.');
		    			if(params[2] && params[2]>0){
		    				var reg = /^\d+\.\d+$/;
		    				var valueTest = reg.test(value);
		    				value = value.match(/(\d+)\.(\d+)/);
		    				ret = valueTest && value[1].length>=params[0] && value[1].length<=params[1] && value[2].length==params[2];
		    			}else if(params[1]){
		    				var reg = /^\d+$/;
		    				var valueTest = reg.test(value);
		    				ret = valueTest && value.length >= params[0] &&  value.length <= params[1];
		    			}else{
		    				var reg = /^\d+$/;
		    				var valueTest = reg.test(value);
		    				ret = valueTest && value.length == params[0];
		    			}
		    		}
		    	    return ret;
		        },
		        message:function(value,params){
		        	var str = "请输入合法的数字";
		        	if(params[0]){
		        		str = str + "，长度"+params[0];
		        	}
		        	if(params[1]){
		        		str = str + "-"+params[1];
		        	}
		        	if(params[2] && params[2]>0){
		        		str = str + "，精度"+params[2];
		        	}
		        	return str;
		        }
		    }
			,positiveInteger : {
				validate:function(value,params){
					var reg = /^[1-9][0-9]*$/;
		    	    var ret =reg.test( value );
		        	if(params){ 
					  	ret =ret && value.length >= params[0] &&  value.length <= params[1];
					  }
		    	    return ret;
				},
				message:'error'
			}
			,nonnegativeInteger : {
				validate:function(value,params){
		    		var ret = false;
		    		if(params){
		    			var index = value.indexOf('.');
		    			if(params[2] && params[2]>0){
		    				var reg = /^-\d+\.\d+$/;
		    				var valueTest = reg.test(value);
		    				value = value.match(/(\d+)\.(\d+)/);
		    				ret = valueTest && value[1].length>=params[0] && value[1].length<=params[1] && value[2].length==params[2];
		    			}else if(params[1]){
		    				var reg = /^-\d+$/;
		    				var valueTest = reg.test(value);
		    				ret = valueTest && value.length-1 >= params[0] &&  value.length-1 <= params[1];
		    			}else{
		    				var reg = /^-\d+$/;
		    				var valueTest = reg.test(value);
		    				ret = valueTest && value.length-1 == params[0];
		    			}
		    		}
		    	    return ret;
		        },
		        message:function(value,params){
		        	var str =Validator.getLang("MSG_ENTER_VALID_NUM") ;
		        	if(params[0]){
		        		str = str + Validator.getLang("MSG_LENGTH")+params[0];
		        	}
		        	if(params[1]){
		        		str = str +"-"+params[1];
		        	}
		        	if(params[2]){
		        		str = str + Validator.getLang("MSG_PRECISION")+params[2];
		        	}
		        	return str;
		        }
			}
			,positive:{
		    	validate:function(value,params){
		    		var ret = false;
		    		if(params){
		    			var index = value.indexOf('.');
		    			if(index == -1){
		    				var reg = /^\d+$/;
		    				var valueTest = reg.test(value);
		    				return valueTest;
		    			}
		    			
		    			if(params[2] && params[2]>0){
		    				var reg = /^\d+\.\d+$/;
		    				var valueTest = reg.test(value);
		    				value = value.match(/(\d+)\.(\d+)/);
		    				ret = valueTest && value[1].length>=params[0] && value[1].length<=params[1] && value[2].length<=params[2];
		    			}else if(params[1]){
		    				var reg = /^\d+$/;
		    				var valueTest = reg.test(value);
		    				ret = valueTest && value.length >= params[0] &&  value.length <= params[1];
		    			}else{
		    				var reg = /^\d+$/;
		    				var valueTest = reg.test(value);
		    				ret = valueTest && value.length == params[0];
		    			}
		    		}
		    	    return ret;
		        },
		        message:function(value,params){
		        	var str = Validator.getLang("MSG_ENTER_VALID_NUM");
		        	if(params[0]){
		        		str = str + Validator.getLang("MSG_LENGTH")+params[0];
		        	}
		        	if(params[1]){
		        		str = str + "-"+params[1];
		        	}
		        	if(params[2] && params[2]>0){
		        		str = str + Validator.getLang("MSG_PRECISION")+params[2];
		        	}
		        	return str;
		        }
		    }
			,range:{
		        validate:function(value,params){
		    	      return (value > params[0] && value < params[1]);
		        },
		        message:Validator.getLang("MSG_ENTER_VALUE_O_1")
		    }
			,phone:{
		 	   validate:function(value,param){
		 		  var reg =/^[+]{0,1}(\d){1,3}[ ]?([-]?((\d)|[ ]){1,12})+$/;
		 		  ret = reg.test(value);
		 		  if(param&&param[0]){ 
		 		  	ret =ret && value.length >= param[0] &&  value.length <= param[1];
		 		  }
		 		  return ret;
		 	    },
		 	    message:Validator.getLang("MSG_ENTER_CORRECT_TEL_NUM")
			}
			,fax:{
		 	   validate:function(value,param){
		 		  var reg =/^[+]{0,1}(\d){1,3}[ ]?([-]?((\d)|[ ]){1,12})+$/;
		 		  ret = reg.test(value);
		 		  if(param&&param[0]){ 
		 		  	ret =ret && value.length >= param[0] &&  value.length <= param[1];
		 		  }
		 		  return ret;
		 	    },
		 	    message:Validator.getLang("MSG_ENTER_CORRECT_FAX_NUM")
			}
			,mobile:{
				validate:function(value){
				
					var reg = /^0{0,1}(13[0-9]|15[0-3|5-9]|15[0-2]|18[0-2|5-9]|17[0-2|7-8]|147)[0-9]{8}$/;
					ret = reg.test(value);
					return ret;
				}
				,message:Validator.getLang("MSG_ENTER_CORRECT_CELL_NUM")
			}
			,email:{
				validate:function(value){
					//var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
					var reg = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
					ret = reg.test(value);
					return ret;
				}
				,message:Validator.getLang("MSG_ENTER_CORRECT_EMAIL")
			}
			,zipCode:{
				validate:function(value){
					var reg = /^[1-9][0-9]{5}$/;
					ret = reg.test(value);
					return ret;
				}
				,message:Validator.getLang("MSG_ENTER_CORRECT_POSTAL_CODE")
			}
			,price:{
				validate:function(value){//两位小数
					var reg = /^\d+(\.\d{1,2})?$/;
					ret = reg.test(value);
					return ret;
				}
				,message:Validator.getLang("MSG_ENTER_CORRECT_CURRENCY")
			}
			,price2:{
                validate:function(value){//两位小数
                    var reg = /^(-{1}|\d)+(\.\d{1,2})?$/;
                    ret = reg.test(value);
                    return ret;
                }
                ,message:Validator.getLang("MSG_ENTER_CORRECT_CURRENCY")
            }
			,ciphertext : {
                validate:function(value,params){
                    var reg = /^[0-9\+\-\*\/\<\>]*$/;
                    var ret =reg.test( value );
                    if(params){ 
                        ret =ret && value.length == params[0];
                    }
                    return ret;
                },
                message:Validator.getLang("MSG_ENTER_0_9_OR_SYMBOL_LENGTH_0")
            }
            ,exactLength:{
                validate:function(value,params){
                   // var reg = /^[\w\W]+$/;
                	var reg = /[\u4e00-\u9fa5]/;
                    var ret =!reg.test(value);
                    if(params){
                        ret = ret && value.length==params[0];
                    }
                    return ret;
                },
                message:Validator.getLang("MSG_ENTER_CORRECT_CONTENT_LENGTH_0")
            }
            ,exactNumberLength:{
                validate:function(value,params){
                    var reg = /^\d+$/;
                    var ret =reg.test(value);
                    if(params){
                        ret = ret && value.length==params[0];
                    }
                    return ret;
                },
                message:Validator.getLang("MSG_ENTER_NUM_0_9_LENGTH_0")
            }
            ,dateRange:{
                validate:function(value){
                	var reg = /^(\d{4}-\d{2}-\d{2}){0,1}\,(\d{4}-\d{2}-\d{2}){0,1}$/;
                    ret = reg.test(value);
                    return ret;
                }
                ,message:Validator.getLang("MSG_ENTER_CORRECT_DATE_FORMAT")
            }
            ,yearMonthRange:{
                validate:function(value){
                    var reg = /^(\d{6})\,(\d{6})$/;
                    ret = reg.test(value);
                    if(ret){
                    	if(parseInt(RegExp.$1)>parseInt(RegExp.$2))
                    		ret = false;
                    }
                    return ret;
                }
                ,message:Validator.getLang("MSG_ENTER_CORRECT_DATE_RANGE")
            }
            ,sellerCode:{
                validate:function(value){
                    var reg = /^[0-9a-zA-Z]{15}$|^[0-9a-zA-Z]{17}$|^[0-9a-zA-Z]{18}$|^[0-9a-zA-Z]{20}$/;
                    ret = reg.test(value);
                    var len = value.length;
                    return ret;
                }
                ,message:Validator.getLang("MSG_TAX_IS_15_17_18_20_NUM_LETTER")
            }
            ,date:{
                validate:function(value){
                    var reg = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/;
                    var ret =reg.test(value);
                    return ret;
                },
                message:Validator.getLang("MSG_ENTER_CORRECT_TIME")
            }
		};
		Validator.validate = function(rule,value){
			rule = $.trim(rule);
			var index = rule.indexOf('(');
			var ruleName = "";
			var params = null;
			if(index<0){
				ruleName =  rule;
			}else{
				ruleName =  rule.substring(0,index);
				//params = rule.substring(index+1,rule.length-1);
				//params = params.split(',');
				params = rule.match(/\((\d*)\,(\d*)\)\((\d*)\)/)||rule.match(/\((\d*)\,(\d*)\)/)||rule.match(/\((\d*)\)/)||[];
				params.splice(0,1);
			}
			var ruleFunc = this.rules[ruleName];
			if(ruleFunc&&(value+"").length>0){
				if(ruleFunc.validate(value,params)){
					return null;
				}else{
					var m =  ruleFunc.message;
					if($.isFunction(m)){
						return m(value,params);
					}
					m = m.replace(/{\d}/g,function(m){
						 var index = m.substring(1,m.length-1);
						 return params[index]||0;
					})
					return m;
				}
			}
		}
});
