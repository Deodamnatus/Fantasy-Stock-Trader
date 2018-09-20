var usernameValid=false;


document.getElementById('username').onkeyup = function checkUsername(){
  var username=document.getElementById('username').value.toString().toLowerCase();
  console.log("checking "+username);
  if (username.indexOf('.') > -1||username.indexOf('#') > -1||username.indexOf('$') > -1||username.indexOf('[') > -1||username.indexOf(']') > -1) {
    console.log("Invalid Characters");
    document.getElementById('usernameInvalid').style='display:show';
    document.getElementById('usernameTaken').style='display:none';
    usernameValid=false;
  } else if (username!=='') {
    document.getElementById('usernameInvalid').style='display:none';
    firebase.database().ref('usernames/'+username).once('value').then( function(snapshot) {
      if (snapshot.val()==null) {
        console.log("Username Not Taken");
        document.getElementById('usernameTaken').style='display:none';;
        usernameValid=true;
      } else {
        console.log("Username Taken");
        document.getElementById('usernameTaken').style='display:show';
        usernameValid=false;
      }
    });
  } else {
    document.getElementById('usernameTaken').style='display:none';
    document.getElementById('usernameInvalid').style='display:none';
  }
};

document.getElementById('signUp').addEventListener('click', e=> {
  document.getElementById('signUpError').style='display:none';
  console.log('Clicked Button');
  if (usernameValid) {
    console.log('Valid Username');
    firebase.auth().createUserWithEmailAndPassword(document.getElementById('username').value.toString().toLowerCase()+"@stock-app.com", document.getElementById('password').value).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log("Error "+errorCode+": "+errorMessage);

      while( document.getElementById('errorText').firstChild ) {
          document.getElementById('errorText').removeChild( document.getElementById('errorText').firstChild );
      }
      document.getElementById('errorText').appendChild( document.createTextNode("Error "+errorCode+": "+errorMessage) );
      document.getElementById('signUpError').style='display:show';
    });
  }
});

document.getElementById('username').addEventListener("keyup", function(event) {
    event.preventDefault();
    // if enter pressed
    if (event.keyCode === 13) {
        document.getElementById('signUp').click();
    }
});

document.getElementById('password').addEventListener("keyup", function(event) {
    event.preventDefault();
    // if enter pressed
    if (event.keyCode === 13) {
        document.getElementById('signUp').click();
    }
});
firebase.auth().onAuthStateChanged(firebaseUser=>{
  if(firebaseUser){
    document.getElementById('inputForm').style='display:none';
    document.getElementById('loading').style='display:show';
    firebase.database().ref('users/'+firebaseUser.uid+'/liquidAssets').on('value',function(liquidAssetsSnap){
      if (liquidAssetsSnap.val()!==null){
      window.location='portfolio.html';
    }else{
      console.log("Account setup not complete yet");
    }
    });
  }else{
    console.log("Not Logged In");
  }
});
