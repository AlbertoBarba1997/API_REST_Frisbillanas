const { Schema, model} =require("mongoose");

const ParticipationSchema = Schema({
    tournament: {
        type: Schema.ObjectId,
        ref: "Tournament"
    },
    user: {
        type: Schema.ObjectId,
        ref: "User"
    },
    create_at:{
        type: Date,
        default: Date.now
    }  
})

module.exports = model("Participation" , ParticipationSchema, "participations");