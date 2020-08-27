
/* All Requires */
const express = require("express");
const bodyParser = require("body-parser");
const dateObject = require(__dirname + "/date.js");


const app = express();

let items = [];
let workItems = [];

app.set('view engine', 'ejs');  //ejs templating

/* Retrieving values from the form ejs template*/
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public")); //Make public folder static

app.post("/", function(req, res){
  let newItem = req.body.todoItem;

  if(req.body.list === "Work"){
    workItems.push(newItem);
    res.redirect("/work");
  } else {
    items.push(newItem);
    console.log(items);
    res.redirect("/");  //Redirect and load home route
  }


});

/* Loading our home route */
app.get("/", function(req, res){

  let day = dateObject.getDate(); //Retrieving date data from the date module
  res.render("list", {listTitle: day, listOfItems: items}); //file to render, value to display, template file
  //res.send();
});

/* Work Items List */
app.get("/work", function(req, res){
  res.render("list", {listTitle: "Work List", listOfItems: workItems});
});

app.post("/work", function(req, res){
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

app.listen(3000, function(){
  console.log("Server started on port 3000");
})
