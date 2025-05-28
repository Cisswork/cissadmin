
import jwt from 'jsonwebtoken'
import connection from '../config.js';

const con = await connection();

//authenticate Valid User to access perticualr service & resorce 
const isAuthenticatedAdmin = async(req,res,next)=>{

    const {token }= req.cookies ;

        if(!token){
            console.log(" Session Expired ...")
            return res.redirect('/admin/login')
        
        }

        const decodedData = jwt.verify(token,process.env.JWT_SECRET); 

        

  

    const con = await connection();

    const [existingSessions1] = await new Promise((resolve, reject) => {
  con.query('SELECT * FROM active_tokens_admin WHERE admin_id = ?', [decodedData.id], (err, results) => {
    if (err) return reject(err);
    resolve(results);
  });
});
    
  var storedToken = existingSessions1.token


  console.log('storedToken',storedToken);
  console.log('token',token);


    if(token != storedToken ){
            return res.redirect('/admin/login');
        } 

    const results = await new Promise((resolve, reject) => {
        con.query('SELECT * FROM tbl_admin WHERE id = ?', [decodedData.id], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
      


        req.admin = results[0];
            res.app.locals.admin =  req.admin;
        res.app.locals.loggeduser = req.admin;    

        next();


       
      
}


//Authenticate Admin 

const authorizeRoles = (...roles) =>{
        
    return (req,res,next)=>{
       
        if(!roles.includes(req.admin.role) ){
               // res.json("User not allowed to do this ")
                res.render('login1',{'output':'Your Role is not permitted to Login here !'})  
        }
        else
        {
            next()
        }
    }

}


export {isAuthenticatedAdmin }
