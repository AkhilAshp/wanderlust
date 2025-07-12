const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename: String,
    url: {
      type: String,
      set: (v) =>
        v === ""
          ? "https://unsplash.com/photos/green-palm-trees-near-swimming-pool-during-daytime-qai_Clhyq0s"
          : v,
    },
  },
  price: Number, 
  location: String,
  country: String,
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
