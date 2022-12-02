const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const authService = require('./auth.service');
const APIFeatures = require('../utils/apiFeatures');
const { logRequest } = require('../utils/analytics');

const changeUserStatus = async (auth0Id, userId, newStatus) => {
  await User.findByIdAndUpdate(userId, {
    status: newStatus,
  });

  authService.updateAuth0UserMetaData(auth0Id, {
    status: newStatus,
  });
};

const changeUserRole = async (auth0Id, userId, newRole) => {
  authService.updateAuth0UserMetaData(auth0Id, {
    role: newRole,
  });

  await User.findByIdAndUpdate(userId, {
    role: newRole,
  });
};

exports.createUser = catchAsync(async (req, res, next) => {
  //TODO:
  /*
    let create other users for admins
    let only create own user by req.user.sub for normal users
    check role
  */
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    gender: req.body.gender,
    phone: req.body.phone,
    username: req.body.username,
    birthDate: req.body.birthDate,
    avatar: req.body.avatar,
    addresses: req.body.addresses,
  });

  await authService.updateAuth0UserMetaData(req.user.sub, {
    appUserId: newUser._id,
  });

  if (req.body.status) {
    await changeUserStatus(req.user.sub, newUser._id, req.body.status);
  }

  if (req.body.role) {
    await changeUserRole(req.user.sub, newUser._id, req.body.role);
  }

  logRequest(req, 'user.create');

  res.status(201).json({
    status: 'success',
    data: newUser,
  });
});

exports.putUser = catchAsync(async (req, res, next) => {
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
      role: req.body.role,
      status: req.body.status,
      addresses: req.body.addresses,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  //TODO: if admin it doesn't have to be req.user.sub
  if (req.body.status) {
    await changeUserStatus(req.user.sub, id, req.body.status);
  }

  //TODO: if admin it doesn't have to be req.user.sub
  if (req.body.role) {
    await changeUserRole(req.user.sub, id, req.body.role);
  }

  logRequest(req, 'user.update');

  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
});

exports.patchUser = catchAsync(async (req, res, next) => {
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
      role: req.body.role,
      status: req.body.status,
      addresses: req.body.addresses,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  //TODO: check if admin
  //TODO: check role
  if (req.body.status) {
    await changeUserStatus(req.user.sub, id, req.body.status);
  }

  logRequest(req, 'user.update');

  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
});

exports.sendResetPasswordEmail = catchAsync(async (req, res, next) => {
  await authService.sendResetPasswordEmail(req.body.email);
  logRequest(req, 'user.reset_password_email');
  res.status(200).json({
    status: 'success',
  });
});

exports.changeEmail = catchAsync(async (req, res, next) => {
  //if current user send the request user req.user.sub obj
  //if other user send the request by getting the auth0 id of the user
  const { id } = req.params;
  if (req.user.appId === id) {
    await authService.changeEmail(req.user.sub, req.body.newEmail);
  } else {
    const users = await authService.getUserFromAuthWithAppId(id);
    if (!users || users.length !== 0) {
      await authService.changeEmail(users[0].user_id, req.body.newEmail);
    } else {
      return next(new AppError('No document found with that ID', 404));
    }
  }

  logRequest(req, 'user.change_email');
  return res.status(200).json({
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

  logRequest(req, 'user.get');

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

  logRequest(req, 'user.delete');

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

  logRequest(req, 'user.find');

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
