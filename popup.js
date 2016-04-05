var wrapper = document.querySelector('.fe-helper');

wrapper.addEventListener('click', function (e) {
    var target = e.target;

    // element node
    if (parseInt(target.nodeType, 10) === 1) {
        var needNewTab = !!target.getAttribute('data-tab');
        var type = target.getAttribute('data-type');

        // open only one tab
        // see https://github.com/mdn/webextensions-examples/blob/master
        if (needNewTab) {
            var url = chrome.extension.getURL('/template/' + type + '/index.html');

            chrome.tabs.query({}, function (tabs) {
                var optionsUrl = tabs.filter(function (tab) {
                    return tab.url === url;
                });

                if (optionsUrl.length) {
                    chrome.tabs.update(optionsUrl[0].id, {
                        selected: true
                    });
                }
                else {
                    chrome.tabs.create({
                        url: url,
                        selected: true
                    });
                }
            });
        }
    }

}, false);
