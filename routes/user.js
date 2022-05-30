const express= require('express');
const router= express.Router();
const User = require('../model/user');
const catchError= require('../utilities/catchError');
const passport= require('passport');

router.get('/register', (req,res)=>{
   res.render('user/new');  
})
router.post('/register', catchError(async(req,res)=>{
   try{
      const {email, username, password}= req.body;
      const user= await new User({email,username});
     const registereduser= await User.register(user,password);
     req.login(registereduser, err=>{
        if(err) return next(err);
        req.flash('success','welcome to yelpcamp');
        res.redirect('/foods');
     })
     
   }catch(e){
      req.flash('error', e.message);
      res.redirect('/register');
   }
}));                                                                                   
router.get('/login', (req,res)=>{
   res.render('user/login');  
})
router.post('/login', passport.authenticate('local',{failureFlash: true ,failureRedirect: '/login' }), (req,res)=>{
   req.flash('success',"welcome!!!!!!"); 
   const redirecturl= req.session.returnTo || '/foods';
   delete req.session.returnTo;
   res.redirect(redirecturl);

});
// router.post('/logout',(req,res)=>{
//   req.logout();
//   req.flash('success','logged out');
//   console.log("user logged out")
//   res.redirect('/foods');
// //   console.log("trying to logout....")
// //     req.session.destroy()
// //     req.logout()s
// //     res.redirect('/login');

// })
router.get("/logout", (req, res) => {
   req.logout(req.user, err => {
     if(err) return next(err);
     res.redirect("/");
   });
 });
module.exports= router;