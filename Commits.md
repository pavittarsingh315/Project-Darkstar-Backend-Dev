# Project Darkstar Backend Development

## First Commit

1. Installed lots of dependencies and their types.
2. Set up database connection, routing, and custom logging.
3. Also read through the tsconfig and enabled options I liked.

## Second Commit

1. Installed lodash and bcryptjs and their types.
2. Created a User Schema along with an implementation of auth api routes.
3. Created a register route.

## Third Commit

1. Made a few adjustments to the User Schema.
2. Made it so that you can sign up with either email or phone.
3. Integrated the SendGrid Api and made it so that we can send emails.

## Fourth Commit

1. Deleted registration route and will now create a new registration flow.
2. Also modified the email function to now use a code.

## Fifth Commit - IMPORTANT

1. Created a brand new way of registration using two routes.
2. First route creates a temporary user that holds the contact value and a verification code we create. The code is emailed or texted.
3. Second route verifies the code and creates the user and deletes the temporary user.

## Sixth Commit

1. Integrated Twilio to now send verification codes through text messages as well.
2. Also added additional checks in the initiate registration endpoint.
3. Also made the temp user interface extend the mongoose.Document.

## Seventh Commit - Big One

1. Restructured the folder setup.
2. Created administration routes.
3. Created a whole system for banning users. This is the only route under admin routes
4. Created a login system using jwt. Both normal login and token login are implemented. Also created a token interface for tokens.

## Eigth Commit

1. Implemented Swagger documentation.
2. Created documentation for each route we currently have.

## Ninth Commit

1. Changed ban function so that it doesn't delete the user after maximum strikes reached. Instead it sends a response saying to delete them.
2. Created a helper function called findUserByContact and changed the login route to use that.
3. Changed the name of the TempUser model to TempObj to make it more generic cause just a model has lots of use cases.
4. Split the Mailing and Texting functions into different function cause we can send emails or texts for lots of different reasons.
5. Updated the registration route to now require a password. When a user is finally created, we send them tokens just like the login route.
6. Created two routes for both requesting and confirming password resets.

## Tenth Commit

1. Forgot to uncomment the send password email. I didn't wanna spam my email so i just commented it out and i forgot to uncomment it but now i did.
2. Created a middleware to check for staff/admin status prior to executing an admin route.
3. Added a field for a user type on the User Schema. User types are user, staff, and admin.

## Eleventh Commit

1. Made it so we check if a user is banned when doing token login.
2. Added a user type of superuser.
3. Created a route to delete a user and made use of user types to essentially created a hierarchy of the user types and who can delete who.

## Twelfth Commit - SUPER IMPORTANT

1. Implemented multiple database architecture.
2. Created a new database in cluster0 named Authentication. Deleted myFirstDatabase.
3. Changed the connection uri to contain the name of the Authentication database. The name of the database in the uri is the default database that the connection connects to.
4. There is a wierd deprecation warning that literally should be not happening but it is but its not app killing ya know.

## Thirteenth Commit

1. Refactored the database connection method.
2. Implemented the nodejs cluster and os module to spawn processes on all threads of the machine's processor if the node_env is in production mode. This is done because since nodejs is single thread, it doesn't use the entire power of the processor which is inefficient so by using cluster and os in production we make it so node essentially becomes a multi thread process.

## Fourteenth Commit

1. Changed the catch portion of every try-catch in the code. Made the err variable have an Error type.
