import { UserModel } from '../../models';
import { NotificationSchema } from '../../schemas';

class NotificationController {
  async index(request, response) {
    const checkIsProvider = await UserModel.findOne({
      where: { id: request.userId, provider: true },
    });
    if (!checkIsProvider) {
      return response.status(401).json({ error: 'USER IS NOT A PROVIDER.' });
    }

    const notifications = await NotificationSchema.find({
      user: request.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);
    return response.json(notifications);
  }

  async update(request, response) {
    const notification = await NotificationSchema.findByIdAndUpdate(
      request.params.id,
      { read: true },
      { new: true }
    );
    return response.json(notification);
  }
}

export default new NotificationController();
