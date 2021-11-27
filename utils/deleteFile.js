const fs = require("fs");
const path = require("path");

module.exports = (photoFolder, photoName) => {
  fs.unlink(
    path.join(
      path.dirname(require.main.filename),
      "public",
      "img",
      photoFolder,
      photoName
    ),
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
};
