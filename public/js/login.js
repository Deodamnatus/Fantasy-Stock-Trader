const txtUsername=document.getElementById("username");
const txtPassword=document.getElementById("password");
const btnLogin=document.getElementById("login");

btnLogin.addEventListener('click', e =>{
  const username=txtUsername.value.toString().toLowerCase();
  const pass=txtPassword.value;
  document.getElementById('signUpError').style='display:none';
  firebase.auth().signInWithEmailAndPassword(username + '@stock-app.com',pass).catch(function(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log("Error "+errorCode+": "+errorMessage);

    while( document.getElementById('errorText').firstChild ) {
        document.getElementById('errorText').removeChild( document.getElementById('errorText').firstChild );
    }
    document.getElementById('errorText').appendChild( document.createTextNode("Error "+errorCode+": "+errorMessage) );
    document.getElementById('signUpError').style='display:show';
  });
});

txtUsername.addEventListener("keyup", function(event) {
    event.preventDefault();
    // if enter pressed
    if (event.keyCode === 13) {
        btnLogin.click();
    }
});

txtPassword.addEventListener("keyup", function(event) {
    event.preventDefault();
    // if enter pressed
    if (event.keyCode === 13) {
        btnLogin.click();
    }
});


firebase.auth().onAuthStateChanged(firebaseUser=>{
  if(firebaseUser){
    window.location.href = 'portfolio.html'; //not updating correctly for some reason
  }else{
    console.log("Logged Out");
  }
});
