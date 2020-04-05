import * as Yup from 'yup';

import { UserModel, FileModel } from '../../models';

class UserController {
  async index(request, response) {
    const users = await UserModel.findAll();
    return response.json(users);
  }

  async store(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: 'VALIDATION FAILS.' });
    }

    const userExists = await UserModel.findOne({
      where: { email: request.body.email },
    });

    if (userExists) {
      return response.status(400).json({ error: 'USER ALREADY EXISTS.' });
    }

    const { id, name, email, provider } = await UserModel.create(request.body);

    return response.json({
      id,
      name,
      email,
      provider,
    });
  }

  async update(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: 'VALIDATION FAILS.' });
    }

    const { email, oldPassword } = request.body;
    const user = await UserModel.findByPk(request.userId);
    if (email && email !== user.email) {
      const userExists = await UserModel.findOne({
        where: { email },
      });

      if (userExists) {
        return response.status(400).json({ error: 'USER ALREADY EXISTS.' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return response.status(401).json({ error: 'PASSWORD DOES NOT MATCH.' });
    }

    await user.update(request.body);

    const { id, name, avatar } = await UserModel.findByPk(request.userId, {
      include: [
        {
          model: FileModel,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return response.json({
      id,
      name,
      email,
      avatar,
    });
  }
}

export default new UserController();
