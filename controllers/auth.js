const { response } = require("express");
const bcrypt = require("bcryptjs");
const Usuario = require("../models/Usuario");
const { generarJWT } = require("../helpers/jwt");
const crearUsuario = async (req, res = response) => {
  const { email, password } = req.body;
  // Manejo de Errores
  // const errors = validationResult( req );

  // if( !errors.isEmpty() ) {
  //     return res.status(400).json({
  //         ok: false,
  //         errors: errors.mapped()
  //     })
  // }
  try {
    let usuario = await Usuario.findOne({ email: email });

    if (usuario) {
      return res.status(400).json({
        ok: false,
        msg: "Ese correo ya esta en uso",
      });
    }
    usuario = new Usuario(req.body);

    // Encriptar password
    const salt = bcrypt.genSaltSync();
    usuario.password = bcrypt.hashSync(password, salt);

    await usuario.save();

    // Generar JWT
    const token = await generarJWT(usuario.id, usuario.name);

    res.status(201).json({
      ok: true,
      uid: usuario.id,
      name: usuario.name,
      token,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "Por favor verifique que los datos sean correctos",
    });
  }
};

const loginUsuario = async (req, res = response) => {
  const { email, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ email: email });

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        msg: "El correo electronico no es correcto",
      });
    }

    // Confirmar los passwords

    const validPassword = bcrypt.compareSync(password, usuario.password);

    if (!validPassword) {
      return res.status(400).json({
        ok: false,
        msg: "Password Incorrecto",
      });
    }

    // Generar nuestro JWT (json web token)
    const token = await generarJWT(usuario.id, usuario.name);
    res.json({
      ok: true,
      uid: usuario.id,
      name: usuario.name,
      token,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "Por favor verifique que los datos sean correctos",
    });
  }
};

const revalidarToken = async (req, res = response) => {
  const { uid, name } = req;

  // generar un nuevo jwt

  const token = await generarJWT(uid, name);

  res.json({
    ok: true,
    uid, name,
    token,
  });
};

module.exports = {
  crearUsuario,
  loginUsuario,
  revalidarToken,
};
