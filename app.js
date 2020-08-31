
/* All Requires */
const express = require("express");
const bodyParser = require("body-parser");
const dateObject = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");


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

/* Inserting Data */

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


/** Inserting Data */

/* List */

const listSchema = {                                 // Step 01  Schema
  name: {
    type: String,
    required: [true, "the list needs a name"]
  },
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);      // Step 02  Model




/* MongoDB Area ****************************/

app.set('view engine', 'ejs');  //ejs templating

/* Retrieving values from the form ejs template*/
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));                //Make public folder static



/* Loading our home route */
app.get("/", function (req, res) {

  const day = dateObject.getDate(); //Retrieving date data from the date module

  /* Reading Data from MongoDB */

  Item.find({}, function (error, items) {

    if (items.length === 0) {

      Item.insertMany(defaultItems, function (error) {
        if (error) {
          console.log(error);
        } else {
          console.log("Default Items added successfully");
        }

      });

      res.redirect("/");

    } else {
      res.render("list", {
        listTitle: day,
        listOfItems: items
      }); //file to render, value to display, template file
    }
  });

  /* Reading Data */

});


app.post("/", function(req, res){               //first form POST request

  const newItem = req.body.todoItem;
  const alistTitle = req.body.list;
  const day = dateObject.getDate();

  const newTodoItem = new Item({
    name: newItem
  });
 

  if (alistTitle === day) {  // Here is the issue
    newTodoItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: alistTitle}, function(error, foundList){
      foundList.items.push(newTodoItem);
      foundList.save();
      res.redirect("/" + alistTitle);
    });
  }
});



app.post("/delete", function(req,res) {           // second POST request
  const itemToDelete = req.body.deleteItem;
  const listName = req.body.listName;
  const day = dateObject.getDate();

  if(listName === day) {
     Item.deleteOne({
       _id: itemToDelete
     }, function (error) {
       if (error) {
         console.log(error);
       } else {
         console.log("Item deleted from todolist");
       }
     });

     res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: itemToDelete}}}, function(error, foundList){
      if(error){
        console.log(error);
      } else {
        console.log("item deleted from custom list");
        res.redirect("/" + listName);
      }
    });
    
  }
});



app.get("/:customListName", function(req,res){
  const customList = _.capitalize(req.params.customListName);

        List.findOne({name: customList}, function(err, foundList){
          if(err){
            console.log(err);
          } else {
            if(!foundList) {
              const aList = new List({
                name: customList,
                items: defaultItems
              });
              aList.save();
              res.redirect("/"+req.params.customListName);
            } else {
              res.render("list", {
                listTitle: customList,
                listOfItems: foundList.items
              });
            }
          }
        });
});



app.listen(3000, function(){
  console.log("Server started on port 3000");
})
