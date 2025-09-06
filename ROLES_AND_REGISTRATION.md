# Vignan Telecalling System - Roles and Registration Guide

## User Roles

The system has two types of users:

1. **Admin**
   - Can register new users (both admins and agents)
   - Has access to all leads and interactions
   - Can assign leads to agents
   - Can view analytics and reports
   - Has full system management capabilities

2. **Agent**
   - Can view and interact with leads assigned to them
   - Can update lead status and add interaction notes
   - Cannot register new users
   - Has limited access to system features

## Registration Process

### First Admin Registration

When the system is first set up, there are no users in the database. The first admin must be registered using the special "Register First Admin" button on the landing page. This creates the initial administrator account.

1. Go to the landing page
2. Click on "Register First Admin"
3. Fill in the registration form
4. Submit the form
5. Log in with the created credentials

### Regular User Registration

After the first admin is registered, all subsequent user registrations (both admins and agents) must be done by an authenticated admin:

1. Admin logs in
2. Admin navigates to the registration page
3. Admin fills in the registration form, specifying the role (admin or agent)
4. Admin submits the form

## Lead Management

Leads are prospective students who are interested in admission. They are not users of the system but are the subjects being managed by the system.

- Leads can be added manually or imported in bulk
- Leads can be assigned to agents for follow-up
- Interactions with leads are tracked in the system
- Lead status can be updated as they progress through the admission funnel

## Authentication Flow

1. Users (admins and agents) log in through the login page
2. Upon successful authentication, they are redirected to their respective dashboards
3. Admins see the admin dashboard with full system capabilities
4. Agents see a limited dashboard with only their assigned leads

## Common Issues

### Registration Fails

Possible causes:
- MongoDB is not running
- Database connection issues
- Validation errors in the form

### Database Not Showing

If the vtfinal database is not showing in MongoDB:
- Ensure MongoDB is running
- Check that the server is connecting to the correct MongoDB URI
- The database will be created automatically when the first document is inserted

### Role Confusion

Remember that:
- Only admins and agents can log in to the system
- Leads are not users of the system but are the data being managed
- The first admin must be registered through the special registration page
- All subsequent users must be registered by an existing admin