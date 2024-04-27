import express from "express";
import {dirname} from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 5500;
var system,age,kg,cm,gender,bf,activity,cal,bodybuilding,liftsString;
var inches,feet,weightSTRING,heightSTRING;
var protein,carbs,fats,remCal;
var bmr; //Basic Metabolic Rate
var lbm; //Lean Body Mass


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

function calculateCMP(req,res,next) {
    system = req.body.system;
    gender = req.body.gender;
    age = req.body.age;
    bf = req.body.bf;
    activity = req.body.activity;
    bodybuilding = req.body.weightLifting;

    //convert units
    if (system=="imperial") {
        kg = Math.round(req.body.weight*0.45359237);
        feet = parseInt(req.body.feet);
        inches = parseInt(req.body.inches);
        cm = parseInt((feet*12+inches)*2.54);
        heightSTRING = req.body.feet+"'"+req.body.inches+'"';
        weightSTRING = req.body.weight+"lbs";
    } else {
        cm = req.body.height;
        kg = req.body.weight;
        heightSTRING = cm+"cm";
        weightSTRING = kg+"kg";
    }

    if (bodybuilding=="yes") {
        liftsString = "and wants to gain muscle";
    } else {
        liftsString = "and does't want to gain muscle"
    }
    
    lbm = kg*(1-(bf/100));
    //calc BMR
    if (Boolean(bf)==false) {
        bmr = Math.round(10*kg+6.25*cm-4.92*age+5);
        if (gender=="female") {
            bmr-=166;
        }
    } else if (Boolean(bf)) {
        bmr = Math.round(370+21.6*lbm);
    }

    kg = parseInt(kg);
    cal = Math.round(bmr*activity/10)*10;
    remCal = cal;

    // console.log(`bdbld=no, protein=${protein}, kg=${kg}, activity=${activity}`);

    //Calculate protein
    if (bodybuilding=="yes") {
        protein = kg*2+kg*((activity-1)/3);
    } else {
        protein = kg+kg*((activity-1)/3);
    }

    if (gender=="female") {
        protein *= 0.9;
        console.log("female=yes",protein);
    }

    protein = Math.round(protein);
    remCal -= protein*4;

    //calc fats+carbs
    carbs = Math.round((remCal*0.5)/4);
    fats = Math.round((remCal*0.5)/9);
    
    // console.log(`Calories=${cal} BMR=${bmr} Protein=${protein} Carbs=${carbs} Fats=${fats} remCal=${remCal} Gender=${gender} bodybuilding=${bodybuilding} Activity=${activity}`);
    next();
}

app.use(calculateCMP);

app.get("/", (req,res) => {
    res.sendFile(__dirname+"/public/index.html");
});

app.get("/about", (req,res) => {
    res.render("about.ejs");
});

app.get("/faq", (req,res) => {
   res.render("faq.ejs"); 
});

app.get("/contact", (req,res) => {
    res.render("contact.ejs");  
});

app.post("/results", (req,res) => {
    res.render("results.ejs",{
        system: system,
        gender: gender,
        age: age,
        kg: kg,
        cm: cm,
        wStr: weightSTRING,
        hStr: heightSTRING,
        activity: activity,
        bf: bf,
        bmr:bmr,
        cal:cal,
        prot:protein,
        fats:fats,
        carbs:carbs,
        preference: liftsString
    });
    console.log(`POST page localhost:3000/results...`);
});

app.listen(port,(req,res) => {
    console.log(`Server is up and running on port ${port}`);
});