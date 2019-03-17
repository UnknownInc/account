const fs = require('fs');
const nodemailer = require("nodemailer");
const util = require('util');

module.exports = {
  createClient: function(app) {
    
    app.status = app.status || {};
    app.status.mailer = app.status.mailer || {};

    if (app.mailer) {
      return app.mailer;
    }

    // The credentials for the email account you want to send mail from. 
    const credentials = {
      service:"gmail",
      auth: {
        // These environment variables will be pulled from the env
        user: (process.env.MAIL_USER || '').trim(), 
        pass: (process.env.MAIL_PASS || '').trim()  
      }
    }

    // Getting Nodemailer all setup with the credentials for when the 'sendEmail()'
    // function is called.
    app.mailer = nodemailer.createTransport(credentials)

    return app.mailer;
  },
}
