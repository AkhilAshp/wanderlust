// setup
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require('method-override');
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const ejsMate = require("ejs-mate");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended :true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

//index route
app.get("/listings", async (req,res)=>{
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", {allListings});
});

//New route
app.get("/listings/new",(req,res)=>{
  res.render("listings/new.ejs");
})

//show route
app.get("/listings/:id", async(req,res)=>{
  let {id} = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", {listing});
})

app.post("/listings", async(req,res)=> {
  // let{title, description, image, price, country, location} =req.body;
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
})

app.get("/listings/:id/edit",async (req,res)=>{
  let {id} = req.params;
  const listing = await Listing.findById(id);
  console.log(listing);
  res.render("listings/edit.ejs", {listing});
})

app.put("/listings/:id", async(req,res)=>{
  let {id} = req.params;
  await Listing.findByIdAndUpdate(id,{...req.body.listing});
  res.redirect(`/listings/${id}`);
})

app.delete("/listings/:id", async(req,res)=>{
  let {id} = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  // console.log(deleteListing);
  res.redirect(`/listings`);
})
// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "Leonia Resort",
//     price: 1200, 
//     location: "Shamirpet, Hyd",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });

// Remove the duplicate app.get("/") line


app.listen(5050, () => {
  console.log("Server is listening on port 5050");
});
