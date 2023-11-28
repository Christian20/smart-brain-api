console.log('handling sign-in...');
const handleSignIn = (req, res, db, bcrypt, generateSessionToken) => {
    console.log('handling sign-in...');
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json('Incorrect form submission.');
    }
    console.log('req body: ', req.body);
    db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data => {
        const isValid =bcrypt.compareSync(password, data[0].hash);
        if(isValid) {
            return db.select('*').from('users')
            .where('email', '=', email)
            .then(user => {
                const sessionToken = generateSessionToken(user[0]);
                res.json({
                    user: user[0],
                    sessionToken: sessionToken
                });
            })
            .catch(err => res.status(400).json('unable to get user'))
        } else {
            res.status(400).json('wrong credentials')
        }
        
    })
    .catch(err => res.status(400).json('wrong credentials'))
}

export default handleSignIn;