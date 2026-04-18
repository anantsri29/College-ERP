const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "college-erp/profiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill" }],
  },
});

const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "college-erp/documents",
    allowed_formats: ["pdf", "doc", "docx"],
    resource_type: "raw",
  },
});

const assignmentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "college-erp/assignments",
    resource_type: "auto",
  },
});

module.exports = { cloudinary, profileStorage, documentStorage, assignmentStorage };
