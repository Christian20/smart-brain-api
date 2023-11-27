const handleRegister = (req, res, db, bcrypt, generateSessionToken) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
        return res.status(400).json('Incorrect form submission.');
    }
    const hash = bcrypt.hashSync(password);
        db.transaction(trx => {
            trx.insert({
                hash: hash,
                email: email
            })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                return trx('users')
                    .returning('*')
                    .insert({
                        email: loginEmail[0].email,
                        name: name,
                        joined: new Date()
                    })
                    .then(user => {
                        const sessionToken = generateSessionToken(user[0]);
                        res.json({
                            user: user[0],
                            sessionToken: sessionToken
                        });
                    })
            })
            .then(trx.commit)
            .catch(trx.rollback)
        })    
    .catch(err => res.status(400).json('unable to register'));
}

module.exports = {
    handleRegister: handleRegister
}