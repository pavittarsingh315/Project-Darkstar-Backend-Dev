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
