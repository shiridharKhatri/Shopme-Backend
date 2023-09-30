const connectToServer = require("./database");
const express = require('express');
const app = express();
const cors = require('cors')
const port = process.env.PORT || 5000;
connectToServer();
app.use(cors())
app.use(express.json());
app.use('/auth', require("./routes/user"))
app.use('/adminAuth', require('./routes/admin'))
app.use('/api', require('./routes/products'))
app.use("/images", express.static("./profile-picture"));
app.use("/api/help", require('./routes/help'))
app.use("/ProductImages", express.static("./productImage"));
app.listen(port, ()=>{
    console.log(`Connected to port ${port}`)
});
