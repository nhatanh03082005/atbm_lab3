import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import PageTitle from "../components/common/PageTitle";
import SearchBar from "../components/ui/SearchBar";
import Table from "../components/ui/Table";
import Toast from "../components/ui/Toast";
import { includesSearchValue } from "../lib/helpers";
import {
  getAdminEmployees,
  updateEmployeeSalary,
} from "../services/adminService";

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [salaryValue, setSalaryValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await getAdminEmployees();
      setEmployees(data);
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Không thể tải danh sách nhân viên",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(
      (item) =>
        includesSearchValue(item.MANV, query) ||
        includesSearchValue(item.HOTEN, query) ||
        includesSearchValue(item.EMAIL, query),
    );
  }, [employees, query]);

  const openSalaryModal = (employee) => {
    setSelectedEmployee(employee);
    setSalaryValue("");
  };

  const closeSalaryModal = () => {
    setSelectedEmployee(null);
    setSalaryValue("");
  };

  const handleUpdateSalary = async () => {
    if (!selectedEmployee) {
      return;
    }

    const parsedSalary = Number(salaryValue);
    if (!Number.isFinite(parsedSalary) || parsedSalary <= 0) {
      setToast({
        type: "error",
        message: "Vui lòng nhập mức lương hợp lệ",
      });
      return;
    }

    try {
      setSaving(true);
      const response = await updateEmployeeSalary({
        MANV: selectedEmployee.MANV,
        LUONG: parsedSalary,
        PUBKEY: selectedEmployee.PUBKEY,
      });

      setToast({
        type: "success",
        message: response.message || "Cập nhật lương thành công",
      });
      closeSalaryModal();
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Không thể cập nhật lương",
      });
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "MANV", label: "Mã nhân viên" },
    { key: "HOTEN", label: "Họ tên" },
    { key: "EMAIL", label: "Email" },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <Button size="sm" onClick={() => openSalaryModal(row)}>
          Nhập lương
        </Button>
      ),
    },
  ];

  return (
    <div className="panel-stack">
      <PageTitle
        eyebrow="Admin"
        title="Danh sách nhân viên"
        actions={
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Tìm theo mã, tên, email"
            className="page-toolbar__search"
          />
        }
      />

      <Card
        title="Nhân viên"
        subtitle={
          loading ? "Đang tải dữ liệu..." : "Chọn nhân viên để nhập lương"
        }
      >
        <Table
          columns={columns}
          rows={filteredEmployees}
          rowKey="MANV"
          emptyMessage={
            loading ? "Đang tải dữ liệu..." : "Không có nhân viên nào"
          }
        />
      </Card>

      <Modal
        open={Boolean(selectedEmployee)}
        title="Nhập lương"
        subtitle={
          selectedEmployee
            ? `${selectedEmployee.HOTEN} (${selectedEmployee.MANV})`
            : undefined
        }
        onClose={closeSalaryModal}
        showCloseButton
        footer={
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Button variant="secondary" onClick={closeSalaryModal}>
              Hủy
            </Button>
            <Button
              className="btn--primary"
              onClick={handleUpdateSalary}
              disabled={saving || !salaryValue}
            >
              {saving ? "Đang cập nhật..." : "Cập nhật lương"}
            </Button>
          </div>
        }
      >
        <div style={{ display: "grid", gap: "1rem" }}>
          <Input
            label="Lương mới (VND)"
            type="number"
            min="0"
            placeholder="Nhập mức lương"
            value={salaryValue}
            onChange={(event) => setSalaryValue(event.target.value)}
          />
        </div>
      </Modal>

      {toast ? (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}
