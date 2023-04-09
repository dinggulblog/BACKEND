import AWS from 'aws-sdk';
import striptags from 'striptags';

const ses = new AWS.SES({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export const sendMail = ({ to, subject, body, from = 'Dinggul <support@dinggul.me>'}) => {
  return new Promise((resolve, reject) => {
    const params = {
      Destination: {
        ToAddresses: (() => {
          return typeof to === 'string' ? [to] : to;
        })()
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: body
          },
          Text: {
            Charset: 'UTF-8',
            Data: striptags(body)
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject
        }
      },
      Source: from
    };

    ses.sendEmail(params, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};
