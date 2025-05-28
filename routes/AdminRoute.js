import express from 'express'

import { isAuthenticatedAdmin} from '../middleware/Adminauth.js' ;

import upload from '../middleware/upload.js'



import {login ,homePage,logout,profile,addUser,viewUser,addDriver,viewDriver
    ,addVehicleType,viewVehicleType,driverRide,rideHistory,
    userRide,addComission,viewCommission,loginAdmin,
    ForgotPassword,
    sendOTP,
    verifyOTP,
    resetpassword,
    
    profilePost,
    changepass,
    add_terms_condition,
    add_privacy_policy,
    add_terms_conditionPost,
    add_privacy_policyPost,
    deletePrivacyPolicy,
    deleteTerms,
    faqs,
    add_faqPost,
    deleteFaq,
    addFaq,
    editFaq,
    two_step_verification,
    two_step_verificationPost,
    on_off_multifactor
} from '../controllers/adminController.js'



const router = express.Router(); 



//------------- Routing Start -----------------------

router.route('/').get(isAuthenticatedAdmin,homePage)

router.route('/login').get(login)
router.route('/login').post(loginAdmin)


router.route('/logout').get(logout)
router.route('/logout').post(logout)
router.route('/profile').get(isAuthenticatedAdmin,profile)



router.route('/profile').post(isAuthenticatedAdmin,upload.single('image'),profilePost)



router.route('/changepass').post(isAuthenticatedAdmin,changepass)




//------------------------- Forgot Reset Password ----------------
router.route('/ForgotPassword').get(ForgotPassword)

router.route('/sendOTP').post(sendOTP)

router.route('/verify-otp').post(verifyOTP)


router.route('/reset-password').post(resetpassword)



router.route('/addUser').get(isAuthenticatedAdmin,upload.single('profile_pic'),addUser)

router.route('/viewUser').get(isAuthenticatedAdmin,viewUser)

router.route('/addDriver').get(isAuthenticatedAdmin,addDriver)
router.route('/viewDriver').get(isAuthenticatedAdmin,viewDriver)

router.route('/addVehicleType').get(isAuthenticatedAdmin,addVehicleType)
router.route('/viewVehicleType').get(isAuthenticatedAdmin,viewVehicleType)
router.route('/driverRide').get(isAuthenticatedAdmin,driverRide)
router.route('/rideHistory').get(isAuthenticatedAdmin,rideHistory)

router.route('/userRide').get(isAuthenticatedAdmin,userRide)
router.route('/addComission').get(isAuthenticatedAdmin,addComission)
router.route('/viewCommission').get(isAuthenticatedAdmin,viewCommission)



router.route('/addFaq').get(isAuthenticatedAdmin,addFaq)
router.route('/editFaq').get(isAuthenticatedAdmin,editFaq)
router.route('/faqs').get(isAuthenticatedAdmin,faqs)
router.route('/addFaq').post(isAuthenticatedAdmin,add_faqPost)
router.route('/deleteFaq').post(isAuthenticatedAdmin,deleteFaq)




router.route('/add_terms_condition').get(isAuthenticatedAdmin,add_terms_condition)
router.route('/add_terms_condition').post(isAuthenticatedAdmin,add_terms_conditionPost)
router.route('/deleteTerms').post(isAuthenticatedAdmin,deleteTerms)




router.route('/add_privacy_policy').get(isAuthenticatedAdmin,add_privacy_policy)
router.route('/add_privacy_policy').post(isAuthenticatedAdmin,add_privacy_policyPost)
router.route('/deletePrivacyPolicy').post(isAuthenticatedAdmin,deletePrivacyPolicy)



router.route('/two_step_verification').get(two_step_verification)
router.route('/two_step_verification').post( two_step_verificationPost);

router.route('/on_off_multifactor').post( on_off_multifactor);





export default router