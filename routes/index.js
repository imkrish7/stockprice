var express = require('express');
var router = express.Router();
var request = require("request");
var stockPrice = require('../models/stockmodel')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Stock Price Checker' });
});
const API_KEY = "4CQDRHZ9G6ILCMAR";

var getApi = (stock) => {

  var url = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + stock +
    '&apikey=' + API_KEY;

    let stockObj = {};
    return new Promise((resolve,reject)=>{
        request.get(url, {
              json: true
            }, (error, response, body) => {
              if(error)
                reject( error);


                stockObj.Stock =  body['Global Quote']['01. symbol'];
                stockObj.Price = body['Global Quote']['05. price'];

                resolve(stockObj)
            })
    })    
}

var flagReturn  = (stock) =>{
  return new Promise((resolve,reject) =>{
                          stockPrice.find({ Stock: stock })
                          .toArray((error ,result)=>{
                            if(error)
                                reject(error)

                                
                            resolve(result!==null)
                          })
                        })
}

var databaseSave = (stock,ip,like) =>{
    
   return new Promise((resolve,reject)=>{
               stockPrice.findOne({ Stock: stock.Stock }, (error, data) => {
                 if (error)
                   reject(error);

                 if (data !== null) {
                      
                   if (ip !== data.Ip && (like === 'on'|| like === true)) {
                     data.Stock = stock.Stock
                     data.Ip = ip
                     data.Price = stock.Price
                     data.Likes = data.Likes + 1;
                     data.save((error, d) => {
                       if (error)
                         reject(error);

                       resolve(d);
                     })
                   } else {
                     resolve(data)
                   }
                 } else {
                   var newStock;
                   if (like == "on" || like === true) {
                     newStock = new stockPrice({
                       Stock: stock.Stock,
                       IP: ip,
                       Price: stock.Price,
                       Likes: 1
                     })
                   } else {
                     newStock = new stockPrice({
                       Stock: stock.Stock,
                       Price: stock.Price,
                       IP: ip,
                       Likes: 0
                     })
                   }
                   newStock.save((error, d) => {

                     if (error)
                       reject(error);

                     resolve(d)
                   })
                 }
               })
             
            })
           }


var initializeStock = async (req, res, next) => {

  var ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(',')[0];
  var like = req.query.like;
   res.result = {}
    if(Array.isArray(req.query.stock)){
      var stock1 = await getApi(req.query.stock[0]);
      var stock2 = await getApi(req.query.stock[1]);

      var stockObj1= await databaseSave(stock1,ip,like)
      var stockObj2= await databaseSave(stock2,ip,like)

      res.result = [
                {
                  Stock: stockObj1.Stock,
                  Price: stockObj1.Price,
                  rel_likes: Math.abs(stockObj1.Likes - stockObj2.Likes)
                },
                 {
                   Stock: stockObj2.Stock,
                   Price: stockObj2.Price,
                   rel_likes: Math.abs(stockObj1.Likes - stockObj2.Likes)
                 }
      ]
    }
    else{
      var stock = req.query.stock;
      
      var stockObject = await getApi(stock);
      console.log(stockObject)
     res.result = await databaseSave(stockObject,ip,like)
    }
    next();
}
router.get('/api/stock-prices',initializeStock,(req,res) => {
  
  res.send(res.result)
     
})
module.exports = router;
