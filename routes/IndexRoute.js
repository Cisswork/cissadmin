import express from 'express'

import { isAuthenticatedAdmin} from '../middleware/Adminauth.js' ;

import { homePage } from '../controllers/indexController.js';

const router = express.Router(); 



//------------- Routing Start -----------------------

router.route('/').get(isAuthenticatedAdmin,homePage)



export default router