var express=require("express");
var router=express.Router({mergeParams:true});
var Campground=require("../models/campground");
var middlewareobjects=require("../middleware");






 router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds:allCampgrounds});
       }
    });
});

//CREATE - add new campground to DB
 router.post("/",middlewareobjects.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author={
        id:req.user._id,
        username:req.user.username
    }
    var newCampground = {name: name, image: image, description: desc,author:author}
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            req.flash("success","campground added successfully");
            res.redirect("/campground");
        }
    });
});

//NEW - show form to create new campground
 router.get("/new", middlewareobjects.isLoggedIn,function(req, res){
   res.render("campgrounds/new"); 
});

// SHOW - shows more info about one campground
 router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error","Campground not found");
            res.redirect("back");
        } else {
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});



// EDIT ROUTE

router.get("/:id/edit",middlewareobjects.checkCampgroundOwnership,function(req,res)
{
    Campground.findById(req.params.id,function(err,campgrounds)
    {
       if(err)
       {
           console.log(err);
       }
       else
       {
            res.render("campgrounds/edit",{campgrounds,campgrounds}); 
       }
    });
  
});


// UPDATE ROUTE
router.put("/:id",middlewareobjects.checkCampgroundOwnership,function(req,res)
{
    Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,campground)
    {
       if(err)
       {
           res.redirect("/campground");
       }
       else
       {
           res.redirect("/campground/"+req.params.id);
       }
    });
});
//Delete route

router.delete("/:id",middlewareobjects.checkCampgroundOwnership,function(req,res)
{
   Campground.findByIdAndRemove(req.params.id,function(err)
   {
       if(err)
       {
           res.redirect("/campground");
       }
       else
       {
             req.flash("success","campground deleted successfully");
           res.redirect("/campground");
       }
   });
});



module.exports=router;