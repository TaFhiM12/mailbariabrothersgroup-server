import type { RequestHandler } from "express";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { savingService } from "./saving.service.js";

export const savingController = {
    createSaving: (async (req, res, next) => {
        try {
            const result = await savingService.createSaving(req.user!.id, req.body);

            sendResponse({
                res,
                statusCode: 201,
                message: "Saving submitted successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }) satisfies RequestHandler,

    getMySavings: (async (req, res, next) => {
        try {
            const result = await savingService.getMySavings(req.user!.id);

            sendResponse({
                res,
                statusCode: 200,
                message: "My savings fetched successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }) satisfies RequestHandler,

    getAllSavings: (async (_req, res, next) => {
        try {
            const result = await savingService.getAllSavings();

            sendResponse({
                res,
                statusCode: 200,
                message: "All savings fetched successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }) satisfies RequestHandler,

    approveSaving: (async (req, res, next) => {
        try {
            const result = await savingService.approveSaving(
                req.params.id as string,
                req.user!.id
            );

            sendResponse({
                res,
                statusCode: 200,
                message: "Saving approved successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }) satisfies RequestHandler,

    rejectSaving: (async (req, res, next) => {
        try {
            const result = await savingService.rejectSaving(
                req.params.id as string,
                req.user!.id
            );

            sendResponse({
                res,
                statusCode: 200,
                message: "Saving rejected successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }) satisfies RequestHandler,
};