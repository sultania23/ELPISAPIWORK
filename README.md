
ELPISAPIWORK
  * Simple API to fetch latest notices from the given page : "http://www.ipu.ac.in/notices.php"

  * End-Point : "https://elpis-notification.herokuapp.com/"
 * System requirements
  1.Node.js
  
* API build using node.js and firebase.

* sample code
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
 How to contribute

   * File an issue in the repository, using the bug tracker, describing the contribution you'd like to make. This will help us to get you started on the right foot.
   * Fork the project in your account and create a new branch: your-great-feature.
   * Commit your changes in that branch.
   * Open a pull request, and reference the initial issue in the pull request message.
 
