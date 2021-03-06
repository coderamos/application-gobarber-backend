import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import * as Yup from 'yup';

import { QueueLib } from '../../../lib';
import { CancellationMailJob } from '../../jobs';
import { UserModel, AppointmentModel, FileModel } from '../../models';
import { NotificationSchema } from '../../schemas';

class AppointmentController {
  async index(request, response) {
    const { page = 1 } = request.query;

    const appointments = await AppointmentModel.findAll({
      where: { user_id: request.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancelable'],
      limit: 20,
      offset: (page - 1) * 20,
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
    const checkIsProvider = await UserModel.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!checkIsProvider) {
      return response
        .status(401)
        .json({ error: 'THIS IS NOT A VALID PROVIDER ID.' });
    }

    // check if 'user_id' is a provider
    if (provider_id === request.userId) {
      return response
        .status(401)
        .json({ error: 'SELF-SCHEDULING NOT ALLOWED.' });
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

    // notify provider
    const user = await UserModel.findByPk(request.userId);
    const formattedDate = format(hourStart, "dd 'de' MMMM', às' H:mm'h'", {
      locale: pt,
    });
    await NotificationSchema.create({
      content: `novo agendamento de ${user.name} para dia ${formattedDate}`,
      user: provider_id,
    });

    return response.json(appointment);
  }

  async delete(request, response) {
    const appointment = await AppointmentModel.findByPk(request.params.id, {
      include: [
        {
          model: UserModel,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: UserModel,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });
    if (appointment.user_id !== request.userId) {
      return response.status(401).json({
        error: "YOU DON'T HAVE PERMISSION TO CANCEL THIS APPOINTMENT. ",
      });
    }

    const toleranceDate = subHours(appointment.date, 2);
    if (isBefore(toleranceDate, new Date())) {
      return response
        .status(401)
        .json({ error: 'TOLERANCE TIME EXCEEDED (TWO HOURS).' });
    }
    appointment.canceled_at = new Date();
    await appointment.save();
    await QueueLib.add(CancellationMailJob.key, { appointment });

    return response.json(appointment);
  }
}

export default new AppointmentController();
