/**
 * Ensure logged in for API calls (no redirection)
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */
module.exports = function ensureLoggedInAPI() {
  return function(req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.set('WWW-Authenticate', 'Basic realm="Minsel"') // TODO is it "basic"?
      res.sendStatus(401)
      return
    }
    next()
  }
}
