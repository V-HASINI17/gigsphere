// Custom Security Middleware for GigSphere

// 1. Security Headers (similar to helmet)
exports.secureHeaders = (req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.tile.openstreetmap.org https://unpkg.com; connect-src 'self' ws: wss:;");
  next();
};

// 2. Simple Rate Limiter (Memory-based)
const rateLimitMap = new Map();
exports.rateLimiter = (limit = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const record = rateLimitMap.get(ip);
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }
    
    record.count++;
    if (record.count > limit) {
      return res.status(429).json({
        message: "Too many requests from this IP, please try again later."
      });
    }
    
    next();
  };
};

// 3. XSS Sanitizer Middleware (recursively strips HTML tags from input)
const stripHtmlTags = (str) => {
  if (typeof str !== "string") return str;
  return str.replace(/<[^>]*>/g, "");
};

exports.sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = stripHtmlTags(req.body[key]);
      } else if (typeof req.body[key] === "object" && req.body[key] !== null) {
        // Simple recursion for nested objects
        for (const subKey in req.body[key]) {
          if (typeof req.body[key][subKey] === "string") {
            req.body[key][subKey] = stripHtmlTags(req.body[key][subKey]);
          }
        }
      }
    }
  }
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === "string") {
        req.query[key] = stripHtmlTags(req.query[key]);
      }
    }
  }
  next();
};

// 4. Input Validation Helpers
exports.validateAuthRegister = (req, res, next) => {
  const { name, email, password, phone, role } = req.body;
  if (!name || !email || !password || !phone || !role) {
    return res.status(400).json({ message: "All registration fields are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  next();
};
