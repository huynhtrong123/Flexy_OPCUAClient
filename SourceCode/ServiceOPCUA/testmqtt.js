var Topic_sup = 'Request/Data';
  var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://124.158.10.133:3003');
 var passuser=''; 
client.on('connect', function () {
console.log('connec');
  client.subscribe(Topic_sup, function (err) {
    if (!err) {
      client.publish('presence', 'Hello mqtt');
    }
  })
})
 
client.on('message', function (topic, message) {
  // message is Buffer
   var data = message.toString();
   if (data =='send')
   {writeuser[0].value.value.value='op2';
	  // passuser ='op1';
	write_opcua();
	console.log('send...');
	
   }
   
})
////////
////////******passsHMI for USER ***/////////////
//id1 -->pass1 /id2-->pass2/id3-->pass3 
//switch case to write password and press log in 


/////////////////OPCUAClient//////////////////////////////////////////
const endpointUrl = "opc.tcp://127.0.0.1:4870"  
	  
var   opcua = require("node-opcua"),
	  async = require("async"),
      client_opc = new opcua.OPCUAClient(),
	  opc_items = new Array(),
	  items_idx = 0,
	  monitored_items = new Array(),
	  the_session = null;

async.series([


    // step 1 : connect to
    function(callback)  {

        client_opc.connect(endpointUrl,function (err) {

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
        client_opc.createSession(function(err,session) {
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
        client_opc.disconnect(function(){});
    }
	) ;
	




 


 var writeuser = [{
                nodeId: "ns=3;s=passlog",
                attributeId: 13,
                indexRange: null,
                value: { 
                    value: { 
                        dataType: opcua.DataType.String,
                         value: 'op1'
                    }
              }
       }
	   ];
	  
	   console.log('ddd',writeuser[0].value.value.value);
var writestep = [{
	
	   
                nodeId: "ns=3;s=Step",
                attributeId: 14,
                indexRange: null,
                value: { 
                    value: { 
                        dataType: opcua.DataType.Int16,
                         value: 2
                    }
              }
       
}];
function write_opcua()
{	   
//console.log('data',nodesToWrite1.value.value);
the_session.write(writestep, function(err,statusCode,diagnosticInfo) {
           if (!err) {
               console.log(" write1 ok" );
           }
      });  
	  the_session.write(writeuser, function(err,statusCode,diagnosticInfo) {
           if (!err) {
               console.log(" write2 ok" );
           }
      }); 
}