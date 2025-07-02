import { Request, Response } from "express";
import { CustomRequest } from "../middlewares/token-decode";
import eventModel from "../models/eventModel";
import JoinModel from "../models/joinModel";

export const joinEvent = async (req: CustomRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.id;
    const exist = await eventModel.findOne({
      _id: eventId,
    });
    if (!exist) {
      return res.status(404).json({
        status: 404,
        message: "Event not found",
      });
    }
    const user = await eventModel.findOne({
      _id: eventId,
      participants: userId,
    });
    if (user) {
      return res.status(400).json({
        status: 400,
        message: "You have already joined this event",
      });
    }
    const newUser = new JoinModel({
      userId: userId,
      eventId: eventId,
    });
    await newUser.save();

    return res.status(200).json({
      status: 200,
      message: "You have joined the event successfully",
      data: newUser,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
