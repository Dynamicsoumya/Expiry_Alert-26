const Record = require("../models/Record");

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in30Days = new Date(today);
    in30Days.setDate(in30Days.getDate() + 30);
    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);
    console.log("USER ID:", userId);
    console.log(await Record.countDocuments());

    const [
      totalRecords,
      expiredRecords,
      expiringSoon,
      criticalRecords,
      recentlyAdded,
      upcomingRenewals,
      categoryBreakdown,
    ] = await Promise.all([
      Record.countDocuments({ user: userId, isArchived: false }),
      Record.find({
        user: userId,
        isArchived: false,
        expiryDate: { $lt: today },
      })
        .select("name category expiryDate priority")
        .sort({ expiryDate: -1 })
        .limit(5),
      Record.find({
        user: userId,
        isArchived: false,
        expiryDate: { $gte: today, $lte: in30Days },
      })
        .select("name category expiryDate priority")
        .sort({ expiryDate: 1 })
        .limit(10),
      Record.countDocuments({
        user: userId,
        isArchived: false,
        priority: "critical",
      }),
      Record.find({ user: userId, isArchived: false })
        .select("name category expiryDate status createdAt")
        .sort({ createdAt: -1 })
        .limit(5),
      Record.find({
        user: userId,
        isArchived: false,
        expiryDate: { $gte: today, $lte: in7Days },
      }).select("name category expiryDate priority assignedTo"),
      Record.aggregate([
        {
          $match: {
            user: require("mongoose").Types.ObjectId.createFromHexString(
              userId.toString(),
            ),
            isArchived: false,
          },
        },
        {
          $group: {
            _id: "$category",
            total: { $sum: 1 },
            expired: {
              $sum: { $cond: [{ $lt: ["$expiryDate", today] }, 1, 0] },
            },
            expiringSoon: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ["$expiryDate", today] },
                      { $lte: ["$expiryDate", in30Days] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        { $sort: { total: -1 } },
      ]),
    ]);

    res.json({
      success: true,
      dashboard: {
        summary: {
          total: totalRecords,
          expired: expiredRecords.length,
          expiringSoon: expiringSoon.length,
          active: totalRecords - expiredRecords.length - expiringSoon.length,
          critical: criticalRecords,
        },
        expiredRecords,
        expiringSoon,
        recentlyAdded,
        upcomingRenewals,
        categoryBreakdown,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
