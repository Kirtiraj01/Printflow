import StudentSession from '../models/StudentSession.js';

export const getStudentSession = async (req, res, next) => {
  try {
    let session = await StudentSession.findOne({ deviceId: req.deviceId });
    if (!session) {
      session = await StudentSession.create({ deviceId: req.deviceId });
    }
    res.json({
      success: true,
      student: session,
    });
  } catch (err) {
    next(err);
  }
};

export const updateStudentSession = async (req, res, next) => {
  try {
    const { name, email, phone, department, rollNumber } = req.body;

    const session = await StudentSession.findOneAndUpdate(
      { deviceId: req.deviceId },
      {
        $set: {
          ...(name !== undefined && { name: name.trim() }),
          ...(email !== undefined && { email: email.trim() }),
          ...(phone !== undefined && { phone: phone.trim() }),
          ...(department !== undefined && { department: department.trim() }),
          ...(rollNumber !== undefined && { rollNumber: rollNumber.trim() }),
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({
      success: true,
      student: session,
    });
  } catch (err) {
    next(err);
  }
};

export const topUpWallet = async (req, res, next) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid top-up amount greater than 0.' });
    }

    const session = await StudentSession.findOneAndUpdate(
      { deviceId: req.deviceId },
      { $inc: { walletBalance: amount } },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: `Successfully added ₹${amount.toFixed(2)} to campus wallet.`,
      walletBalance: session.walletBalance,
      student: session,
    });
  } catch (err) {
    next(err);
  }
};

