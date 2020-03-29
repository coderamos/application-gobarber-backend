import { FileModel } from '../../models';

class FileController {
  async store(request, response) {
    const { originalname: name, filename: path } = request.file;
    const file = await FileModel.create({
      name,
      path,
    });
    return response.json(file);
  }
}

export default new FileController();
