const mongoose = require("mongoose");

const resumeModel = new mongoose.model({
    userinfo: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    education: {
        type: Array,
        required: [true, "Education is required"],
    },
    skill: {
        type: Array,
        required: [true, "Skill is required"],
    },
    project: {
        type: Array,
        default: [],
    },
    experience: {
        type: Array,
        default: [],
    },
    interest: {
        type: Array,
        default: [],
    },
});

const resume = mongoose.model("resume", resumeModel);

module.exports = resume;
