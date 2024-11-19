const { ENUM } = require('../common/enum');

class AttachmentType extends ENUM {
  static ENUM = {
    PROFILE_PICTURE: 'profile_picture',
    DOCUMENT: 'document',
    CERTIFICATE: 'certificate',
    LICENSE: 'license',
    TRANSCRIPT: 'transcript',
    IDENTIFICATION: 'identification',
    CONTRACT: 'contract',
    OTHER: 'other',
  };
}

exports.AttachmentType = AttachmentType;
