const express= require('express');
const router = express.Router();
const catchError= require('../utilities/catchError');
const expressError= require('../utilities/expressErrors');
const Food= require('../model/food');
const {foodSchema}= require('../joiSchema.js');
const {isloggedin, isAuthor,validateFood}= require('../middleware');
const {cloudinary}= require("../cloudinary")

//clodinary
const multer=require('multer');
const {storage}= require('../cloudinary');

// const upload = multer({ dest: 'uploads/' });
const upload= multer({storage});


router.get('/new',isloggedin, (req,res)=>{
    res.render('foods/new');
})
router.post('/',isloggedin, upload.array('image'),validateFood, catchError(async (req,res,next) => {
    // router.post('/', upload.array('image'),async (req,res) => {
        // if(!req.body.foods)  {
        //     throw new expressError("missing fields", 500);
        // }  
        const newFood= new Food(req.body.food);
        
        newFood.image = req.files.map(f => ({ url: f.path, filename: f.filename }));
        newFood.author= req.user._id;
        console.log(newFood, req.files);
        await newFood.save();
        req.flash('success', 'successfully made a new food');
        // res.redirect(`/foods/${newFood._id}`);
        // console.log(req.files);
        // res.send(req.body);
        res.redirect('/foods');
}))
router.get('/:id', catchError(async (req,res)=>{
    const {id}= req.params;
    const dish= await Food.findById(id).populate(
        {
            path:'review',
            populate:{
                path:'author'
            }
    }).populate('author');
    if(!dish){
        req.flash('error','cannot find the food');
        res.redirect('/foods');
    }
    res.render('foods/show',{dish});
}))
router.get('/:id/edit',isloggedin ,isAuthor, catchError(async (req,res)=>{
    const {id}= req.params;
    const dish=await Food.findById(id);
    req.flash('success', 'successfully edited food')
    res.render('foods/edit',{dish})
}))
router.get('/', catchError(async (req,res)=>{
const foods= await Food.find({});

res.render('foods/index', {foods});
}))

router.put('/:id',isloggedin,isAuthor,upload.array('image'),validateFood, catchError(async (req,res)=>{
    const {id}= req.params;
    const dish= await Food.findByIdAndUpdate(id,{...req.body.food});
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    dish.image.push(...images);
    await dish.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await dish.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'successfullyupdated the food');
    res.redirect(`/foods/${dish._id}`);
}))
router.delete('/:id',isloggedin,isAuthor, catchError(async(req,res)=>{
    const {id}= req.params;
    const deletedish= await Food.findByIdAndDelete(id);
    req.flash('success', 'successfully deleted the food');
    res.redirect('/foods');
}))
module.exports= router;