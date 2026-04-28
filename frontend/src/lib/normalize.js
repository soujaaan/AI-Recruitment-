export const normalizeListResponse = (payload, key) => {
    if (!payload) {
        return { items: [], pagination: null };
    }

    const data = payload.data ?? payload;
    return {
        items: data?.[key] || data?.[key]?.items || data?.items || [],
        pagination: data?.pagination || null,
        raw: data,
    };
};

export const normalizeSingleResponse = (payload, key) => {
    if (!payload) {
        return null;
    }

    const data = payload.data ?? payload;
    return data?.[key] || data?.item || data?.data || data;
};

export const normalizeRole = (role) => {
    if (role === "student") {
        return "candidate";
    }

    return role || "candidate";
};

export const normalizeUser = (user) => {
    if (!user) {
        return null;
    }

    return {
        ...user,
        role: normalizeRole(user.role),
    };
};
