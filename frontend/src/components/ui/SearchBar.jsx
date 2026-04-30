import { cx } from "../../lib/helpers";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className,
}) {
  return (
    <label className={cx("search-bar", className)}>
      <span className="material-symbols-outlined search-bar__icon">search</span>
      <input
        className="focus-ring"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        type="search"
      />
    </label>
  );
}
