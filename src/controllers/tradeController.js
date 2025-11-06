import { User } from "../models/userModels.js";
import { Holding } from "../models/holdingModel.js";
import { Order } from "../models/orderModels.js";
import { ApiErrorHandler } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


export const tradeStock = async (req, res, next) => {
  try {
    const { name, qty, price, mode } = req.body;
    const userId = req.auth._id;

    const user = await User.findById(userId)
      .populate("holding")
      .populate("order");

    if (!user) throw new ApiErrorHandler(404, "User not found");

    const totalCost = qty * price;
    const isBuy = mode === "buy";

    let holding;

    //  BUY SECTION 
    if (isBuy) {
      if (user.balance < totalCost) {
        throw new ApiErrorHandler(400, "Insufficient balance");
      }

      // Check if user already holds this stock
      holding = await Holding.findOne({
        _id: { $in: user.holding },
        name,
      });

      if (holding) {
        // Update existing holding
        const totalValue = holding.qty * holding.avg + totalCost;
        const newQty = holding.qty + qty;

        holding.avg = totalValue / newQty;
        holding.qty = newQty;
        holding.price = price;
        holding.net = `${(Math.random() * (24.33 + 9) - 9).toFixed(2)}%`;
        holding.day = `${(Math.random() * (4 + 1) - 1).toFixed(2)}%`;

        await holding.save();
      } else {
        // Create new holding
        holding = new Holding({
          name,
          qty,
          avg: price,
          price,
        });
        await holding.save();

        // Push new holding to user’s holdings array
        user.holding.push(holding._id);
      }

      // Deduct balance and create order
      user.balance -= totalCost;

      const order = new Order({
        orderName: name,
        qty,
        price,
        mode: "buy",
      });
      await order.save();

      user.order.push(order._id);

      await user.save();

      return res.status(200).json(
        new ApiResponse(
          200,
          { user, holding, order },
          "✅ Stock bought successfully"
        )
      );
    }

    // ============= SELL SECTION =============
    else {
      holding = await Holding.findOne({
        _id: { $in: user.holding },
        name,
      });

      if (!holding || holding.qty < qty) {
        throw new ApiErrorHandler(400, "Not enough quantity to sell");
      }

      // Update holding quantity
      holding.qty -= qty;
      user.balance += totalCost;

      const order = new Order({
        orderName: name,
        qty,
        price,
        mode: "sell",
      });
      await order.save();

      user.order.push(order._id);

      // If holding is 0, remove it completely
      if (holding.qty === 0) {
        await Holding.deleteOne({ _id: holding._id });
        user.holding = user.holding.filter(
          (id) => id.toString() !== holding._id.toString()
        );
      } else {
        await holding.save();
      }

      await user.save();

      return res.status(200).json(
        new ApiResponse(
          200,
          { user, holding, order },
          "✅ Stock sold successfully"
        )
      );
    }
  } catch (error) {
    next(error);
  }
};
