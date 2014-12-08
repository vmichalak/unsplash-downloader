var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');

function downloader(pageNumber, folder)
{
  var baseUrl = "http://unsplash.com";
  var baseGridUrl = "/grid?page=";
  var url = baseUrl + baseGridUrl + pageNumber;

  request(url, function(error, response, html){
    if (!error) {
      var $ = cheerio.load(html);

      try { 
        var nbPhotos = $('.photo>a').length;
      } catch(err) {
        var nbPhotos = 0;
      }

      $('.photo>a').each(function(i,elem){
        var htmlUrl = $(this).attr('href');
        var downloadUrl = baseUrl+htmlUrl;
        var fileName = htmlUrl.replace('/photos/', '').replace('/download', '');

        // Download Image
        request(downloadUrl).on('response',  function (res) {
          res.pipe(fs.createWriteStream(folder+'/' + fileName + '.' + res.headers['content-type'].split('/')[1]));
          console.log("Photo " + fileName + " downloaded.");
        });
        // End Download Image
      });

      console.log("Page "+pageNumber+" scrapped: "+nbPhotos+" photos added to the waiting list.");

      if(nbPhotos > 0)
      {
        downloader(pageNumber + 1);
      }
    }
  });

}

//Start the script at the Page 1
downloader(1, process.argv.slice(2));