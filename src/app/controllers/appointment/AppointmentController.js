import { startOfHour, parseISO, isBefore } from 'date-fns';
import * as Yup from 'yup';

import { AppointmentModel, UserModel, FileModel } from '../../models';

class AppointmentController {
  async index(request, response) {
    const appointments = await AppointmentModel.findAll({
      where: { user_id: request.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'canceled_at'],
      include: [
        {
          model: UserModel,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: FileModel,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });
    return response.json(appointments);
  }

  async store(request, response) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: 'VALIDATION FAILS.' });
    }

    const { provider_id, date } = request.body;

    // check if 'provider_id' is a provider
    const isProvider = await UserModel.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return response
        .status(401)
        .json({ error: 'THIS IS NOT A VALID PROVIDER ID.' });
    }

    // check for past dates
    const hourStart = startOfHour(parseISO(date));
    if (isBefore(hourStart, new Date())) {
      return response
        .status(400)
        .json({ error: 'PAST DATES ARE NOT PERMITTED.' });
    }

    // check date availability
    const checkAvailabilty = await AppointmentModel.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });
    if (checkAvailabilty) {
      return response
        .status(400)
        .json({ error: 'APPOINTMENT DATE IS NOT AVAILABLE.' });
    }

    const appointment = await AppointmentModel.create({
      user_id: request.userId,
      provider_id,
      date,
      hourStart,
    });
    return response.json(appointment);
  }
}

export default new AppointmentController();
