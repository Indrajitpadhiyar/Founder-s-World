export const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            // Replace req with validated parameters
            if (parsed.body)
                req.body = parsed.body;
            if (parsed.query)
                Object.assign(req.query, parsed.query);
            if (parsed.params)
                Object.assign(req.params, parsed.params);
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
//# sourceMappingURL=validation.js.map