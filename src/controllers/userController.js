const util = require('util');
const uuidv4 = require('uuid/v4'); 
const getEmailParts = require('../util').getEmailParts

exports.register = async (req, res) => {
  const email = getEmailParts(req.body.email || '');
  if (!email.isValid) {
    return res.status(400).json({
      Error: `Invalid email: ${req.body.email}`
    })
  }

  const db = req.app.db;
  const Company = db.models.Company;
  const User = db.models.User;
  const Token = db.models.Token;

  try {
    const company = await Company.findByName(req.params.company);
    if (!company) {
      return res.status(404).json({
        Error: `Unable to find company: ${req.params.company}`
      })
    }

    console.log(company.domain);
    if (company.domain.indexOf(email.domain)!=-1) {
      return res.status(400).json({
        Error: `Invalid domain: ${email.domain} for company ${req.params.company}`
      })
    }

    const user = await User.findByEmail(email.address)
    if (user) {
      return res.status(409).json({
        Error: `User: ${email.accountname} is already registered.`
      })
    }

    const token = await Token.create({
      token: uuidv4(), 
      email: email.address, 
      returnUrl:'http://example.com', 
      state:{data:'xyz'}
    });
    
    const data ={
      to:email.address,
      token:token.token,
      companyUrl:`${req.protocol}://${req.get('host')}/${email.companyname}`,
      appName:'m360'
    }
    const emailContent = require('../emails/templates/verify').confirm(data)
    emailContent.from=process.env.MAIL_USER;

    await req.app.mailer.sendMail(emailContent)

    return res.sendStatus(200);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      Error: 'Unexpected error on the server.'
    });
  }
}

exports.verify = async (req, res) => {
  const token = (req.body.token||'').trim().toLowerCase();
  const email = (req.body.email||'').trim().toLowerCase();

  if (token==='' || email==='') {
    return res.status(400).json({
      Error: "Expects a valid email and token in the body"
    })
  }

  const db = req.app.db;
  const User = db.models.User;
  const Token = db.models.Token;

  try {
    const trecord = await Token.findOne({token})

    if (!trecord) {
      return res.status(400).json({
        Error: `Invalid token or email`
      })
    }

    if (trecord.email!== email) {
      return res.status(400).json({
        Error: `Invalid token or email`
      }) 
    }

    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(400).json({
        Error: `Invalid token or email`
      }) 
    }

    user.isVerified = true;
    
    await user.save()
    
    return res.sendStatus(200);

  } catch(err) {

  }
}
