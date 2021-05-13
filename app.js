var express = require('express');
// var querystring = require('querystring');
var http = require('http');
const bodyParser = require("body-parser");
const ejs = require("ejs");

var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Node address
let nodeAddress = "http://127.0.0.1:8000";

//posts
let posts = [];

//Get posts from a node in the blockchain
function fetch_posts(){
  let getAddress = nodeAddress + "/chain";
  http.get(getAddress, function(response){
    response.on('data', (d) =>{
      let content = [];
      const chain = JSON.parse(d);
      //console.log(chain);
      chain.chain.forEach(block =>{
        block.transactions.forEach(tx =>{
        	//console.log(tx);
          tx.index = block.index;
          tx.hash = block.previous_hash;
          content.push(tx);
        })
      })
      posts = content.sort((a, b)=>{ b.timestamp - a.timestamp})
      //console.log(posts);
    })
  })

}

//Homepage
app.get("/", function(req, res){
  fetch_posts();
  res.render("home", {title : "Unicorn",
                      subtitle: "Decentralized Social Network",
                      posts : posts
                    });
})

//Submit
app.post("/submit", function(request,response){
  //console.log(req.body);
  const newPost = JSON.stringify(request.body);
  console.log(request.body);
  console.log(newPost);
  const options = {
  hostname: '127.0.0.1',
  port: 8000,
  path: '/new_transaction',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    }
  }
  const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', d => {
      process.stdout.write(d)
    })
  })

  req.on('error', error => {
    console.error(error)
  })

  req.write(newPost);
  req.end(()=>{
    response.redirect("/");
  });
})

//Mine Button
app.get("/mine",function(req, res){

  mineRequestAdd = nodeAddress + "/mine";

  http.get(mineRequestAdd, function(response){
    res.redirect("/");
  });
})

//Port
let port = 5000;
app.listen(port, function() {
    console.log("Server started Successfully at localhost:" + port);
});
