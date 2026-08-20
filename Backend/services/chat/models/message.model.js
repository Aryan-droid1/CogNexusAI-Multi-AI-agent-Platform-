import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  name:String,
  content:String
},{
  _id:false
})




const artifactSchema = new mongoose.Schema({
  id:Number,
  type:String,
  title:String,
  files:[fileSchema]
},{
  _id:false
})

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    content: {
      type: String,
      default: "",
    },

    images: [
      {
        url: String,
        title: String,
        description: String,
      },
    ],
    artifacts:[artifactSchema]
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Message ||
  mongoose.model("Message", messageSchema);