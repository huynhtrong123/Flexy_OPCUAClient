var  urdb ='    	mongodb://demo01:abcd0123@124.158.10.133:27017/srv_demo_1?authSource=admin',
mongoose = require('mongoose');
 mongoose.connect(urdb, {useNewUrlParser: true, useUnifiedTopology: true});
var gatewaySchema = new mongoose.Schema({
	site_id: String,
	site_name: String,
	ip: String,
	port: Number,
	username: Number,
	password: String
});
var gateway = mongoose.model('gateway', gatewaySchema,'gateway_config');

gateway.find({},function(err,docs)
	{
		var Data_Config = [];
		if (docs.length >=1)
		{
			//console.log("Data from DB name",docs[0].ip);
		}
		else
		{
			//console.log("No config!!!");
		}
	})
	
	
	//*******************MS SQL ***********************//
	  // config for your database
    const sqlConfig = {
  password: 'conheo123',
  database: 'S71200',
  stream: false,
  options: {
    enableArithAbort: true,
    encrypt: true
  },
  port: 54863,
  user: 'sa',
  server: 'DUYTRONGPC',
}

 var sql = require("mssql");

      

    // connect to your database
    sql.connect(sqlConfig, function (err) {

        if (err) console.log(err);
		else
		{
			console.log("okk");
			var request = new sql.Request();
	 request.query('select * from tblEmployee', function (err, recordset) {

            if (err) console.log(err)

            // send records as a response
            else
			{
				console.log("Data MS SQL",recordset.recordsets[0][1]);
			}

        });
		}
	});
	
