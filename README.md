1. Test server first

In Postman create a new request:

Method:

GET

URL:

http://localhost:5000/

Click Send.

Expected:

{
  "success": true,
  "message": "BPYCREATIONS Backend API is running."
}
2. Test MongoDB

Create another request:

GET http://localhost:5000/api/health/database

Expected:

{
  "success": true,
  "service": "MongoDB",
  "status": "connected",
  "database": "contact_form_db",
  "host": "localhost",
  "port": 27017
}

If you get "connected", MongoDB is good.

3. Test Email

Create:

GET http://localhost:5000/api/health/email

Expected:

{
  "success": true,
  "service": "SMTP Email",
  "status": "connected",
  "provider": "smtp.gmail.com",
  "adminEmail": "boopathy1865@gmail.com"
}

If this works, your Gmail SMTP configuration is good.

4. Now test the actual contact form

This is the important one.

Create a new Postman request.

Method
POST
URL
http://localhost:5000/api/contact
Headers

Go to Headers and add:

Key	Value
Content-Type	application/json
Body

Go to:

Body → raw → JSON

Enter:

{
  "name": "Test Customer",
  "email": "test@example.com",
  "mobile": "9876543210"
}

Then click Send.

5. Expected successful response

You should get:

Status: 201 Created

{
  "success": true,
  "message": "Your contact details have been submitted successfully.",
  "data": {
    "id": "..."
  }
}

At this point:

React
  ↓
POST /api/contact
  ↓
Express
  ↓
Zod validation
  ↓
MongoDB
  ↓
Contact saved
  ↓
Email sent
6. Check MongoDB

After the successful request, check your MongoDB database:

contact_form_db
    └── contacts
         └── Test Customer

You should see:

{
  "name": "Test Customer",
  "email": "test@example.com",
  "mobile": "9876543210"
}
7. Test duplicate protection

This is very important for your requirement.

Without changing anything, click Send again in Postman.

Same:

{
  "name": "Test Customer",
  "email": "test@example.com",
  "mobile": "9876543210"
}

Expected:

Status: 409 Conflict

{
  "success": false,
  "message": "This mobile number has already been submitted."
}

MongoDB should still contain only one record for:
9876543210

8. Test mobile normalization

Now try a different number using Indian formatting:

{
  "name": "Test Customer 2",
  "email": "test2@example.com",
  "mobile": "+91 9876543211"
}

Expected successful response:

{
  "success": true,
  "message": "Your contact details have been submitted successfully.",
  "data": {
    "id": "..."
  }
}

MongoDB should store the normalized number:

9876543211

not:

+91 9876543211

This is important because otherwise users could bypass duplicate checking simply by entering the same number in different formats.

9. Test required name

Send:

{
  "name": "",
  "email": "test@example.com",
  "mobile": "9876543212"
}

Expected:

400 Bad Request

10. Test required mobile

Send:

{
  "name": "Test Customer",
  "email": "test@example.com",
  "mobile": ""
}

Expected:

400 Bad Request

11. Test optional email

Your requirement says Email is not *, so test:

{
  "name": "No Email Customer",
  "email": "",
  "mobile": "9876543213"
}

This should succeed.

MongoDB:

{
  "name": "No Email Customer",
  "email": null,
  "mobile": "9876543213"
}
Test these in this exact order
1. GET  /
2. GET  /api/health/database
3. GET  /api/health/email
4. POST /api/contact
5. POST /api/contact again → should return 409
6. POST with +91 mobile format
7. POST with invalid mobile
8. POST without name
9. POST without mobile
10. POST without email
