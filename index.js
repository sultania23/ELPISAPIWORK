var http = require("http");
var cheerio = require("cheerio");
var request = require("request");

var crawlData = function (callback) {

   var url = 'http://www.ipu.ac.in/notices.php';
    request(url,function (error,response,html) {
        var data = cheerio.load(html);
        var json_data = [];
        data('tr').each(function (index,val) {

            var td_text = data(val).find("td").length;

            var prefix_http  = 'http://';
            var suffix_pdf = 'pdf';
            var suffix_PDF = 'PDF';
            if(td_text == 2){
                var link = (data(val).find('td:nth-of-type(1)')).find('a').attr('href');
                var title = data(val).find('td:nth-of-type(1)').text().trim();
                var date =  data(val).find('td:nth-of-type(2)').text().trim();

                if(link.substr(0,prefix_http.length)==prefix_http) {
                    json_data.push({title:title,date:date,link:link});
                }
                else
                {
                    if((link.substr(link.length-3,link.length)==suffix_pdf) || (link.substr(link.length-3,link.length)==suffix_PDF)) {
                        var main_link = "http://www.ipu.ac.in";
                        link = main_link + link;
                        //console.log(link+"    "+title);
                        json_data.push({title: title, date: date, link: link});
                    }
                }

            }
        });
        if(error) {
           callback(1,{});
        }
        else
        {
            callback(0,json_data);
        }
    });
};

var server = http.createServer(function(request, response) {
    if(request.url=='/'){
        crawlData(function (error,json) {
            if(error){
                response.write({status:'error'});
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
