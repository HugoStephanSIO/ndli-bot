const sqlite = require('sqlite3').verbose();
const dbname = 'chatbot.db' ;
var associations = [] ;
var triggers = [] ;
var received = [] ;
var joker = "Je n'arrive pas à décrypter ce que vous racontez... Corrigez vos fautes d'orthographe ou essayez ici : " ;
var sent = [] ;
var sql = "" ;


// Init database
exports.initDB = function () {
	var db = new sqlite.Database(dbname);
	sql = "CREATE TABLE IF NOT EXISTS received_message (pseudo TEXT, message TEXT)" ;
	db.run(sql);
	sql = "CREATE TABLE IF NOT EXISTS sent_message (pseudo TEXT, message TEXT)";
	db.run(sql);
	sql = "CREATE TABLE IF NOT EXISTS association (keyword TEXT, response TEXT, priority NUMBER)" ;
	db.run(sql);
	sql = "CREATE TABLE IF NOT EXISTS trigger (keyword TEXT, search TEXT, priority NUMBER)";
	db.run(sql);
	db.close();
}

// Load database
exports.loadDB = async function () {
	sql = "SELECT * FROM association ORDER BY priority DESC" ;
	associations = await exports.readDB(sql) ;
	sql = "SELECT * FROM trigger ORDER BY priority DESC" ;
	triggers = await exports.readDB(sql);
	sql = "SELECT * FROM received_message" ;
	received = await exports.readDB(sql);
	sql = "SELECT * FROM sent_message" ;
	sent = await exports.readDB(sql);
}

// Function to read data from db
exports.readDB = function (query, params) {
	return new Promise(function(resolve, reject) {
		if(params == undefined) params=[]
		var db = new sqlite.Database(dbname); 
		db.all(query, params, function(err, rows)  {
			if(err)
			{
				reject("Error reading database " + err.message);
			}
			else {
				resolve(rows);
			}
		})
		db.close();
	}); 
}

// Function to write data in db
exports.writeDB = function (query) {
	var db = new sqlite.Database(dbname);
	db.run(query,  function(err) {
		if (err) 
		{
			console.log("Error inserting in database : " + err.message);
		}
	});
	db.close();
}

// Function to save message in db
exports.saveMessage = async function(pseudo, message, kind) {
	if(kind == undefined) kind = "received" ;
	
	console.log("saving message in DB") ;
	var query = "INSERT INTO " + kind + "_message VALUES ('" + pseudo + "','" + message + "');" ;
	await exports.writeDB(query);
}

// Looking for best answer possible 
exports.needAnswer = function(pseudo, msg)
{
	var ret = "Je n'arrive pas à décrypter ce que vous racontez... Corrigez vos fautes d'orthographe ou essayez ici : " + exports.createSearchLink(msg) + "." ;
	var tmp = [] ;
	var priority = 0 ;
	var matches_asso = exports.searchForKeywords(msg) ;
	var matches_trigger = exports.searchForKeywords(msg) ;

	// Found matching associations in message
	if(matches_asso.length > 0)
	{
		// Removing already sent messages
		matches_asso.forEach((a, index) => {
			if(sent.indexOf({pseudo: pseudo, message: a.response}) == -1) tmp.push(a) ;
		});
		
		if(matches_asso.length > 0)
		{
			matches_asso = tmp ;
			ret = matches_asso[0].response ;
			priority = matches_asso[0].priority ;
		}
	}
	// Found matching triggers in message
	if(matches_trigger.length > 0)
	{
		matches_trigger.forEach((t, index) => {
			if(sent.indexOf({pseudo: pseudo, message: exports.createSearchLink(t.search)}) == -1) tmp.push(t) ;
		});
		matches_trigger = tmp ;
		
		if(matches_trigger.length > 0 && priority < matches_trigger[0].priority)
		{
			ret = "Hum je pense pas pouvoir vous être d'une grande aide... Mais essayez ça par exemple : "+exports.createSearchLink(matches_trigger[0].search)+"." ;
			priority = matches_asso[0].priority ;
		}
	}
	
	if(ret == null ||ret == undefined)
	{
		ret = "Je n'arrive pas à décrypter ce que vous racontez... Corrigez vos fautes d'orthographe ou essayez ici : " + exports.createSearchLink(msg) + "." ;
	}
	return ret ;
}

// Search for keywords in message
exports.searchForKeywords = function(msg)
{
	var ret = [] ;
	associations.forEach((a, index) => {
		if(msg.toLowerCase().indexOf(a.keyword) != -1) ret.push(a) ;
	});
	return ret ;
}

// Search for triggers in message
exports.searchForTriggers = function(msg)
{
	var ret = [] ;
	triggers.forEach((t, index) => {
		if(msg.toLowerCase().indexOf(t.keyword) != -1) ret.push(t) ;
	});
	return ret ;
}

// Generate LMGTFY links
exports.createSearchLink = function(search)
{
	var n = exports.getRandomInt(2) ;
	if(n == 1)
	{
		var ret = "http://lmgtfy.com/?q=" + encodeURIComponent(search) ;
	}
	else
	{
		var ret = "https://fr.wikipedia.org/w/index.php?search="+encodeURIComponent(search)+"&title=Spécial%3ARecherche&go=Continuer" ;
	}
	return ret ;
}

exports.getRandomInt = function(max) {
  return Math.floor(Math.random() * Math.floor(max));
}