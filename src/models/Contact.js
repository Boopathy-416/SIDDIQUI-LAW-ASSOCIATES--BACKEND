import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254,
      default: null
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;