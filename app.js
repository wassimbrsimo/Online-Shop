var mongoose = require("mongoose");
var express = require("express");
var passport = require("passport");
var bodyParser = require("body-parser");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var app = express();
require('node-offline-localhost').ifOffline();

app.use(bodyParser.urlencoded({extended : true}))
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(require("express-session")({
    secret : "I'm So Fabulous",
    resave : false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://127.0.0.1/TProducts");

///////////////////////////////////////////////////////////////////////////////////////
var productSchema = new mongoose.Schema({
  name : String ,
  price : Number,
  image : String,
  category :String,
  quantity : Number,
  description: String,
  date: Number
});
var commandSchema = new mongoose.Schema({
  client: String,
  products : [productSchema] ,
  date: Number
});
var UserSchema = new mongoose.Schema({
  username: String ,
  password : String ,
  regDate : Number ,
  LastOnline: Number,
  type : String,
  cart : [productSchema],
  commands : [commandSchema],
  adress : String

});

//////////////////////////////////////////////////////////////////////////////////////
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User",UserSchema);
var User=mongoose.model("User",UserSchema);
var product=mongoose.model("product",productSchema);
var command=mongoose.model("command",commandSchema);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));


/////////////////////////////////////////////////////////////////////////////////////
for(i=0;i<10;i++){
product.create({name : "CPU I7 3.7GHz",date:Date.now(), category:"CPU",quantity:99,description:"powerful cpu ,perfect for gaming!",price:48000, image:"https://static1.squarespace.com/static/52536652e4b007332ef4ecf4/58afb7f429687fde0f2b7f42/58afb7f8d2b8574027b0d693/1487910907335/i7-01-Edit.jpg"},function (err,prod) {
  if(err)
    console.log(err);
    else {
      console.log("Stock +1 du Product : "+prod);
    }
});
product.create({name : "GTX980", category:"GPU",date:Date.now(),quantity:99,description:"perfect for gaming!",price:72000, image:"http://media.ldlc.com/ld/products/00/01/69/84/LD0001698451_2.jpg"},function (err,prod) {
  if(err)
    console.log(err);
    else {
      console.log("Stock +1 du Product : "+prod);
    }
});
product.create({name : "CORSAIR TITANIUM RAM 16GB",date:Date.now(), category:"RAM",quantity:99,description:"perfect for gaming!",price:18000, image:"http://matron.vteximg.com.br/arquivos/ids/158801-1000-1000/Memoria-corsair-vengeance-16gb--2x8-gb-.png"},function (err,prod) {
  if(err)
    console.log(err);
    else {
      console.log("Stock +1 du Product : "+prod);
    }
});
product.create({name : "H61 MSI",date:Date.now(), category:"Carte Mere",quantity:99,description:"perfect for gaming!",price:18000, image:"http://www.iven.by/data/big/msi_h61m-p32b.jpg"},function (err,prod) {
  if(err)
    console.log(err);
    else {
      console.log("Stock +1 du Product : "+prod);
    }
});
product.create({name : "Philips 4K 27'' Screen", date:Date.now(),category:"Ecran",quantity:99,description:"perfect for gaming!",price:18000, image:"http://s3-eu-west-1.amazonaws.com/media.markselectrical.co.uk/item-images/zoom/40PUT640012.alt1.jpg"},function (err,prod) {
  if(err)
    console.log(err);
    else {
      console.log("Stock +1 du Product : "+prod);
    }
});
product.create({name : "Cooler Master Fridge Box ",date:Date.now(), category:"Boitiers",quantity:99,description:"perfect for gaming!",price:18000, image:"https://static1.squarespace.com/static/52536652e4b007332ef4ecf4/58afb7f429687fde0f2b7f42/58afb7f8d2b8574027b0d693/1487910907335/i7-01-Edit.jpg"},function (err,prod) {
  if(err)
    console.log(err);
    else {
      console.log("Stock +1 du Product : "+prod);
    }
});
product.create({name : "CoolerMaster 650W PSU",date:Date.now(),  category:"Alimentation",quantity:99,description:"perfect for gaming!",price:18000, image:"https://images-na.ssl-images-amazon.com/images/I/41iR7FDpSYL._AC_US1000_.jpg"},function (err,prod) {
  if(err)
    console.log(err);
    else {
      console.log("Stock +1 du Product : "+prod);
    }
});
product.create({name : "HDD 1to Western digit",date:Date.now(),  category:"Disque Dur",quantity:99,description:"perfect for gaming!",price:18000, image:"https://images-na.ssl-images-amazon.com/images/I/41iR7FDpSYL._AC_US1000_.jpg"},function (err,prod) {
  if(err)
    console.log(err);
    else {
      console.log("Stock +1 du Product : "+prod);
    }
});}
//
//        TODO:
//  LOGIN _ /admin Stock Management And DONE
//                         Analysis
//   Systm  \ Customer Cart System      FUX IT
//   Products Comparing / ordering
//   Optional :
//    Home Delivery Google MAp Distance*Pricing calculs
//   Promotions nd more ...
/////////////////////////////////////
app.post("/command",function (req, res) {
    var name=req.user.username;
    var product=req.user.cart;
    var date = Date.now();
    var newcommand={client:name,products:product,date:date};

    command.create(newcommand,function (err,newlymade) {
      if(err){console.log("lol");}
      else{
        req.user.commands.push(newlymade);
        req.user.cart=[];
        req.user.save(function (err) {
            if(err) console.log(err);
            res.redirect("/");
        })


      }
    })

});
app.post("/delivery/:id",function (req,res) {
  command.findByIdAndRemove(req.params.id,function (err) {
    if(err){
      console.log("didn't Find");
    }else {
      res.redirect("/delivery");
    }
  })
})
app.get("/delivery",isDeliveryLoggedIn ,function (req,res) {
  command.find({},function (err , Found) {
    res.render("delivery",{coms:Found});
  })
})
app.get("/command",isClientLoggedIn ,function (req, res) {

        res.render("Command",{user:req.user,products:req.user.cart});

});
app.get("/show/:id" ,function (req,res) {
  product.findById(req.params.id, function (err ,product) {
    if(err){console.log(err);
  }else   {
    if(req.isAuthenticated()){
    res.render("show",{prods:product,logged:true,account:req.user});
  }
  else{
    res.render("show",{prods:product,logged:false,account:null});
  }}
});
});
app.get("/account/client", isClientLoggedIn ,function (req,res) {
  User.findById(req.user._id,function (err,products) {
    if(err){console.log(err);}else {
        res.render("client",{prods:products.cart,coms:products.commands});
  }
});
});
function isDisponnible(req ,res ,next){
        product.findById(req.params.id,function (err,prod) {
          if(prod.quantity>0){

          return next();
        }
        res.redirect("/show/"+req.params.id);
  });}
app.post("/buy/:id",isClientLoggedIn,isDisponnible,function (req,res) {
  product.findById(req.params.id,function (err,products) {
    if(err){console.log(err);}else {
      req.user.cart.push(products);
      //req.user.pay+=products.price;
      var qt=products.quantity-1;
      products.quantity=qt;
      products.save(function (err) {if(err)console.log(err); else req.user.save(function (err) {if(err){console.log(err);}else{res.redirect("/show/"+req.params.id);}});
 });
    }
  })
})
app.get("/account/admin", isAdminLoggedIn ,function (req,res) {
  res.redirect("/account/admin/products");
});
app.get("/account/admin/accs", isAdminLoggedIn ,function (req,res) {
  User.find({/*No Condition*/}, function (err ,Users) {
    if(err) console.log(err);
    else   {
  res.render("admina",{prods:Users});
}
});
});
app.get("/account/manager", isAdminLoggedIn ,function (req,res) {
  product.find({/*No Condition*/}, function (err ,products) {
    if(err) console.log(err);
    else   {
  res.render("manp",{prods:products});
}
});
});
app.get("/account/admin/products", isAdminLoggedIn ,function (req,res) {
  product.find({/*No Condition*/}, function (err ,products) {
    if(err) console.log(err);
    else   {
  res.render("adminp",{prods:products});
}
});
});

app.get("/addp" ,isAdminLoggedIn,function (req,res) {
  res.render("addproduct");
});
app.get("/adda" ,function (req,res) {
  res.render("addaccount");
});


app.post("/deletebuy/:i",function(req,res) {
  var prod=req.user.cart[req.params.i];
  var newquantity=prod.quantity;
  product.findByIdAndUpdate(prod._id,{quantity:newquantity},function (err,prod) {
      req.user.cart.splice(req.param.i,1);
      req.user.save(function (err) {
          if(err) console.log(err);
          res.redirect("/show/"+prod._id);
      })
  });

});

app.post("/delete/:id",function(req,res) {
  if(req.params.id=="all"){
    product.remove({},function (err) {
      console.log("WARNING : ALL PRODUCT DATA ERASING  .   .   .   .   . ");
      res.redirect("/account/admin/product");
    })
  }else {
      product.findByIdAndRemove(req.params.id,function (err) {
    if(err){
      console.log("didn't Find");
    }else {
      res.redirect("/account/admin/products");
    }
  })
}});
app.post("/deletea/:id",function(req,res) {
  User.findByIdAndRemove(req.params.id,function (err) {
    if(err){
    }else {
      res.redirect("/account/admin/accs");
    }
  })
});

app.get("/edit/:id" ,isAdminLoggedIn,function (req,res) {
  product.findById(req.params.id, function (err ,products) {
    if(err) console.log(err);
    else   {
  res.render("editproduct",{product:products});
}
});
});
app.get("/show/:id" ,function (req,res) {
  product.findById(req.params.id, function (err ,products) {
    if(err) console.log(err);
    else   {
  if(req.isAuthenticated()){
    res.render("show",{prods:products,Logged:true,account:req.user});
  }
  else{
    res.render("show",{prods:products,Logged:false,account:null});
  }
}
});
});

app.post("/edit/:id",function(req,res) {  // EDIT PRODUCT
  var name= req.body.name;
  var image= req.body.image;
  var price =req.body.price;
  var desc=req.body.desc;
  var category=req.body.category;
  var quantity=req.body.quantity;
  product.findByIdAndUpdate(req.params.id,{name :name ,image:image ,price:price,description:desc,category:category,quantity:quantity},function (err,edit) {
    if(err){
      console.log("didn't Find");
    }else {
      res.redirect("/account/admin/products");
        }
  })
});

app.post("/addp",function (req,res) {     //ADD PRODUCT
      console.log("Adding ur thing0");
      var name= req.body.name;
      var image= req.body.image;
      var price =req.body.price;
      var desc=req.body.desc;
      var category=req.body.category;
      var quantity=req.body.quantity;
      var newProduct={name :name ,image:image ,date:Date.now(),price:price,description:desc,category:category,quantity:quantity}
      product.create(newProduct,function (err ,newlyMade) {
        if(err){
          console.log(err);
        }else {
          res.redirect("account/admin/products");
        }
      })
});
app.post("/adda",function (req,res) {       // ADD USER
      var name= req.body.name;
      var password= req.body.password;
      var type =req.body.type;
      User.register(new User({username:name,type:type}), password ,function (err,user) {
        if(err)
        {    console.log("Acc adding failed .. "+err);
            res.redirect("account/admin/accs");
      }    else {
            console.log("Successfully registered ! ");
            res.redirect("account/admin/accs");
            }
      })
    });
app.get("/logout" ,function(req,res){
  req.logout();
  res.redirect("/");
});

app.get("/register",function (req ,res) {
    res.render("register");
  });
  app.get("/login",function (req ,res) {
      res.render("login");
    });
app.get("/account",function(req ,res){
    if(req.user.name=="admin"){res.redirect("/account/admin");}
    else {
        res.redirect("/");
    }
});
app.post("/login",passport.authenticate("local",{
    successRedirect : "/account",
    failureRedirect : "/login"
  }));
/*app.get("/register",function (res,res) {
  res.render("custompage");
});*/
app.post("/register",function (req, res) {
    User.register(new User({username: req.body.username,type:"client",adress:req.body.adress}), req.body.password ,function (err,user) {
      if(err)
      {    console.log("Reg Failed .. !");
            res.redirect("/");
    }    else {
          console.log("Successfully registered ! ");
              passport.authenticate("local")(req,res ,function () {
        res.redirect("/");
      })
          }
    })
  });


app.get("/products/:category",function (req, res) {
    var prods=product.find({category:req.params.category}, function (err,found) {
      if(err){
    }else   {
      if(req.isAuthenticated()){
        res.render("products",{prods:found,logged:true,account:req.user});
      }
      else{
        res.render("products",{prods:found,logged:false,account:null});
      }  }
    });
  });


  app.get("/products/:category/:sort",function (req, res) {
      if(req.params.sort=="p"){
      var prods=product.find({category:req.params.category}).sort({price:-1}).exec(function (err,found) {if(err){}else{if(req.isAuthenticated()){res.render("products",{prods:found,logged:true,account:req.user});}else{res.render("products",{prods:found,logged:false,account:null});}}});}
      else if(req.params.sort=="m"){
      var prods=product.find({category:req.params.category}).sort({price:1}).exec(function (err,found) {if(err){}else{if(req.isAuthenticated()){res.render("products",{prods:found,logged:true,account:req.user});}else{res.render("products",{prods:found,logged:false,account:null});}}});}
      else if(req.params.sort=="n"){
      var prods=product.find({category:req.params.category}).sort({date:-1}).exec(function (err,found) {if(err){}else{if(req.isAuthenticated()){res.render("products",{prods:found,logged:true,account:req.user});}else{res.render("products",{prods:found,logged:false,account:null});}}});}
      else if(req.params.sort=="a"){
      var prods=product.find({category:req.params.category}).sort({date:1}).exec(function (err,found) {if(err){}else{if(req.isAuthenticated()){res.render("products",{prods:found,logged:true,account:req.user});}else{res.render("products",{prods:found,logged:false,account:null});}}});}
      else if(req.params.sort=="d"){
      var prods=product.find({category:req.params.category}).sort({quantity:-1}).exec(function (err,found) {if(err){}else{if(req.isAuthenticated()){res.render("products",{prods:found,logged:true,account:req.user});}else{res.render("products",{prods:found,logged:false,account:null});}}});}
  });

  function isDeliveryLoggedIn(req ,res ,next){
          if(req.isAuthenticated() && req.user.type=="livreur"){
            return next();
          }
        //  res.send("Admin is not Authenticated !");
          res.redirect("/login");
  }
  function isClientLoggedIn(req ,res ,next){
          if(req.isAuthenticated() && req.user.type=="client"){
            return next();
          }
        //  res.send("Admin is not Authenticated !");
          res.redirect("/login");
  }
  function isAdminLoggedIn(req ,res ,next){
          if(req.isAuthenticated() && (req.user.type=="admin" || req.user.type=="gérant")){
            return next();
          }
        //  res.send("Admin is not Authenticated !");
          res.redirect("/login");
  }

app.get("/",function (req,res) {

  product.find({}).limit(8).sort('-date').exec(function (err ,products) {
    if(err) console.log(err);
    else   {
    //  res.send(req.user.username);
    if(req.isAuthenticated()){
      command.find().exec(function (err, found) {
        res.render("landing",{prods:products,logged:true,account:req.user,commands:found});

      })
    }
    else{
      res.render("landing",{prods:products,logged:false,account:null,commands:null});
    }
}
});
});
app.listen(3000, '0.0.0.0',function(){
  console.log("---EXPRESS :Server Launched !");
});
