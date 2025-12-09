## URL Shortener Backend
- Built with Node.js, Express.js, and JavaScript

- This project is a full-featured URL shortening backend with secure user authentication, notification system, and analytics tracking.
Users can sign up, log in, manage their profiles, reset passwords, and create short URLs with click analytics.

### Features
#### User Management

- User registration

- Login with rate limiting

- Refresh token authentication

- Logout

- Forgot password + email token verification

- Reset password

- View & update profile (protected)

#### URL Shortening

- Create short URLs

- Retrieve all URLs created by the authenticated user

- Redirect short URL to original URL

- Click analytics for each short code

#### Notifications System

- Get notification count

- Get all notifications (protected)

- Mark single notification as read

- Clear all notifications

### Tech Stack

- Runtime	Node.js
- Framework	Express.js
- Language	JavaScript
- Security	JWT Authentication, Rate Limiter
- Database	 MongoDB 

### API Documentation

### Below is a complete overview of all available API endpoints.

#### Auth Routes
##### Register User
`POST /api/v1/auth/register
`
##### Login
`
POST /api/v1/auth/login
`
##### Refresh Access Token
`
POST /api/v1/auth/refresh-token
`
##### Logout
`
POST /api/v1/auth/logout
`
##### Forgot Password
`
POST /api/v1/forgot-password
`
##### Verify Reset Token
`
GET /api/v1/verify-reset-token/:token
`
##### Reset Password
`
POST /api/v1/reset-password
`

#### User Profile Endpoints (Protected)
##### Get Profile
`
GET /api/v1/users/me
`
##### Update Profile
`
PATCH /api/v1/users/me
`

#### URL Shortener Endpoints

##### Create Short URL
`
POST /api/v1/shortener
`
##### Get My URLs
`
GET /api/v1/shortener/me
`
##### Redirect Short Code
`
GET /:code
`
##### Get Click Analytics
`
GET /api/v1/shortener/analytics/:code
`

#### Notification Endpoints (Protected)
##### Get Notification Count
`
GET /api/v1/notifications/count
`
##### Get All Notifications
`
GET /api/v1/notifications
`
##### Mark Notification as Read
`
PATCH /api/v1/notifications/:id/mark
`
##### Clear All Notifications
`
DELETE /api/v1/notifications/clear
`

### Getting Started
#### Install dependencies
`
npm install
`
#### Create an .env file

- Include variables such as:
`
PORT=5000
MONGO_URI=
NODE_ENV=development
JWT_SECRET=
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_DAYS=30
REFRESH_TOKEN_COOKIE_NAME=jid
REFRESH_TOKEN_COOKIE_SECURE=false   # set true in production (https)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465 # 587 # 465
SMTP_SECURE=true
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM="MyApp <noreply@myapp.com>"
BASE_URL=http://localhost:5000
REDIS_URL=redis://localhost:6379
`
#### Run the server
`
npm run dev
`
