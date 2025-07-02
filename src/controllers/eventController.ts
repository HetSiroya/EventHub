import { Request, Response } from "express";
import EventModel from "../models/eventModel";
import { CustomRequest } from "../middlewares/token-decode";
import { sendEventNotification } from "../helpers/emailService";


export const createEvent = async (req: CustomRequest, res: Response) => {
    try {
        const { title, description, date, location, category } = req.body;
        const poster = req.body.poster || { original: null, optimized: null };

        if (!req.user?.id) {
            return res.status(401).json({
                status: 401,
                message: "Unauthorized: User not authenticated",
            });
        }

        // Validate category
        const validCategories = [
            "conference",
            "workshop",
            "seminar",
            "networking",
            "other",
        ];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                status: 400,
                message: `Invalid category. Must be one of: ${validCategories.join(
                    ", "
                )}`,
            });
        }

        const newEvent = new EventModel({
            title,
            description,
            date,
            location,
            organizer: req.user.id,
            category,
            poster,
        });

        await newEvent.save();

        const [populatedEvent] = await EventModel.aggregate([
            {
                $match: { _id: newEvent._id }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'organizer',
                    foreignField: '_id',
                    as: 'organizer',
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                email: 1,
                                profilePicture: 1,
                                phoneNumber: 1,
                                role: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: '$organizer'
            }
        ]);
        // Send email notifications to all users
        await sendEventNotification(newEvent);
        return res.status(201).json({
            status: 201,
            message: "Event created successfully",
            data: populatedEvent,
        });
    } catch (error: any) {
        console.error("Event creation error:", error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const getAllEvents = async (req: Request, res: Response) => {
    try {
        const { category, date, search } = req.query;
        let query: any = { isActive: true };

        if (category) {
            query.category = category;
        }

        if (date) {
            query.date = { $gte: new Date(date as string) };
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        const events = await EventModel.find(query)
            .populate("organizer", "name email")
            .sort({ date: 1 })
            .lean();

        return res.status(200).json({
            status: 200,
            message: "Events retrieved successfully",
            data: events,
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const getEventById = async (req: Request, res: Response) => {
    try {
        const event = await EventModel.findById(req.params.id)
            .populate("organizer", "name email")
            .lean();

        if (!event || !event.isActive) {
            return res.status(404).json({
                status: 404,
                message: "Event not found",
            });
        }

        return res.status(200).json({
            status: 200,
            message: "Event retrieved successfully",
            data: event,
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const updateEvent = async (req: CustomRequest, res: Response) => {
    try {
        const { title, description, date, location, category } = req.body;
        const poster = req.body.poster;
        const event = await EventModel.findById(req.params.id);
        if (!event) {
            return res.status(404).json({
                status: 404,
                message: "Event not found",
            });
        }
        if (event.organizer.toString() !== req.user?.id) {
            return res.status(403).json({
                status: 403,
                message: "Unauthorized: You can only update your own events",
            });
        }
        const updatedEvent = await EventModel.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                date,
                location,
                category,
                ...(poster && { poster }),
            },
            { new: true }
        ).populate("organizer", "name email");

        return res.status(200).json({
            status: 200,
            message: "Event updated successfully",
            data: updatedEvent,
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const deleteEvent = async (req: CustomRequest, res: Response) => {
    try {
        const event = await EventModel.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                status: 404,
                message: "Event not found",
            });
        }

        if (event.organizer.toString() !== req.user?._id) {
            return res.status(403).json({
                status: 403,
                message: "Unauthorized: You can only delete your own events",
            });
        }

        // Soft delete
        event.isActive = false;
        await event.save();

        return res.status(200).json({
            status: 200,
            message: "Event deleted successfully",
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const getMyEvents = async (req: CustomRequest, res: Response) => {
    try {
        const events = await EventModel.find({
            organizer: req.user?._id,
            isActive: true,
        })
            .populate("organizer", "name email")
            .sort({ date: 1 })
            .lean();

        return res.status(200).json({
            status: 200,
            message: "Events retrieved successfully",
            data: events,
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const getPopularEvents = async (req: Request, res: Response) => {
    try {
        const popularEvents = await EventModel.aggregate([
            {
                $match: { isActive: true }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'organizer',
                    foreignField: '_id',
                    as: 'organizer',
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                email: 1,
                                profilePicture: 1,
                                role: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: '$organizer'
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'attendees',
                    foreignField: '_id',
                    as: 'attendeeDetails'
                }
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    date: 1,
                    location: 1,
                    category: 1,
                    poster: 1,
                    organizer: 1,
                    attendeeCount: { $size: { $ifNull: ["$attendees", []] } },
                    attendees: {
                        $map: {
                            input: "$attendeeDetails",
                            as: "attendee",
                            in: {
                                _id: "$$attendee._id",
                                name: "$$attendee.name",
                                email: "$$attendee.email"
                            }
                        }
                    }
                }
            },
            {
                $sort: { attendeeCount: -1 }
            },
            {
                $limit: 10
            }
        ]);

        return res.status(200).json({
            status: 200,
            message: "Popular events retrieved successfully",
            data: popularEvents
        });
    } catch (error: any) {
        console.error("Popular events error:", error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
};
