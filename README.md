# MS-Teams-Clone
This project is made during the Engage Mentorship Program. It is a clone of MS Teams.

## Getting started

These instructions will give you a copy of the project up and running on your local machine for development and testing purposes. 

### Prerequisites

You should have NodeJS installed in your PC. You can check if NodeJS is installed on your PC by using the command
```
node --version
```

### Installing

1. Clone the repositry on your PC 
2. Once the repositry is cloned, open git bash in it and run
```
npm install
```
This will install all the dependencies required for the project.

3. Now go to MongoDB [MongoDB.com](http://mongodb.com/). Once you are signed in, you'll get an open to make a new cluster. For free tier, you can have only 1 cluster per email ID.
Once you have made a cluster, click on connect *Connect your Application*. It will open a box, copy the connection string.
4. Now paste this string in default.json file present inside the config folder.
```
{
    "mongoURI":"<Application String />"
}
```
Replace <password> present in the Application String with the password for your user. 

4. Now open registeration.js file present inside the routes folder. We are sending links to users on mail who are trying to retrieve their password. In order to do this,
we are using NodeMailer. On line 105 and 117 you need to enter the email ID which you want to use to the mails and on line 106, you want to enter its password. Besides this,
make sure you turn on less secured app access for that particular Gmail Account by going to :
    ```
    https://myaccount.google.com/u/2/lesssecureapps
    ```
    

5. Once you have done this, you'll be ready to run the project. Presently, the project is running on port 5000. At some point if you decide to change the port, make sure 
to change it in room.js file present in public/js directory

## Authors
- **Apoorv Singh Chauhan**

## Contact
- [LinkedIn](https://www.linkedin.com/in/apoorv-singh-chauhan-b82ba91a0/)

## Mail
- apoorvsingh.chauhan2019@vitstudent.ac.in
