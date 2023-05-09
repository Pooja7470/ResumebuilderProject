var express = require('express');
var router = express.Router();
const upload = require("../helpers/multer").single("avatar");
const fs = require("fs");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const { title } = require('process');
const { findOne } = require('../models/userModel');
passport.use(new LocalStrategy(User.authenticate()));

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render("index", {
    title: "Homepage",
    isLoggedIn: req.user ? true : false,
    user: req.user,
  });
});

router.get("/show", isLoggedIn, function (req, res, next) {
  res.render("show", {
    title: "Show",
    isLoggedIn: req.user ? true : false,
    user: req.user,

  });
});
router.get("/signup", function (req, res, next) {
  res.render("signup", {
    title: "Signup",
    isLoggedIn: req.user ? true : false,
    user: req.user,
  });
});

router.get("/signin", function (req, res, next) {
  res.render("signin", {
    title: "Signin",
    isLoggedIn: req.user ? true : false,
    user: req.user,
  });
});

router.get("/update/:id", isLoggedIn, function (req, res, next) {
  res.render("profile", {
    title: "Update",
    isLoggedIn: req.user ? true : false,
    user: req.user,
  });
});


router.post("/signup", function (req, res, next) {
  const { username, email, contact, password } = req.body;
  User.register({ username, email, contact }, password)
    .then((user) => {
      res.redirect("/signin");

    })
    .catch((err) => res.send(err));
});

router.post("/update/:id", isLoggedIn, async function (req, res, next) {
  try {
    const { username, email, contact, linkedin, github, behance } =
      req.body;

    const updatedUserInfo = {
      username,
      email,
      contact,
      links: { linkedin, github, behance },
    };

    await User.findOneAndUpdate(req.params.id, updatedUserInfo);
    res.redirect("/update/" + req.params.id);
  } catch (error) {
    res.send(err);
  }
});

router.get("/profile", isLoggedIn, function (req, res, next) {
  console.log(req.user);
  res.render("profile", {
    title: "Profile",
    isLoggedIn: req.user ? true : false,
    user: req.user,
  });
});

router.post("/signin", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/signin",

}),
  function (req, res, next) { }
);

router.get("/signout", isLoggedIn, function (req, res, next) {
  req.logout(() => {
    res.redirect("/signin");
  });
});

router.get("/reset-password", isLoggedIn, function (req, res, next) {
  res.render("reset", {
    title: "reset",
    isLoggedIn: req.user ? true : false,
    user: req.user,
  });
});


router.post("/reset-password",  async function (req, res, next) {
  try {
    await req.user. changePassword(
      req.body.oldPassword,
      req.body.newPassword,
    )
    await user.save();
    res.redirect("/profile");
  } catch (error) {
    res.send(error);
  }
});

router.get("/forget-password", function (req, res, next) {
  res.render("forget", {
    title: "Forget-password",
    isLoggedIn: req.user ? true : false,
    user: req.user,
  });
});

router.post("/send-mail", async function (req, res, next) {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.send("user not found");
  const mailurl = `${req.protocol}://${req.get("host")}/forgetpassword/${user._id}`


  //  --------------------------Node mailer coding--------------------------------------
  const transport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: "poojaalka37@gmail.com",
      pass: "hqazpkhlpvajkwjb",
    },
  });

  const mailOptions = {
    from: "Temp Mail Pvt. Ltd.<master.temp@gmail.com>",
    to: req.body.email,
    subject: "Password Reset Link",
    text: "Do not share this link to anyone.",
    html: `<a href=${mailurl}>Password Reset Link</a>`,
  };

  transport.sendMail(mailOptions, (err, info) => {
    if (err) return res.send(err);
    console.log(info);

    return res.send(
      "<h1 style='text-align:center;color: tomato; margin-top:10%'><span style='font-size:60px;'>✔️</span> <br />Email Sent! Check your inbox , <br/>check spam in case not found in inbox.</h1> <br> <a href='/signin'>Signin</a>"
    );
  });
});


router.get("/forgetpassword/:id", function (req, res, next) {
  res.render("getpassword", {
    title: "getpassword",
    id: req.params.id,
    isLoggedIn: req.user ? true : false
  });
});

router.post("/forgetpassword/:id", async function (req, res, next) {
  await User.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/signin");
});




router.post("/upload", isLoggedIn, async function (req, res, next) {
  upload(req, res, function (err) {
    if (err) {
      console.log("ERROR>>>>>", err.message);
      res.send(err.message);
    }
    if (req.file) {
      if (req.user.avatar !== "default.png") {
        fs.unlinkSync("./public/images/" + req.user.avatar);
      }
      req.user.avatar = req.file.filename;
      req.user.save()
        .then(() => {
          res.redirect("/profile");
        })
        .catch((err) => {
          res.send(err);
        });
    }
  });
});

// ----------------------------------resumes

router.get("/create", isLoggedIn, function (req, res, next) {
  res.render("create", {
    title: "Create",
    isLoggedIn: req.user ? true : false,
    user: req.user,
  });
});

router.post("/add-edu", async function (req, res, next) {
  req.user.education.push(req.body);
  await req.user.save();
  res.redirect("/education");

});

router.get("/education", isLoggedIn, function (req, res, next) {
  res.render("Resume/Education", {
    title: "education",
    isLoggedIn: req.user ? true : false,
    user: req.user,
  });
});
router.post("/add-edu", async function (req, res, next) {
  req.user.education.push(req.body);
  await req.user.save();
  res.redirect("/education");

});

router.get("/skill", isLoggedIn, function (req, res, next) {
  res.render("Resume/skill", {
    title: "skill",
    isLoggedIn: req.user ? true : false,
    user: req.user,
  });
});

router.post("/add-skill", async function (req, res, next) {
  req.user.skill.push(req.body);
  await req.user.save()
  res.redirect("/skill");

});

router.get("/project", isLoggedIn, function (req, res, next) {
  res.render("Resume/Project", {
    title: "project",
    isLoggedIn: req.user ? true : false,
    user: req.user,
  });
});

router.post("/add-project", isLoggedIn, async function (req, res, next) {
  req.user.project.push(req.body);
  await req.user.save()
  res.redirect("/project");

});

router.get("/experience", isLoggedIn, function (req, res, next) {
  res.render("Resume/Experience", {
    title: "experiencr",
    isLoggedIn: req.user ? true : false,
    user: req.user,
  });
});

router.post("/add-experience", async function (req, res, next) {
  req.user.experience.push(req.body);
  await req.user.save();
  res.redirect("/experience");


});

router.get("/interest", isLoggedIn, function (req, res, next) {
  res.render("Resume/interest", {
    title: "interest",
    isLoggedIn: req.user ? true : false,
    user: req.user
  });
});

router.post("/add-interest", async function (req, res, next) {
  req.user.interest.push(req.body);
  await req.user.save();
  res.redirect("/interest");
});

router.get("/delete-edu/:index", isLoggedIn, async function (req, res, next) {
  const eduCopy = [...req.user.education];
  eduCopy.splice(req.params.index, 1);
  req.user.education = [...eduCopy];
  await req.user.save();
  res.redirect("/education");
});

router.get("/delete-skil/:index", isLoggedIn, async function (req, res, next) {
  const skilCopy = [...req.user.skill];
  skilCopy.splice(req.params.index, 1);
  req.user.skill = [...skilCopy];
  await req.user.save();
  res.redirect("/skill")
});

router.get("/delete-proj/:index", isLoggedIn, async function (req, res, next) {
  const projCopy = [...req.user.project];
  projCopy.splice(req.params.index, 1);
  req.user.project = [...projCopy];
  await req.user.save();
  res.redirect("/Project");
});

router.get("/delete-inter/:index", isLoggedIn, async function (req, res, next) {
  const interCopy = [...req.user.interest];
  interCopy.splice(req.params.index, 1);
  req.user.interest = [...interCopy];
  await req.user.save();
  res.redirect("/interest");
});


router.get("/delete-ex/:index", isLoggedIn, async function (req, res, next) {
  const exCopy = [...req.user.experience];
  exCopy.splice(req.params.index, 1);
  req.user.experience = [...exCopy];
  await req.user.save();
  res.redirect("/experience");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/signin");
  }
};














module.exports = router;


// https://blog.e-zest.com/basic-commands-for-mongodb




