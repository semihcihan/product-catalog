const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const authService = require('./auth.service');
const APIFeatures = require('../utils/apiFeatures');
const { logRequest } = require('../utils/analytics');

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    gender: req.body.gender,
    phone: req.body.phone,
    username: req.body.username,
    birthDate: req.body.birthDate,
    avatar: req.body.avatar,
    status: req.body.status,
    role: req.body.role,
    addresses: req.body.addresses,
  });

  if (req.body.email && req.body.password) {
    try {
      await authService.createAuth0User(req.body.email, req.body.password, {
        appUserId: newUser._id,
        role: req.body.role,
      });
    } catch (e) {
      await newUser.delete();
      return next(e);
    }
  } else {
    await authService.updateAuth0UserMetaData(req.user.sub, {
      appUserId: newUser._id,
      role: req.body.role,
    });
  }

  logRequest(req, 'user.create');

  res.status(201).json({
    status: 'success',
    data: newUser,
  });
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('avatar');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.params.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
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
      avatar: req.file ? req.file.filename : undefined,
      role: req.body.role,
      status: req.body.status,
      addresses: req.body.addresses,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (req.body.role) {
    const auth0User = await authService.getUserFromAuthWithAppId(id);
    if (!auth0User) {
      return next(new AppError('No document found with that ID', 404));
    }

    await authService.updateAuth0UserMetaData(auth0User.user_id, {
      role: req.body.role,
    });
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
      avatar: req.file ? req.file.filename : undefined,
      role: req.body.role,
      status: req.body.status,
      addresses: req.body.addresses,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (req.body.role) {
    const auth0User = await authService.getUserFromAuthWithAppId(id);
    if (!auth0User) {
      return next(new AppError('No document found with that ID', 404));
    }

    await authService.updateAuth0UserMetaData(auth0User.user_id, {
      role: req.body.role,
    });
  }

  logRequest(req, 'user.patch');

  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
});

exports.changeEmail = catchAsync(async (req, res, next) => {
  //if current user send the request user req.user.sub obj
  //if other user send the request by getting the auth0 id of the user
  const { id } = req.params;
  if (req.user.appId === id) {
    await authService.changeEmail(req.user.sub, req.body.newEmail);
  } else {
    const user = await authService.getUserFromAuthWithAppId(id);
    if (user) {
      await authService.changeEmail(user.user_id, req.body.newEmail);
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
  const { id } = req.params;
  const query = User.findById(id);
  const doc = await query;
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  logRequest(req, 'user.get');

  res.status(200).json({
    status: 'success',
    data: doc,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await authService.getUserFromAuthWithAppId(id);
  if (!user) {
    return next(new AppError('No document found with that ID', 404));
  }
  await authService.deleteUser(user.user_id);
  await User.findByIdAndUpdate(id, {
    status: 'closed',
  });

  logRequest(req, 'user.delete');

  res.status(204).json({
    status: 'success',
    data: { id },
  });
});

exports.getUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const doc = await features.query;

  logRequest(req, 'user.find');

  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: doc,
  });
});
