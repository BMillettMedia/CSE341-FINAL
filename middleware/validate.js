const validator = require('../CSE341-FINAL/helpers/validate');

const saveCustomer = (req, res, next) => {
  const validationRule = {
    customerId: 'required|int',
    providerId: 'required|int',
    scheduledFor: 'required|string',
    status: 'required|string',
    price: 'int',
    paymentMethod: 'required|string',
  };

  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: err
      });
    }
    next();
  });
};

module.exports = {
  saveCustomer,
};
