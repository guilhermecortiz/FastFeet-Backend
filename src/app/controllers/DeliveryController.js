import * as Yup from 'yup';
// import sequelize, { Op } from 'sequelize';
// import { Op } from 'sequelize';
import {
  // startOfDay,
  parseISO,
  isBefore,
  // format,
  startOfMinute,
} from 'date-fns';

import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import Signature from '../models/Signature';
import Nofitication from '../schemas/Notification';

class DeliveryController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const delivery = await Delivery.findAll({
      where: {
        canceled_at: null,
        end_date: null,
      },
      order: ['created_at'],
      attributes: ['id', 'product', 'canceled_at', 'end_date'],
      limit: 5,
      offset: (page - 1) * 5,
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

    return res.json(delivery);
  }

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

    // const deliveryExist = await Delivery.findOne({
    //   where: { recipient_id, deliveryman_id, product },
    // });

    // if (deliveryExist) {
    //   return res.status(401).json({ error: 'Delivery already exists' });
    // }

    const delivery = await Delivery.create(req.body);

    /**
     *  Notify Deliveryman
     */
    const client =
      `New delivery for client ${recipientExist.name} at the address` +
      ` ${recipientExist.street}, ${recipientExist.number}` +
      `, ${recipientExist.complement}` +
      `, ${recipientExist.city}/${recipientExist.state}` +
      `, zip code: ${recipientExist.zip_code}.`;

    console.log(client);

    await Nofitication.create({
      content: client,
      deliveryman: delivery.deliveryman_id,
    });

    return res.json(delivery);
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

    const delivery = await Delivery.findByPk(req.body.id);

    if (!delivery) {
      return res.status(401).json({ error: 'Delivery is not exists.' });
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

      if (!delivery.deliveryman_id) {
        return res
          .status(401)
          .json({ error: 'Deliveryman already registered.' });
      }

      const startHour = new Date();
      startHour.setHours(8, 0, 0, 0);
      const hourStart = startOfMinute(parseISO(startHour.toISOString()));

      const endHour = new Date();
      endHour.setHours(18, 0, 0, 0);
      // endHour.setHours(21, 0, 0, 0);
      const hourEnd = startOfMinute(parseISO(endHour.toISOString()));
      const hourCurrent = parseISO(start_date);

      if (isBefore(hourCurrent, hourStart)) {
        return res.json({
          error: 'The delivery must be collected between 8:00 and 18:00.',
        });
      }

      if (isBefore(hourEnd, hourCurrent)) {
        return res.json({
          error: 'The delivery must be collected between 8:00 and 18:00.',
        });
      }

      const deliveries = await Delivery.findAll({
        where: {
          start_date,
          deliveryman_id,
        },
      });

      if (deliveries.length >= 5) {
        return res.json({
          error: 'Deliveryman already has 5 deliveries on the day.',
        });
      }
    }

    if (canceled_at) {
      if (canceled_at === delivery.canceled_at) {
        return res.status(401).json({ error: 'Delivery already canceled.' });
      }
    }

    if (end_date) {
      if (end_date === delivery.end_date) {
        return res.status(401).json({ error: 'Delivery already delivered.' });
      }

      if (signature_id) {
        const signatureExist = await Signature.findByPk(signature_id);

        if (!signatureExist) {
          return res
            .status(401)
            .json({ error: 'Signature image is not exists.' });
        }

        if (signature_id === delivery.signature_id) {
          return res
            .status(401)
            .json({ error: 'Signature already registered.' });
        }
      }
    }

    const deliveryUpdate = await delivery.update(req.body);

    return res.json(deliveryUpdate);
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

    const delivery = await Delivery.findByPk(req.body.id);

    if (!delivery) {
      return res.status(401).json({ error: 'Delivery is not exists.' });
    }

    delivery.destroy();

    return res.json({ message: 'Delivery Deleted.' });
  }
}

export default new DeliveryController();
