const handleValidateToken = (req, res, db, jwt) => {
    // If the middleware passed, the token is valid
    const { user } = req;
    if (user) {
        db.select('*').from('users')
            .where('id', '=', user.id)
            .then(user => {
                const expiresIn = req.headers.authorization ? jwt.decode(req.headers.authorization).exp : null;
                res.json({ isValid: true, user: user[0], expiresIn: expiresIn });
            });
    } else {
        res.json({ isValid: false });
    } 
  }

export default handleValidateToken;
