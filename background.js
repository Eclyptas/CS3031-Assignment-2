'use strict';

chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [
          // when page host is reddit
          new chrome.declarativeContent.PageStateMatcher({pageUrl: {hostEquals: 'www.reddit.com'}})
        ],
        // show the page action
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
});
