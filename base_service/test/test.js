var supertest = require('supertest'),
config = require('../api/config'),
filedb = require('diskdb'),
express = require('express'),
bodyParser = require('body-parser'),
request = require('request'),
http_post = require('http-post'),
should = require('should');
// vars
var testclientPort = 8090,
clientHost = "127.0.0.1:"+config.get('http.port'),
testClientUrl = '127.0.0.1:'+testclientPort,
server  = supertest.agent(clientHost),
app = express(), serverCall;

var collection = config.get('filedb.collection'),
db = filedb.connect(config.get("filedb.path.default"), [collection]);

describe("Tests", function() {

    function removeTestSample(done) {
        db[collection].remove({clientUrl : clientHost}, true);
        db[collection].remove({clientUrl : testClientUrl}, true);
        done();
    }

    before(function(done) {
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());

        serverCall = app.listen(testclientPort);
        console.info("*** Start test server ***");
        removeTestSample(done);
    });
    after(function(done) {
        serverCall.close();
        console.info("*** Stop test server ***");
        removeTestSample(done);
    });

    // REST tests
    describe("REST tests", function() {

        this.timeout(60000);

        it("should return default api page", function(done) {
            server

            .get('/api')
            .expect("Content-type", /json/)
            .expect(200)
            .end(function(err, res) {
                if(err) throw err;

                should(res.status).ok;

                should(res.body.error).not.equal(true);

                should(res.body).have.property('success');

                done();
            });
        });

        it("should check service call", function(done) {

            var testPostForm = {
                name: "test",
                clientUrl: testClientUrl
            };

            app.post('/subscribe', function(req, res) {
                should(req.status).ok;
                should(req.body.error).not.equal(true);

                should(req.body).have.property('name', testPostForm.name);
                should(req.body).have.property('clientUrl', testPostForm.clientUrl);
                should(req.body).have.property('status');
                should(+req.body.status).equal(0);

                done();
            });

            http_post('http://'+clientHost+'/api/subscription/subscribe', testPostForm);


        });

        var sendTestPostData = {
            name: "testSubscriber",
            clientUrl: clientHost
        };

        it("should return success message for insertion in DB", function(done) {

            server
            .post('/api/subscription/subscribe')
            .send(sendTestPostData)
            .end(function(err, res) {
                if(err) throw err;

                should(res.status).ok;
                should(res.body).have.property('code');
                should(res.body).have.property('message');

                should(res.body.code).equal(200);
                done();
            });


        });

        it("should return subscriber data", function(done) {

            server
            .get('/api/subscription/ping?clientUrl='+clientHost)
            .end(function(err, res) {
                if(err) throw err;

                should(res.status).ok;
                should(res.body).have.property('code');
                should(res.body).have.property('message');
                should(res.body.code).equal(200);

                should(res.body.message.clientUrl).equal(clientHost);
                should(res.body.message.status).equal(1);

                done();
            });
        })


        it("should return ERROR message for duplicate insertion in DB", function(done) {

            server
            .post('/api/subscription/subscribe')
            .send(sendTestPostData)
            .end(function(err, res) {
                if(err) throw err;

                should(res.status).not.ok;
                should(res.body).have.property('code');
                should(res.body).have.property('message');

                should(res.body.code).equal(500);
                done();
            });
        });


    });

});
