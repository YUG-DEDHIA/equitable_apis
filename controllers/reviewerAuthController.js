const authService = require("../services/reviewerAuthService");

exports.register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.cookie("login_token", result.token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ reviewer: result.reviewer, token: result.token });
  } catch (error) {
    const status = error.status || 400;
    res.status(status).json({ error: error.message });
  }
};

exports.loginWithPhone = async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    await authService.loginWithPhone(mobileNumber);
    res.status(200).json({ message: "OTP sent to your mobile number" }); 
  } catch (error) {
    const status = error.status || 400;
    res.status(status).json({ error: error.message });
  }
};

exports.verifyOtpForLogin = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;
    const result = await authService.verifyOtpForLogin(mobileNumber, otp);
    res.cookie("login_token", result.token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ reviewer: result.reviewer, token: result.token }); 
  } catch (error) {
    const status = error.status || 400;
    res.status(status).json({ error: error.message });
  }
};

exports.verifySession = async (req, res) => {
  try {
    const token = req.cookies.login_token;
    if (!token) {
      throw new Error("Authentication token is missing");
    }
    const user = await authService.verifySession(token);
    res.json({ isLoggedIn: true, user, token }); 
  } catch (error) {
    const status = error.status || 401;
    res.status(status).json({ isLoggedIn: false, error: error.message });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie("login_token", { httpOnly: true, sameSite: "strict" });
  res.status(200).json({ message: "Logged out successfully" }); 
};
