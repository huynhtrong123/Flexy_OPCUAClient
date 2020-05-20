const endpointUrl = "opc.tcp://10.0.0.53:4840"  
	  
var   opcua = require("node-opcua"),
	  async = require("async"),
      client = new opcua.OPCUAClient(),
	  opc_items = new Array(),
	  items_idx = 0,
	  monitored_items = new Array(),
	  the_session = null;
	 
/////////////////OPCUAClient//////////////////////////////////////////
async.series([


    // step 1 : connect to
    function(callback)  {

        client.connect(endpointUrl,function (err) {

            if(err) {
                console.log(" cannot connect to endpoint :" , endpointUrl );
            } else {
                console.log("connected !");
            }
            callback(err);
        });
    },
    // step 2 : createSession
    function(callback) {
        client.createSession({userName:"adm",password:"adm"}, function(err,session) {
            if(!err) {
                the_session = session;
            }
            callback(err);
        });

    },
   
    // create subscription
    function(callback) {

        the_subscription=new opcua.ClientSubscription(the_session,{
            requestedPublishingInterval: 1000,
            requestedLifetimeCount: 10,
            requestedMaxKeepAliveCount: 2,
            maxNotificationsPerPublish: 10,
            publishingEnabled: true,
            priority: 10
        });
        the_subscription.on("started",function(){
            //console.log("subscription started for 2 seconds - subscriptionId=",the_subscription.subscriptionId);
        }).on("keepalive",function(){
           // console.log("keepalive");
        }).on("terminated",function(){
            callback();
        });		
			//array attriude
			ids =["temperature"];
			
			// install monitored items
        //items_idx = 0;
       
			 ids.forEach(function (ids) {
			 var opc_item = "ns=4;s="+ids;
            monitored_items[items_idx] = the_subscription.monitor({
                nodeId: opcua.resolveNodeId(opc_item),
                attributeId: 13
            },
            {
                samplingInterval: 200,
                discardOldest: true,
                queueSize: 10
            });

             monitored_items[items_idx].on("changed", function (value) {
				 mesage =   '"TagName"' +':'+'"'+ids+'"'+','+ '"Value"'+":" + value.value.value ;
			   //send data from here ;
				console.log("Data insert",mesage);
				//call 
				insert_data(value.value.value);

            });

            items_idx = items_idx + 1;
        });
			
				

	},



    // ------------------------------------------------
    // closing session
    //
    function(callback) {
        console.log(" closing session");
        the_session.close(function(err){

            console.log(" session closed");
            callback();
        });
    },


],
    function(err) {
        if (err) {
            console.log(" failure ",err);
        } else {
            console.log("done!")
        }
        client.disconnect(function(){});
    }
	) ;

	

const sqlConfig = {
  password: 'demo123',
  database: 'demo',
  stream: false,
  options: {
    enableArithAbort: true,
    encrypt: true
  },
  port: 54863,
  user: 'demouser',
  server: 'LAPTOP-U99FP09R',
driver:'tedious'
}

 var sql = require("mssql");

      function insert_data(value)
	  {

    // connect to your database
    sql.connect(sqlConfig, function (err) {

        if (err) console.log(err);
		else
		{
			console.log("okk");
			var request = new sql.Request();
			request.input('vatag1',sql.Float,value);
			 request.query("INSERT INTO Data (tagname, value) VALUES ('temperature',@vatag1)", function(err, recordsets) {

        
    });
	 
		}


	})
	  }



 






