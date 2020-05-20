
	 
//request mqtt 
var mqtt = require('mqtt');	 
var Topic_sup = 'Request/Data';
var Broker_URL = 'mqtt://124.158.10.133:3003';	 

var client  = mqtt.connect('mqtt://124.158.10.133:3003');
client.on('connect', function () {
  client.subscribe(Topic_sup, function (err) {
    if (!err) {
      client.publish('presence', 'Hello mqtt');
	  console.log('cc');
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
	
}


/////////////////OPCUAClient//////////////////////////////////////////


 






