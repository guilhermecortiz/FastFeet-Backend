import Signature from '../models/Signature';

class SignatureController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;

    const signature = await Signature.create({
      name,
      path,
    });

    return res.json(signature);
    // return res.json(req.file);
    // console.log(req.file);
  }
}

export default new SignatureController();
