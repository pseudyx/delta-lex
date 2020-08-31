require('dotenv').config();

const deltaconfig = {
    "aws_iam_key": process.env['REACT_APP_AWS_IAM_KEY'],
    "aws_iam_secret": process.env['REACT_APP_AWS_IAM_SECRET'],
    "aws_region": process.env['REACT_APP_AWS_REGION'],
    "language_code": process.env['REACT_APP_LANGUAGE_CODE']
};


export default deltaconfig;