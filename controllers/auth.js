const {response} = require('express');
const bcrypt = require('bcryptjs');
const {validationResult} = require('express-validator');
const User = require('../models/User');
const {generateJWT} = require('../helpers/jwt');

const createUser = async(req, res = response) => {

    const {email, password} = req.body;

    try {
        let user = await User.findOne({email});

        if (user) {
            return res.status(400).json({
                ok: false,
                msg: "Un usuario existe con este email"
            });
        }
        user = new User(req.body);
        
        
        //Encripta pass
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(password, salt);
        
        //Graba user en DB
        await user.save();
        
        //Generar JWT
        const token = await generateJWT(user.id, user.name);

        res.status(201).json({
           ok: true,
           uid: user.id,
           name: user.name,
           token
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        })
    }

};

const loginUser = async (req, res = response) => {

    const {email, password} = req.body;


    try {

        const user = await User.findOne({email});
        // confirma usuario
        if (!user) {
            return res.status(400).json({
                ok: false,
                msg: "El usuario no existe"
            })
        }

        // confirma password
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: "Password incorrect"
            });
            
        }

        // Genera JWT

        const token = await generateJWT(user.id, user.name);

        res.json({
           ok: true,
           uid: user.id,
           name: user.name,
           token

        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        })
    }

};


const renewToken = async (req, res = response) => {

    const {uid, name} = req;

    const token = await generateJWT(uid, name);

    res.json({
       ok: true,
       token,
       name,
       uid
    })
};




module.exports = {
    createUser,
    loginUser,
    renewToken
}