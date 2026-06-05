const notFound = (req, res) => {
  res.status(404).json({ message: "Route topilmadi" });
};

module.exports = { notFound };