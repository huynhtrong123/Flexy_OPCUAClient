var  urdb ='mongodb://demo01:abcd0123@124.158.10.133:27017/svr_gateway_01?authSource=admin',
mongoose = require('mongoose');
 mongoose.connect(urdb, {useNewUrlParser: true, useUnifiedTopology: true});
var siteTagSchema = new mongoose.Schema({
	name: String,
	description: String,
	default: Number,
	scale: Number,
	plus: Number,
	unit: String,
	is_active: Number,
	is_display: Number,
	priority: Number,
	note: String,
	site: {type: mongoose.Schema.Types.ObjectId, ref: 'Site'},
	tag: {type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}
	// parameters: [{type: mongoose.Schema.Types.ObjectId}],
	// gc_parameters: [{type: mongoose.Schema.Types.ObjectId}]
});

var SiteTag = mongoose.model('SiteTag', siteTagSchema, 'site_tag');
var tagSchema = new mongoose.Schema({
	name: String,
	description: String,
	value: Number,
	unit: Number,
	is_active: Number,
	is_display: Number,
	priority: Number,
	note: String,
	// parameters: [{type: mongoose.Schema.Types.ObjectId}],
	// gc_parameters: [{type: mongoose.Schema.Types.ObjectId}]
});

var Tag = mongoose.model('Tag', tagSchema, 'tag');
var stationSchema = new mongoose.Schema({
	site_id: String,
	site_name: String,
	site_address: String,
	ip: String,
	port: Number,
	username : String,
	password : String,
	is_active: Number,
	is_display: Number,
	priority: Number,
	note: String,
	tags: [{ type: mongoose.Schema.Types.ObjectId }],
	//site_tags: [{ type: mongoose.Schema.Types.ObjectId }],
	// parameters: [{type: mongoose.Schema.Types.ObjectId}],
	// gc_parameters: [{type: mongoose.Schema.Types.ObjectId}]
});

var Site = mongoose.model('Site', stationSchema, 'site');
let para_gateway=[];
let tagname =[];
///


   let config_db =  Getconfig();
   config_db.then(function(docs)
   {
	console.log("Data",docs);
	
	
   })
   
	

	
	
async function Getconfig()
{
	let clientConfig = [];
	let tag_array =[];
	 await Site.find({}, function(err,docs)
	{
		//var Data_Config = [];
		if (docs.length >=1)
		{
			//console.log("Data from DB name",docs[0]);
			//map 
			//para_gateway.push(docs[0]);
		//para_gateway[0].tagname.name);
		//var data_con = para_gateway[0].tagname;
		//var sitetag0= docs[0].id;
		//console.log("Site", docs[0]);
		
		//console.log("tag",sitetags);
		//console.log("siteID",docs[0].id);
		/*var  sitetag = await SiteTag.find({site: doc.id})
						 .populate('site')
						 .populate('tag')
						 .sort({ priority: 'asc' })
						 .exec();*/
						 
		docs.forEach(async function(doc)
		{
			
		  clientConfig.push({ip:doc.ip,port: doc.port, user: doc.username,pass:doc.password,siteid:doc.site_id,sitename:doc.site_name});
		var  sitetags = await SiteTag.find({site: doc.id})
						 .populate('site')
						 .populate('tag')
						 .sort({ priority: 'asc' })
						 .exec();
						// console.log("tag",sitetags);
						 console.log("////");
		tag_array=[];
		
		await sitetags.forEach(async function(tg){
		 tag_array.push({name: tg.tag.name,value:0});	
		})
			console.log("tag = ",tag_array);
			
		})	
		}
		
		else
		{
			//console.log("No config!!!");
		}
		//console.log("tagname",tagname[0]);
	})
	return clientConfig;
}