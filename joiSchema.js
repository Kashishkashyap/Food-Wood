const Joi= require('joi');
module.exports.foodSchema= Joi.object({
    food: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        restaurant: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required(),

    }).required(),
    
    deleteImages: Joi.array()
});
module.exports.reviewSchema= Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(0).max(5),
       body: Joi.string().required()

    }).required()
});