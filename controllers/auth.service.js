const { ManagementClient } = require('auth0');
const axios = require('axios');

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  scope:
    'read:users update:users create:users create:users_app_metadata delete:users delete:users_app_metadata',
});

exports.updateAuth0User = async (auth0Id, appMetadata) =>
  await management.updateUser(
    { id: auth0Id },
    { app_metadata: { ...appMetadata } }
  );

exports.changeEmail = async (auth0Id, email) => {
  await management.updateUser(
    { id: auth0Id },
    { email: email, email_verified: false, verify_email: true }
  );
};

exports.sendResetPasswordEmail = async (email) => {
  const options = {
    method: 'POST',
    url: `https://${process.env.AUTH0_DOMAIN}/dbconnections/change_password`,
    headers: { 'content-type': 'application/json' },
    data: {
      client_id: process.env.AUTH0_CLIENT_ID,
      email: email,
      connection: 'Username-Password-Authentication',
    },
  };

  return await axios.post(options.url, options.data);
};
