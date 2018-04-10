var express=require("express");
var router=express.Router({mergeParams:true});
var Comment=require("../models/comment");
var Campground=require("../models/campground");
var middlewareobjects= require("../middleware");




router.get("/new",middlewareobjects.isLoggedIn,function(req,res)
{
    Campground.findById(req.params.id,function(err,campground)
    {
       if(err)
       {
           console.log(err);
       }
       else
       {
          res.render("comments/new",{campground,campground});
       }
    });

});

router.post("/",middlewareobjects.isLoggedIn,function(req,res)
{
   Campground.findById(req.params.id,function(err, campground) {
      if(err)
      {
          console.log(err);
      }
      else
      {
        
          Comment.create(req.body.comment,function(err,comm)
          {
             if(err)
             {
                 console.log(err);
             }
             else
             {
                  comm.author.id=req.user._id;
                  comm.author.username=req.user.username;
                  comm.save();
                  
                  campground.comments.push(comm);
                  
                  campground.save();
               req.flash("success","Comment Successfully Added");   
                 res.redirect('/campground/'+campground._id);
             }
          });
      }
   });
});


router.get("/:comment_id/edit",middlewareobjects.checkCommentOwnership,function(req,res)
{
    Campground.findById(req.params.id,function(err,foundCampground)
    {
       if(err || !foundCampground)
       {
           req.flash("error","campground not found");
          return res.redirect("back");
       }
    });
    
    Comment.findById(req.params.comment_id,function(err,comment)
    {
       if(err || !comment)
       {
          req.flash("error","comment not found");
          res.redirect("back");
       }
       else
       {
           res.render("comments/edit",{campground_id:req.params.id,comment:comment});
       }
    });
});


router.put("/:comment_id",middlewareobjects.checkCommentOwnership,function(req,res)
{
   Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,comment)
   {
    if(err)
    {
        res.redirect("back");
    }
    else
    {
        res.redirect("/campground/"+req.params.id);
    }
   }) ;
});

router.delete("/:comment_id",middlewareobjects.checkCommentOwnership,function(req,res)
{
   Comment.findByIdAndRemove(req.params.comment_id,function(err,comment)
   {
     if(err)
     {
         res.redirect("back");
     }
     else
     {
          req.flash("success","Comment Deleted Added");  
         res.redirect("/campground/"+req.params.id);
     }
   }); 
});



module.exports=router;