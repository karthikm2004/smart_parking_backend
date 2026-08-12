const express = require('express')
const JWT = require('../Middlewares/jwtMiddleware')
const multer = require('../Middlewares/multerMiddleware')

const userController = require('../Controllers/userController')
const parkingController = require('../Controllers/addParkingController')
const bookingController = require('../Controllers/bookingController')
const paymentController = require("../Controllers/razorpayPaymentController");

const router = express.Router()


// console.log("JWT:", typeof JWT);
// console.log("Multer:", typeof multer.single);
// console.log("addParking:", typeof parkingController.addParking);

router.post('/signup', userController.signup)
router.post('/signin', userController.signin)

// owner
router.post('/add-parking', JWT, multer.single('uploadImg'), parkingController.addParking)
router.get('/owner-parkings', JWT, parkingController.getOwnerParkings)

// admin
router.get('/all-parkings', JWT, parkingController.getAllParkings)
router.put('/update-approval/:id', JWT, parkingController.updateApprovalStatus)
router.delete('/delete-parking/:id', JWT, parkingController.deleteParking)

// user
router.get('/approved-parkings', JWT, parkingController.getApprovedParkings)
router.get('/parking-details/:id', JWT, parkingController.getSingleParking)
router.post('/create-booking', JWT, bookingController.createBooking)
router.get('/user-bookings', JWT, bookingController.getUserBookings)
router.get('/user-profile', JWT, userController.getProfile)
router.put('/cancel-booking/:bookingId', JWT, bookingController.cancelBooking)
router.get('/parking-bookings/:parkingId', JWT, bookingController.getParkingBookings)
router.put('/user-profile-update',JWT,userController.updateProfile)
router.put('/user-password-update',JWT,userController.updatePassword)
router.post("/create-payment-order",JWT,paymentController.createOrder);

// owner/admin slot block
router.post('/toggle-block-slot/:parkingId', JWT, bookingController.toggleBlockSlot)


module.exports = router
