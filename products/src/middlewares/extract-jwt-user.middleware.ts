const TOKEN_APP_META_DATA_KEY = 'custom/app_metadata';

const extractJwtUser = async (req, res, next) => {
  req.user = req.auth ? req.auth.payload : {};
  if (req.user[TOKEN_APP_META_DATA_KEY]) {
    req.user.id = req.user[TOKEN_APP_META_DATA_KEY].appUserId;
    req.user.role = req.user[TOKEN_APP_META_DATA_KEY].role;
  }

  next();
};

export default extractJwtUser;
