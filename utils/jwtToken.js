
import jwt from 'jsonwebtoken';
import connection from '../config.js';

const con = await connection();



const sendTokenAdmin = async (admin, statusCode, res)=>{

    const token =  getJWTToken(admin.id); 
  const con = await connection();

    //options for tokens  
        const options = {
            expires: new Date(
                Date.now() + process.env.COOKIE_EXPIRE*24*60*60*1000
            ), 
            httpOnly:true
        } 
        
        





        // Check for existing sessions
const existingSessions1 = await new Promise((resolve, reject) => {
  con.query('SELECT * FROM active_tokens_admin WHERE admin_id = ?', [admin.id], (err, results) => {
    if (err) return reject(err);
    resolve(results);
  });
});

// If there are existing sessions, invalidate them
if (existingSessions1.length > 0) {
  await new Promise((resolve, reject) => {
    con.query('DELETE FROM active_tokens_admin WHERE admin_id = ?', [admin.id], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// Store new session
await new Promise((resolve, reject) => {
  con.query(
    'INSERT INTO active_tokens_admin (admin_id, token) VALUES (?, ?)',
    [admin.id, token],
    (err) => {
      if (err) return reject(err);
      resolve();
    }
  );
});


  if(admin.two_step_verification == 'On'){
    
       res
  .cookie('Pending_token', token)
  .cookie('Pending_token_option', options)
  .cookie('admin_email', admin.email) // <-- Set admin ID in cookie
  .redirect('/admin/two_step_verification');

   }else{  
        
    res.status(statusCode).cookie('token',token,options).redirect('/admin') 
   }



    

    //    if (req.headers['user-agent'].includes('Mozilla')) {
    //     res.status(statusCode).cookie('token',token,options).redirect('/') 
        
    // }else {     

    //     res.status(statusCode).cookie('token',token,options).json({message: 'API loaded successfully with token'})
    //   }
    
       
}





// Creating Token and saving in Cookie for user 
const sendTokenUser = (user, statusCode, res)=>{

    
    const token =  getJWTToken(user.id); 

    //options for tokens  
        const options = {
            expires: new Date(
                Date.now() + process.env.COOKIE_EXPIRE*24*60*60*1000
            ), 
            httpOnly:true
        }                 
        //res.redirect('/user/home/')
      
       res.status(statusCode).cookie('token',token,options).json({ result: "success","user_id":user.id,"JWT":token});   
    
       
}

function getJWTToken(id){ 
   
    return jwt.sign({id:id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE
    })
}



export {sendTokenUser , sendTokenAdmin  }