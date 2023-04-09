# Backend Server
Dinggul Blog API Server with Express.js &amp; MongoDB
<br><br>
## Web Application Architecture
<img src="https://user-images.githubusercontent.com/56054637/230785846-035d41a7-fedd-4f46-846b-2937bb65a380.png" width="50%" height="50%">
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

## Installaion
Frontend repository: <https://github.com/dinggulblog/FRONTEND> <br>

1. Download this repo and frontend repo together.<br>
The backend folder and the frontend folder must be located on the same path like below.<br>
![How to locate folders](https://user-images.githubusercontent.com/56054637/206503039-3351861d-b55c-4146-a781-dbde6cdc32cd.PNG)

2. Run the following commands at the root of each folder<br>
``` npm install --save-dev ```

3. Create the ```.env.develop``` file in the same path and insert the appropriate key-values referring to the ```env-example.json``` file.<br>
> Required keys in .env:
> + HOST
> + HOST_MAIL
> + MONGO_ATLAS_CONNECT_URL
> + COOKIE_SECRET
> + SECRET_KEY_DIR
> + JWT_PUBLIC_DIR
> + JWT_PRIVATE_DIR

## License
Dinggule Blog is open-sourced software licensed under the MIT license.
