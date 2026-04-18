exports.calculateGrade = (percentage) => {
  if (percentage >= 90) return { grade: "O", gradePoints: 10, description: "Outstanding" };
  if (percentage >= 80) return { grade: "A+", gradePoints: 9, description: "Excellent" };
  if (percentage >= 70) return { grade: "A", gradePoints: 8, description: "Very Good" };
  if (percentage >= 60) return { grade: "B+", gradePoints: 7, description: "Good" };
  if (percentage >= 50) return { grade: "B", gradePoints: 6, description: "Average" };
  if (percentage >= 40) return { grade: "C", gradePoints: 5, description: "Pass" };
  return { grade: "F", gradePoints: 0, description: "Fail" };
};

exports.calculateCGPA = (results) => {
  if (!results?.length) return 0;
  const totalCredits = results.reduce((sum, r) => sum + (r.credits || 0), 0);
  const totalCreditPoints = results.reduce((sum, r) => sum + (r.creditPoints || 0), 0);
  return totalCredits > 0 ? parseFloat((totalCreditPoints / totalCredits).toFixed(2)) : 0;
};

exports.calculateSGPA = (semesterResults) => {
  return exports.calculateCGPA(semesterResults);
};
