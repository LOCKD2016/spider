import http from 'http';
import url from 'url';
import eventproxy from 'eventproxy';
import superagent from 'superagent';
import cheerio from 'cheerio';
import async from 'async';

var pageUrls = [],
    urls = [],
    views = [],
    obj = {},
    result = [];

var ep = new eventproxy();

for(var i = 1;i <= 1;i++){
  pageUrls.push('http://www.cnblogs.com/?CategoryId=808&CategoryType=%22SiteHome%22&ItemListActionName=%22PostList%22&PageIndex='+ i +'&ParentCategoryId=0');
}

function start(){
  function pageRequest(req,res){
    for(var i of pageUrls){
      superagent.get(i)
        .end(function(err,res){
          if(err){
            res.write(err);
          }
          var $ = cheerio.load(res.text);
          var tem = $('.titlelnk');
          var num = $('.article_view');
          //链接地址
          for(var k = 0;k < tem.length;k++){
            var view = num.eq(k).children('.gray').text();
            var viewnum = view.replace(/[^0-9]/ig,'');
            var articleUrl = tem.eq(k).attr('href');
            var title = tem.eq(k).text();
            obj[viewnum+''] = '标题:'+title+'-------地址:'+articleUrl+'--------阅读数'+viewnum;
            views.push(viewnum);
            urls.push(articleUrl);
            ep.emit('blog',viewnum);
          }
        })
    }
    ep.after('blog',pageUrls.length*20,function(urls){
      urls.sort(function(a,b){
        return b-a;
      });
      res.write('<head><meta charset="utf-8"></head>');
      for(var i = 0;i < urls.length;i++){
        res.write('第'+(i+1)+'条数据-------'+obj[urls[i]+'']+'</br>');
      }
      res.end();
    })
  }
  http.createServer(pageRequest).listen(3000);
  console.log('server is running at 3000...')
}
exports.start = start;

