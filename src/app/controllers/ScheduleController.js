import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';

class ScheduleController {
  async index(req, res) {
    const deliverymanExists = await Deliveryman.findOne({
      where: { id: req.body.deliveryman_id },
    });

    if (!deliverymanExists) {
      return res.status(401).json({ error: 'Deliveryman is not exists' });
    }

    const { date } = req.query;
    const parsedDate = parseISO(date);

    const deliveries = await Delivery.findAll({
      where: {
        deliveryman_id: req.body.deliveryman_id,
        canceled_at: null,
        start_date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      order: ['start_date'],
    });

    return res.json(deliveries);
  }
}

export default new ScheduleController();
