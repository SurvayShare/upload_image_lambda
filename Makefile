pack:
		zip -r package.zip .

deploy:
		aws lambda update-function-code --function-name UploadPictureToS3 --zip-file fileb://package.zip