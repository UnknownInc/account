
exports.getEmailParts = function(emailAddress) {

  let isValid = false;
  const email = emailAddress.toLowerCase();
  let accountname, companyname, domain;

  let i=email.indexOf('@');
  if (i>0){
    accountname = email.substr(0,i).trim();
    domain = email.substr(i+1).trim();

    i=domain.indexOf('.');
    if (i>0) {
      companyname=domain.substr(0,i);
      isValid=true;
    } else {
      isValid=false;
    }
  }
  return {
    isValid,
    address: email,
    accountname,
    companyname,
    domain
  }
}
