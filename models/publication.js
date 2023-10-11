const { Schema, model} =require("mongoose");

const PublicationSchema = Schema({
    tittle: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },

    created_at: {
        type: Date,
        default: Date.now
    },
    
    visitas: {
        type: Number,
        default: 0
    },
    user: {
        type: String,
        default: ""
        
    },

    file: String

})

module.exports = model("Publication" , PublicationSchema, "publications");
