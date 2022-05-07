const InvariantError = require('../../exceptions/InvariantError');
const { CoverAlbumsHeaderSchema } = require('./schema');

const UploadsValidator = {
  validateCoverAlbumsHeader: (headers) => {
    const validationResult = CoverAlbumsHeaderSchema.validate(headers);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UploadsValidator;
