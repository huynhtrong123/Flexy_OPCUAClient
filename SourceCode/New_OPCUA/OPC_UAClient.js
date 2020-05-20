var Socker_URL =  "http://solution.phuctruong.net:3001";
const
    io = require("socket.io-client"),
    ioClient = io.connect(Socker_URL);



var IP_Host = "solution.phuctruong.net";
let clients = [];
let k = 1;
//4435
for (var i = 4335; i < 4336; i++) {
  clients.push({IP:IP_Host,port: i, HostName: "Sever_"+k});
  k = k +1;
}
var mesage="";
clients.forEach(function(client_opc)
{
const endpointUrl = "opc.tcp://" + client_opc.IP+":"+client_opc.port;	  
	  
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
        client.createSession({userName:"user1",password:"password1"}, function(err,session) {
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
			ids =["tag1","tag2","tag3","tag4"];
			
			// install monitored items
        //items_idx = 0;
       
			 ids.forEach(function (ids) {
			 var opc_item = "ns=1;s="+ids;
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
              console.log("********************************");
			console.log("OPCSever:",endpointUrl,":",mesage);
			console.log("********************************");
				ioClient.emit('Flexy','{"HostName":' +'"'+client_opc.HostName+'"' +','+mesage+'}');
				

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

	

})