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

## Fifteenth Commit

1. Made it so the Swagger documentation now can have place a token into the Authorization header for request that require authentication.

## Sixteenth Commit - Important

1. Refactored the app so it can be deployed to Heroku.

## Seventeenth Commit

1. Excluded the userType from the response when sending back the user object.
2. Got rid of findUserByContact and now instead do an inline check and error response.

## Eighteenth Commit

1. Made the expiration time of temp objects 5 minutes rather than 2 minutes.
2. Created another route for password reset where the verification code is verified to be correct. This is cause I split the reset process into 3 parts: send contact, confirm code, change password.
3. Updated the documentation.

## Nineteenth Commit

1. Changed all the .update() functions to use the .save() syntax instead.
2. Added a check to see if a reset process is already started.
3. Added a last login field to the User schema and made all fields on the Temp schema immutable(read-only).
4. Created a Profile schema.
5. Changed the register route to create and send a profile obj. Changed the login route to send the profile obj.

## Twentieth Commit

1. Created an AWS bucket and IAM user with correct permissions to create and delete objects. Objects are readable by anyone.
2. Integrated AWS into the logic.
3. Created routes for getting a secure url to upload a object to aws and for deleting objects.
4. Created a user auth middleware to require jwt and deny access otherwise or if expired.
5. Made it so we check if the jwt is for a user that even exists in the middlewares.

## Twenty-first Commit

1. AWS presigned url makes it so images are uploaded into a profilePics folder.
2. Got rid of return user obj on login and registration. Now just returning the profile.
3. Gave the name property in both user and profile schemas a max length of thirty.

## Twenty-second Commit

1. Made routes to update username, name, and bio.
2. Editted the user permission middleware to now require the req.body to have a user id and have it match the one inside the token payload.

## Twenty-third Commit

1. Made route to updadte profile portrait url and delete old imgs from s3.
2. Removed delete s3 object route.
3. Made all edit routes put methods and made getting presigned url a post method.

## Twenty-fourth Commit

1. Removed the followers, following, and privatelyFollowing arrays from profile schema and all the cases where we omit these fields.
2. Made it so staff middleware now requires userId as well.
3. Made it so user middleware now appends entire user obj and profile obj into the request.
4. Created a new blacklistMsg field in profile model and created a function to edit it.
5. Made it so a profile obj and its profile pics are deleted when their owner i.e. user is deleted.
6. Created a new Follows schema to basically cover all aspects of user relationships.
7. Added functionality for following, unfollowing, and privately following a user.
8. Refactored the edit profile controller functions to use the profile and user objs that the user middleware appended on the request object.

## Twenty-fifth Commit

1. Added functionality to get a user's followers, following, and private following.
2. Added functionality to search for a user in an autocomplete type of way.

## Twenty-sixth Commit

1. Created a route to get a user's profile and if you're following them or not.

## Twenty-seventh Commit

1. Changed the port of the dev server.
2. Changed the searchUser route into a more generically named makeSearch route cause I plan on making searches for other stuff too like posts.
3. Created a searches schema which holds the last 10 searches from a user. All the routes have been setup.

## Twenty-eight Commit

1. Made the userId part of the Authorization header in order to remove it from the bodies of all protected routes.
2. Changed all the routes to their appropriate http method type.

## Twenty-ninth Commit

1. Created a separate route to add to the recent searches of a user.
2. When searching a profile, it now also returns if we are the owner of the profile.
3. When you unfollow, it returns whether you were privately or publicly following them.

## Thirtieth Commit

1. Removed blacklistMsg and whitelist from Profile Schema and into a new Schema called whitelist.
2. Updated login routes to include blacklistMsg from new schema and register route to create whitelist object.
3. Updated editBlacklistMsg to work properly with new Schema.
4. Created routes for adding and removing users from whitelist.
5. Changed all the "userId" to "profileId" where it was indeed the profileId just to avoid mix ups in the future.

## Thirty-first Commit

1. Put blacklistMsg back into the Profile Schema and refactored the Whitelist Schema.
2. Added functionality to remove a follower.
3. Added ability to leave someone's whitelist and get your own whitelist.

## Thirty-second Commit

1. Removed leaveWhitelist route. Instead made it so when you unfollow a user, you leave they're whitelist.
2. Added functionality to tell if we're whitelisted to a profile when getting it.
