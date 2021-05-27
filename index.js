const Multipart = require("lambda-multipart");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  const { fields, files } = await parseMultipartFormData(event);

  if (files == null || files.length == 0) {
    // no file found in http request
    return {
      statusCode: 200
    };
  }

  const result = await Promise.all(
    files.map(async file => {
      return await uploadFileIntoS3(file);
    })
  );

  return {
    statusCode: 201,
    body: JSON.stringify(result)
  };
};

const parseMultipartFormData = async event => {
  return new Promise((resolve, reject) => {
    const parser = new Multipart(event);

    parser.on("finish", result => {
      resolve({ fields: result.fields, files: result.files });
    });

    parser.on("error", error => {
      return reject(error);
    });
  });
};

const uploadFileIntoS3 = async file => {
  const options = {
    Bucket: process.env.file_s3_bucket_name,
    Key: uuidv4(),
    Body: file
  };

  try {
    await s3.upload(options).promise();
    console.log(
      `File uploaded into S3 bucket: "${
        process.env.file_s3_bucket_name
      }"`
    );
    const url = `https://${options.Bucket}.s3.amazonaws.com/${options.Key}`
    return {"url": url};
  } catch (err) {
    console.error(err);
    throw err;
  }
};