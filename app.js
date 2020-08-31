
/* All Requires */
const express = require("express");
const bodyParser = require("body-parser");
const dateObject = require(__dirname + "/date.js");
const mongoose = require("mongoose");


const app = express();

/* MongoDB Area ******************************/

/*** DB Connection */
mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = {          // Step 1 setup the Schema for the DB
  name: {
    type: String,
    required: [true, "Please enter a todo item, it is required."]
  }
};

const Item = mongoose.model("Item", itemsSchema);   // Step 2, Create the model (Singular, Schema);

/*** Connection */

/** Inserting Data */

const clean = new Item({            // Step 3 create default Items to be inserted into the DB
  name: "Clean the Garage!!"
});

const milk = new Item({
  name : "Get milk from the store"
});

const dinner = new Item({
  name : "pick up dinner"
});


const defaultItems = [clean, milk, dinner];


// Item.insertMany(defaultItems, function (err) {                  // Step 4 insert into the DB
//   if(err) {                                                    // Testing purposes
//     console.log(err);
//   } else {
//     console.log("Inserted Successfully into todolistDB");
//   }
// });  

/** Inserting Data */


/* MongoDB Area ****************************/

app.set('view engine', 'ejs');  //ejs templating

/* Retrieving values from the form ejs template*/
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));                //Make public folder static

app.post("/", function(req, res){               //first form POST request
  const newItem = req.body.todoItem;
  const newTodoItem = new Item();

  if(req.body.list === "Work"){
    workItems.push(newItem);
    res.redirect("/work");
  } else {
    newTodoItem.name = newItem;                    // Add the input from the forms post to a Item
    Item.insertMany(newTodoItem, function(error){   // insert this new todoItem into the mongoDB 
      if(error){
        console.log(error);
      } else {
        console.log("The item " + newItem + " was added successfully");
      }
    });
    res.redirect("/");  //Redirect and load home route
  }
});

app.post("/delete", function(req,res) {           // second POST request
  const itemToDelete = req.body.deleteItem;

  Item.deleteOne({_id: itemToDelete}, function(error) {
    if (error) {
      console.log(error);
    } else {
      console.log("Item deleted from todolist");
  }
  });

  res.redirect("/");
});

/* Loading our home route */
app.get("/", function(req, res){

  const day = dateObject.getDate(); //Retrieving date data from the date module

  /* Reading Data from MongoDB */

  Item.find({}, function (error, items) {

    if(items.length === 0) {

      Item.insertMany(defaultItems, function(error){
        if (error){
          console.log(error);
        } else {
          console.log("Default Items added successfully");
        }

      });

      res.redirect("/");

    } else {
       res.render("list", { listTitle: day, listOfItems: items}); //file to render, value to display, template file
      }
  });

  /* Reading Data */
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
