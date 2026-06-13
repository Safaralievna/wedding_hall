const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?998\d{9}$/;

const isString = (value) => typeof value === "string" && value.trim().length > 0;
const isNumber = (value) => value !== null && value !== undefined && !Number.isNaN(Number(value));
const isPositiveNumber = (value) => isNumber(value) && Number(value) > 0;
const isPositiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0;

const validatePasswordStrength = (password) =>
  typeof password === "string" &&
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /\d/.test(password);

const validatePhone = (phone) => phoneRegex.test(String(phone || "").trim());
const validateEmail = (email) => emailRegex.test(String(email || "").trim());

const validators = {
  registerUser: (body) => {
    const errors = [];
    if (!isString(body.firstName)) errors.push("firstName majburiy");
    if (!isString(body.lastName)) errors.push("lastName majburiy");
    if (!validatePhone(body.phone)) errors.push("phone formati noto'g'ri");
    if (!isString(body.password)) errors.push("password majburiy");
    if (!validatePasswordStrength(body.password)) errors.push("password kamida 8 belgi, katta/kichik harf va raqamdan iborat bo'lishi kerak");
    return errors;
  },
  createOwner: (body) => {
    const errors = [];
    if (!isString(body.firstName)) errors.push("firstName majburiy");
    if (!isString(body.lastName)) errors.push("lastName majburiy");
    if (!validateEmail(body.email)) errors.push("email formati noto'g'ri");
    if (!isString(body.username)) errors.push("username majburiy");
    if (!isString(body.password)) errors.push("password majburiy");
    if (!validatePasswordStrength(body.password)) errors.push("password kamida 8 belgi, katta/kichik harf va raqamdan iborat bo'lishi kerak");
    return errors;
  },
  loginUser: (body) => {
    const errors = [];
    const identifier = body.login || body.phone;
    if (!isString(identifier)) errors.push("login majburiy (telefon, email yoki username)");
    if (!isString(body.password)) errors.push("password majburiy");
    return errors;
  },
  verifyOwnerOtp: (body) => {
    const errors = [];
    if (!isString(body.username)) errors.push("username majburiy");
    if (!isString(body.otp) || String(body.otp).length !== 6) errors.push("otp 6 xonali bo'lishi kerak");
    return errors;
  },
  createVenue: (body) => {
    const errors = [];
    if (!isString(body.name)) errors.push("name majburiy");
    if (!isPositiveInteger(body.districtId)) errors.push("districtId noto'g'ri");
    if (!isString(body.address)) errors.push("address majburiy");
    if (!isPositiveInteger(body.capacity)) errors.push("capacity musbat son bo'lishi kerak");
    if (!isPositiveNumber(body.price)) errors.push("price musbat son bo'lishi kerak");
    if (!validatePhone(body.phone)) errors.push("phone formati noto'g'ri");
    return errors;
  },
  createBooking: (body) => {
    const errors = [];
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!isPositiveInteger(body.venueId)) errors.push("venueId noto'g'ri");
    if (!isString(body.eventDate)) errors.push("eventDate majburiy");
    if (!isString(body.weddingTime) || !timeRegex.test(body.weddingTime)) errors.push("weddingTime MM:SS formatida majburiy");
    if (!isString(body.brideName)) errors.push("brideName majburiy");
    if (!isString(body.groomName)) errors.push("groomName majburiy");
    if (!isPositiveInteger(body.guestCount)) errors.push("guestCount musbat son bo'lishi kerak");
    return errors;
  },
  saveKarnaySurnay: (body) => {
    const errors = [];
    if (body.available === undefined) errors.push("available majburiy");
    if (body.available && !isPositiveNumber(body.price)) errors.push("price musbat son bo'lishi kerak");
    return errors;
  },
};

module.exports = {
  validators,
  validatePhone,
  validateEmail,
  validatePasswordStrength,
};