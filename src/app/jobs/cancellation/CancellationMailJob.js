import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

import { MailLib } from '../../../lib';

class CancellationMailJob {
  get key() {
    return 'CancellationMailJob';
  }

  async handle({ data }) {
    const { appointment } = data;
    await MailLib.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: 'APPOINTMENT: CANCELED',
      template: 'cancellation',
      context: {
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(parseISO(appointment.date), "dd 'de' MMMM', às' H:mm'h'", {
          locale: pt,
        }),
      },
    });
  }
}

export default new CancellationMailJob();
