import express from "express";
import * as path from 'path';
import * as url from 'url';
import cookie from 'cookie-parser';

import dotenv from 'dotenv' 
import connection from './config.js'



import http from 'http';



import AdminRouter from './routes/AdminRoute.js';




const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const app = express();
const server = http.createServer(app);



app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 


const port = 3005;




//----------------------  global  Middle ware start ----------------

app.use(express.static(path.join(__dirname,"public")));




app.use(cookie());




app.use(async (req, res, next) => {  
  
  const con = await connection();


  const results = await new Promise((resolve, reject) => {
    con.query('SELECT * FROM tbl_admin WHERE id = ?', [1], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
  
  const admin = results[0];
  


  app.locals.admin = admin;

  app.locals.output = '';
  next(); 
  
});

app.use("/admin",AdminRouter);






//------------------   Middleware End ---------------


app.set("view engine","ejs");
app.set("views", [
		path.join(__dirname,"./views"),
		path.join(__dirname,"./views/notwork/")		
	]  );

//env File added 
dotenv.config({path:"./config.env"});



server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

