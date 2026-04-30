import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import DeleteConfirmModal from "../components/modals/DeleteConfirmModal";
import PageTitle from "../components/common/PageTitle";
import SearchBar from "../components/ui/SearchBar";
import Table from "../components/ui/Table";
import { includesSearchValue } from "../lib/helpers";
import { getAllClasses } from "../services/classesService";
import {
  getAllStudents,
  getStudentsByClass,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../services/studentService";

function getLoggedInEmployeeId() {
  try {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) {
      return "";
    }

    const user = JSON.parse(rawUser);
    return user?.MANV || user?.manv || user?.MA_NV || "";
  } catch {
    return "";
  }
}

function toDateInputValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateVi(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function ManageStudentPage() {
  const loggedInManv = getLoggedInEmployeeId();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [studentsData, setStudentsData] = useState([]);
  const [classesData, setClassesData] = useState([]);

  const [query, setQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    MASV: "",
    HOTEN: "",
    NGAYSINH: "",
    DIACHI: "",
    MALOP: "",
    TENDN: "",
    MK: "",
  });

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const homeroomClasses = useMemo(() => {
    if (!classesData.length || !loggedInManv) {
      return [];
    }

    return classesData.filter((item) => {
      const owner = item.MANV || item.MANV_LOGIN || item.manv || "";
      return String(owner) === String(loggedInManv);
    });
  }, [classesData, loggedInManv]);

  const getDefaultClassForInsert = () => {
    const isSelectedOwned = homeroomClasses.some(
      (item) => String(item.MALOP) === String(selectedClass),
    );

    if (selectedClass !== "all" && isSelectedOwned) {
      return selectedClass;
    }

    return homeroomClasses[0]?.MALOP || "";
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);

      const classes = await getAllClasses();
      setClassesData(classes);

      setSelectedClass("all");

      const students = await getAllStudents();

      setStudentsData(normalizeStudents(students, classes));
    } catch (err) {
      setToast({
        message: err.message || "Failed to load students",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsBySelectedClass = async (classId, classesOverride) => {
    try {
      setLoading(true);

      const resolvedClassId = classId ?? selectedClass;
      const resolvedClasses = classesOverride ?? classesData;

      const students =
        resolvedClassId === "all"
          ? await getAllStudents()
          : await getStudentsByClass(resolvedClassId);

      setStudentsData(normalizeStudents(students, resolvedClasses));
    } catch (err) {
      setToast({
        message: err.message || "Failed to filter students",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const reloadStudentsOnly = async () => {
    try {
      setLoading(true);
      const students =
        selectedClass === "all"
          ? await getAllStudents()
          : await getStudentsByClass(selectedClass);

      setStudentsData(normalizeStudents(students, classesData));
    } catch (err) {
      setToast({
        message: err.message || "Failed to reload students",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const normalizeStudents = (students, classes) => {
    const classMap = new Map(
      (classes || []).map((item) => [String(item.MALOP), item.TENLOP]),
    );

    return (students || []).map((item) => {
      const malop = item.MALOP || item.malop || "";
      const tenlop =
        item.TENLOP || item.tenlop || classMap.get(String(malop)) || "";

      return {
        ...item,
        MASV: item.MASV || item.masv || item.id || "",
        HOTEN: item.HOTEN || item.hoten || item.name || "",
        NGAYSINH: item.NGAYSINH || item.ngaysinh || null,
        DIACHI: item.DIACHI || item.diachi || "",
        MALOP: malop,
        TENLOP: tenlop,
      };
    });
  };

  const filteredRows = useMemo(() => {
    const baseRows = studentsData;

    return baseRows.filter(
      (item) =>
        includesSearchValue(item.MASV, query) ||
        includesSearchValue(item.HOTEN, query) ||
        includesSearchValue(item.DIACHI, query) ||
        includesSearchValue(item.TENLOP, query),
    );
  }, [query, studentsData]);

  const handleOpenModal = (studentItem = null) => {
    if (studentItem) {
      setIsEditing(true);
      setFormData({
        MASV: studentItem.MASV,
        HOTEN: studentItem.HOTEN,
        NGAYSINH: toDateInputValue(studentItem.NGAYSINH),
        DIACHI: studentItem.DIACHI || "",
        MALOP: studentItem.MALOP || "",
        TENDN: "",
        MK: "",
      });
    } else {
      setIsEditing(false);
      setFormData({
        MASV: "",
        HOTEN: "",
        NGAYSINH: "",
        DIACHI: "",
        MALOP: getDefaultClassForInsert(),
        TENDN: "",
        MK: "",
      });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    const actionManv = loggedInManv;

    if (!actionManv) {
      setToast({
        message: "Missing logged-in employee id (MANV_LOGIN)",
        type: "error",
      });
      return;
    }

    try {
      if (isEditing) {
        if (!formData.MASV || !formData.HOTEN) {
          setToast({
            message: "Please fill in required fields: MASV, HOTEN",
            type: "error",
          });
          return;
        }

        await updateStudent(formData.MASV, {
          HOTEN: formData.HOTEN,
          NGAYSINH: formData.NGAYSINH,
          DIACHI: formData.DIACHI,
          MANV_LOGIN: actionManv,
        });

        setToast({ message: "Student updated successfully", type: "success" });
      } else {
        if (
          !formData.MASV ||
          !formData.HOTEN ||
          !formData.TENDN ||
          !formData.MK
        ) {
          setToast({
            message: "Please fill in required fields: MASV, HOTEN, TENDN, MK",
            type: "error",
          });
          return;
        }

        await createStudent({
          MASV: formData.MASV,
          HOTEN: formData.HOTEN,
          NGAYSINH: formData.NGAYSINH || null,
          DIACHI: formData.DIACHI || null,
          MALOP: formData.MALOP || null,
          TENDN: formData.TENDN,
          MK: formData.MK,
          MANV_LOGIN: actionManv,
        });

        setToast({ message: "Student created successfully", type: "success" });
      }

      setOpen(false);
      await reloadStudentsOnly();
    } catch (err) {
      setToast({
        message: err.message || "Failed to save student",
        type: "error",
      });
    }
  };

  const requestDelete = (MASV) => {
    setDeleteTarget(MASV);
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeleting(true);
      await deleteStudent(deleteTarget, loggedInManv);
      setToast({ message: "Student deleted successfully", type: "success" });
      setDeleteTarget("");
      await reloadStudentsOnly();
    } catch (err) {
      setToast({
        message: err.message || "Failed to delete student",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "MASV",
      label: "Student ID",
      render: (row) => <span className="badge badge--id">{row.MASV}</span>,
    },
    { key: "HOTEN", label: "Full Name" },
    {
      key: "NGAYSINH",
      label: "Birthday",
      render: (row) => formatDateVi(row.NGAYSINH),
    },
    { key: "DIACHI", label: "Address" },
    { key: "TENLOP", label: "Class Name" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="class-actions-compact">
          <button
            type="button"
            className="class-actions-hover__btn"
            onClick={() => handleOpenModal(row)}
            aria-label={`Edit student ${row.MASV}`}
            title="Edit"
          >
            <span className="material-symbols-outlined">edit</span>
          </button>
          <button
            type="button"
            className="class-actions-hover__btn class-actions-hover__btn--danger"
            onClick={() => requestDelete(row.MASV)}
            aria-label={`Delete student ${row.MASV}`}
            title="Delete"
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="panel-stack" style={{ gap: "0.75rem" }}>
      <PageTitle
        eyebrow="Students"
        title="Manage Students"
        actions={
          <Button onClick={() => handleOpenModal()}>
            <span className="material-symbols-outlined" aria-hidden="true">
              add
            </span>
            Add Student
          </Button>
        }
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Card
        title="STUDENT LIST"
        subtitle="Filtered by class and current search value"
        actions={
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
              width: "100%",
            }}
          >
            <label
              className="form-field"
              style={{ minWidth: 240, flex: "0 0 auto" }}
            >
              <select
                className="input focus-ring"
                value={selectedClass}
                onChange={async (e) => {
                  const nextValue = e.target.value;
                  setSelectedClass(nextValue);
                  await loadStudentsBySelectedClass(nextValue);
                }}
              >
                <option value="all">All</option>
                {classesData.map((item) => (
                  <option key={item.MALOP} value={item.MALOP}>
                    {item.TENLOP}
                  </option>
                ))}
              </select>
            </label>
            <div style={{ flex: "1 1 auto", minWidth: 0 }}>
              <SearchBar
                className="page-toolbar__search page-toolbar__search--wide"
                value={query}
                onChange={setQuery}
                placeholder="Search students..."
              />
            </div>
          </div>
        }
      >
        <Table
          className="table--students"
          columns={columns}
          rows={filteredRows}
          rowKey="MASV"
        />
      </Card>

      <Modal
        open={open}
        ariaLabel={isEditing ? `Edit student ${formData.MASV}` : "Add student"}
        title={isEditing ? `Edit student ${formData.MASV}` : "Add student"}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isEditing ? "Update" : "Save"}
            </Button>
          </>
        }
      >
        <div className="form-grid-2">
          <Input
            label="Student ID"
            placeholder="Enter student id"
            value={formData.MASV}
            disabled={isEditing}
            onChange={(e) => setFormData({ ...formData, MASV: e.target.value })}
          />

          <Input
            label="Full Name"
            placeholder="Enter full name"
            value={formData.HOTEN}
            onChange={(e) =>
              setFormData({ ...formData, HOTEN: e.target.value })
            }
          />

          <Input
            label="Birthday"
            type="date"
            value={formData.NGAYSINH}
            onChange={(e) =>
              setFormData({ ...formData, NGAYSINH: e.target.value })
            }
          />

          <Input
            label="Address"
            placeholder="Enter address"
            value={formData.DIACHI}
            onChange={(e) =>
              setFormData({ ...formData, DIACHI: e.target.value })
            }
          />
        </div>

        {!isEditing ? (
          <div style={{ marginTop: "1rem", display: "grid", gap: "1rem" }}>
            <label className="form-field">
              <span>Class Name</span>
              <select
                className="input focus-ring"
                value={formData.MALOP}
                onChange={(e) =>
                  setFormData({ ...formData, MALOP: e.target.value })
                }
              >
                <option value="">Select class</option>
                {classesData.map((item) => (
                  <option key={item.MALOP} value={item.MALOP}>
                    {item.TENLOP}
                  </option>
                ))}
              </select>
            </label>

            <div className="form-grid-2">
              <Input
                label="Username"
                placeholder="Enter username"
                value={formData.TENDN}
                autoComplete="off"
                onChange={(e) =>
                  setFormData({ ...formData, TENDN: e.target.value })
                }
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                value={formData.MK}
                autoComplete="new-password"
                onChange={(e) =>
                  setFormData({ ...formData, MK: e.target.value })
                }
              />
            </div>
          </div>
        ) : null}
      </Modal>

      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        entityName="student"
        itemId={deleteTarget}
        onCancel={() => setDeleteTarget("")}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
}
