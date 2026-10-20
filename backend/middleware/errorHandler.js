// Wrap async handlers so errors reach the error middleware instead of crashing.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Global error handler middleware
const errorHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server" });
};

module.exports = {
  wrap,
  errorHandler,
};
