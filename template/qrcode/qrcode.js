
var ENCODE_MODE = {
    numeric: '0001',
    alpha: '0010',
    bytes: '0100'
};

var ECL = {
    L: '01',
    M: '00',
    Q: '11',
    H: '10'
};

// todo
var MAX_BITS = [
    [41, 25, 17, 77, 47, 32],
    [34, 20, 14, 63, 38, 26],
    [27, 16, 11, 48, 29, 20],
    [17, 10, 7, 34, 20, 14, 58, 35, 24]
];

// todo
var ALPHAMAP = {

};

// todo
var REMAINDER_BITS = [0, 7, 7, 7, 7, 7, 0, 0, 0, 0, 0, 0, 0];

// todo

var CODEWORDS = [
    [[19, 7, 1, 19, 0, 0], [34, 10, 1, 34, 0, 0]],
    [[16, 10, 1, 16, 0], [28, 16, 1, 28, 0, 0]],
    [[13, 13, 1, 13, 0, 0], [22, 22, 1, 22, 0, 0]],
    [[9, 17, 1, 9, 0, 0], [16, 28, 1, 16, 0, 0]]
];

var QRCode = {

    options: {
        text: '',

        // error correction level, L M Q H
        ecl: 'Q',

        type: 'canvas',

        width: 300,

        height: 300,

        dataType: 'image/png'
    },

    /**
     * @param {string} text     be encoded text
     * @param {string} ecl      'L M Q H'
     * @param {string} type     canvas table
     * @param {number} width    qr width
     * @param {number} height   qr height
     * @param {string} dataType  img MIME
     */
    create: function (options) {

        options = typeof options === 'string' ? {text: options} : options;

        options = extend(this.options, options);

        this.len = ('' + options.text).length;

        this.eclIndex = parseInt(ECL[options.ecl], 2) ^ 1;

        var text = options.text;

        switch (type(text)) {
            case 'numeric':

                this.mode = ENCODE_MODE.numeric;

                this.version = this.getVersion(0);

                this.charCountIndicator = this.getCharCountIndicator(0);

                this.codes = this.encodeNum(text);

                break;

            case 'alpha':

                this.mode = ENCODE_MODE.alpha;

                this.version = this.getVersion(1);

                this.charCountIndicator = this.getCharCountIndicator(1);

                this.codes = this.encodeAlpha(text);

                break;
        }
    },

    encodeNum: function (val) {

        val =  '' + val;

        var code = '';

        while (val.length > 3) {

            code += num2Bit(val.slice(0, 3), 10);

            val = val.slice(3, val.length);
        }

        if (val.length === 2) {
            code += num2Bit(val, 7);
        }
        else if (val.length === 1) {
            code += num2Bit(val, 4);
        }

        return this.addPadding(code);
    },


    encodeAlpha: function (val) {

        return this.addPadding();
    },

    // breaking 8bits
    addPadding: function (code) {
        var totalBytes = CODEWORDS[this.eclIndex][this.version - 1][0];

        var bits = this.mode + this.charCountIndicator + code;

        if (bits < totalBytes * 8) {
            bits += '0000';
        }

        var group = [];
        while (bits.length > 8) {
            group.push(bits.slice(0, 8));

            bits = bits.slice(8);
        }
        group.push(toLen(bits, 8, true));

        var diff = totalBytes - group.length;
        var odd = diff % 2;

        while (diff--) {
            if (odd) {
                group.push(diff % 2 ? '00010001' : '11101100');
            }
            else {
                group.push(diff % 2 ? '11101100' : '00010001');
            }
        }

        return group;
    },

    reedSolomon: function () {

    },

    restruct: function () {
        var codes = this.codes;
        var errCodes = this.errCodes;
    },

    getCharCountIndicator: function (modeIndex) {
        var version = this.version;

        if (version <= 9) {
            var charIndicator = [10, 9, 8];
        }
        else if (version <= 26) {
            charIndicator = [12, 11, 16];
        }
        else {
            charIndicator = [14, 13, 16];
        }

        return num2Bit(this.len, charIndicator[modeIndex]);
    },

    getVersion: function (modeIndex) {
        var len = this.len;

        var eclIndex = this.eclIndex;

        var versionLimitData = MAX_BITS[eclIndex];

        for (var k = modeIndex, len = versionLimitData.length; k < len; k += 3) {
            if (len <= versionLimitData[k]) {
                return k / 3 + 1;
            }
        }
    },

    drawCanvas: function () {

    },

    drawPosition: function () {

    },

    drawTable: function () {

    },

    dispose: function () {

    }
};
