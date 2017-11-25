var mongoose = require("mongoose");
var express = require("express");
var passport = require("passport");
var bodyParser = require("body-parser");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var app = express();
require('node-offline-localhost').ifOffline();

app.use(bodyParser.urlencoded({ extended: true }))
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(require("express-session")({
  secret: "I'm So Fabulous",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://127.0.0.1/TProducts");

///////////////////////////////////////////////////////////////////////////////////////

var productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  category: String,
  quantity: Number,
  description: String,
  date: Number,
  ad:{src:String}
});
var commandSchema = new mongoose.Schema({
  client: String,
  products: [productSchema],
  date: Number
});
var UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  regDate: Number,
  LastOnline: Number,
  type: String,
  cart: [productSchema],
  commands: [commandSchema],
  adress: String

});

//////////////////////////////////////////////////////////////////////////////////////
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);
var User = mongoose.model("User", UserSchema);
var product = mongoose.model("product", productSchema);
var command = mongoose.model("command", commandSchema);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));


/////////////////////////////////////////////////////////////////////////////////////
/*for(i=0;i<10;i++){
product.create({name : "CPU I7 3.7GHz",date:Date.now(), category:"CPU",quantity:99,description:"powerful cpu ,perfect for gaming!",price:48000, image:"http://lorempixel.com/400/200/nightlife"},function (err,prod) {
  if(err)
    console.log(err);
    else {
      console.log("Stock +1 du Product : "+prod);
    }
});
product.create({ad:{name:"STRIX",src:"https://playpro.vn/wp-content/uploads/2016/07/ROG-Strix-RX-480.jpg"},name : "GTX980", category:"GPU",date:Date.now(),quantity:99,description:"perfect for gaming!",price:72000, image:"http://lorempixel.com/400/200/technics"},function (err,prod) {
  if(err)
    console.log(err);
    else {
      console.log("Stock +1 du Product : "+prod);
    }
});
product.create({ad:{src:"https://playpro.vn/wp-content/uploads/2016/07/ROG-Strix-RX-480.jpg"},name : "CORSAIR TITANIUM RAM 16GB",date:Date.now(), category:"RAM",quantity:99,description:"perfect for gaming!",price:18000, image:"http://lorempixel.com/400/1200/cats"},function (err,prod) {
  if(err)
    console.log(err);
    else {
      console.log("Stock +1 du Product : "+prod);
    }
});
}

*/



/////////////////////////////////////
//
//        TODO:
//  
//   Systm  \ Customer Cart System      FUX IT
//   Products Comparing / ordering
//   Optional :
//    Home Delivery Google MAp Distance*Pricing calculs
//   Promotions nd more ...
/////////////////////////////////////
app.post("/command", function (req, res) {
  var name = req.user.username;
  var product = req.user.cart;
  var date = Date.now();
  var newcommand = { client: name, products: product, date: date };

  command.create(newcommand, function (err, newlymade) {
    if (err) { console.log("lol"); }
    else {
      req.user.commands.push(newlymade);
      req.user.cart = [];
      req.user.save(function (err) {
        if (err) console.log(err);
        res.redirect("/");
      })


    }
  })

});
app.post("/delivery/:id", function (req, res) {
  command.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
      console.log("didn't Find");
    } else {
      res.redirect("/delivery");
    }
  })
})
app.get("/delivery", isDeliveryLoggedIn, function (req, res) {
  command.find({}, function (err, Found) {
    res.render("delivery", { coms: Found });
  })
})
app.get("/command", isClientLoggedIn, function (req, res) {

  res.render("Command", { user: req.user, products: req.user.cart });

});

app.get("/account/client", isClientLoggedIn, function (req, res) {
  User.findById(req.user._id, function (err, products) {
    if (err) { console.log(err); } else {
      res.render("client", { prods: products.cart, coms: products.commands });
    }
  });
});
function isDisponnible(req, res, next) {
  product.findById(req.params.id, function (err, prod) {
    if (prod.quantity > 0) {

      return next();
    }
    res.redirect("/show/" + req.params.id);
  });
}
app.post("/buy/:id", isClientLoggedIn, isDisponnible, function (req, res) {
  product.findById(req.params.id, function (err, products) {
    if (err) { console.log(err); } else {
      req.user.cart.push(products);
      //req.user.pay+=products.price;
      var qt = products.quantity - 1;
      products.quantity = qt;
      products.save(function (err) {
        if (err) console.log(err); else req.user.save(function (err) { if (err) { console.log(err); } else { res.redirect("/show/" + req.params.id); } });
      });
    }
  })
})
app.get("/account/admin", isAdminLoggedIn, function (req, res) {
  res.redirect("/account/admin/products");
});
app.get("/account/admin/accs", isAdminLoggedIn, function (req, res) {
  User.find({/*No Condition*/ }, function (err, Users) {
    if (err) console.log(err);
    else {
      res.render("admina", { prods: Users });
    }
  });
});
app.get("/account/manager", isAdminLoggedIn, function (req, res) {
  product.find({/*No Condition*/ }, function (err, products) {
    if (err) console.log(err);
    else {
      res.render("manp", { prods: products });
    }
  });
});
app.get("/account/admin/products", isAdminLoggedIn, function (req, res) {
  product.find({/*No Condition*/ }, function (err, products) {
    if (err) console.log(err);
    else {
      res.render("adminp", { prods: products });
    }
  });
});

app.get("/addp", isAdminLoggedIn, function (req, res) {
  res.render("addproduct");
});
app.get("/adda", function (req, res) {
  res.render("addaccount");
});


app.post("/deletebuy/:i", function (req, res) {
  var prod = req.user.cart[req.params.i];
  var newquantity = prod.quantity;
  product.findByIdAndUpdate(prod._id, { quantity: newquantity }, function (err, prod) {
    req.user.cart.splice(req.param.i, 1);
    req.user.save(function (err) {
      if (err) console.log(err);
      res.redirect("/show/" + prod._id);
    })
  });

});

app.post("/delete/:id", function (req, res) {
  if (req.params.id == "all") {
    product.remove({}, function (err) {
      console.log("WARNING : ALL PRODUCT DATA ERASING  .   .   .   .   . ");
      res.redirect("/account/admin/product");
    })
  } else {
    product.findByIdAndRemove(req.params.id, function (err) {
      if (err) {
        console.log("didn't Find");
      } else {
        res.redirect("/account/admin/products");
      }
    })
  }
});
app.post("/deletea/:id", function (req, res) {
  User.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
    } else {
      res.redirect("/account/admin/accs");
    }
  })
});

app.get("/edit/:id", isAdminLoggedIn, function (req, res) {
  product.findById(req.params.id, function (err, products) {
    if (err) console.log(err);
    else {
      res.render("editproduct", { product: products });
    }
  });
});
app.get("/show/:id", function (req, res) {
  product.findById(req.params.id, function (err, TheProd) {
    if (err) console.log(err);
    else {
      product.find({category:TheProd.category,price:{$gt :TheProd.price}}).limit(8).sort({price : 1}).exec(function(err, sameCatProds){if(sameCatProds.length<8)
        {
          product.find({category:TheProd.category,price:{$lt :TheProd.price}}).limit(8-sameCatProds.length).sort({price: -1}).exec(function(err, lessCatProds){
            var someCatProds = sameCatProds.concat(lessCatProds);
            if (req.isAuthenticated()) {
              res.render("show", { TheProduct: TheProd, Logged: true, account: req.user,prods:someCatProds });
            }
            else {
              res.render("show", { TheProduct: TheProd, Logged: false, account: null ,prods:someCatProds});
            }
          });
        }
      else
        if (req.isAuthenticated()) {
          res.render("show", { TheProduct: TheProd, Logged: true, account: req.user,prods:sameCatProds });
        }
        else {
          res.render("show", { TheProduct: TheProd, Logged: false, account: null ,prods:sameCatProds});
        }
      });
     
    }
  });
});
app.post("/edit/:id", function (req, res) {  // EDIT PRODUCT
  var name = req.body.name;
  var image = req.body.image;
  var price = req.body.price;
  var desc = req.body.desc;
  var category = req.body.category;
  var quantity = req.body.quantity;
  var ad =req.body.ad;
  product.findByIdAndUpdate(req.params.id, {ad:{src:ad},name: name, image: image, price: price, description: desc, category: category, quantity: quantity }, function (err, edit) {
    if (err) {
      console.log("didn't Find");
    } else {
      res.redirect("/account/admin/products");
    }
  })
});

app.post("/addp", function (req, res) {     //ADD PRODUCT
  var name = req.body.name;
  var image = req.body.image;
  var price = req.body.price;
  var desc = req.body.desc;
  var category = req.body.category;
  var quantity = req.body.quantity;
  var ad = req.body.ad;
  var newProduct = { name: name, image: image, date: Date.now(), price: price, description: desc, category: category, quantity: quantity ,ad: {src:ad} }
  product.create(newProduct, function (err, newlyMade) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("account/admin/products");
    }
  })
});
app.post("/adda", function (req, res) {       // ADD USER
  var name = req.body.name;
  var password = req.body.password;
  var type = req.body.type;
  User.register(new User({ username: name, type: type }), password, function (err, user) {
    if (err) {
      console.log("Acc adding failed .. " + err);
      res.redirect("account/admin/accs");
    } else {
      console.log("Successfully registered ! ");
      res.redirect("account/admin/accs");
    }
  })
});
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.get("/register", function (req, res) {
  res.render("register");
});
app.get("/login", function (req, res) {
 
  res.render("login",{state: null});
});
app.get("/login/fail", function (req, res) {
 
  res.render("login",{state: fail});
});
app.get("/account", function (req, res) {
  if (req.user.name == "admin") { res.redirect("/account/admin"); }
  else {
    res.redirect("/");
  }
});
app.post("/login",passport.authenticate("local", {
  successRedirect: "/account",
  failureRedirect: "/login/fail"
}));


app.post("/register", function (req, res) {
  User.register(new User({ username: req.body.username, type: "admin", adress: req.body.adress }), req.body.password, function (err, user) {
    if (err) {
      console.log("Reg Failed .. !");
      res.redirect("/");
    } else {
      console.log("Successfully registered ! ");
      passport.authenticate("local")(req, res, function () {
        res.redirect("/");
      })
    }
  })
});


app.get("/products/:category", function (req, res) {
  var prods = product.find({ category: req.params.category }, function (err, found) {
    if (err) {
    } else {
      if (req.isAuthenticated()) {
        res.render("products", { prods: found, Logged: true, account: req.user });
      }
      else {
        res.render("products", { prods: found, Logged: false, account: null });
      }
    }
  });
});


app.get("/products/:category/:sort", function (req, res) {
  if (req.params.sort == "p") {
    var prods = product.find({ category: req.params.category }).sort({ price: -1 }).exec(function (err, found) { if (err) { } else { if (req.isAuthenticated()) { res.render("products", { prods: found, Logged: true, account: req.user }); } else { res.render("products", { prods: found, Logged: false, account: null }); } } });
  }
  else if (req.params.sort == "m") {
    var prods = product.find({ category: req.params.category }).sort({ price: 1 }).exec(function (err, found) { if (err) { } else { if (req.isAuthenticated()) { res.render("products", { prods: found, Logged: true, account: req.user }); } else { res.render("products", { prods: found, Logged: false, account: null }); } } });
  }
  else if (req.params.sort == "n") {
    var prods = product.find({ category: req.params.category }).sort({ date: -1 }).exec(function (err, found) { if (err) { } else { if (req.isAuthenticated()) { res.render("products", { prods: found, Logged: true, account: req.user }); } else { res.render("products", { prods: found, Logged: false, account: null }); } } });
  }
  else if (req.params.sort == "a") {
    var prods = product.find({ category: req.params.category }).sort({ date: 1 }).exec(function (err, found) { if (err) { } else { if (req.isAuthenticated()) { res.render("products", { prods: found, Logged: true, account: req.user }); } else { res.render("products", { prods: found, Logged: false, account: null }); } } });
  }
  else if (req.params.sort == "d") {
    var prods = product.find({ category: req.params.category }).sort({ quantity: -1 }).exec(function (err, found) { if (err) { } else { if (req.isAuthenticated()) { res.render("products", { prods: found, Logged: true, account: req.user }); } else { res.render("products", { prods: found, Logged: false, account: null }); } } });
  }
});

function isDeliveryLoggedIn(req, res, next) {
  if (req.isAuthenticated() && req.user.type == "livreur") {
    return next();
  }
  //  res.send("Admin is not Authenticated !");
  res.redirect("/login");
}
function isClientLoggedIn(req, res, next) {
  if (req.isAuthenticated() && req.user.type == "client") {
    return next();
  }
  //  res.send("Admin is not Authenticated !");
  res.redirect("/login");
}
function isAdminLoggedIn(req, res, next) {
  if (req.isAuthenticated() && (req.user.type == "admin" || req.user.type == "gérant")) {
    return next();
  }
  //  res.send("Admin is not Authenticated !");
  res.redirect("/login");
}

app.get("/", function (req, res) {

  product.find({}).limit(8).sort('-date').exec(function (err, products) {
    if (err) console.log(err);
    else {
     // product.find({}).exec(function(err,ads){
        if (req.isAuthenticated()) {
          command.find().exec(function (err, found) {
            res.render("landing", { prods: products, Logged: true, account: req.user, commands: found });
  
          })
        }
        else {
          res.render("landing", { prods: products, Logged: false, account: null, commands: null });
        }
      }
  });
});
app.listen(3000, '0.0.0.0', function () {
  console.log("---EXPRESS :Server Launched !");
});
