pack:
		git archive HEAD -o package.zip

deploy:
		aws lambda update-function-code --function-name UploadPictureToS3 --zip-file fileb://package.zip