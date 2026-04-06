import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, orders] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.find().select('totalPrice status createdAt'),
    ]);

    const totalRevenue = orders
      .filter(o => o.status === 'Delivered')
      .reduce((sum, o) => sum + o.totalPrice, 0);

    const ordersByStatus = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    // Last 7 days revenue
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      const dayOrders = orders.filter(o => o.createdAt >= dayStart && o.createdAt <= dayEnd);
      last7Days.push({
        date: dayStart.toLocaleDateString('en-IN', { weekday: 'short' }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((s, o) => s + o.totalPrice, 0),
      });
    }

    res.json({
      success: true,
      stats: { totalUsers, totalProducts, totalOrders, totalRevenue, ordersByStatus, last7Days },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
