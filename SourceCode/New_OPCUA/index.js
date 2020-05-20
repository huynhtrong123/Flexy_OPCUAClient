require('dotenv').config();
var mongoose = require('mongoose');

var Site = require('./models/site.model')
var Tag = require('./models/tag.model')
var SiteTag = require('./models/site_tag.model')

var opcua = require("node-opcua"),
    async = require("async")
//-------------------------------------------------------------------
mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useFindAndModify', false); 


var Socker_URL =  "http://solution.phuctruong.net:3001";
const
    io = require("socket.io-client"),
    ioClient = io.connect(Socker_URL);

var opc_server = [];

async function run(){
  await readFirstConfig()
  await setTimeout(function(){}, 2000);

  await readOPCUA()
  
  setInterval(async function(){
    await saveDataToSQLServer('abc') 
  }, 1000);
}


run();


async function readOPCUA(){
  var mesage="";
  opc_server.forEach(function(svr_opc)
  {
    
    const endpointUrl = "opc.tcp://" + svr_opc.ip + ":" + svr_opc.port;
    //console.log(svr_opc)
    //console.log('--------')
    var client = new opcua.OPCUAClient(),
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
            requestedLifetimeCount: 100,
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
        //ids =["tag1","tag2","tag3"];
  
        // svr_opc.data.forEach(function(dt){
        //   idss.data.push(dt.name)
        // })
        
        //console.log('idss', idss)
        // install monitored items
          //items_idx = 0;
         
        svr_opc.data.forEach(function (ids) {
          var opc_item = "ns=1;s="+ids.name;
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
            mesage = 'Server ' + svr_opc.site_id +  ' TagName' +':'+ ids.name + ','+ '"Value"'+":" + value.value.value ;
            //send data from here ;
            //console.log("================================");
            //console.log(value)
            //console.log("OPCSever:",endpointUrl,":",mesage);

            //let bb = svr_opc.data.indexOf(ids.name)
            
            var index = svr_opc.data.findIndex(function(item, i){
              return item.name === ids.name
            });
            svr_opc.data[index].value = value.value.value
            //svr_opc.data

            //console.log("bb = ",svr_opc);
            //console.log("********************************");


            //ioClient.emit('Flexy','{"HostName":' +'"'+client_opc.HostName+'"' +','+mesage+'}');
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
    );

  })
}

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

async function saveDataToSQLServer(site_id)
{
  // connect to your database
  sql.connect(sqlConfig, function (err) {
    if (err) console.log(err);
    console.log("Connected to SQL Server successfully")
    let request = new sql.Request();
    request.input('site_id',sql.VarChar,site_id);

    request.query("INSERT INTO DataLogger1 (site_id, site_name, information) VALUES (@site_id,'ab1a', 'ad' )", function(err, recordsets) {  
      if (err) console.log(err); 
      //console.log(recordsets)
      sql.close()
    });
  })
}



async function readFirstConfig(){
  let sites = await Site.aggregate([{
      $lookup: {
        from: 'tag',
        localField: 'tags',
        foreignField: '_id',
        as: 'tags'
      }
    }]).exec();

  for (const site of sites) {
    let arrTempTag = []
    for (const tag of site.tags) {
      arrTempTag.push({name: tag.name, value: 0})
    }
    
    let infor = {
      id: site._id,
      site_id : site.site_id,
      site_name: site.site_name,
      ip: site.ip,
      port: site.port,
      username: site.username,
      password: site.password,
      data: arrTempTag
    }
    opc_server.push(infor)
    //console.log('*******************************************')
  }
  return;
}