export const validateBody = (schema) => (req, res, next) => {
  try {
    req.validatedBody = schema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      errors: err.issues ?? [],
    });
  }
};
export const validateParams = (schema) => (req, res, next) => {
  try {
    req.validatedParams = schema.parse(req.params);
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      errors: err.issues ?? [],
    });
  }
};
export const validateQuery = (schema) => (req, res, next) => {
  try {
    req.validatedQuery = schema.parse(req.query);
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      errors: err.issues ?? [],
    });
  }
};
