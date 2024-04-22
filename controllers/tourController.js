const Tour = require("./../models/tourModel");
//const APIFeatures = require("./../utils/apiFeatures");

exports.aliasTopTours = (req, res, next) => {
  console.log("in the middle where");
  req.query.limit = "4";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

class APIFeatures1 {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // API Features methods one for one

  // Filters
  filter() {
    const queryObj = { ...this.queryString };
    // Correct the variable name to excludedFields
    const excludedFields = ["limit", "page", "sort", "fields"];

    // make query object excluded fields free
    excludedFields.forEach((element) => {
      delete queryObj[element];
    });

    // Make filter object according to the mongoose $ sign syntax
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (word) => `$${word}`
    );

    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }

  sorting() {
    if (this.queryString.sort) {
      //query = query.sort(req.query.sort);

      // If we want to sort ob more then one condition basis
      let sortBy = this.query.sort(this.queryString.sort.split(",").join(" "));
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    // // Get Limiting Feilds
    if (this.queryString.feilds) {
      let feilds = this.queryString.feilds.split(",").join(" ");
      this.query = this.query.select(feilds);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    let page = this.queryString.page * 1 || 1;
    let limit = this.queryString.limit * 1 || 100;

    let skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    // Check if records exist or not

    // if (this.queryString.page) {
    //   const toursCount = await Tour.countDocuments();

    //   if (skip >= toursCount) {
    //     console.log("error coms up");
    //     throw new Error("This page is not exist");
    //   }
    // }
    return this;
  }
}
exports.getAllTours = async (req, res) => {
  try {
    // const tours = await Tour.find();

    console.log(req.query);
    // const queryObj = { ...req.query };
    // excludedFeilds = ["limit", "page", "sort", "feilds"];

    // // make query object excluded feilds free

    // excludedFeilds.forEach((element) => {
    //   return delete queryObj[element];
    // });

    // // Make filter object acording to the moongoos $ sign  syntax

    // let queryString = JSON.stringify(queryObj);
    // queryString = queryString.replace(
    //   /\b(gte|gt|lte|lt)\b/g,
    //   (word) => `$${word}`
    // );

    // // Make Query First
    // let query = Tour.find(JSON.parse(queryString));

    // // filtering records logic

    // if (req.query.sort) {
    //   //query = query.sort(req.query.sort);

    //   // If we want to sort ob more then one condition basis
    //   query = query.sort(req.query.sort.split(",").join(" "));
    // } else {
    //   query = query.sort("-createdAt");
    // }

    // // Get Limiting Feilds

    // if (req.query.feilds) {
    //   let feilds = req.query.feilds.split(",").join(" ");
    //   query = query.select(feilds);
    // } else {
    //   query = query.select("-__v");
    // }

    // Pagination funtionality implementation

    // let page = req.query.page * 1 || 1;
    // let limit = req.query.limit * 1 || 100;

    // let skip = (page - 1) * limit;
    // query = query.skip(skip).limit(limit);

    // // Check if records exist or not

    // if (req.query.page) {
    //   const toursCount = await Tour.countDocuments();
    //   if (skip >= toursCount) {
    //     console.log("error coms up");
    //     throw new Error("This page is not exist");
    //   }

    // }

    // // EXECUTE QUERY

    // make object of the class

    let features = new APIFeatures1(Tour.find(), req.query)
      .filter()
      .sorting()
      .limitFields()
      .paginate();
    const tours = await features.query;

    // More advance filters like {difficulty:  'easy', duration:{ $gte : 3 }}

    // const features = new  APIFeatures(Tour.find(), req.query)
    //   .filter()
    //   .sort()
    //   .limitFields()
    //   .paginate();

    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({ _id: req.params.id })

    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({})
    // newTour.save()

    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: "$difficulty" },
          numTours: { $sum: 1 },
          numRatings: { $sum: "$ratingsQuantity" },
          avgRating: { $avg: "$ratingsAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }
    ]);

    res.status(200).json({
      status: "success",
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1; // 2021

    const plan = await Tour.aggregate([
      {
        $unwind: "$startDates",
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$startDates" },
          numTourStarts: { $sum: 1 },
          tours: { $push: "$name" },
        },
      },
      {
        $addFields: { month: "$_id" },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
