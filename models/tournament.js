const { Schema, model} =require("mongoose");

const TournamentSchema = Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    date: {
        type: Date,
        required: true
    },

    place: {
        type: String,
        required: true
    },

    // La modalidad será 1=playa , 2=cesped
    modality: {
        type: Number,
        default: 1
    },

    // El genero será 0=Mixto , 1=Female, 2=Male
    gender: {
        type: Number,
        default: 0
    },

    file: String

})

module.exports = model("Tournament" , TournamentSchema, "tournaments");