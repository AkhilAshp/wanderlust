// setup
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require('method-override');
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const validateListing = (req, res, next)=>{
  let {error} = listingSchema.validate(req.body);
  if(error){
    throw new ExpressError(400, result.error);
  }else{
    next();
  }
}
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

// Index route
app.get("/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", {allListings});
}));

// New route - MUST come before :id route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Edit route - MUST come before :id route  
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  let {id} = req.params;
  const listing = await Listing.findById(id);
  console.log(listing);
  res.render("listings/edit.ejs", {listing});
}));

// Show route
app.get("/listings/:id", wrapAsync(async (req, res) => {
  let {id} = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", {listing});
}));

// Create route
app.post("/listings",validateListing, wrapAsync(async (req, res, next) => {
  
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
}));

// Update route
app.put("/listings/:id",validateListing, wrapAsync(async (req, res) => {
  const {id} = req.params;
  const listing = await Listing.findById(id);
  
  // Handle the image update logic
  const updatedData = {...req.body.listing};

  if (!updatedData.image || updatedData.image.trim() === "") {
    // If image field is blank, keep the existing image object
    updatedData.image = listing.image;
  } else {
    // If a new image URL is provided, create a new image object
    updatedData.image = {
      url: updatedData.image,
      filename: "listingimage" // hardcoded or generate as needed
    };
  }

  await Listing.findByIdAndUpdate(id, updatedData);
  res.redirect(`/listings/${id}`);
}));

// Delete route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  let {id} = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
}));

// Error handling middleware - catch-all for 404
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let {statusCode = 500, message = "Something went wrong"} = err;
  res.status(statusCode).render("error.ejs", {err: {message, trace: err.stack}});
});

app.listen(5050, () => {
  console.log("Server is listening on port 5050");
});