import express from 'express';
import routes from './routes/routes.js';
import path from 'path';
import collection from './mongodb.js';
import User from './models/users.js'
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser'; // Импортируем body-parser
import nodemailer from 'nodemailer';
import { EMAIL, PASSWORD } from './env.js';
import session from 'express-session';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;


app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(session({
    secret: 'My secret key',
    saveUninitialized: true,
    resave: false,
}));

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.use(express.static('uploads'));

app.use("", routes);




app.use(express.static(path.join(process.cwd(), 'public')));
app.use(bodyParser.urlencoded({ extended: true })); // Используем body-parser для обработки URL-кодированных данных

app.set('view engine', 'ejs');
app.set('views', './views');

app.use('/', routes);

app.get('/signin', (req, res) => {
    res.render('signin');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/home', (req, res) => {
    res.render('home');
});

app.get('/admin', (req, res) => {
    res.render('admin');
});

app.get('/adminreg', (req, res) => {
    res.render('adminreg');
});

app.get('/news', (req, res) => {
    res.render('news');
});

app.get('/movie', (req, res) => {
    res.render('movie');
});

app.get('/adminpage', async (req, res) => {
    res.render('adminpage');
});

app.post('/adminreg', async (req, res) => {
    const { name, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new collection({ name: name, role: "admin", password: hashedPassword });
        await newUser.save();
        res.render('admin');
    } catch (error) {
        res.send('Error creating user: ' + error.message);
    }
});

app.post('/admin', async (req, res) => {
    const { name, password } = req.body;

    try {
        const user = await collection.findOne({ name: name, role: "admin" });
        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                res.render('adminpage', { username: name });
            } else {
                res.send('Wrong password');
            }
        } else {
            res.send('User not found or not an admin');
        }
    } catch (error) {
        res.send('Error logging in: ' + error.message);
    }
})

app.post('/adminpage', async (req, res) => {
    const { name, password } = req.body;

    try {
        const user = await collection.findOne({ name: name, role: "admin" });
        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                res.render('adminpage', { username: name });
            } else {
                res.send('Wrong password');
            }
        } else {
            res.send('User not found or not an admin');
        }
    } catch (error) {
        res.send('Error logging in: ' + error.message);
    }
})

app.post('/signup', async (req, res) => {
    const { name, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new collection({ name: name, role: "user", password: hashedPassword });
        await newUser.save();
        res.render('signin');
    } catch (error) {
        res.send('Error creating user: ' + error.message);
    }
});

app.post('/signin', async (req, res) => {
    const { name, password } = req.body;

    try {
        const user = await collection.findOne({ name: name });
        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                res.render('home', { username: name });
            } else {
                res.send('Wrong password');
            }
        } else {
            res.send('User not found');
        }
    } catch (error) {
        res.send('Error logging in: ' + error.message);
    }
})

export async function sendEmail(name, email, message) {
    try {
        // Create a transporter using your email configuration
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'aidyn.marat2004@gmail.com', // Your email address
                pass: 'diis gfyf woor uwqc' // Your email password
            }
        });

        // Define the email message
        let mailOptions = {
            from: 'aidyn.marat2004@gmail.com', // Sender email address
            to: email, // Recipient email address
            text: `Hello ${name},\n\n${message}`, // Plain text body with dynamic name and message
            html: `<b>Hello ${name},</b><p>${message}</p>` // HTML body with dynamic name and message
        };

        // Send the email
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ', info.messageId);
        return true; // Indicates email sent successfully
    } catch (error) {
        console.error('Error sending email: ', error);
        return false; // Indicates error sending email
    }
}

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});
