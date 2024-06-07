const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {

  const token =
    req.body.token || req.query.token || req.headers.authorization;
  console.log(token)
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const SplitedToken = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(SplitedToken,process.env.TOKEN_KEY_SECERT);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = {
  verifyToken: verifyToken,
};
