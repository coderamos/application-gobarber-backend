import jwt from 'jsonwebtoken';

import { authConfig } from '../../config';
import User from '../models/User';

class SessionController {
  async store(request, response) {
    const { email, password } = request.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return response.status(401).json({ error: 'USER NOT FOUND!' });
    }

    if (!(await user.checkPassword(password))) {
      return response.status(401).json({ error: 'PASSWORD INVALID!' });
    }

    const { id, name } = user;

    return response.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
