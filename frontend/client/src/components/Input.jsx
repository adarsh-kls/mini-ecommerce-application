function Input({
  label,
  type,
  name,
  placeholder,
  value,
  onChange,
}) {
  return (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="
          w-full
          px-4
          py-3
          rounded-lg
          border
          border-gray-300
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      />
    </div>
  );
}

export default Input;