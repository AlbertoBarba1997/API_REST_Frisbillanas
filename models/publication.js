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

    file: String,

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

})

module.exports = model("Publication" , PublicationSchema, "publications");
