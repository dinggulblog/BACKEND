# Backend Server
### Dinggul Blog API Server with Express.js &amp; MongoDB
------
## Postman API Document Link (Local)
<[https://documenter.getpostman.com/view/15146904/2s8YzRxhtC](https://documenter.getpostman.com/view/15146904/2s8Z6x3ZL9)>

## Blog Preview Link
<https://dinggul.me>

## Basic Features
+ Manage posts and media
+ Categorize posts
+ Various post viewing
+ User Roles
+ Markdown Editor
+ Content moderation
+ User Profile moderation
+ Amazon S3 integration(incomplete)

and more...

## Installaion
Frontend repository: <https://github.com/dinggulblog/FRONTEND> <br>

1. Download this repo and frontend repo together.<br>
The backend folder and the frontend folder must be located on the same path like below.<br>
![캡처](https://user-images.githubusercontent.com/56054637/206503039-3351861d-b55c-4146-a781-dbde6cdc32cd.PNG)

2. Run the following commands at the root of each folder<br>
``` npm install --save-dev ```

Create the ```.env.develop``` file in the same path and insert the appropriate key-values referring to the ```env-example.json``` file.
Required keys in .env:
+ HOST
+ HOST_MAIL
+ MONGO_ATLAS_CONNECT_URL
+ COOKIE_SECRET
+ SECRET_KEY_DIR
+ JWT_PUBLIC_DIR
+ JWT_PRIVATE_DIR

## License
Dinggule Blog is open-sourced software licensed under the MIT license.
