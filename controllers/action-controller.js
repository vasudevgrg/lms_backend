const { actionService } = require("../services");
const { HTTP_STATUS_CODE } = require("../lib/constants");

exports.getActions = async (req, res, next) => {
    try {
        const response = await actionService.getActions(req)
        if (!response.length) return res.status(HTTP_STATUS_CODE.ENUM.NO_CONTENT).json({ message: "No actions found." });
        res.status(HTTP_STATUS_CODE.ENUM.OK).json(response);
    } catch (error) {
        next(error)
    }
}