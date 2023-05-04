//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const { Schema } = require("mongoose");
const mongoose = require("mongoose");
const _ = require("lodash")


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
mongoose.connect("mongodb+srv://ren0113:aa621380@cluster0.xsfuhcc.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = new Schema({
  name: String,
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name:"hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItem = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);





app.get("/", function(req, res) {

  Item.find().exec()
  .then((foundItem) => {
    if(foundItem.length === 0) {
      Item.insertMany(defaultItem)
       .then(() => {
       console.log("Successfully saved default items to DB.");
      })
       .catch((e) =>  {
       console.log(e);
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItem});
    }
    
  })
  .catch((e) => {
    console.log(e);
  });
  

});

app.get("/:customListName", function(req,res){

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}).exec()
  .then((foundList) => {
    if(!foundList) {
      //Create a new list
      const list = new List({
        name: customListName,
        items: defaultItem
      });
    
      list.save();
      res.redirect("/" + customListName);
    } else if(foundList) {
      //Show an existing list

      res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
    }
  })
  .catch((e) => {
    console.log(e);
  })

  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if(listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}).exec()
    .then((foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    })
  }

 
 
});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
  .then(() => {
    console.log("Successfully deleted checked item.");
    res.redirect("/");
  })
  .catch((e) => {
    console.log(e);
  })
  } else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).exec()
    .then((foundList) => {
      if (foundList) {
        res.redirect("/" + listName);
      }
    })
  }

  
});



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server has started successfully");
});

// app.listen(3000, function() {
//   console.log("Server started on port 3000");
// });
