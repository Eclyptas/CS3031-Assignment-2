const bits = 2048;

//set up the functions to call when buttons on the page are pressed
document.getElementById("newUser").onclick = function(){saveNewKeys();};
document.getElementById('addConnection').onclick = function(){saveNewConnection();}
document.getElementById("deleteConnection").onclick = function(){deleteConnection();};

//Setting up html buttons
//Get stored data about keys
var storedItems = ["personalusername","publickey","connections"];
chrome.storage.sync.get(storedItems, function(items) {

	//Display user credentials on page, if there are any stored in the system
	document.getElementById('username').textContent = items.personalusername;
	document.getElementById('userPublicKey').textContent = items.publickey;

	//Display user's contacts on page, if they have any
	var connectionsString = items.connections || "{}";
	var connectionsJSON = JSON.parse(connectionsString);
	updateConnectionsList(connectionsJSON)
});



//saves the new keys from the inputted form by the user
function saveNewKeys(){
  //grabbing the values from the form input
  var usernameEntered = document.getElementById('newUsername').value;
  var passphraseEntered = document.getElementById('newPassphrase').value;

  var generatedRSAKey = cryptico.generateRSAKey(passphraseEntered, bits);
  var publicKeyString = cryptico.publicKeyString(generatedRSAKey);
  console.log(publicKeyString);

  chrome.storage.sync.set({
	    personalusername: usernameEntered,
	    passphrase: passphraseEntered,
	    personalpassphrase: passphraseEntered,
	    publickey: publicKeyString
	}, function() {
	    // Display the generated items.
	    document.getElementById('username').textContent = usernameEntered;
	    document.getElementById('userPublicKey').textContent = publicKeyString;
  });
};


//Save contact from new connection input
function saveNewConnection(){
	//Get the inputted connection data that the user entered into the form
	var connectionUsername = document.getElementById('newConnectionUsername').value;
	var connectionPublicKey = document.getElementById('newConnectionPublicKey').value;

	//Get stored contacts data, then update it with the new information
	chrome.storage.sync.get(["connections"], function(items) {
    var connectionsString = items.connections || "{}";
  	var connectionsJSON = JSON.parse(connectionsString);

		//add in the new connection into the JSON
		connectionsJSON[connectionUsername] = connectionPublicKey;
		connectionsString = JSON.stringify(connectionsJSON);

		//Store the newly updated connection data
		chrome.storage.sync.set({connections: connectionsString},function() {
		  //Update list of connections displayed on page
      updateConnectionsList(connectionsJSON);
		});
	});
};


//Delete contact from new contact input
function deleteConnection(){
  //Get the inputted connection data that the user entered into the form
	var connectionUsername = document.getElementById('newConnectionUsername').value;
  //Get stored contacts data, then update it by removing the contact information, if it exists
	chrome.storage.sync.get(["connections"], function(items) {
    var connectionsString = items.connections || "{}";
  	var connectionsJSON = JSON.parse(connectionsString);

		//remove the old connection from the JSON
		delete connectionsJSON[connectionUsername];
		connectionsString = JSON.stringify(connectionsJSON);

		//Store the newly updated connection data
		chrome.storage.sync.set({connections: connectionsString},function() {
        //Update list of connections displayed on page
        updateConnectionsList(connectionsJSON);
        // as a contact has been removed, there needs to be a new, key generated
        alert("Please generate new keys now that a member has been removed");
        chrome.storage.sync.remove(['publickey'], function() {
      	    // Display the generated items.
      	    document.getElementById('userPublicKey').textContent = "Invalid, please generate new keys";
        });
		});
	});
};


//Updates the list of connections displayed on options page
function updateConnectionsList(connectionsJSON){
  var connectionsString = "";
  for (var connection in connectionsJSON) {
    if (connectionsJSON.hasOwnProperty(connection)) {
      //Due to the first 97 characters being the same always, no need to display it
      //it also needs to be shortened so that it does not clutter the page
      connectionsString += connection + "\t:\t" + connectionsJSON[connection].substring(0,100)+"...<br>";
    }
  }
  document.getElementById('connections').innerHTML = connectionsString;
}
