//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const cors = require('cors');
const port = process.env.PORT || 4000
const uri = "mongodb+srv://admin-psd:psd@mongodb-atlas@cluster0.dauig.mongodb.net/Notes?retryWrites=true&w=majority"//"mongodb://localhost:27017/notesDB"

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.json());

app.use(cors({
  origin: 'https://notes-two-theta.vercel.app',
  credentials: true
}));

app.use(express.static("public"));

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, function(err) {
  if (!err) console.log("Connection to mongoDB is Successful.");
  else console.log("Connection to mongoDB is UnSuccessful.");
});

const NoteItemSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title cannot be blank!"]
  },
  body: {
    type: String,
    required: [true, "Body cannot be blank!"]
  }
});

const noteItem = mongoose.model("Note", NoteItemSchema);

let posts = [];

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get("/notes", function(req, res) {
  noteItem.find({}, function(err, allNotes) {
    if (err) {
      console.log(err);
    } else {
      console.log("fetched all documents from DB!");

      res.json(allNotes);
    }
  });
});


app.post("/notes", function(req, res) {
  let {title, body} = req.body;
  console.log(req.body)
  const note = new noteItem({title,body});

  noteItem.insertMany([note], function(err, insertedRow) {
    if (err) {
      console.log(err);
    } else {
      console.log("document inserted successfully to DB!");
      res.json(insertedRow);
    }
  });
});

app.get("/notes/:noteId", function(req, res) {
  const noteId = req.params.noteId;

  noteItem.findOne({
    _id: noteId
  }, function(err, note) {
    if (err) {
      console.log(err);
    } else {
      console.log(note);
      res.json(note);
    }
  });
});

app.get("/notes/:noteId/edit", function(req, res) {
  const noteId = req.params.noteId;

  noteItem.findOne({
    _id: noteId
  }, function(err, note) {
    if (err) {
      console.log(err);
    } else {
      console.log(note);
      res.json(note);
    }
  });
});

app.post("/notes/:noteId/edit", function(req, res) {
  const noteId = req.params.noteId;
  const title = req.body.title;
  const content = req.body.body;
  const action = req.body.btnAction ? req.body.btnAction : "Delete";
  console.log(action);
  if (action == "Update") {
    noteItem.updateOne({
      _id: noteId
    }, {
      title: title,
      body: content
    }, function(err, note) {
      if (err) {
        console.log(err);
      } else {
        console.log("note updated sucessfully.");
        //res.redirect("/");
        res.json(note);
      }
    });
  } else if (action == "Delete") {
    noteItem.deleteOne({
      _id: noteId
    }, function(err, note) {
      if (err) {
        console.log(err);
      } else {
        console.log("note deleted sucessfully.");
        //res.redirect("/");
        res.json(note);
      }
    });
  }
});

app.listen(port, function() {
  console.log("Server started on port:" + port);
});