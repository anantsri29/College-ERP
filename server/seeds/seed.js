const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/User");
const Department = require("../models/Department");
const Subject = require("../models/Subject");

dotenv.config();

const departmentsSeed = [
  { name: "Computer Science", code: "CSE", totalSeats: 120 },
  { name: "Electronics", code: "ECE", totalSeats: 120 },
  { name: "Mechanical", code: "ME", totalSeats: 120 },
];

const seed = async () => {
  try {
    await connectDB();
    let admin = await User.findOne({ email: "admin@college.edu" });
    if (!admin) {
      admin = await User.create({
        name: "System Admin",
        email: "admin@college.edu",
        password: "Admin@123",
        role: "admin",
      });
    }

    for (const d of departmentsSeed) {
      let dept = await Department.findOne({ code: d.code });
      if (!dept) dept = await Department.create({ ...d, createdBy: admin._id });

      const subAdminEmail = `subadmin.${d.code.toLowerCase()}@college.edu`;
      let subAdmin = await User.findOne({ email: subAdminEmail });
      if (!subAdmin) {
        subAdmin = await User.create({
          name: `${d.name} Sub Admin`,
          email: subAdminEmail,
          password: "Admin@123",
          role: "subadmin",
          department: dept._id,
          createdBy: admin._id,
        });
      }
      await Department.findByIdAndUpdate(dept._id, { subAdmin: subAdmin._id });

      const teacherDocs = [];
      for (let i = 1; i <= 3; i++) {
        const teacherEmail = `teacher${i}.${d.code.toLowerCase()}@college.edu`;
        let teacher = await User.findOne({ email: teacherEmail });
        if (!teacher) {
          teacher = await User.create({
            name: `${d.name} Teacher ${i}`,
            email: teacherEmail,
            password: "Teacher@123",
            role: "teacher",
            department: dept._id,
            employeeId: `${d.code}-T${i}`,
            createdBy: subAdmin._id,
          });
        }
        teacherDocs.push(teacher);
      }

      for (let i = 1; i <= 20; i++) {
        const studentEmail = `student${i}.${d.code.toLowerCase()}@college.edu`;
        const exists = await User.findOne({ email: studentEmail });
        if (!exists) {
          await User.create({
            name: `${d.name} Student ${i}`,
            email: studentEmail,
            password: "Student@123",
            role: "student",
            department: dept._id,
            semester: ((i - 1) % 8) + 1,
            rollNumber: `${d.code}${String(i).padStart(3, "0")}`,
            createdBy: subAdmin._id,
          });
        }
      }

      for (let sem = 1; sem <= 2; sem++) {
        const code = `${d.code}10${sem}`;
        let subject = await Subject.findOne({ code });
        if (!subject) {
          subject = await Subject.create({
            name: `${d.name} Core ${sem}`,
            code,
            department: dept._id,
            semester: sem,
            credits: 4,
            teacher: teacherDocs[(sem - 1) % teacherDocs.length]._id,
            createdBy: subAdmin._id,
          });
        } else if (!subject.teacher) {
          subject.teacher = teacherDocs[(sem - 1) % teacherDocs.length]._id;
          await subject.save();
        }
      }
    }

    // eslint-disable-next-line no-console
    console.log("Seed completed.");
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seed();
