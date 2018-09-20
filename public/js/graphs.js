function initializeApp(){
  document.getElementById('btnSignout').addEventListener('click', e=>{
    firebase.auth().signOut().then(function() {
      console.log('Signed Out');
    }, function(error) {
      console.error('Sign Out Error', error);
    });
  });
  try {
    var tickerSymbol=window.location.href.split('?')[1].toString().toUpperCase();
  } catch (e) {
    console.error(e);
  }

  if (stockTickerList.indexOf(tickerSymbol)==-1){
    alert('Invalid ticker symbol: '+tickerSymbol);
    window.location='index.html';
  }
  document.getElementById('companyName').innerHTML=tickerToCompanyDict[tickerSymbol]+' ('+tickerSymbol+')';

  firebase.database().ref('users/'+window.uid+'/liquidAssets').on('value', function(liquidSnap){
    document.getElementById('liquidAssets').innerHTML='$'+liquidSnap.val().toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  });
  firebase.database().ref('users/'+window.uid+'/shares/'+tickerSymbol).on('value', function(stockSnap){
    if (stockSnap.val()===null){
      document.getElementById('personalShares').innerHTML='Your shares: 0';
    }else{
      document.getElementById('personalShares').innerHTML='Your shares: '+stockSnap.val().toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  });


  function buyStock(volume){
    firebase.database().ref('users/'+window.uid+'/shares/'+tickerSymbol).once('value',function(stockSnap){
      firebase.database().ref('users/'+window.uid+'/liquidAssets').once('value',function(assetSnap){
        var currentShares=stockSnap.val();
        if(currentShares==null){
          currentShares=0;
        }
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", 'https://api.iextrading.com/1.0/stock/'+tickerSymbol+'/price', true); // false for synchronous request
        xmlHttp.onload = function (e) {
          if (xmlHttp.readyState === 4) {
            if (xmlHttp.status === 200) { // if http request to api goes through
              console.log('HTTP response: '+xmlHttp.responseText);
              var newShares=(volume+currentShares).toString();
              var newCash=(assetSnap.val()-(xmlHttp.responseText*volume)).toFixed(2);
              var confirmDialog='Are you sure you want to complete this transaction:\nNew Shares of '+tickerSymbol+': '+newShares+'\nNew Cash: '+newCash.replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"\n\nNote you may need to wait for the server to validate your requests before cash is deducted.";
              if (newShares>=0 && newCash>=0){
                if (confirm(confirmDialog)) {
                  document.getElementById('exchange').value='';
                  return firebase.database().ref('users/'+window.uid+'/shares/'+tickerSymbol).set(volume+currentShares);
                } else {
                  return 0;
                }
              }else{
                alert("Can't complete transaction with result:\nNew Shares of "+tickerSymbol+': '+newShares+'\nNew Cash: '+newCash.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
              }
            } else {
              console.error('HTTP error: '+xmlHttp.statusText);
            }
          }
        };
        xmlHttp.onerror = function (e) {
          console.error('XML error: '+xmlHttp.statusText);
        };
        xmlHttp.send(null);

      });
    });
  }



  function updateGraph(chartType){
    var APIurl="https://api.iextrading.com/1.0/stock/"+window.location.href.split('?')[1]+'/chart/'+chartType;
    console.log("url: "+APIurl);
    var dataKey='close';
    if(chartType=='1d'){
      dataKey='average';
    }
    console.log('Getting Chart Data')
    getChartData(APIurl, dataKey);
  };
  var last='';
  var canvas = document.getElementById('myChart');
  //TODO add $ in front of points, remove grey square and add animations for adding and removing data
  var myLineChart = Chart.Line(canvas, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: "",
        fill: true,
        lineTension: 0,
        min:0,
        backgroundColor: "rgba(3, 169, 244, 0.6)",
        borderColor: "rgba(3, 169, 244, 1)",
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: "rgba(0,0,0,1)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(220,220,220,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 1,
        pointRadius: .0001,
        pointHitRadius: 10,
        data: [],
      }],
        scales: {
          xAxes: [{
            type: 'time',
            time: {

            }
          }],
        }
    },
    options: {
      scales: {
        xAxes: [{
            ticks: {
                // Include a dollar sign in the ticks
                callback: function(value, index, values) {
                  if(last!=value){
                    return;
                  }
                  else{
                    return value;
                  }
                }
              }
        }],
          yAxes: [{
              ticks: {
                  // Include a dollar sign in the ticks
                  callback: function(value, index, values) {
                      return '$' + value;
                  }
              }
          }]
      }
    }
  });


  function addData(chart, label, data) {
      chart.data.labels.push(label);
      chart.data.datasets.forEach((dataset) => {
          dataset.data.push(data);
      });
      //chart.update();
  }
  function removeData(chart) {
      chart.data.labels.pop();
      chart.data.datasets.forEach((dataset) => {
          dataset.data.pop();
      });
      chart.update();
  }

  // define button functionality
  document.getElementById('btn1d').addEventListener('click', e=>{
    updateGraph('1d');
  });
  document.getElementById('btn1m').addEventListener('click', e=>{
    updateGraph('1m');
  });
  document.getElementById('btn3m').addEventListener('click', e=>{
    updateGraph('3m');
  });
  document.getElementById('btn6m').addEventListener('click', e=>{
    updateGraph('6m');
  });
  document.getElementById('btn1y').addEventListener('click', e=>{
    updateGraph('1y');
  });
  document.getElementById('btn5y').addEventListener('click', e=>{
    updateGraph('5y');
  });
  document.getElementById('buy').addEventListener('click', e=>{
    try {
      var volume=parseInt(document.getElementById('exchange').value);
     	buyStock(volume);
    } catch (e) {
      console.error(e);
    }
  });
  document.getElementById('sell').addEventListener('click', e=>{
    try {
      var volume=parseInt(document.getElementById('exchange').value);
     	buyStock(-volume);
    } catch (e) {
      console.error(e);
    }
  });

  var option = {
    showLines: true
  };

  function getChartData(url, dataKey){ //dataKey is 'close' for all except 1d graph ('average')
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, true ); // false for synchronous request
    xmlHttp.onload = function (e) {
      if (xmlHttp.readyState === 4) {
        if (xmlHttp.status === 200) {
          //console.log(xmlHttp.responseText);
          var responseDict = JSON.parse(xmlHttp.responseText);
          for(x =myLineChart.data.labels.length;x>0;x--){
            removeData(myLineChart);
          }
          for (var i=0; i<responseDict.length; i++){
            var dict=responseDict[i];
            if (dict[dataKey]>0){
              addData(myLineChart,dict['label'],dict[dataKey]);
            }
          }
          myLineChart.update();
          //output complete
        } else {
          console.log(xmlHttp.statusText);
        }
      }
    };
  xmlHttp.onerror = function (e) {
          console.error(xmlHttp.statusText);
        };
        xmlHttp.send(null);
    }

    var lastSalePrice=0;

    var firstpriceofday=0;

    function openSockets(open){

      const percentchangesocket = io('https://ws-api.iextrading.com/1.0/tops');

      percentchangesocket.on('connect', function(){

        percentchangesocket.emit('subscribe', tickerSymbol)

      });

      percentchangesocket.on('message', message => {

        var percentDict=JSON.parse(message);

        lastSalePrice = percentDict['lastSalePrice'];

        console.log('Updated last sale price');

      });

      percentchangesocket.on('disconnect', function(){

        console.log("Disconnected socket");

      });



      const pricesocket = io('https://ws-api.iextrading.com/1.0/last');

      pricesocket.on('connect', function(){

        pricesocket.emit('subscribe', tickerSymbol)

      });

      pricesocket.on('message', message => {

        var priceDict=JSON.parse(message);

        document.getElementById('price').innerHTML ="Price: $"+ priceDict['price'].toString();

        console.log('Updated real time price');

        var calcchange = ((( open - lastSalePrice) / lastSalePrice) * 100);

        calcchange = calcchange.toFixed(2);
        if(calcchange>0){
          calcchange='+'+calcchange.toString()+'%'
          document.getElementById('percentchange').setAttribute('class','light-green-text accent-3');
        }else {
          calcchange=calcchange.toString()+'%'
          document.getElementById('percentchange').setAttribute('class','red-text accent-3');
        }

        document.getElementById('percentchange').innerHTML = calcchange;

        console.log('Updated percent change');

      });

      pricesocket.on('disconnect', function(){

        console.log("Disconnected socket");

      });



    }

    function httpGetOpenCloseHighLow(){

          var xmlHttp = new XMLHttpRequest();

          xmlHttp.open( "GET", "https://api.iextrading.com/1.0/stock/"+tickerSymbol+"/previous", true ); // false for synchronous request

          xmlHttp.onload = function (e) {

            if (xmlHttp.readyState === 4) {

              if (xmlHttp.status === 200) {

                var previousResponseDict=JSON.parse(xmlHttp.responseText);

                var open=previousResponseDict['open'];

                document.getElementById('open').innerHTML="Open: $" + open.toString();

                var high=previousResponseDict['high'];

                document.getElementById('high').innerHTML="High: $" + high.toString();

                var low=previousResponseDict['low'];

                document.getElementById('low').innerHTML="Low: $" + low.toString();

                var close=previousResponseDict['close'];

                document.getElementById('previousclose').innerHTML="Previous Close Value: $" + close.toString();

                openSockets(open);

              } else {

                console.error(xmlHttp.statusText);

              }

            }

          };

          xmlHttp.onerror = function (e) {

            console.error(xmlHttp.statusText);

          };

          xmlHttp.send(null);

      }

  httpGetOpenCloseHighLow();
  updateGraph('1d');
}
const stockTickerList=[
"MMM",
"ABT",
"ABBV",
"ACN",
"ATVI",
"AYI",
"ADBE",
"AMD",
"AAP",
"AES",
"AET",
"AMG",
"AFL",
"A",
"APD",
"AKAM",
"ALK",
"ALB",
"ARE",
"ALXN",
"ALGN",
"ALLE",
"AGN",
"ADS",
"LNT",
"ALL",
"GOOGL",
"GOOG",
"MO",
"AMZN",
"AEE",
"AAL",
"AEP",
"AXP",
"AIG",
"AMT",
"AWK",
"AMP",
"ABC",
"AME",
"AMGN",
"APH",
"APC",
"ADI",
"ANDV",
"ANSS",
"ANTM",
"AON",
"AOS",
"APA",
"AIV",
"AAPL",
"AMAT",
"APTV",
"ADM",
"ARNC",
"AJG",
"AIZ",
"T",
"ADSK",
"ADP",
"AZO",
"AVB",
"AVY",
"BHGE",
"BLL",
"BAC",
"BK",
"BAX",
"BBT",
"BDX",
"BBY",
"BIIB",
"BLK",
"HRB",
"BA",
"BKNG",
"BWA",
"BXP",
"BSX",
"BHF",
"BMY",
"AVGO",
"CHRW",
"CA",
"COG",
"CDNS",
"CPB",
"COF",
"CAH",
"KMX",
"CCL",
"CAT",
"CBOE",
"CBRE",
"CBS",
"CELG",
"CNC",
"CNP",
"CTL",
"CERN",
"CF",
"SCHW",
"CHTR",
"CVX",
"CMG",
"CB",
"CHD",
"CI",
"XEC",
"CINF",
"CTAS",
"CSCO",
"C",
"CFG",
"CTXS",
"CLX",
"CME",
"CMS",
"KO",
"CTSH",
"CL",
"CMCSA",
"CMA",
"CAG",
"CXO",
"COP",
"ED",
"STZ",
"COO",
"GLW",
"COST",
"COTY",
"CCI",
"CSX",
"CMI",
"CVS",
"DHI",
"DHR",
"DRI",
"DVA",
"DE",
"DAL",
"XRAY",
"DVN",
"DLR",
"DFS",
"DISCA",
"DISCK",
"DISH",
"DG",
"DLTR",
"D",
"DOV",
"DWDP",
"DPS",
"DTE",
"DRE",
"DUK",
"DXC",
"ETFC",
"EMN",
"ETN",
"EBAY",
"ECL",
"EIX",
"EW",
"EA",
"EMR",
"ETR",
"EVHC",
"EOG",
"EQT",
"EFX",
"EQIX",
"EQR",
"ESS",
"EL",
"ES",
"RE",
"EXC",
"EXPE",
"EXPD",
"ESRX",
"EXR",
"XOM",
"FFIV",
"FB",
"FAST",
"FRT",
"FDX",
"FIS",
"FITB",
"FE",
"FISV",
"FLIR",
"FLS",
"FLR",
"FMC",
"FL",
"F",
"FTV",
"FBHS",
"BEN",
"FCX",
"GPS",
"GRMN",
"IT",
"GD",
"GE",
"GGP",
"GIS",
"GM",
"GPC",
"GILD",
"GPN",
"GS",
"GT",
"GWW",
"HAL",
"HBI",
"HOG",
"HRS",
"HIG",
"HAS",
"HCA",
"HCP",
"HP",
"HSIC",
"HSY",
"HES",
"HPE",
"HLT",
"HOLX",
"HD",
"HON",
"HRL",
"HST",
"HPQ",
"HUM",
"HBAN",
"HII",
"IDXX",
"INFO",
"ITW",
"ILMN",
"IR",
"INTC",
"ICE",
"IBM",
"INCY",
"IP",
"IPG",
"IFF",
"INTU",
"ISRG",
"IVZ",
"IPGP",
"IQV",
"IRM",
"JEC",
"JBHT",
"SJM",
"JNJ",
"JCI",
"JPM",
"JNPR",
"KSU",
"K",
"KEY",
"KMB",
"KIM",
"KMI",
"KLAC",
"KSS",
"KHC",
"KR",
"LB",
"LLL",
"LH",
"LRCX",
"LEG",
"LEN",
"LUK",
"LLY",
"LNC",
"LKQ",
"LMT",
"L",
"LOW",
"LYB",
"MTB",
"MAC",
"M",
"MRO",
"MPC",
"MAR",
"MMC",
"MLM",
"MAS",
"MA",
"MAT",
"MKC",
"MCD",
"MCK",
"MDT",
"MRK",
"MET",
"MTD",
"MGM",
"KORS",
"MCHP",
"MU",
"MSFT",
"MAA",
"MHK",
"TAP",
"MDLZ",
"MON",
"MNST",
"MCO",
"MS",
"MOS",
"MSI",
"MSCI",
"MYL",
"NDAQ",
"NOV",
"NAVI",
"NKTR",
"NTAP",
"NFLX",
"NWL",
"NFX",
"NEM",
"NWSA",
"NWS",
"NEE",
"NLSN",
"NKE",
"NI",
"NBL",
"JWN",
"NSC",
"NTRS",
"NOC",
"NCLH",
"NRG",
"NUE",
"NVDA",
"ORLY",
"OXY",
"OMC",
"OKE",
"ORCL",
"PCAR",
"PKG",
"PH",
"PAYX",
"PYPL",
"PNR",
"PBCT",
"PEP",
"PKI",
"PRGO",
"PFE",
"PCG",
"PM",
"PSX",
"PNW",
"PXD",
"PNC",
"RL",
"PPG",
"PPL",
"PX",
"PFG",
"PG",
"PGR",
"PLD",
"PRU",
"PEG",
"PSA",
"PHM",
"PVH",
"QRVO",
"PWR",
"QCOM",
"DGX",
"RRC",
"RJF",
"RTN",
"O",
"RHT",
"REG",
"REGN",
"RF",
"RSG",
"RMD",
"RHI",
"ROK",
"COL",
"ROP",
"ROST",
"RCL",
"CRM",
"SBAC",
"SCG",
"SLB",
"STX",
"SEE",
"SRE",
"SHW",
"SPG",
"SWKS",
"SLG",
"SNA",
"SO",
"LUV",
"SPGI",
"SWK",
"SBUX",
"STT",
"SRCL",
"SYK",
"STI",
"SIVB",
"SYMC",
"SYF",
"SNPS",
"SYY",
"TROW",
"TTWO",
"TPR",
"TGT",
"TEL",
"FTI",
"TXN",
"TXT",
"TMO",
"TIF",
"TWX",
"TJX",
"TMK",
"TSS",
"TSCO",
"TDG",
"TRV",
"TRIP",
"FOXA",
"FOX",
"TSN",
"UDR",
"ULTA",
"USB",
"UAA",
"UA",
"UNP",
"UAL",
"UNH",
"UPS",
"URI",
"UTX",
"UHS",
"UNM",
"VFC",
"VLO",
"VAR",
"VTR",
"VRSN",
"VRSK",
"VZ",
"VRTX",
"VIAB",
"V",
"VNO",
"VMC",
"WMT",
"WBA",
"DIS",
"WM",
"WAT",
"WEC",
"WFC",
"WELL",
"WDC",
"WU",
"WRK",
"WY",
"WHR",
"WMB",
"WLTW",
"WYN",
"WYNN",
"XEL",
"XRX",
"XLNX",
"XL",
"XYL",
"YUM",
"ZBH",
"ZION",
"ZTS"];

firebase.auth().onAuthStateChanged(firebaseUser=>{
  if(firebaseUser){
    console.log('logged in');
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
    console.log('logged out');
    window.location.href = 'login.html';
  }
});
