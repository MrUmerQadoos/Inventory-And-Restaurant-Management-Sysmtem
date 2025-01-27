const { Schema, default: mongoose } = require("mongoose");

let place_to_visit = new mongoose.Schema({
  /* ----------------------------- explore section ---------------------------- */
  exp_title_1: {type: String,required: true },
  exp_img_1: { type: String, required: true  },
  exp_title_2: {type: String,required: true },
  exp_img_2: { type: String, required: true  },
  exp_title_3: {type: String,required: true },
  exp_img_3: { type: String, required: true  },
  exp_title_4: {type: String,required: true },
  exp_img_4: { type: String, required: true  },
  
  /* ----------------------------- explore section ---------------------------- */
});

export const visitPlaces =  mongoose.models.placeToVist || mongoose.model("placeToVist", place_to_visit);
