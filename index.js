require('dotenv').config()
require('./Connection/connection')
const router=require('./Router/router')
const path = require("path");

const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())
app.use(router)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 3000


app.listen(PORT, (erorr) => {
    if (erorr) {
        console.log(erorr);
    } else {
        console.log(`Server Running at ${PORT}`);
    }

})