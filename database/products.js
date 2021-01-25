const mongoose = require('mongoose');

var productSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: 'This field is required.'
    },
    productName: {
        type: String
    },
    productPrice: {
        type: String
    },
    productDescription: {
        type: String
    },
    imagePath: {
        type: String
    }
});

module.exports = mongoose.model('Product', productSchema);