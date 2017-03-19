// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Returns a handler which will open a new window when activated.
 */
function getImage(mag, score){
return 'imageinfo-48.png';
}

function getMessage(mag, score){
return mag + ' ' + score;
}

function getClickHandler() {
  return function(info, tab) {

    // The srcUrl property is only available for image elements.
    var stext = info.selectionText;
    var msg ='';

    fetch("https://language.googleapis.com/v1/documents:analyzeSentiment?key=AIzaSyCz-86KMvI_tVzthkmyQaiKcYyfP7Sdda8", {  
    method: 'post',  
headers: {  
      'Content-type': 'application/JSON'  
    },  
    body: JSON.stringify({ encodingType: 'UTF8',
  document: { type: 'PLAIN_TEXT', content: stext } })
    })
  .then(function (data,msg) {  
    return(data.json());
    msg = 'Request succeeded with JSON response';  
  }).then(function(j){

var mag = j.documentSentiment.magnitude;
var score = j.documentSentiment.score;
    chrome.notifications.create("test", {
      iconUrl: chrome.runtime.getURL(getImage(mag, score)),
      title: 'Removal required',
      type: 'basic',
      message: getMessage(mag,score),
      buttons: [{ title: 'Learn More' }],
      isClickable: true,
      priority: 2,
    }, function() {});
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
};

/**
 * Create a context menu which will only show up for images.
 */
chrome.contextMenus.create({
  "title" : "Get image info",
  "type" : "normal",
  "contexts" : ["selection"],
  "onclick" : getClickHandler()
});
