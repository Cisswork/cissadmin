
import connection from "../config.js";
import * as path from 'path';
import * as url from 'url';
import ejs from "ejs";
import {sendTokenAdmin} from "../utils/jwtToken.js";
import nodemailer from 'nodemailer';
import { comparePassword, hashPassword } from "../middleware/helper.js";
import { error } from "console";
import jwt from 'jsonwebtoken';
const homePage = async(req,res,next)=>{    

    //res.redirect('/admin')

    res.render('admin/index')




}


const login = async(req,res,next)=>{    

    //res.redirect('/admin')

    res.render('admin/login')


}


const loginAdmin = async (req, res, next) => {
    try {
      const con = await connection();
      const { email, password } = req.body;
      console.log("req.body--->", req.body);
  
      if (!email || !password) {
        return res.render('admin/login', { output: 'Please Enter email and Password' });
      }
  
      // Run query using callback-based mysql, wrapped in Promise
      const results = await new Promise((resolve, reject) => {
        con.query('SELECT * FROM tbl_admin WHERE email = ?', [email], (err, results) => {
          con.release(); // Don't forget to release the connection
          if (err) return reject(err);
          resolve(results);
        });
      });
  
      const admin = results[0];
  
      if (!admin) {
        return res.render('admin/login', { output: 'Invalid email' });
      }
  
     // const isValid = password == admin.password

          const isValid = comparePassword(password, admin.password);
  
      if (!isValid) {
        return res.render('admin/login', { output: 'Incorrect Password' });
      }
  
      // Login success
      sendTokenAdmin(admin, 200, res);
  
    } catch (error) {
      console.error('Error during login:', error);
      res.render('admin/login', { output: 'An error occurred. Please try again later.' });
    }
  };




const two_step_verification = async (req, res) => {
  const con = await connection(); // make sure to open connection

  try {

      const email = req.cookies.admin_email;
   const otp = Math.floor(100000 + Math.random() * 900000);
    const currentTime = new Date();
    const expiryTime = new Date(currentTime.getTime() + 10 * 60 * 1000); // 10 mins

    console.log('Otp --> ',otp)




     con.query('SELECT * FROM tbl_otp WHERE email = ?', [email], (err, otpResults) => {
      if (err) {
        console.error("DB Error:", err);
        con.release();
        return res.render('admin/login', {        
          output: 'Internal Server Error!',
        });
      }

      const query = otpResults.length === 0
        ? 'INSERT INTO tbl_otp (email, otp_code, expire_at) VALUES (?, ?, ?)'
        : 'UPDATE tbl_otp SET otp_code = ?, expire_at = ? WHERE email = ?';

      const values = otpResults.length === 0
        ? [email, otp, expiryTime]
        : [otp, expiryTime, email];

      con.query(query, values, async (err, result) => {
        if (err) {
          console.error("DB Error:", err);
          con.release();
          return res.render('admin/login', {           
            output: 'Internal Server Error!',
          });
        }

        // Send OTP email using nodemailer
        try {
          const SMTP_USER = 'vasu@myambergroup.com';
          const SMTP_PASSWORD = 'ivgkngctudyohjiy';

          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
              user: SMTP_USER,
              pass: SMTP_PASSWORD,
            },
             tls: {
                rejectUnauthorized: false, // Skip validation for now
              },
            logger: true,
            debug: true,
          });

          const mailOptions = {
            from: SMTP_USER,
            to: email,
            subject: 'Two Step Verification Code',
            text: `Your OTP code is: ${otp}`,
          };

          await transporter.sendMail(mailOptions);
          console.log('OTP email sent successfully to', email);

          res.render('admin/two_step_verification', {        

            output: 'We Have Sent You An OTP Code successfully. Please Check Your Email.',
          
          });

        } catch (mailErr) {
          console.error('Error sending email via Nodemailer:', mailErr);
             throw mailErr;
        } 
      });
    });
   

  } catch (error) {
    console.error('Error :', error);
    return res.render('admin/login', { output: 'Internal Server Error!' });
  } finally {
    con.release();
  }
};
  
  
  
const two_step_verificationPost = async (req, res, next) => {
  const con = await connection();
  const { otp } = req.body;
  const { Pending_token } = req.cookies;

  console.log(req.body);
  console.log("Pending_token", Pending_token);

  try {
    if (!otp || !Pending_token) {
      return res.render('admin/two_step_verification', { output: 'OTP and token are required!' });
    }

    const decoded = jwt.verify(Pending_token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Get admin email
    const emailResults = await new Promise((resolve, reject) => {
      con.query('SELECT email FROM tbl_admin WHERE id = ?', [decoded.id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    const email = emailResults[0].email;
    console.log("email email emailll ->", email);

    // Get OTP entry
    const otpResults = await new Promise((resolve, reject) => {
      con.query('SELECT * FROM tbl_otp WHERE email = ?', [email], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    console.log(otpResults);

    const storedOTP = otpResults[0].otp_code;
    const expiryTime = new Date(otpResults[0].expire_at);

    if (otp == storedOTP && new Date() < expiryTime) {
      const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
      };

      return res.status(200).cookie('token', Pending_token, options).redirect('/admin');
    } else {
      return res.render('admin/two_step_verification', { output: 'Invalid OTP. Please try again' });
    }

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.render('admin/two_step_verification', { output: error.message || 'Something went wrong' });
  } finally {
    con.release();
  }
};

  


  const logout = async(req,res,next)=>{    
     
    try {
  

      req.admin = null;
  
  
    res.cookie("token","",{
      expires : new Date(Date.now()),
      httpOnly:true,
      secure: process.env.NODE_ENV === 'production',  // Set this to true in production to ensure cookies are sent only over HTTPS
      sameSite: 'Strict' 
  })
  
  res.render('admin/login',{'output':'Logged Out !!'}) 
  }
   catch (error) {
    console.error('Logout error: ', error);
    res.render('admin/login', { 'output': 'Internal Server Error!' });
  } 
  };
    
  

const profile=async(req,res)=>{

  console.log(req.admin)
  const output = req.cookies.kil_msg || '';

    
    try{
         res.render('admin/profile',{output:output, admin:req.admin})

    }
    catch(error){
        console.log(error)
        return res.render('admin/kil500',{output:'Internal Server Error'}) 
    }

}


const profilePost = async (req, res, next) => {
  const con = await connection(); // This is assumed to return a mysql connection from pool

  console.log(req.body);

  const { firstname, lastname, email, country_code, contact, username } = req.body;
  const image = req.file ? req.file.filename : null;
  const id = req.admin ? req.admin.id : 1;

  try {
    // Begin transaction
    await new Promise((resolve, reject) => {
      con.beginTransaction(err => {
        if (err) return reject(err);
        resolve();
      });
    });

    let updateQuery = `
      UPDATE tbl_admin 
      SET firstname = ?, lastname = ?, email = ?, username = ?, country_code = ?, contact = ?
    `;
    const queryValues = [firstname, lastname, email, username, country_code, contact];

    if (image) {
      updateQuery += `, image = ?`;
      queryValues.push(image);
    }

    updateQuery += ` WHERE id = ?`;
    queryValues.push(id);

    // Execute update query
    await new Promise((resolve, reject) => {
      con.query(updateQuery, queryValues, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    // Commit the transaction
    await new Promise((resolve, reject) => {
      con.commit(err => {
        if (err) return reject(err);
        resolve();
      });
    });

    res.cookie('kil_msg', 'Admin updated successfully!');
    res.redirect('/admin/profile');

  } catch (error) {
    console.error('Error:', error);

    // Rollback transaction on error
    try {
      await new Promise((resolve, reject) => {
        con.rollback(() => resolve()); // rollback never returns error
      });
    } catch (rollbackErr) {
      console.error('Rollback error:', rollbackErr);
    }

    //res.render('admin/kil500', { output: `${error}` });
    res.send(error)

  } finally {
    con.release(); // Always release connection
  }
};


const changepass = async (req, res, next) => {
  const con = await connection();

  try {
    // Begin transaction
    await new Promise((resolve, reject) => {
      con.beginTransaction(err => {
        if (err) return reject(err);
        resolve();
      });
    });

    const existingPass = req.admin.password;
    const email = req.admin.email;
    const { opass, npass, cpass } = req.body;

    const isValid = comparePassword(opass, existingPass);

    if (!isValid) {
      res.cookie('kil_msg', 'Old password is incorrect');
      return res.redirect('/admin/profile');
    }

    if (opass === cpass) {
      res.cookie('kil_msg', 'New password cannot be the same as the old password.');
      return res.redirect('/admin/profile');
    }

    if (npass !== cpass) {
      res.cookie('kil_msg', 'New password and confirm password do not match');
      return res.redirect('/admin/profile');
    }

    const hashedPass = hashPassword(cpass);

    await new Promise((resolve, reject) => {
      con.query(
        'UPDATE tbl_admin SET password = ? WHERE id = ?',
        [hashedPass, req.admin.id],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });

    res.cookie('token', null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    // Optionally send notification here
    // passwordNotify(email);

    await new Promise((resolve, reject) => {
      con.commit(err => {
        if (err) return reject(err);
        resolve();
      });
    });

    res.render('admin/login', { output: 'Password changed successfully' });

  } catch (error) {
    console.error('Error:', error);

    try {
      await new Promise((resolve, reject) => {
        con.rollback(() => resolve()); // rollback never fails
      });
    } catch (rollbackErr) {
      console.error('Rollback Error:', rollbackErr);
    }

    res.cookie('kil_msg', `Failed to update password: ${error}`);
    return res.redirect('/admin/profile');

  } finally {
    con.release(); // Always release the connection
  }
};


const on_off_multifactor = async (req, res, next) => {  
  const con = await connection();
  const { id, status } = req.body;

  try {
    // Start transaction
    await new Promise((resolve, reject) => {
      con.beginTransaction(err => (err ? reject(err) : resolve()));
    });

    // Update the status in the database
    const updateSql = `UPDATE tbl_admin SET two_step_verification = ? WHERE id = ?`;
    await new Promise((resolve, reject) => {
      con.query(updateSql, [status, id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    // Commit transaction
    await new Promise((resolve, reject) => {
      con.commit(err => (err ? reject(err) : resolve()));
    });

    res.json({
      success: true,
      msg: `${status === 'On' ? 'Turning On' : 'Turning Off'} Multi-factor Auth.`,
    });

  } catch (error) {
    // Rollback on error
    await new Promise(resolve => con.rollback(() => resolve()));
    console.error('Error:', error);
    res.status(500).json({ success: false, msg: 'Internal Server Error' });
  } finally {
    con.release();
  }
};




  const ForgotPassword = async(req,res,next)=>{  

          
    try {
     res.render('admin/ForgotPassword', { 
       showForgotPasswordForm: true,
       showVerifyOTPPrompt: false,
       showResetPasswordForm: false,
       "output":""
     });
 
     
    } catch (error) {
       res.json("Internal Server Error ")
    }

}




const sendOTP = async (req, res, next) => {
    const email = req.body.email;
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log("Generated OTP:", otp);
  
    const con = await connection();
  
    const queryAsync = (sql, params) => {
      return new Promise((resolve, reject) => {
        con.query(sql, params, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
    };
  
    try {
      const companyResults = await queryAsync('SELECT * FROM tbl_admin WHERE email = ?', [email]);
      if (companyResults.length === 0) {
        return res.render('admin/ForgotPassword', {
          showForgotPasswordForm: true,
          showVerifyOTPPrompt: false,
          showResetPasswordForm: false,
          output: 'Account with this email does not exist.',
        });
      }
  
      const currentTime = new Date();
      const expiryTime = new Date(currentTime.getTime() + 10 * 60 * 1000); // 10 minutes from now
  
      const otpResults = await queryAsync('SELECT * FROM tbl_otp WHERE email = ?', [email]);
      if (otpResults.length === 0) {
        await queryAsync('INSERT INTO tbl_otp (email, otp_code, expire_at) VALUES (?, ?, ?)', [email, otp, expiryTime]);
      } else {
        await queryAsync('UPDATE tbl_otp SET otp_code = ?, expire_at = ? WHERE email = ?', [otp, expiryTime, email]);
      }
  
      // --- Nodemailer setup and send ---
      try {
        const SMTP_USER = 'vasu@myambergroup.com';
        const SMTP_PASSWORD = 'ivgkngctudyohjiy';
  
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASSWORD,
          },
          logger: true,
          debug: true,
        });
  
        const mailOptions = {
          from: SMTP_USER,
          to: email,
          subject: 'Your MFA OTP Code',
          text: `Your OTP code is: ${otp}`,
        };
  
        await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully to', email);
      } catch (mailErr) {
        console.error('Error sending email via Nodemailer:', mailErr);
        return res.render('admin/ForgotPassword', {
          showForgotPasswordForm: true,
          showVerifyOTPPrompt: false,
          showResetPasswordForm: false,
          output: 'Failed to send OTP email. Please try again later.',
        });
      }
  
      res.render('admin/ForgotPassword', {
        showForgotPasswordForm: false,
        showVerifyOTPPrompt: true,
        showResetPasswordForm: false,
        output: 'OTP sent!',
        email,
        otp,
      });
  
    } catch (error) {
      console.error("Error in sendOTP:", error);
      res.render('admin/ForgotPassword', {
        showForgotPasswordForm: true,
        showVerifyOTPPrompt: false,
        showResetPasswordForm: false,
        output: 'Failed to send OTP. Internal server error',
      });
    } finally {
      con.release();
    }
  };
  


  const verifyOTP = async (req, res, next) => {
    const con = await connection();
    const userOTP = req.body.otp;
    const email = req.body.verifyEmail;
  
    const queryAsync = (sql, params) => {
      return new Promise((resolve, reject) => {
        con.query(sql, params, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
    };
  
    try {
      const results = await queryAsync('SELECT * FROM tbl_otp WHERE email = ?', [email]);
  
      if (!results.length) {
        return res.render('admin/ForgotPassword', {
          showForgotPasswordForm: false,
          showVerifyOTPPrompt: true,
          showResetPasswordForm: false,
          output: 'OTP not found. Please request a new one.',
          email,
        });
      }
  
      const { otp_code: storedOTP, expire_at: expireAt } = results[0];
  
      if (userOTP == storedOTP && new Date() < new Date(expireAt)) {
        console.log("OTP verified");
        res.render('admin/ForgotPassword', {
          showForgotPasswordForm: false,
          showVerifyOTPPrompt: false,
          showResetPasswordForm: true,
          output: '',
          email,
        });
      } else {
        console.log("Incorrect or expired OTP");
        res.render('admin/ForgotPassword', {
          showForgotPasswordForm: false,
          showVerifyOTPPrompt: true,
          showResetPasswordForm: false,
          output: 'Invalid or expired OTP. Please try again.',
          email,
        });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.render('admin/ForgotPassword', {
        showForgotPasswordForm: false,
        showVerifyOTPPrompt: true,
        showResetPasswordForm: false,
        output: 'Failed to verify OTP. Try again.',
        email,
      });
    } finally {
      con.release();
    }
  };
  

  

  const resetpassword = async (req, res, next) => {
    const con = await connection();
    const { resetemail, npass, cpass } = req.body;
  
    const queryAsync = (sql, params) => {
      return new Promise((resolve, reject) => {
        con.query(sql, params, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
    };
  
    try {
      if (npass !== cpass) {
        return res.render('admin/ForgotPassword', {
          showForgotPasswordForm: false,
          showVerifyOTPPrompt: false,
          showResetPasswordForm: true,
          output: "New password and confirm password do not match.",
          email: resetemail,
        });
      }
  
      const newPassword = cpass; // Assuming this is a secure hash function
  
      const passwordHistory = await queryAsync(
        'SELECT id, password FROM tbl_pass_history WHERE email = ? ORDER BY created_at DESC LIMIT 3',
        [resetemail]
      );
  
      const isPasswordUsed = passwordHistory.some(row => row.password === newPassword);
      if (isPasswordUsed) {
        return res.render('admin/ForgotPassword', {
          showForgotPasswordForm: false,
          showVerifyOTPPrompt: false,
          showResetPasswordForm: true,
          output: "New password cannot be one of your last three passwords.",
          email: resetemail,
        });
      }
  
      await queryAsync(
        'UPDATE tbl_admin SET company_password = ? WHERE email = ?',
        [newPassword, resetemail]
      );
  
      if (passwordHistory.length >= 3) {
        const oldest = passwordHistory[passwordHistory.length - 1].id;
        await queryAsync('DELETE FROM tbl_pass_history WHERE id = ?', [oldest]);
      }
  
      await queryAsync(
        'INSERT INTO tbl_pass_history (email, password, created_at) VALUES (?, ?, ?)',
        [resetemail, newPassword, new Date()]
      );
  
      await queryAsync(
        'UPDATE tbl_otp SET otp_code = ?, expire_at = ? WHERE email = ?',
        ['0000', new Date(), resetemail]
      );
  
      res.render('login', { output: 'Password reset success!' });
  
    } catch (error) {
      console.error("Error resetting password:", error);
      res.render('admin/ForgotPassword', {
        showForgotPasswordForm: true,
        showVerifyOTPPrompt: false,
        showResetPasswordForm: false,
        output: "Failed to reset password. Please try again.",
      });
    } finally {
      con.release();
    }
  };
  
  

  

const addUser=async(req,res)=>{

    
    try{
         res.render('admin/addUser',{output:''})

    }
    catch(error){
        console.log(error)
        return res.render('admin/kil500',{output:'Internal Server Error'}) 
    }

}

const viewUser=async(req,res)=>{

    
    try{
         res.render('admin/viewUser',{output:''})

    }
    catch(error){
        console.log(error)
        return res.render('admin/kil500',{output:'Internal Server Error'}) 
    }

}

const addDriver=async(req,res)=>{

    
    try{
         res.render('admin/addDriver',{output:''})

    }
    catch(error){
        console.log(error)
        return res.render('admin/kil500',{output:'Internal Server Error'}) 
    }

}

const viewDriver=async(req,res)=>{

    
    try{
         res.render('admin/viewDriver',{output:''})

    }
    catch(error){
        console.log(error)
        return res.render('admin/kil500',{output:'Internal Server Error'}) 
    }

}

const addVehicleType=async(req,res)=>{

    
    try{
        res.render('admin/kil400',{output:'Create Page First ( No Page found)'})

    }
    catch(error){
        console.log(error)
        return res.render('admin/kil500',{output:'Internal Server Error'}) 
    }

}


const viewVehicleType=async(req,res)=>{

    
    res.render('admin/kil400',{output:'Create Page First ( No Page found)'})

}


const driverRide=async(req,res)=>{

    
    res.render('admin/driverRide',{output:''})

}

const rideHistory=async(req,res)=>{

    
    res.render('admin/rideHistory',{output:''})

}



const userRide=async(req,res)=>{

    res.render('admin/userRide',{output:''})

}


const addComission=async(req,res)=>{

    
    res.render('admin/addComission',{output:''})

}



const viewCommission=async(req,res)=>{

    
   res.render('admin/kil400',{output:'Create Page First ( No Page found)'})

}


const addFaq=async(req,res)=>{

    
    try{
         res.render('admin/addFaq',{output:''})

    }
    catch(error){
        console.log(error)
        return res.render('admin/kil500',{output:'Internal Server Error'}) 
    }

}


const editFaq = async (req, res) => {
  const con = await connection();
  const faq_id = req.cookies.faq_id;

  try {
    const faq = await new Promise((resolve, reject) => {
      con.query('SELECT * FROM tbl_faqs WHERE faq_id = ?', [faq_id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });

    if (!faq) {
      return res.render('admin/kil500', { output: 'FAQ not found' });
    }

    res.render('admin/editFaq', { output: '', faq });

  } catch (error) {
    console.error('Error:', error);
    res.render('admin/kil500', { output: 'Internal Server Error' });
  } finally {
    con.release();
  }
};









const faqs = async (req, res, next) => {
  const con = await connection();
  const output = req.cookies.kil_msg || '';

  try {
    await new Promise((resolve, reject) => {
      con.beginTransaction(err => err ? reject(err) : resolve());
    });

    var faqs = await new Promise((resolve, reject) => {
      con.query("SELECT * FROM tbl_faqs WHERE faq_type = 'User' ORDER BY faq_id DESC", (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    await new Promise((resolve, reject) => {
      con.commit(err => err ? reject(err) : resolve());
    });

    if(faqs.length ==0 ){
      faqs =[]
    }

    res.render('admin/faqs', { output, faqs });

  } catch (error) {
    console.error('Error:', error);
    await new Promise(resolve => con.rollback(() => resolve()));
    res.render('admin/kil500', { output: `${error}` });
  } finally {
    con.release();
  }
};

const add_faqPost = async (req, res, next) => {
  const con = await connection();
  let output;

  try {
    const { faq, answer, faq_id } = req.body;
    const action = faq_id ? 'Updated' : 'Added';
    const faq_type ='User'

    if (faq_id) {
      await new Promise((resolve, reject) => {
        con.query('UPDATE tbl_faqs SET faq = ?, answer = ? WHERE faq_id = ?', [faq, answer, faq_id], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
    } else {
      await new Promise((resolve, reject) => {
        con.query('INSERT INTO tbl_faqs (faq, answer, faq_type) VALUES (?, ?, ?)', [faq, answer, faq_type], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
    }

    output = `${faq_type} FAQ ${action} successfully!`;
    res.cookie('kil_msg', output);

    return res.redirect(faq_type === 'Driver' ? '/admin/faqs' : '/admin/faqs');

  } catch (error) {
    await new Promise(resolve => con.rollback(() => resolve()));
    console.error('Error:', error);
    res.render('admin/kil500', { output: `${error}` });
  } finally {
    con.release();
  }
};


const deleteFaq = async (req, res, next) => {
  const con = await connection();
  const { faq_id } = req.body;

  console.log('deleteing -> ',faq_id)

  try {
    await new Promise((resolve, reject) => {
      con.beginTransaction(err => err ? reject(err) : resolve());
    });

    await new Promise((resolve, reject) => {
      con.query('DELETE FROM tbl_faqs WHERE faq_id = ?', [faq_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    await new Promise((resolve, reject) => {
      con.commit(err => err ? reject(err) : resolve());
    });

    res.json({ success: true, msg: 'FAQ deleted successfully!' });

  } catch (error) {
    await new Promise(resolve => con.rollback(() => resolve()));
    console.error('Error:', error);
    res.status(500).json({ success: false, msg: 'Internal Server Error' });
  } finally {
    con.release();
  }
};







const add_terms_condition = async (req, res, next) => {
  const con = await connection();
  const output = req.cookies.kil_msg || '';

  try {
    await new Promise((resolve, reject) => {
      con.beginTransaction(err => (err ? reject(err) : resolve()));
    });

    const [terms] = await new Promise((resolve, reject) => {
      con.query("SELECT * FROM tbl_tandc WHERE tandc_type = 'User' ORDER BY id DESC", (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    
    await new Promise((resolve, reject) => {
      con.commit(err => (err ? reject(err) : resolve()));
    });


    console.log('Terms --> ', terms)
    res.render('admin/add_terms_condition', { output, terms });

  } catch (error) {
    console.error('Error:', error);
    await new Promise(resolve => con.rollback(() => resolve()));
    res.render('admin/kil500', { output: `${error}` });
  } finally {
    con.release();
  }
};


const add_terms_conditionPost = async (req, res, next) => {
  const con = await connection();
  let output;

  try {
    const { terms, tandc_type } = req.body;
    const termsContent = decodeURIComponent(terms);
    const termType = tandc_type;
    let action;

    const result = await new Promise((resolve, reject) => {
      con.query('SELECT * FROM tbl_tandc WHERE tandc_type = ?', [termType], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (result.length > 0) {
      action = 'Updated';
      await new Promise((resolve, reject) => {
        con.query('UPDATE tbl_tandc SET terms = ? WHERE tandc_type = ?', [termsContent, termType], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
    } else {
      action = 'Added';
      await new Promise((resolve, reject) => {
        con.query('INSERT INTO tbl_tandc (terms, tandc_type) VALUES (?, ?)', [termsContent, termType], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
    }

    let tandc;
    if (termType === 'Driver') {
      tandc = await new Promise((resolve, reject) => {
        con.query("SELECT * FROM tbl_tandc WHERE tandc_type = 'Driver' ORDER BY id DESC", (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
      output = `${termType} Terms & Conditons ${action} successfully !!`;
      res.cookie('kil_msg', output);
      res.redirect('/admin/add_terms_condition');
    } else {
      tandc = await new Promise((resolve, reject) => {
        con.query("SELECT * FROM tbl_tandc WHERE tandc_type = 'User' ORDER BY id DESC", (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
      output = `${termType} Terms & Conditons ${action} successfully !!`;
      res.cookie('kil_msg', output);
      res.redirect('/admin/add_terms_condition');
    }

  } catch (error) {
    await new Promise(resolve => con.rollback(() => resolve()));
    res.render('admin/kil500', { output: `${error}` });
  } finally {
    con.release();
  }
};



const deleteTerms = async (req, res, next) => {
  const con = await connection();
  const { term_id } = req.body;

  try {
    await new Promise((resolve, reject) => {
      con.beginTransaction(err => (err ? reject(err) : resolve()));
    });

    await new Promise((resolve, reject) => {
      con.query('DELETE FROM tbl_tandc WHERE id = ?', [term_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    await new Promise((resolve, reject) => {
      con.commit(err => (err ? reject(err) : resolve()));
    });

    res.json({ success: true, msg: 'Terms Condition deleted successfully !!' });

  } catch (error) {
    await new Promise(resolve => con.rollback(() => resolve()));
    console.error('Error:', error);
    res.status(500).json({ success: false, msg: 'Internal Server Error' });
  } finally {
    con.release();
  }
};


const add_privacy_policy = async (req, res, next) => {
  const con = await connection();
  const output = req.cookies.kil_msg || '';

  try {
    await new Promise((resolve, reject) => {
      con.beginTransaction(err => (err ? reject(err) : resolve()));
    });



    const [pandps] = await new Promise((resolve, reject) => {
      con.query("SELECT * FROM tbl_pandp WHERE policy_type = 'User' ORDER BY id DESC", (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
    console.log('pandps --> ', pandps)

    await new Promise((resolve, reject) => {
      con.commit(err => (err ? reject(err) : resolve()));
    });

    res.render('admin/add_privacy_policy', { output, pandps });

  } catch (error) {
    console.error('Error:', error);
    await new Promise(resolve => con.rollback(() => resolve()));
    res.render('admin/kil500', { output: `${error}` });
  } finally {
    con.release();
  }
};


const add_privacy_policyPost = async (req, res, next) => {
  const con = await connection();
  let output;

  try {
    const { privacy_policy, policy_type } = req.body;
    const policyContent = decodeURIComponent(privacy_policy);
    const policyType = policy_type;
    let action;

    const result = await new Promise((resolve, reject) => {
      con.query('SELECT * FROM tbl_pandp WHERE policy_type = ?', [policyType], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (result.length > 0) {
      action = 'Updated';
      await new Promise((resolve, reject) => {
        con.query('UPDATE tbl_pandp SET privacy = ? WHERE policy_type = ?', [policyContent, policyType], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
    } else {
      action = 'Added';
      await new Promise((resolve, reject) => {
        con.query('INSERT INTO tbl_pandp (privacy, policy_type) VALUES (?, ?)', [policyContent, policyType], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
    }

    const queryStr = policyType === 'Driver'
      ? "SELECT * FROM tbl_pandp WHERE policy_type = 'Driver' ORDER BY id DESC"
      : "SELECT * FROM tbl_pandp WHERE policy_type = 'User' ORDER BY id DESC";

    const pandps = await new Promise((resolve, reject) => {
      con.query(queryStr, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    output = `${policyType} Privacy Policy ${action} successfully !!`;
    res.cookie('kil_msg', output);

    return res.redirect(policyType === 'Driver'
      ? '/admin/add_privacy_policy'
      : '/admin/add_privacy_policy');

  } catch (error) {
    await new Promise(resolve => con.rollback(() => resolve()));
    res.render('admin/kil500', { output: `${error}` });
  } finally {
    con.release();
  }
};



const deletePrivacyPolicy = async (req, res, next) => {
  const con = await connection();
  const { privacy_id } = req.body;

  try {
    await new Promise((resolve, reject) => {
      con.beginTransaction(err => (err ? reject(err) : resolve()));
    });

    await new Promise((resolve, reject) => {
      con.query('DELETE FROM tbl_pandp WHERE id = ?', [privacy_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    await new Promise((resolve, reject) => {
      con.commit(err => (err ? reject(err) : resolve()));
    });

    res.json({ success: true, msg: 'Privacy Policy deleted successfully !!' });

  } catch (error) {
    await new Promise(resolve => con.rollback(() => resolve()));
    console.error('Error:', error);
    res.status(500).json({ success: false, msg: 'Internal Server Error' });
  } finally {
    con.release();
  }
};







export { homePage ,login,logout,profile,addUser,viewUser,addDriver,viewDriver,addVehicleType,viewVehicleType,driverRide,
    rideHistory,userRide,addComission,viewCommission,faqs, add_faqPost,deleteFaq, loginAdmin , 
    ForgotPassword,sendOTP,verifyOTP,resetpassword , profilePost ,changepass,add_terms_condition,add_terms_conditionPost,deleteTerms,add_privacy_policy,add_privacy_policyPost,deletePrivacyPolicy,
    addFaq,editFaq,two_step_verification,two_step_verificationPost ,on_off_multifactor
}