import { Request, Response, NextFunction } from "express";
import { Document, Model, PopulateOptions } from "mongoose";
import { catchAsync } from "../utils/catchAsync";
import AppError from "../utils/appError";
import APIFeatures from "../utils/apiFeatures";
import QueryString from "qs";

interface CustomRequest extends Request {
  query: {
    search?: string;
    category?: string;
    publisher?: string;
    gameModes?: string;
    platform?: string;
    prices?: string;
    [key: string]:
      | string
      | QueryString.ParsedQs
      | string[]
      | QueryString.ParsedQs[]
      | undefined;
  };
}

export function deleteOne<T extends Document>(Model: Model<T>) {
  return catchAsync(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
      const doc = await Model.findByIdAndDelete(req.params.id);

      if (!doc) {
        return next(new AppError("No document found with that ID", 404));
      }

      res.status(204).json({
        status: "success",
        data: null,
      });
    }
  );
}

export function updateOne<T extends Document>(Model: Model<T>) {
  return catchAsync(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
      // console.log(req.params.id, req.body, "updateOne");
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!doc) {
        return next(new AppError("No document found with that ID", 404));
      }

      res.status(200).json({
        status: "success",
        data: {
          data: doc,
        },
      });
    }
  );
}

export function createOne<T extends Document>(Model: Model<T>) {
  return catchAsync(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
      const newDoc = await Model.create(req.body);

      res.status(201).json({
        status: "success",
        data: {
          data: newDoc,
        },
      });
    }
  );
}

export function getOne<T extends Document>(
  Model: Model<T>,
  popOptions?: string | PopulateOptions | Array<string | PopulateOptions>
) {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let query = Model.findById(req.params.id) as any;

    // Simplifying the population logic
    if (popOptions) {
      if (typeof popOptions === "string") {
        query = query.populate(popOptions);
      } else if (Array.isArray(popOptions)) {
        popOptions.forEach((option) => {
          if (typeof option === "string") {
            query = query.populate(option);
          } else {
            query = query.populate(option.path, option.select); // Adjusting based on what your PopulateOptions type has.
          }
        });
      } else {
        // This means popOptions is of type PopulateOptions
        query = query.populate(popOptions.path, popOptions.select); // Adjusting based on what your PopulateOptions type has.
      }
    }

    const doc = await query;

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });
}

export function getAll<T extends Document>(Model: Model<T>) {
  return catchAsync(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
      let filter: any = {};
      if (req.params.gameId) filter = { game: req.params.gameId };

      //   Handle search by name
      if (req.query.search) {
        filter.name = { $regex: req.query.search, $options: "i" };
      }

      // Handle multiple values for category
      if (req.query.category) {
        const categories = req.query.category
          .split(",")
          .map((cat) => cat.trim());
        filter.category = { $in: categories };
      }

      // Handle multiple values for publisher
      if (req.query.publisher) {
        const publishers = req.query.publisher
          .split(",")
          .map((cat) => cat.trim());
        filter.publisher = { $in: publishers };
      }

      // Handle multiple values for gameModes
      if (req.query.gameModes) {
        const gameModes = req.query.gameModes
          .split(",")
          .map((cat) => cat.trim());
        filter.gameModes = { $in: gameModes };
      }

      // Handle multiple values for platform
      if (req.query.platform) {
        const platforms = req.query.platform
          .split(",")
          .map((cat) => cat.trim());
        filter.platform = { $in: platforms };
      }

      // Handle multiple values for prices
      if (req.query.prices) {
        const prices = req.query.prices.split(",");
        const priceFilters = prices.map((price) => {
          const priceParts = price.split("-");
          if (priceParts.length === 1) {
            const cleanedPricePart = priceParts[0]
              .replace(/[$,]/g, "")
              .replace("Over", "")
              .trim();
            return { price: { $gt: parseInt(cleanedPricePart, 10) } };
          } else {
            const lowerLimit = parseInt(
              priceParts[0].replace(/[$,]/g, "").trim(),
              10
            );
            const upperLimit = parseInt(
              priceParts[1].replace(/[$,]/g, "").trim(),
              10
            );
            return { price: { $gte: lowerLimit, $lte: upperLimit } };
          }
        });
        filter.$or = priceFilters;
      }

      // Create a separate query to get the total count of all products
      console.log(filter);

      const totalProductsQuery = Model.find(filter);

      const features = new APIFeatures(Model, filter, req.query)
        .sort()
        .limitFields()
        .paginate();

      const [docs, totalProducts] = await Promise.all([
        features.query,
        totalProductsQuery.countDocuments(),
      ]);

      res.status(200).json({
        status: "success",
        results: docs.length,
        totalProducts: totalProducts,
        data: {
          data: docs,
        },
      });
    }
  );
}
