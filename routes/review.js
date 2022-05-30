const express= require('express');
const router = express.Router({ mergeParams: true });
const catchError= require('../utilities/catchError');
const expressError= require('../utilities/expressErrors');
const Food= require('../model/food');
const Review= require('../model/review');
const {validateReview, isloggedin, isReviewAuthor}= require('../middleware')

router.post('/',isloggedin,validateReview, catchError(async(req,res)=>{
    const camp= await Food.findById(req.params.id);
    const review= new Review(req.body.review);
    review.author= req.user._id;
    camp.review.push(review);
    await camp.save();
    await review.save();
    req.flash('success', 'successfully made a new review');
    res.redirect(`/foods/${camp._id}`);

}))
router.delete('/:reviewId',isloggedin,isReviewAuthor, catchError(async(req,res)=>{
    const {id, reviewId}= req.params;
    const camp=await Food.findByIdAndUpdate(id,{$pull:{review: reviewId}});//pull is used to delete reviews from food in database
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'successfully deleted the review');
    res.redirect(`/foods/${id}`);
    
}))
module.exports= router;