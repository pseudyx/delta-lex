require('dotenv').config();

const appconfig = {
    "aws_iam_key": process.env['REACT_APP_AWS_IAM_KEY'],
    "aws_iam_secret": process.env['REACT_APP_AWS_IAM_SECRET'],
    "aws_region": process.env['REACT_APP_AWS_REGION'],
    "language_code": process.env['REACT_APP_LANGUAGE_CODE'],
    "rappid_api_host": process.env['REACT_APP_RAPIDAPI_HOST'],
    "rappid_api_key": process.env['REACT_APP_RAPIDAPI_KEY'],
};


export default appconfig;