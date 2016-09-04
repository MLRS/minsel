module.exports = function ensureLoggedIn() {
  return function(req, res, next) {
    next();
  }
}
