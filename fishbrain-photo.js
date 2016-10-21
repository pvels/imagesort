var fs = require('fs')
var request = require('sync-request');
var async_request = require('request')
var wait = require('wait.for')
var jsonfile = require('jsonfile')
var file = './data_species.json'
var start_page = 1

////////////
// 	id 		
///////////

var id = 3385

///////////
///////////
///////////

var parameters = { 
	'q[species_id_eq]': 3385,
	'q[s]' : 'created_at desc',
	'with_photos' : 'true',
	'verbosity' : 'verbose',
	page : 1,
	per_page  : 200
};

var options = {
  url: 'https://rutilus.fishbrain.com/catches',
  method: 'GET',
  headers_android: {
    'User-Agent': 'Fishbrain/4.4 (Android 19)',
    'Accept-Language': 'en',
	'Authorization': 'Token token="hYOdj9-zY20aPABKYVE5jhV0ASoP-1u1ctz4ykxg6k9c1DpnRO_cuJ2-Mdxe"',
	'Connection': 'Keep-Alive',
	'Accept-Encoding': 'gzip',
	'Content-Type': 'application/json; charset=utf-8'
  },  
  headers: {
    'User-Agent': 'Fishbrain/4.7 (iPhone; iOS 10.1; Scale/2.00)',
    'Accept-Language': 'en',
    'Authorization': 'Token token="pbIcjcFAK8cCjVFqeJVL77d51NVkiv68W3hwPeKlA_LC0HPSlhsMSJsj9gSu"',
	'Connection': 'Keep-Alive',
	'Accept-Encoding': 'gzip',
	'Content-Type': 'application/json; charset=utf-8'
  },
  qs : parameters
};

var answer = []
var download = function(uri, filename, callback){
  async_request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    async_request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};
function callback(error, response, body) {
	if (!error && response.statusCode == 200) {
	var info = JSON.parse(body);
		if (info.hasOwnProperty(0)){
			answer.push(info)
			console.log(info)
			for (var i = 0; i<200;i++){
				fs.appendFileSync(file, JSON.stringify(info[i]) + ',\n');
			}
		}
	}
}

process.argv.forEach(function (val, index, array) {
	console.log(index + ': ' + val);
	if(val.indexOf('--page=') > -1) {
		val = val.replace('--page=','')
		start_page = val
	}
})

var json = jsonfile.readFileSync(file)
var last_30 = 30
var mages_in_process = 0 




try {
    fs.mkdirSync('./images');

} catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
}

fiber = function(){
	for (var class_by_pop = 1; class_by_pop<last_30; class_by_pop++) {
		for (var i = 0; i<20; i++) {
			id = json[json.length-class_by_pop-1]['id']
//			if (id == 1191 && i < 5) i = 5
			options['qs']['page'] = i
			options['qs']['q[species_id_eq]'] = id
			path = `./images/${id}/Originals`
			
			try {
				fs.mkdirSync(`./images/${id}`)
				fs.mkdirSync(path);
			} catch(e) {
			    if ( e.code != 'EEXIST' ) throw e;
			}
			
			res = request('GET',options.url,options)
			res = JSON.parse(res.body.toString("utf-8"))
			console.log(`\npage: ${i}\tclass: ${id}\n`)
			res.forEach(function(item){
				if (item.hasOwnProperty('photos')){
					photos = item['photos']
					var functions = []
					photos.forEach(function(photo) {
						if (typeof photo !== "undefined"){
							if (typeof photo['photo']['sizes'][12] !== "undefined") {
								var size_12 = photo['photo']['sizes'][12] 
								if (typeof size_12['url'] !== "undefined") {
									var url = photo['photo']['sizes'][12]['url']
									var photo_id = photo['id']
									fun = function(url,photo_id){
										
										image_path = `./images/${id}/Originals/${id}_${photo_id}.jpg`
/*
											if (fs.existsSync(image_path)) {
												console.log("exist: ",photo_id)
											}else {
												image_resp = request('GET',url)
												console.log("new: ",photo_id)
												fs.writeFileSync(image_path, image_resp.body, 'binary')
											}
*/
										try {
										    fs.accessSync(image_path, fs.F_OK);
											console.log("exist: ",photo_id)
										} catch (e) {
											image_resp = request('GET',url)
											console.log("new: ",photo_id)
											console.log(url)
											console.log(image_path)
											fs.writeFileSync(image_path, image_resp.body, 'binary')
										}
									}
									functions.push([fun,url,photo_id])					
								}else {
									console.log(photo)
								}
							}
						}
					})
					wait.parallel.launch(functions)
				}else {
					console.log('Property not found')
				}
			})
		}
 	}
}
wait.launchFiber(fiber)


// var my_list = sortByKey(json,'followers_count')
// var counter = 0
// my_list.forEach(function(item) {
// 	if (counter<10){
// 		console.log(item)
// 	}
// 	delete item['photo']
// 	counter++
// })

// console.log(my_list)
// jsonfile.writeFileSync(file, my_list,{spaces: 2})

// fs.appendFileSync(file, '[');
// for(var i = 1; i < 18;i++){
// 	options['qs']['page'] = i
// 	var res = request('GET',options.url,options);
// 	callback(null,res,res.body.toString('utf8'))
// }
// fs.appendFileSync(file, ']');


// var obj = answer
// jsonfile.writeFile(file, obj, function (err) {
//   console.error(err)
// })



function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}
