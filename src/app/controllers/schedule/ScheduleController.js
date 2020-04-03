import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';

import { AppointmentModel, UserModel } from '../../models';

class ScheduleController {
  async index(request, response) {
    const checkUserProvider = await UserModel.findOne({
      where: { id: request.userId, provider: true },
    });
    if (!checkUserProvider) {
      return response.status(401).json({ error: 'USER IS NOT A PROVIDER.' });
    }

    // 2020-04-02T00:00:00-03:00
    const { date } = request.query;
    const parsedDate = parseISO(date);

    const appointments = await AppointmentModel.findAll({
      where: {
        provider_id: request.userId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      order: ['date'],
    });

    return response.json(appointments);
  }
}

export default new ScheduleController();
