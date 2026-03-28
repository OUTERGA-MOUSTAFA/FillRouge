const login = async (email, password) => {
    try {
        const data = await loginUser({ email, password });
        
        setUser(data.user);
        
        // حفظ البيانات
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.token) {
            localStorage.setItem('token', data.token);
        }

        return data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};