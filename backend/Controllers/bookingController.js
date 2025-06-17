import Booking from '../models/Booking.js'

export const getBookerDetails = async (req, res) => {
  const { bookerId } = req.params;

  try {
    const booker = await Booking.findById(bookerId);

    if (!booker) {
      return res.status(404).json({ message: "not found" });
    }

    res.status(200).json(booker);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};