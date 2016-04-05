var wrapper = document.querySelector('#encode-wrapper');

var rawTextarea = wrapper.querySelector('[data-role="raw-text"]');
var retTextarea = wrapper.querySelector('[data-role="result-text"]');

var form = wrapper.querySelector('[data-role="enctype-form"]');
var convert = form.elements['convert'];
var codec = form.elements['codec'];

var key = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
var Base64 = {

    /**
     * 3个8位字节转化为4个6位的字节, 在6位的前面补两个0, 形成8位一字节
     * 不足3个字节, 填充0输出字符'='
     *
     * @param {string} str 要编码的字符串
     * @param {boolean} utf8encode 是否要utf8编码，ascii码不需要明确指定
     * @return {string} base64编码后的值
     */
    encode: function (str, utf8encode) {
        str = utf8encode ? this.utf8encode(str) : str;

        var i  = 0;
        var ret = '';

        // index 是负数，>=于字符串的长度, charCodeAt()返回 NaN
        // 1个字节的话，c2, c3都是NaN
        // 2个字节的话， c3都是NaN
        // 3个字节刚好分配4个6位
        // 3个字节一组
        while (i < str.length) {
            var c1 = str.charCodeAt(i++);
            var c2 = str.charCodeAt(i++);
            var c3 = str.charCodeAt(i++);

            var enc1 = c1 >> 2;
            // NaN >> 4 => 0
            var enc2 = (c1 & 0x03) << 4 | c2 >> 4;
            // NaN >> 6 => 0
            var enc3 = isNaN(c2) ? 64 : (c2 & 0x0f) << 2 | c3 >> 6;
            var enc4 = isNaN(c3) ? 64 : c3 & 0x3f;

            ret += ''
                + key.charAt(enc1) + key.charAt(enc2)
                + key.charAt(enc3) + key.charAt(enc4);
        }

        return ret;
    },

    /**
     * simple base64解码
     *
     * @param  {string}  str 要解码的字符串
     * @param  {boolean} utf8decode 是否要utf8解码, ascii码不需要明确指定
     * @return {string}  base64解码后的值
     */
    decode: function (str, utf8decode) {
        var code = '';

        str = str.replace(/[^a-zA-Z0-9\+\/\=]/g, '');

        str.replace(/[a-zA-Z0-9\+\/\=]{4}/g, function (c) {
            var enc1 = key.indexOf(c.charAt(0));
            var enc2 = key.indexOf(c.charAt(1));
            var enc3 = key.indexOf(c.charAt(2));
            var enc4 = key.indexOf(c.charAt(3));

            var c1 = enc1 << 2 | enc2 >> 4;
            var c2 = enc3 === 64 ? '' : (enc2 & 0x0f) << 4 | enc3 >> 2;
            var c3 = enc4 === 64 ? '' : (enc3 & 0x03) << 6 | enc4;

            code += String.fromCharCode(c1, c2, c3);
        });

        return utf8decode ? this.utf8decode(code) : code;
    },

    /**
     * 转换对照表
     * U+00000000 – U+0000007F   0xxxxxxx
     * U+00000080 – U+000007FF   110xxxxx 10xxxxxx
     * U+00000800 – U+0000FFFF   1110xxxx 10xxxxxx 10xxxxxx
     *
     * @param {string} strUni 要进行utf8转码的字符串，如汉字
     * @return {string} 返回utf8编码值
     */
    utf8encode: function (strUni) {
        return strUni
            .replace(
                /[\u0080-\u07ff]/g,
                function (c) {
                    // 获取Unicode编码
                    var cc = c.charCodeAt(0);
                    return String.fromCharCode(0xc0 | cc >> 6, 0x80 | cc & 0x3f);
                }
            )
            .replace(
                /[\u0800-\uffff]/g,
                function (c) {
                    var cc = c.charCodeAt(0);
                    return String.fromCharCode(0xe0 | cc >> 12, 0x80 | cc >> 6 & 0x3F, 0x80 | cc & 0x3f);
                }
            );
    },

    /**
     * utf8 base64解码
     *
     * @param  {string} strUtf 要进行utf8解码的字符串
     * @return {string} 返回utf8解码值
     */
    utf8decode: function (strUtf) {
        var ret = '';

        for (var i = 0, len = strUtf.length; i < len; i++) {
            var c1 = strUtf.charCodeAt(i);

            // 0000 0000 (0)
            // 0111 1111 (127)
            if (c1 < 128) {
                ret += String.fromCharCode(c1);
                i++;
            }
            // 1100 0000 (192)
            // 1101 1111 (223)
            else if (c1 > 191 && c1 < 224) {
                var c2 = strUtf.charCodeAt(++i);
                ret += String.fromCharCode((c1 & 0x1f) << 6 | (c2 & 0x3f));
            }
            else {
                c2 = strUtf.charCodeAt(++i);
                var c3 = strUtf.charCodeAt(++i);

                ret += String.fromCharCode((c1 & 0x0f) << 12 | (c2 & 0x3f) << 6 | (c3 & 0x3f));
            }
        }
        return ret;
    }
};

var toLen = function (str, total) {
    if (!total) {
        return str;
    }

    return (new Array(total + 1).join('0') + str).slice(-total);
};

var toHex = function (uni) {
    return uni.toString(16).toUpperCase();
};

var uni2hex = function (str, pos) {

    var c = str.charCodeAt(pos || 0);

    var hex = toLen(toHex(c), 4);

    return '\\u' + hex;
};

var num2Hex = function (num) {
    return parseInt('' + num, 16);
};

var methods = {
    unicodeEncode: function (str) {
        var ret = [];

        for (var i = 0, len = str.length; i < len; i++) {
            ret.push(uni2hex(str, i));
        }

        return ret.join('');
    },

    unicodeDecode: function (str) {

        return str.replace(/(\\u[a-zA-Z0-9]+)+/g, function (m) {
            var hex = m.split('\\u');

            return String.fromCharCode.apply(null, hex.map(function (v) {
                return num2Hex(v);
            }));
        })

    },

    base64Encode: function (str) {
        return Base64.encode(str, true);
    },

    base64Decode: function (str) {
        return Base64.decode(str, true);
    },

    utf8Encode: function (str) {
        return str
            .replace(
                /[\u0080-\u07ff]/g,
                function (c) {
                    var cc = c.charCodeAt(0);

                    return ['', toHex(0xc0 | cc >> 6), toHex(0x80 | cc & 0x3f)].join('%');

                }
            )
            .replace(
                /[\u0800-\uffff]/g,
                function (c) {
                    var cc = c.charCodeAt(0);
                    return ['', toHex(0xe0 | cc >> 12), toHex(0x80 | cc >> 6 & 0x3F), toHex(0x80 | cc & 0x3f)].join('%');
                }
            );
    },

    utf8Decode: function (str) {
        return str.replace(/(%[a-zA-Z0-9]+)+/g, function (m) {
            var d = m.split('%');

            var ret = '';

            for (var i = 0, len = d.length; i < len; i++) {
                var c1 = num2Hex(d[i]);

                if (isNaN(c1)) {
                    continue;
                }

                // 0000 0000 (0)
                // 0111 1111 (127)
                if (c1 < 128) {
                    ret += String.fromCharCode(c1);
                    i++;
                }
                // 1100 0000 (192)
                // 1101 1111 (223)
                else if (c1 > 191 && c1 < 224) {
                    var c2 =  num2Hex(d[++i]);
                    ret += String.fromCharCode((c1 & 0x1f) << 6 | (c2 & 0x3f));
                }

                else {
                    c2 = num2Hex(d[++i]);

                    var c3 = num2Hex(d[++i]);

                    ret += String.fromCharCode((c1 & 0x0f) << 12 | (c2 & 0x3f) << 6 | (c3 & 0x3f));
                }
            }

            return ret;
        });
    }
};

var doConvert = function (str) {
    return str.replace(/-(.)/, function (m, v) {
        return v.toUpperCase();
    });
};

form.elements['clear'].addEventListener('click', function () {
    rawTextarea.value = '';
    retTextarea.value = '';
}, false);

convert.addEventListener('click', function () {
    var val = rawTextarea.value;

    if (!val) {
        return;
    }

    for (var i = 0, len = codec.length; i < len; i++) {
        if (codec[i].checked) {
            var cv = codec[i].value;
            break;
        }
    };

    retTextarea.classList.remove('hidden');

    retTextarea.value = methods[doConvert(cv)](val);

}, false);

for (var i = 0 , len = codec.length; i < len; i++) {
    codec[i].addEventListener('change', function () {
        convert.click();
    }, false);
}
