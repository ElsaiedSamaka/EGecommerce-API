let middlewareObject = {};

//a middleware to check if a user is logged in or not
middlewareObject.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.send("authenticated");
};

middlewareObject.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.send("not authenticated");
};

module.exports = middlewareObject;
