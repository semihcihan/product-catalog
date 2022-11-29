const multer = require('multer');
const sharp = require('sharp');
const jwtDecode = require('jwt-decode');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const authService = require('./auth.service');
const APIFeatures = require('../utils/apiFeatures');

const AUTHORIZATION_HEADER = 'authorization';
const ROLES_KEY = 'custom/roles';
const BEARER = 'Bearer';

const changeUserStatus = async (auth0Id, userId, newStatus) => {
  await User.findByIdAndUpdate(userId, {
    status: newStatus,
  });

  authService.updateAuth0User(auth0Id, {
    status: newStatus,
  });
};

exports.minimumPermissionRequired = (PERMISSION) => (req, res, next) => {
  if (
    req.user &&
    req.user[ROLES_KEY] &&
    req.user[ROLES_KEY].find((value) => value === PERMISSION)
  ) {
    next();
  } else {
    res.status(403).send();
  }
};

exports.extractUserFromAccessToken = (req, res, next) => {
  if (
    req.headers[AUTHORIZATION_HEADER] &&
    req.headers[AUTHORIZATION_HEADER].indexOf(BEARER) > -1
  ) {
    try {
      req.user = jwtDecode(req.headers[AUTHORIZATION_HEADER].split(BEARER)[1]);
      console.log('---', req.user);
      next();
    } catch (err) {
      res.status(500).send(err);
    }
  } else {
    next();
  }
};

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    gender: req.body.gender,
    phone: req.body.phone,
    username: req.body.username,
    birthDate: req.body.birthDate,
    email: req.body.email,
    avatar: req.body.avatar,
    role: req.body.role,
    status: req.body.status,
    addresses: req.body.addresses,
  });

  await authService.updateAuth0User(req.user.sub, {
    appUserId: newUser._id,
  });

  res.status(201).json({
    status: 'success',
    data: newUser,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  //TODO: change permission level if admin,  ?? req.user['custom/app_metadata'].appUserId
  const { id } = req.params;
  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      gender: req.body.gender,
      phone: req.body.phone,
      username: req.body.username,
      birthDate: req.body.birthDate,
      avatar: req.body.avatar,
      addresses: req.body.addresses,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  //check if admin
  if (req.body.status) {
    await changeUserStatus(req.user.sub, id, req.body.status);
  }

  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
});

exports.sendResetPasswordEmail = catchAsync(async (req, res, next) => {
  //TODO: if admin ok to send other users, if normal user check if it's their email or no jwt
  await authService.sendResetPasswordEmail(req.body.email);
  res.status(200).json({
    status: 'success',
  });
});

exports.changeEmail = catchAsync(async (req, res, next) => {
  //TODO: make it available only for admins for other users or logged in user
  const { id } = req.params;
  await authService.changeEmail(id, req.body.newEmail);
  res.status(200).json({
    status: 'success',
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  //TODO: make it available for current user or admins
  const { id } = req.params;
  const query = User.findById(id);
  const doc = await query;
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      doc,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  //TODO: make it available for current user or admins
  const { id } = req.params;
  await changeUserStatus(req.user.sub, id, 'closed');
  res.status(204).json({
    status: 'success',
    data: { id },
  });
});

exports.getUsers = catchAsync(async (req, res, next) => {
  //TODO: only admin
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  // const doc = await features.query.explain();
  const doc = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: doc,
  });
});

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });
// const multerStorage = multer.memoryStorage();

// const multerFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image')) {
//     cb(null, true);
//   } else {
//     cb(new AppError('Not an image! Please upload only images.', 400), false);
//   }
// };

// const upload = multer({
//   storage: multerStorage,
//   fileFilter: multerFilter,
// });

// exports.uploadUserPhoto = upload.single('photo');

// exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
//   if (!req.file) return next();

//   req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

//   await sharp(req.file.buffer)
//     .resize(500, 500)
//     .toFormat('jpeg')
//     .jpeg({ quality: 90 })
//     .toFile(`public/img/users/${req.file.filename}`);

//   next();
// });

// const filterObj = (obj, ...allowedFields) => {
//   const newObj = {};
//   Object.keys(obj).forEach((el) => {
//     if (allowedFields.includes(el)) newObj[el] = obj[el];
//   });
//   return newObj;
// };

// exports.getMe = (req, res, next) => {
//   req.params.id = req.user.id;
//   next();
// };

// exports.updateUser = catchAsync(async (req, res, next) => {
//   //TODO: get id from req
//   // 1) Create error if user POSTs password data
//   if (req.body.password || req.body.passwordConfirm) {
//     return next(
//       new AppError(
//         'This route is not for password updates. Please use /updateMyPassword.',
//         400
//       )
//     );
//   }

//   // 2) Filtered out unwanted fields names that are not allowed to be updated
//   const filteredBody = filterObj(req.body, 'name', 'email');
//   if (req.file) filteredBody.photo = req.file.filename;

//   // 3) Update user document
//   const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
//     new: true,
//     runValidators: true,
//   });

//   res.status(200).json({
//     status: 'success',
//     data: {
//       user: updatedUser,
//     },
//   });
// });

// exports.deleteMe = catchAsync(async (req, res, next) => {
//   await User.findByIdAndUpdate(req.user.id, { active: false });

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

// exports.patchUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not defined! Please use /signup instead',
//   });
// };

// exports.createUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not defined! Please use /signup instead',
//   });
// };

// exports.getUser = factory.getOne(User);
// exports.getAllUsers = factory.getAll(User);

// // Do NOT update passwords with this!
// exports.deleteUser = factory.deleteOne(User);
