import express from 'express';
import { homeController } from '../controllers/homeController.js'
import { signinController } from '../controllers/signinController.js'
import { signupController } from '../controllers/signupController.js'
import { hpageController } from '../controllers/hpageController.js'
import { adminregController } from '../controllers/adminregController.js'
import { adminController } from '../controllers/adminController.js'
import { adminpageController } from '../controllers/adminpageController.js'
import { newsController } from '../controllers/newsController.js'
import { movieController } from '../controllers/movieController.js'
import { sendEmail } from '../index.js';
const routes = express.Router();
import User from '../models/users.js';
import multer from 'multer';
import fs from 'fs';


routes.get('/', homeController);
routes.get('/signin', signinController);
routes.get('/signup', signupController);
routes.get('/home', hpageController);
routes.get('/adminreg', adminregController);
routes.get('/admin', adminController);
routes.get('/adminpage', adminpageController);
routes.get('/news', newsController);
routes.get('/movie', movieController);


routes.post('/sendEmail', async (req, res) => {
    const { name, email, message } = req.body;
    try {
        await sendEmail(name, email, message); // Отправляем сообщение по электронной почте с параметрами
        res.send('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Error sending email');
    }
});


var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads');
    }, 
    filename: function(req, file, cb){
        cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname);
    },
});

var upload = multer({
    storage: storage,
}).single('image');

routes.post("/add", upload, async (req, res) => {
    const user = new User({
        name: req.body.name,
        description: req.body.description,
        location: req.body.location,
        image: req.file.filename, 
    });
    try {
        await user.save();
        req.session.message = {
          type: 'success',
          message: 'Place added Successfully!'
        };
        res.redirect("/adminpage");
      } catch (err) {
        console.error('Save Error:', err);
        res.json({ message: err.message, type: 'danger' });
      }
});



routes.get('/add', (req, res)=>{
    res.render('add_users', {title: 'Add Users'});
});

routes.get('/edit/:id', (req, res) => {
    let id = req.params.id;
    User.findById(id).exec()
        .then(user => {
            if (!user) {
                res.redirect('/');
            } else {
                res.render("edit_users", {
                    title: "Edit User",
                    user: user,
                });
            }
        })
        .catch(err => {
            console.error('Error:', err);
            res.redirect('/');
        });
});

routes.post('/update/:id', upload, async (req, res) => {
    try {
        let id = req.params.id;
        let new_image = '';

        if (req.file) {
            new_image = req.file.filename;
            try {
                fs.unlinkSync('./uploads/' + req.body.old_image);
            } catch (err) {
                console.log(err);
            }
        } else {
            new_image = req.body.old_image;
        }

        const result = await User.findByIdAndUpdate(
            id,
            {
                name: req.body.name,
                description: req.body.description,
                location: req.body.location,
                image: new_image,
            }
        ).exec();

        req.session.message = {
            type: 'success',
            message: 'User updated successfully',
        };
        res.redirect('/adminpage');
    } catch (err) {
        console.error('Error:', err);
        res.json({ message: err.message, type: 'danger' });
    }
});

routes.get('/delete/:id', async (req, res) => {
    try {
        let id = req.params.id;
        let user = await User.findById(id).exec();
        if (!user) {
            return res.json({ message: 'User not found' });
        }
        if (user.image !== '') {
            try {
                fs.unlinkSync('./uploads/' + user.image);
            } catch (err) {
                console.log(err);
            }
        }
        await User.findByIdAndDelete(id).exec();
        req.session.message = {
            type: 'info',
            message: 'User deleted successfully',
        };
        res.redirect('/adminpage');
    } catch (err) {
        console.error('Error:', err);
        res.json({ message: err.message });
    }
});


export default routes;