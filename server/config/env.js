const requiredEnv = [
    "MONGO_URI",
    "JWT_SECRET",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "FRONTEND_URL",
];

const validateEnv = () => {
    const missing = requiredEnv.filter(
        (key) => !process.env[key]
    );

    if (missing.length > 0) {
        console.error(
            `Missing environment variables: ${missing.join(", ")}`
        );

        process.exit(1);
    }
};

module.exports = validateEnv;