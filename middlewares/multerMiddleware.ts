import multer from 'multer';

const storage = multer.memoryStorage();

export const singleFileUpload = multer({ storage }).single('single_file');

export const multiFileUpload = multer({ storage }).array('multi_files');
