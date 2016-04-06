var extend = function (target, source) {

    if (!source) {
        return target;
    }

    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            target[key] = source[key];
        }
    }

    return target;
};

var type = function (val) {

    if (/^(\d+)$/.test(val)) {
        return 'numeric';
    }

    if (/^(A-Z|0-9|\$|%|\*|\+|–|\.|\/|:| )+$/.test(val)) {
        return 'alpha';
    }
};

var toLen = function (val, len, end) {

    if (!len) {
        return str;
    }

    var padding = new Array(len + 1).join('0');

    if (end) {
        return (val + padding).slice(0, len);
    }
    else {
        return (val + padding).slice(-len);
    }
};

var toHex = function (uni) {
    return uni.toString(16).toUpperCase();
};

var num2Bit = function (val, total) {
    val = parseInt(val, 10);

    if (val >= 0) {
        var code = val.toString(2);
    }
    else {
        code = (~val).toString(2);
    }

    return  toLen(code, total);
};

var uni2hex = function (str, pos) {

    var c = str.charCodeAt(pos || 0);

    var hex = toLen(toHex(c), 4);

    return '\\u' + hex;
};

var num2Hex = function (num) {
    return parseInt('' + num, 16);
};

var formatSize = function (size) {
    var a = {
        'B': 1,
        'KB': 1024,
        'MB': 1024 * 1024
    };

    for (var i in a) {
        if (a.hasOwnProperty(i)) {
            if (size < a[i] * 1024) {
                break;
            }
        }
    }

    return (size / a[i]).toFixed(2) + i;
};
