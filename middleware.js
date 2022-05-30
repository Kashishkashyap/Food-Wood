const Food = require("./model/food");
const Review = require("./model/review");
const expressError= require('./utilities/expressErrors');
const {foodSchema, reviewSchema}= require('./joiSchema.js');
module.exports.isloggedin= (req,res,next)=>{
    
    if(!req.isAuthenticated()){
        req.session.returnTo= req.originalUrl;
        req.flash('error','you must be logged in');
        res.redirect('/login');
    }
    next();
}
module.exports.isAuthor= async(req,res,next)=>{
    const {id}= req.params;
    const food= await Food.findById(id);
    if(!food.author.equals(req.user._id)){
        req.flash('error',"You dont have the Permission");
        return res.redirect(`/foods/${id}`);
    }
     next();
 }
 module.exports.isReviewAuthor= async(req,res,next)=>{
    const {id ,reviewId}= req.params;
    const review= await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error',"You dont have the Permission");
        return res.redirect(`/foods/${id}`);
    }
     next();
 }
 module.exports.validateFood= (req, res, next) =>{

    const {error}= foodSchema.validate(req.body);
    if(error){
        const msg= error.details.map(el => el.message).join(',');
        throw new expressError(msg, 400);
    }
    else{
        next();
    }

}
module.exports.validateReview= (req,res,next)=>{
    const {error}= reviewSchema.validate(req.body);
      if(error){
        const msg= error.details.map(el => el.message).join(',');
        throw new expressError(msg, 400);
    }
    else{
        next();
    }
}