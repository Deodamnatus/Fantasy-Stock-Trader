function initializeApp(){
  document.getElementById('btnSignout').addEventListener('click', e=>{
    firebase.auth().signOut().then(function() {
      console.log('Signed Out');
    }, function(error) {
      console.error('Sign Out Error', error);
    });
  });

  firebase.database().ref('users/'+window.uid+'/liquidAssets').on('value', function(liquidSnap){
    document.getElementById('liquidAssets').innerHTML='$'+liquidSnap.val().toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    updateNetWorth();
  });

  document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.materialboxed');
    var instances = M.Materialbox.init(elems, options);
  });

  function updateNetWorth(){
    firebase.database().ref('users/'+window.uid+'/liquidAssets').once('value', function(liquidAssetsSnap){
      var totalAssets=parseFloat(liquidAssetsSnap.val());
      for (i=1; i<document.getElementById('cardContainer').children.length; i++){
        var shares=parseFloat(document.getElementById('cardContainer').children[i].children[0].children[1].children[0].children[2].innerHTML.split(' ')[1]);
        var price=parseFloat(document.getElementById('cardContainer').children[i].children[0].children[1].children[0].children[3].innerHTML.split(' ')[1]);
        totalAssets=totalAssets+(shares*price);
      }
      document.getElementById('netWorth').innerHTML="Net Worth: $"+totalAssets.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    });
  }

  function makeNewStockCard(symbol){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", 'https://api.iextrading.com/1.0/stock/'+symbol+'/logo', true); // false for synchronous request
    xmlHttp.onload = function (e) {
      if (xmlHttp.readyState === 4) {
        if (xmlHttp.status === 200) { // if http request to api goes through
          var imgLink=JSON.parse(xmlHttp.responseText)['url'];

          var divCol=document.createElement('div');
          var divCard=document.createElement('div');
          var divCardImage=document.createElement('div');
          var divCardStacked=document.createElement('div');
          var divCardContent=document.createElement('div');
          var divCardAction=document.createElement('div');
          var imgCard=document.createElement('img');
          var spanTitle=document.createElement('span');
          var pTicker=document.createElement('p');
          var pShares=document.createElement('p');
          var pPrice=document.createElement('p');
          var aGraphLink=document.createElement('a');

          divCol.setAttribute('class', "col s3 m3");
          divCard.setAttribute('class', "card horizontal");
          divCardImage.setAttribute('class', "card-image waves-effect waves-light materialboxed");
          divCardStacked.setAttribute('class', "card-stacked");
          divCardContent.setAttribute('class', "card-content black-text");
          imgCard.setAttribute('class', "activator");
          imgCard.setAttribute('src', imgLink);
          spanTitle.setAttribute('class', "card-title");
          spanTitle.innerHTML=tickerToCompanyDict[symbol]; //TODO add company official name instead of symbol
          pTicker.innerHTML=symbol;
          pShares.id=symbol+'shares';
          pShares.innerHTML='Shares: 0';
          pPrice.id=symbol+'price';
          pPrice.innerHTML='Price: 1';
          
          aGraphLink.setAttribute('href', 'graphs.html?'+symbol);

          divCardImage.appendChild(aGraphLink);
          aGraphLink.appendChild(imgCard);

          divCardContent.appendChild(spanTitle);
          divCardContent.appendChild(pTicker);
          divCardContent.appendChild(pShares);
          divCardContent.appendChild(pPrice);
          divCardStacked.appendChild(divCardContent);
          divCard.appendChild(divCardImage);
          divCard.appendChild(divCardStacked);
          divCol.appendChild(divCard);
          document.getElementById('cardContainer').appendChild(divCol);


          firebase.database().ref('users/'+window.uid+'/shares/'+symbol).on('value', function(sharesSnap){
            document.getElementById(symbol+'shares').innerHTML='Shares: '+sharesSnap.val();
            updateNetWorth();
          });
          const socket = io('https://ws-api.iextrading.com/1.0/tops')
          socket.on('connect', function(){
            socket.emit('subscribe', symbol);

          });
          socket.on('message', message => {
            var msgDict=JSON.parse(message);
            document.getElementById(symbol+'price').innerHTML = 'Price: '+msgDict['lastSalePrice'].toString();
            updateNetWorth();
          });

          socket.on('disconnect', function(){
            console.log('Disconected socket for '+symbol);
          });
        } else {
          console.error('HTTP error: '+xmlHttp.statusText);
        }
      }
    };
    xmlHttp.onerror = function (e) {
      console.error('XML error: '+xmlHttp.statusText);
    };
    xmlHttp.send(null);
  }
  firebase.database().ref('users/'+window.uid+'/shares/').once('value', function(stocksSnap){
    if(stocksSnap.val()===null){
      document.getElementById('netWorth').innerHTML="Oops, it looks like you don't own any stocks. Why not get trading by searching for a company with the search bar!";
    } else{
      for (i=0; i<Object.keys(stocksSnap.val()).length; i++){
        makeNewStockCard(Object.keys(stocksSnap.val())[i]);
      }
    }
  });
}

firebase.auth().onAuthStateChanged(firebaseUser=>{
  if(firebaseUser){
    window.uid = firebaseUser.uid;
    firebase.database().ref('/users/'+window.uid+'/username').once('value').then( function (usernameSnapshot){
      window.username = usernameSnapshot.val();
      if (usernameSnapshot.val()!==null){
        initializeApp();
      } else {
        console.log('Ruined');
      }
    });
  }else{
    window.location.href = 'login.html';
  }
});
