//Initialize openpgp worker thread for cryptography
openpgp.initWorker({ path:'chrome-extension://aacfdmmbbdkikalokahdmomnaggbieaa/openpgp.worker.min.js' });

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('encrypt').addEventListener('click', encryptData);
    document.getElementById('decrypt').addEventListener('click', decryptData);
});

function encryptData() {
  chrome.tabs.executeScript( {
    code: "window.getSelection().toString();"
  }, function(selection) {
    var recipients = document.getElementById("recipient").value;

    //Get stored data regarding keys for encryption
    var storedItems = ["personalusername","publickey","connections","privatekey","passphrase"];
    chrome.storage.sync.get(storedItems, function(items) {

      //Make sure all necessary data is present
      if(!items.personalusername || !items.publickey){ return alert("Please generate your personal keys on the options page before attempting to encrypt");}
      if(!checkConnectionsExist(items.connections,recipients)){ return alert("You have entered a recipient that you do not know the name of.");}

      //Extract the public key of the recipient to encrypt the message for
      var peopleJSON = JSON.parse(items.connections);
      var recipientpub = peopleJSON[recipients[0].emailAddress];

      //Send message to cryptography.js
      chrome.runtime.sendMessage({type:"content-for-encryption",content:content,subject:subject,recipientpub:recipientpub,senderpub:items.publickey,senderpri:items.privatekey,passphrase:items.passphrase,sender:items.personalemail}, function(response) {

        //Update content of email with encrypted data for sending
        event.composeView.setSubject("_Imparo_Encrypted_Message_");
        event.composeView.setBodyText(response.content);

      });

    document.getElementById("output").value = selection;
  });
}

function decryptData() {
  chrome.tabs.executeScript( {
    code: "window.getSelection().toString();"
  }, function(selection) {
    var recipient = document.getElementById("recipient").value;
    document.getElementById("output").value = selection;
  });
}
