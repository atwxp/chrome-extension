var wrapper = document.querySelector('#base64-wrapper');

var fileInput = wrapper.querySelector('[data-role="file-input"]');
var resultTextarea = wrapper.querySelector('[data-role="base64-result"]');
var rawSize = wrapper.querySelector('[data-role="raw-size"]');
var base64Size = wrapper.querySelector('[data-role="base64-size"]');
var preview = wrapper.querySelector('[data-role="preview"]');

fileInput.addEventListener('change', function (e) {
    var f = e.target.files[0];

    // 不是图片
    if (!/image\/[png|jpe?p|gif]/.test(f.type)) {
        alert('请选择图片');
        return;
    }

    resultTextarea.value = '';
    resultTextarea.disabled = true;
    rawSize.textContent = '';
    base64Size.textContent = '';
    preview.innerHTML = '';

    var reader = new FileReader();
    var img = document.createElement('img');

    img.addEventListener('load', function () {
        preview.appendChild(img);
    });

    reader.addEventListener('load', function () {
        var ret = reader.result;

        img.src = resultTextarea.value = ret;

        resultTextarea.disabled = false;

        rawSize.textContent = formatSize(f.size);

        base64Size.textContent = formatSize(ret.length);
    }, false);

    reader.readAsDataURL(f);

}, false);
