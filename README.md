# Backend Server
Dinggul Blog API Server with Express.js &amp; MongoDB
<br><br>
## Web Application Architecture
<img src="https://user-images.githubusercontent.com/56054637/230785846-035d41a7-fedd-4f46-846b-2937bb65a380.png" width="70%" height="50%">

## Postman API Document Link (Local)
<[https://documenter.getpostman.com/view/15146904/2s8YzRxhtC](https://documenter.getpostman.com/view/15146904/2s8Z6x3ZL9)>
<br><br>
## Blog Preview Link
<https://dinggul.me>
<br><br>
## Basic Features
+ Manage posts and media
+ Categorize posts
+ Various post viewing
+ Member Roles
+ Markdown Editor
+ Content moderation
+ User Profile moderation
+ Amazon S3 integration
+ Statistics like pageviews via Google Analystics(incomplete)
and more...
<br><br>
## Installaion
Frontend repository: <https://github.com/dinggulblog/FRONTEND> <br>

1. Download this repo and frontend repo together.<br>
The backend folder and the frontend folder must be located on the same path like below.<br>
![How to locate folders](https://user-images.githubusercontent.com/56054637/206503039-3351861d-b55c-4146-a781-dbde6cdc32cd.PNG)
<br><br>
2. Run the following commands at the root of each folder<br>
``` npm install --save-dev ```
<br><br>
3. Create the ```.env.develop``` file in the same path and insert the appropriate key-values referring to the ```env-example.json``` file.<br>
> Required keys in .env:
> + HOST
> + HOST_MAIL
> + MONGO_ATLAS_CONNECT_URL
> + COOKIE_SECRET
> + SECRET_KEY_DIR
> + AWS_S3_URL
> + AWS_ACCESS_KEY
> + AWS_SECRET_ACCESS_KEY
<br><br>
4. You need a MONGODB Atlas account and an AWS account to use the MongoDB database and AWS services. Please follow the links below on creating and connecting accounts for each service.
<br><br>
5. The ID of the Admin user created at first execution this app is ``` test0001@test.com ``` and the PW is ``` test0001 ```.
<br><br>
## License
Dinggule Blog is open-sourced software licensed under the MIT license.
