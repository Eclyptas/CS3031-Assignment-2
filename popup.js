const bits = 2048;
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('encrypt').addEventListener('click', encryptData);
    document.getElementById('decrypt').addEventListener('click', decryptData);
});

function encryptData() {
  chrome.tabs.executeScript( {
    code: "window.getSelection().toString();"
  }, function(content) {
    var recipients = document.getElementById("recipient").value;

    //Get stored data regarding keys for encryption
    var storedItems = ["personalusername","publickey","connections","privatekey","passphrase"];
    chrome.storage.sync.get(storedItems, function(items) {

      //Make sure all necessary data is present
      if(!items.personalusername || !items.publickey){ return alert("Please generate your personal keys on the options page before attempting to encrypt");}

      var recipientArray = recipients.split(", ");
      var connectionsJSON = JSON.parse(items.connections);

      if(!checkConnectionsExist(connectionsJSON,recipientArray)){ return alert("You have entered a recipient that you do not know the name of.");}

      var recipientPublicKey = connectionsJSON[recipientArray[0]];
      var passphrase = items.passphrase.toString();
      var sender = items.personalusername;

      var generatedRSAKey = cryptico.generateRSAKey(passphrase,bits);
      var encrypted = cryptico.encrypt(content.toString(),recipientPublicKey,generatedRSAKey);

      // display the decrypted content back to the user
      document.getElementById("output").value = encrypted.cipher;
    });
  });
}

function decryptData() {
  chrome.tabs.executeScript( {
    code: "window.getSelection().toString();"
  }, function(content) {
    alert("Decrypting...");

    //Get stored data relating to keys for decrypt and verify content
    var storageItems = ["connections","privatekey","passphrase"];
    chrome.storage.sync.get(storageItems, function(items) {
      var passphrase = items.passphrase.toString();
      var sender = items.personalusername;

      var generatedRSAKey = cryptico.generateRSAKey(passphrase,bits);
      var decrypted = cryptico.decrypt(content.toString(), generatedRSAKey);
      document.getElementById("output").value = decrypted.plaintext;
    });
  });
}


//Checks if you have the details of all the connections you wish to send to
function checkConnectionsExist(connections,recipients){
  for (var i in recipients) {
    if (connections[recipients[i]] == null) {
      console.log(recipients[i] + " is not one of your connections");
      return false;
    }
  }
  return true;
};
