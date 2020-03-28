import User from '../models/User';

class UserController {
  async index(request, response) {
    const users = await User.findAll();
    return response.json({ users });
  }

  async store(request, response) {
    const userExists = await User.findOne({
      where: { email: request.body.email },
    });

    if (userExists) {
      return response.status(400).json({ error: 'USER ALREADY EXISTS.' });
    }

    const { id, name, email, provider } = await User.create(request.body);

    return response.json({
      id,
      name,
      email,
      provider,
    });
  }

  async update(request, response) {
    const { email, oldPassword } = request.body;
    const user = await User.findByPk(request.userId);
    if (email && email !== user.email) {
      const userExists = await User.findOne({
        where: { email },
      });

      if (userExists) {
        return response.status(400).json({ error: 'USER ALREADY EXISTS.' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return response.status(401).json({ error: 'PASSWORD DOES NOT MATCH.' });
    }

    const { id, name, provider } = await user.update(request.body);

    return response.json({
      id,
      name,
      email,
      provider,
    });
  }
}

export default new UserController();
