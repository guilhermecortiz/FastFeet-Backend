import * as Yup from 'yup';
import { Op } from 'sequelize';
import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.number()
        .integer()
        .max(10),
      complement: Yup.string(),
      state: Yup.string()
        .max(2)
        .required(),
      city: Yup.string().required(),
      zip_code: Yup.string()
        .max(9)
        .required(),
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
        number: { [Op.or]: [req.body.number, ''] }, // (number = req.body.number) OR (number = '')
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
  //     name: Yup.string(),
  //     email: Yup.string().email(),
  //     oldPassword: Yup.string().min(6),
  //     password: Yup.string()
  //       .min(6)
  //       .when('oldPassword', (oldPassword, field) =>
  //         oldPassword ? field.required() : field
  //       ),
  //     confirmPassword: Yup.string().when('password', (password, field) =>
  //       password ? field.required().oneOf([Yup.ref('password')]) : field
  //     ),
  //   });

  //   if (!(await schema.isValid(req.body))) {
  //     return res.status(400).json({ error: 'Validation fails' });
  //   }

  //   const { email, oldPassword } = req.body;

  //   const user = await Recipient.findByPk(req.userId);

  //   if (email && email !== user.email) {
  //     const userExists = await Recipient.findOne({ where: { email } });

  //     if (userExists) {
  //       return res.status(400).json({ error: 'User already exists.' });
  //     }
  //   }

  //   if (oldPassword && !(await user.checkPassword(oldPassword))) {
  //     return res.status(401).json({ error: 'Password does not match.' });
  //   }

  //   const { id, name } = await user.update(req.body);
  //   return res.json({
  //     id,
  //     name,
  //     email,
  //   });
  // }
}

export default new RecipientController();
