import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import { authConfig } from '../../../config';
import { UserModel, FileModel } from '../../models';

class SessionController {
  async store(request, response) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: 'VALIDATION FAILS.' });
    }

    const { email, password } = request.body;
    const user = await UserModel.findOne({
      where: { email },
      include: [
        {
          model: FileModel,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (!user) {
      return response.status(401).json({ error: 'USER NOT FOUND!' });
    }

    if (!(await user.checkPassword(password))) {
      return response.status(401).json({ error: 'PASSWORD INVALID!' });
    }

    const { id, name, avatar, provider } = user;

    return response.json({
      user: {
        id,
        name,
        email,
        provider,
        avatar,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
