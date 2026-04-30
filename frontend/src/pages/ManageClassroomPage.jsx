import { useMemo, useState, useEffect } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import DeleteConfirmModal from "../components/modals/DeleteConfirmModal";
import PageTitle from "../components/common/PageTitle";
import SearchBar from "../components/ui/SearchBar";
import Table from "../components/ui/Table";
import {
  getAllClasses,
  createClass,
  updateClass,
  deleteClass,
} from "../services/classesService";
import { includesSearchValue } from "../lib/helpers";

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

export default function ManageClassroomPage() {
  const loggedInManv = getLoggedInEmployeeId();
  const [classesData, setClassesData] = useState([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    MALOP: "",
    TENLOP: "",
    MANV: "",
  });

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await getAllClasses();
      const normalizedRows = data.map((item) => ({
        ...item,
        TENNV: item.TENNV || item.HOTEN || item.TENGV || "",
      }));
      setClassesData(normalizedRows);
    } catch (err) {
      setToast({
        message: err.message || "Failed to load classes",
        type: "error",
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(
    () =>
      classesData.filter(
        (item) =>
          includesSearchValue(item.TENLOP, query) ||
          includesSearchValue(item.MANV, query) ||
          includesSearchValue(item.TENNV, query) ||
          includesSearchValue(item.MALOP, query),
      ),
    [query, classesData],
  );

  const handleOpenModal = (classItem = null) => {
    if (classItem) {
      setIsEditing(true);
      setFormData({
        MALOP: classItem.MALOP,
        TENLOP: classItem.TENLOP,
        MANV: loggedInManv || classItem.MANV || "",
      });
    } else {
      setIsEditing(false);
      setFormData({
        MALOP: "",
        TENLOP: "",
        MANV: loggedInManv || "",
      });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    const actionManv = loggedInManv;

    if (!formData.MALOP || !formData.TENLOP || !actionManv) {
      setToast({
        message: "Please fill in all required fields",
        type: "error",
      });
      return;
    }

    try {
      if (isEditing) {
        await updateClass(formData.MALOP, {
          TENLOP: formData.TENLOP,
          MANV: actionManv,
        });

        setToast({
          message: "Class updated successfully",
          type: "success",
        });
      } else {
        await createClass({
          MALOP: formData.MALOP,
          TENLOP: formData.TENLOP,
          MANV: formData.MANV,
        });

        setToast({
          message: "Class created successfully",
          type: "success",
        });
      }

      setOpen(false);
      await loadClasses();
    } catch (err) {
      setToast({
        message: err.message || "Failed to save class",
        type: "error",
      });
    }
  };

  const requestDelete = (MALOP) => {
    setDeleteTarget(MALOP);
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeleting(true);
      await deleteClass(deleteTarget, loggedInManv);

      setToast({
        message: "Class deleted successfully",
        type: "success",
      });

      setDeleteTarget("");
      await loadClasses();
    } catch (err) {
      setToast({
        message: err.message || "Failed to delete class",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };
  const columns = [
    {
      key: "MALOP",
      label: "Class ID",
      render: (row) => <span className="badge badge--id">{row.MALOP}</span>,
    },
    { key: "TENLOP", label: "Class Name" },
    {
      key: "MANV",
      label: "Teacher ID",
      render: (row) => <span className="badge badge--id">{row.MANV}</span>,
    },
    { key: "TENNV", label: "Teacher Name" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="class-actions-compact">
          <button
            type="button"
            className="class-actions-hover__btn"
            onClick={() => handleOpenModal(row)}
            aria-label={`Edit class ${row.MALOP}`}
            title="Edit"
          >
            <span className="material-symbols-outlined">edit</span>
          </button>
          <button
            type="button"
            className="class-actions-hover__btn class-actions-hover__btn--danger"
            onClick={() => requestDelete(row.MALOP)}
            aria-label={`Delete class ${row.MALOP}`}
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
    <div className="panel-stack">
      <PageTitle
        eyebrow="Classes"
        title="Manage Classrooms"
        actions={
          <>
            <Button onClick={() => handleOpenModal()}>
              <span className="material-symbols-outlined" aria-hidden="true">
                add
              </span>
              Add Class
            </Button>
          </>
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
        title="CLASS LIST"
        subtitle="A list of classes and their homeroom teachers."
        actions={
          <SearchBar
            className="page-toolbar__search"
            value={query}
            onChange={setQuery}
            placeholder="Search classrooms..."
          />
        }
      >
        <Table
          className="table--classrooms"
          columns={columns}
          rows={filteredRows}
          rowKey="MALOP"
        />
      </Card>

      <Modal
        open={open}
        ariaLabel={isEditing ? `Edit class ${formData.MALOP}` : "Add classroom"}
        title={isEditing ? `Edit class ${formData.MALOP}` : "Add classroom"}
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
            label="Class ID"
            placeholder="Enter class id"
            value={formData.MALOP}
            disabled={isEditing}
            onChange={(e) =>
              setFormData({ ...formData, MALOP: e.target.value })
            }
          />

          <Input
            label="Class Name"
            placeholder="Enter class name"
            value={formData.TENLOP}
            onChange={(e) =>
              setFormData({ ...formData, TENLOP: e.target.value })
            }
          />
        </div>
      </Modal>

      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        entityName="class"
        itemId={deleteTarget}
        onCancel={() => setDeleteTarget("")}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
}
