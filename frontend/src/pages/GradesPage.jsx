import { useEffect, useMemo, useState } from "react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import PageTitle from "../components/common/PageTitle";
import Table from "../components/ui/Table";
import Toast from "../components/ui/Toast";
import {
  getManagedClasses,
  getStudentsByClass,
  getCourses,
  saveScore,
  getScoresByStudent,
} from "../services/scoreService";

export default function GradesPage() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [score, setScore] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [studentScores, setStudentScores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [savingScore, setSavingScore] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [classList, courseList] = await Promise.all([
          getManagedClasses(),
          getCourses(),
        ]);
        setClasses(classList);
        setCourses(courseList);
      } catch (err) {
        setToast({
          message: err.message || "Failed to load grade entry data",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const resetStudentState = () => {
    setSelectedStudent("");
    setSelectedCourse("");
    setScore("");
    setPassword("");
    setPasswordVerified(false);
    setStudentScores([]);
  };

  const handleClassChange = async (event) => {
    const nextClass = event.target.value;
    setSelectedClass(nextClass);
    setStudents([]);
    resetStudentState();

    if (!nextClass) {
      return;
    }

    try {
      setStudentsLoading(true);
      const list = await getStudentsByClass(nextClass);
      setStudents(list);
    } catch (err) {
      setToast({
        message: err.message || "Failed to load students",
        type: "error",
      });
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleStudentChange = (event) => {
    const nextStudent = event.target.value;
    setSelectedStudent(nextStudent);
    setSelectedCourse("");
    setScore("");
    setPassword("");
    setPasswordVerified(false);
    setStudentScores([]);
  };

  const selectedScoreRow = useMemo(
    () => studentScores.find((item) => item.MAHP === selectedCourse),
    [studentScores, selectedCourse],
  );

  useEffect(() => {
    if (!passwordVerified) {
      return;
    }

    if (!selectedCourse) {
      setScore("");
      return;
    }

    if (
      selectedScoreRow &&
      selectedScoreRow.DIEM !== null &&
      selectedScoreRow.DIEM !== undefined
    ) {
      setScore(String(selectedScoreRow.DIEM));
      return;
    }

    setScore("");
  }, [passwordVerified, selectedCourse, selectedScoreRow]);

  const loadStudentScores = async (employeePassword) => {
    const scores = await getScoresByStudent({
      MASV: selectedStudent,
      MK_NV: employeePassword,
    });
    setStudentScores(scores);
    return scores;
  };

  const handleVerifyPassword = async () => {
    if (!selectedStudent) {
      setToast({ message: "Vui long chon sinh vien.", type: "error" });
      return;
    }

    if (!password) {
      setToast({ message: "Vui long nhap mat khau.", type: "error" });
      return;
    }

    try {
      setVerifyingPassword(true);
      await loadStudentScores(password);
      setPasswordVerified(true);
      setToast({ message: "Xac thuc thanh cong.", type: "success" });
    } catch (err) {
      setPasswordVerified(false);
      setStudentScores([]);
      setToast({
        message: err.message || "Xac thuc that bai",
        type: "error",
      });
    } finally {
      setVerifyingPassword(false);
    }
  };

  const handleSelectScoreRow = (row) => {
    setSelectedCourse(row.MAHP);
    setScore(
      row.DIEM === null || row.DIEM === undefined ? "" : String(row.DIEM),
    );
  };

  const validate = () => {
    if (!selectedClass) {
      return "Please select a class.";
    }

    if (!selectedStudent) {
      return "Please select a student.";
    }

    if (!passwordVerified) {
      return "Please verify the employee password first.";
    }

    if (!selectedCourse) {
      return "Please select a course.";
    }

    if (score === "") {
      return "Please enter a score.";
    }

    const parsedScore = Number(score);
    if (!Number.isFinite(parsedScore) || parsedScore < 0 || parsedScore > 10) {
      return "Score must be between 0 and 10.";
    }

    return "";
  };

  const handleSave = async () => {
    const validationMessage = validate();
    if (validationMessage) {
      setToast({ message: validationMessage, type: "error" });
      return;
    }

    try {
      setSavingScore(true);
      const parsedScore = Number(score);
      const response = await saveScore({
        MASV: selectedStudent,
        MAHP: selectedCourse,
        DIEM: parsedScore,
      });

      if (passwordVerified && password) {
        await loadStudentScores(password);
      }

      setToast({
        message: response.message || "Luu diem thanh cong",
        type: "success",
      });
    } catch (err) {
      setToast({
        message: err.message || "Failed to save score",
        type: "error",
      });
    } finally {
      setSavingScore(false);
    }
  };

  const scoreColumns = [
    { key: "MAHP", label: "Course" },
    { key: "TENHP", label: "Course name" },
    { key: "SOTC", label: "Credits" },
    {
      key: "DIEM",
      label: "Score",
      render: (row) =>
        row.DIEM === null || row.DIEM === undefined ? "-" : row.DIEM,
    },
    {
      key: "status",
      label: "Status",
      render: (row) =>
        row.DIEM === null || row.DIEM === undefined ? (
          <Badge variant="pending">Pending</Badge>
        ) : (
          <Badge variant="success">Saved</Badge>
        ),
    },
  ];

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!classes.length) {
    return (
      <div className="panel-stack">
        <PageTitle
          eyebrow="Grades"
          title="Grade Entry"
          subtitle="Enter encrypted scores by class."
        />
        <Card title="Enter encrypted score">
          <p>You haven't been assigned to be the class monitor yet.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="panel-stack">
      <PageTitle eyebrow="Grades" title="Grade Entry" />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Card
        title="ENTER SCORE"
        subtitle="Select class, student, and authenticate before editing scores."
      >
        <div className="form-grid-2">
          <label className="form-field">
            <span>Class</span>
            <select
              className="input focus-ring"
              value={selectedClass}
              onChange={handleClassChange}
            >
              <option value="">Select class</option>
              {classes.map((item) => (
                <option key={item.MALOP} value={item.MALOP}>
                  {item.TENLOP}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Student</span>
            <select
              className="input focus-ring"
              value={selectedStudent}
              onChange={handleStudentChange}
              disabled={!selectedClass || studentsLoading}
            >
              <option value="">Select student</option>
              {students.map((item) => (
                <option key={item.MASV} value={item.MASV}>
                  {item.MASV} - {item.HOTEN}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedStudent ? (
          <div style={{ marginTop: "1rem", display: "grid", gap: "0.75rem" }}>
            <p style={{ margin: 0, color: "var(--success, #002366)" }}>
              After selecting the students, enter the employee password to
              download the list of courses and current grades.
            </p>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "flex-end",
              }}
            >
              <Input
                label="Employee password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                style={{ height: "3rem" }}
              />
              <Button
                className="btn--verify"
                onClick={handleVerifyPassword}
                disabled={verifyingPassword}
              >
                {verifyingPassword ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </div>
        ) : null}

        {passwordVerified ? (
          <div className="form-grid-2" style={{ marginTop: "1rem" }}>
            <label className="form-field">
              <span>Course</span>
              <select
                className="input focus-ring"
                value={selectedCourse}
                onChange={(event) => setSelectedCourse(event.target.value)}
              >
                <option value="">Select course</option>
                {courses.map((item) => (
                  <option key={item.MAHP} value={item.MAHP}>
                    {item.MAHP} - {item.TENHP}
                  </option>
                ))}
              </select>
            </label>

            <Input
              label="Score"
              type="number"
              min={0}
              max={10}
              step="0.1"
              value={score}
              onChange={(event) => setScore(event.target.value)}
              placeholder="0 - 10"
            />
          </div>
        ) : null}

        {passwordVerified ? (
          <div style={{ marginTop: "1rem" }}>
            <p
              style={{
                margin: "0 0 0.75rem",
                color: "var(--on-surface-variant)",
              }}
            >
              Click on a box to download MAHP and enter it into the form.
            </p>
            <Table
              columns={scoreColumns}
              rows={studentScores}
              rowKey="MAHP"
              emptyMessage="Chua co hoc phan nao cho sinh vien nay"
              onRowClick={handleSelectScoreRow}
            />
          </div>
        ) : null}

        {passwordVerified ? (
          <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
            <Button
              onClick={handleSave}
              disabled={savingScore || !passwordVerified}
            >
              {savingScore ? "Saving..." : "Save"}
            </Button>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
