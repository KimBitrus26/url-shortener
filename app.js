const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const indexRouter = require("./src/routes/index");

const app = express();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use('/api', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.status(404).send({ code: 404, message: 'Not found' });
});

// error handler
app.use(function(err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send({ code: res.status, message: err.message });
});


module.exports = app;
