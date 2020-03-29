import { UserModel, FileModel } from '../../models';

class ProviderController {
  async index(request, response) {
    const providers = await UserModel.findAll({
      where: { provider: true },
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: FileModel,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });
    return response.json(providers);
  }
}

export default new ProviderController();
