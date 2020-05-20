
	 
//request mqtt 
var mqtt = require('mqtt');	 
var Topic_sup = 'Request/Data';
var Broker_URL = 'mqtt://124.158.10.133:3003' ;

var client  = mqtt.connect(Broker_URL);
client.on('connect', function () {
  client.subscribe(Topic_sup, function (err) {
    if (!err) {
      
	  console.log('Sucribe topic success');
    }
	else 
	{
		console.log("error");
	}
  })
})
//
client.on('message', mqtt_messsageReceived);

function mqtt_messsageReceived(topic, message, packet) {
	 var data = message.toString();
	//var data = packet.payload.toString();
	//var jsondata = JSON.parse(data);
	console.log('DataNhan ' + data);
  // console.log('Message payload= ' + packet.payload.toString());
  //  console.log('Message time_stamp= ' + message);
	//insert_message(topic, message, packet);
	write_opcua();
}


/////////////////OPCUAClient//////////////////////////////////////////
const endpointUrl = "opc.tcp://127.0.0.1:4870"  
	  
var   opcua = require("node-opcua"),
	  async = require("async"),
      client = new opcua.OPCUAClient(),
	  opc_items = new Array(),
	  items_idx = 0,
	  monitored_items = new Array(),
	  the_session = null;

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
        client.createSession(function(err,session) {
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
			ids =["dataint"];
			
			// install monitored items
        //items_idx = 0;
       
			 ids.forEach(function (ids) {
			 var opc_item = "ns=3;s="+ids;
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
				console.log("Data read",mesage);
				//call 
				

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
	




 


 var nodesToWrite = [{
                nodeId: "ns=3;s=dataint",
                attributeId: 13,
                indexRange: null,
                value: { 
                    value: { 
                        dataType: opcua.DataType.Int16,
                         value: 22
                    }
              }
       }];
function write_opcua()
{	   
the_session.write(nodesToWrite, function(err,statusCode,diagnosticInfo) {
           if (!err) {
               console.log(" write ok" );
           }
      });  
}


