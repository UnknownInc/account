module.exports = {
  confirm: data => ({
    to:data.to,
    subject: `Confirm Email - ${data.appName}`,
    html: `
      <a href='${data.companyUrl}/verify/${data.token}'>
        click to confirm email
      </a>
      <p>this emal is intended for recepient ${data.to}
    `,      
    text: `Copy and paste this link: ${data.companyUrl}/verify/${data.token}`
  })
}
