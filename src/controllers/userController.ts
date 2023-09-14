import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/userModel";
import { catchAsync } from "../utils/catchAsync";
import AppError from "../utils/appError";
import * as factory from "./handlerFactory";
import { Model } from "mongoose";

// Define the user structure.
type UserDoc = {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
  active?: boolean;
  // Add any other properties that the user may have.
};

// It seems `req.user` has `id`. Extend the default Request type.
interface CustomRequest extends Request {
  user?: UserDoc;
}

const filterObj = (
  obj: Record<string, any>,
  ...allowedFields: string[]
): Record<string, any> => {
  const newObj: Record<string, any> = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const updateMe = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    // Preventing password updates through this route
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          "This route is not for password updates. Please use /updatePassword",
          400
        )
      );
    }

    // Create a new object with only the fields we want to allow updates for
    const fieldsToUpdate = {
      email: req.body.email,
      name: req.body.name,
      avatar: req.body.avatar,
    };

    // Filter out undefined fields to prevent accidental overwrite with undefined
    const filteredBody = Object.fromEntries(
      Object.entries(fieldsToUpdate).filter(([_, value]) => value !== undefined)
    );

    const updatedUser = await User.findByIdAndUpdate(
      req.user?.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return next(new AppError("Error updating user details", 400));
    }

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  }
);

export const deleteMe = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    // Find the user by ID
    const user = await User.findById(req.user?.id);

    // Check if the user was found
    if (!user) {
      return next(new AppError("No user found with that ID", 404));
    }

    // Check if it's the demo account
    if (user.email === "user@gmail.com") {
      return next(new AppError("Demo account cannot be deleted", 400));
    }

    // Delete the user (this will trigger the deleteOne middleware)
    await user.deleteOne();

    // Clear the cookie
    res.clearCookie("jwt");

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

export const getMe = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    console.log(req, "req");
    if (!req.user || !req.user.id) {
      return next(new AppError("User not authenticated", 401)); // or some other error handling
    }
    req.params.id = req.user.id;
    next();
  }
);

export const getUserByEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the email from the request parameters
    const email = req.params.email;

    if (!email) {
      return next(new AppError("Email is required to fetch the user.", 400));
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError("No user found with the given email.", 404));
    }

    // Send back the user details
    res.status(200).json({
      status: "success",
      data: {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    return next(
      new AppError("An error occurred while fetching the user.", 500)
    );
  }
};

export const getAllUsers = factory.getAll(User as Model<IUser>);
export const getUserById = factory.getOne(User as Model<IUser>);
export const updateUser = factory.updateOne(User as Model<IUser>);
export const deleteUser = factory.deleteOne(User as Model<IUser>);
