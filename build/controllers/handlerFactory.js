"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = exports.getOne = exports.createOne = exports.updateOne = exports.deleteOne = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = __importDefault(require("../utils/appError"));
const apiFeatures_1 = __importDefault(require("../utils/apiFeatures"));
function deleteOne(Model) {
    return (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const doc = yield Model.findByIdAndDelete(req.params.id);
        if (!doc) {
            return next(new appError_1.default("No document found with that ID", 404));
        }
        res.status(204).json({
            status: "success",
            data: null,
        });
    }));
}
exports.deleteOne = deleteOne;
function updateOne(Model) {
    return (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
        // console.log(req.params.id, req.body, "updateOne");
        const doc = yield Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!doc) {
            return next(new appError_1.default("No document found with that ID", 404));
        }
        res.status(200).json({
            status: "success",
            data: {
                data: doc,
            },
        });
    }));
}
exports.updateOne = updateOne;
function createOne(Model) {
    return (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const newDoc = yield Model.create(req.body);
        res.status(201).json({
            status: "success",
            data: {
                data: newDoc,
            },
        });
    }));
}
exports.createOne = createOne;
function getOne(Model, popOptions) {
    return (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
        let query = Model.findById(req.params.id);
        // Simplifying the population logic
        if (popOptions) {
            if (typeof popOptions === "string") {
                query = query.populate(popOptions);
            }
            else if (Array.isArray(popOptions)) {
                popOptions.forEach((option) => {
                    if (typeof option === "string") {
                        query = query.populate(option);
                    }
                    else {
                        query = query.populate(option.path, option.select); // Adjusting based on what your PopulateOptions type has.
                    }
                });
            }
            else {
                // This means popOptions is of type PopulateOptions
                query = query.populate(popOptions.path, popOptions.select); // Adjusting based on what your PopulateOptions type has.
            }
        }
        const doc = yield query;
        if (!doc) {
            return next(new appError_1.default("No document found with that ID", 404));
        }
        res.status(200).json({
            status: "success",
            data: {
                data: doc,
            },
        });
    }));
}
exports.getOne = getOne;
function getAll(Model) {
    return (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
        let filter = {};
        if (req.params.gameId)
            filter = { game: req.params.gameId };
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
                }
                else {
                    const lowerLimit = parseInt(priceParts[0].replace(/[$,]/g, "").trim(), 10);
                    const upperLimit = parseInt(priceParts[1].replace(/[$,]/g, "").trim(), 10);
                    return { price: { $gte: lowerLimit, $lte: upperLimit } };
                }
            });
            filter.$or = priceFilters;
        }
        // Create a separate query to get the total count of all products
        console.log(filter);
        const totalProductsQuery = Model.find(filter);
        const features = new apiFeatures_1.default(Model, filter, req.query)
            .sort()
            .limitFields()
            .paginate();
        const [docs, totalProducts] = yield Promise.all([
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
    }));
}
exports.getAll = getAll;
