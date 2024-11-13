const userAuthService = require("../services/userAuthService");

exports.register = async (req, res) => {
  try {
    const result = await userAuthService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await userAuthService.login(email, password);
    res.status(200).json({token: result.token });
  } catch (error) {
    const status = error.status || 400;
    res.status(status).json({ error: error.message });
  }
};

exports.loginWithPhone = async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    await userAuthService.loginWithPhone(mobileNumber);
    res.status(200).json({ message: "OTP sent to your mobile number" }); 
  } catch (error) {
    const status = error.status || 400;
    res.status(status).json({ error: error.message });
  }
};

exports.verifyOtpForLogin = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;
    const result = await userAuthService.verifyOtpForLogin(mobileNumber, otp);
    res.status(200).json({ user: result.user, token: result.token }); 
  } catch (error) {
    const status = error.status || 400;
    res.status(status).json({ error: error.message });
  }
};

exports.verifySession = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new Error("Authentication token is missing");
    }
    const user = await userAuthService.verifySession(token);
    res.json({ isLoggedIn: true, user, token }); 
  } catch (error) {
    const status = error.status || 401;
    res.status(status).json({ isLoggedIn: false, error: error.message });
  }
};

exports.logout = async (req, res) => {
  res.status(200).json({ message: "Logged out successfully" }); 
};
