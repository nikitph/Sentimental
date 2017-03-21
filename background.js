// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Returns a handler which will open a new window when activated.
 */
function getImage(mag, score) {
    return 'Artboard@2x.png';
}

function getMessage(mag, score, sente) {

    var message = '';
    if (score < -0.6) {
        message = 'The overall sentiment from the text is strongly negative. Please consider a revision before sending it to anyone.';
    }
    else if (score < -0.3 && score >= -0.6) {
        message = 'The overall sentiment from the text is somewhat negative';

    }
    else if (score < 0.3 && score >= -0.3) {
        if (mag >= 3) {
            message = 'The overall sentiment from all of the text is neutral but there are sentences with high emotional content';
        }
        else {

            message = 'The overall sentiment from all of the text is neutral, individual sentences are low in emotional content';

        }

    }
    else if (score < 0.6 && score >= 0.3) {
        message = 'The overall sentiment from the text is positive';

    }

    else if (score >= 0.6) {

        message = 'The overall sentiment from the text is very positive';

    }

    return 'There are ' + sente + ' sentences in your selection.' + message;
}

function getClickHandler() {
    return function (info, tab) {

        // The srcUrl property is only available for image elements.
        var stext = info.selectionText;
        var msg = '';

        fetch("https://language.googleapis.com/v1/documents:analyzeSentiment?key=AIzaSyCz-86KMvI_tVzthkmyQaiKcYyfP7Sdda8", {
            method: 'post',
            headers: {
                'Content-type': 'application/JSON'
            },
            body: JSON.stringify({
                encodingType: 'UTF8',
                document: {type: 'PLAIN_TEXT', content: stext}
            })
        })
            .then(function (data, msg) {
                return (data.json());
                msg = 'Request succeeded with JSON response';
            }).then(function (j) {

            var mag = j.documentSentiment.magnitude;
            var score = j.documentSentiment.score;
            var sente = j.sentences.length;

            chrome.notifications.create("test", {
                iconUrl: chrome.runtime.getURL(getImage(mag, score)),
                title: 'Sentimental : Text Analysis Result',
                type: 'basic',
                message: getMessage(mag, score, sente),
                priority: 2,
            }, function () {
            });
            console.log(j);
        })
            .catch(function (error) {
                console.log('Request failed', error);
            });


        // Create a new window to the info page.
//     var notification = webkitNotifications.createNotification(
//   'imageinfo-48.png',  // icon url - can be relative
//   'Hello!',  // notification title
//   'Lorem ipsum...'  // notification body text
// );
//     notification.show();    
    };
}

/**
 * Create a context menu which will only show up for images.
 */
chrome.contextMenus.create({
    "title": "Analyze Text Sentiment",
    "type": "normal",
    "contexts": ["selection"],
    "onclick": getClickHandler()
});
