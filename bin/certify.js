#!/usr/bin/env node

var  ssl = require('ssl-keygen')
,  key = ssl.createKeyGen({size: 1024, root: __dirname + '/'})
;

key.createCA('proxy', false, function(){
	
})