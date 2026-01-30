const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Token decoded successfully:', { userId: decoded.userId, userType: decoded.userType });
    
    // Map userId from token to id for consistency
    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
      userType: decoded.userType,
      name: decoded.name || 'Unknown',
      email: decoded.email || 'unknown@email.com'
    };
    next();
  } catch (error) {
    console.error('Auth error details:', error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
