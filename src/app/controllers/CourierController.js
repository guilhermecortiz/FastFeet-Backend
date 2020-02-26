import * as Yup from 'yup';
import Courier from '../models/Courier';
import File from '../models/File';

class CourierController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const CourierExists = await Courier.findOne({
      where: { email: req.body.email },
    });

    if (CourierExists) {
      return res.status(400).json({ error: 'Courier already exists.' });
    }

    const { id, name, email, avatar_id } = await Courier.create(req.body);
    return res.json({
      id,
      name,
      email,
      avatar_id,
    });
  }

  async index(req, res) {
    const providers = await Courier.findAll({
      attributes: ['id', 'name', 'email', 'avatar_id'],
      // include: [File],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });
    return res.json(providers);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .integer()
        .required(),
      name: Yup.string(),
      email: Yup.string().email(),
      avatar_id: Yup.number().integer(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const courier = await Courier.findByPk(req.body.id);

    if (!courier) {
      return res.status(400).json({ error: 'Courier is not exists.' });
    }
    const { email, avatar_id } = req.body;

    if (email) {
      if (email !== courier.email) {
        const courierExists = await Courier.findOne({ where: { email } });

        if (courierExists) {
          return res.status(400).json({ error: 'Courier already exists.' });
        }
      }
    }

    if (avatar_id) {
      if (avatar_id !== courier.avatar_id) {
        const avatar_idExists = await Courier.findOne({ where: { avatar_id } });

        if (avatar_idExists) {
          return res.status(400).json({ error: 'Avatar already exists.' });
        }
      }
    }
    if (!email && !avatar_id) {
      return res.status(401).json({ error: 'No new data has been entered.' });
    }

    const { id, name } = await courier.update(req.body);
    return res.json({
      id,
      name,
      email,
      avatar_id,
    });
  }
}

export default new CourierController();
