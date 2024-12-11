import * as path from 'path'
import multer from 'multer';
import { customAlphabet } from 'nanoid'
import * as fs from 'fs';

export default () => ({
    uploadSinglePhoto(req, res) { 
        let fullNewFileName = ''
        const storage = multer.diskStorage({ 
            destination: (req, file, cb) => cb(null, path.join(path.resolve(), 'uploads/img', req.body.folder)),
            filename: (req, file, cb) => {
                const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)
                const newFilename = nanoid()
                const originalFileNameAsArray = file.originalname.split('.')
                fullNewFileName = `${newFilename}.${originalFileNameAsArray[originalFileNameAsArray.length - 1]}`
                cb(null, fullNewFileName)
            }
        });
        // аргумент 'files' это название поля под которым на фронте файл помещается в объект formData
        const uploadFile = multer({ storage }).single('file');
        uploadFile(req, res, async (error) => {
            if (error) {
                const errorMessage = error instanceof multer.MulterError 
                    // ошибка загрузки файла (ошибка клиента)
                    ? error.message 
                    // общая ошибка (ошибка сервера)
                    : 'Ошибка сохранения данных';
                return res.status(error instanceof multer.MulterError ? 400 : 500).send(`[api/files/upload-single-photo]: ${errorMessage} - ${error.message}`);
            } else {
                res.status(200).send({filename: fullNewFileName})
            }            
        });
    },
    getImg(folder, filename, res) { 
        const filePath = path.join(path.resolve(), 'uploads/img', folder, filename);
        return !fs.existsSync(filePath)
            ? res.status(404).json({msg: 'Изображение не найдено'})
            : res.sendFile(filePath)
    }  
})