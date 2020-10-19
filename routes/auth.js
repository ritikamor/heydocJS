const { render, renderFile } = require("ejs");
const fetch = require("node-fetch");
const express= require('express');
const router = express.Router();
const app = express();
const bodyParser=require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(router)
 

//SIGNUP ROUTES
router.get("/signup/doctor", (req,res)=> {
    res.render("docSignup.ejs")
});
router.get("/signup/patient", (req,res)=>{
    res.render("patSignup.ejs")
});
var isUserLoggedIn = false;

router.post("/signup/doctor" ,(req,res)=>{
	//creating new patient in the database via API call to AWS
	var signupData = req.body;
	signupData["flag"]="doc";
	var content;
	(async ()=>{
	const response = await fetch('https://j4z72d2uie.execute-api.us-east-1.amazonaws.com/public/sign', {
	headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'post',
    body: JSON.stringify(signupData)
  	});
  	content = await response.json();
  	console.log(content);//success:true if user successfully created else false
  	if(content !== undefined)
  	{
  		if(content.success === true)
	  		res.redirect("/auth/login/doctor");
	  	else res.render("docSignup.ejs"); // window.alert("username is already taken please try another username!");
  	}
  	else res.render("docSignup.ejs"); // window.alert("Please try again , there is some error !");
  	})();	
});

router.post("/signup/patient" ,(req,res)=>{
	//creating new patient in the database via API call to AWS
	var signupData = req.body;
	var content;
	signupData["flag"]="pat";
	(async ()=>{
	const response = await fetch('https://j4z72d2uie.execute-api.us-east-1.amazonaws.com/public/sign', {
	headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'post',
    body: JSON.stringify(signupData)
  	});
  	content = await response.json();
  	console.log(content);//success:true if user successfully created else false
  	if(content !== undefined)
  	{
  		if(content.success === true)
			res.redirect("/auth/login/patient");
	  	else res.render("patSignup.ejs"); // window.alert("username is already taken please try another username!");
  	}
  	else res.render("patSignup.ejs"); // window.alert("Please try again , there is some error !");
  	})();

});


// LOGIN ROUTES
var doctors;
var patient;

router.get("/login/doctor", (req,res)=> {
    res.render("docLogin.ejs")
});
router.get("/login/patient", (req,res)=> {
    res.render("patLogin.ejs")
});


router.post("/login/doctor",(req,res)=>{
	var loginData = req.body;
	loginData["flag"] = "doc";
	var content;
	//method to check if the username and password provided are valid
	//API call to AWS, for checking in the database for matching username and password
	(async ()=>{
	const response = await fetch('https://j4z72d2uie.execute-api.us-east-1.amazonaws.com/public/login', {
	headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'post',
    body: JSON.stringify(loginData)
  	});
  	content = await response.json();
  	console.log(content); //success:true if valid else false
	  	if(content.success === true)
	  	{
	  	const url = "https://j4z72d2uie.execute-api.us-east-1.amazonaws.com/public/sign?flag=doc&username="+req.body.username;
	  		
		fetch(url, { headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}, method: 'GET',})
		.then(resp => resp.json())
		.then(user => {
			  doctor=user;
			  isUserLoggedIn = true;
			   console.log(user);
			   //alert(user);
			 //res.render("docDashboard.ejs",{user:user}); 
			   res.redirect(`/auth/doctor/${user.username}/dashboard`);
			})
		.catch(err=>console.log(err));
		}	
	})();
  
})



router.post("/login/patient",(req,res)=>{
	var loginData = req.body;
	loginData["flag"] = "pat";
	var content;
	//method to check if the username and password provided are valid
	//API call to AWS, for checking in the database for matching username and password
	(async ()=>{
		const response = await fetch('https://j4z72d2uie.execute-api.us-east-1.amazonaws.com/public/login', {
		headers: {
	      'Accept': 'application/json',
	      'Content-Type': 'application/json'
	    },
	    method: 'post',
	    body: JSON.stringify(loginData)
	  	});
	  	content = await response.json();
	  	console.log(content); //success:true if valid else false
		if(content.success === true)
	  	{

		const url = "https://j4z72d2uie.execute-api.us-east-1.amazonaws.com/public/sign?flag=pat&username="+req.body.username;
		fetch(url, {headers: {'Accept': 'application/json','Content-Type': 'application/json'},method: 'GET',})
		.then(resp => resp.json())
		.then(user => {
			patient = user;
			isUserLoggedIn = true;
			 console.log(user);
			// alert(user);
			 return res.redirect(`/auth/patient/${user.username}/dashboard`);
		}).catch(err => console.log(err));
			  //res.header('authtoken',token);
		}
	})();
    
	  		
});

// --------------------------------- Function to check if user has logged in ------------------

function isLoggedIn(req,res,next){
	if(isUserLoggedIn)
		next();
	else
		//res.render("landing.ejs");
		console.log("You are not authenticated");
		res.redirect("/");
}

//---------------------------Other Pages Routes-------------------------------------------------

router.post("/patient/:username/search",(req,res)=>{
	var query = req.body;
	console.log(query);
	(async ()=>{
		const response = await fetch('https://j4z72d2uie.execute-api.us-east-1.amazonaws.com/public/search', {
		headers: {
	      'Accept': 'application/json',
	      'Content-Type': 'application/json'
	    },
	    method: 'post',
	    body: JSON.stringify(query)
	  	});
	  	result = await response.json();
	  	console.log(result.values); // array of  info of all the doctors that match the search query
	  	var resArray = [];
	  	resArray = result.values;
	  	res.render("patSearch",{result:resArray , user:patient});
	  	
  	})();
  	
});

router.get("/doctor/:username/dashboard",isLoggedIn,(req,res)=>{
	res.render("docDashboard.ejs",{user: doctor});
});
router.get("/doctor/:username/appointments",isLoggedIn,(req,res)=>{
	res.render("docAppointments.ejs",{user:doctor})
});
router.get("/doctor/:username/patients",isLoggedIn,(req,res)=>{
	res.render("docPatients.ejs",{user:doctor})
});
router.get("/doctor/:username/files",isLoggedIn,(req,res)=>{
	res.render("docFiles.ejs",{user:doctor})
});
router.get("/patient/:username/dashboard",isLoggedIn,(req,res)=>{
	res.render("patDashboard.ejs",{user:patient})
});
router.get("/patient/:username/appointments",isLoggedIn,(req,res)=>{
	res.render("patAppointments.ejs",{user:patient})
});
router.get("/patient/:username/doctors",isLoggedIn,(req,res)=>{
	res.render("patDoctors.ejs",{user:patient})
});
router.get("/patient/:username/files",isLoggedIn,(req,res)=>{
	res.render("patFiles.ejs",{user:patient})
});


//-----------------Profile Pages----------------------
router.get('/doctor/:username/profile',isLoggedIn,(req,res)=> {
	res.render("docProfile.ejs",{user:doctor});
});
router.get('/patient/:username/profile',isLoggedIn,(req,res)=> {
	res.render("patProfile.ejs",{user:patient});
});

// ---------------SignOut Pages --------------------
router.get('/doctor/:username/logout',isLoggedIn,(req,res)=>{
	isUserLoggedIn = false;
	//res.render("landing.ejs");
	res.redirect("/");
});
router.get('/patient/:username/logout',isLoggedIn,(req,res)=>{
	isUserLoggedIn = false;
	//res.render("landing.ejs");
	res.redirect("/");
});


//--------------Profile Page view by patients on search------------------
router.get('/patient/:patusername/doctor/:docusername/profile',(req,res)=> {
	console.log(req.params);
	const url = "https://j4z72d2uie.execute-api.us-east-1.amazonaws.com/public/sign?flag=doc&username="+req.params.docusername;
	fetch(url, {headers: {'Accept': 'application/json','Content-Type': 'application/json'},method: 'GET',})
	.then(resp => resp.json())
	.then(selectedDoctor => {
		 console.log(selectedDoctor);
		 res.render("showDocProfile.ejs",{user:patient,doctor:selectedDoctor});
	}).catch(err => console.log(err));
});

module.exports = router;