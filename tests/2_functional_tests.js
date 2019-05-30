const chai = require('chai');
const ChaiHttp = require('chai-http');
const assert = chai.assert;
const router = require('../app')

chai.use(ChaiHttp);

suite("Functional test ",()=>{


    suite('GET /api/stock-prices => stockData object',()=>{

        test("1 stock ",(done)=>{

            chai.request(router)
                .get('/api/stock-prices')
                .query({stock:'goog'})
                .end((error,res)=>{
                    assert.equal(res.status,200)
                    assert.isObject(res.body,"response should be an Object");
                    assert.property(res.body,'Stock')
                    assert.property(res.body,"Price")
                    assert.property(res.body,"Likes")
                    assert.equal(res.body.Stock,'GOOG')
                    assert.equal(res.body.Likes, 0)
                    done();
                })
        })


        test('1 stock with likes',(done) =>{

            chai.request(router)
                .get('/api/stock-prices')
                .query({
                    stock: 'FB',
                    like:true
                })
                .end((error, res) => {
                    assert.equal(res.status, 200)
                    assert.isObject(res.body, "response should be an Object");
                    assert.equal(res.body.Stock, 'FB')
                    assert.equal(res.body.Likes, 1)
                    done();
                })
        })

        test(" 1 stock with like again (ensure likes aren't  double counted)" ,(done)=>{

             chai.request(router)
                 .get('/api/stock-prices')
                 .query({
                     stock: 'FB',
                     like: true
                 })
                 .end((error, res) => {
                     assert.equal(res.status, 200)
                     assert.isObject(res.body, "response should be an Object");
                     assert.equal(res.body.Stock, 'FB')
                     assert.equal(res.body.Likes, 1)
                     done();
                 })
        })


        test("2 Stock ",(done) => {
             chai.request(router)
                 .get('/api/stock-prices')
                 .query({
                     stock: ['FB','GOOG'],
                     
                 })
                 .end((error, res) => {
                     assert.equal(res.status, 200)
                     assert.isArray(res.body, "response should be an Object");
                     assert.property(res.body[0], 'Stock')
                     assert.property(res.body[0], 'Price')
                     assert.property(res.body[0],'rel_likes')
                     done();
                 })
        })


        test(" 2 Stock with likes ",(done) =>{
            chai.request(router)
                .get('/api/stock-prices')
                .query({
                    stock: ['FB', 'GOOG'],
                    like:true
                })
                .end((error, res) => {
                    assert.equal(res.status, 200)
                    assert.isArray(res.body, "response should be an Object");
                    assert.property(res.body[0], 'Stock')
                    assert.property(res.body[0], 'Price')
                    assert.property(res.body[0], 'rel_likes')
                    assert.equal(res.body[0].Stock, 'FB')
                    assert.equal(res.body[1].Stock, 'GOOG')
                    done();
                })
        })
    })
})