class APIFeatures {
  query;
  queryStr;

  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    //Basic filter
    const queryObj = { ...this.queryStr };
    const excludeQuery = ["page", "sort", "limit", "fields"];
    excludeQuery.forEach((e) => delete queryObj[e]);

    //Advance filter
    let queryStr = JSON.stringify(queryObj);
    //replace lt => $lt
    queryStr = JSON.parse(
      queryStr.replace(/\b(lt|gt|gte|lte)\b/g, (match) => `$${match}`)
    );
    this.query = this.query.find(queryStr);
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortQuery = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortQuery);
    }
    return this;
  }

  limitFields() {
    // Fields limit
    if (this.queryStr.fields) {
      const selectQuery = this.queryStr.fields.split(",").join(" ");
      this.query = this.query.select(selectQuery);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    const page = Number(this.queryStr.page) || 1;
    const limit = Number(this.queryStr.limit) || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
