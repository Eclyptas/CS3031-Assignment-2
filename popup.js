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
    document.getElementById("output").value = "";
    //Get stored data regarding keys for encryption
    var storedItems = ["personalusername","publickey","connections","privatekey","passphrase"];
    chrome.storage.sync.get(storedItems, function(items) {

      //Make sure all necessary data is present
      if(!items.personalusername || !items.publickey){ return alert("Please generate your personal keys on the options page before attempting to encrypt");}

      var recipientArray = recipients.split(", ");
      var connectionsJSON = JSON.parse(items.connections);

      if(!checkConnectionsExist(connectionsJSON,recipientArray)){ return alert("You have entered a recipient that you do not know the name of.");}
      alert("Encrypting..."); 

      for (var i in recipients) {
        if(recipientArray[i]!=null){
          var recipientPublicKey = connectionsJSON[recipientArray[i]];
          var passphrase = items.passphrase.toString();
          var sender = items.personalusername;

          var generatedRSAKey = cryptico.generateRSAKey(passphrase,bits);
          var encrypted = cryptico.encrypt(content.toString(),recipientPublicKey,generatedRSAKey);

          // display the decrypted content back to the user
          document.getElementById("output").value += recipientArray[i] + ":\n" + encrypted.cipher + "\n";
        }
      }
      alert("Encryption done.");
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
      alert("Decryption done.");
    });
  });
}


//Checks if you have the details of all the connections you wish to send to
function checkConnectionsExist(connections,recipients){
  for (var i in recipients) {
    if (connections[recipients[i]] == null) {
      console.log(recipients[i] + " is not in your group");
      return false;
    }
  }
  return true;
};
