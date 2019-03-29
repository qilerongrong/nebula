/*
 * base64 v1.0 - jQuery base64 encode\decode plugin
 *
 * Copyright (c) 2012 Dmitry V. Alexeev
 *
 * Licensed under the GPL license:
 *   http://www.gnu.org/licenses/gpl.html
 *
 * URL:
 *   http://alexeevdv.ru/projects/jquery/base64/
 *
 * Author URL:
 *   http://alexeevdv.ru/
 *
 */
(function($) {
    $.extend({
        base64: {
            codeTable : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
            encode: function(text) {
                text = this.utf8encode(text);
                var encodedText = '';
                for (var i = 0; i < text.length; i+=3) {
                    
                    var byte1 = (text[i] !== undefined ? text.charCodeAt(i) : 0);
                    var byte2 = (text[i+1] !== undefined ? text.charCodeAt(i+1) : 0);
                    var byte3 = (text[i+2] !== undefined ? text.charCodeAt(i+2) : 0);
                    
                    var newByte1 = byte1 >> 2;
                    encodedText += this.codeTable[newByte1];
                    
                    var newByte2 = ((byte1 & 3) << 4) | ((byte2 & 240) >> 4);
                    encodedText += this.codeTable[newByte2];
                    
                    var newByte3 = ((byte2 & 15) << 2) | ((byte3 & 192) >> 6);
                    encodedText += (byte2 ? this.codeTable[newByte3] : '=' );
                    
                    var newByte4 = byte3 & 63;
                    encodedText += (byte3 ? this.codeTable[newByte4] : '=' )
                }
                return encodedText;
            },
            
            decode: function(text) {
                var decodedText = '';
                for (var i = 0; i < text.length; i+=4) {
                    var byte1 = this.codeTable.indexOf(text[i]);
                    var byte2 = this.codeTable.indexOf(text[i+1]);
                    var byte3 = (text[i+2] !== "=" ? this.codeTable.indexOf(text[i+2]) : 0);
                    var byte4 = (text[i+3] !== "=" ? this.codeTable.indexOf(text[i+3]) : 0);
                
                    var newByte1 = (byte1 << 2) | ((byte2 & 48) >> 4);
                    decodedText += (newByte1 ? String.fromCharCode(newByte1) : '' );
                    var newByte2 = ((byte2 & 15) << 4) | ((byte3 & 60) >> 2);
                    decodedText += (newByte2 ? String.fromCharCode(newByte2) : '' );
                    var newByte3 = ((byte3 & 3) << 6) | (byte4 & 63);
                    decodedText += (newByte3 ? String.fromCharCode(newByte3) : '' );

                }
                decodedText = this.utf8decode(decodedText);
                return decodedText;
            },
            
            utf8encode: function(text) {
                var utf8text = "";

                for (var n = 0; n < text.length; n++) {

                    var c = text.charCodeAt(n);

                    if (c < 128) {
                        utf8text += String.fromCharCode(c);
                    }
                    else if((c > 127) && (c < 2048)) {
                        utf8text += String.fromCharCode((c >> 6) | 192);
                        utf8text += String.fromCharCode((c & 63) | 128);
                    }
                    else {
                        utf8text += String.fromCharCode((c >> 12) | 224);
                        utf8text += String.fromCharCode(((c >> 6) & 63) | 128);
                        utf8text += String.fromCharCode((c & 63) | 128);
                    }
                }
                return utf8text;
            },
        
            utf8decode: function(utf8text){
		var text = "";
		var i = 0;
		var c = c1 = c2 = 0;
 
		while ( i < utf8text.length ) {
 
			c = utf8text.charCodeAt(i);
 
			if (c < 128) {
				text += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utf8text.charCodeAt(i+1);
				text += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utf8text.charCodeAt(i+1);
				c3 = utf8text.charCodeAt(i+2);
				text += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
 
		}
		return text;
            }
        }
    });
})(jQuery);
