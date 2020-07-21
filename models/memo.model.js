var mongoose = require("mongoose");

var newSchema = mongoose.Schema({
  Eid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "employee",
    required: true,
  },
  Date: String,
  Hour: String,
  Minutes: String,
  Seconds: String,
  Type: String,
  Reason: String,
  ReasonSend: Boolean,
  Status: String,
  DateTime: String,
});

const memo = mongoose.model("memo", newSchema);

module.exports = memo;
