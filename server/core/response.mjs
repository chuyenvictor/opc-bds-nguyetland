/**
 * server/core/response.mjs — Enterprise SaaS Standardized Response Engine
 * Standard format: { success, data, error, message, timestamp, meta }
 */

export function sendJson(res, statusCode, payload, extraHeaders = {}) {
    if (res.headersSent) return;
    const body = JSON.stringify(payload);
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
        'X-Powered-By': 'OPC-BDS-SaaS-Engine/2026',
        ...extraHeaders
    });
    res.end(body);
}

export function sendOk(res, data = {}, message = 'Thành công', meta = null) {
    sendJson(res, 200, {
        success: true,
        message,
        data,
        meta,
        timestamp: new Date().toISOString()
    });
}

export function sendCreated(res, data = {}, message = 'Đã tạo thành công') {
    sendJson(res, 201, {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
}

export function sendBadRequest(res, message = 'Yêu cầu không hợp lệ', errors = null) {
    sendJson(res, 400, {
        success: false,
        message,
        errors,
        timestamp: new Date().toISOString()
    });
}

export function sendUnauthorized(res, message = 'Vui lòng đăng nhập để tiếp tục') {
    sendJson(res, 401, {
        success: false,
        message,
        timestamp: new Date().toISOString()
    });
}

export function sendForbidden(res, message = 'Bạn không có quyền thực hiện thao tác này') {
    sendJson(res, 403, {
        success: false,
        message,
        timestamp: new Date().toISOString()
    });
}

export function sendNotFound(res, message = 'Tài nguyên không tồn tại') {
    sendJson(res, 404, {
        success: false,
        message,
        timestamp: new Date().toISOString()
    });
}

export function sendTooManyRequests(res, message = 'Bạn đang thao tác quá nhanh. Vui lòng thử lại sau.') {
    sendJson(res, 429, {
        success: false,
        message,
        timestamp: new Date().toISOString()
    });
}

export function sendInternalError(res, message = 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.') {
    sendJson(res, 500, {
        success: false,
        message,
        timestamp: new Date().toISOString()
    });
}
