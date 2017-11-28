var http = require("http");
var cheerio = require("cheerio");
var request = require("request");
var firebase = require("firebase");
var schedule = require('node-schedule');

var config = {
    apiKey: "AIzaSyDZvRu51DMQCns95fGmbVgUFAE_3H132xE",
    authDomain: "elpisapi.firebaseapp.com",
    databaseURL: "https://elpisapi.firebaseio.com",
    projectId: "elpisapi",
    storageBucket: "",
    messagingSenderId: "939060458054"
};
firebase.initializeApp(config);
var noticeref = firebase.database().ref("notice");
//var ref = new Firebase("https://elpisapi.firebaseio.com/");

var crawlData = function (callback) {

    var prefix_http  = 'http://';
    var suffix_pdf = 'pdf';
    var suffix_PDF = 'PDF';
    var url = 'http://www.ipu.ac.in/notices.php';
    console.log("enter crawldat");
    noticeref.orderByChild('date').limitToLast(1).once('value', function(snapshot)  {
        snapshot.forEach(function(child) {

            var last_date =  child.val().date;
            var latest_date = last_date.split("/");


            request(url,function (error,response,html) {

                var data = cheerio.load(html);

                data('tr').each(function (index, val) {
                    var td_text = data(val).find("td").length;

                    if (td_text == 2) {
                        console.log("&&&&&&&");
                        var link = (data(val).find('td:nth-of-type(1)')).find('a').attr('href');
                        var title = data(val).find('td:nth-of-type(1)').text().trim();
                        var new_date = data(val).find('td:nth-of-type(2)').text().trim();
                        var date = new_date;
                        var date = date.split("-");

                        new_date = new_date.split("-").reverse().join("/");

                        if((latest_date[0] < date[2]) || (latest_date[0]== date[2] && latest_date[1]<date[1]) || (latest_date[0]==date[2] && latest_date[1]==date[1] && latest_date[2]<date[0])) {


                            if (link.substr(0, prefix_http.length) == prefix_http) {
                                console.log(date + " " + latest_date);
                                noticeref.push({
                                    title: title,
                                    link: link,
                                    date: new_date
                                });

                            }
                            else {
                                if ((link.substr(link.length - 3, link.length) == suffix_pdf) || (link.substr(link.length - 3, link.length) == suffix_PDF)) {
                                    var main_link = "http://www.ipu.ac.in";
                                    link = main_link + link;

                                    noticeref.push({
                                        title: title,
                                        link: link,
                                        date: new_date
                                    });


                                }
                            }
                        }
                        else {
                            console.log( latest_date + " **** " + new_date);
                        }
                    }
                });

            });
        });
    });


};

var rule = new schedule.RecurrenceRule();

schedule.scheduleJob('0 1 * * *', function(){

    crawlData(); // crawling function for crawling data at 1 A.M everyday.
});



var crawling = function (callback) {

    var json = [];
    var latest_date_ref =  noticeref.orderByChild('date').limitToLast(1);
    noticeref.orderByChild('date').limitToLast(5).once('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
          var data = childSnapshot.val();

          json.push(data);
      });
        callback(0,json);
    });
};

var server = http.createServer(function(request, response) {

    if(request.url=='/'){

        crawling(function (error,json) {
            if(error){
                response.write(JSON.stringify({status:'error'}));
                response.end();
            }else{
                var res = {};
                res.status  = "ok";
                res.data = json;
                response.write(JSON.stringify(res));
                response.end();
            }
        });
    }else{
        response.write('404 Page Not Found');
        response.end();
    }
});


server.listen( process.env.PORT || 80);