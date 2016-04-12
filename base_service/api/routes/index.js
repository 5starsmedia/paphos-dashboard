'use strict';

exports.init = function (app) {

    app.server.get('/api', function(req, res, next){
        setTimeout(function(){
              res.json({ success: true });
        }, 20000);

    });

    app.server.use("/api/subscription", require("./subscribe.js"));
}
