const AWS = require("aws-sdk");

AWS.config.update({
    region: process.env.AWS_SES_REGION,
    accessKeyId: process.env.AWS_ACCESSKEY_ID,
    secretAccessKey: process.env.AWS_SECRETKEY,
  });

const ses = new AWS.SES(); 

const params = {
  "Template": {
    "TemplateName": "AppCreationNotificationToAdmin",
    "SubjectPart": "Application Creation Notification",
    "HtmlPart": "<h1>Hello {{name}},</h1><p>An application {{appName}} has been created. Please Click here {{link}} to check the details.</p>",
    "TextPart": ""
  }
}

ses.createTemplate(params, (err, data) =>  {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});