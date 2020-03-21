import * as Yup from 'yup';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
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

    const DeliverymanExists = await Deliveryman.findOne({
      where: { email: req.body.email },
    });

    if (DeliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman already exists.' });
    }

    const { id, name, email, avatar_id } = await Deliveryman.create(req.body);
    return res.json({
      id,
      name,
      email,
      avatar_id,
    });
  }

  async index(req, res) {
    const delivery = await Deliveryman.findAll({
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });
    return res.json(delivery);
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

    const deliveryman = await Deliveryman.findByPk(req.body.id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman is not exists.' });
    }
    const { email, avatar_id } = req.body;

    if (email) {
      if (email !== deliveryman.email) {
        const deliverymanExists = await Deliveryman.findOne({
          where: { email },
        });

        if (deliverymanExists) {
          return res.status(400).json({ error: 'Deliveryman already exists.' });
        }
      }
    }

    if (avatar_id) {
      if (avatar_id !== deliveryman.avatar_id) {
        const avatar_idExists = await Deliveryman.findOne({
          where: { avatar_id },
        });

        if (avatar_idExists) {
          return res.status(400).json({ error: 'Avatar already exists.' });
        }
      }
    }
    if (!email && !avatar_id) {
      return res.status(401).json({ error: 'No new data has been entered.' });
    }

    const { id, name } = await Deliveryman.update(req.body);
    return res.json({
      id,
      name,
      email,
      avatar_id,
    });
  }
}

export default new DeliverymanController();
