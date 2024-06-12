import mongoose, { Model, Schema, Document } from 'mongoose';

export interface ISocialLinks extends Document {
  linkedInLink: string;
  twitterLink: string;
  instagramLink: string;
  youtubeLink: string;
  facebookLink: string;
  whatsappNo: string;
  pinterestLink: string;
}

const socialLinkSchema: Schema<ISocialLinks> = new Schema(
  {
    linkedInLink: {
      type: String,
      default: '',
    },
    twitterLink: {
      type: String,
      default: '',
    },
    instagramLink: {
      type: String,
      default: '',
    },
    youtubeLink: {
      type: String,
      default: '',
    },
    facebookLink: {
      type: String,
      default: '',
    },
    whatsappNo: {
      type: String,
      maxlength: 10,
      minlength: 10,
      default: '',
    },
    pinterestLink: {
      type: String,
      default: '',
    },
  },
  { timestamps: true, collection: 'social_links' }
);

const SocialLinks: Model<ISocialLinks> = mongoose.model('SocialLinks', socialLinkSchema);

export default SocialLinks;
