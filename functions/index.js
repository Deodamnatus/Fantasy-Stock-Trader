const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var request = require('request');


const stockTickerList=["MMM",
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

/*
exports.testWriting = functions.database.ref('testboi').onWrite((snapshot, context) => {
  if (context.authType === 'ADMIN') {
    console.log("written by admin");
    return 0;
  } else if (context.authType === 'USER') {
    console.log(snapshot.after.val(), 'written by', context.auth.uid);
    return admin.database().ref('testboi').set(snapshot.after.val().toUpperCase());
  }

});

exports.testAPI = functions.database.ref('testAPI').onWrite((snapshot, context) => {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", "https://api.iextrading.com/1.0/stock/fb/price", true ); // false for synchronous request
  xmlHttp.onload = function (e) {
    if (xmlHttp.readyState === 4) {
      if (xmlHttp.status === 200) {
        console.log(body);
        return firebase.database().ref('output').set(body);
      } else {
        console.error(xmlHttp.statusText);
        return firebase.database().ref('output').set(xmlHttp.statusText);
      }
    }
  };
  xmlHttp.onerror = function (e) {
    console.error(xmlHttp.statusText);
    return firebase.database().ref('output').set(xmlHttp.statusText);
  };
  xmlHttp.send(null);
});
*/
exports.valAndSetupNewUser = functions.auth.user().onCreate((user) => {
  var uid = user.uid.toString();
  var email = user.email.toString();
  var username = null;
  // Checking for email validity
  if (email.indexOf('@stock-app.com') === -1 || email.length - email.indexOf('@stock-app.com') !== 14 || email.indexOf(' ') !== -1 || email.toLowerCase() !== email) {  // Checking if email is @send-app.com and ends in @send-app.com
    console.log('Removing user: '+email);
    return admin.auth().deleteUser(uid);
  } else {
    username = email.replace('@stock-app.com','').toLowerCase();
  }
  // Checking username validity
  if (username.indexOf('.') === -1 && username.indexOf('#') === -1 && username.indexOf('$') === -1 && username.indexOf('[') === -1 && username.indexOf(']') === -1 ) {
    admin.database().ref('/usernames/'+username).once('value').then( function(usernameSnap) {
      if (usernameSnap.val() !== null) {
        console.log('Removing user: '+email);
        admin.auth().deleteUser(uid);
        return 1;
      } else {
        // At this point, email is valid username @send-app.com and username doesnt exist yet
        admin.database().ref('/usernames/').update({
          [username]: uid,
        });
        return admin.database().ref('/users/'+uid).set({
            'username': username,
            'liquidAssets':10000,
        });
      }
    }).catch(error => {
    console.log(error);
    return admin.auth().deleteUser(uid);
  });
  } else {
    console.log('Removing user: '+email);
    return admin.auth().deleteUser(uid);
  }
});


// WORKS PERFECTLY DON'T TOUCH
//TODO add way to delete symbol field if it's 0 instead of set to 0
exports.buyStock = functions.database.ref('users/{uid}/shares/{tickerSymbol}').onWrite((snapshot, context) => {
  try {
    const tickerSymbol=context.params.tickerSymbol.toUpperCase();
    snapshot.after.ref.parent.parent.child('liquidAssets').once('value', assetSnap => {
      const liquidAssets = assetSnap.val();
      console.log('liquidAssets: '+liquidAssets.toString());
      //Add security rules so snapshot.after.val() is int and tickerSymbol is string
      if (context.authType === 'ADMIN') {
        console.log('Ignoring write by ADMIN');
        return null;
      } else if (context.authType === 'USER') {
        if(stockTickerList.indexOf(tickerSymbol) >= 0){ // if valid stock symbol
          var url='https://api.iextrading.com/1.0/stock/'+tickerSymbol+'/price';
          console.log('url: '+url);
          request(url, function (error, response, body) {
              if (!error && response.statusCode === 200) {
                  console.log('HTTP response: '+body);
                  var currPrice=body;
                  var timestampOfTransaction=new Date().getTime();
                  if (snapshot.before.exists){
                    var sharesToBuy=0;
                    if (snapshot.after.val()===null){
                      sharesToBuy=-snapshot.before.val();
                    } else if(snapshot.after.val()<0){
                      return snapshot.after.ref.set(snapshot.before.val());
                    } else{
                      sharesToBuy=snapshot.after.val()-snapshot.before.val();
                    }

                    if ((snapshot.before.val()<snapshot.after.val() && liquidAssets >= sharesToBuy*currPrice) || (snapshot.before.val()>snapshot.after.val())){ // if they have the funds to make the purchase and are trying to buy or if they are selling
                      const newLiquidAssets=liquidAssets-(sharesToBuy*currPrice);
                      var transaction='Buy';
                      snapshot.after.ref.set(snapshot.after.val());
                      if (sharesToBuy<0){
                        transaction='Sell';
                        sharesToBuy=-sharesToBuy;
                      }
                      snapshot.after.ref.parent.parent.child('liquidAssets').set(newLiquidAssets).catch(error => {
                        console.error(error);
                      });
                      if (snapshot.after.val()===0){
                        snapshot.after.ref.set(null);
                      }
                      return snapshot.after.ref.parent.parent.child('transactions').push({
                        timestamp: timestampOfTransaction,
                        transaction: transaction,
                        stock: tickerSymbol,
                        volume: sharesToBuy,
                        price: currPrice
                      }).catch(error => {
                        console.error(error);
                      });
                    } else{
                      return snapshot.after.ref.set(snapshot.before.val());
                    }
                  } else if(liquidAssets >= snapshot.after.val()*currPrice){ //if they don't have any and are trying to buy some
                    const newLiquidAssets=liquidAssets-(snapshot.after.val()*currPrice);
                    snapshot.after.ref.parent.parent.child('liquidAssets').set(newLiquidAssets).catch(error => {
                      console.error(error);
                    });
                    if (snapshot.after.val()===0){
                      snapshot.after.ref.set(null);
                    }
                    return snapshot.after.ref.parent.parent.child('transactions').push({
                      timestamp: timestampOfTransaction,
                      transaction: 'Buy',
                      stock: tickerSymbol,
                      volume: snapshot.after.val(),
                      price: currPrice
                    }).catch(error => {
                      console.error(error);
                    });
                  } else{
                    return snapshot.after.ref.set(null);
                  }
              } else{
                console.error(error);
                return snapshot.after.ref.set(snapshot.before.val());
              }
          });
        }
      }
    }).catch(error => {
    console.error(error);
    return snapshot.after.ref.set(snapshot.before.val());
  });
} catch (e) {
  console.error(e);
  return snapshot.after.ref.set(snapshot.before.val());
}
});
