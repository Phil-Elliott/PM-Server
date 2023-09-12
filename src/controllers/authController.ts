import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/userModel";
import { catchAsync } from "../utils/catchAsync";
import AppError from "../utils/appError";
import sendEmail from "../utils/email";

interface AuthRequestBody {
  email: string;
  password?: string;
  name?: string;
  passwordConfirm?: string;
  role?: string;
  passwordCurrent?: string;
}

interface CookieOptions {
  expires: Date;
  httpOnly: true;
  secure?: boolean;
  sameSite?: "none";
}

interface JwtPayload {
  id: string;
  iat?: number;
  [key: string]: any;
}

interface ForgotPasswordRequestBody {
  email: string;
}

const signToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user: any, statusCode: number, res: Response) => {
  const token = signToken(user._id);
  const cookieOptions: CookieOptions = {
    expires: new Date(
      Date.now() +
        parseInt(process.env.JWT_COOKIE_EXPIRES_IN!) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export const logout = (req: Request, res: Response): void => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: "success" });
};

export const register = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    if (req.user) {
      logout(req, res);
    }

    const userExists = await User.findOne({ email: req.body.email });

    if (userExists) {
      return res.json("User already exists");
    }

    const newUser = await User.create(req.body);

    createSendToken(newUser, 201, res);
  }
);

export const login = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    if (req.user) {
      logout(req, res);
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide email and password!", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

    createSendToken(user, 200, res);
  }
);

export const protect = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (!decoded.id || !decoded.iat) {
      return next(new AppError("Invalid token", 401));
    }

    const freshUser = await User.findById(decoded.id);

    if (!freshUser || freshUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError("Token is invalid or has expired", 401));
    }

    req.user = freshUser;
    next();
  }
);

export const restrictTo = (...roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

export const forgotPassword = catchAsync(
  async (
    req: Request<{}, {}, ForgotPasswordRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new AppError("There is no user with that email address", 404)
      );
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Your password reset token (valid for 10 minutes)",
        message,
      });

      res.status(200).json({
        status: "success",
        message: "Token sent to email!",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          "There was an error sending the email. Try again later!",
          500
        )
      );
    }
  }
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get user based on the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // Check if token has not expired and if there is a user
    if (!user) {
      return next(new AppError("Token is invalid or has expired", 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Log the user in, Set the JWT token as a cookie in the response
    const token = signToken(user._id.toString());
    res.cookie("token", token).status(200).json({
      status: "success",
      token,
    });
  }
);

export const updatePassword = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.id) {
      return next(new AppError("No user found", 401));
    }

    // Get user from collection
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (
      !req.body.passwordCurrent ||
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return next(new AppError("Your current password is wrong", 401));
    }

    if (!req.body.password || !req.body.passwordConfirm) {
      return next(
        new AppError("Password and confirm password are required", 400)
      );
    }

    // Update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // Log user in, send JWT
    const token = signToken(user._id.toString());
    res.cookie("token", token).status(200).json({
      status: "success",
      token,
    });
  }
);
