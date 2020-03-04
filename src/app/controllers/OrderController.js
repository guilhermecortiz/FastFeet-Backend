import * as Yup from 'yup';
// import { startOfDay, parseISO, isBefore, format } from 'date-fns';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Courier from '../models/Courier';
import Signature from '../models/Signature';

class OrderController {
  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number()
        .integer()
        .required(),
      deliveryman_id: Yup.number()
        .integer()
        .required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const recipientExist = await Recipient.findByPk(req.body.recipient_id);

    if (!recipientExist) {
      return res.status(401).json({ error: 'Recipient not found' });
    }

    const couriertExist = await Courier.findByPk(req.body.deliveryman_id);

    if (!couriertExist) {
      return res.status(401).json({ error: 'Courier not found' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    const orderExist = await Order.findOne({
      where: { recipient_id, deliveryman_id, product },
    });

    if (orderExist) {
      return res.status(401).json({ error: 'Order already exists' });
    }

    const order = await Order.create(req.body);

    return res.json(order);
  }

  async index(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .integer()
        .required(),
      page: Yup.number().integer(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { page = 1 } = req.query;

    const order = await Order.findAll({
      where: {
        deliveryman_id: req.body.id,
        canceled_at: null,
        end_date: null,
      },
      order: ['created_at'],
      attributes: ['id', 'product'],
      limit: 1,
      offset: (page - 1) * 1,
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'name'],
        },
        {
          model: Signature,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
        {
          model: Courier,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return res.json(order);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .integer()
        .required(),
      signature_id: Yup.number(),
      canceled_at: Yup.date(),
      start_date: Yup.date(),
      end_date: Yup.date(),
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const order = await Order.findByPk(req.body.id);

    if (!order) {
      return res.status(401).json({ error: 'Order is not exists.' });
    }

    const {
      signature_id,
      canceled_at,
      start_date,
      end_date,
      recipient_id,
      deliveryman_id,
    } = req.body;

    if (deliveryman_id) {
      const couriertExist = await Courier.findByPk(deliveryman_id);

      if (!couriertExist) {
        return res.status(401).json({ error: 'Courier is not exists.' });
      }

      if (deliveryman_id === order.deliveryman_id) {
        return res.status(401).json({ error: 'Courier already registered.' });
      }
    }

    if (recipient_id) {
      const recipientExist = await Recipient.findByPk(recipient_id);

      if (!recipientExist) {
        return res.status(401).json({ error: 'Recipient is not exists.' });
      }
      if (recipient_id === order.recipient_id) {
        return res.status(401).json({ error: 'Recipient already registered.' });
      }
    }

    if (end_date && end_date === order.end_date) {
      return res.status(401).json({ error: 'Order already delivered.' });
    }

    if (start_date && start_date === order.start_date) {
      return res.status(401).json({ error: 'Order already withdrawn.' });
    }

    if (canceled_at && canceled_at === order.canceled_at) {
      return res.status(401).json({ error: 'Order already canceled.' });
    }

    if (signature_id) {
      const signatureExist = await Signature.findByPk(signature_id);

      if (!signatureExist) {
        return res.status(401).json({ error: 'Signature is not exists.' });
      }

      if (signature_id === order.signature_id) {
        return res.status(401).json({ error: 'Signature already registered.' });
      }
    }

    const orderUpdate = await order.update(req.body);

    return res.json(orderUpdate);
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .integer()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const order = await Order.findByPk(req.body.id);

    if (!order) {
      return res.status(401).json({ error: 'Order is not exists.' });
    }

    order.destroy();

    return res.json({ message: 'Order Deleted.' });
  }
}

export default new OrderController();
