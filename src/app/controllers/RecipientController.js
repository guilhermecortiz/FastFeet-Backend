import * as Yup from 'yup';
import { Op } from 'sequelize';
import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.number().integer(),
      // .max(10),
      complement: Yup.string(),
      state: Yup.string().max(2),
      city: Yup.string(),
      zip_code: Yup.string().max(9),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const AddressExists = await Recipient.findOne({
      where: {
        zip_code: req.body.zip_code,
        city: req.body.city,
        state: req.body.state,
        street: req.body.street,
        number: { [Op.or]: [req.body.number, 0] }, // (number = req.body.number) OR (number = '')
        name: req.body.name,
        complement: { [Op.or]: [req.body.complement, ''] }, // (complement = req.body.complement) OR (complement = '')
      },
    });

    if (AddressExists) {
      return res.status(400).json({ error: 'Address already exists.' });
    }

    const Address = await Recipient.create(req.body);
    return res.json(Address);
  }

  // async update(req, res) {
  //   const schema = Yup.object().shape({
  //     id: Yup.number()
  //       .integer()
  //       .required(),
  //     name: Yup.string(),
  //     street: Yup.string(),
  //     number: Yup.number().integer(),
  //     complement: Yup.string(),
  //     state: Yup.string().max(2),
  //     city: Yup.string(),
  //   });
  //   if (!(await schema.isValid(req.body))) {
  //     return res.status(400).json({ error: 'Validation fails' });
  //   }

  //   const recipient = await Recipient.findByPk(req.body.id);

  //   if (!recipient) {
  //     return res.status(400).json({ error: 'Recipient is not exists.' });
  //   }

  //   const { name, street, number, complement, state, city } = req.body;

  //   if (!name && !street && !number && !complement && !state && !city) {
  //     return res
  //       .status(401)
  //       .json({ error: 'No information has been changed.' });
  //   }

  //   if (name && name !== recipient.name) {
  //     const recipientExists = await Recipient.findOne({ where: { name } });

  //     if (recipientExists) {
  //       return res
  //         .status(400)
  //         .json({ error: `Recipient with name ${name} already existe.` });
  //     }
  //   }

  //   const recipientUpdate = await recipient.update(req.body);

  //   return res.json(recipientUpdate);
  // }
}

export default new RecipientController();
