import User from '../models/users.js'; // Импортируем модель пользователя

const adminpageController = async (req, res) => {
    try {
        User.find()
            .then(users => {
                console.log("Users:", users);
                res.render('adminpage', {  users: users });
            })
            .catch(error => {
                console.error('Error fetching users:', error);
                res.status(500).send('Internal Server Error');
            });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Internal Server Error');
    }
};

export { adminpageController };
