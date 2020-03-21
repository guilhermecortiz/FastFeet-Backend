import * as Yup from 'yup';
// import sequelize, { Op } from 'sequelize';
import { Op } from 'sequelize';
import {
  // startOfDay,
  parseISO,
  isBefore,
  // format,
  startOfMinute,
} from 'date-fns';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
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

    const deliverymanExist = await Deliveryman.findByPk(
      req.body.deliveryman_id
    );

    if (!deliverymanExist) {
      return res.status(401).json({ error: 'Deliveryman is not exists' });
    }

    // const { recipient_id, deliveryman_id, product } = req.body;

    // const orderExist = await Order.findOne({
    //   where: { recipient_id, deliveryman_id, product },
    // });

    // if (orderExist) {
    //   return res.status(401).json({ error: 'Order already exists' });
    // }

    const order = await Order.create(req.body);

    return res.json(order);
  }

  async index(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .integer()
        .required(),
      end_date: Yup.boolean(),
      page: Yup.number().integer(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { page = 1, end_date = null } = req.query;

    const order = await Order.findAll({
      where: {
        deliveryman_id: req.body.id,
        canceled_at: null,
        end_date,
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
          model: Deliveryman,
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
      recipient_id: Yup.number().integer(),
      deliveryman_id: Yup.number()
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

    const {
      signature_id,
      canceled_at,
      start_date,
      end_date,
      deliveryman_id,
    } = req.body;

    if (deliveryman_id) {
      const deliveryExist = await Deliveryman.findByPk(deliveryman_id);

      if (!deliveryExist) {
        return res.status(401).json({ error: 'Deliveryman is not exists.' });
      }

      if (!order.deliveryman_id) {
        return res
          .status(401)
          .json({ error: 'Deliveryman already registered.' });
      }

      const startHour = new Date();
      startHour.setHours(8, 0, 0, 0);
      const hourStart = startOfMinute(parseISO(startHour.toISOString()));

      const endHour = new Date();
      // endHour.setHours(18, 0, 0, 0);
      endHour.setHours(21, 0, 0, 0);
      const hourEnd = startOfMinute(parseISO(endHour.toISOString()));
      const hourCurrent = startOfMinute(parseISO(start_date));

      if (isBefore(hourCurrent, hourStart)) {
        return res.json({
          error: 'The order must be collected between 8:00 and 18:00.',
        });
      }

      if (isBefore(hourEnd, hourCurrent)) {
        return res.json({
          error: 'The order must be collected between 8:00 and 18:00.',
        });
      }

      const orders = await Order.findAll({
        where: {
          start_date: { [Op.between]: [startHour, hourEnd] },
          deliveryman_id,
        },
      });

      if (orders.length >= 5) {
        return res.json({
          error: 'Deliveryman already has 5 deliveries on the day.',
        });
      }
    }

    if (end_date) {
      if (end_date === order.end_date) {
        return res.status(401).json({ error: 'Order already delivered.' });
      }
    }

    if (canceled_at) {
      if (canceled_at === order.canceled_at) {
        return res.status(401).json({ error: 'Order already canceled.' });
      }
    }

    if (signature_id) {
      const signatureExist = await Signature.findByPk(signature_id);

      if (!signatureExist) {
        return res
          .status(401)
          .json({ error: 'Signature image is not exists.' });
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
