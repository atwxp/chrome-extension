var wrapper = document.querySelector('#encode-wrapper');

var rawTextarea = wrapper.querySelector('[data-role="raw-text"]');
var retTextarea = wrapper.querySelector('[data-role="result-text"]');

var form = wrapper.querySelector('[data-role="enctype-form"]');
var convert = form.elements['convert'];
var codec = form.elements['codec'];

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
