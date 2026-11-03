const cloudinary = require('cloudinary').v2;
const { pipeline } = require('node:stream');
require('dotenv').config();  // Must be first

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const storage = {
  _handleFile(req, file, callback) {
    let completed = false;
    const done = (err, result) => {
      if (completed) return;
      completed = true;
      callback(err, result);
    };
    try {
      const upload = cloudinary.uploader.upload_stream({
        folder: 'WONDERLUST',
        allowed_formats: ['png', 'jpg', 'jpeg'],
        resource_type: 'image'
      }, (err, result) => {
        if (err) return done(err);
        done(null, { path: result.secure_url, filename: result.public_id, size: result.bytes });
      });
      pipeline(file.stream, upload, (err) => { if (err) done(err); });
    } catch (err) {
      done(err);
    }
  },
  _removeFile(req, file, callback) {
    cloudinary.uploader.destroy(file.filename, { invalidate: true }, callback);
  }
};

module.exports = {
    cloudinary, storage
};
