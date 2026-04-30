import { cx } from "../../lib/helpers";
import EmptyState from "../common/EmptyState";

export default function Table({
  columns,
  rows,
  rowKey = "id",
  emptyMessage = "No records found",
  className,
  onRowClick,
}) {
  if (!rows.length) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <div className={cx("table-shell", className)}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const resolvedKey = row?.[rowKey] ?? row?.id ?? index;

            return (
              <tr
                key={resolvedKey}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={onRowClick ? { cursor: "pointer" } : undefined}
              >
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
