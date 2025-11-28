const { ObjectId } = require("mongodb");
const { getDb } = require("../db/connection");

// GET all bookings
exports.getAllBookings = async (req, res, next) => {
  try {
    const db = getDb();
    const bookings = await db.collection("bookings").find().toArray();
    res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
};

// GET booking by ID
exports.getBookingById = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid booking ID" });

    const db = getDb();
    const booking = await db.collection("bookings").findOne({
      _id: new ObjectId(id)
    });

    if (!booking)
      return res.status(404).json({ error: "Booking not found" });

    res.status(200).json(booking);
  } catch (err) {
    next(err);
  }
};

// CREATE booking
exports.createBooking = async (req, res, next) => {
  try {
    const {
      serviceId,
      customerId,
      providerId,
      scheduledFor,
      status,
      price,
      paymentMethod
    } = req.body;

    // Basic validation
    if (
      !serviceId ||
      !customerId ||
      !providerId ||
      !scheduledFor ||
      !status ||
      !price ||
      !paymentMethod
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = getDb();
    const result = await db.collection("bookings").insertOne({
      serviceId: new ObjectId(serviceId),
      customerId: new ObjectId(customerId),
      providerId: new ObjectId(providerId),
      scheduledFor: new Date(scheduledFor),
      status,
      price,
      paymentMethod,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({ insertedId: result.insertedId });
  } catch (err) {
    next(err);
  }
};

// UPDATE booking
exports.updateBooking = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid booking ID" });

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    // Convert IDs to ObjectId
    if (updateData.serviceId) updateData.serviceId = new ObjectId(updateData.serviceId);
    if (updateData.customerId) updateData.customerId = new ObjectId(updateData.customerId);
    if (updateData.providerId) updateData.providerId = new ObjectId(updateData.providerId);

    const db = getDb();
    const result = await db.collection("bookings").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0)
      return res.status(404).json({ error: "Booking not found" });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// DELETE booking
exports.deleteBooking = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid booking ID" });

    const db = getDb();
    const result = await db.collection("bookings").deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Booking not found" });

    res.status(200).json({ message: "Booking deleted" });
  } catch (err) {
    next(err);
  }
};
