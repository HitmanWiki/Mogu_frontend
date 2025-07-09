export async function setBoostAPI(user, boost) {
    try {
        const response = await fetch("https://mogu-backend.vercel.app/api/setBoost", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user, boost }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Boost set failed");
        }

        return data;
    } catch (err) {
        console.error("API call failed:", err);
        throw err;
    }
}
